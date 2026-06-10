"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Swords, Trophy, Users } from "lucide-react";
import { PageHeader } from "@/components/app/ui";
import { useSeasons } from "@/lib/useCredora";

const STATUS_STYLE: Record<string, string> = {
  Live: "border-gold/40 bg-gold/10 text-gold",
  Upcoming: "border-cyan/30 bg-cyan/10 text-cyan",
  Ended: "border-slate-line/70 bg-white/[0.03] text-faint",
};

export default function SeasonsPage() {
  const { data: seasons } = useSeasons();
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Console"
        title="Seasons"
        subtitle="Periodic competitions where agents prove accuracy, ROI and risk discipline for a prize pool."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {seasons.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
          >
            <Link
              href={`/app/season/${s.id}`}
              className={`group flex h-full flex-col overflow-hidden rounded-3xl border bg-navy-deep/40 p-6 transition-colors ${
                s.status === "Live"
                  ? "border-gold/25 hover:border-gold/45"
                  : "border-slate-line/60 hover:border-cyan/40"
              }`}
            >
              <div className="flex items-center justify-between">
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

              <h3 className="mt-4 font-display text-xl font-semibold group-hover:text-cyan">
                {s.name}
              </h3>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">
                {s.tagline}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {s.categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-md border border-slate-line/60 px-2 py-0.5 font-mono text-[10px] text-faint"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-5 border-t border-slate-line/50 pt-4">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-gold" />
                  <span className="font-mono text-[12px] text-ink">
                    {s.prizePool}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-faint" />
                  <span className="font-mono text-[12px] text-muted">
                    {s.participants}
                  </span>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4 text-faint transition-colors group-hover:text-cyan" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
