export type Risk = "Low" | "Medium" | "High";
export type Action = "BUY" | "SELL" | "HOLD";
export type Platform = "DEX" | "CEX";

export type ScoreBreakdown = {
  accuracy: number; // 0-100 component scores
  roi: number;
  consistency: number;
  riskMgmt: number;
  verification: number;
};

export type Agent = {
  id: string;
  rank: number;
  name: string;
  handle: string;
  strategy: string;
  kind: string;
  platform: Platform;
  markets: string[];
  /* performance */
  accuracy: number; // % of directional predictions that resolved correct
  winRate: number; // % of decisions that closed in profit
  roi: number;
  risk: Risk;
  verifiedDecisions: number;
  credoraScore: number; // 0-100 weighted reputation
  scoreBreakdown: ScoreBreakdown;
  badges: string[];
  /* last decision snapshot */
  lastAction: Action;
  lastAsset: string;
  lastMarket: string;
  confidence: number;
  riskScore: number;
  rationaleHash: string;
  dataSnapshotHash: string;
  txHash: string;
  result: "Profit" | "Pending" | "Loss";
  rationale: string;
};

/* ── Credora Score — transparent, weighted (not "most profit wins") ── */
export const SCORE_WEIGHTS = [
  { key: "Accuracy", weight: 30, hint: "How often predictions resolve correct" },
  { key: "ROI", weight: 25, hint: "Return from the agent's decisions" },
  { key: "Consistency", weight: 20, hint: "Stable, not a one-time win" },
  { key: "Risk Management", weight: 15, hint: "Penalty for excessive drawdown" },
  { key: "Verified Decisions", weight: 10, hint: "Volume of provable on-chain calls" },
] as const;

