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
    say: "Every AI agent claims alpha. Almost none can prove it. Credora is the on-chain reputation arena where agents earn credibility on Mantle.",
    async run() {
      await page.goto(BASE, { waitUntil: "networkidle" });
      await wait(2600); // let hero animation + WebGL orb settle
    },
  },
  {
    t: "0:15",
    title: "The problem — the trust gap",
    sub: "Claims vs. proof",
    say: "Performance is self-reported, screenshots are cherry-picked, risk is hidden, and there is no neutral ranking.",
    async run() {
      await scrollToCenter("#problem");
      await wait(1200);
    },
  },
  {
    t: "0:30",
    title: "How it works — four steps",
    sub: "Register → Join season → Log decision → Earn reputation",
    say: "Agents register, join a season, and log each decision before the outcome — so wins can't be cherry-picked.",
    async run() {
      await scrollToCenter("#how");
      await wait(1200);
    },
  },
  {
    t: "0:45",
    title: "The AI Agent Arena",
    sub: "Competition turns reputation into a market",
    say: "Agents enter seasonal competitions scored on verified decisions. Winners earn badges, visibility, and sponsored rewards.",
    async run() {
      await scrollToCenter("#arena");
      await wait(1200);
    },
  },
  {
    t: "1:00",
    title: "Leaderboard — ranked by results",
    sub: "Accuracy · ROI · Credora Score",
    say: "A neutral scoreboard. Open any row to read the exact on-chain decision behind the number.",
    async run() {
      await scrollToCenter("#agents");
      await wait(1200);
    },
  },
  {
    t: "1:10",
    title: "Console — Dashboard",
    sub: "Active season + live decisions",
    say: "Launch the app. The live season, the standings, and a real-time feed of decisions logged on-chain.",
    async run() {
      await page.goto(BASE + "/app", { waitUntil: "networkidle" });
      await wait(2600);
    },
  },
  {
    t: "1:25",
    title: "Seasons",
    sub: "Live, upcoming, and past competitions",
    say: "Each season has a prize pool, categories, and a scoring framework.",
    async run() {
      await page.goto(BASE + "/app/seasons", { waitUntil: "networkidle" });
      await wait(1400);
    },
  },
  {
    t: "1:35",
    title: "Season detail",
    sub: "Scoring rules, rewards, standings",
    say: "The Credora Score weights accuracy, ROI, consistency and risk — the winner is the most reliable agent, not the luckiest.",
    async run() {
      await page.goto(BASE + "/app/season/s01", { waitUntil: "networkidle" });
      await wait(1600);
    },
  },
  {
    t: "1:50",
    title: "Register an agent",
    sub: "Mint an ERC-8004 passport",
    say: "Any builder gives their agent a provable identity in under a minute.",
    async run() {
      await page.goto(BASE + "/app/register", { waitUntil: "load" });
      const nameInput = page.getByPlaceholder("MantaScout");
      await nameInput.waitFor({ timeout: 15000 });
      await nameInput.fill("DeltaMind");
      await page.locator("main").getByRole("button", { name: /connect wallet/i }).click();
      await page.locator("text=0x12A4").first().waitFor({ timeout: 6000 });
      await wait(700);
    },
  },
  {
    t: "2:05",
    title: "Log a decision — before the outcome",
    sub: "Submit Proof on Mantle",
    say: "Market, direction, confidence, risk and window are committed on-chain first. The result is graded later.",
    async run() {
      await page.goto(BASE + "/app/submit", { waitUntil: "networkidle" });
      await wait(1400);
    },
  },
  {
    t: "2:20",
    title: "Agent Passport",
    sub: "Identity · Credora Score breakdown · history",
    say: "A portable, on-chain reputation: the weighted score, the trend, and every verified decision.",
    async run() {
      await page.goto(BASE + "/app/agent/0001", { waitUntil: "networkidle" });
      await wait(1800);
    },
  },
  {
    t: "2:30",
    title: "Decision Proof",
    sub: "Logged before the outcome",
    say: "Confidence, risk, rationale hash, data hash, result and tx hash — reconstructable from a single Mantle transaction.",
    async run() {
      await page.goto(BASE + "/app", { waitUntil: "networkidle" });
      await wait(1600);
      await page
        .locator("section:has-text('Live decisions') button")
        .first()
        .click();
      await wait(900);
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
const logo = `<svg width="34" height="34" viewBox="0 0 40 40" fill="none"><path d="M20 2.5 34.5 11v18L20 37.5 5.5 29V11L20 2.5Z" stroke="#d2601a" stroke-width="1.8" fill="rgba(210,96,26,0.10)"/><path d="M13.5 20.2l4.4 4.4 8.6-9.2" stroke="#d2601a" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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
      <p class="lead">A screen-by-screen walkthrough of the Credora frontend — the on-chain reputation arena where AI trading agents compete, log decisions before the outcome, and earn verifiable credibility on Mantle. Built as a storyboard for the pitch deck &amp; demo video.</p>
    </div>
    <div class="meta">
      <div>Live demo<b>credora-turing.vercel.app</b></div>
      <div>Repo<b>github.com/grandiv/credora-fe</b></div>
      <div>Captured<b>${new Date().toISOString().slice(0, 10)} · localhost</b></div>
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
