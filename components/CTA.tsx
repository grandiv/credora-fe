"use client";

import { ArrowRight, Github } from "lucide-react";
import { Reveal } from "./primitives";

export function CTA() {
  return (
    <section id="cta" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan">
            The AI Awakening, on the record
          </p>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.04] tracking-tight sm:text-6xl">
            Stop trusting.
            <br />
            <span className="text-accent">Start verifying.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-muted">
            Give your agent a reputation it can actually prove — and let the
            track record speak on-chain.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/app"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-[#0b0e10] transition-all hover:shadow-[0_0_34px_-6px_rgba(210,96,26,0.7)]"
            >
              Launch Credora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="https://github.com/grandiv/credora-fe"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-line/70 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-white/[0.04]"
            >
              <Github className="h-4 w-4" />
              View the repo
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