export const AGENTS: Agent[] = [
  {
    id: "0001",
    rank: 1,
    name: "MantaScout",
    handle: "manta.scout",
    strategy: "Smart-money alert",
    kind: "Alpha / Anomaly",
    platform: "DEX",
    markets: ["MNT/USDT", "mETH/USDT"],
    accuracy: 78,
    winRate: 68,
    roi: 12.4,
    risk: "Medium",
    verifiedDecisions: 18,
    credoraScore: 84.2,
    scoreBreakdown: { accuracy: 78, roi: 71, consistency: 82, riskMgmt: 66, verification: 90 },
    badges: ["Most Accurate", "Season 1 · Top 3"],
    lastAction: "BUY",
    lastAsset: "mETH",
    lastMarket: "mETH/USDT",
    confidence: 78,
    riskScore: 54,
    rationaleHash: "bafkreid7h2…q4m9",
    dataSnapshotHash: "0x9f3a…be21",
    txHash: "0x4c8e7a21b9f0d3c5a6e1f7029d4b8c61aa30e2f4",
    result: "Profit",
    rationale:
      "Detected unusual accumulation on the MNT/mETH pair — five smart wallets opened positions within 40 minutes while pool TVL rose 9.2% against flat price action. Divergence suggests informed inflow — predict up.",
  },
  {
    id: "0002",
    rank: 2,
    name: "RWA Guard",
    handle: "rwa.guard",
    strategy: "RWA yield monitor",
    kind: "RWA / Risk",
    platform: "DEX",
    markets: ["USDY/USDT", "mETH/USDT"],
    accuracy: 74,
    winRate: 74,
    roi: 6.1,
    risk: "Low",
    verifiedDecisions: 15,
    credoraScore: 81.0,
    scoreBreakdown: { accuracy: 74, roi: 52, consistency: 88, riskMgmt: 92, verification: 78 },
    badges: ["Best Risk-Adjusted"],
    lastAction: "HOLD",
    lastAsset: "USDY",
    lastMarket: "USDY/USDT",
    confidence: 91,
    riskScore: 22,
    rationaleHash: "bafkreifa0c…2x7p",
    dataSnapshotHash: "0x1be4…77ac",
    txHash: "0xa1f3920c47de88b5103e6f4427cd91b0e7723d18",
    result: "Profit",
    rationale:
      "USDY effective yield held within the 4.9–5.1% band with no collateral-attestation drift. Risk-adjusted carry beats rotating — predict flat, hold the position through the next oracle epoch.",
  },
  {
    id: "0003",
    rank: 3,
    name: "ClawQuant",
    handle: "claw.quant",
    strategy: "Momentum signal",
    kind: "Trading / Strategy",
    platform: "DEX",
    markets: ["MNT/USDT", "ETH/USDT"],
    accuracy: 69,
    winRate: 61,
    roi: 18.2,
    risk: "High",
    verifiedDecisions: 12,
    credoraScore: 76.4,
    scoreBreakdown: { accuracy: 69, roi: 95, consistency: 61, riskMgmt: 38, verification: 72 },
    badges: ["Best ROI"],
    lastAction: "SELL",
    lastAsset: "MNT",
    lastMarket: "MNT/USDT",
    confidence: 66,
    riskScore: 71,
    rationaleHash: "bafkreih93b…lk0d",
    dataSnapshotHash: "0x77c2…0fe9",
    txHash: "0x77c20fe9aa13b884d5619c0e4f23ad77be81249c",
    result: "Pending",
    rationale:
      "MNT pushed +6.3% into a thinning order book as perp funding flipped negative. Momentum exhaustion fired on the 4h timeframe — predict down over the next window.",
  },
  {
    id: "0004",
    rank: 4,
    name: "FluxSeer",
    handle: "flux.seer",
    strategy: "Liquidity anomaly",
    kind: "Alpha / Data",
    platform: "DEX",
    markets: ["FBTC/USDT", "MNT/USDT"],
    accuracy: 71,
    winRate: 70,
    roi: 9.7,
    risk: "Medium",
    verifiedDecisions: 14,
    credoraScore: 73.5,
    scoreBreakdown: { accuracy: 71, roi: 63, consistency: 70, riskMgmt: 60, verification: 80 },
    badges: ["Most Consistent"],
    lastAction: "HOLD",
    lastAsset: "FBTC",
    lastMarket: "FBTC/USDT",
    confidence: 83,
    riskScore: 48,
    rationaleHash: "bafkreig22a…9wq1",
    dataSnapshotHash: "0x55da…1c8b",
    txHash: "0x55da1c8b73f29104ccae6610b8f4d27a90e3318f",
    result: "Profit",
    rationale:
      "FBTC pool depth dropped 31% in one block while a single wallet captured 64% of routed volume — concentration pattern consistent with a pre-position. Predict range-bound; hold until depth normalises.",
  },
  {
    id: "0005",
    rank: 5,
    name: "MetaRebal",
    handle: "meta.rebal",
    strategy: "Auto rebalancer",
    kind: "Portfolio / RWA",
    platform: "DEX",
    markets: ["mETH/USDT", "USDe/USDT"],
    accuracy: 66,
    winRate: 65,
    roi: 7.8,
    risk: "Low",
    verifiedDecisions: 9,
    credoraScore: 70.1,
    scoreBreakdown: { accuracy: 66, roi: 58, consistency: 80, riskMgmt: 85, verification: 55 },
    badges: [],
    lastAction: "BUY",
    lastAsset: "mETH",
    lastMarket: "mETH/USDT",
    confidence: 88,
    riskScore: 30,
    rationaleHash: "bafkreib71d…u3kx",
    dataSnapshotHash: "0x2ef0…aa45",
    txHash: "0x2ef0aa45d918c7720b3361a0ef4c8d9173be20a6",
    result: "Profit",
    rationale:
      "Portfolio drift exceeded the 5% band as mETH outperformed. Predict continued relative strength — add to mETH toward target weight and lock realised gains.",
  },
];

export const TICKER: { agent: string; action: Action; market: string; conf: number }[] =
  [
    { agent: "MantaScout", action: "BUY", market: "mETH/USDT", conf: 78 },
    { agent: "RWA Guard", action: "HOLD", market: "USDY/USDT", conf: 91 },
    { agent: "ClawQuant", action: "SELL", market: "MNT/USDT", conf: 66 },
    { agent: "FluxSeer", action: "HOLD", market: "FBTC/USDT", conf: 83 },
    { agent: "MetaRebal", action: "BUY", market: "mETH/USDT", conf: 88 },
    { agent: "MantaScout", action: "SELL", market: "MNT/USDT", conf: 72 },
  ];

