/**
 * ─────────────────────────────────────────────────────────────────────────
 *  Credora — integration seam (Backend reads + Smart-contract writes)
 * ─────────────────────────────────────────────────────────────────────────
 *  The WHOLE app reads/writes through this file. Two independent switches:
 *
 *    READ_SOURCE  = "mock" | "api"    reads come from mock data or Credora-Backend
 *    WRITE_SOURCE = "mock" | "chain"  writes are faked or sent to Mantle contracts
 *
 *  They flip independently because the backend (reads) and the deployed
 *  contracts (writes) come online at different times. With both = mock the
 *  app is identical to the offline demo.
 *
 *  Backend  : ../Credora-Backend   (GET /api/* — see lib/backend.ts for shapes)
 *  Contracts: ../Credora-Contract  (AgentPassport / SeasonManager / DecisionLogger)
 *  Misalignments needing a BE/SC change: docs/credora-integration/CONTEXT_FOR_BE_SC.md
 * ─────────────────────────────────────────────────────────────────────────
 */

import {
  AGENTS,
  LIVE_FEED,
  SEASONS,
  MOCK_SOURCES,
  MOCK_STRATEGY_ACCOUNTS,
  agentHistory,
  getAgent,
  getSeason,
  type Agent,
  type DecisionRow,
  type Season,
  type Risk,
} from "./agents";
import {
  mapAgent,
  mapDecision,
  mapSeason,
  type BeAgent,
  type BeDecision,
  type BeLeaderRow,
  type BeOutcome,
  type BeProof,
  type BeSeason,
  type BeSource,
  type BeStrategyAccount,
  type BeStrategyProof,
} from "./backend";

/* ── source switches (env-driven, safe defaults) ── */
export const READ_SOURCE: "mock" | "api" =
  process.env.NEXT_PUBLIC_READ_SOURCE === "api" ? "api" : "mock";
export const WRITE_SOURCE: "mock" | "chain" =
  process.env.NEXT_PUBLIC_WRITE_SOURCE === "chain" ? "chain" : "mock";

/* ── deployed contract addresses (fill after SC deploy) ── */
export const CONTRACTS = {
  agentPassport: process.env.NEXT_PUBLIC_AGENT_PASSPORT ?? "",
  seasonManager: process.env.NEXT_PUBLIC_SEASON_MANAGER ?? "",
  decisionLogger: process.env.NEXT_PUBLIC_DECISION_LOGGER ?? "",
  outcomeRegistry: process.env.NEXT_PUBLIC_OUTCOME_REGISTRY ?? "",
  reputationEngine: process.env.NEXT_PUBLIC_REPUTATION_ENGINE ?? "",
} as const;

export const MANTLE = {
  chainId: Number(process.env.NEXT_PUBLIC_MANTLE_CHAIN_ID ?? 5003),
  rpcUrl: process.env.NEXT_PUBLIC_MANTLE_RPC_URL ?? "",
  explorer: "https://explorer.sepolia.mantle.xyz",
} as const;

export function explorerTx(hash: string) {
  return `${MANTLE.explorer}/tx/${hash}`;
}

