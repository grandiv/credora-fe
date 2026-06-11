# User-Signed On-Chain Writes (Connect Wallet) — integration notes

> From the **credora-fe** team. We added a real wallet connector so users can
> sign their own on-chain transactions (register an agent, log a decision) from
> MetaMask on Mantle Sepolia — true ERC-8004 ownership. This is built **FE-only;
> it needs no backend or contract change to work.** This doc records *why* it
> works and a few **minor cosmetic gaps** you may want to polish later.

## How it works (verified against your code)

```
User clicks Connect Wallet → MetaMask on Mantle Sepolia (5003)
  → Register:  AgentPassport.registerAgent(...)   signed + paid by the user
  → Submit:    DecisionLogger.submitDecision(...) signed by the user
        │
        ▼  emits AgentRegistered / DecisionSubmitted
  runtime/indexer.mjs  (getLogs on the contract address, NO sender filter)
        │  ~15s
        ▼  agents.push({...}) / decisions.push({...})
  GET /api/agents, GET /api/leaderboard (agents.map → includes it)
        │
        ▼
  Credora FE shows the user's agent + decision automatically
```

**Why no backend change is needed:** your indexer (`runtime/indexer.mjs`) calls
`getLogs({ address: agentPassport, event: AgentRegistered })` with **no filter on
sender/owner** — so it ingests events from *any* wallet, not just the backend's.
And `leaderboard()` does `agents.map(...)` over the full agents array (incl.
indexer-added), so a user-registered agent gets a leaderboard row. We confirmed
both in the deployed v2.2 code.

**Why no contract change is needed:** `registerAgent` is public (anyone can
call). `submitDecision` requires `isAuthorizedOperator(agentId, msg.sender)` — we
register with the user's wallet as `operator`, so the same user can submit. The
FE pre-checks `isAuthorizedOperator` and only signs for agents the user owns
(demo agents stay on the backend path).

## FE behaviour (the "connect-to-go-real" model)
- **No wallet connected** → register/submit use the existing demo path; "Run demo
  agent" still anchors via your backend. The demo never needs a wallet.
- **Wallet connected on Mantle Sepolia** → register mints to the user's address;
  submit signs from the user's wallet (for agents they own). Real tx + explorer
  link shown.

## 🔶 Minor cosmetic gaps (optional — not blockers)

When the indexer ingests a **user-signed** agent/decision, some fields are
defaulted because they aren't in the event. The FE renders them gracefully, but
you may want to enrich them:

1. **Indexed decision `market: "onchain"`** — `submitDecision` stores
   `bytes32 marketHash`, not the string, so the indexer can't recover "MNT/USDT".
   The user's decision shows market = "onchain" in the app. *Option:* keep a
   `marketHash → "MNT/USDT"` map, or read the string from `evidenceURI`.
2. **Indexed agent defaults** — indexer sets `supportedMarkets: []`,
   `tradingPlatform: "DEX"`, `riskProfile: "medium"` (not in the event). The
   user's agent card shows empty markets. *Option:* store metadata off-chain
   keyed by agentId, or parse `metadataURI`.
3. **No outcome/score for user agents** — your `OutcomeRegistry` grading runs for
   backend-run decisions. A user-signed decision is logged (correct: before the
   outcome) but never graded, so the agent's accuracy/ROI stay 0 and its Credora
   Score is low. *Option:* have the grader also process `indexedFromChain`
   decisions after their window closes.
4. **`AgentJoinedSeason` not indexed** — the indexer ingests
   AgentRegistered/DecisionSubmitted/OutcomeSubmitted but not SeasonManager's
   `AgentJoinedSeason`. On-chain `joinSeason` won't reflect in any endpoint. The
   FE "join season" is currently a local/session action, so this isn't visible
   today — only relevant if you want on-chain season membership surfaced.

## What the FE needs from you to fully light this up
**Nothing required.** It works now. The items above are polish. The one thing
worth confirming: that the deployed indexer's RPC env (`MANTLE_RPC_URL`) stays
set so external events keep being ingested (status shows `chainIndexer: true` ✓).

## For the demo
- A user (and the person recording the video) needs **MetaMask + Mantle Sepolia
  testnet MNT** for gas.
- Keep "Run demo agent" as the no-wallet path so the video never depends on a
  live MetaMask popup.
