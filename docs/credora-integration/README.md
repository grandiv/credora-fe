# Credora FE ↔ Backend ↔ Smart Contract — Integration Checklist

> How to incrementally wire **credora-fe** (this repo) to **Credora-Backend** and **Credora-Contract**.
> Work top-to-bottom. Each phase is independently shippable and keeps the mock fallback, so the demo never breaks mid-integration.

- **FE** — `github.com/grandiv/credora-fe` (Next.js 15, this repo). Single integration seam: `lib/contract.ts`.
- **Backend** — `../Credora-Backend` (Node ESM, Vercel serverless, **in-memory seeded data, no chain writes**). Local: `http://localhost:8787`. Routes under `/api/*`.
- **Contract** — `../Credora-Contract` (Foundry/Solidity 0.8.24, Mantle Sepolia). **Not deployed yet — no addresses.**

---

## ✅ STATUS (updated 2026-06-09)

| Phase | What | State |
| --- | --- | --- |
| 0 | Seam split (`READ_SOURCE`/`WRITE_SOURCE`) + adapters | ✅ **Done** |
| 1 | Reads from Backend API (dashboard, agents, passport, seasons, proof) | ✅ **Done & e2e-tested** |
| 2 | "Run demo agent" → backend `POST /api/agents/run` | ✅ **Done & e2e-tested** |
| 3 | Wallet + Mantle Sepolia | 🟡 **Partial** — `viem` + ABIs + chain calls coded; **no RainbowKit/wallet connector yet** (still mock wallet) |
| 4–6 | Writes: register / join / submit decision | 🟡 **Coded, gated, UNTESTED** — blocked on contract deploy (no addresses) |
| 7 | Outcome/score read-through | ✅ basics done (proof modal shows outcome); rest pending writes |
| 8 | Verify + deploy | 🟡 verified locally (`test/full-check.mjs`, 0 errors both modes); **not deployed** |

**Reads are live.** Flip `NEXT_PUBLIC_READ_SOURCE=api` and the sidebar shows **"Reads: Backend API · live"**. Writes stay **mock** until the SC dev deploys + shares addresses.
**Blockers:** SC deployment (addresses) for writes · BE confirmations (score formula, winRate, deployed URL). See `CONTEXT_FOR_BE_SC.md`.

---

## 0. Architecture: who owns what

```
                ┌──────────────── credora-fe (Next.js) ────────────────┐
                │  lib/contract.ts  ← the ONLY integration seam         │
                └───────┬───────────────────────────────┬──────────────┘
            READS       │                                │     WRITES
        (no wallet)     ▼                                ▼  (needs wallet)
        ┌──────────── Credora-Backend ─────────┐   ┌──── Credora-Contract (Mantle) ────┐
        │ GET /api/leaderboard  (Credora Score)│   │ AgentPassport.registerAgent()     │
        │ GET /api/agents                       │   │ SeasonManager.joinSeason()        │
        │ GET /api/season/current               │   │ DecisionLogger.submitDecision()   │
        │ GET /api/decisions /outcomes          │   │ (read-back via getAgentDecisions) │
        │ GET /api/proof/:decisionId            │   └───────────────┬───────────────────┘
        │ POST /api/agents/run (demo simulate)  │                   │ events
        └──────────────────────┬────────────────┘                  ▼
                               │  backend is the indexer/scorer:  reads chain events,
                               └─ computes Credora Score, submits Outcome + Season score
                                  (OutcomeRegistry / ReputationEngine — backend-signer only)
```

**Rule of thumb**
- **Reads** (leaderboard, agents, season, decisions, proof) → **Backend API**. The backend aggregates and computes the score; the FE should never recompute it.
- **Writes that need the user** (register agent, join season, submit decision) → **directly to the contracts via the user's wallet**. The backend has no write endpoints for these.
- **Outcome grading + final score/rank** → **backend-only** (contracts gate these to an authorized submitter). Not the FE's concern.
- **"Run demo agent"** → `POST /api/agents/run` (server-side simulation, no wallet). Keep this for the demo even after real writes exist.

---

## 1. ⚠️ Discrepancies to resolve FIRST (decisions needed)

These mismatches exist **today** between the three repos. Lock each before wiring, or reads will look wrong.

