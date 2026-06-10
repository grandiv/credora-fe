# Context for Backend & Smart-Contract devs

> From the **credora-fe** team. We wired the FE to your repos (reads → Backend, writes → Contracts). Each item says *why*, *what we did to cope*, and *the ask*.
>
> FE integration points: `lib/contract.ts` (seam), `lib/backend.ts` (adapters), `app/api/credora/[...path]/route.ts` (proxy). Reads are **live & tested** (against the local backend). Contracts are **deployed & verified** on Mantle Sepolia (addresses wired in FE env).

---

## ✅ Status 2026-06-11 — V2 deployed, reads live; one on-chain gap

`https://credora-backend.vercel.app` is **UP and running V2** (`/api/health` → `version: 2.2-debug`, `/api/status` returns the chain/contract flags, 8 leaderboard entries incl. strategy accounts). **The FE is live-integrated against it — full regression (`test/full-check.mjs`) = 14/14 flows, 0 console errors.** (Earlier 2026-06-10 the deploy was 500ing on every endpoint — now resolved.)

### 🔶 BE gap — on-chain writes aren't anchoring (proof tx stays placeholder)
The V2 handoff (§5) says `POST /api/agents/run` triggers background on-chain writes (~40s) and `proof.txHash` becomes a real Mantle tx. **Tested: it doesn't.** Ran agent 2, polled `/api/proof/:id` for 70s — `proof.txHash` stayed `0xDemoTxHashReplaceAfterMantleDeploy`, `decisionTxHash`/`outcomeTxHash` `null`. `/api/status` shows `chainIndexer: true` but also `livePrices: false`, `bridgeDataMode: "check_api_status_flag"` — so some V2 subsystems are degraded.
- **Likely cause:** the on-chain writer's **signer private key / funded Mantle Sepolia wallet isn't configured in Vercel env**, so `submitDecision` never fires (or fails silently) and the proof keeps the placeholder.
- **Ask:** confirm the backend signer env (private key + RPC) is set on Vercel; check function logs for a write error; then a fresh `/api/agents/run` decision's `/api/proof/:id` should return a real 64-hex `txHash` + `decisionTxHash`. The one **seeded** decision from deploy (`0xabf8c2bf…`) is real on-chain, but the API doesn't surface it for the demo decisions.
- **FE side:** already handles both — proof modal **deep-links** to `…/tx/<hash>` on a real 64-hex hash, else **opens explorer home**. `mapDecision` carries `onChainTxHash`. **Zero FE change needed** once the backend returns real tx.

### Optional V2 bits not wired on the FE (by choice)
- SSE `GET /api/stream/leaderboard` — we fetch on load instead (could add for true real-time).
- `/api/status` richer flags — we use `/api/health` for the status indicator.
- **Strategy-account import flow** (`POST /api/strategy-accounts/import` + `/api/sources`) — imported accounts already render on the leaderboard (string ids handled), but there's no dedicated import page/profile yet.

---

## A. For the Smart-Contract dev

### SC-1 — Deploy to Mantle Sepolia + share addresses  ⛔ blocker for writes
We can't test or enable any on-chain write (register / join / submit decision) without deployed addresses.
- **Ask:** run `forge script script/Deploy.s.sol --broadcast --rpc-url <mantle-sepolia>`; share the 5 deployed addresses (AgentPassport, SeasonManager, DecisionLogger, OutcomeRegistry, ReputationEngine) and confirm chainId **5003**. Verify on Mantle Explorer (Deployment Award needs this).
- **What we did:** FE write code (`lib/chain.ts`) is complete and gated; it throws a clear "address not set" until you provide them. We set them via `NEXT_PUBLIC_*` env.

