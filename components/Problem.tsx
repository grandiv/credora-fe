"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Check, X, Quote } from "lucide-react";
import { SectionTag } from "./primitives";

const ROWS = [
  ["Performance is self-reported", "Performance recorded on-chain"],
  ["Impossible to verify", "Every call has a tx hash"],
  ["Cherry-picked wins", "Full history — wins and losses"],
  ["Risk shows up too late", "Risk score attached pre-execution"],
  ["No way to compare agents", "One ranked, neutral leaderboard"],
];

export function Problem() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yBad = useTransform(scrollYProgress, [0, 1], [60, -50]);
  const yGood = useTransform(scrollYProgress, [0, 1], [120, -110]);

  return (
    <section id="problem" ref={ref} className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
          {/* left — sticky narrative */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionTag>The trust gap</SectionTag>
              <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                Every agent
                <br />
                claims alpha.
                <br />
                <span className="text-gradient-gold">
                  Almost none can prove it.
                </span>
              </h2>
              <p className="mt-6 max-w-md text-lg text-muted">
                &ldquo;My bot is up 200%.&rdquo; Based on what? A screenshot you
                can&rsquo;t audit and a track record that conveniently starts at
                the last winning trade.
              </p>

              <div className="relative mt-10 max-w-md rounded-2xl border-l-2 border-cyan/50 bg-white/[0.02] p-5">
                <Quote className="absolute -left-2 -top-2 h-5 w-5 text-cyan/40" />
                <p className="font-display text-xl font-medium leading-snug text-ink">
                  We didn&rsquo;t build one more agent. We built the{" "}
                  <span className="text-cyan">trust layer</span> every agent on
                  Mantle can plug into.
                </p>
              </div>
            </div>
          </div>

          {/* right — overlapping, parallaxed cards */}
          <div className="relative lg:col-span-7 lg:pl-8">
            {/* the old way — sits behind, tilted */}
            <motion.div
              style={{ y: yBad }}
              className="relative mx-auto w-full max-w-md sm:ml-auto sm:mr-0 sm:-rotate-[1.4deg]"
            >
              <div className="relative overflow-hidden rounded-3xl border border-slate-line/60 bg-navy-deep/50 p-7">
                <div className="ring-dotted-cyan pointer-events-none absolute inset-0 opacity-[0.04]" />
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-[#e36a5a]/30 bg-[#e36a5a]/10">
                    <X className="h-4 w-4 text-[#f08a7d]" />
                  </span>
                  <h3 className="font-display text-lg font-medium text-muted">
                    A typical AI trading bot
                  </h3>
                </div>
                <ul className="space-y-2.5">
                  {ROWS.map(([bad]) => (
                    <li
                      key={bad}
                      className="flex items-start gap-3 text-sm text-faint"
                    >
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-[#e36a5a]/70" />
                      {bad}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Credora — raised, forward, overlapping */}
            <motion.div
              style={{ y: yGood }}
              className="relative z-10 mx-auto -mt-8 w-full max-w-md sm:-ml-2 sm:mr-auto sm:-mt-16 sm:rotate-[1.4deg]"
            >
              <div className="glow-cyan relative overflow-hidden rounded-3xl border border-cyan/30 bg-gradient-to-b from-cyan/[0.07] to-navy/70 p-7 backdrop-blur-xl">
                <div className="bg-grid-fine pointer-events-none absolute inset-0 opacity-[0.06]" />
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-cyan/40 bg-cyan/10">
                    <Check className="h-4 w-4 text-cyan" />
                  </span>
                  <h3 className="font-display text-lg font-medium">
                    Cred<span className="text-cyan">ora</span>
                  </h3>
                </div>
                <ul className="space-y-2.5">
                  {ROWS.map(([, good], i) => (
                    <motion.li
                      key={good}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.08 + i * 0.07, duration: 0.5 }}
                      className="flex items-start gap-3 text-sm text-ink"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                      {good}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
