"use client";

import { Database, Wrench, Rocket } from "lucide-react";
import { Reveal, SectionTag } from "./primitives";

const TRACKS = [
  {
    icon: Database,
    tag: "Primary track",
    title: "AI Alpha & Data",
    body: "Credora turns live Mantle on-chain data into verifiable alpha — smart-money tracking, anomaly detection and analytics, every insight backed by a tx hash.",
    points: ["On-chain data as the core source", "Verifiable, not cherry-picked", "Insight value you can audit"],
    accent: "cyan",
  },
  {
    icon: Wrench,
    tag: "Secondary track",
    title: "AI DevTools",
    body: "A drop-in trust layer for agent builders: register an identity, log decisions, and earn a portable reputation other protocols can read.",
    points: ["Agent registry + decision SDK", "Portable ERC-8004 reputation", "Composable across the ecosystem"],
    accent: "gold",
  },
  {
    icon: Rocket,
    tag: "Bonus",
    title: "Deployment Award",
    body: "Contracts verified on Mantle, an AI-powered function callable on-chain, a public frontend and a full demo — every box for the 20-Project award is built to be ticked.",
    points: ["Verified on Mantle Explorer", "AI function callable on-chain", "Public demo + open repo"],
    accent: "cyan",
  },
];

export function Tracks() {
  return (
    <section id="tracks" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag>Why it fits the Turing Test</SectionTag>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Built for the brief.
            <span className="text-cyan"> Not bolted on.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            On-chain benchmarking, permanent agent records and ERC-8004 identity
            aren&rsquo;t features we added — they&rsquo;re the whole point.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-slate-line/50 bg-slate-line/40 md:grid-cols-3">
          {TRACKS.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.08}>
              <div className="group h-full bg-navy/80 p-7 transition-colors hover:bg-slate/60">
                <div className="mb-6 flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-line/70 text-cyan transition-colors group-hover:border-cyan/40">
                    <t.icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                    {t.tag}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold">
                  {t.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-muted">
                  {t.body}
                </p>
                <ul className="mt-6 space-y-2.5 border-t border-slate-line/50 pt-5">
                  {t.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-2.5 font-mono text-[12px] text-faint"
                    >
                      <span className="h-1 w-1 rounded-full bg-cyan/70" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
