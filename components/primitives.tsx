"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import type { Action, Risk } from "@/lib/agents";

/* Staggered reveal-on-scroll wrapper used across sections */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/* Small eyebrow / section label */
export function SectionTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan/90">
      <span className="h-[6px] w-[6px] rounded-full bg-cyan shadow-[0_0_12px_2px_rgba(210,96,26,0.7)]" />
      {children}
    </span>
  );
}

const ACTION_STYLES: Record<Action, string> = {
  BUY: "text-cyan border-cyan/40 bg-cyan/10",
  REBALANCE: "text-cyan border-cyan/40 bg-cyan/10",
  HOLD: "text-muted border-slate-line bg-white/5",
  SELL: "text-gold border-gold/40 bg-gold/10",
  ALERT: "text-gold border-gold/40 bg-gold/10",
};

export function ActionBadge({ action }: { action: Action }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide ${ACTION_STYLES[action]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {action}
    </span>
  );
}

const RISK_STYLES: Record<Risk, string> = {
  Low: "text-cyan border-cyan/30 bg-cyan/10",
  Medium: "text-gold border-gold/30 bg-gold/10",
  High: "text-[#f08a7d] border-[#e36a5a]/30 bg-[#e36a5a]/10",
};

export function RiskBadge({ risk }: { risk: Risk }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] tracking-wide ${RISK_STYLES[risk]}`}
    >
      {risk}
    </span>
  );
}