/* same-origin proxy → backend (see app/api/credora/[...path]/route.ts) */
async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`/api/credora${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`backend ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}
async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api/credora${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`backend ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

/* newest decision per agent, for the "last action" snapshot */
function latestByAgent(decisions: BeDecision[]) {
  const m = new Map<string, BeDecision>();
  for (const d of decisions) {
    const cur = m.get(d.agentId);
    if (!cur || d.submittedAt > cur.submittedAt) m.set(d.agentId, d);
  }
  return m;
}

/* ───────────────────────────── READS ─────────────────────────────────── */

export async function fetchAgents(): Promise<Agent[]> {
  if (READ_SOURCE === "mock") return AGENTS;
  const [lb, ag, dec] = await Promise.all([
    apiGet<{ leaderboard: BeLeaderRow[] }>("/leaderboard"),
    apiGet<{ agents: BeAgent[] }>("/agents"),
    apiGet<{ decisions: BeDecision[] }>("/decisions"),
  ]);
  const metaById = new Map(ag.agents.map((a) => [a.id, a]));
  const latest = latestByAgent(dec.decisions);
  return lb.leaderboard.map((row) =>
    mapAgent(row, metaById.get(row.agentId), latest.get(row.agentId)),
  );
}

export async function fetchAgent(id: string): Promise<Agent | undefined> {
  if (READ_SOURCE === "mock") return getAgent(id);
  return (await fetchAgents()).find((a) => a.id === id);
}

export async function fetchAgentHistory(agent: Agent): Promise<DecisionRow[]> {
  if (READ_SOURCE === "mock") return agentHistory(agent);
  const [dec, out] = await Promise.all([
    apiGet<{ decisions: BeDecision[] }>("/decisions"),
    apiGet<{ outcomes: BeOutcome[] }>("/outcomes"),
  ]);
  const outByDecision = new Map(out.outcomes.map((o) => [o.decisionId, o]));
  return dec.decisions
    .filter((d) => d.agentId === agent.id)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
    .map((d) => ({
      ...mapDecision(d, outByDecision.get(d.id)),
      agent: agent.name,
    }));
}

export async function fetchLiveFeed(): Promise<DecisionRow[]> {
  if (READ_SOURCE === "mock") return LIVE_FEED;
  const [dec, out, ag] = await Promise.all([
    apiGet<{ decisions: BeDecision[] }>("/decisions"),
    apiGet<{ outcomes: BeOutcome[] }>("/outcomes"),
    apiGet<{ agents: BeAgent[] }>("/agents"),
  ]);
  const outByDecision = new Map(out.outcomes.map((o) => [o.decisionId, o]));
  const nameById = new Map(ag.agents.map((a) => [a.id, a.name]));
  return dec.decisions
    .slice()
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
    .slice(0, 18)
    .map((d) => ({
      ...mapDecision(d, outByDecision.get(d.id)),
      agent: nameById.get(d.agentId) ?? d.agentId,
    }));
}

export async function fetchSeasons(): Promise<Season[]> {
  if (READ_SOURCE === "mock") return SEASONS;
  const [cur, lb, dec] = await Promise.all([
    apiGet<BeSeason>("/season/current"),
    apiGet<{ leaderboard: BeLeaderRow[] }>("/leaderboard"),
    apiGet<{ decisions: BeDecision[] }>("/decisions"),
  ]);
  const s = mapSeason(cur);
  s.participants = lb.leaderboard.length;
  s.decisionsLogged = dec.decisions.length;
  return [s];
}

export async function fetchSeason(id: string): Promise<Season | undefined> {
  if (READ_SOURCE === "mock") return getSeason(id);
  const all = await fetchSeasons();
  return all.find((s) => s.id === id) ?? all[0];
}

/** Full proof payload for the Decision Proof modal (real hashes + tx). */
export async function fetchProof(decisionId: string): Promise<BeProof | undefined> {
  if (READ_SOURCE === "mock") return undefined; // modal uses local data in mock mode
  try {
    return await apiGet<BeProof>(`/proof/${encodeURIComponent(decisionId)}`);
  } catch {
    return undefined;
  }
}

/** Demo agent run → server-simulated decision (backend), or faked in mock. */
export async function runDemoAgent(
  agentId: string,
  market: string,
): Promise<{ decision: DecisionRow } | undefined> {
  if (READ_SOURCE === "mock") return undefined; // page falls back to local makeDecision()
  try {
    const res = await apiPost<{ decision: BeDecision; outcome?: BeOutcome }>(
      "/agents/run",
      { agentId, market },
    );
    return { decision: mapDecision(res.decision, res.outcome) };
  } catch {
    return undefined;
  }
}

/* ── strategy accounts (import existing CEX/on-chain track records) ── */

export async function fetchSources(): Promise<BeSource[]> {
  if (READ_SOURCE === "mock") return MOCK_SOURCES;
  try {
    return (await apiGet<{ sources: BeSource[] }>("/sources")).sources;
  } catch {
    return MOCK_SOURCES;
  }
}

export async function fetchStrategyAccounts(): Promise<BeStrategyAccount[]> {
  if (READ_SOURCE === "mock") return MOCK_STRATEGY_ACCOUNTS;
  try {
    return (
      await apiGet<{ strategyAccounts: BeStrategyAccount[] }>(
        "/strategy-accounts",
      )
    ).strategyAccounts;
  } catch {
    return MOCK_STRATEGY_ACCOUNTS;
  }
}

export async function fetchStrategyProof(
  id: string,
): Promise<BeStrategyProof | undefined> {
  if (READ_SOURCE === "mock") {
    const account = MOCK_STRATEGY_ACCOUNTS.find((a) => a.id === id);
    return account
      ? {
          account,
          proof: {
            dataHash: account.dataHash,
            sourceProofUrl: account.sourceProofUrl,
            txHashes: account.txHashes,
            proofStatus: account.proofStatus,
            explorerUrls: [],
          },
        }
      : undefined;
  }
  try {
    return await apiGet<BeStrategyProof>(
      `/strategy-accounts/${encodeURIComponent(id)}/proof`,
    );
  } catch {
    return undefined;
  }
}

export type ImportInput = {
  source: string;
  sourcePlatform: string;
  externalAccountId: string;
  displayName: string;
  accountType: string;
  verificationLevel: string;
  markets: string[];
  period: string;
  metrics: {
    roiPct: number;
    winRatePct: number;
    maxDrawdownPct: number;
    tradeCount: number;
    volumeUsd: number;
    consistencyPct: number;
  };
  sourceProofUrl?: string;
  walletAddress?: string;
  chain?: string;
};

export async function importStrategyAccount(
  input: ImportInput,
): Promise<{ id: string; credoraScore: number; dataHash: string } | undefined> {
  if (READ_SOURCE === "mock") {
    // pretend-import locally so the flow is demoable offline
    await new Promise((r) => setTimeout(r, 1200));
    return {
      id: `${input.source}:${input.externalAccountId}`,
      credoraScore:
        Math.round(
          (input.metrics.winRatePct * 0.4 +
            Math.min(100, input.metrics.roiPct * 3) * 0.3 +
            input.metrics.consistencyPct * 0.3) *
            100,
        ) / 100,
      dataHash: "0x" + Math.random().toString(16).slice(2).padEnd(64, "0").slice(0, 64),
    };
  }
  const res = await apiPost<{
    strategyAccount: { id: string; credoraScore: number; dataHash: string };
  }>("/strategy-accounts/import", input);
  return res.strategyAccount;
}

/* ──────────────────────────── WRITES (optional) ──────────────────────────
   The app uses a "connect-to-go-real" model: with NO wallet connected, these
   run the mock path (frictionless demo + "Run demo agent" still anchors via the
   backend). With a wallet connected on Mantle Sepolia, pages pass useChain=true
   and the USER signs the tx (lib/chain.ts) — the backend indexer then ingests
   the event (~15s) so the agent/decision appears in the app automatically.
   WRITE_SOURCE="chain" forces the chain path globally if ever needed. */

export type RegisterAgentInput = {
  name: string;
  strategy: string;
  platform: "DEX" | "CEX";
  risk: Risk;
  market: string;
  controller: string;
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

export type TxResult = { agentId?: string; txHash: string; status: "verified" };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const forceChain = WRITE_SOURCE === "chain";

export async function registerAgent(
  input: RegisterAgentInput,
  useChain = forceChain,
): Promise<TxResult> {
  if (useChain) {
    const { chainRegisterAgent } = await import("./chain");
    return chainRegisterAgent(input);
  }
  void input;
  await wait(1900);
  return { agentId: "0006", txHash: "0x" + "0".repeat(40), status: "verified" };
}

export async function joinSeason(
  agentId: string,
  seasonId: string,
  useChain = forceChain,
): Promise<TxResult> {
  if (useChain) {
    const { chainJoinSeason } = await import("./chain");
    return chainJoinSeason(agentId, seasonId);
  }
  void agentId;
  void seasonId;
  await wait(1100);
  return { txHash: "0x" + "0".repeat(40), status: "verified" };
}

export async function logDecision(
  input: LogDecisionInput,
  useChain = forceChain,
): Promise<TxResult> {
  if (useChain) {
    const { chainLogDecision } = await import("./chain");
    return chainLogDecision(input);
  }
  void input;
  await wait(1200);
  return { txHash: "0x" + "0".repeat(40), status: "verified" };
}
