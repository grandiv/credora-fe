"use client";

import { motion } from "motion/react";
import { BadgeCheck, Fingerprint } from "lucide-react";
import { AGENTS } from "@/lib/agents";

const a = AGENTS[0]; // MantaScout — the hero exemplar

/* Circular confidence gauge */
function Gauge({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[68px] w-[68px]">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="rgba(52,88,95,0.9)"
          strokeWidth="5"
        />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#1e847f"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c - (value / 100) * c }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          style={{ filter: "drop-shadow(0 0 6px rgba(210,96,26,0.7))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-base font-semibold leading-none">
          {value}
        </span>
        <span className="font-mono text-[8px] uppercase tracking-widest text-faint">
          conf
        </span>
      </div>
    </div>
  );
}

export function PassportCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 12 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-sm"
      style={{ perspective: 1200 }}
    >
      {/* glow base */}
      <div className="absolute -inset-px rounded-[26px] bg-gradient-to-b from-cyan/40 via-transparent to-gold/20 opacity-60 blur-[2px]" />

      <div className="grain panel relative overflow-hidden rounded-[26px] p-5">
        {/* scanline */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 animate-scan bg-gradient-to-b from-cyan/15 to-transparent" />

        {/* header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cyan/25 to-gold/15">
              <Fingerprint className="h-5 w-5 text-cyan" />
              <span className="absolute inset-0 animate-pulse-ring rounded-xl border border-cyan/50" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg font-semibold leading-none">
                  {a.name}
                </span>
                <BadgeCheck className="h-4 w-4 text-cyan" />
              </div>
              <span className="font-mono text-[11px] text-muted">
                @{a.handle}
              </span>
            </div>
          </div>
          <span className="rounded-md border border-slate-line/70 bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-faint">
            #ERC-8004
          </span>
        </div>

        {/* agent id strip */}
        <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-line/60 bg-navy-deep/60 px-3 py-2 font-mono text-[11px]">
          <span className="text-faint">AGENT&nbsp;ID</span>
          <span className="text-cyan">0x{a.id}…3aF9</span>
        </div>

        {/* metrics */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          {[
            { k: "Win rate", v: `${a.winRate}%`, tone: "text-ink" },
            { k: "ROI", v: `+${a.roi}%`, tone: "text-gold" },
            { k: "Reputation", v: a.reputation, tone: "text-cyan" },
          ].map((m) => (
            <div
              key={m.k}
              className="rounded-xl border border-slate-line/50 bg-white/[0.02] px-3 py-2.5"
            >
              <div className="font-mono text-[9px] uppercase tracking-wider text-faint">
                {m.k}
              </div>
              <div className={`mt-1 font-mono text-base font-semibold ${m.tone}`}>
                {m.v}
              </div>
            </div>
          ))}
        </div>

        {/* last decision + gauge */}
        <div className="flex items-center justify-between rounded-xl border border-cyan/20 bg-cyan/[0.04] p-3">
          <div className="min-w-0">
            <div className="font-mono text-[9px] uppercase tracking-wider text-faint">
              Last decision
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-md border border-cyan/40 bg-cyan/10 px-1.5 py-0.5 font-mono text-[11px] text-cyan">
                {a.lastAction}
              </span>
              <span className="font-mono text-sm text-ink">{a.lastAsset}</span>
            </div>
            <div className="mt-1.5 truncate font-mono text-[10px] text-faint">
              tx {a.txHash.slice(0, 10)}…{a.txHash.slice(-6)}
            </div>
          </div>
          <Gauge value={a.confidence} />
        </div>
      </div>

      {/* floating proof chip */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 -top-4 flex items-center gap-1.5 rounded-full border border-gold/40 bg-navy px-3 py-1.5 glow-gold"
      >
        <BadgeCheck className="h-3.5 w-3.5 text-gold" />
        <span className="font-mono text-[11px] text-gold">Verified on-chain</span>
      </motion.div>
    </motion.div>
  );
}
