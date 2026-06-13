import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.JOURNEY_BASE || "http://localhost:3000";
const OUT = "/Users/grandiv/Projects/hackathon/credora-fe/Credora-User-Journey.pdf";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

async function scrollToCenter(sel) {
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (el) {
      const y =
        el.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: y, behavior: "instant" });
    }
  }, sel);
}

async function shot() {
  const buf = await page.screenshot({ type: "png" });
  return "data:image/png;base64," + buf.toString("base64");
}

/* ── the user journey, mapped to the pitch-video timeline ── */
const STEPS = [
  {
    t: "0:00",
    title: "Landing — the hook",
    sub: "Proof, not promises.",
    say: "Every AI agent claims alpha. Almost none can prove it. Credora is the on-chain reputation arena where AI trading agents earn credibility on Mantle.",
    async run() {
      await page.goto(BASE, { waitUntil: "networkidle" });
      await wait(2600); // let hero animation + WebGL orb settle
    },
  },
  {
    t: "0:14",
    title: "The problem — the trust gap",
    sub: "Claims vs. proof",
    say: "Performance is self-reported, screenshots are cherry-picked, risk is hidden, and there is no neutral ranking of who is actually reliable.",
    async run() {
      await scrollToCenter("#problem");
      await wait(1200);
    },
  },
  {
    t: "0:28",
    title: "How it works — four steps",
    sub: "Register → Join season → Log decision → Earn reputation",
    say: "Agents register an identity, join a season, and log each decision before the outcome — so wins can't be cherry-picked after the fact.",
    async run() {
      await scrollToCenter("#how");
      await wait(1200);
    },
  },
  {
    t: "0:42",
    title: "The AI Agent Arena",
    sub: "Competition turns reputation into a market",
    say: "Agents enter seasonal competitions scored on verified decisions. The Credora Score weights accuracy, ROI, consistency, risk and verification — reliability over raw profit.",
    async run() {
      await scrollToCenter("#arena");
      await wait(1200);
    },
  },
  {
    t: "0:56",
    title: "Console — Dashboard",
    sub: "Live backend · active season · real-time feed",
    say: "Launch the app. Everything here is live data from the Credora backend — the active season, the standings, and a feed of decisions written on-chain. The sidebar shows the live connection status.",
    async run() {
      await page.goto(BASE + "/app", { waitUntil: "networkidle" });
      await wait(2600);
    },
  },
  {
    t: "1:12",
    title: "Season detail — join the arena",
    sub: "Prize pool · scoring rules · standings",
    say: "Each season carries a prize pool, categories and a transparent scoring framework. An agent joins the season to start competing.",
    async run() {
      await page.goto(BASE + "/app/season/s01", { waitUntil: "networkidle" });
      await wait(1600);
    },
  },
  {
    t: "1:26",
    title: "Run a demo agent",
    sub: "Reads live price → writes the decision on-chain",
    say: "Log a decision. The agent reads a live market price, drafts a call, and the backend commits it to Mantle — registering the agent, logging the decision, and recording the outcome on-chain.",
    async run() {
      await page.goto(BASE + "/app/submit", { waitUntil: "networkidle" });
      await wait(1000);
      try {
        await page.getByRole("button", { name: /Run demo agent/i }).click();
        // the on-chain write takes ~20s; wait for the form to fill
        await page.locator("text=review and submit").waitFor({ timeout: 30000 });
      } catch {}
      await wait(800);
    },
  },
  {
    t: "1:44",
    title: "Decision Proof — on-chain",
    sub: "Real Mantle Sepolia transaction",
    say: "Open any decision. Confidence, risk, rationale hash and data hash — plus the real transaction hash. One click verifies it on the Mantle explorer. This is the heart of Credora: verifiable, not claimed.",
    async run() {
      await page.goto(BASE + "/app", { waitUntil: "networkidle" });
      await wait(2000);
      try {
        await page
          .locator("section:has-text('Live decisions') button")
          .first()
          .click();
        await wait(1600); // let the proof (real tx) load
      } catch {}
    },
  },
  {
    t: "2:00",
    title: "Agent Passport",
    sub: "ERC-8004 identity · Credora Score breakdown",
    say: "A portable, on-chain reputation: accuracy and win-rate, the weighted score broken into its five components, and the full decision history.",
    async run() {
      await page.goto(BASE + "/app/agent/1", { waitUntil: "networkidle" });
      await wait(1800);
    },
  },
  {
    t: "2:14",
    title: "Strategy accounts",
    sub: "Existing bots & wallets, imported and scored",
    say: "Credora isn't only native agents. Existing CEX bots, smart wallets and on-chain traders are imported and scored on the very same scale — one neutral leaderboard for every strategy.",
    async run() {
      await page.goto(BASE + "/app/strategy-accounts", { waitUntil: "networkidle" });
      await wait(1500);
    },
  },
  {
    t: "2:30",
    title: "Import a track record",
    sub: "Bybit · Nansen · Mantle wallet · manual",
    say: "Pick a source, drop in the public track record, and Credora hashes the evidence and computes a comparable score. Multi-source data, one trust layer.",
    async run() {
      await page.goto(BASE + "/app/import", { waitUntil: "networkidle" });
      await wait(800);
      try {
        await page.getByPlaceholder("AlphaMaster 30D").fill("AlphaMaster 30D");
        await page.getByPlaceholder("master-trader-001").fill("bybit-master-alpha");
      } catch {}
      await wait(700);
    },
  },
  {
    t: "2:48",
    title: "Strategy account proof",
    sub: "Imported record · verifiable evidence",
    say: "Every imported account gets its own proof page — metrics, the data hash, the source link, and its anchor status. Stop trusting. Start verifying.",
    async run() {
      await page.goto(
        BASE +
          "/app/strategy-account/bybit-copy-trading%3Abybit-master-alpha-30d-demo",
        { waitUntil: "networkidle" },
      );
      await wait(1600);
    },
  },
];

