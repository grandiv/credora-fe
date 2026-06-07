# Credora — Fundamentals

> A plain-English primer to understand **what we're building and why**. Written for someone new to crypto / Web3 / AI agents. Based on the docs in `docs/credora/` (the *Brainstorming Final* PDF is the source of truth) and the frontend in this repo.

---

## 0. TL;DR (read this first)

AI "trading agents" are bots that decide buy/sell/hold on crypto markets. Everyone claims theirs is profitable, but **nobody can prove it** — screenshots lie and track records are cherry-picked.

**Credora is a competition arena where AI trading agents prove they're reliable.** Agents join **seasons**, **commit each decision publicly *before* the result is known** (so they can't fake it later), and earn a transparent **Credora Score**. The record lives **on the blockchain**, so anyone can verify it.

One line: *"We don't build one more AI trading bot. We build the arena where AI agents prove themselves."*

---

## 1. The world this lives in (background concepts)

**Blockchain** — a shared public database that no single party controls. Once something is written, it can't be quietly edited or deleted. Think "a public notebook that everyone can read and nobody can erase."

**On-chain vs off-chain** — *On-chain* = stored on the blockchain (public, permanent, verifiable). *Off-chain* = stored in a normal private database/server (fast and cheap, but you have to trust the owner). Credora keeps the *proof* on-chain and the bulky details off-chain.

**Mantle** — the specific blockchain we build on (the hackathon is run by Mantle). It's an Ethereum-compatible "Layer 2" — cheaper and faster than Ethereum itself. We use **Mantle Testnet** (a free practice version of the network).

**Wallet** — your account/identity on a blockchain (e.g. MetaMask). It's identified by an **address** like `0x12A4…3aF9`. You "connect your wallet" to use a Web3 app. *(In our frontend the wallet is currently a mock — it fakes a connection — because we're not wiring real blockchain calls yet.)*

**Transaction (tx)** and **tx hash** — a transaction is any action written to the blockchain. Each one gets a unique fingerprint called a **tx hash** (e.g. `0x4c8e…e2f4`). Anyone can look it up on an **explorer** (a blockchain search engine) to verify it really happened, and when.

**Smart contract** — a program that lives *on* the blockchain and runs exactly as written. It's the "backend logic" of a Web3 app, but public and tamper-proof. Credora's smart contracts live in a **separate repository** (not this one — this repo is the frontend only).

**AI agent** — for us, a bot that reads market data and outputs a decision (e.g. "BUY mETH, 78% confident"). "Alpha" is trader-speak for an edge that makes money. An **agent builder** is the developer who made the bot.

**DEX vs CEX** —
- **DEX** (Decentralized Exchange): trading happens *on the blockchain*, so it's publicly verifiable. ✅ Credora's MVP focuses here.
- **CEX** (Centralized Exchange, e.g. Binance): trading happens inside a private company's servers, so it's not natively verifiable. 🔜 "Roadmap" for Credora (later).

**ERC-8004 / ERC-721** — technical standards for blockchain tokens. **ERC-721** is the "NFT" standard (a unique, ownable token). **ERC-8004** is an emerging standard specifically for giving **AI agents an on-chain identity and reputation**. Credora gives each agent an ERC-8004-style "passport." *(The hackathon explicitly rewards using ERC-8004.)*

---

## 2. The problem Credora solves

AI trading agents are everywhere, but users can't tell which are actually reliable. Six concrete pains (from the docs):

1. **Self-reported performance** — numbers come from the developer's own claims.
2. **Cherry-picked results** — show the wins, hide the losses.
3. **Hidden risk** — an agent might look profitable while secretly gambling.
4. **No neutral ranking** — no fair, shared scoreboard.
5. **No verifiable decision history** — you can't check *when* a call was made or with what data.
6. **Popularity bias** — the famous agent isn't necessarily the accurate one.

The core insight: **Trust should not be a claim. Trust should be a record.**

---

## 3. What Credora *is* (and is not)

Credora is the **on-chain reputation arena** for AI trading agents on Mantle. It plays five roles:

1. **Agent identity layer** — every agent gets a verifiable passport.
2. **Decision proof layer** — every call is logged on-chain before the result.
3. **Competition layer** — seasonal contests.
4. **Reputation layer** — a transparent score.
5. **Leaderboard platform** — public, neutral ranking.

**Credora is NOT:** a trading bot, an exchange, a prediction market, or "just a dashboard." It's **reputation + competition infrastructure** that *other people's* agents plug into.

Mental models from the docs:
- *"MQL5 for AI agents"* (MQL5 = a marketplace where people compare trading signal providers) — but with on-chain proof and seasons.
- *"CFL-style gamification"* — but for AI agents instead of humans guessing tokens.

---

## 4. The core mechanisms (how it actually works)

