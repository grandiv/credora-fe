"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ── the morphing "agent core" ── a single living orb, mint fresnel rim ── */

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uAmp;
varying float vNoise;
varying vec3 vNormal;
varying vec3 vView;

// Ashima simplex noise 3D
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+1.0*C.xxx;
  vec3 x2=x0-i2+2.0*C.xxx;
  vec3 x3=x0-1.0+3.0*C.xxx;
  i=mod(i,289.0);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))
    +i.y+vec4(0.0,i1.y,i2.y,1.0))
    +i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=1.0/7.0;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

void main(){
  float n = snoise(normal * 1.5 + uTime * 0.18);
  n += 0.5 * snoise(normal * 3.0 + uTime * 0.12);
  vNoise = n;
  vec3 displaced = position + normal * n * uAmp;
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uAccent;
uniform vec3 uWarm;
uniform vec3 uBase;
varying float vNoise;
varying vec3 vNormal;
varying vec3 vView;

void main(){
  float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 1.9);
  vec3 col = mix(uBase, uAccent, fres);
  // a brighter teal core glow so it reads on pure black
  col += uAccent * smoothstep(0.2, 0.95, vNoise) * 0.35;
  // warm sand catches the highest noise ridges — a glint of gold
  col += uWarm * smoothstep(0.62, 1.0, vNoise) * 0.4;
  gl_FragColor = vec4(col, 0.95);
}
`;

function Core() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const core = useRef<THREE.Mesh>(null);
  const lattice = useRef<THREE.LineSegments>(null);
  const { pointer } = useThree();
  const reduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.34 },
      uAccent: { value: new THREE.Color("#e2701f") },
      uWarm: { value: new THREE.Color("#fff1e1") },
      uBase: { value: new THREE.Color("#16323a") },
    }),
    [],
  );

  const latticeGeo = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2.05, 1);
    return new THREE.WireframeGeometry(geo);
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (mat.current && !reduced.current) {
      mat.current.uniforms.uTime.value = t;
    }
    if (core.current) {
      core.current.rotation.y += delta * 0.08;
      core.current.rotation.x = Math.sin(t * 0.15) * 0.12;
      // gentle parallax
      core.current.position.x +=
        (pointer.x * 0.18 - core.current.position.x) * 0.04;
      core.current.position.y +=
        (pointer.y * 0.12 - core.current.position.y) * 0.04;
    }
    if (lattice.current) {
      lattice.current.rotation.y -= delta * 0.04;
      lattice.current.rotation.z += delta * 0.015;
    }
  });

  return (
    <group>
      {/* verification lattice — calm, faint, rotating opposite */}
      <lineSegments ref={lattice} geometry={latticeGeo}>
        <lineBasicMaterial
          color="#d2601a"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* the morphing core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[1.4, 48]} />
        <shaderMaterial
          ref={mat}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>
    </group>
  );
}

export default function ProofCore() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 5.4], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Core />
    </Canvas>
  );
}
