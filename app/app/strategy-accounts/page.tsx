"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, PlusCircle, ShieldCheck, Wallet } from "lucide-react";
import { useStrategyAccounts } from "@/lib/useCredora";
import { PageHeader } from "@/components/app/ui";

const TYPE_LABEL: Record<string, string> = {
  cex: "CEX",
  onchain_analytics: "On-chain analytics",
  onchain: "On-chain",
  manual: "Manual",
};

export default function StrategyAccountsPage() {
  const { data: accounts } = useStrategyAccounts();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Console"
        title="Strategy accounts"
        subtitle="Existing trading agents, bots and smart wallets — track records imported from CEX, on-chain analytics and Mantle, then scored on the same Credora scale."
        action={
          <Link
            href="/app/import"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-[#0b0e10] transition-all hover:shadow-[0_0_24px_-6px_rgba(210,96,26,0.7)]"
          >
            <PlusCircle className="h-4 w-4" />
            Import track record
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
          >
            <Link
              href={`/app/strategy-account/${encodeURIComponent(a.id)}`}
              className="group flex h-full flex-col rounded-3xl border border-slate-line/60 bg-navy-deep/30 p-5 transition-colors hover:border-cyan/40 hover:bg-cyan/[0.03]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-display text-lg font-semibold group-hover:text-cyan">
                    {a.displayName}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-faint">
                    {a.walletAddress ? (
                      <Wallet className="h-3 w-3" />
                    ) : (
                      <ShieldCheck className="h-3 w-3" />
                    )}
                    {a.sourcePlatform}
                  </div>
                </div>
                <span className="shrink-0 rounded-md border border-slate-line/70 px-2 py-0.5 font-mono text-[10px] text-muted">
                  {TYPE_LABEL[a.sourceType] ?? a.sourceType}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {a.markets.slice(0, 3).map((m) => (
                  <span
                    key={m}
                    className="rounded border border-slate-line/60 px-1.5 py-0.5 font-mono text-[10px] text-faint"
                  >
                    {m}
                  </span>
                ))}
                <span className="rounded border border-slate-line/60 px-1.5 py-0.5 font-mono text-[10px] text-faint">
                  {a.period}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-line/50 pt-4">
                <Metric label="roi" value={`+${a.metrics.roiPct}%`} accent />
                <Metric label="win" value={`${a.metrics.winRatePct}%`} />
                <Metric label="dd" value={`${a.metrics.maxDrawdownPct}%`} />
                <Metric
                  label="score"
                  value={a.credoraScore.toFixed(1)}
                  gold
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-faint">
                  <ShieldCheck className="h-3 w-3 text-cyan/70" />
                  {a.verificationLevel.replace(/_/g, " ")}
                </span>
                <ArrowUpRight className="h-4 w-4 text-faint transition-colors group-hover:text-cyan" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
  gold,
}: {
  label: string;
  value: string;
  accent?: boolean;
  gold?: boolean;
}) {
  return (
    <div>
      <div
        className={`font-mono text-sm font-semibold ${gold ? "text-gold" : accent ? "text-cyan" : "text-ink"}`}
      >
        {value}
      </div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-faint">
        {label}
      </div>
    </div>
  );
}
