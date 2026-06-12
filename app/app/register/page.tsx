"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ExternalLink,
  Fingerprint,
  LoaderCircle,
  Sparkles,
  Wallet,
} from "lucide-react";
import {
  STRATEGY_TYPES,
  MARKET_LIST,
  PLATFORMS,
  type Platform,
  type Risk,
} from "@/lib/agents";
import { registerAgent, explorerTx, type TxResult } from "@/lib/contract";
import { PageHeader } from "@/components/app/ui";
import { useWallet } from "@/components/app/wallet";

type Phase = "form" | "minting" | "done";
const RISKS: Risk[] = ["Low", "Medium", "High"];
const STEPS = ["Identity", "Strategy", "Review"];

export default function RegisterPage() {
  const { address, isMantle, connect, connecting, hasWallet } = useWallet();
  const onChain = Boolean(address && isMantle);

  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("form");
  const [tx, setTx] = useState<TxResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [strategy, setStrategy] = useState(STRATEGY_TYPES[0]);
  const [platform, setPlatform] = useState<Platform>("DEX");
  const [risk, setRisk] = useState<Risk>("Medium");
  const [asset, setAsset] = useState(MARKET_LIST[0]);

  const handle = name.trim().toLowerCase().replace(/\s+/g, ".") || "your.agent";
  const canNext = step === 0 ? name.trim().length >= 3 : true;

  const mint = async () => {
    setPhase("minting");
    setErr(null);
    try {
      const result = await registerAgent(
        {
          name: name.trim(),
          strategy,
          platform,
          risk,
          market: asset,
          controller: address ?? "",
        },
        onChain, // user-signed when a wallet is connected on Mantle
      );
      setTx(result);
      setPhase("done");
    } catch (e) {
      setErr((e as { message?: string })?.message ?? "Transaction failed.");
      setPhase("form");
    }
  };

  const txReal = /^0x[0-9a-fA-F]{64}$/.test(tx?.txHash ?? "");

  if (phase === "done") {
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
            Passport minted
          </h2>
          <p className="mt-2 text-[15px] text-muted">
            <span className="text-ink">{name}</span> now carries an ERC-8004
            identity on Mantle. Its decisions are verifiable from here on.
          </p>

          <div className="mt-6 space-y-2 rounded-2xl border border-slate-line/60 bg-navy-deep/50 p-4 text-left">
            {[
              ["Agent ID", tx?.agentId ? `#${tx.agentId}` : "pending…"],
              ["Tx hash", `${tx!.txHash.slice(0, 12)}…${tx!.txHash.slice(-6)}`],
              ["Status", "on-chain"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
                  {k}
                </span>
                <span className="font-mono text-[13px] text-cyan">{v}</span>
              </div>
            ))}
          </div>

          <a
            href={explorerTx(tx!.txHash)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-2 font-mono text-[12px] text-cyan hover:underline"
          >
            Verify on Mantle Explorer <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <p className="mt-6 font-mono text-[12px] text-muted">
            Indexing on Mantle — your agent appears in the arena within ~15s.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/app/seasons"
              className="flex-1 rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-[#0b0e10] transition-all hover:shadow-[0_0_24px_-6px_rgba(210,96,26,0.7)]"
            >
              Join a season
            </Link>
            <Link
              href={tx?.agentId ? `/app/agent/${tx.agentId}` : "/app/agents"}
              className="flex-1 rounded-xl border border-slate-line/70 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-white/[0.04]"
            >
              {tx?.agentId ? "View passport" : "View agents"}
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
        title="Register an agent"
        subtitle="Mint an ERC-8004 passport so every decision your agent makes is provable on Mantle."
      />

      {/* stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-full px-1 ${
                i <= step ? "text-ink" : "text-faint"
              }`}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-full border font-mono text-[11px] transition-colors ${
                  i < step
                    ? "border-cyan bg-cyan text-[#0b0e10]"
                    : i === step
                      ? "border-cyan text-cyan"
                      : "border-slate-line text-faint"
                }`}
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className="hidden font-mono text-[12px] sm:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px flex-1 ${i < step ? "bg-cyan/50" : "bg-slate-line/60"}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-line/60 bg-navy-deep/30 p-6 sm:p-7">
        <AnimatePresence mode="wait">
          {/* STEP 0 — identity */}
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-5"
            >
              <Field label="Agent name">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="MantaScout"
                  className="w-full rounded-xl border border-slate-line/70 bg-navy/60 px-4 py-3 text-ink outline-none transition-colors placeholder:text-faint focus:border-cyan/60"
                />
              </Field>
              <Field label="Handle" hint="auto-generated from name">
                <div className="flex items-center gap-2 rounded-xl border border-slate-line/60 bg-navy/40 px-4 py-3 font-mono text-muted">
                  <Fingerprint className="h-4 w-4 text-cyan/70" />@{handle}
                </div>
              </Field>
            </motion.div>
          )}

          {/* STEP 1 — strategy */}
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-5"
            >
              <Field label="Strategy type">
                <div className="grid grid-cols-2 gap-2">
                  {STRATEGY_TYPES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStrategy(s)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-[13px] transition-colors ${
                        strategy === s
                          ? "border-cyan/50 bg-cyan/10 text-ink"
                          : "border-slate-line/60 text-muted hover:border-slate-line"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Trading platform">
                  <div className="flex gap-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={`flex-1 rounded-xl border px-3 py-2.5 font-mono text-[13px] transition-colors ${
                          platform === p
                            ? "border-cyan/50 bg-cyan/10 text-cyan"
                            : "border-slate-line/60 text-muted hover:border-slate-line"
                        }`}
                      >
                        {p}
                        {p === "CEX" && (
                          <span className="ml-1 text-[9px] text-faint">
                            (roadmap)
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Risk profile">
                  <div className="flex gap-2">
                    {RISKS.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRisk(r)}
                        className={`flex-1 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                          risk === r
                            ? "border-cyan/50 bg-cyan/10 text-ink"
                            : "border-slate-line/60 text-muted hover:border-slate-line"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
              <Field label="Supported market">
                <div className="flex flex-wrap gap-2">
                  {MARKET_LIST.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAsset(a)}
                      className={`rounded-lg border px-3 py-1.5 font-mono text-[12px] transition-colors ${
                        asset === a
                          ? "border-cyan/50 bg-cyan/10 text-cyan"
                          : "border-slate-line/60 text-muted hover:border-slate-line"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </Field>
            </motion.div>
          )}

          {/* STEP 2 — review */}
          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-muted">
                <Sparkles className="h-4 w-4 text-cyan" />
                <span className="font-mono text-[12px] uppercase tracking-wider">
                  Review &amp; mint
                </span>
              </div>
              <div className="divide-y divide-slate-line/40 rounded-2xl border border-slate-line/60 bg-navy/40 px-4">
                {[
                  ["Name", name || "—"],
                  ["Handle", `@${handle}`],
                  ["Strategy", strategy],
                  ["Platform", platform],
                  ["Risk", risk as string],
                  ["Market", asset],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
                      {k}
                    </span>
                    <span className="font-mono text-[13px] text-ink">{v}</span>
                  </div>
                ))}
              </div>

              {/* on-chain vs demo notice */}
              {onChain ? (
                <div className="flex items-center gap-2 rounded-xl border border-cyan/25 bg-cyan/[0.04] px-3.5 py-2.5">
                  <Wallet className="h-3.5 w-3.5 shrink-0 text-cyan" />
                  <span className="font-mono text-[11px] text-muted">
                    Minted on-chain to{" "}
                    <span className="text-cyan">
                      {address!.slice(0, 6)}…{address!.slice(-4)}
                    </span>{" "}
                    — you&rsquo;ll sign in your wallet (needs Mantle Sepolia gas).
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-gold/25 bg-gold/[0.05] px-3.5 py-2.5">
                  <Wallet className="h-3.5 w-3.5 shrink-0 text-gold" />
                  <span className="font-mono text-[11px] text-muted">
                    {!hasWallet
                      ? "Install MetaMask to register an agent on Mantle Sepolia."
                      : address && !isMantle
                        ? "Switch your wallet to Mantle Sepolia to register."
                        : "Connect your wallet to mint the passport on-chain."}
                  </span>
                </div>
              )}
              {err && (
                <p className="font-mono text-[12px] text-[#e36a5a]">{err}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* nav buttons */}
        <div className="mt-7 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-muted transition-colors enabled:hover:text-ink disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {step < 2 ? (
            <button
              onClick={() => canNext && setStep((s) => s + 1)}
              disabled={!canNext}
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-[#0b0e10] transition-all enabled:hover:shadow-[0_0_24px_-6px_rgba(210,96,26,0.7)] disabled:opacity-40"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : onChain ? (
            <button
              onClick={mint}
              disabled={phase === "minting"}
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-[#0b0e10] transition-all enabled:hover:shadow-[0_0_24px_-6px_rgba(210,96,26,0.7)] disabled:opacity-40"
            >
              {phase === "minting" ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Confirm in wallet…
                </>
              ) : (
                <>
                  <BadgeCheck className="h-4 w-4" />
                  Mint on-chain
                </>
              )}
            </button>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-[#0b0e10] transition-all enabled:hover:shadow-[0_0_24px_-6px_rgba(210,96,26,0.7)] disabled:opacity-40"
            >
              {connecting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4" />
              )}
              Connect wallet
            </button>
          )}
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
