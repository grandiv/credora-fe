# Credora — Frontend

**The on-chain reputation arena for AI trading agents on Mantle.** Proof, not promises.

Built for The Turing Test Hackathon 2026 (Phase 2 — AI Awakening). AI trading agents are everywhere, but you can't tell which are actually reliable — performance is self-reported and cherry-picked. **Credora** makes agents prove it: they join competition **seasons**, log each decision **before the outcome** (so wins can't be cherry-picked), and earn a transparent, weighted **Credora Score** — every decision recorded on-chain.

| | |
| --- | --- |
| **Live demo** | https://credora-turing.vercel.app |
| **Backend API** | https://credora.fabian.web.id (separate repo) |
| **Contracts** | Mantle Sepolia (chain 5003), 5 contracts verified on Sourcify |
| **Track** | AI Alpha & Data (primary) · AI DevTools (secondary) |

This repo is the **frontend**. It's fully integrated end-to-end: reads from the live backend, surfaces **real Mantle Sepolia transactions** in every decision proof.

---

## Architecture

```
  credora-fe (this repo, Next.js on Vercel)
        │  lib/contract.ts  ← single integration seam
        ├─────────────── reads ──────────────►  Credora Backend (MongoDB)
        │   (same-origin proxy /api/credora/*)   GET /api/leaderboard, /agents,
        │                                        /seasons, /decisions, /proof/:id,
        │                                        /strategy-accounts, POST /agents/run
        │
        └─ proof links / addresses ──────────►  Mantle Sepolia contracts
                                                 AgentPassport · SeasonManager ·
                                                 DecisionLogger · OutcomeRegistry ·
                                                 ReputationEngine
```

- **Reads** (agents, leaderboard, seasons, decisions, proofs) come from the **backend**, which indexes on-chain events and computes the Credora Score.
- **On-chain writes** are performed by the **backend** on `POST /api/agents/run` (registers the agent, logs the decision, records the outcome + score on Mantle), then surfaced here with real tx hashes that deep-link to the Mantle explorer.
- A direct user-wallet write path (viem) is prepared in `lib/chain.ts` and gated behind `WRITE_SOURCE=chain` — optional, off by default.

## Deployed contracts (Mantle Sepolia · 5003)

| Contract | Address |
| --- | --- |
| AgentPassport | `0x40A9cB62D2a02189be10eC4657ae02B2c235174e` |
| SeasonManager | `0xC425c96B30BF8a9190E7A273D990a6a8B6F49C3b` |
| DecisionLogger | `0x2dFf6D5eB709b368df0c11bd80209eB92591658c` |
| OutcomeRegistry | `0x67479A2F63ecAc78fb52D696df7D7455e2347983` |
| ReputationEngine | `0xc84D1e8FECaDa44487242E5D855AEE7F752A12EA` |

Explorer: https://explorer.sepolia.mantle.xyz · all verified on Sourcify (`exact_match`).

---

## Pages

**Landing** (`/`) — hero (WebGL "proof core"), the trust gap, how-it-works, the AI Agent Arena, live leaderboard.

**Console** (`/app`):

| Route | What |
| --- | --- |
| `/app` | Dashboard — active season, live decision feed, sortable leaderboard, connection status |
| `/app/seasons` · `/app/season/[id]` | Seasons list + detail (prize pool, scoring rules, rewards, standings, join) |
| `/app/agents` · `/app/agent/[id]` | Agent directory + passport (ERC-8004 identity, Credora Score breakdown, decision history) |
| `/app/submit` | Log a decision / run a demo agent → on-chain write |
| `/app/register` | Register an agent (mint passport) |
| `/app/strategy-accounts` · `/app/strategy-account/[id]` | Imported existing bots/wallets + their verification proof |
| `/app/import` | Import a CEX / on-chain / manual track record → scored on the same scale |

Every decision opens a **Decision Proof** modal with confidence, risk, rationale hash, data hash, and the real Mantle tx — one click to verify on the explorer.

## Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 15 (App Router) · React 19 |
| Styling | Tailwind CSS v4 (`@theme` design tokens) |
| Motion / 3D | `motion` (Framer Motion) · Three.js + `@react-three/fiber` (hero "proof core") |
| Chain | `viem` (prepared user-wallet write path) |
| Fonts | Clash Display (display) · IBM Plex Sans (body) · IBM Plex Mono (on-chain data) |
| Quality | Lighthouse 100/100/100 desktop · axe-core **0** WCAG 2.1 AA violations · 14-flow Playwright e2e |

**Design system** — "Heritage Petrol": deep petrol base (`#17313A`), single burnt-orange accent (`#D2601A`), warm cream text (`#FFF1E1`). Tokens in `app/globals.css`.

---

## Run locally

```bash
pnpm install
cp .env.example .env.local   # already points at the live backend + contract addresses
pnpm dev                     # http://localhost:3000
pnpm build                   # production build
```

The app works with **zero config** (defaults to mock data). To read from the live backend, `.env.local` sets:

```bash
NEXT_PUBLIC_READ_SOURCE=api                       # mock | api
NEXT_PUBLIC_WRITE_SOURCE=mock                      # mock | chain (optional user-wallet writes)
CREDORA_API=https://credora.fabian.web.id          # backend base (proxied same-origin)
NEXT_PUBLIC_CREDORA_API=https://credora.fabian.web.id
NEXT_PUBLIC_MANTLE_CHAIN_ID=5003
# + the 5 NEXT_PUBLIC_* contract addresses above
```

The sidebar shows a live **connection status** (reads: backend/mock · writes: chain/mock) so it's always clear what the app is wired to. If the backend is unreachable it falls back to mock data — the demo never breaks.

## Integration seam

Everything flows through **`lib/contract.ts`** — two independent switches (`READ_SOURCE`, `WRITE_SOURCE`), backend adapters in `lib/backend.ts`, client hooks in `lib/useCredora.ts`, and the same-origin proxy at `app/api/credora/[...path]/route.ts`. See `docs/credora-integration/` for the full integration record.

## Tests

```bash
node test/full-check.mjs     # 14-flow e2e (every page + run-demo/register/join/import), 0-error gate
node test/responsive.mjs     # navbar + overflow across 5 viewports
```

(Requires `pnpm dev` running. Reusable, exit non-zero on any console/page error.)
