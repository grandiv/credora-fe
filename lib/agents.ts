export type Risk = "Low" | "Medium" | "High";
export type Action = "BUY" | "SELL" | "HOLD" | "ALERT" | "REBALANCE";

export type Agent = {
  id: string;
  rank: number;
  name: string;
  handle: string;
  strategy: string;
  kind: string;
  winRate: number;
  roi: number;
  risk: Risk;
  reputation: number;
  decisions: number;
  lastAction: Action;
  lastAsset: string;
  confidence: number;
  riskScore: number;
  rationaleHash: string;
  dataSnapshotHash: string;
  txHash: string;
  result: "Profit" | "Pending" | "Loss";
  rationale: string;
};

export const AGENTS: Agent[] = [
  {
    id: "0001",
    rank: 1,
    name: "MantaScout",
    handle: "manta.scout",
    strategy: "Smart-money alert",
    kind: "Alpha / Anomaly",
    winRate: 68,
    roi: 12.4,
    risk: "Medium",
    reputation: 942,
    decisions: 318,
    lastAction: "BUY",
    lastAsset: "mETH",
    confidence: 78,
    riskScore: 54,
    rationaleHash: "bafkreid7h2…q4m9",
    dataSnapshotHash: "0x9f3a…be21",
    txHash: "0x4c8e7a21b9f0d3c5a6e1f7029d4b8c61aa30e2f4",
    result: "Profit",
    rationale:
      "Detected unusual accumulation on the MNT/mETH pair — five smart wallets opened positions within 40 minutes while pool TVL rose 9.2% against flat price action. Divergence suggests informed inflow.",
  },
  {
    id: "0002",
    rank: 2,
    name: "RWA Guard",
    handle: "rwa.guard",
    strategy: "RWA yield monitor",
    kind: "RWA / Risk",
    winRate: 74,
    roi: 6.1,
    risk: "Low",
    reputation: 911,
    decisions: 204,
    lastAction: "HOLD",
    lastAsset: "USDY",
    confidence: 91,
    riskScore: 22,
    rationaleHash: "bafkreifa0c…2x7p",
    dataSnapshotHash: "0x1be4…77ac",
    txHash: "0xa1f3920c47de88b5103e6f4427cd91b0e7723d18",
    result: "Profit",
    rationale:
      "USDY effective yield held within the 4.9–5.1% band with no collateral-attestation drift. Risk-adjusted carry remains superior to rotating — recommend hold and re-evaluate at next oracle epoch.",
  },
  {
    id: "0003",
    rank: 3,
    name: "ClawQuant",
    handle: "claw.quant",
    strategy: "Momentum trading",
    kind: "Trading / Strategy",
    winRate: 61,
    roi: 18.2,
    risk: "High",
    reputation: 877,
    decisions: 489,
    lastAction: "SELL",
    lastAsset: "MNT",
    confidence: 66,
    riskScore: 71,
    rationaleHash: "bafkreih93b…lk0d",
    dataSnapshotHash: "0x77c2…0fe9",
    txHash: "0x77c20fe9aa13b884d5619c0e4f23ad77be81249c",
    result: "Pending",
    rationale:
      "MNT pushed +6.3% into a thinning order book as perp funding flipped negative. Momentum exhaustion signal fired on the 4h timeframe — de-risk 40% of the position and trail the remainder.",
  },
  {
    id: "0004",
    rank: 4,
    name: "FluxSeer",
    handle: "flux.seer",
    strategy: "Liquidity anomaly",
    kind: "Alpha / Data",
    winRate: 70,
    roi: 9.7,
    risk: "Medium",
    reputation: 840,
    decisions: 271,
    lastAction: "ALERT",
    lastAsset: "FBTC",
    confidence: 83,
    riskScore: 48,
    rationaleHash: "bafkreig22a…9wq1",
    dataSnapshotHash: "0x55da…1c8b",
    txHash: "0x55da1c8b73f29104ccae6610b8f4d27a90e3318f",
    result: "Profit",
    rationale:
      "FBTC pool depth dropped 31% in one block while a single wallet captured 64% of routed volume — concentration pattern consistent with a pre-position. Flagged for watchlist, no execution.",
  },
  {
    id: "0005",
    rank: 5,
    name: "MetaRebal",
    handle: "meta.rebal",
    strategy: "Auto rebalancer",
    kind: "Portfolio / RWA",
    winRate: 65,
    roi: 7.8,
    risk: "Low",
    reputation: 802,
    decisions: 156,
    lastAction: "REBALANCE",
    lastAsset: "mETH",
    confidence: 88,
    riskScore: 30,
    rationaleHash: "bafkreib71d…u3kx",
    dataSnapshotHash: "0x2ef0…aa45",
    txHash: "0x2ef0aa45d918c7720b3361a0ef4c8d9173be20a6",
    result: "Profit",
    rationale:
      "Portfolio drift exceeded the 5% band as mETH outperformed. Rebalanced toward target weights to lock realised gains and restore the conservative risk envelope.",
  },
];

