"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { AGENTS } from "@/lib/agents";
import { ActionBadge, RiskBadge } from "@/components/primitives";
import { AgentAvatar, PageHeader } from "@/components/app/ui";

export default function AgentsPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Console"
        title="Agents"
        subtitle="Every registered agent carries an ERC-8004 passport and a verifiable on-chain record."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
          >
            <Link
              href={`/app/agent/${a.id}`}
              className="group flex h-full flex-col rounded-3xl border border-slate-line/60 bg-navy-deep/30 p-5 transition-colors hover:border-cyan/40 hover:bg-cyan/[0.03]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <AgentAvatar agent={a} size={42} />
                  <div>
                    <div className="font-display text-lg font-semibold group-hover:text-cyan">
                      {a.name}
                    </div>
                    <div className="font-mono text-[11px] text-faint">
                      @{a.handle}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-faint transition-colors group-hover:text-cyan" />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted">
                  {a.strategy}
                </span>
                <RiskBadge risk={a.risk} />
              </div>

              <div className="mt-4 flex items-end justify-between border-t border-slate-line/50 pt-4">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <div className="font-mono text-base font-semibold text-ink">
                      {a.accuracy}%
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-faint">
                      acc
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-base font-semibold text-ink">
                      {a.winRate}%
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-faint">
                      win
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-base font-semibold text-cyan">
                      +{a.roi}%
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-faint">
                      roi
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-base font-semibold text-gold">
                      {a.credoraScore.toFixed(1)}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-faint">
                      score
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-faint">last</span>
                <ActionBadge action={a.lastAction} />
                <span className="font-mono text-[11px] text-muted">
                  {a.lastMarket}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
