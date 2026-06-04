"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* soft circular sprite so particles read as glowing dots, not squares */
function useDotTexture() {
  return useMemo(() => {
    const s = 64;
    const c = document.createElement("canvas");
    c.width = c.height = s;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.85)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

const CYAN = new THREE.Color("#1e847f");
const GOLD = new THREE.Color("#ecc19c");
const PALE = new THREE.Color("#cfe9ff");

function Constellation() {
  const group = useRef<THREE.Group>(null);
  const dot = useDotTexture();
  const { pointer } = useThree();
  const reduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // fibonacci sphere of agent nodes
  const { positions, colors, lineGeom } = useMemo(() => {
    const N = 240;
    const R = 2.9;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const pts: THREE.Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const jitter = 0.85 + Math.random() * 0.3;
      const x = Math.cos(theta) * radius * R * jitter;
      const z = Math.sin(theta) * radius * R * jitter;
      const yy = y * R * jitter;
      pos.set([x, yy, z], i * 3);
      pts.push(new THREE.Vector3(x, yy, z));

      const r = Math.random();
      const c = r > 0.9 ? GOLD : r > 0.62 ? CYAN : PALE;
      col.set([c.r, c.g, c.b], i * 3);
    }

    // connect near neighbours into a soft web
    const segs: number[] = [];
    const maxDist = 1.05;
    for (let i = 0; i < N; i++) {
      let links = 0;
      for (let j = i + 1; j < N && links < 3; j++) {
        if (pts[i].distanceTo(pts[j]) < maxDist) {
          segs.push(
            pts[i].x, pts[i].y, pts[i].z,
            pts[j].x, pts[j].y, pts[j].z,
          );
          links++;
        }
      }
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(segs, 3),
    );
    return { positions: pos, colors: col, lineGeom: lg };
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    const speed = reduced.current ? 0 : delta * 0.06;
    group.current.rotation.y += speed;
    // gentle parallax toward the cursor — elegant, not jumpy
    const tx = pointer.y * 0.12;
    const ty = pointer.x * 0.12;
    group.current.rotation.x += (tx - group.current.rotation.x) * 0.04;
    group.current.position.x += (ty - group.current.position.x) * 0.04;
  });

  return (
    <group ref={group}>
      {/* wireframe identity core */}
      <mesh>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial
          color={CYAN}
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
      <mesh rotation={[0.6, 0.3, 0]}>
        <icosahedronGeometry args={[1.7, 0]} />
        <meshBasicMaterial
          color={GOLD}
          wireframe
          transparent
          opacity={0.06}
        />
      </mesh>

      {/* node web */}
      <lineSegments geometry={lineGeom}>
        <lineBasicMaterial
          color={CYAN}
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* agent nodes */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.075}
          map={dot}
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function AgentField({
  density = 1,
}: {
  density?: number;
}) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 6.4], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
      frameloop="always"
    >
      <fog attach="fog" args={["#0b1120", 5.2, 10.5]} />
      <Constellation />
    </Canvas>
  );
}