export const TICKER: { agent: string; action: Action; asset: string; conf: number }[] =
  [
    { agent: "MantaScout", action: "BUY", asset: "mETH", conf: 78 },
    { agent: "RWA Guard", action: "HOLD", asset: "USDY", conf: 91 },
    { agent: "ClawQuant", action: "SELL", asset: "MNT", conf: 66 },
    { agent: "FluxSeer", action: "ALERT", asset: "FBTC", conf: 83 },
    { agent: "MetaRebal", action: "REBALANCE", asset: "mETH", conf: 88 },
    { agent: "MantaScout", action: "ALERT", asset: "MNT", conf: 72 },
  ];

/* ── Decision history rows (for agent passport + live feed) ── */
export type DecisionRow = {
  id: string;
  agentId: string;
  agent: string;
  ago: string; // relative time label
  action: Action;
  asset: string;
  confidence: number;
  riskScore: number;
  result: "Profit" | "Pending" | "Loss";
  pnl: number; // realised %, 0 when pending
  txHash: string;
};

const ASSETS = ["mETH", "USDY", "MNT", "FBTC", "USDe"];
const ACTIONS: Action[] = ["BUY", "SELL", "HOLD", "ALERT", "REBALANCE"];

function hash(n: number) {
  // tiny deterministic pseudo-random so SSR and client agree
  const x = Math.sin(n * 99.13) * 43758.5453;
  return x - Math.floor(x);
}

function buildHistory(agent: Agent, count: number): DecisionRow[] {
  const rows: DecisionRow[] = [];
  const seed = parseInt(agent.id, 10) * 7;
  for (let i = 0; i < count; i++) {
    const r = hash(seed + i);
    const r2 = hash(seed + i + 100);
    const result =
      i === 0
        ? agent.result
        : r > 0.78
          ? "Loss"
          : r > 0.18
            ? "Profit"
            : "Pending";
    const pnl =
      result === "Pending"
        ? 0
        : result === "Loss"
          ? -(1 + r2 * 6)
          : 1 + r2 * 9;
    rows.push({
      id: `${agent.id}-${String(i).padStart(3, "0")}`,
      agentId: agent.id,
      agent: agent.name,
      ago:
        i === 0
          ? "just now"
          : i < 4
            ? `${i * 7 + 2}m ago`
            : i < 9
              ? `${i - 2}h ago`
              : `${i - 7}d ago`,
      action: i === 0 ? agent.lastAction : ACTIONS[Math.floor(r * ACTIONS.length)],
      asset: i === 0 ? agent.lastAsset : ASSETS[Math.floor(r2 * ASSETS.length)],
      confidence: 55 + Math.floor(hash(seed + i + 7) * 42),
      riskScore: 18 + Math.floor(hash(seed + i + 11) * 64),
      result,
      pnl: Math.round(pnl * 10) / 10,
      txHash:
        "0x" +
        Math.floor(hash(seed + i + 3) * 1e16)
          .toString(16)
          .padStart(12, "0") +
        agent.txHash.slice(14),
    });
  }
  return rows;
}

/** Full decision history for one agent (newest first). */
export function agentHistory(agent: Agent): DecisionRow[] {
  return buildHistory(agent, 14);
}

/** A reputation trend series for the passport chart (24 points). */
export function agentSeries(agent: Agent): number[] {
  const seed = parseInt(agent.id, 10) * 13;
  const pts: number[] = [];
  let v = agent.reputation - 120;
  for (let i = 0; i < 24; i++) {
    v += (hash(seed + i) - 0.42) * 26;
    v = Math.max(620, Math.min(980, v));
    pts.push(Math.round(v));
  }
  pts[pts.length - 1] = agent.reputation;
  return pts;
}

/** Cross-agent live feed — newest decisions across the whole network. */
export const LIVE_FEED: DecisionRow[] = (() => {
  const per = AGENTS.map((a) => buildHistory(a, 4));
  const feed: DecisionRow[] = [];
  for (let i = 0; i < 4; i++) {
    for (const rows of per) if (rows[i]) feed.push(rows[i]);
  }
  // assign cascading "ago" labels so the feed reads newest-first
  return feed.slice(0, 18).map((d, i) => ({
    ...d,
    ago:
      i === 0
        ? "just now"
        : i < 6
          ? `${i * 2 + 1}m ago`
          : i < 12
            ? `${i - 4}m ago`
            : `${i - 9}h ago`,
  }));
})();

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}

export const ASSET_LIST = ASSETS;
export const STRATEGY_TYPES = [
  "Smart-money alert",
  "Anomaly detection",
  "Momentum trading",
  "RWA yield monitor",
  "Auto rebalancer",
  "Arbitrage",
];
