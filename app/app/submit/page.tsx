"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  ExternalLink,
  FileLock2,
  LoaderCircle,
  Lock,
  Wallet,
} from "lucide-react";
import {
  MARKET_LIST,
  WINDOW_LIST,
  AGENTS,
  activeSeason,
  type Action,
  type Risk,
} from "@/lib/agents";
import { PageHeader } from "@/components/app/ui";
import { useWallet } from "@/components/app/wallet";

type Phase = "form" | "logging" | "done";
const ACTIONS: Action[] = ["BUY", "SELL", "HOLD", "ALERT"];
const RISKS: Risk[] = ["Low", "Medium", "High"];

export default function SubmitDecisionPage() {
  const { address, connect, connecting } = useWallet();
  const season = activeSeason();

  const [phase, setPhase] = useState<Phase>("form");
  const [agent, setAgent] = useState(AGENTS[0].id);
  const [market, setMarket] = useState(MARKET_LIST[0]);
  const [action, setAction] = useState<Action>("BUY");
  const [confidence, setConfidence] = useState(72);
  const [risk, setRisk] = useState<Risk>("Medium");
  const [window, setWindow] = useState(WINDOW_LIST[1]);
  const [reasoning, setReasoning] = useState("");

  const submit = () => {
    setPhase("logging");
    setTimeout(() => setPhase("done"), 1700);
  };

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
            Decision logged on Mantle
          </h2>
          <p className="mt-2 text-[15px] text-muted">
            Committed <span className="text-ink">before the outcome</span> — the
            result will be graded when the {window} window closes.
          </p>

          <div className="mt-6 space-y-2 rounded-2xl border border-slate-line/60 bg-navy-deep/50 p-4 text-left font-mono text-[12px]">
            {[
              ["Agent", AGENTS.find((a) => a.id === agent)?.name ?? "—"],
              ["Market", market],
              ["Action", action],
              ["Confidence", `${confidence}%`],
              ["Window", window],
              ["Tx hash", "0x6b2c…f014"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="uppercase tracking-wider text-faint">{k}</span>
                <span className="text-ink">{v}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-[#0b0e10] transition-all hover:shadow-[0_0_24px_-6px_rgba(210,96,26,0.7)]"
            >
              Verify on Explorer <ExternalLink className="h-4 w-4" />
            </a>
            <Link
              href="/app"
              className="flex-1 rounded-xl border border-slate-line/70 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-white/[0.04]"
            >
              Back to dashboard
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
        title="Log a decision"
        subtitle="Submit a prediction before the outcome — it's committed on-chain, then graded when the window closes."
      />

      <div className="flex items-center gap-2 rounded-2xl border border-cyan/20 bg-cyan/[0.04] px-4 py-3">
        <Lock className="h-4 w-4 shrink-0 text-cyan" />
        <span className="font-mono text-[12px] text-muted">
          Logging into{" "}
          <span className="text-cyan">{season.name}</span> · entries are
          tamper-evident once written.
        </span>
      </div>

      <div className="space-y-5 rounded-3xl border border-slate-line/60 bg-navy-deep/30 p-6 sm:p-7">
        {/* agent */}
        <Field label="Agent">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AGENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAgent(a.id)}
                className={`rounded-xl border px-3 py-2.5 text-left text-[13px] transition-colors ${
                  agent === a.id
                    ? "border-cyan/50 bg-cyan/10 text-ink"
                    : "border-slate-line/60 text-muted hover:border-slate-line"
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Market">
            <div className="flex flex-wrap gap-2">
              {MARKET_LIST.map((m) => (
                <button
                  key={m}
                  onClick={() => setMarket(m)}
                  className={`rounded-lg border px-3 py-1.5 font-mono text-[12px] transition-colors ${
                    market === m
                      ? "border-cyan/50 bg-cyan/10 text-cyan"
                      : "border-slate-line/60 text-muted hover:border-slate-line"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Direction">
            <div className="flex gap-2">
              {ACTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 font-mono text-[12px] transition-colors ${
                    action === a
                      ? "border-cyan/50 bg-cyan/10 text-cyan"
                      : "border-slate-line/60 text-muted hover:border-slate-line"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* confidence slider */}
        <Field label={`Confidence — ${confidence}%`}>
          <input
            type="range"
            min={50}
            max={99}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            aria-label="Confidence percentage"
            className="w-full accent-[#d2601a]"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Risk score">
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

          <Field label="Prediction window">
            <div className="flex gap-2">
              {WINDOW_LIST.map((w) => (
                <button
                  key={w}
                  onClick={() => setWindow(w)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 font-mono text-[13px] transition-colors ${
                    window === w
                      ? "border-cyan/50 bg-cyan/10 text-cyan"
                      : "border-slate-line/60 text-muted hover:border-slate-line"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Reasoning" hint="stored as a hash on-chain">
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            rows={3}
            aria-label="Reasoning"
            placeholder="Why this call? e.g. smart-wallet accumulation diverging from flat price action…"
            className="w-full resize-none rounded-xl border border-slate-line/70 bg-navy/60 px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-cyan/60"
          />
        </Field>

        <div className="border-t border-slate-line/50 pt-5">
          {address ? (
            <button
              onClick={submit}
              disabled={phase === "logging"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3.5 text-sm font-semibold text-[#0b0e10] transition-all enabled:hover:shadow-[0_0_28px_-6px_rgba(210,96,26,0.7)] disabled:opacity-50"
            >
              {phase === "logging" ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Writing proof to Mantle…
                </>
              ) : (
                <>
                  <FileLock2 className="h-4 w-4" />
                  Submit Proof on Mantle
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={connect}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-line/70 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-white/[0.07]"
            >
              {connecting ? (
                <LoaderCircle className="h-4 w-4 animate-spin text-cyan" />
              ) : (
                <Wallet className="h-4 w-4 text-cyan" />
              )}
              {connecting ? "Connecting…" : "Connect wallet to log"}
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
