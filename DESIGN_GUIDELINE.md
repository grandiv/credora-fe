# Credora — Design Guideline

> For building the **pitch deck** and **demo video**. This is the single source of truth for brand, voice, colours, type, and the product story. Match the live site: **https://credora-turing.vercel.app**

---

## 1. The one-liner

**Credora — Proof, not promises.**
The verifiable reputation layer for AI agents on Mantle. Every agent decision — confidence, risk, rationale, result — is written on-chain and impossible to fake.

**Elevator (15s):** "Every AI trading bot claims it makes money. Almost none can prove it. Credora gives each agent an on-chain passport and logs every decision to Mantle, so anyone can verify the real track record — not the marketing."

---

## 2. The problem → solution story (use this arc in the deck & video)

1. **The trust gap.** AI trading/alpha agents are everywhere. Performance is self-reported, screenshots are cherry-picked, track records start at the last winning trade. You can't tell skill from luck from lies.
2. **The insight.** Trust shouldn't be a claim — it should be a record. Blockchains are built for exactly this.
3. **Credora.** A neutral trust layer:
   - Each agent gets an **ERC-8004 identity passport** (NFT).
   - Every decision is logged on-chain via a **DecisionLogger** contract (action, confidence, risk score, rationale hash, result).
   - A **ReputationScore** contract derives win-rate / ROI / rank.
   - A public **leaderboard** ranks agents by *verifiable results, not reach*.
4. **Why it wins.** It's not one more agent — it's the infrastructure every agent on Mantle can plug into. Ecosystem contribution, not a point solution.

**Killer line for the deck:** *"We didn't build one more agent. We built the trust layer every agent on Mantle can plug into."*

---

## 3. Brand voice

- **Confident, plain, technical.** Short sentences. No hype words ("revolutionary", "next-gen"). The product's whole point is *less* hype.
- **Proof-oriented vocabulary:** verify, on-chain, record, track record, provable, tamper-evident, reconstructable from a tx hash.
- **Contrast framing** is the signature rhetorical move: *claims vs proof*, *reach vs results*, *trusting vs verifying*.
- Recurring taglines (use verbatim):
  - "Proof, not promises."
  - "Ranked by results, not by reach."
  - "Stop trusting. Start verifying."
  - "From a hunch to a hash."

---

## 4. Colour palette — "Heritage Petrol"

Dark, warm, institutional. **One accent only** (burnt orange) — never introduce a second accent colour.

| Role | Name | Hex | Use for |
| --- | --- | --- | --- |
| Base background | Deep Petrol | `#17313A` | slide backgrounds |
| Deepest well | Petrol Black | `#0F2128` | gradient bottoms, footers |
| Panel / card | Petrol Slate | `#1D3C45` | cards, surfaces |
| Hairline border | Petrol Line | `#34585F` | dividers, card borders |
| **Accent** | **Burnt Orange** | **`#D2601A`** | CTAs, key words, highlights, the orb |
| Primary text | Warm Cream | `#FFF1E1` | headlines, body |
| Secondary text | Warm Taupe | `#B3A899` | sub-copy, labels |
| Tertiary text | Muted | `#7E7163` | captions, mono labels |
| Loss / negative | Warm Red | `#E36A5A` | down values only |
| On-accent text | Near Black | `#0B0E10` | text *on* orange buttons (AA contrast) |

**Rules**
- Orange is precious — use it for *one* focal thing per view (a CTA, a key metric, one headline word). Never large orange fills behind text.
- Background gradient (hero / title slides): radial from `#21454F` (top) → `#17313A` → `#0F2128` (bottom).
- Text on orange must be `#0B0E10` (not petrol) — that's the AA-contrast-safe pairing.
- Keep it **dark**. No light/white slides — it breaks the brand instantly.

---

## 5. Typography

| Tier | Font | Where |
| --- | --- | --- |
| Display | **Clash Display** (600/700) | big headlines, slide titles, the wordmark |
| Body | **IBM Plex Sans** (400/500/600) | paragraphs, captions, deck body |
| Data / mono | **IBM Plex Mono** (400/500) | numbers, hashes, addresses, code, labels, "on-chain" feel |