### SC-2 — `DeployScript` doesn't wire authorizations
`Deploy.s.sol` deploys the 5 contracts but **never grants the cross-contract permissions** the flow needs:
- `OutcomeRegistry.setOutcomeSubmitter(backendSigner, true)`
- `ReputationEngine.setScoreSubmitter(backendSigner, true)`
- (and the backend signer address must be known at deploy time)
- **Ask:** in the deploy script, after construction, grant those roles to the **backend's signer address** so the backend can submit outcomes/scores. Otherwise season grading can't be written on-chain.

### SC-3 — `createSeason` is `onlyOwner` — who calls it, and what's the seasonId?
The FE only **joins** seasons; it never creates them. But the demo needs at least one season to exist on-chain with a known numeric id.
- **Ask:** confirm the **deploy script (or backend) creates "Mantle AI Alpha Challenge" as seasonId `1`** so `joinSeason(1, agentId)` works. Tell us the numeric id; the backend currently calls it `"season-1"` (string) and the FE shows `"s01"` — we normalize, but we need the on-chain numeric id.

### SC-4 — Action enum vs FE/Backend vocab (FYI, we adapt)
Contract `DecisionLogger.Action = {Long, Short, Hold, Alert}`. The FE uses **BUY/SELL/HOLD** (product decision). We map at the seam: `BUY→Long(0)`, `SELL→Short(1)`, `HOLD→Hold(2)`. We never emit `Alert` from the FE.
- **Ask:** none required — just confirm `Long=0, Short=1, Hold=2, Alert=3` ordering is final (we hard-coded the indices).

### SC-5 — No deployed-ABI artifact for the FE
We hand-wrote minimal ABIs (`lib/abi.ts`) for `registerAgent`, `joinSeason`, `submitDecision` from your `.sol`.
- **Ask (nice-to-have):** after deploy, share `out/*.json` (forge build artifacts) or commit them, so we can replace hand-written ABIs with the canonical ones.

---

## B. For the Backend dev

> Reads are wired and working. These asks make the data richer / fully match the FE's UI. The FE fills sensible defaults today (noted per item).