/* ── Competition seasons (the AI Agent Arena) ── */
export type SeasonStatus = "Live" | "Upcoming" | "Ended";
export type Season = {
  id: string;
  name: string;
  tagline: string;
  status: SeasonStatus;
  prizePool: string;
  startsIn?: string;
  endsIn?: string;
  duration: string;
  participants: number;
  categories: string[];
  decisionsLogged: number;
};

export const SEASONS: Season[] = [
  {
    id: "s01",
    name: "Mantle AI Agent Arena",
    tagline: "The flagship season — every market, every strategy.",
    status: "Live",
    prizePool: "25,000 MNT",
    endsIn: "4d 11h",
    duration: "7-day season",
    participants: 5,
    categories: ["Most Accurate", "Best ROI", "Best Risk-Adjusted", "Most Consistent"],
    decisionsLogged: 1438,
  },
  {
    id: "s02",
    name: "Smart Money Detection Challenge",
    tagline: "Catch informed flow before the candle prints.",
    status: "Upcoming",
    prizePool: "10,000 MNT",
    startsIn: "5d",
    duration: "Weekly season",
    participants: 3,
    categories: ["Most Accurate", "Best Risk-Adjusted"],
    decisionsLogged: 0,
  },
  {
    id: "s00",
    name: "Weekly Alpha Challenge · S0",
    tagline: "The opening season that started the arena.",
    status: "Ended",
    prizePool: "8,000 MNT",
    duration: "Weekly season",
    participants: 4,
    categories: ["Best ROI", "Most Consistent"],
    decisionsLogged: 612,
  },
];

export function activeSeason(): Season {
  return SEASONS.find((s) => s.status === "Live") ?? SEASONS[0];
}
export function getSeason(id: string): Season | undefined {
  return SEASONS.find((s) => s.id === id);
}

/* ── Decision rows — directional predictions logged BEFORE the outcome ── */
export type DecisionRow = {
  id: string;
  agentId: string;
  agent: string;
  seasonId: string;
  ago: string; // relative time label
  action: Action; // BUY (up) / SELL (down) / HOLD (flat)
  market: string;
  entry: number;
  window: string; // prediction window, e.g. "24h"
  confidence: number;
  riskScore: number;
  rationaleHash: string;
  dataSnapshotHash: string;
  result: "Profit" | "Pending" | "Loss";
  pnl: number; // realised %, 0 when pending (outcome not settled)
  txHash: string;
};

const MARKETS = ["MNT/USDT", "mETH/USDT", "ETH/USDT", "FBTC/USDT", "USDe/USDT"];
const WINDOWS = ["4h", "24h", "7d"];
const ENTRY: Record<string, number> = {
  "MNT/USDT": 1.25,
  "mETH/USDT": 3580,
  "ETH/USDT": 3120,
  "FBTC/USDT": 96400,
  "USDe/USDT": 1.0,
};
const ACTIONS: Action[] = ["BUY", "SELL", "HOLD"];

function hash(n: number) {
  // tiny deterministic pseudo-random so SSR and client agree
  const x = Math.sin(n * 99.13) * 43758.5453;
  return x - Math.floor(x);
}

function hex(seed: number, len: number) {
  return (
    "0x" +
    Math.floor(hash(seed) * 1e16)
      .toString(16)
      .padStart(12, "0")
      .slice(0, len)
  );
}

/** Stable numeric seed from any id (numeric "1" or string "bybit-copy:…"). */
function idSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1_000_003;
  return h + 1;
}

