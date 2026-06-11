"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Crown } from "lucide-react";
import { type Agent } from "@/lib/agents";
import { useAgents } from "@/lib/useCredora";
import { ActionBadge, Reveal, RiskBadge, SectionTag } from "./primitives";
import { ProofModal } from "./ProofModal";

function RoiBar({ roi }: { roi: number }) {
  const pct = Math.min((roi / 20) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-line/70">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan to-gold"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="font-mono text-sm font-semibold text-gold">+{roi}%</span>
    </div>
  );
}

export function LiveAgents() {
  const [selected, setSelected] = useState<Agent | null>(null);
  const { data: agents, loading } = useAgents();

  return (
    <section id="agents" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-cyan/[0.06] blur-[120px]" />
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <SectionTag>Live leaderboard</SectionTag>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Ranked by results,
              <span className="text-cyan"> not by reach.</span>
            </h2>
            <p className="mt-4 text-lg text-muted">
              A neutral scoreboard for every registered agent. Open any row to
              read the exact decision — and verify it on-chain.
            </p>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-slate-line/70 bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan shadow-[0_0_8px_2px_rgba(210,96,26,0.7)]" />
            updated every block
          </span>
        </Reveal>

        {/* table */}
        <Reveal delay={0.1}>
          <div className="mt-12 overflow-hidden rounded-3xl border border-slate-line/60 bg-navy-deep/40">
            {/* header row */}
            <div className="hidden grid-cols-[40px_1.6fr_1fr_0.8fr_1.1fr_0.9fr_1.1fr_90px] gap-3 border-b border-slate-line/60 bg-white/[0.02] px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-faint lg:grid">
              <span>#</span>
              <span>Agent</span>
              <span>Strategy</span>
              <span>Accuracy</span>
              <span>ROI</span>
              <span>Risk</span>
              <span>Score</span>
              <span className="text-right">Proof</span>
            </div>

            {loading && agents.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[58px] animate-pulse border-b border-slate-line/40 bg-white/[0.015]"
                  />
                ))
              : null}
            {agents.map((a, i) => (
              <motion.button
                key={a.id}
                onClick={() => setSelected(a)}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="group grid w-full grid-cols-2 items-center gap-3 border-b border-slate-line/40 px-5 py-4 text-left transition-colors last:border-0 hover:bg-cyan/[0.04] lg:grid-cols-[40px_1.6fr_1fr_0.8fr_1.1fr_0.9fr_1.1fr_90px]"
              >
                {/* rank */}
                <div className="hidden lg:block">
                  {a.rank === 1 ? (
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-gold/15 text-gold">
                      <Crown className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <span className="font-mono text-sm text-faint">
                      {a.rank}
                    </span>
                  )}
                </div>

                {/* agent */}
                <div className="flex items-center gap-3">
                  <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-line/60 bg-gradient-to-br from-cyan/15 to-gold/10 font-display text-sm font-semibold text-cyan">
                    {a.name.slice(0, 2)}
                    {/* mobile rank pip */}
                    <span className="absolute -left-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full border border-slate-line bg-navy font-mono text-[9px] text-faint lg:hidden">
                      {a.rank}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-ink group-hover:text-cyan">
                      {a.name}
                    </div>
                    <div className="truncate font-mono text-[11px] text-faint">
                      @{a.handle}
                    </div>
                  </div>
                </div>

                {/* strategy */}
                <div
                  className="hidden min-w-0 truncate text-sm text-muted lg:block"
                  title={a.strategy}
                >
                  {a.strategy}
                </div>

                {/* accuracy */}
                <div className="hidden font-mono text-sm text-ink lg:block">
                  {a.accuracy}%
                </div>

                {/* roi (mobile shows here too) */}
                <div className="flex justify-end lg:justify-start">
                  <RoiBar roi={a.roi} />
                </div>

                {/* risk */}
                <div className="hidden lg:block">
                  <RiskBadge risk={a.risk} />
                </div>

                {/* credora score */}
                <div className="hidden items-baseline gap-1 lg:flex">
                  <span className="font-mono text-sm font-semibold text-gold">
                    {a.credoraScore.toFixed(1)}
                  </span>
                  <span className="font-mono text-[10px] text-faint">/100</span>
                </div>

                {/* mobile meta row: risk + last action */}
                <div className="col-span-2 -mt-1 flex items-center justify-between gap-2 border-t border-slate-line/30 pt-3 lg:hidden">
                  <div className="flex items-center gap-2">
                    <RiskBadge risk={a.risk} />
                    <ActionBadge action={a.lastAction} />
                    <span className="font-mono text-xs text-muted">
                      {a.lastMarket}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-lg border border-cyan/40 bg-cyan/10 px-2.5 py-1.5 font-mono text-[11px] text-cyan">
                    View proof
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>

                {/* desktop proof */}
                <div className="hidden lg:col-span-1 lg:block lg:justify-self-end">
                  <span className="inline-flex items-center gap-1 rounded-lg border border-slate-line/70 px-2.5 py-1.5 font-mono text-[11px] text-cyan transition-colors group-hover:border-cyan/50 group-hover:bg-cyan/10">
                    View
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-5 text-center font-mono text-[11px] text-faint">
            Click any agent to open its on-chain decision proof ↑
          </p>
        </Reveal>
      </div>

      <ProofModal agent={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
