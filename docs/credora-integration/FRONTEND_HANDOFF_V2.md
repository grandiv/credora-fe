# Credora Frontend Handoff — v2.2 (Live)

Last updated: 2026-06-10

## 1. Backend Base URL

```txt
Local:   http://127.0.0.1:8787
Vercel:  https://credora-backend.vercel.app
```

All endpoints under `/api`.

---

## 2. System Status

### GET /api/status

```json
{
  "ok": true,
  "season": "season-1",
  "database": "memory",
  "livePrices": true,
  "chainIndexer": true,
  "bridgeActive": true,
  "bridgeDataMode": "simulated",
  "chainId": 5003,
  "mantleExplorer": "https://explorer.sepolia.mantle.xyz",
  "contracts": {
    "agentPassport": "0x40A9cB62D2a02189be10eC4657ae02B2c235174e",
    "decisionLogger": "0x2dFf6D5eB709b368df0c11bd80209eB92591658c",
    "outcomeRegistry": "0x67479A2F63ecAc78fb52D696df7D7455e2347983",
    "reputationEngine": "0xc84D1e8FECaDa44487242E5D855AEE7F752A12EA"
  }
}
```

| Flag | Meaning |
|---|---|
| `livePrices` | Real prices from CoinGecko (MNT, mETH, USDY) |
| `chainIndexer` | Listening to Mantle Sepolia contract events |
| `bridgeActive` | Auto-importing strategy accounts |
| `bridgeDataMode` | `simulated` or `live_api` (auto-switches when Bybit accessible) |
| `database` | `mongodb` or `memory` fallback |

---

## 3. API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/status` | System status + contract addresses |
| `GET` | `/api/health` | Service health, season, DB mode |
| `GET` | `/api/stream/leaderboard` | SSE real-time leaderboard stream |
| `GET` | `/api/season/current` | Current season details |
| `GET` | `/api/agents` | Demo agents + on-chain indexed agents |
| `GET` | `/api/decisions` | All decisions (demo + indexed from chain) |
| `GET` | `/api/outcomes` | All outcomes (demo + indexed from chain) |
| `GET` | `/api/leaderboard` | Full leaderboard (demo + strategy accounts) |
| `GET` | `/api/proof/:decisionId` | Proof page with real tx hashes |
| `GET` | `/api/sources` | Supported import source adapters |
| `GET` | `/api/strategy-accounts` | Imported + bridge-live strategy accounts |
| `GET` | `/api/strategy-accounts/:id/proof` | Proof for imported account |
| `POST` | `/api/strategy-accounts/import` | Manual track record import |
| `POST` | `/api/agents/run` | Run agent → full on-chain write in background |
| `GET` | `/.well-known/credora-agent.json` | Service discovery |

---

## 4. SSE Real-Time Stream

### GET /api/stream/leaderboard

Server-Sent Events. Leaderboard pushed every 5s.

```
GET /api/stream/leaderboard
```

Event format:
```
data: {"leaderboard":[...],"timestamp":1781074000000}
```

```js
const es = new EventSource("http://127.0.0.1:8787/api/stream/leaderboard");
es.onmessage = (e) => {
  const { leaderboard } = JSON.parse(e.data);
  updateUI(leaderboard);
};
```

---

## 5. POST /api/agents/run — Full On-Chain Flow

Response is instant. All 5 contract writes happen in background (~40s):

| Step | Contract | Latency |
|---|---|---|
| 1 | Run agent (live CoinGecko price) | instant |
| 2 | Return response | instant |
| 3 | AgentPassport.registerAgent (if new) | ~10s |
| 4 | DecisionLogger.submitDecision | ~10s |
| 5 | OutcomeRegistry.submitOutcome | ~10s |
| 6 | ReputationEngine.submitSeasonScore + submitSeasonRank | ~20s |

Response shape:
```json
{
  "decision": {
    "id": "1-MNT/USDT-...",
    "action": "HOLD",
    "entryPrice": 0.534,
    "confidence": 69,
    "onChainTxHash": "0x10a23c...",
    "onChainExplorerUrl": "https://explorer.sepolia.mantle.xyz/tx/0x10a23c...",
    "onChainDecisionId": 2
  },
  "outcome": {
    "status": "success",
    "roiBps": 0,
    "onChainTxHash": "0xbc1e0f3..."
  },
  "leaderboard": [...]
}
```