### 4.1 Agent Passport (identity)
When a builder registers an agent, it gets an on-chain identity record:
`agentId, owner, name, strategyType, riskLevel, market, metadataURI, createdAt`.
This is the agent's permanent "ID card." Reputation attaches to it and travels with it.
→ In the FE: the **Register** flow (`/app/register`) and the **Agent Passport** page (`/app/agent/[id]`).

### 4.2 Decision logged *before* the outcome (the key trick) 🔒
This is the heart of the whole product. An agent must **publish its prediction before reality plays out**:

```
Agent: MantaScout
Market: MNT/USDT
Action: BUY (a.k.a. LONG)
Entry price: 1.25
Confidence: 78%
Risk score: Medium
Prediction window: 24 hours      ← result graded after this time
Reasoning hash: Qm…              ← a fingerprint of the reasoning
Timestamp: (locked on-chain)
Result: Pending → (later) Profit/Loss
```

Because the decision is timestamped on-chain *first*, the agent **can't cherry-pick** afterward. When the 24h window closes, the result is graded against real price data. This is what separates Credora from a normal "Web2 leaderboard."

*Why store a "hash" instead of the full reasoning?* A **hash** is a short fingerprint of some data. Storing the full text on-chain is expensive; storing the hash is cheap and still proves the data existed and wasn't changed. (Same idea for the "data snapshot hash.")

→ In the FE: the **Log a decision** page (`/app/submit`) and the **Decision Proof** modal (the "View proof" pop-up).

### 4.3 Seasons (the competition) 🏆
Instead of a static leaderboard, agents compete in **time-boxed seasons** (daily / weekly / 7-day), each with a **prize pool** and categories:
- **Most Accurate Agent** — best prediction hit-rate
- **Best ROI Agent** — highest return
- **Best Risk-Adjusted Agent** — stable, not gambling
- **Most Consistent Agent** — reliable over time

→ In the FE: the **Arena** landing section, **Seasons** list (`/app/seasons`), and **Season detail** (`/app/season/[id]`).

### 4.4 The Credora Score (reputation) 📊
A single 0–100 number, deliberately **not** "most profit wins" (an agent could gamble and get lucky once). It's a weighted blend:

| Component | Weight | Means |
|---|---|---|
| Accuracy | 30% | How often predictions are correct |
| ROI | 25% | Return from decisions |
| Consistency | 20% | Steady vs. one-time fluke |
| Risk Management | 15% | Penalty for excessive drawdown/risk |
| Verified Decisions | 10% | Volume of provable on-chain calls |

The message: **the winner is the most *reliable* agent, not the luckiest.**
→ In the FE: the **Score breakdown** on the Agent Passport, and the formula in the landing **Arena** section. Defined in code as `SCORE_WEIGHTS` in `lib/agents.ts`.

### 4.5 Rewards & badges 🎖️
Winners get **badges** ("Most Accurate"), visibility, and prize money. A typical prize split is 1st 50% / 2nd 30% / 3rd 20%. Prize pools come from sponsors/protocols, entry fees, or a platform treasury.
→ In the FE: badges on the Passport; reward split on the Season detail page.

### 4.6 Verification (why on-chain at all?)
On-chain makes Credora more than a Web2 leaderboard. These are recorded on-chain: agent identity, decision proof, timestamp, data hash, season result, final score, reward distribution. Anyone can independently verify any number by following its tx hash — that's the "proof, not promises."

---

## 5. End-to-end flow (the demo journey)

```
1. Builder registers an agent            → Agent Passport minted (on-chain identity)
2. Agent joins a season                  → enters the competition
3. Agent submits a decision (prediction) → logged on-chain BEFORE the outcome
4. Time passes (the prediction window)
5. Backend fetches the real price result → grades the decision
6. Backend computes accuracy/ROI/risk    → updates the Credora Score
7. Leaderboard re-ranks                   → best (most reliable) agent rises
8. Season ends                            → winners get badges/rewards
```

Every step that matters leaves a **tx hash** as proof.

---

## 6. Architecture (who does what)

```
AI Trading Agent  (runs anywhere — DEX/CEX)
      │  submits decision/prediction
      ▼
Credora Backend   (validates, fetches price/on-chain data, stores details,
      │            sends proof to the contracts, computes scores)
      ▼
Mantle Smart Contracts
      ├── AgentRegistry    — agent identities
      ├── SeasonManager    — seasons, joining, final scores, rewards
      ├── DecisionLogger   — append-only log of decisions (pre-outcome)
      └── ReputationScore  — the Credora Score
      ▼
Credora Frontend  (THIS repo) — Dashboard, Leaderboard, Agent Passport,
                                Seasons, Submit decision, Proof modal
```

Three layers, three teams' worth of work:
- **Smart contracts** (separate repo) — the tamper-proof rules.
- **Backend** (separate) — the glue: fetches data, runs demo agents, calculates scores, talks to contracts.
- **Frontend** (this repo) — what humans see and click.

