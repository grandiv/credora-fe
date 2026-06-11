"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Database,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { importStrategyAccount } from "@/lib/contract";
import { useSources } from "@/lib/useCredora";
import { PageHeader } from "@/components/app/ui";

type Phase = "form" | "importing" | "done";

const SOURCE_ICON: Record<string, string> = {
  cex: "CEX",
  onchain_analytics: "Analytics",
  onchain: "On-chain",
  manual: "Manual",
};

export default function ImportPage() {
  const { data: sources } = useSources();
  const [phase, setPhase] = useState<Phase>("form");
  const [sourceId, setSourceId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [externalId, setExternalId] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [wallet, setWallet] = useState("");
  const [period, setPeriod] = useState("30d");
  const [roi, setRoi] = useState(14);
  const [winRate, setWinRate] = useState(62);
  const [drawdown, setDrawdown] = useState(8);
  const [trades, setTrades] = useState(90);
  const [result, setResult] = useState<{ id: string; credoraScore: number; dataHash: string } | null>(null);

  const source = sources.find((s) => s.id === (sourceId || sources[0]?.id));
  const needs = (f: string) => source?.requiredProof.includes(f) ?? false;
  const isOnchain = needs("walletAddress");
  const canSubmit = displayName.trim().length >= 2 && externalId.trim().length >= 2;

  const doImport = async () => {
    if (!source) return;
    setPhase("importing");
    try {
      const r = await importStrategyAccount({
        source: source.id,
        sourcePlatform: source.name.split(" ")[0],
        externalAccountId: externalId.trim(),
        displayName: displayName.trim(),
        accountType: isOnchain ? "imported_public_account" : "observed_strategy_account",
        verificationLevel: "public_track_record",
        markets: ["BTC/USDT", "MNT/USDT"],
        period,
        metrics: {
          roiPct: roi,
          winRatePct: winRate,
          maxDrawdownPct: drawdown,
          tradeCount: trades,
          volumeUsd: 250000,
          consistencyPct: Math.max(40, Math.min(95, winRate)),
        },
        sourceProofUrl: proofUrl || undefined,
        walletAddress: isOnchain ? wallet || undefined : undefined,
        chain: isOnchain ? "mantle-sepolia" : undefined,
      });
      setResult(r ?? null);
      setPhase("done");
    } catch {
      setPhase("form");
    }
  };

  if (phase === "done" && result) {
    return (
      <div className="mx-auto max-w-lg py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-cyan/30 bg-cyan/[0.04] p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-cyan/40 bg-cyan/10"
          >
            <BadgeCheck className="h-8 w-8 text-cyan" />
          </motion.div>
          <h2 className="mt-5 font-display text-2xl font-semibold">
            Track record imported
          </h2>
          <p className="mt-2 text-[15px] text-muted">
            <span className="text-ink">{displayName}</span> was scored on the
            Credora scale and added to the leaderboard.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-faint">
                Credora Score
              </div>
              <div className="mt-1 font-mono text-3xl font-semibold text-gold">
                {result.credoraScore.toFixed(1)}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-line/60 bg-navy-deep/50 p-4 text-left">
              <div className="font-mono text-[10px] uppercase tracking-wider text-faint">
                Data hash
              </div>
              <div className="mt-1 break-all font-mono text-[11px] text-cyan">
                {result.dataHash.slice(0, 18)}…
              </div>
              <div className="mt-1 font-mono text-[10px] text-faint">
                offchain-verified · pending anchor
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/app/strategy-account/${encodeURIComponent(result.id)}`}
              className="flex-1 rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-[#0b0e10] transition-all hover:shadow-[0_0_24px_-6px_rgba(210,96,26,0.7)]"
            >
              View proof
            </Link>
            <Link
              href="/app/strategy-accounts"
              className="flex-1 rounded-xl border border-slate-line/70 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-white/[0.04]"
            >
              All accounts
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <PageHeader
        eyebrow="Console"
        title="Import a track record"
        subtitle="Bring an existing agent, bot or smart wallet's history into Credora — it's scored on the same accuracy/ROI/risk scale as native agents."
      />

      <div className="space-y-5 rounded-3xl border border-slate-line/60 bg-navy-deep/30 p-6 sm:p-7">
        {/* source */}
        <Field label="Source">
          <div className="grid grid-cols-2 gap-2">
            {sources.map((s) => (
              <button
                key={s.id}
                onClick={() => setSourceId(s.id)}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-[13px] transition-colors ${
                  (sourceId || sources[0]?.id) === s.id
                    ? "border-cyan/50 bg-cyan/10 text-ink"
                    : "border-slate-line/60 text-muted hover:border-slate-line"
                }`}
              >
                <span className="min-w-0 truncate">{s.name}</span>
                <span className="shrink-0 rounded border border-slate-line/60 px-1.5 py-0.5 font-mono text-[9px] text-faint">
                  {SOURCE_ICON[s.sourceType] ?? s.sourceType}
                </span>
              </button>
            ))}
          </div>
          {source?.notes && (
            <p className="mt-2 font-mono text-[11px] text-faint">{source.notes}</p>
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Display name">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="AlphaMaster 30D"
              className="w-full rounded-xl border border-slate-line/70 bg-navy/60 px-4 py-3 text-ink outline-none transition-colors placeholder:text-faint focus:border-cyan/60"
            />
          </Field>
          <Field label="External account id">
            <input
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              placeholder="master-trader-001"
              className="w-full rounded-xl border border-slate-line/70 bg-navy/60 px-4 py-3 font-mono text-[13px] text-ink outline-none transition-colors placeholder:text-faint focus:border-cyan/60"
            />
          </Field>
        </div>

        {/* dynamic proof field */}
        {isOnchain ? (
          <Field label="Wallet address" hint="required for on-chain sources">
            <input
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x…"
              className="w-full rounded-xl border border-slate-line/70 bg-navy/60 px-4 py-3 font-mono text-[13px] text-ink outline-none transition-colors placeholder:text-faint focus:border-cyan/60"
            />
          </Field>
        ) : (
          <Field label="Source proof URL" hint="public leaderboard / track record">
            <input
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://www.bybit.com/copyTrading"
              className="w-full rounded-xl border border-slate-line/70 bg-navy/60 px-4 py-3 font-mono text-[13px] text-ink outline-none transition-colors placeholder:text-faint focus:border-cyan/60"
            />
          </Field>
        )}

        {/* metrics */}
        <Field label="Track record metrics">
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-line/60 bg-navy/40 p-4 sm:grid-cols-4">
            <Slider label={`ROI ${roi}%`} min={-20} max={80} value={roi} onChange={setRoi} />
            <Slider label={`Win ${winRate}%`} min={0} max={100} value={winRate} onChange={setWinRate} />
            <Slider label={`Drawdown ${drawdown}%`} min={0} max={60} value={drawdown} onChange={setDrawdown} />
            <Slider label={`Trades ${trades}`} min={1} max={500} value={trades} onChange={setTrades} />
          </div>
        </Field>

        <Field label="Period">
          <div className="flex gap-2">
            {["7d", "30d", "90d"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 rounded-xl border px-3 py-2.5 font-mono text-[13px] transition-colors ${
                  period === p
                    ? "border-cyan/50 bg-cyan/10 text-cyan"
                    : "border-slate-line/60 text-muted hover:border-slate-line"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>

        <div className="flex items-center gap-2 rounded-xl border border-cyan/20 bg-cyan/[0.04] px-3.5 py-2.5">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-cyan" />
          <span className="font-mono text-[11px] text-muted">
            Credora hashes the evidence and computes a comparable score — the
            account joins the leaderboard alongside native agents.
          </span>
        </div>

        <div className="border-t border-slate-line/50 pt-5">
          <button
            onClick={doImport}
            disabled={!canSubmit || phase === "importing"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3.5 text-sm font-semibold text-[#0b0e10] transition-all enabled:hover:shadow-[0_0_28px_-6px_rgba(210,96,26,0.7)] disabled:opacity-50"
          >
            {phase === "importing" ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Scoring &amp; hashing…
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Import &amp; score
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
          {label}
        </label>
        {hint && <span className="font-mono text-[10px] text-faint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[11px] text-muted">{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full accent-[#d2601a]"
      />
    </div>
  );
}