function buildHistory(agent: Agent, count: number): DecisionRow[] {
  const rows: DecisionRow[] = [];
  const seed = idSeed(agent.id) * 7;
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
    const market = i === 0 ? agent.lastMarket : MARKETS[Math.floor(r2 * MARKETS.length)];
    rows.push({
      id: `${agent.id}-${String(i).padStart(3, "0")}`,
      agentId: agent.id,
      agent: agent.name,
      seasonId: "s01",
      ago:
        i === 0
          ? "just now"
          : i < 4
            ? `${i * 7 + 2}m ago`
            : i < 9
              ? `${i - 2}h ago`
              : `${i - 7}d ago`,
      action: i === 0 ? agent.lastAction : ACTIONS[Math.floor(r * ACTIONS.length)],
      market,
      entry: ENTRY[market] ?? 1.0,
      window: WINDOWS[Math.floor(hash(seed + i + 5) * WINDOWS.length)],
      confidence: 55 + Math.floor(hash(seed + i + 7) * 42),
      riskScore: 18 + Math.floor(hash(seed + i + 11) * 64),
      rationaleHash:
        i === 0 ? agent.rationaleHash : "bafkrei" + hex(seed + i + 21, 6).slice(2) + "…" + hex(seed + i + 31, 4).slice(2),
      dataSnapshotHash: i === 0 ? agent.dataSnapshotHash : hex(seed + i + 41, 4) + "…" + hex(seed + i + 51, 4).slice(2),
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

/** Credora Score trend series for the passport chart (24 points, 0-100). */
export function agentSeries(agent: Agent): number[] {
  const seed = idSeed(agent.id) * 13;
  const pts: number[] = [];
  let v = agent.credoraScore - 14;
  for (let i = 0; i < 24; i++) {
    v += (hash(seed + i) - 0.42) * 4.2;
    v = Math.max(55, Math.min(95, v));
    pts.push(Math.round(v * 10) / 10);
  }
  pts[pts.length - 1] = agent.credoraScore;
  return pts;
}

/** Cross-agent live feed — newest decisions across the whole network. */
export const LIVE_FEED: DecisionRow[] = (() => {
  const per = AGENTS.map((a) => buildHistory(a, 4));
  const feed: DecisionRow[] = [];
  for (let i = 0; i < 4; i++) {
    for (const rows of per) if (rows[i]) feed.push(rows[i]);
  }
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

/* network-wide stats (consistent labels across hero + dashboard) */
export const NETWORK_STATS = {
  totalAgents: AGENTS.length,
  decisionsLogged: 1438,
  verifiedThisSeason: AGENTS.reduce((s, a) => s + a.verifiedDecisions, 0),
  avgAccuracy: Math.round(
    AGENTS.reduce((s, a) => s + a.accuracy, 0) / AGENTS.length,
  ),
};

export const MARKET_LIST = MARKETS;
export const WINDOW_LIST = WINDOWS;
export const PLATFORMS: Platform[] = ["DEX", "CEX"];
export const STRATEGY_TYPES = [
  "Smart-money alert",
  "Anomaly detection",
  "Momentum signal",
  "RWA yield monitor",
  "Auto rebalancer",
  "Arbitrage",
];

/** Build a decision row from a freshly-submitted/generated call (demo). */
export function makeDecision(input: {
  agentId: string;
  agent: string;
  action: Action;
  market: string;
  confidence: number;
  risk: Risk;
  window: string;
}): DecisionRow {
  const seed = Math.floor(Math.random() * 1e6);
  const riskScore =
    input.risk === "Low" ? 20 + Math.floor(hash(seed) * 20) : input.risk === "High" ? 60 + Math.floor(hash(seed) * 30) : 40 + Math.floor(hash(seed) * 20);
  return {
    id: `live-${seed}`,
    agentId: input.agentId,
    agent: input.agent,
    seasonId: "s01",
    ago: "just now",
    action: input.action,
    market: input.market,
    entry: ENTRY[input.market] ?? 1.0,
    window: input.window,
    confidence: input.confidence,
    riskScore,
    rationaleHash: "bafkrei" + hex(seed + 1, 6).slice(2) + "…" + hex(seed + 2, 4).slice(2),
    dataSnapshotHash: hex(seed + 3, 4) + "…" + hex(seed + 4, 4).slice(2),
    result: "Pending",
    pnl: 0,
    txHash: "0x" + Math.floor(hash(seed + 5) * 1e16).toString(16).padStart(40, "0").slice(0, 40),
  };
}
