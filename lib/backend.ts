/**
 * ─────────────────────────────────────────────────────────────────────────
 *  Backend wire types + adapters (Credora-Backend → FE types)
 * ─────────────────────────────────────────────────────────────────────────
 *  Maps the exact JSON shapes returned by Credora-Backend (`/api/*`) into the
 *  FE's existing `Agent` / `DecisionRow` / `Season` types, so pages don't
 *  change. Mismatches that need a backend change are tracked in
 *  docs/credora-integration/CONTEXT_FOR_BE_SC.md.
 * ─────────────────────────────────────────────────────────────────────────
 */

import type {
  Action,
  Agent,
  DecisionRow,
  Risk,
  ScoreBreakdown,
  Season,
} from "./agents";

/* ── exact backend shapes (from Credora-Backend/src/types/domain.ts) ── */
export type BeAction = "LONG" | "SHORT" | "HOLD" | "ALERT";

export type BeAgent = {
  id: string;
  name: string;
  source: string;
  strategyType: string;
  tradingPlatform: "DEX" | "CEX" | "demo";
  riskProfile: "low" | "medium" | "high";
  supportedMarkets: string[];
  metadataUri?: string;
};

export type BeLeaderRow = {
  agentId: string;
  agentName: string;
  decisions: number;
  accuracy: number;
  winRate?: number; // v2.2: separate from accuracy
  roiPct: number;
  consistency: number;
  avgRisk: number;
  credoraScore: number;
  scoreBreakdown?: ScoreBreakdown; // v2.2: real component sub-scores
  rank?: number;
};

export type BeSeason = {
  id: string;
  name: string;
  marketScope: string;
  startTime: string;
  endTime: string;
  status: string;
};

export type BeDecision = {
  id: string;
  agentId: string;
  seasonId: string;
  market: string;
  action: BeAction;
  entryPrice: number;
  targetWindowHours: number;
  confidence: number;
  riskScore: number;
  rationale: string;
  dataHash: string;
  rationaleHash: string;
  evidenceUri: string;
  submittedAt: string;
  // v2: present once the backend's background on-chain write confirms (~40s)
  onChainTxHash?: string;
  onChainExplorerUrl?: string;
  onChainDecisionId?: number;
};

export type BeOutcome = {
  decisionId: string;
  agentId: string;
  seasonId: string;
  status: "success" | "failed" | "neutral" | "inconclusive";
  priceBefore: number;
  priceAfter: number;
  roiBps: number;
  confidenceCalibration: number;
  metricsHash: string;
  evidenceUri: string;
};

export type BeProof = {
  agent: BeAgent;
  decision: BeDecision;
  outcome?: BeOutcome;
  proof: {
    dataHash: string;
    rationaleHash: string;
    txHash: string;
    explorerUrl: string;
  };
};

/* ── strategy accounts (imported existing track records) ── */
export type BeSource = {
  id: string;
  name: string;
  sourceType: string; // cex | onchain_analytics | onchain | manual
  verificationMode: string;
  requiredProof: string[];
  notes?: string;
};

export type BeStrategyMetrics = {
  roiPct: number;
  winRatePct: number;
  maxDrawdownPct: number;
  tradeCount: number;
  volumeUsd: number;
  consistencyPct: number;
};

export type BeStrategyAccount = {
  id: string;
  source: string;
  sourceType: string;
  sourcePlatform: string;
  externalAccountId: string;
  displayName: string;
  accountType: string;
  verificationLevel: string;
  walletAddress?: string | null;
  chain?: string | null;
  markets: string[];
  period: string;
  metrics: BeStrategyMetrics;
  txHashes: string[];
  sourceProofUrl?: string;
  notes?: string;
  proofStatus: string;
  dataHash: string;
  credoraScore: number;
};

export type BeStrategyProof = {
  account: BeStrategyAccount;
  proof: {
    dataHash: string;
    sourceProofUrl?: string;
    txHashes: string[];
    proofStatus: string;
    explorerUrls: string[];
  };
};

/* ── value mappers (see CONTEXT doc D1/D6/D8) ── */

/** chain/backend action → FE label. LONG→BUY, SHORT→SELL, HOLD/ALERT→HOLD. */
export function actionBeToFe(a: BeAction): Action {
  if (a === "LONG") return "BUY";
  if (a === "SHORT") return "SELL";
  return "HOLD"; // HOLD + ALERT both render as HOLD on the FE
}

/** FE label → chain enum index (Long=0, Short=1, Hold=2, Alert=3). */
export function actionFeToChainIndex(a: Action): number {
  if (a === "BUY") return 0;
  if (a === "SELL") return 1;
  return 2; // HOLD
}

