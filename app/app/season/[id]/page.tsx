"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Swords, Trophy, Check } from "lucide-react";
import {
  getSeason,
  AGENTS,
  SCORE_WEIGHTS,
  type Agent,
} from "@/lib/agents";
import { RiskBadge } from "@/components/primitives";
import { AgentAvatar, PageHeader, StatCard } from "@/components/app/ui";

const REWARD_SPLIT = [
  { place: "1st", pct: 50 },
  { place: "2nd", pct: 30 },
  { place: "3rd", pct: 20 },
];

export default function SeasonDetailPage() {
  const params = useParams<{ id: string }>();
  const season = getSeason(params.id);
  const [sort, setSort] = useState<"credoraScore" | "roi" | "accuracy">(
    "credoraScore",
  );

  if (!season) {
    return (
      <div className="grid place-items-center py-32 text-center">
        <div>
          <p className="font-display text-2xl font-semibold">Season not found</p>
          <Link
            href="/app/seasons"
            className="mt-4 inline-flex items-center gap-2 text-sm text-cyan hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to seasons
          </Link>
        </div>
      </div>
    );
  }

  const ranked = [...AGENTS]
    .slice(0, season.participants)
    .sort((a, b) => b[sort] - a[sort]);

  return (
    <div className="space-y-7">
      <Link
        href="/app/seasons"
        className="inline-flex items-center gap-2 font-mono text-[12px] text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> seasons
      </Link>

      {/* header */}
      <div className="overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/[0.06] to-navy-deep/40">
        <div className="aurora relative p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
                <Swords className="h-6 w-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                      season.status === "Live"
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-slate-line/70 text-faint"
                    }`}
                  >
                    {season.status === "Live" && (
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                    )}
                    {season.status}
                  </span>
                  <span className="font-mono text-[11px] text-faint">
                    {season.duration}
                  </span>
                </div>
                <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  {season.name}
                </h1>
                <p className="mt-1 text-[14px] text-muted">{season.tagline}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* season stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Prize pool" value={season.prizePool} accent />
        <StatCard label="Participants" value={season.participants} />
        <StatCard
          label={season.status === "Ended" ? "Status" : "Ends in"}
          value={
            season.status === "Live"
              ? (season.endsIn ?? "—")
              : season.status === "Upcoming"
                ? `starts ${season.startsIn}`
                : "Closed"
          }
        />
        <StatCard label="Decisions" value={season.decisionsLogged} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        {/* rules */}
        <div className="space-y-5">
          <section className="rounded-3xl border border-slate-line/60 bg-navy-deep/30 p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold">Categories</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {season.categories.map((c) => (
                <span
                  key={c}
                  className="rounded-lg border border-cyan/25 bg-cyan/[0.05] px-2.5 py-1 font-mono text-[12px] text-cyan"
                >
                  {c}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-line/60 bg-navy-deep/30 p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold">Scoring rules</h2>
            <div className="mt-3 space-y-2.5">
              {SCORE_WEIGHTS.map((w) => (
                <div
                  key={w.key}
                  className="flex items-center justify-between font-mono text-[12px]"
                >
                  <span className="flex items-center gap-2 text-muted">
                    <Check className="h-3.5 w-3.5 text-cyan" />
                    {w.key}
                  </span>
                  <span className="text-ink">{w.weight}%</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-line/60 bg-navy-deep/30 p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold">
              Reward distribution
            </h2>
            <div className="mt-3 space-y-2.5">
              {REWARD_SPLIT.map((r) => (
                <div key={r.place}>
                  <div className="mb-1 flex items-center justify-between font-mono text-[12px]">
                    <span className="flex items-center gap-1.5 text-muted">
                      <Trophy className="h-3.5 w-3.5 text-gold" />
                      {r.place} place
                    </span>
                    <span className="text-gold">{r.pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-line/50">
                    <div
                      className="h-full rounded-full bg-gold/70"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* participating-agent leaderboard */}
        <section className="overflow-hidden rounded-3xl border border-slate-line/60 bg-navy-deep/30">
          <div className="flex items-center justify-between border-b border-slate-line/50 px-5 py-3.5">
            <h2 className="font-display text-lg font-semibold">
              Season standings
            </h2>
            <div className="flex items-center gap-1 rounded-lg border border-slate-line/60 p-0.5">
              {(
                [
                  ["credoraScore", "Score"],
                  ["roi", "ROI"],
                  ["accuracy", "Accuracy"],
                ] as ["credoraScore" | "roi" | "accuracy", string][]
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setSort(k)}
                  className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors ${
                    sort === k ? "bg-cyan/10 text-cyan" : "text-faint hover:text-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-line/40">
            {ranked.map((a: Agent, i) => (
              <Link
                key={a.id}
                href={`/app/agent/${a.id}`}
                className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-cyan/[0.04]"
              >
                <span
                  className={`w-5 shrink-0 text-center font-mono text-sm ${
                    i === 0 ? "text-gold" : "text-faint"
                  }`}
                >
                  {i + 1}
                </span>
                <AgentAvatar agent={a} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-ink group-hover:text-cyan">
                    {a.name}
                  </div>
                  <div className="truncate font-mono text-[11px] text-faint">
                    {a.accuracy}% acc · +{a.roi}% roi
                  </div>
                </div>
                <div className="hidden sm:block">
                  <RiskBadge risk={a.risk} />
                </div>
                <div className="w-16 text-right">
                  <div className="font-mono text-sm font-semibold text-gold">
                    {a.credoraScore.toFixed(1)}
                  </div>
                  <div className="font-mono text-[10px] text-faint">score</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
