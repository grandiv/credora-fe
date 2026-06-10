"use client";

import { useEffect, useState } from "react";
import { READ_SOURCE, WRITE_SOURCE, CONTRACTS } from "@/lib/contract";

/**
 * Honest connection indicator so you can tell, at a glance, what the app is
 * actually wired to right now:
 *   • Reads  → live Backend API (and whether it's reachable) vs mock data
 *   • Writes → on-chain Mantle contracts (addresses set) vs mock
 */
export function ConnectionStatus() {
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (READ_SOURCE !== "api") return;
    let alive = true;
    fetch("/api/credora/health", { cache: "no-store" })
      .then((r) => alive && setApiOk(r.ok))
      .catch(() => alive && setApiOk(false));
    return () => {
      alive = false;
    };
  }, []);

  const readLive = READ_SOURCE === "api" && apiOk === true;
  const readBroken = READ_SOURCE === "api" && apiOk === false;
  const hasAddrs = Boolean(CONTRACTS.agentPassport && CONTRACTS.decisionLogger);
  const writeChain = WRITE_SOURCE === "chain";

  const readDot = readLive
    ? "bg-emerald-400"
    : readBroken
      ? "bg-[#e36a5a]"
      : "bg-faint";
  const readLabel = readLive
    ? "Backend API · live"
    : readBroken
      ? "Backend API · unreachable (mock fallback)"
      : "Mock data";

  const writeDot = writeChain && hasAddrs ? "bg-emerald-400" : "bg-faint";
  const writeLabel = writeChain
    ? hasAddrs
      ? "On-chain (Mantle Sepolia)"
      : "Chain mode · no addresses set"
    : "Mock writes";

  return (
    <div className="rounded-2xl border border-slate-line/60 bg-white/[0.02] p-3.5">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_8px_2px_rgba(210,96,26,0.7)]" />
        <span className="font-mono text-[11px] text-muted">
          Mantle Sepolia · testnet
        </span>
      </div>
      <div className="mt-2 space-y-1.5">
        <Row dot={readDot} label="Reads" value={readLabel} />
        <Row dot={writeDot} label="Writes" value={writeLabel} />
      </div>
    </div>
  );
}

function Row({ dot, label, value }: { dot: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      <span className="font-mono text-[10px] text-faint">
        <span className="text-muted">{label}:</span> {value}
      </span>
    </div>
  );
}
