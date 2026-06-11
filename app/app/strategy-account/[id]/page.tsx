"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { fetchStrategyProof } from "@/lib/contract";
import type { BeStrategyProof } from "@/lib/backend";
import { PageHeader, StatCard } from "@/components/app/ui";

export default function StrategyAccountProofPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const [data, setData] = useState<BeStrategyProof | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    fetchStrategyProof(id).then((d) => alive && setData(d ?? null));
    return () => {
      alive = false;
    };
  }, [id]);

  if (data === undefined) {
    return (
      <div className="grid place-items-center py-32 font-mono text-sm text-faint">
        Loading proof…
      </div>
    );
  }
  if (!data) {
    return (
      <div className="grid place-items-center py-32 text-center">
        <div>
          <p className="font-display text-2xl font-semibold">Account not found</p>
          <Link
            href="/app/strategy-accounts"
            className="mt-4 inline-flex items-center gap-2 text-sm text-cyan hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to strategy accounts
          </Link>
        </div>
      </div>
    );
  }

  const { account, proof } = data;
  const m = account.metrics;

  return (
    <div className="space-y-7">
      <Link
        href="/app/strategy-accounts"
        className="inline-flex items-center gap-2 font-mono text-[12px] text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> strategy accounts
      </Link>

      <PageHeader
        eyebrow={account.sourcePlatform}
        title={account.displayName}
        subtitle={`${account.accountType.replace(/_/g, " ")} · ${account.verificationLevel.replace(/_/g, " ")} · ${account.period}`}
        action={
          <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] px-5 py-3 text-center">
            <div className="font-mono text-[10px] uppercase tracking-wider text-faint">
              Credora Score
            </div>
            <div className="font-mono text-3xl font-semibold text-gold">
              {account.credoraScore.toFixed(1)}
            </div>
          </div>
        }
      />

      {/* metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="ROI" value={`+${m.roiPct}%`} accent />
        <StatCard label="Win rate" value={`${m.winRatePct}%`} />
        <StatCard label="Max drawdown" value={`${m.maxDrawdownPct}%`} />
        <StatCard label="Trades" value={m.tradeCount} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        {/* identity */}
        <section className="space-y-5">
          <div className="rounded-3xl border border-slate-line/60 bg-navy-deep/30 p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold">Account</h2>
            <div className="mt-3 space-y-2.5 font-mono text-[12px]">
              <Row label="Source" value={account.sourcePlatform} />
              <Row label="Type" value={account.sourceType} />
              <Row label="External id" value={account.externalAccountId} />
              {account.walletAddress && (
                <Row label="Wallet" value={`${account.walletAddress.slice(0, 10)}…`} icon={<Wallet className="h-3 w-3" />} />
              )}
              {account.chain && <Row label="Chain" value={account.chain} />}
              <Row label="Volume" value={`$${(m.volumeUsd / 1000).toFixed(0)}k`} />
              <Row label="Consistency" value={`${m.consistencyPct}%`} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {account.markets.map((mk) => (
                <span key={mk} className="rounded border border-slate-line/60 px-1.5 py-0.5 font-mono text-[10px] text-faint">
                  {mk}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* proof */}
        <section className="rounded-3xl border border-slate-line/60 bg-navy-deep/30 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan" />
            <h2 className="font-display text-lg font-semibold">Verification proof</h2>
          </div>
          <p className="mt-1 font-mono text-[11px] text-faint">
            status: {proof.proofStatus.replace(/_/g, " ")}
          </p>

          <div className="mt-4 divide-y divide-slate-line/40 rounded-2xl border border-slate-line/60 bg-navy-deep/40 px-4">
            <ProofRow label="Data hash" value={proof.dataHash} copy />
            <ProofRow
              label="Anchor status"
              value={proof.txHashes.length ? "anchored on Mantle" : "offchain-verified"}
            />
            {proof.txHashes.map((tx, i) => (
              <ProofRow key={tx} label={`Tx #${i + 1}`} value={`${tx.slice(0, 14)}…`} copy />
            ))}
          </div>

          {account.sourceProofUrl && (
            <a
              href={account.sourceProofUrl}
              target="_blank"
              rel="noreferrer"
              className="group mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-line/70 py-3 text-sm font-semibold text-ink transition-colors hover:bg-white/[0.04]"
            >
              View original source
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          {proof.explorerUrls[0] && (
            <a
              href={proof.explorerUrls[0]}
              target="_blank"
              rel="noreferrer"
              className="group mt-2 flex items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-[#0b0e10] transition-all hover:shadow-[0_0_24px_-2px_rgba(210,96,26,0.6)]"
            >
              Verify on Mantle Explorer
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-faint">{label}</span>
      <span className="flex items-center gap-1.5 truncate text-ink">
        {icon}
        {value}
      </span>
    </div>
  );
}

function ProofRow({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
        {label}
      </span>
      <span className="flex items-center gap-2 truncate font-mono text-[12px] text-ink">
        <span className="truncate">{value.length > 24 ? `${value.slice(0, 22)}…` : value}</span>
        {copy && <Copy className="h-3 w-3 shrink-0 cursor-pointer text-faint hover:text-cyan" />}
      </span>
    </div>
  );
}
