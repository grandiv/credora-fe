"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import type { Agent } from "@/lib/agents";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan/90">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-xl text-[15px] text-muted">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-line/60 bg-white/[0.015] p-4 sm:p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-2xl font-semibold sm:text-[28px] ${
          accent ? "text-cyan" : "text-ink"
        }`}
      >
        {value}
      </div>
      {hint && <div className="mt-1 font-mono text-[11px] text-faint">{hint}</div>}
    </div>
  );
}

export function AgentAvatar({
  agent,
  size = 36,
}: {
  agent: Agent;
  size?: number;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-xl border border-slate-line/60 bg-gradient-to-br from-cyan/15 to-cyan/5 font-display text-sm font-semibold text-cyan"
    >
      {agent.name.slice(0, 2)}
    </div>
  );
}

/* SVG area chart — reputation/perf trend, no chart lib needed */
export function PerfChart({
  data,
  height = 160,
}: {
  data: number[];
  height?: number;
}) {
  const w = 600;
  const h = height;
  const pad = 8;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (data.length - 1);
  const pts = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (d - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="perf-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d2601a" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#d2601a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill="url(#perf-fill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="#d2601a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.circle
        cx={pts[pts.length - 1][0]}
        cy={pts[pts.length - 1][1]}
        r="3.5"
        fill="#fff1e1"
        stroke="#d2601a"
        strokeWidth="2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.4, type: "spring" }}
      />
    </svg>
  );
}

/* small inline sparkline for table rows / cards */
export function Sparkline({ data }: { data: number[] }) {
  const w = 80;
  const h = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const line = data
    .map((d, i) => `${i ? "L" : "M"}${i * step},${(1 - (d - min) / range) * h}`)
    .join(" ");
  const up = data[data.length - 1] >= data[0];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-6 w-20">
      <path
        d={line}
        fill="none"
        stroke={up ? "#d2601a" : "#e36a5a"}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