- Free fonts: Clash Display → [fontshare.com](https://www.fontshare.com/fonts/clash-display); IBM Plex → Google Fonts.
- Headline style: tight tracking (`-2%`), line-height ~0.95, sentence case. Example: "Proof," on line one, "not **promises.**" on line two (the second word in orange).
- Always set numbers, %, $ and tx hashes in **IBM Plex Mono** — it's a core part of the "verifiable" feel.
- Wordmark: "Cred" in cream + "ora" in orange, no space: **Credora** (the "ora" carries the accent).

---

## 6. Logo

A hexagonal "passport" shield with a verification check inside, drawn in burnt orange. It reads as *identity + verified*. Use the version from the live site (top-left). Minimum clear space = the height of the "C" in Credora around all sides. On dark only.

---

## 7. Visual motifs to reuse in the deck

- **The Proof Core** — the morphing orange orb from the hero. It *is* the brand visual. Screen-grab it for the title slide and section dividers.
- **Faint grid** — a barely-visible warm grid (`rgba(190,150,110,0.05)`, 64px) behind dark sections. Adds "engineered infrastructure" texture.
- **Hairline cards** — content sits in petrol-slate cards with thin `#34585F` borders and generous padding. Never heavy drop-shadows.
- **Mono data chips** — small rounded pills with mono text for actions (`BUY`, `HOLD`, `ALERT`), confidence (`78%`), and tx hashes.
- **Contrast pairs** — two columns: the dull/grey "old way" vs the orange-accented "Credora way". Mirror the site's Problem section.

---

## 8. Demo video — exact run-of-show (target ≥ 2 min for the Deployment Award)

Record on **https://credora-turing.vercel.app**. Suggested narration in *italics*.

| # | Time | Screen | Action & narration |
| --- | --- | --- | --- |
| 1 | 0:00–0:15 | Landing hero | *"Every AI agent claims alpha. Almost none can prove it."* Let the orb morph; scroll slightly to show the live decision ticker. |
| 2 | 0:15–0:30 | Landing — Problem | Scroll to the claims-vs-proof comparison. *"Performance is self-reported and cherry-picked. There's no neutral ranking."* |
| 3 | 0:30–0:45 | Landing — How it works | Horizontal-scroll the 4 steps: **Register → Join season → Log decision (before outcome) → Earn reputation.** Pause on the `Decision.sol` struct. |
| 4 | 0:45–1:00 | Landing — Arena | Scroll to the season cards + Credora Score formula. *"Competition turns reputation into a market."* |
| 5 | 1:00–1:10 | Click **Launch App** → `/app` | Dashboard: the live season banner, the standings, and a real-time decision feed. |
| 6 | 1:10–1:25 | Dashboard | Toggle the **ROI** sort — leaderboard reorders. Click a **live decision** → **Decision Proof** modal (confidence, risk, rationale hash, data hash, tx hash). *"Reconstructable from a single Mantle tx."* |
| 7 | 1:25–1:40 | **Seasons → Season detail** | Open the season. Show prize pool, scoring rules (30/25/20/15/10), reward split, standings. Click **Join season → MantaScout** → "✓ joined (tx logged)." |
| 8 | 1:40–1:55 | **Register** an agent | Identity → Strategy (platform + market) → Review → **Mint passport** → success → "Join a season." |
| 9 | 1:55–2:15 | **Log a decision** (`/app/submit`) | Click **⚡ Run demo agent** (auto-fills a call) → **Submit Proof on Mantle** → "Decision logged before the outcome." Back to dashboard → the decision appears as **NEW**. |
| 10 | 2:15–2:30 | **Agent Passport** | ERC-8004 identity, badges, **Credora Score breakdown**, Accuracy + Win rate, decision history → proof. |
| 11 | 2:30–2:40 | Close | *"Stop trusting. Start verifying. Credora — where agents earn credibility on-chain."* End on logo + URL. |

**Recording tips:** 1280×800 or 1920×1080, hide bookmarks bar, dark OS theme, smooth slow scrolls (the motion is part of the pitch), cursor visible for clicks. The count-up stats animate on load — let them finish before narrating a number.

---

## 9. Deck structure (10–12 slides)

1. **Title** — logo, "Proof, not promises.", the orb, URL.
2. **Problem** — the trust gap (claims vs proof). One stat or quote.
3. **Insight** — trust should be a record, not a claim.
4. **Solution** — Credora in one diagram (Passport · DecisionLogger · ReputationScore · Leaderboard).
5. **How it works** — the 4-step pipeline.
6. **Product** — 2–3 real screens (dashboard, passport, proof modal). Screens > words.
7. **Why on-chain / why Mantle** — permanent record, ERC-8004 identity, ecosystem fit.
8. **Differentiation** — the "AI trading bot vs Credora" table (claims→proof, hidden risk→risk score, etc.).
9. **Target users** — DeFi traders, agent builders, Mantle protocols.
10. **Business model** — SaaS dashboard, API for agent track records, listing fees, premium analytics, protocol integrations.
11. **Track fit** — Primary: AI Alpha & Data · Secondary: AI DevTools · Deployment Award.
12. **Close** — "Stop trusting. Start verifying." + links (live demo, repo).

**Slide design rules:** dark petrol background, one idea per slide, max ~15 words of text, one orange focal point, data in mono. Let the product screenshots carry the weight.

---

## 10. Boilerplate copy (paste-ready)

**Short description:** Credora is the verifiable reputation layer for AI agents on Mantle. It issues each agent an ERC-8004 identity and logs every decision on-chain, so users can rank and trust agents by provable track record instead of marketing claims.

**Tags:** Mantle · ERC-8004 · AI agents · on-chain reputation · DeFi · verifiable AI · AI Alpha & Data

**Links:**
- Live demo: https://credora-turing.vercel.app
- Repo: https://github.com/grandiv/credora-fe

---

## 11. Don'ts

- ❌ No second accent colour. Orange is the only accent.
- ❌ No light/white slide backgrounds.
- ❌ No generic stock "AI brain / glowing circuit" imagery — use the real product and the Proof Core.
- ❌ Don't set numbers/hashes in the body font — always IBM Plex Mono.
- ❌ Don't overclaim. The brand's credibility *is* the restraint. Say "verifiable", not "guaranteed profits".
- ❌ Don't crowd slides — one idea, lots of dark space.
