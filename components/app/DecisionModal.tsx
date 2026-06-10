"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { X, ExternalLink, Copy, BadgeCheck, CircleCheck, Clock, CircleX, Lock } from "lucide-react";
import type { DecisionRow } from "@/lib/agents";
import { fetchProof, explorerTx, MANTLE } from "@/lib/contract";
import { ActionBadge } from "@/components/primitives";

function resultTone(r: DecisionRow["result"]) {
  if (r === "Profit") return { c: "text-cyan", Icon: CircleCheck };
  if (r === "Loss") return { c: "text-[#e36a5a]", Icon: CircleX };
  return { c: "text-muted", Icon: Clock };
}

function rationaleFor(d: DecisionRow) {
  const map: Record<string, string> = {
    BUY: `Predict up on ${d.market}: accumulation by tracked smart wallets diverging from flat price action. Entry sized to the risk envelope.`,
    SELL: `Predict down on ${d.market}: momentum exhaustion as funding flipped negative into thinning depth.`,
    HOLD: `Predict range-bound on ${d.market}: carry beats rotating and no collateral or oracle drift detected. Hold through the window.`,
  };
  return map[d.action];
}

function Field({
  label,
  value,
  copy,
}: {
  label: string;
  value: string;
  copy?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-line/40 py-2.5 last:border-0">
      <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
        {label}
      </span>
      <span className="flex items-center gap-2 truncate text-right font-mono text-sm text-ink">
        <span className="truncate">{value}</span>
        {copy && (
          <Copy className="h-3.5 w-3.5 shrink-0 cursor-pointer text-faint transition-colors hover:text-cyan" />
        )}
      </span>
    </div>
  );
}

export function DecisionModal({
  decision,
  onClose,
}: {
  decision: DecisionRow | null;
  onClose: () => void;
}) {
  const [proof, setProof] = useState<{ txHash: string; explorerUrl: string } | null>(
    null,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (decision) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [decision, onClose]);

  // pull the on-chain tx/explorer link from the backend proof (api mode)
  useEffect(() => {
    setProof(null);
    if (!decision) return;
    let alive = true;
    fetchProof(decision.id).then((p) => {
      if (alive && p?.proof) {
        setProof({ txHash: p.proof.txHash, explorerUrl: p.proof.explorerUrl });
      }
    });
    return () => {
      alive = false;
    };
  }, [decision]);

  return (
    <AnimatePresence>
      {decision && (
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
            className="panel relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl"
          >
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
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-line/60 bg-navy-deep/50 p-4">
                <div>
                  <div className="font-display text-lg font-semibold">
                    {decision.agent}
                  </div>
                  <div className="font-mono text-[11px] text-muted">
                    {decision.ago} · agent 0x{decision.agentId}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ActionBadge action={decision.action} />
                  <span className="font-mono text-sm text-ink">
                    {decision.market}
                  </span>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-cyan/25 bg-cyan/[0.05] p-3 text-center">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-faint">
                    Confidence
                  </div>
                  <div className="mt-1 font-mono text-2xl font-semibold text-cyan">
                    {decision.confidence}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-line/60 bg-white/[0.02] p-3 text-center">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-faint">
                    Risk
                  </div>
                  <div className="mt-1 font-mono text-2xl font-semibold text-ink">
                    {decision.riskScore}
                  </div>
                </div>
                {(() => {
                  const { c, Icon } = resultTone(decision.result);
                  return (
                    <div className="rounded-xl border border-slate-line/60 bg-white/[0.02] p-3 text-center">
                      <div className="font-mono text-[9px] uppercase tracking-wider text-faint">
                        Result
                      </div>
                      <div
                        className={`mt-1 flex items-center justify-center gap-1 font-mono text-sm font-semibold ${c}`}
                      >
                        <Icon className="h-4 w-4" />
                        {decision.result === "Pending"
                          ? "Pending"
                          : `${decision.pnl > 0 ? "+" : ""}${decision.pnl}%`}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="mb-4 rounded-2xl border border-slate-line/60 bg-navy-deep/40 p-4">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-faint">
                  Agent rationale
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  &ldquo;{rationaleFor(decision)}&rdquo;
                </p>
              </div>

              {/* logged-before-outcome banner */}
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-cyan/20 bg-cyan/[0.04] px-3.5 py-2.5">
                <Lock className="h-3.5 w-3.5 shrink-0 text-cyan" />
                <span className="font-mono text-[11px] leading-relaxed text-muted">
                  Logged{" "}
                  <span className="text-cyan">before the outcome</span> — entry{" "}
                  {decision.entry} · resolves in {decision.window}.
                </span>
              </div>

              <div className="rounded-2xl border border-slate-line/60 bg-navy-deep/40 px-4">
                <Field label="Decision ID" value={decision.id} />
                <Field label="Season" value={decision.seasonId.toUpperCase()} />
                <Field label="Market" value={decision.market} />
                <Field label="Prediction window" value={decision.window} />
                <Field label="Rationale hash" value={decision.rationaleHash} copy />
                <Field
                  label="Data snapshot"
                  value={decision.dataSnapshotHash}
                  copy
                />
                <Field
                  label="Tx hash"
                  value={(() => {
                    const h = proof?.txHash ?? decision.txHash;
                    return h.length > 22 ? `${h.slice(0, 14)}…${h.slice(-6)}` : h;
                  })()}
                  copy
                />
                <Field label="Logged" value={decision.ago} />
              </div>

              {(() => {
                // a real, full-length tx hash → tx page; otherwise explorer home
                const real = /^0x[0-9a-fA-F]{64}$/.test(proof?.txHash ?? "");
                const href = real
                  ? explorerTx(proof!.txHash)
                  : (proof?.explorerUrl ?? `${MANTLE.explorer}/`);
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="group mt-4 flex items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-[#0b0e10] transition-all hover:shadow-[0_0_24px_-2px_rgba(210,96,26,0.6)]"
                  >
                    {real ? "Verify on Mantle Explorer" : "Open Mantle Explorer"}
                    <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                );
              })()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
