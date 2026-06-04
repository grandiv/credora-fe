"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Counter } from "./Counter";
import { ActionBadge } from "./primitives";
import { TICKER } from "@/lib/agents";

/* the morphing proof-core — client-only, mounted after first paint */
const ProofCore = dynamic(() => import("./ProofCore"), { ssr: false });

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.05 + i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* defer the heavy WebGL scene until the browser is idle so it never
   competes with hero text for LCP */
function useDeferredMount(delay = 200) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    type IdleWin = Window & {
      requestIdleCallback?: (cb: () => void) => number;
    };
    const w = window as IdleWin;
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setReady(true));
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return ready;
}

const STATS = [
  { v: <Counter to={1438} />, k: "decisions logged" },
  { v: <Counter to={5} />, k: "agents verified" },
  { v: <Counter to={100} suffix="%" />, k: "on-chain proof" },
];

export function Hero() {
  const showCore = useDeferredMount();
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pt-28 pb-12 sm:pt-32"
    >
      {/* one quiet accent wash + vignette */}
      <div className="aurora pointer-events-none absolute inset-0 -z-20" />
      <div className="vignette pointer-events-none absolute inset-0 -z-10" />

      {/* the proof-core — sits to the right on desktop, centered behind on mobile.
          Mounted after first paint so it never competes with the H1 for LCP. */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-90">
        <div className="absolute right-0 top-0 h-full w-full lg:left-[32%] lg:w-[68%] [mask-image:radial-gradient(60%_60%_at_50%_45%,black,transparent_80%)]">
          {showCore && <ProofCore />}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="max-w-2xl">
          <motion.div
            custom={0}
            variants={reveal}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2.5 rounded-full border border-slate-line/60 bg-white/[0.02] px-3 py-1.5 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_10px_2px_rgba(210,96,26,0.6)]" />
            <span className="font-mono text-[11px] tracking-wide text-muted">
              ERC-8004 · on-chain agent benchmarking on Mantle
            </span>
          </motion.div>

          {/* LCP element — rendered immediately (no opacity fade) for fast paint */}
          <h1 className="hero-rise mt-7 font-display text-[3rem] font-semibold leading-[0.95] tracking-tight sm:text-7xl lg:text-[5.25rem]">
            <span className="text-gradient">Proof,</span>
            <br />
            not <span className="text-accent">promises.</span>
          </h1>

          <motion.p
            custom={2}
            variants={reveal}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
          >
            The verifiable reputation layer for AI agents on Mantle. Every
            decision — confidence, risk, rationale, result — written on-chain and
            impossible to fake.
          </motion.p>

          <motion.div
            custom={3}
            variants={reveal}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            <a
              href="#agents"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-[#0b0e10] transition-all hover:shadow-[0_0_34px_-6px_rgba(210,96,26,0.65)]"
            >
              Explore the leaderboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-line/70 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-white/[0.04]"
            >
              See how proof works
            </a>
          </motion.div>

          {/* three quiet stats, inline */}
          <motion.div
            custom={4}
            variants={reveal}
            initial="hidden"
            animate="show"
            className="mt-12 flex flex-wrap gap-x-10 gap-y-5"
          >
            {STATS.map((s, i) => (
              <div key={i}>
                <div className="font-mono text-2xl font-semibold text-ink sm:text-3xl">
                  {s.v}
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  {s.k}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            custom={5}
            variants={reveal}
            initial="hidden"
            animate="show"
            className="mt-10 flex items-center gap-2 text-xs text-faint"
          >
            <ShieldCheck className="h-4 w-4 shrink-0 text-cyan" />
            Every metric here is reconstructable from a Mantle tx hash.
          </motion.div>
        </div>
      </div>

      {/* one calm live ticker, thin */}
      <div className="relative mt-14 border-y border-slate-line/40 py-3">
        <div className="mask-fade-x flex overflow-hidden">
          <div className="flex animate-ticker items-center gap-7 whitespace-nowrap pr-7">
            {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 font-mono text-[13px] text-muted"
              >
                <span className="text-faint">›</span>
                <span className="text-ink">{t.agent}</span>
                <ActionBadge action={t.action} />
                <span>{t.asset}</span>
                <span className="text-cyan">{t.conf}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
