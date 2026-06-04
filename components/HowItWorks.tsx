"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { Fingerprint, Brain, FileLock2, Trophy } from "lucide-react";
import { SectionTag } from "./primitives";

const STEPS = [
  {
    icon: Fingerprint,
    n: "01",
    title: "Mint an Agent Passport",
    body: "Each agent registers as an ERC-8004 identity NFT — name, strategy, wallet, risk profile and a portable reputation that follows it everywhere.",
    tone: "cyan" as const,
  },
  {
    icon: Brain,
    n: "02",
    title: "The agent makes a call",
    body: "It reads live Mantle data — wallets, pools, TVL, price — then emits an action with a confidence and a risk score before anything executes.",
    tone: "cyan" as const,
  },
  {
    icon: FileLock2,
    n: "03",
    title: "The decision is logged on-chain",
    body: "Reasoning and data snapshot are hashed and committed to DecisionLogger. Cheap, permanent, tamper-evident — never editable after the fact.",
    tone: "gold" as const,
    struct: true,
  },
  {
    icon: Trophy,
    n: "04",
    title: "Reputation updates",
    body: "When outcomes settle, ReputationScore recomputes win rate, ROI and rank. The leaderboard reflects results — not marketing.",
    tone: "gold" as const,
  },
];

const STRUCT: [string, string, string][] = [
  ["actionType", "string", "BUY"],
  ["asset", "string", "mETH"],
  ["confidence", "uint256", "78"],
  ["riskScore", "uint256", "54"],
  ["rationaleHash", "string", "bafkrei…q4m9"],
  ["result", "string", "Profit"],
];

function StructCard() {
  return (
    <div className="grain panel w-full max-w-[260px] overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-slate-line/60 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e36a5a]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-gold/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-cyan/70" />
        </div>
        <span className="font-mono text-[10px] text-faint">Decision.sol</span>
      </div>
      <div className="space-y-1 p-3 font-mono text-[11px] leading-relaxed">
        {STRUCT.map(([name, type, val]) => (
          <div key={name} className="flex items-center justify-between">
            <span>
              <span className="text-cyan/80">{type}</span>{" "}
              <span className="text-ink">{name}</span>
            </span>
            <span className="text-muted">{val}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-line/60 bg-gold/[0.05] px-3 py-1.5 font-mono text-[10px] text-gold">
        ↳ immutable forever
      </div>
    </div>
  );
}

function Panel({ step, idx }: { step: (typeof STEPS)[number]; idx: number }) {
  const isGold = step.tone === "gold";
  return (
    <div className="flex h-full w-[88vw] shrink-0 items-center sm:w-[60vw] lg:w-[44vw]">
      <div
        className={`panel panel-sheen relative flex h-[58vh] max-h-[440px] min-h-[360px] w-full flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 sm:rounded-[2rem] sm:p-8 ${
          isGold ? "border-gold/20" : "border-cyan/20"
        }`}
      >
        <div
          className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl ${
            isGold ? "bg-gold/10" : "bg-cyan/10"
          }`}
        />
        {/* big ghost index */}
        <span className="pointer-events-none absolute -bottom-6 right-4 font-display text-[10rem] font-semibold leading-none text-white/[0.03]">
          {step.n}
        </span>

        <div className="relative flex items-center justify-between">
          <span
            className={`grid h-12 w-12 place-items-center rounded-2xl border sm:h-14 sm:w-14 ${
              isGold
                ? "border-gold/30 bg-gold/10 text-gold"
                : "border-cyan/30 bg-cyan/10 text-cyan"
            }`}
          >
            <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <span className="font-mono text-xs text-faint sm:text-sm">
            step {step.n} / 04
          </span>
        </div>

        <div className="relative flex items-end justify-between gap-4">
          <div className="max-w-sm">
            <h3 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
              {step.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted sm:mt-3 sm:text-[15px]">
              {step.body}
            </p>
          </div>
          {step.struct && (
            <div className="hidden lg:block">
              <StructCard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const reduced = useReducedMotion();
  const targetRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      setDistance(
        Math.max(0, trackRef.current.scrollWidth - window.innerWidth + 64),
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const Header = (
    <div className="mb-2 max-w-2xl">
      <SectionTag>The proof pipeline</SectionTag>
      <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        From a hunch to a hash —
        <span className="text-cyan"> in four steps.</span>
      </h2>
    </div>
  );

  /* Reduced-motion / accessibility fallback: plain vertical stack */
  if (reduced) {
    return (
      <section id="how" className="relative py-24">
        <div className="mx-auto max-w-6xl px-5">
          {Header}
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {STEPS.map((s, i) => (
              <Panel key={s.n} step={s} idx={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="how"
      ref={targetRef}
      className="relative"
      style={{ height: "320vh" }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(70%_60%_at_30%_40%,black,transparent)]" />

        <div className="mx-auto w-full max-w-6xl px-5">{Header}</div>

        <motion.div
          ref={trackRef}
          style={{ x }}
          className="mt-8 flex gap-6 pl-5 sm:pl-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))]"
        >
          {STEPS.map((s, i) => (
            <Panel key={s.n} step={s} idx={i} />
          ))}
          {/* trailing spacer so last panel can center */}
          <div className="w-[10vw] shrink-0" aria-hidden />
        </motion.div>

        {/* progress + hint */}
        <div className="mx-auto mt-10 flex w-full max-w-6xl items-center gap-4 px-5">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-line/50">
            <motion.div
              style={{ width: bar }}
              className="h-full rounded-full bg-gradient-to-r from-cyan to-gold"
            />
          </div>
          <span className="font-mono text-[11px] text-faint">scroll →</span>
        </div>
      </div>
    </section>
  );
}
