# 🐛 BE Handoff — Indexer doesn't persist on-chain events to MongoDB

**Owner:** Backend dev · **Priority:** High (blocks user-signed on-chain agents from appearing) · **Date:** 2026-06-12

## Symptom

A user registered an agent on-chain via their own wallet (real, confirmed tx):

- Tx: `https://sepolia.mantlescan.xyz/tx/0x4859767ff31455a6013f970bddba55a780fd0966f41b656366e0bf4519efb9a5`
- Status **success**, block **39,826,243**, contract **AgentPassport** (`0x40A9…174e`)
- Emitted **`AgentRegistered` with agentId #4** (verified on-chain)
- A second agent ("GrandivAlphaBot2") was also registered — same result.

**Neither agent appears in `/api/agents` or `/api/leaderboard`.** Both endpoints still
return only the 3 seeded demo agents. `/api/status` shows `chainIndexer: true`,
`database: "mongodb"`.

This is **not a frontend or contract issue** — the on-chain write is perfect. It's
a backend persistence gap.

## Root cause (confirmed in the deployed code)

The indexer and the API read from **two different places** that are never reconciled:

1. **The API reads from MongoDB** when a DB is connected (which it is in prod):

   `api/[...route].js:144`
   ```js
   if (path === "/agents") {
     const rows = db ? await db.collection("agents").find({}, …).toArray() : agents;
     return send(res, 200, { agents: rows });
   }
   ```
   `/leaderboard`, `/decisions`, `/outcomes` are the same — DB collections / a precomputed
   `leaderboard_snapshots` doc.

2. **The indexer only mutates the in-memory arrays** — it never writes to Mongo:

   `runtime/indexer.mjs` → `processAgentRegistered()`:
   ```js
   agents.push({ id, name, source: "onchain", … });   // in-memory only
   ```
   (`grep db|collection|insert runtime/indexer.mjs` → no matches.)

So in production (`database: "mongodb"`), the indexer discovers the on-chain agent and
adds it to the in-memory `agents` array, but every read endpoint serves from MongoDB —
where the agent was never written. The discovery is invisible. Same for indexed
decisions and outcomes.

> In `memory` mode (no Mongo) it would work, because the API falls back to the same
> in-memory arrays the indexer mutates. The bug only manifests with Mongo connected —
> i.e. in prod.

## Fix (backend — pick one)

**Option A (recommended): persist in the indexer.** In `runtime/indexer.mjs`, after each
`push`, upsert into Mongo so the API sees it:
```js
// in processAgentRegistered, after agents.push(...)
const db = await getDb();              // from runtime/db.mjs
if (db) await db.collection("agents").updateOne(
  { id }, { $setOnInsert: { id, name, source: "onchain", strategyType,
            tradingPlatform: "DEX", riskProfile: "medium", supportedMarkets: [],
            createdAt: new Date() } }, { upsert: true });
```
Do the same in `processDecisionSubmitted` → `decisions` collection, and
`processOutcomeSubmitted` → `outcomes` collection. Also recompute + upsert the
`leaderboard_snapshots` doc (or have `/leaderboard` compute live from the `agents` +
`decisions` collections instead of a stale snapshot) so the new agent gets a row.

**Option B: read endpoints merge memory + DB.** Have `/agents`, `/decisions`,
`/outcomes` union the DB rows with the in-memory indexer arrays (dedupe by id). Lower
effort but leaves the data non-durable across restarts.

**Option C: indexer writes through the same DB layer used by `/api/agents/run`.** If the
backend-run path already persists decisions to Mongo, route the indexer through that same
persistence function instead of a raw `push`.

## How to verify the fix

1. Redeploy. Re-register an agent from a wallet (or reuse agentId #4 — it's already
   on-chain at block 39,826,243, well within the indexer's lookback).
2. Within ~15s: `curl https://credora.fabian.web.id/api/agents` should include the new
   agent (`source: "onchain"`), and `/api/leaderboard` should show a row for it.
3. The Credora FE will then display it automatically — no FE change.

## FE status — nothing to change

The frontend already handles all of this correctly:
- Registers via the user's wallet (real `registerAgent`, agent owned by the user).
- Reads agents from `/api/leaderboard` + `/api/agents` — so the moment the backend
  serves the indexed agent, it appears.
- Gracefully shows a loading state and never fabricates the missing agent.

The only blocker is the persistence gap above.

## Minor follow-ups (optional, same indexer)
- Indexed decisions store `market: "onchain"` (the event has `bytes32 marketHash`, not the
  string). Cosmetic — user decisions show market "onchain".
- Indexed user agents get `supportedMarkets: []` + default risk/platform (not in the
  event). Cosmetic.
- A user agent has a decision but no graded outcome (your OutcomeRegistry grader runs for
  backend runs), so its score stays low until graded. Expected, but worth knowing.
