/**
 * ─────────────────────────────────────────────────────────────────────────
 *  Credora — Smart-contract integration seam
 * ─────────────────────────────────────────────────────────────────────────
 *  STATUS: MOCK ONLY. Nothing here touches a chain, wallet, RPC or wagmi/viem.
 *  The whole frontend reads/writes through THIS file, so when the Mantle
 *  contracts are deployed, integration is a drop-in: flip DATA_SOURCE to
 *  "onchain" and fill in the TODO(contract) branches. No page/component
 *  changes required.
 *
 *  Planned contracts (separate repo):
 *    • AgentRegistry   — ERC-721/8004 identity passports
 *    • SeasonManager   — create/join seasons, final scores, reward vault
 *    • DecisionLogger  — append-only Decision struct log (logged pre-outcome)
 *    • ReputationScore — derived Credora Score (accuracy/ROI/risk/verified)
 * ─────────────────────────────────────────────────────────────────────────
 */

import {
  AGENTS,
  LIVE_FEED,
  SEASONS,
  agentHistory,
  agentSeries,
  getAgent,
  getSeason,
  type Agent,
  type DecisionRow,
  type Season,
  type Risk,
} from "./agents";

/** Flip to "onchain" once the contracts are live and the branches below are filled in. */
export const DATA_SOURCE: "mock" | "onchain" = "mock";

/** Contract addresses — populated from env when deployed. Empty = not wired yet. */
export const CONTRACTS = {
  agentRegistry: process.env.NEXT_PUBLIC_AGENT_REGISTRY ?? "",
  decisionLogger: process.env.NEXT_PUBLIC_DECISION_LOGGER ?? "",
  reputationScore: process.env.NEXT_PUBLIC_REPUTATION_SCORE ?? "",
} as const;

export const MANTLE = {
  chainId: 5003, // Mantle Sepolia testnet
  rpcUrl: process.env.NEXT_PUBLIC_MANTLE_RPC_URL ?? "",
  explorer: "https://explorer.sepolia.mantle.xyz",
} as const;

/** Build a tx/address explorer link (used by the proof modals today). */
export function explorerTx(hash: string) {
  return `${MANTLE.explorer}/tx/${hash}`;
}

/* ── On-chain struct shape the DecisionLogger will emit (matches the brief) ──
 *
 *   struct Decision {
 *     uint256 agentId;  string actionType;  string asset;
 *     uint256 confidence;  uint256 riskScore;  string rationaleHash;
 *     bytes32 dataSnapshotHash;  address executor;  uint256 timestamp;
 *     string  result;
 *   }
 *
 * `mapDecision()` is where the raw on-chain tuple gets adapted into the
 * `DecisionRow` the UI already renders.
 */

export type RegisterAgentInput = {
  name: string;
  strategy: string;
  platform: "DEX" | "CEX";
  risk: Risk;
  market: string;
  controller: string; // wallet address
};

export type LogDecisionInput = {
  agentId: string;
  seasonId: string;
  action: DecisionRow["action"];
  market: string;
  confidence: number;
  riskScore: number;
  window: string;
  rationale: string;
};

/* ───────────────────────────── READS ─────────────────────────────────── */

export async function fetchAgents(): Promise<Agent[]> {
  if (DATA_SOURCE === "onchain") {
    // TODO(contract): ReputationScore.getLeaderboard() + AgentRegistry.tokenURI()
    throw new Error("onchain reads not wired yet");
  }
  return AGENTS;
}

export async function fetchAgent(id: string): Promise<Agent | undefined> {
  if (DATA_SOURCE === "onchain") {
    // TODO(contract): AgentRegistry.agentOf(id) + ReputationScore.scoreOf(id)
    throw new Error("onchain reads not wired yet");
  }
  return getAgent(id);
}

export async function fetchAgentHistory(agent: Agent): Promise<DecisionRow[]> {
  if (DATA_SOURCE === "onchain") {
    // TODO(contract): DecisionLogger.getDecisions(agentId) -> map(mapDecision)
    throw new Error("onchain reads not wired yet");
  }
  return agentHistory(agent);
}

export async function fetchAgentSeries(agent: Agent): Promise<number[]> {
  if (DATA_SOURCE === "onchain") {
    // TODO(contract): derive from ReputationScore history events
    throw new Error("onchain reads not wired yet");
  }
  return agentSeries(agent);
}

export async function fetchLiveFeed(): Promise<DecisionRow[]> {
  if (DATA_SOURCE === "onchain") {
    // TODO(contract): subscribe to DecisionLogger `DecisionLogged` events
    throw new Error("onchain reads not wired yet");
  }
  return LIVE_FEED;
}

export async function fetchSeasons(): Promise<Season[]> {
  if (DATA_SOURCE === "onchain") {
    // TODO(contract): SeasonManager.getSeasons()
    throw new Error("onchain reads not wired yet");
  }
  return SEASONS;
}

export async function fetchSeason(id: string): Promise<Season | undefined> {
  if (DATA_SOURCE === "onchain") {
    // TODO(contract): SeasonManager.getSeason(id) + standings
    throw new Error("onchain reads not wired yet");
  }
  return getSeason(id);
}

/* ──────────────────────────── WRITES ─────────────────────────────────── */

export type TxResult = { agentId?: string; txHash: string; status: "verified" };

export async function registerAgent(
  input: RegisterAgentInput,
): Promise<TxResult> {
  if (DATA_SOURCE === "onchain") {
    // TODO(contract): writeContract(AgentRegistry.mint, [metadataURI, controller])
    //                 then wait for the AgentRegistered event → return real ids.
    throw new Error("onchain writes not wired yet");
  }
  // mock: pretend-mint with a deterministic-looking result
  void input;
  await wait(1900);
  return { agentId: "0x0006", txHash: "0x7d1a…c4e2", status: "verified" };
}

export async function joinSeason(
  agentId: string,
  seasonId: string,
): Promise<TxResult> {
  if (DATA_SOURCE === "onchain") {
    // TODO(contract): writeContract(SeasonManager.joinSeason, [agentId, seasonId])
    throw new Error("onchain writes not wired yet");
  }
  void agentId;
  void seasonId;
  await wait(1100);
  return { txHash: "0x" + Math.random().toString(16).slice(2, 14), status: "verified" };
}

export async function logDecision(input: LogDecisionInput): Promise<TxResult> {
  if (DATA_SOURCE === "onchain") {
    // TODO(contract): writeContract(DecisionLogger.log, [Decision{...}])
    throw new Error("onchain writes not wired yet");
  }
  void input;
  await wait(1200);
  return { txHash: "0x" + Math.random().toString(16).slice(2, 14), status: "verified" };
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
