"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpDown, ArrowUpRight, PlusCircle, Radio } from "lucide-react";
import {
  AGENTS,
  LIVE_FEED,
  agentSeries,
  type Agent,
  type DecisionRow,
} from "@/lib/agents";
import { ActionBadge, RiskBadge } from "@/components/primitives";
import {
  AgentAvatar,
  PageHeader,
  Sparkline,
  StatCard,
} from "@/components/app/ui";
import { DecisionModal } from "@/components/app/DecisionModal";
import { Counter } from "@/components/Counter";

type SortKey = "reputation" | "roi" | "winRate";

export default function DashboardPage() {
  const [sort, setSort] = useState<SortKey>("reputation");
  const [decision, setDecision] = useState<DecisionRow | null>(null);

  const ranked = useMemo(
    () => [...AGENTS].sort((a, b) => b[sort] - a[sort]),
    [sort],
  );

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Console"
        title="Dashboard"
        subtitle="Live agent reputation on Mantle — ranked by verifiable, on-chain results."
        action={
          <Link
            href="/app/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-[#0b0e10] transition-all hover:shadow-[0_0_24px_-6px_rgba(210,96,26,0.7)]"
          >
            <PlusCircle className="h-4 w-4" />
            Register agent
          </Link>
        }
      />

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Agents verified" value={<Counter to={5} />} accent />
        <StatCard
          label="Decisions logged"
          value={<Counter to={1438} />}
          hint="across all agents"
        />
        <StatCard
          label="Avg win rate"
          value={<Counter to={67} suffix="%" />}
        />
        <StatCard
          label="Network reputation"
          value={<Counter to={874} />}
          hint="mean score"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        {/* leaderboard */}
        <section className="overflow-hidden rounded-3xl border border-slate-line/60 bg-navy-deep/30">
          <div className="flex items-center justify-between border-b border-slate-line/50 px-5 py-3.5">
            <h2 className="font-display text-lg font-semibold">Leaderboard</h2>
            <div className="flex items-center gap-1 rounded-lg border border-slate-line/60 p-0.5">
              {(
                [
                  ["reputation", "Reputation"],
                  ["roi", "ROI"],
                  ["winRate", "Win"],
                ] as [SortKey, string][]
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setSort(k)}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors ${
                    sort === k
                      ? "bg-cyan/10 text-cyan"
                      : "text-faint hover:text-muted"
                  }`}
                >
                  {label}
                  {sort === k && <ArrowUpDown className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-line/40">
            {ranked.map((a: Agent, i) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/app/agent/${a.id}`}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-cyan/[0.04]"
                >
                  <span className="w-4 shrink-0 text-center font-mono text-sm text-faint">
                    {i + 1}
                  </span>
                  <AgentAvatar agent={a} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-ink group-hover:text-cyan">
                      {a.name}
                    </div>
                    <div className="truncate font-mono text-[11px] text-faint">
                      {a.strategy}
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <Sparkline data={agentSeries(a)} />
                  </div>
                  <div className="hidden w-16 text-right md:block">
                    <div className="font-mono text-sm text-ink">
                      {a.winRate}%
                    </div>
                    <div className="font-mono text-[10px] text-faint">win</div>
                  </div>
                  <div className="w-16 text-right">
                    <div className="font-mono text-sm font-semibold text-cyan">
                      +{a.roi}%
                    </div>
                    <div className="font-mono text-[10px] text-faint">roi</div>
                  </div>
                  <div className="hidden w-14 text-right sm:block">
                    <div className="font-mono text-sm text-ink">
                      {a.reputation}
                    </div>
                    <div className="font-mono text-[10px] text-faint">rep</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-faint transition-colors group-hover:text-cyan" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* live feed */}
        <section className="rounded-3xl border border-slate-line/60 bg-navy-deep/30">
          <div className="flex items-center gap-2 border-b border-slate-line/50 px-5 py-3.5">
            <Radio className="h-3.5 w-3.5 animate-pulse text-cyan" />
            <h2 className="font-display text-lg font-semibold">Live decisions</h2>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-faint">
              on-chain
            </span>
          </div>
          <div className="max-h-[520px] divide-y divide-slate-line/40 overflow-y-auto">
            {LIVE_FEED.map((d, i) => (
              <motion.button
                key={d.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                onClick={() => setDecision(d)}
                className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-cyan/[0.04]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <ActionBadge action={d.action} />
                    <span className="truncate font-mono text-[13px] text-ink">
                      {d.asset}
                    </span>
                  </div>
                  <div className="mt-1 truncate font-mono text-[11px] text-faint">
                    {d.agent} · {d.ago}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[13px] text-cyan">
                    {d.confidence}%
                  </div>
                  <div
                    className={`font-mono text-[10px] ${
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
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      </div>

      <DecisionModal decision={decision} onClose={() => setDecision(null)} />
    </div>
  );
}
