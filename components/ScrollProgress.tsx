"use client";

import { useEffect, useState } from "react";
import { motion, useScroll } from "motion/react";
import { Check } from "lucide-react";

const NODES = [
  { id: "top", label: "Overview" },
  { id: "problem", label: "The gap" },
  { id: "how", label: "How it works" },
  { id: "arena", label: "Arena" },
  { id: "agents", label: "Leaderboard" },
  { id: "tracks", label: "Tracks" },
  { id: "cta", label: "Verify" },
];

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sections = NODES.map((n) => document.getElementById(n.id)).filter(
      Boolean,
    ) as HTMLElement[];

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = NODES.findIndex((n) => n.id === e.target.id);
            if (idx >= 0) setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <div className="relative flex flex-col items-center gap-0">
        {/* base + filled rail */}
        <div className="absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-slate-line/60" />
        <motion.div
          className="absolute left-1/2 top-2 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-cyan to-gold"
          style={{ scaleY: scrollYProgress, height: "calc(100% - 16px)" }}
        />

        {NODES.map((n, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="group relative z-10 flex items-center py-3"
              aria-label={n.label}
            >
              {/* hover label */}
              <span className="pointer-events-none absolute right-6 whitespace-nowrap rounded-md border border-slate-line/70 bg-navy/90 px-2 py-1 font-mono text-[10px] text-muted opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                {n.label}
              </span>
              <span
                className={`grid h-3.5 w-3.5 place-items-center rounded-full border transition-all duration-300 ${
                  current
                    ? "scale-125 border-cyan bg-cyan shadow-[0_0_12px_2px_rgba(210,96,26,0.7)]"
                    : done
                      ? "border-cyan/60 bg-cyan/30"
                      : "border-slate-line/80 bg-navy"
                }`}
              >
                {done && <Check className="h-2 w-2 text-cyan" strokeWidth={3} />}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