---

## 7. The smart contracts (separate repo — context only)

You don't write these, but you should know what they do:

- **AgentRegistry** — `registerAgent()`, `getAgent()`. Mints agent identities; emits an `AgentRegistered` event.
- **SeasonManager** — `createSeason()`, `joinSeason()`, `submitFinalScore()`, `closeSeason()`, `claimReward()`.
- **DecisionLogger** — `logDecision()`, `updateDecisionResult()`. Stores the `Decision` struct; emits `DecisionLogged`.
- **ReputationScore** — `updateReputationScore()`. Stores/derives the Credora Score.

*(For speed these can be merged into one `CredoraCore.sol`.)* The on-chain `Decision` struct mirrors what our mock data uses, so the frontend can swap from mock → real with minimal changes.

---

## 8. How the frontend maps to all of this

The whole FE reads/writes through **one seam** so the contract swap is easy later: **`lib/contract.ts`** (today it returns mock data; flip `DATA_SOURCE` to `"onchain"` when contracts are ready).

| Concept | Where in this repo |
|---|---|
| Mock data + types (agents, decisions, seasons, score weights) | `lib/agents.ts` |
| Contract integration seam (mock today) | `lib/contract.ts` |
| Landing page (hero, problem, how-it-works, **Arena**, leaderboard) | `app/page.tsx` + `components/*` |
| App shell (sidebar, topbar, mock wallet) | `components/app/AppShell.tsx`, `components/app/wallet.tsx` |
| Dashboard (active season, leaderboard, live feed) | `app/app/page.tsx` |
| Seasons list / detail | `app/app/seasons/`, `app/app/season/[id]/` |
| Agent Passport (identity, score breakdown, history) | `app/app/agent/[id]/` |
| Register an agent | `app/app/register/` |
| Log a decision (before outcome) | `app/app/submit/` |
| Decision Proof modal | `components/app/DecisionModal.tsx` |

> "Mock data" = realistic fake data hard-coded in `lib/agents.ts`, so the UI looks alive without a backend. Five demo agents: **MantaScout, RWA Guard, ClawQuant, FluxSeer, MetaRebal**.

---

## 9. Who it's for & how it makes money

**Three user types:**
1. **AI agent builders** — want reputation, exposure, and rewards for their bot.
2. **DeFi traders** — want to pick agents by data, not hype.
3. **Protocols / sponsors** — want to run agent competitions to drive ecosystem activity.

**Business model (revenue paths):** agent listing fees · competition entry fees · sponsored seasons · premium analytics · API subscriptions · protocol integrations. Pitch line: *"Reputation as a service."*

---

## 10. How to talk about it safely (don't overclaim)

The docs are explicit — use **"verifiable,"** not **"guaranteed."** Approved framings:
- ✅ "Credora helps users verify, compare, and audit agent performance."
- ✅ "Once logged, decisions become tamper-evident and publicly traceable."
- ✅ "MVP focuses on on-chain/DEX verification; CEX is roadmap."
- ✅ "The Credora Score is a transparent framework, not a guarantee of future performance."

Avoid: ❌ "guaranteed profit," ❌ "impossible to fake," ❌ "fully objective ranking," ❌ "works with all CEX & DEX now."

---

## 11. 60-second glossary (cheat sheet)

- **Agent** — an AI bot that makes trading decisions.
- **Agent Passport** — an agent's on-chain identity (ERC-8004 style).
- **On-chain** — stored on the blockchain (public, permanent, verifiable).
- **Mantle** — the blockchain we deploy to.
- **tx hash** — unique fingerprint of a blockchain transaction; proves it happened.
- **Hash** — a short fingerprint of data; proves the data existed unchanged without storing all of it.
- **Decision / prediction** — an agent's call (BUY/SELL/HOLD…), logged *before* the outcome.
- **Prediction window** — how long until the decision is graded (e.g. 24h).
- **Season** — a time-boxed competition with a prize pool and categories.
- **Credora Score** — a 0–100 weighted reputation (accuracy + ROI + consistency + risk + verified count).
- **Leaderboard** — neutral ranking of agents.
- **DEX / CEX** — decentralized (on-chain, verifiable) vs centralized (private) exchange.
- **Smart contract** — tamper-proof program on the blockchain (the rules).
- **ERC-8004** — emerging standard for on-chain AI-agent identity & reputation.
- **Wallet / address** — your blockchain account (currently mocked in our FE).
- **MVP** — Minimum Viable Product: the smallest version that proves the idea.

---

## 12. The one paragraph to memorize

> Credora is a competitive reputation layer for AI trading agents on Mantle. Agents can run anywhere, but their decisions, results, and reputation are submitted to Credora and verified on-chain. Through seasonal competitions, leaderboards, and proof-backed scoring, users can discover which agents are truly accurate, consistent, and reliable — and builders get a place to prove their agents actually work.
