"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BadgeCheck,
  Copy,
  Fingerprint,
  TrendingUp,
} from "lucide-react";
import {
  getAgent,
  agentHistory,
  agentSeries,
  type DecisionRow,
} from "@/lib/agents";
import { ActionBadge, RiskBadge } from "@/components/primitives";
import { AgentAvatar, PerfChart, StatCard } from "@/components/app/ui";
import { DecisionModal } from "@/components/app/DecisionModal";

export default function AgentPassportPage() {
  const params = useParams<{ id: string }>();
  const agent = getAgent(params.id);
  const [decision, setDecision] = useState<DecisionRow | null>(null);

  if (!agent) {
    return (
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

  const history = agentHistory(agent);
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
                <div className="mt-2 flex items-center gap-2">
                  <ActionBadge action={agent.lastAction} />
                  <span className="font-mono text-[12px] text-muted">
                    last on {agent.lastAsset}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan/25 bg-cyan/[0.05] px-5 py-3 text-center">
              <div className="font-mono text-[10px] uppercase tracking-wider text-faint">
                Reputation
              </div>
              <div className="font-mono text-3xl font-semibold text-cyan">
                {agent.reputation}
              </div>
              <div className="flex items-center justify-center gap-1 font-mono text-[11px] text-cyan">
                <TrendingUp className="h-3 w-3" />
                {trend >= 0 ? "+" : ""}
                {trend} (30d)
              </div>
            </div>
          </div>

          {/* identity strip */}
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {[
              { k: "Agent ID", v: `0x${agent.id}` },
              { k: "Wallet", v: "0x9f3a…be21" },
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Win rate" value={`${agent.winRate}%`} />
        <StatCard label="ROI" value={`+${agent.roi}%`} accent />
        <StatCard label="Decisions" value={agent.decisions} />
        <StatCard label="Risk profile" value={<RiskBadge risk={agent.risk} />} />
      </div>

      {/* perf chart */}
      <section className="rounded-3xl border border-slate-line/60 bg-navy-deep/30 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            Reputation trend
          </h2>
          <span className="font-mono text-[11px] text-faint">last 30 days</span>
        </div>
        <PerfChart data={series} />
      </section>

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
                <span className="font-mono text-[13px] text-ink">{d.asset}</span>
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