export function riskFromBackend(p: BeAgent["riskProfile"]): Risk {
  return p === "low" ? "Low" : p === "high" ? "High" : "Medium";
}

export function riskFromScore(score: number): Risk {
  return score < 34 ? "Low" : score > 66 ? "High" : "Medium";
}

function outcomeToResult(s?: BeOutcome["status"]): DecisionRow["result"] {
  if (s === "success") return "Profit";
  if (s === "failed") return "Loss";
  return "Pending"; // neutral / inconclusive / none
}

function handleFromName(name: string) {
  return name.toLowerCase().replace(/\s+/g, ".");
}

/* ── object mappers ── */

/** Join a leaderboard row (scores) + agent meta → FE Agent. */
export function mapAgent(
  row: BeLeaderRow,
  meta: BeAgent | undefined,
  latest?: BeDecision,
): Agent {
  // v2.2 backend returns a real scoreBreakdown; fall back to a derived one.
  const breakdown: ScoreBreakdown = row.scoreBreakdown ?? {
    accuracy: Math.round(row.accuracy),
    roi: Math.max(0, Math.min(100, Math.round((row.roiPct + 10) * 5))),
    consistency: Math.round(row.consistency),
    riskMgmt: Math.max(0, Math.round(100 - row.avgRisk)),
    verification: Math.min(100, row.decisions * 10),
  };
  return {
    id: row.agentId,
    rank: row.rank ?? 0,
    name: row.agentName,
    handle: handleFromName(row.agentName),
    strategy: meta?.strategyType ?? "—",
    kind: meta?.source ?? "Agent",
    platform: meta?.tradingPlatform === "CEX" ? "CEX" : "DEX",
    markets: meta?.supportedMarkets ?? [],
    accuracy: Math.round(row.accuracy),
    // v2.2 backend returns winRate separately; fall back to accuracy if absent
    winRate: Math.round(row.winRate ?? row.accuracy),
    roi: row.roiPct,
    risk: meta ? riskFromBackend(meta.riskProfile) : riskFromScore(row.avgRisk),
    verifiedDecisions: row.decisions,
    credoraScore: row.credoraScore,
    scoreBreakdown: breakdown,
    badges: row.rank === 1 ? ["Season Leader"] : [],
    lastAction: latest ? actionBeToFe(latest.action) : "HOLD",
    lastAsset: latest?.market?.split("/")[0] ?? meta?.supportedMarkets?.[0]?.split("/")[0] ?? "—",
    lastMarket: latest?.market ?? meta?.supportedMarkets?.[0] ?? "—",
    confidence: latest?.confidence ?? 0,
    riskScore: latest?.riskScore ?? Math.round(row.avgRisk),
    rationaleHash: latest?.rationaleHash ?? "—",
    dataSnapshotHash: latest?.dataHash ?? "—",
    txHash: "0x" + "0".repeat(40),
    result: "Pending",
    rationale: latest?.rationale ?? "",
  };
}

export function mapDecision(d: BeDecision, o?: BeOutcome, agoLabel?: string): DecisionRow {
  return {
    id: d.id,
    agentId: d.agentId,
    agent: "", // filled by caller when the agent name is known
    seasonId: d.seasonId,
    ago: agoLabel ?? relTime(d.submittedAt),
    action: actionBeToFe(d.action),
    market: d.market,
    entry: d.entryPrice,
    window: `${d.targetWindowHours}h`,
    confidence: d.confidence,
    riskScore: d.riskScore,
    rationaleHash: d.rationaleHash,
    dataSnapshotHash: d.dataHash,
    result: outcomeToResult(o?.status),
    pnl: o ? Math.round(o.roiBps) / 100 : 0,
    // real on-chain tx once the backend's background write confirms (v2)
    txHash: d.onChainTxHash ?? "0x" + "0".repeat(40),
  };
}

export function mapSeason(s: BeSeason): Season {
  const ended = s.status !== "active";
  return {
    id: s.id,
    name: s.name,
    tagline: `Markets: ${s.marketScope}`,
    status: ended ? "Ended" : "Live",
    prizePool: "—",
    endsIn: ended ? undefined : relUntil(s.endTime),
    duration: "Season",
    participants: 0, // filled from leaderboard length by the caller
    categories: ["Most Accurate", "Best ROI", "Best Risk-Adjusted", "Most Consistent"],
    decisionsLogged: 0,
  };
}

/* ── small time helpers ── */
function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
function relUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "ended";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return `${d}d ${h}h`;
}