const captured = [];
for (const s of STEPS) {
  try {
    await s.run();
  } catch (e) {
    console.warn("  ! interaction hiccup on", s.title, "—", e.message.split("\n")[0]);
  }
  captured.push({ ...s, img: await shot() });
  console.log("captured", s.t, s.title);
}
await ctx.close();

/* ── build the branded storyboard HTML ── */
const logoB64 = fs.readFileSync(
  "/Users/grandiv/Projects/hackathon/credora-fe/public/credora-logo.png",
).toString("base64");
const logo = `<img src="data:image/png;base64,${logoB64}" width="32" height="32" style="display:block"/>`;

const stepPages = captured
  .map(
    (s, i) => `
  <section class="page step">
    <div class="step-head">
      <span class="num">${String(i + 1).padStart(2, "0")}</span>
      <div class="step-title">
        <div class="time">${s.t}</div>
        <h2>${s.title}</h2>
        <div class="subtitle">${s.sub}</div>
      </div>
    </div>
    <div class="shot"><img src="${s.img}" /></div>
    <p class="say"><span class="say-label">Narration</span>${s.say}</p>
  </section>`,
  )
  .join("");

const html = `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; font-family: "IBM Plex Sans", -apple-system, Segoe UI, Roboto, sans-serif; color: #f3ede2; }
  .page { width: 210mm; min-height: 297mm; padding: 18mm 16mm; background: radial-gradient(130% 80% at 50% -10%, #21454f 0%, #17313a 42%, #0f2128 100%); page-break-after: always; position: relative; overflow: hidden; }
  .grid { position:absolute; inset:0; background-image: linear-gradient(rgba(190,150,110,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(190,150,110,.05) 1px, transparent 1px); background-size: 26px 26px; }
  .brand { display:flex; align-items:center; gap:10px; position:relative; }
  .brand .wm { font-weight:700; font-size:20px; letter-spacing:-.01em; }
  .brand .wm .o { color:#d2601a; }
  /* cover */
  .cover { display:flex; flex-direction:column; justify-content:space-between; }
  .cover h1 { font-size: 56px; line-height: 1.0; letter-spacing:-.03em; margin: 0; font-weight: 800; position:relative; }
  .cover h1 .o { color:#d2601a; }
  .cover .lead { color:#b3a899; font-size: 17px; max-width: 130mm; line-height:1.5; position:relative; }
  .cover .meta { display:flex; gap:24px; position:relative; font-family:"IBM Plex Mono", monospace; font-size:12px; color:#7e7163; }
  .cover .meta b { color:#f3ede2; font-weight:500; display:block; margin-top:4px; font-size:13px; }
  .pill { display:inline-flex; align-items:center; gap:8px; border:1px solid rgba(210,96,26,.4); background:rgba(210,96,26,.08); color:#d2601a; border-radius:999px; padding:7px 14px; font-family:"IBM Plex Mono",monospace; font-size:11px; text-transform:uppercase; letter-spacing:.14em; position:relative; }
  /* step */
  .step-head { display:flex; align-items:flex-start; gap:16px; position:relative; }
  .num { font-family:"IBM Plex Mono",monospace; font-size:34px; font-weight:700; color:#d2601a; line-height:1; }
  .step-title h2 { margin:2px 0 0; font-size:24px; font-weight:700; letter-spacing:-.01em; }
  .step-title .time { font-family:"IBM Plex Mono",monospace; font-size:11px; color:#7e7163; letter-spacing:.1em; }
  .step-title .subtitle { color:#b3a899; font-size:13.5px; margin-top:3px; }
  .shot { margin-top:18px; border:1px solid rgba(190,150,110,.18); border-radius:14px; overflow:hidden; position:relative; box-shadow: 0 18px 50px -20px rgba(0,0,0,.7); }
  .shot img { display:block; width:100%; }
  .say { position:relative; margin-top:16px; color:#cbbfae; font-size:13.5px; line-height:1.55; border-left:2px solid rgba(210,96,26,.5); padding:2px 0 2px 14px; }
  .say-label { display:block; font-family:"IBM Plex Mono",monospace; font-size:9.5px; letter-spacing:.18em; text-transform:uppercase; color:#7e7163; margin-bottom:4px; }
  .foot { position:absolute; bottom:10mm; left:16mm; right:16mm; display:flex; justify-content:space-between; font-family:"IBM Plex Mono",monospace; font-size:9.5px; color:#5f5749; }
</style></head>
<body>
  <section class="page cover">
    <div class="brand">${logo}<span class="wm">Cred<span class="o">ora</span></span></div>
    <div>
      <span class="pill">Product walkthrough · user journey</span>
      <h1 style="margin-top:18px">Proof,<br/><span class="o">not promises.</span></h1>
      <p class="lead">A screen-by-screen walkthrough of Credora — the on-chain reputation arena where AI trading agents compete, log decisions before the outcome, and earn verifiable credibility on Mantle. Captured live against the deployed backend with real Mantle Sepolia transactions. A storyboard for the pitch deck &amp; demo video.</p>
    </div>
    <div class="meta">
      <div>Live demo<b>credora-turing.vercel.app</b></div>
      <div>Backend<b>credora.fabian.web.id · MongoDB</b></div>
      <div>Chain<b>Mantle Sepolia · 5 verified contracts</b></div>
      <div>Captured<b>${new Date().toISOString().slice(0, 10)}</b></div>
    </div>
  </section>
  ${stepPages}
</body></html>`;

const pdfPage = await (await browser.newContext()).newPage();
await pdfPage.setContent(html, { waitUntil: "networkidle" });
await pdfPage.pdf({
  path: OUT,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();
console.log("PDF written:", OUT);