| # | Topic | FE (now) | Backend | Contract | Decision |
| - | ----- | -------- | ------- | -------- | -------- |
| D1 | **Action vocab** | `BUY / SELL / HOLD` | `LONG / SHORT / HOLD / ALERT` | enum `Long/Short/Hold/Alert` | Keep **BUY/SELL/HOLD** as the FE label; **map at the seam**: `BUY↔LONG`, `SELL↔SHORT`, `HOLD↔HOLD`. Decide how to show **ALERT** (backend's GuardRail emits it) → render a read-only "ALERT" badge, or map ALERT→HOLD. **Pick one.** |
| D2 | **Credora Score weights** | docs say 30/25/20/15/10 (5-part) | code: **35/25/20/20** (4-part, no "verified decisions") | `ReputationEngine` stores a final score, doesn't compute weights | Backend is the source of truth for the live number. **Align the docs + `SCORE_WEIGHTS` to 35/25/20/20**, or have backend add the 5th component. Until then, FE must **display the backend's number**, not its own. |
| D3 | **Agents** | MantaScout, RWA Guard, ClawQuant, FluxSeer, MetaRebal (`id "0001"`) | MNTScout, DeltaMind, GuardRail (`id "1"`) | numeric `agentId` (uint256) | Once wired, **FE renders whatever the backend/chain returns** (3 agents). Drop the hard-coded 5 from display (keep as mock fallback only). |
| D4 | **Season id** | `"s01"` | `"season-1"` | numeric `seasonId` (uint256) | Normalize: backend/chain id is canonical; FE treats season id as an opaque string. Build links from the returned id. |
| D5 | **Market** | `"MNT/USDT"` string | `"MNT/USDT"` string | `bytes32 marketHash` | Reads = plain string (from backend). Writes = **hash it** (`keccak256(toBytes("MNT/USDT"))`) before calling `submitDecision`. Keep a market↔hash map. |
| D6 | **ROI units** | `roi` as percent (e.g. `12.4`) | `roiPct` (percent) + `roiBps` on outcomes | `int256 roiBps` | FE consumes `roiPct` from backend. For chain reads, divide bps by 100. |
| D7 | **Score scale** | `credoraScore` 0–100 | `credoraScore` 0–100 | `finalScore` ≤ 10000 (basis points) | FE stays 0–100; divide chain `finalScore` by 100 if ever read directly. |
| D8 | **Risk profile** | `"Low"/"Medium"/"High"` | `"low"/"medium"/"high"` | not stored on passport | Lowercase at the seam when sending; title-case for display. |

> **Status (2026-06-09):** D1/D3/D4/D5/D6/D8 are **handled in code** (`lib/backend.ts` adapters + `lib/chain.ts`). **D2 (score formula) is still open** — needs the BE dev to confirm 35/25/20/20 vs 30/25/20/15/10 (see `CONTEXT_FOR_BE_SC.md` BE-2). **D1's ALERT display** decision: we map ALERT→HOLD for now.

---

## 2. Prerequisites (blockers — track these)

- [ ] **Contract**: deploy all 5 to **Mantle Sepolia** (`forge script script/Deploy.s.sol --broadcast --rpc-url $MANTLE_RPC`). Capture the 5 addresses + chainId **5003**.
- [ ] **Contract**: verify on Mantle Explorer (Deployment Award requirement).
- [ ] **Contract**: export ABIs — `forge build` produces `out/<Name>.sol/<Name>.json`. Decide how the FE gets them (copy the `abi` arrays into `lib/abi/*.ts`, or publish a small `@credora/abi` package).
- [ ] **Backend**: confirm the deployed Vercel URL (e.g. `https://credora-backend.vercel.app`) and that **CORS allows the FE origin** (currently no CORS headers are set — see Phase 1).
- [ ] **Backend**: decide whether `/api/agents/run` should also **write the decision on-chain** (today it only simulates in memory). If yes, that's a backend task; if no, the FE writes via `DecisionLogger` and the backend indexes the event.
- [ ] **Decide the operator model**: `DecisionLogger.submitDecision` requires `passport.isAuthorizedOperator(agentId, msg.sender)` → the caller must be the agent **owner or operator**. For the demo, set the connected wallet as both owner and operator at registration time.

---

## 3. Environment variables

Add to `.env.local` (and Vercel project env). All are `NEXT_PUBLIC_` because they're read client-side.

```bash
# Backend API (reads + run-demo)
NEXT_PUBLIC_CREDORA_API=https://credora-backend.vercel.app   # local: http://localhost:8787

# Mantle Sepolia
NEXT_PUBLIC_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
NEXT_PUBLIC_MANTLE_CHAIN_ID=5003

# Deployed contract addresses (fill after Phase-2 deploy)
NEXT_PUBLIC_AGENT_PASSPORT=
NEXT_PUBLIC_SEASON_MANAGER=
NEXT_PUBLIC_DECISION_LOGGER=
NEXT_PUBLIC_OUTCOME_REGISTRY=
NEXT_PUBLIC_REPUTATION_ENGINE=

# Feature flags — flip phases independently (see Phase 0)
NEXT_PUBLIC_READ_SOURCE=mock      # mock | api
NEXT_PUBLIC_WRITE_SOURCE=mock     # mock | chain
```

- [x] Update `.env.example` with the keys above.
- [x] `lib/contract.ts` `CONTRACTS`/`MANTLE` read the new keys (`AGENT_PASSPORT`, `SEASON_MANAGER`, `DECISION_LOGGER`, `OUTCOME_REGISTRY`, `REPUTATION_ENGINE`).

---

## Phase 0 — Seam refactor: split read vs write sources

Today `lib/contract.ts` has a single `DATA_SOURCE: "mock" | "onchain"`. Reads come from the backend and writes go to the chain — **they integrate at different times**, so split them.

- [x] Replace `DATA_SOURCE` with two flags: `READ_SOURCE` (`mock | api`) and `WRITE_SOURCE` (`mock | chain`), from env above.
- [x] Add a tiny `apiGet(path)` helper (fetch `NEXT_PUBLIC_CREDORA_API + path`, throw on non-2xx).
- [x] Add mapping helpers in `lib/contract.ts` (or `lib/adapters.ts`): `actionFeToChain` / `actionChainToFe` (D1), `marketToHash` (D5), `riskToLc`/`riskToTitle` (D8), `bpsToPct` (D6/D7).
- [x] Add `mapBackendAgent → Agent`, `mapBackendDecision → DecisionRow`, `mapBackendLeaderboardRow → Agent` adapters so pages keep their existing types unchanged.
- [x] **Acceptance:** with both flags `mock`, the app is byte-for-byte identical to now. Build + `test/verify-batch.mjs` still green.

---

## Phase 1 — READS from the Backend API  *(no wallet, biggest visible win)*

Flip `NEXT_PUBLIC_READ_SOURCE=api`. Each read function in `lib/contract.ts` calls the backend, maps, and falls back to mock on error.

- [x] **CORS**: backend must return `Access-Control-Allow-Origin` for the FE origin. Either add headers in `Credora-Backend/api/[...route].js` (`res.setHeader("Access-Control-Allow-Origin", "*")` + handle `OPTIONS`) **or** proxy through a Next route handler `app/api/credora/[...path]/route.ts` (avoids CORS entirely, keeps the API base server-side). **Recommended: Next proxy.**
- [x] `fetchSeasons()` / `fetchSeason(id)` → `GET /api/season/current` (backend exposes the active season; wrap as a 1-element list for the Seasons page). Map `season-1`→display.
- [x] `fetchAgents()` → `GET /api/leaderboard` (returns `{ season, leaderboard: [...] }` with `accuracy/roiPct/credoraScore/rank`). Map rows → `Agent`. *Note: backend `/api/agents` lacks scores; `/api/leaderboard` is the richer source.*
- [x] `fetchAgent(id)` → from the leaderboard list (no single-agent endpoint yet) + `GET /api/decisions` filtered by `agentId`. (Optional: ask backend for `GET /api/agents/:id`.)
- [x] `fetchAgentHistory(agent)` → `GET /api/decisions` filtered by `agentId`; join `GET /api/outcomes` for result/pnl. Map → `DecisionRow[]`.
- [x] `fetchLiveFeed()` → `GET /api/decisions` (newest first), join outcomes.
- [x] **Proof modal** → `GET /api/proof/:decisionId` returns `{ agent, decision, outcome, proof:{ dataHash, rationaleHash, txHash, explorerUrl } }`. Wire `DecisionModal` to fetch this on open (replace the locally-shaped fields). Use the real `txHash`/`explorerUrl` once on-chain.
- [x] Handle the **score discrepancy (D2)**: render the backend's `credoraScore` verbatim; if you keep the 5-bar breakdown, either hide bars the backend doesn't provide or have backend return the component scores.
- [x] **Acceptance:** dashboard, leaderboard, agent passport, seasons, proof modal all show **backend data**; killing the backend falls back to mock with no crash. `axe` still 0 violations; `test/verify-batch.mjs` green.

---

## Phase 2 — "Run demo agent" → Backend  *(still no wallet)*

- [x] `/app/submit` "Run demo agent" → `POST /api/agents/run` with `{ agentId, market }`. Response `{ decision, outcome, leaderboard }`.
- [x] Map the returned `decision` into the session store (`components/app/session.tsx`) so it appears as **NEW** on the dashboard feed (already wired for mock — just feed the real object through the adapter).
- [x] Map backend `action` (LONG/SHORT/HOLD/ALERT) → FE badge per D1.
- [x] **Acceptance:** clicking "Run demo agent" produces a real backend decision + updated leaderboard; the NEW row links to a real `/api/proof/:id`.

---

## Phase 3 — Wallet + Mantle Sepolia  *(foundation for all writes)*

- [x] `viem` installed. _(Skipped wagmi/RainbowKit for now — using the injected `window.ethereum` provider directly in `lib/chain.ts`; the mock wallet still drives the UI.)_
- [ ] Define the Mantle Sepolia chain (id `5003`, rpc, explorer `https://explorer.sepolia.mantle.xyz`).
- [ ] Wrap `app/app/layout.tsx` with `WagmiProvider` + `RainbowKitProvider` (alongside the existing `SessionProvider`).
- [ ] Replace the **mock** `components/app/wallet.tsx` with a real connector — **keep the same `useWallet()` API** (`address`, `connecting`, `connect`, `disconnect`) so no page changes. Gate on `WRITE_SOURCE`: `mock`→fake address, `chain`→RainbowKit.
- [x] ABIs added (`lib/abi.ts`) + `viem` installed + chain calls written (`lib/chain.ts`). _(Used hand-written ABIs + injected provider instead of a `lib/contracts.ts` factory.)_
- [ ] **Acceptance:** "Connect Wallet" opens RainbowKit, connects on Mantle Sepolia (prompts network add/switch), shows the real address. Reads still work; nothing else changes.

---

## Phase 4 — WRITE: Register agent  *(`AgentPassport.registerAgent`)*

- [ ] `registerAgent()` in the seam → `writeContract(AgentPassport, "registerAgent", [name, strategyType, metadataURI, operator, strategyHash])`.
  - `operator` = connected address (so it can later submit decisions). `strategyHash` = `keccak256` of the strategy text. `metadataURI` = `""` or an IPFS/backend URL.
- [ ] Wire the success screen in `/app/register` to the **real tx hash** + `AgentRegistered` event's `agentId` (parse from the receipt logs).
- [ ] Persist the new `agentId` (session store) so subsequent join/submit can use it.
- [ ] **Acceptance:** completing Register mints a passport on Mantle Sepolia; the success screen links to the real explorer tx; the agent appears (after the backend indexes it, or via direct `tokenURI`/`ownerOf` read).

---

## Phase 5 — WRITE: Join season  *(`SeasonManager.joinSeason`)*

- [ ] `joinSeason(seasonId, agentId)` → `writeContract(SeasonManager, "joinSeason", [seasonId, agentId])`.
- [ ] On the Season detail page, the existing "Join season" picker calls this; show pending → confirmed with the real tx; read back `getSeasonAgents(seasonId)` to confirm membership.
- [ ] Handle reverts: `UNKNOWN_SEASON`, `SEASON_CLOSED`, `ALREADY_JOINED` → friendly toasts.
- [ ] **Note:** `createSeason` is `onlyOwner` (backend/admin), **not** a FE action. The FE only joins.
- [ ] **Acceptance:** joining writes on-chain; the "✓ joined" state reflects `getSeasonAgents`, not just local state.

---

## Phase 6 — WRITE: Submit decision  *(`DecisionLogger.submitDecision`)*

The core proof action. Caller must be the agent owner/operator (`isAuthorizedOperator`).

- [ ] `/app/submit` → `writeContract(DecisionLogger, "submitDecision", [agentId, seasonId, marketHash, action, confidence, riskScore, targetWindowSeconds, dataHash, rationaleHash, evidenceURI])`.
  - `marketHash` = `keccak256(toBytes(market))` (D5). `action` = FE→chain enum index (`Long=0,Short=1,Hold=2,Alert=3`) per D1.
  - `confidence`/`riskScore` = `uint16` 0–100. `targetWindowSeconds` = window → seconds (`24h`→86400).
  - `dataHash`/`rationaleHash` = `bytes32` (reuse the hashes the backend already produces, or compute client-side). `evidenceURI` = `""`/IPFS.
- [ ] Pre-check `isAuthorizedOperator(agentId, address)`; if false, prompt to use the owning wallet.
- [ ] Success screen → real tx hash; the decision shows as NEW on the dashboard (read back via `getAgentDecisions` or backend index).
- [ ] **Acceptance:** a submitted decision is on-chain **before** any outcome; the proof modal shows the real `dataHash`/`rationaleHash`/`txHash` from the chain/backend.

---

## Phase 7 — Outcome & final score (read-only on FE)

Backend computes and submits these (`OutcomeRegistry.submitOutcome`, `ReputationEngine.submitSeasonScore/Rank` — both gated to the backend signer). FE only **reads** them.

- [ ] Proof modal "Result" → from `GET /api/proof/:id` `outcome.status` + `roiBps` (already returned). Pending until the window closes.
- [ ] Leaderboard `credoraScore`/`rank` → already from `/api/leaderboard` (Phase 1).
- [ ] (Optional) Direct chain read fallback: `OutcomeRegistry.getDecisionOutcome`, `ReputationEngine.getSeasonScore`.
- [ ] **Acceptance:** a decision moves Pending → Profit/Loss after the window, reflected in the modal and leaderboard, with no FE write.

---

## Phase 8 — Verify, harden, ship

- [ ] Update `test/verify-batch.mjs` + `test/e2e.mjs` to run against `READ_SOURCE=api` (point at a running backend) in addition to mock.
- [ ] Re-run `axe` (target: still 0 WCAG violations) and Lighthouse.
- [ ] Loading/empty/error states for every API call (skeletons already exist for some — extend).
- [ ] Set all env vars in the **Vercel** project; deploy; smoke-test prod against the deployed backend + Mantle Sepolia.
- [ ] Update `DESIGN_GUIDELINE.md` demo flow if any screen text changed; regenerate `Credora-User-Journey.pdf`.
- [ ] Tag a release / note the deployed contract addresses in this doc.

---

## Quick reference — endpoint & contract map

**Backend (read)** — base `NEXT_PUBLIC_CREDORA_API`
| FE need | Endpoint | Shape |
| --- | --- | --- |
| Active season | `GET /api/season/current` | `{ id, name, marketScope, startTime, endTime, status }` |
| Leaderboard (scored agents) | `GET /api/leaderboard` | `{ season, leaderboard: SeasonScore[] }` |
| Agents (no scores) | `GET /api/agents` | `{ agents: Agent[] }` |
| Decisions | `GET /api/decisions` | `{ decisions: Decision[] }` |
| Outcomes | `GET /api/outcomes` | `{ outcomes: Outcome[] }` |
| Proof | `GET /api/proof/:decisionId` | `{ agent, decision, outcome, proof }` |
| Run demo agent | `POST /api/agents/run` `{agentId, market}` | `{ decision, outcome, leaderboard }` |
| Health | `GET /api/health` | `{ ok, service, season }` |

**Contract (write, via wallet)** — addresses from env
| FE action | Contract.method | Notes |
| --- | --- | --- |
| Register agent | `AgentPassport.registerAgent(name, strategyType, metadataURI, operator, strategyHash)` → `agentId` | operator = caller; emits `AgentRegistered` |
| Join season | `SeasonManager.joinSeason(seasonId, agentId)` | reverts: UNKNOWN/CLOSED/ALREADY_JOINED |
| Submit decision | `DecisionLogger.submitDecision(agentId, seasonId, marketHash, action, confidence, riskScore, targetWindowSeconds, dataHash, rationaleHash, evidenceURI)` → `decisionId` | needs `isAuthorizedOperator`; enum `Long/Short/Hold/Alert` |
| (admin) Create season | `SeasonManager.createSeason(...)` | `onlyOwner` — **not** a FE action |
| (backend) Submit outcome | `OutcomeRegistry.submitOutcome(...)` | `onlyOutcomeSubmitter` — backend |
| (backend) Submit score/rank | `ReputationEngine.submitSeasonScore/Rank(...)` | `onlyScoreSubmitter` — backend |

---

## Suggested order (smallest risk → most value)

1. **Phase 0** seam split (no behavior change).
2. **Phase 1** reads from backend ← *do this first; biggest visible payoff, no wallet.*
3. **Phase 2** run-demo from backend.
4. **Phase 3** real wallet + Mantle Sepolia.
5. **Phase 4–6** writes: register → join → submit.
6. **Phase 7** outcomes/score read-through.
7. **Phase 8** verify + deploy.

You can stop after **Phase 2** and already have a fully backend-driven demo (no wallet) — a strong fallback if contract deployment slips.
