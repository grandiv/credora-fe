# AgentProof — Frontend

**Verifiable AI Agent Reputation Layer on Mantle.** Proof, not promises.

The landing page for AgentProof, built for The Turing Test Hackathon 2026 (Phase 2 — AI Awakening). Records, verifies and ranks the on-chain track record of AI trading & analytics agents on Mantle, so users can tell which agents actually perform — not just which ones market well.

> The smart contracts (`AgentRegistry`, `DecisionLogger`, `ReputationScore`) live in a separate repository. This repo is the frontend only.

## Stack

| Layer    | Tech                                            |
| -------- | ----------------------------------------------- |
| Framework| Next.js 15 (App Router) · React 19              |
| Styling  | Tailwind CSS v4 (`@theme` design tokens)        |
| Motion   | `motion` (Framer Motion) — scroll + page-load   |
| 3D       | Three.js · `@react-three/fiber` — hero agent constellation |
| Icons    | `lucide-react`                                  |
| Fonts    | Clash Display (display) · IBM Plex Sans (body) · IBM Plex Mono (on-chain data) |
| Quality  | Lighthouse 100/100/100 desktop (98 perf mobile) · axe-core 0 WCAG 2.1 AA violations |

The hero backdrop (`components/AgentField.tsx`) is a code-split WebGL constellation of agent nodes + a wireframe identity core, with depth fog and gentle cursor parallax. It honours `prefers-reduced-motion` and loads client-only so it never blocks first paint.

## Design system

Palette from `docs/color-palette.jpeg`, exposed as Tailwind theme tokens in `app/globals.css`:

| Token        | Hex       | Role                          |
| ------------ | --------- | ----------------------------- |
| `navy`       | `#0F172A` | Main background (Slate 900)   |
| `cyan`       | `#00E5FF` | Primary accent (Tech Cyan)    |
| `gold`       | `#FFD700` | High-value highlight (ROI)    |
| `slate`      | `#1E293B` | Panels (Slate 800)            |
| `ink`        | `#F8FAFC` | Text (Clean White)            |

Aesthetic: **institutional trust layer that feels alive** — Bloomberg-grade data UI with a cinematic hero (aurora mesh, verifiable-grid, scanline, live decision ticker).

## Sections

`Nav · Hero (Agent Passport + ticker) · Marquee · Problem (claim vs proof) · How it works (4-step proof pipeline + on-chain Decision struct) · Live leaderboard (interactive "View Proof" modal) · Tracks · CTA · Footer`

## Run

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build
```

Data in `lib/agents.ts` is mocked and shaped to match the on-chain `Decision` struct, so contract reads can drop in later with minimal changes.

## Smart-contract integration (when the contracts are ready)

The FE is **mock-only** today — no wallet, RPC, wagmi/viem or contract calls. All
reads/writes flow through a single seam: **`lib/contract.ts`**.

To go live, in that one file:
1. Set `DATA_SOURCE = "onchain"`.
2. Fill the `TODO(contract)` branches in the read/write functions.
3. Add the deployed addresses to `.env` (see `.env.example`).

Planned contracts: `AgentRegistry` (ERC-8004 passports), `DecisionLogger`
(append-only `Decision` struct), `ReputationScore` (derived win-rate/ROI/rank).
The mock `DecisionRow` in `lib/agents.ts` already mirrors the on-chain `Decision`
struct, and the mock wallet (`components/app/wallet.tsx`) is the drop-in point for
a real wagmi/RainbowKit connector.
