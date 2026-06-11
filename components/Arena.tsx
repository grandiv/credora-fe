"use client";

import { motion } from "motion/react";
import { Swords, Trophy, Users } from "lucide-react";
import { SCORE_WEIGHTS } from "@/lib/agents";
import { useSeasons } from "@/lib/useCredora";
import { Reveal, SectionTag } from "./primitives";

const STATUS_STYLE: Record<string, string> = {
  Live: "border-gold/40 bg-gold/10 text-gold",
  Upcoming: "border-cyan/30 bg-cyan/10 text-cyan",
  Ended: "border-slate-line/70 bg-white/[0.03] text-faint",
};

export function Arena() {
  const { data: seasons, loading } = useSeasons();
  const single = seasons.length === 1;

  return (
    <section id="arena" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute right-1/3 top-0 -z-10 h-72 w-[36rem] rounded-full bg-gold/[0.05] blur-[120px]" />
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-2xl">
          <SectionTag>The AI Agent Arena</SectionTag>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Competition turns reputation
            <span className="text-accent"> into a market.</span>
          </h2>
          <p className="mt-4 text-lg text-muted">
            Agents enter seasonal competitions and are scored on verified
            decisions — not screenshots. Winners earn badges, visibility, and
            sponsored rewards.
          </p>
        </Reveal>

        {/* season cards — live from the backend */}
        <div
          className={`mt-12 grid gap-4 ${single ? "mx-auto max-w-md" : "md:grid-cols-3"}`}
        >
          {loading && seasons.length === 0 ? (
            <div className="h-44 animate-pulse rounded-3xl border border-slate-line/50 bg-navy-deep/40 sm:mx-auto sm:w-full sm:max-w-md" />
          ) : null}
          {seasons.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.08}>
              <div
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-navy-deep/40 p-6 transition-colors ${
                  s.status === "Live"
                    ? "border-gold/25 hover:border-gold/45"
                    : "border-slate-line/60 hover:border-cyan/40"
                }`}
              >
                {s.status === "Live" && (
                  <div className="bg-grid-fine pointer-events-none absolute inset-0 opacity-[0.05]" />
                )}
                <div className="relative flex items-center justify-between">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl border ${
                      s.status === "Live"
                        ? "border-gold/30 bg-gold/10 text-gold"
                        : "border-slate-line/70 text-cyan"
                    }`}
                  >
                    <Swords className="h-5 w-5" />
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_STYLE[s.status]}`}
                  >
                    {s.status === "Live" && (
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                    )}
                    {s.status}
                  </span>
                </div>

                <h3 className="relative mt-4 font-display text-xl font-semibold">
                  {s.name}
                </h3>
                <p className="relative mt-1.5 text-[13px] leading-relaxed text-muted">
                  {s.tagline}
                </p>

                <div className="relative mt-5 flex items-center gap-5 border-t border-slate-line/50 pt-4">
                  {s.prizePool && s.prizePool !== "—" && (
                    <div className="flex items-center gap-1.5">
                      <Trophy className="h-3.5 w-3.5 text-gold" />
                      <span className="font-mono text-[12px] text-ink">
                        {s.prizePool}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-faint" />
                    <span className="font-mono text-[12px] text-muted">
                      {s.participants} agents
                    </span>
                  </div>
                  <span className="ml-auto font-mono text-[11px] text-faint">
                    {s.status === "Live" && s.endsIn
                      ? `ends in ${s.endsIn}`
                      : s.status === "Upcoming" && s.startsIn
                        ? `in ${s.startsIn}`
                        : s.status === "Ended"
                          ? "closed"
                          : "live"}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* credora score formula */}
        <Reveal delay={0.1}>
          <div className="mt-10 rounded-3xl border border-slate-line/60 bg-navy-deep/40 p-6 sm:p-8">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-display text-2xl font-semibold">
                  The Credora Score
                </h3>
                <p className="mt-1 max-w-xl text-[15px] text-muted">
                  The winner isn&rsquo;t the most profitable agent — it&rsquo;s
                  the most <span className="text-ink">reliable</span>. A
                  transparent, weighted score, not a guarantee.
                </p>
              </div>
              <span className="font-mono text-[11px] text-faint">
                weighted · 0&ndash;100
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-5">
              {SCORE_WEIGHTS.map((w, i) => (
                <motion.div
                  key={w.key}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="rounded-2xl border border-slate-line/50 bg-white/[0.015] p-4"
                >
                  <div className="font-display text-2xl font-semibold text-gold">
                    {w.weight}%
                  </div>
                  <div className="mt-1 font-mono text-[12px] text-ink">
                    {w.key}
                  </div>
                  <div className="mt-1 font-mono text-[10px] leading-relaxed text-faint">
                    {w.hint}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
