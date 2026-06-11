"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import {
  X,
  ExternalLink,
  Copy,
  BadgeCheck,
  CircleCheck,
  Clock,
} from "lucide-react";
import Link from "next/link";
import type { Agent } from "@/lib/agents";
import { ActionBadge, RiskBadge } from "./primitives";

function Field({
  label,
  value,
  mono = true,
  copy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-line/40 py-2.5 last:border-0">
      <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
        {label}
      </span>
      <span
        className={`flex items-center gap-2 text-right text-sm text-ink ${
          mono ? "font-mono" : ""
        }`}
      >
        <span className="truncate">{value}</span>
        {copy && (
          <Copy className="h-3.5 w-3.5 shrink-0 cursor-pointer text-faint transition-colors hover:text-cyan" />
        )}
      </span>
    </div>
  );
}

export function ProofModal({
  agent,
  onClose,
}: {
  agent: Agent | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (agent) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [agent, onClose]);

  return (
    <AnimatePresence>
      {agent && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="grain panel relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl"
          >
            {/* header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-line/60 bg-navy/80 px-5 py-4 backdrop-blur">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-cyan" />
                <span className="font-display text-lg font-semibold">
                  Decision Proof
                </span>
              </div>
              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-line/70 text-muted transition-colors hover:bg-white/5 hover:text-ink"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {/* agent line */}
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-line/60 bg-navy-deep/50 p-4">
                <div>
                  <div className="font-display text-xl font-semibold">
                    {agent.name}
                  </div>
                  <div className="font-mono text-[11px] text-muted">
                    @{agent.handle} · {agent.kind}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ActionBadge action={agent.lastAction} />
                  <span className="font-mono text-sm text-ink">
                    {agent.lastMarket}
                  </span>
                </div>
              </div>

              {/* scores */}
              <div className="mb-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-cyan/25 bg-cyan/[0.05] p-3 text-center">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-faint">
                    Confidence
                  </div>
                  <div className="mt-1 font-mono text-2xl font-semibold text-cyan">
                    {agent.confidence}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-line/60 bg-white/[0.02] p-3 text-center">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-faint">
                    Risk score
                  </div>
                  <div className="mt-1 font-mono text-2xl font-semibold text-ink">
                    {agent.riskScore}
                  </div>
                </div>
                <div className="rounded-xl border border-gold/25 bg-gold/[0.05] p-3 text-center">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-faint">
                    Result
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1 font-mono text-sm font-semibold text-gold">
                    {agent.result === "Pending" ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <CircleCheck className="h-4 w-4" />
                    )}
                    {agent.result}
                  </div>
                </div>
              </div>

              {/* rationale */}
              <div className="mb-4 rounded-2xl border border-slate-line/60 bg-navy-deep/40 p-4">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-faint">
                  Agent rationale
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  &ldquo;{agent.rationale}&rdquo;
                </p>
              </div>

              {/* on-chain fields */}
              <div className="rounded-2xl border border-slate-line/60 bg-navy-deep/40 px-4">
                <Field label="Agent ID" value={`0x${agent.id}`} />
                <Field
                  label="Rationale hash"
                  value={agent.rationaleHash}
                  copy
                />
                <Field
                  label="Data snapshot"
                  value={agent.dataSnapshotHash}
                  copy
                />
                {/^0x0+$/.test(agent.txHash) ? null : (
                  <Field
                    label="Tx hash"
                    value={`${agent.txHash.slice(0, 14)}…${agent.txHash.slice(-8)}`}
                    copy
                  />
                )}
              </div>

              {/* full on-chain proof lives on the agent passport */}
              <Link
                href={`/app/agent/${agent.id}`}
                className="group mt-4 flex items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-[#0b0e10] transition-all hover:shadow-[0_0_24px_-2px_rgba(210,96,26,0.6)]"
              >
                View full on-chain history
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