### BE-1 — Leaderboard rows are missing fields the passport UI shows
`GET /api/leaderboard` returns `{ agentId, agentName, decisions, accuracy, roiPct, consistency, avgRisk, credoraScore, rank }`. The FE Agent card/passport also shows **winRate, badges, strategyType, platform, supportedMarkets, risk profile**. We currently join `/api/agents` for strategy/platform/markets/risk, and **fall back `winRate = accuracy`** and `badges = []`.
- **Ask (priority):** add **`winRate`** to each leaderboard row (we want to show win rate *and* accuracy — they're different). Optionally `badges: string[]` (e.g. `["Most Accurate"]`) and the per-component **score breakdown** (see BE-3).

### BE-2 — Credora Score weights mismatch (35/25/20/20 vs docs' 30/25/20/15/10)
`runtime/credora.mjs` computes `credoraScore = accuracy*0.35 + roi*0.25 + consistency*0.2 + risk*0.2` — a **4-component** score. Our product spec / pitch deck use **5 components: Accuracy 30 / ROI 25 / Consistency 20 / Risk 15 / Verified Decisions 10**.
- **Ask:** pick ONE and we'll match it everywhere. If you adopt the 5-component formula, add **Verified Decisions (10%)** and reweight Risk to 15%. If you keep 35/25/20/20, we'll update our docs + the passport "Score breakdown" labels to match. **The backend number is the source of truth — please confirm the formula.**

### BE-3 — Expose the score components for the breakdown bars
The passport shows a 5-bar "Score breakdown". The backend returns only the final `credoraScore`, so we currently **derive** the bars from `accuracy/roiPct/avgRisk/decisions` (approximate).
- **Ask (nice-to-have):** return the component sub-scores per agent, e.g. `scoreBreakdown: { accuracy, roi, consistency, riskMgmt, verification }` (each 0–100). Then the bars are exact.

### BE-4 — No per-agent or per-season detail endpoints
We build the agent passport by fetching `/leaderboard` + `/agents` + `/decisions` and filtering client-side. Works, but chatty.
- **Ask (nice-to-have):** `GET /api/agents/:id` (agent + its score) and `GET /api/seasons` (list) + `GET /api/seasons/:id` (detail with standings). Today there's only `/season/current` (single active season), so the FE Seasons list shows exactly one season.

### BE-5 — Decisions have no settled result on the decision object
`GET /api/decisions` items don't carry their outcome; we join `GET /api/outcomes` by `decisionId` to get `status`/`roiBps`. Fine, but a `resultStatus` on the decision (or an `/api/decisions?withOutcome=1`) would simplify.
- **Ask (nice-to-have):** optional — include the resolved `status`/`roiBps` inline, or keep as-is (we already join).

### BE-6 — `proof.txHash` is a placeholder
`GET /api/proof/:id` returns `txHash: "0xDemoTxHashReplaceAfterMantleDeploy"` and a generic `explorerUrl`. The FE proof modal already reads `proof.txHash`/`proof.explorerUrl` live, so the moment you return real values they appear — no FE change.
- **Ask:** after contracts deploy + the backend writes decisions on-chain, return the **real tx hash + explorer URL** here.

### BE-7 — Does `POST /api/agents/run` write on-chain?
Today it simulates a decision in memory only. The FE "Run demo agent" uses it for the demo (and separately can write via the user's wallet through `DecisionLogger`).
- **Ask (decision):** confirm whether `/api/agents/run` should also submit the decision on-chain (then the FE just reads it back), or whether on-chain submission stays a FE/wallet action. Either is fine — we just need to know so we don't double-write.

### BE-8 — CORS on the Vercel serverless handler
`server.mjs` (local) sets `Access-Control-Allow-Origin: *`, but `api/[...route].js` (Vercel) does **not**.
- **What we did:** the FE calls a **same-origin Next proxy** (`/api/credora/*`) that forwards to you, so CORS isn't strictly required. But if you want direct browser calls to work, add the same CORS headers to `api/[...route].js`.
- **Ask:** confirm the **deployed backend URL** so we can set `CREDORA_API` in Vercel.

---

## C. Shared naming to lock (affects both)

| Thing | FE shows | Backend | Contract | Agreed canonical? |
| --- | --- | --- | --- | --- |
| Agent action | BUY / SELL / HOLD | LONG/SHORT/HOLD/ALERT | enum Long/Short/Hold/Alert | FE maps; confirm enum order |
| Season id | `s01` (display) | `season-1` | numeric `1` | **need the numeric id** |
| Agents (demo) | (now from backend) | MNTScout, DeltaMind, GuardRail | by agentId | backend list is canonical ✅ |
| Score scale | 0–100 | 0–100 | finalScore ≤ 10000 (bps) | FE divides chain value by 100 |
| ROI | percent | `roiPct` + `roiBps` | `int256 roiBps` | FE uses `roiPct` |
| Risk profile | Low/Medium/High | low/medium/high | — | FE title-cases |

---

## D. What's already done on the FE (no action needed)

- Same-origin proxy to the backend (`/api/credora/*`) — works local + Vercel.
- Adapters mapping every backend shape → FE types (`lib/backend.ts`).
- `READ_SOURCE=api` wired + **e2e-tested** against your local backend: dashboard, agents, passport, seasons, season detail, live feed, proof modal, run-demo all show live data.
- Action mapping LONG↔BUY / SHORT↔SELL live.
- Write layer (`lib/chain.ts`, viem) coded for `registerAgent` / `joinSeason` / `submitDecision`, gated behind `WRITE_SOURCE=chain` + addresses.
- Graceful fallback to mock if the backend is unreachable (demo never breaks).

**Fastest path to a fully live demo:** BE confirms deployed URL (B8) + score formula (B2) + adds `winRate` (B1); SC deploys + shares addresses (A1) + wires submitter roles (A2) + season id (A3). Reads light up immediately; writes light up once addresses land.