`onChainTxHash` / `onChainExplorerUrl` appear when background tx confirms. Poll `/api/proof/:decisionId` or watch SSE.

---

## 6. Proof Page

### GET /api/proof/:decisionId

```json
{
  "agent": { "id": "1", "name": "MNTScout" },
  "decision": {
    "action": "HOLD",
    "entryPrice": 0.534,
    "confidence": 69,
    "onChainTxHash": "0x10a23c...",
    "onChainExplorerUrl": "https://explorer.sepolia.mantle.xyz/tx/0x10a23c..."
  },
  "outcome": {
    "status": "success",
    "onChainTxHash": "0xbc1e0f3..."
  },
  "proof": {
    "dataHash": "0x...",
    "rationaleHash": "0x...",
    "metricsHash": "0x...",
    "decisionTxHash": "0x10a23c...",
    "outcomeTxHash": "0xbc1e0f3...",
    "txHash": "0xbc1e0f3...",
    "explorerUrl": "https://explorer.sepolia.mantle.xyz/tx/0xbc1e0f3..."
  }
}
```

Proof page should show: agent name, market, action, confidence, risk score, rationale, outcome status, ROI, all hashes, decision tx hash, outcome tx hash, explorer link.

---

## 7. Data Flow

```
CoinGecko (60s) ──→ live prices ──→ agent strategy (POST /run)
                                         │
Mantle contracts ←── registerAgent (if new)
                     submitDecision          (background, ~40s total)
                     submitOutcome
                     submitSeasonScore
                     submitSeasonRank
                                         │
Mantle events ──→ indexer (15s) ──→ indexed into GET endpoints
                                         │
Bridge (5min) ──→ Bybit/Nansen/Mantle Live ──→ leaderboard
                                         │
SSE (5s) ──→ push to all connected clients
```

---

## 8. Page Mapping

| Page | Endpoints |
|---|---|
| **Dashboard** | `/api/status`, `/api/season/current`, `/api/leaderboard`, `/api/decisions` |
| **Leaderboard** | `/api/leaderboard`, `/api/stream/leaderboard` (SSE), `/api/sources` |
| **Agent Profile** | `/api/agents`, `/api/decisions`, `/api/outcomes`, `/api/leaderboard` |
| **Proof Page** | `/api/proof/:decisionId`, `/api/strategy-accounts/:id/proof` |
| **Demo Controls** | `POST /api/agents/run`, `POST /api/strategy-accounts/import` |

---

## 9. Contracts (Mantle Sepolia, Chain ID 5003)

| Contract | Address | Purpose |
|---|---|---|
| AgentPassport | `0x40A9cB62D2a02189be10eC4657ae02B2c235174e` | Register AI agent identity |
| SeasonManager | `0xC425c96B30BF8a9190E7A273D990a6a8B6F49C3b` | Create/manage seasons |
| DecisionLogger | `0x2dFf6D5eB709b368df0c11bd80209eB92591658c` | Decision proof on-chain |
| OutcomeRegistry | `0x67479A2F63ecAc78fb52D696df7D7455e2347983` | Outcome tracking on-chain |
| ReputationEngine | `0xc84D1e8FECaDa44487242E5D855AEE7F752A12EA` | Season score + rank storage |

All verified on Sourcify (`exact_match`).

---

## 10. Enums

| Action | Contract | Color |
|---|---|---|
| `LONG` | 0 | Green |
| `SHORT` | 1 | Red |
| `HOLD` | 2 | Gray |
| `ALERT` | 3 | Amber |

| Outcome | Contract | Display |
|---|---|---|
| `success` | 1 | Green chip |
| `failed` | 2 | Red chip |
| `neutral` | 3 | Gray chip |
| `inconclusive` | 4 | Yellow chip |

| Entry Type | Source |
|---|---|
| `demo_agent` | MNTScout, DeltaMind, GuardRail |
| `observed_strategy_account` | Bybit, Nansen imported |
| `verified_agent` | On-chain Mantle DEX agents |

---

## 11. Limitations

- MongoDB optional (memory fallback works)
- One season (`season-1`)
- Bridge uses simulated data unless deployed to non-geoblocked region (auto-switches)
- CoinGecko free tier (rate-limited)
