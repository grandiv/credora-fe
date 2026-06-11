"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Copy,
  Fingerprint,
  TrendingUp,
} from "lucide-react";
import { agentSeries, SCORE_WEIGHTS, type DecisionRow } from "@/lib/agents";
import { useAgent, useAgentHistory } from "@/lib/useCredora";
import { ActionBadge, RiskBadge } from "@/components/primitives";
import { AgentAvatar, PerfChart, StatCard } from "@/components/app/ui";
import { DecisionModal } from "@/components/app/DecisionModal";

export default function AgentPassportPage() {
  const params = useParams<{ id: string }>();
  const { data: agent, loading } = useAgent(params.id);
  const { data: history } = useAgentHistory(agent);
  const [decision, setDecision] = useState<DecisionRow | null>(null);

  if (!agent) {
    return loading ? (
      <div className="grid place-items-center py-32 font-mono text-sm text-faint">
        Loading agent…
      </div>
    ) : (
      <div className="grid place-items-center py-32 text-center">
        <div>
          <p className="font-display text-2xl font-semibold">Agent not found</p>
          <Link
            href="/app/agents"
            className="mt-4 inline-flex items-center gap-2 text-sm text-cyan hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to agents
          </Link>
        </div>
      </div>
    );
  }

  const series = agentSeries(agent);
  const trend = series[series.length - 1] - series[0];

  return (
    <div className="space-y-7">
      <Link
        href="/app/agents"
        className="inline-flex items-center gap-2 font-mono text-[12px] text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> agents
      </Link>

      {/* passport header */}
      <div className="overflow-hidden rounded-3xl border border-slate-line/60 bg-navy-deep/30">
        <div className="aurora relative p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <AgentAvatar agent={agent} size={56} />
                <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border border-navy bg-navy">
                  <BadgeCheck className="h-4 w-4 text-cyan" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {agent.name}
                  </h1>
                  <span className="rounded-md border border-slate-line/70 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-faint">
                    #ERC-8004
                  </span>
                </div>
                <div className="mt-1 font-mono text-[12px] text-muted">
                  @{agent.handle} · {agent.kind}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <ActionBadge action={agent.lastAction} />
                  <span className="font-mono text-[12px] text-muted">
                    last on {agent.lastMarket}
                  </span>
                  <span className="rounded-md border border-slate-line/70 px-2 py-0.5 font-mono text-[10px] text-faint">
                    {agent.platform}
                  </span>
                </div>
                {agent.badges.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {agent.badges.map((b) => (
                      <span
                        key={b}
                        className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 font-mono text-[10px] text-gold"
                      >
                        <Award className="h-3 w-3" />
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] px-5 py-3 text-center">
              <div className="font-mono text-[10px] uppercase tracking-wider text-faint">
                Credora Score
              </div>
              <div className="font-mono text-3xl font-semibold text-gold">
                {agent.credoraScore.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 font-mono text-[11px] text-gold">
                <TrendingUp className="h-3 w-3" />
                {trend >= 0 ? "+" : ""}
                {trend.toFixed(1)} (30d)
              </div>
            </div>
          </div>

          {/* identity strip */}
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {[
              { k: "Agent ID", v: `0x${agent.id}` },
              { k: "Platform", v: agent.platform },
            ].map((row) => (
              <div
                key={row.k}
                className="flex items-center justify-between rounded-xl border border-slate-line/60 bg-navy-deep/50 px-3.5 py-2.5"
              >
                <span className="flex items-center gap-2 font-mono text-[11px] text-faint">
                  <Fingerprint className="h-3.5 w-3.5 text-cyan/70" />
                  {row.k}
                </span>
                <span className="flex items-center gap-2 font-mono text-[12px] text-ink">
                  {row.v}
                  <Copy className="h-3 w-3 cursor-pointer text-faint hover:text-cyan" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Accuracy" value={`${agent.accuracy}%`} accent />
        <StatCard label="Win rate" value={`${agent.winRate}%`} />
        <StatCard label="ROI" value={`+${agent.roi}%`} />
        <StatCard label="Verified decisions" value={agent.verifiedDecisions} />
        <StatCard label="Risk profile" value={<RiskBadge risk={agent.risk} />} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* perf chart */}
        <section className="rounded-3xl border border-slate-line/60 bg-navy-deep/30 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              Credora Score trend
            </h2>
            <span className="font-mono text-[11px] text-faint">last 30 days</span>
          </div>
          <PerfChart data={series} />
        </section>

        {/* score breakdown */}
        <section className="rounded-3xl border border-slate-line/60 bg-navy-deep/30 p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold">Score breakdown</h2>
          <p className="mt-1 font-mono text-[11px] text-faint">
            weighted — reliability over raw profit
          </p>
          <div className="mt-4 space-y-3">
            {SCORE_WEIGHTS.map((w) => {
              const key = (
                {
                  Accuracy: "accuracy",
                  ROI: "roi",
                  Consistency: "consistency",
                  "Risk Management": "riskMgmt",
                  "Verified Decisions": "verification",
                } as const
              )[w.key];
              const val = agent.scoreBreakdown[key];
              return (
                <div key={w.key}>
                  <div className="mb-1 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-muted">
                      {w.key}{" "}
                      <span className="text-faint">· {w.weight}%</span>
                    </span>
                    <span className="text-ink">{val}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-line/50">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan to-gold"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${val}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* decision history */}
      <section className="overflow-hidden rounded-3xl border border-slate-line/60 bg-navy-deep/30">
        <div className="flex items-center justify-between border-b border-slate-line/50 px-5 py-3.5">
          <h2 className="font-display text-lg font-semibold">
            Decision history
          </h2>
          <span className="font-mono text-[11px] text-faint">
            {history.length} on-chain records
          </span>
        </div>

        {/* header row */}
        <div className="hidden grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.8fr_90px] gap-3 border-b border-slate-line/40 px-5 py-2.5 font-mono text-[10px] uppercase tracking-wider text-faint sm:grid">
          <span>Action</span>
          <span>Conf</span>
          <span>Risk</span>
          <span>Result</span>
          <span>When</span>
          <span className="text-right">Proof</span>
        </div>

        <div className="divide-y divide-slate-line/40">
          {history.map((d, i) => (
            <motion.button
              key={d.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.025 }}
              onClick={() => setDecision(d)}
              className="group grid w-full grid-cols-2 items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-cyan/[0.04] sm:grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.8fr_90px]"
            >
              <div className="flex items-center gap-2">
                <ActionBadge action={d.action} />
                <span className="font-mono text-[13px] text-ink">{d.market}</span>
              </div>
              <div className="hidden font-mono text-[13px] text-cyan sm:block">
                {d.confidence}%
              </div>
              <div className="hidden font-mono text-[13px] text-muted sm:block">
                {d.riskScore}
              </div>
              <div
                className={`text-right font-mono text-[13px] sm:text-left ${
                  d.result === "Loss"
                    ? "text-[#e36a5a]"
                    : d.result === "Pending"
                      ? "text-faint"
                      : "text-cyan"
                }`}
              >
                {d.result === "Pending"
                  ? "pending"
                  : `${d.pnl > 0 ? "+" : ""}${d.pnl}%`}
              </div>
              <div className="hidden font-mono text-[12px] text-faint sm:block">
                {d.ago}
              </div>
              <div className="col-span-2 mt-1 sm:col-span-1 sm:mt-0 sm:justify-self-end">
                <span className="inline-flex items-center gap-1 rounded-lg border border-slate-line/70 px-2.5 py-1 font-mono text-[11px] text-cyan transition-colors group-hover:border-cyan/50 group-hover:bg-cyan/10">
                  View
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <DecisionModal decision={decision} onClose={() => setDecision(null)} />
    </div>
  );
}
