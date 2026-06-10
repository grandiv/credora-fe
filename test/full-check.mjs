import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const allErrors = []; // { where, type, text }
const results = [];

function attach(page, where) {
  page.on("pageerror", (e) =>
    allErrors.push({ where, type: "pageerror", text: e.message }),
  );
  page.on("console", (m) => {
    const t = m.type();
    if (t === "error" || t === "warning") {
      const text = m.text();
      // ignore framework/GPU noise that isn't an app bug
      const benign = [
        "Download the React DevTools",
        "Failed to load resource",
        "non-static position", // Framer Motion useScroll on <html>
        "GL Driver Message", // headless WebGL (swiftshader) perf notes
        "scroll-behavior: smooth", // Next.js smooth-scroll notice
        "WebGL",
      ];
      if (benign.some((b) => text.includes(b))) return;
      allErrors.push({ where, type: t, text });
    }
  });
}

async function step(name, fn) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  attach(page, name);
  let ok = true;
  let detail = {};
  try {
    detail = (await fn(page)) ?? {};
  } catch (e) {
    ok = false;
    detail = { error: e.message.split("\n")[0] };
  }
  results.push({ name, ok, ...detail });
  await ctx.close();
}

/* 1. visit every route, let animations/data settle */
const ROUTES = [
  ["landing", "/"],
  ["dashboard", "/app"],
  ["agents", "/app/agents"],
  ["seasons", "/app/seasons"],
  ["season-detail", "/app/season/s01"],
  ["submit", "/app/submit"],
  ["register", "/app/register"],
  ["passport-mock", "/app/agent/0001"],
  ["passport-backend", "/app/agent/1"],
];
for (const [name, url] of ROUTES) {
  await step(`visit:${name}`, async (page) => {
    await page.goto(BASE + url, { waitUntil: "networkidle" });
    await wait(1800);
    // scroll landing to trigger all sections + scroll-reveals
    if (url === "/") {
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
      });
      await wait(800);
    }
    return { url };
  });
}

/* 2. dashboard: sort toggles + open a live-decision proof */
await step("flow:dashboard-sort+proof", async (page) => {
  await page.goto(BASE + "/app", { waitUntil: "networkidle" });
  await wait(1500);
  for (const s of ["ROI", "Accuracy", "Score"]) {
    await page.getByRole("button", { name: new RegExp(`^${s}$`) }).first().click();
    await wait(300);
  }
  await page.locator("section:has-text('Live decisions') button").first().click();
  await wait(900);
  const modalOpen = (await page.locator("text=Decision Proof").count()) > 0;
  // open explorer link existence
  const explorer = await page.getByRole("link", { name: /Mantle Explorer/i }).count();
  return { modalOpen, explorerLink: explorer > 0 };
});

/* 3. the exact flow that errored: run demo -> submit -> back to dashboard */
await step("flow:run-demo+submit+dashboard", async (page) => {
  await page.goto(BASE + "/app/submit", { waitUntil: "networkidle" });
  await wait(1200);
  await page.getByRole("button", { name: /Run demo agent/i }).click();
  await wait(1400);
  await page.getByRole("button", { name: /Connect wallet to log/i }).click();
  await wait(1100);
  await page.getByRole("button", { name: /Submit Proof on Mantle/i }).click();
  await page.locator("text=Decision logged on Mantle").waitFor({ timeout: 6000 });
  await page.getByRole("link", { name: /Back to dashboard/i }).click();
  await page.waitForURL("**/app");
  await wait(1600);
  const newPill = await page
    .locator("section:has-text('Live decisions') >> text=NEW")
    .count();
  // re-run twice more to stress the feed/dedupe (reconnect wallet each time,
  // since a full page load resets the mock wallet context)
  for (let i = 0; i < 2; i++) {
    await page.goto(BASE + "/app/submit", { waitUntil: "networkidle" });
    await wait(900);
    await page.getByRole("button", { name: /Run demo agent/i }).click();
    await wait(1200);
    const connect = page.getByRole("button", { name: /Connect wallet to log/i });
    if (await connect.count()) {
      await connect.click();
      await wait(1100);
    }
    await page.getByRole("button", { name: /Submit Proof on Mantle/i }).click();
    await page.locator("text=Decision logged on Mantle").waitFor({ timeout: 6000 });
    await page.getByRole("link", { name: /Back to dashboard/i }).click();
    await page.waitForURL("**/app");
    await wait(1400);
  }
  // open the freshly-logged decision to confirm no dup-key / render error
  await page.locator("section:has-text('Live decisions') button").first().click();
  await wait(700);
  return { newPill };
});

/* 4. register full flow */
await step("flow:register", async (page) => {
  await page.goto(BASE + "/app/register", { waitUntil: "networkidle" });
  await wait(1000);
  await page.getByPlaceholder("MantaScout").fill("TestBot");
  await page.locator("main").getByRole("button", { name: /connect wallet/i }).click();
  await page.locator("text=0x12A4").first().waitFor({ timeout: 6000 });
  await page.getByRole("button", { name: /Continue/i }).click();
  await page.locator("text=Strategy type").waitFor({ timeout: 4000 });
  await page.getByRole("button", { name: /Continue/i }).click();
  await page.locator("text=Review & mint").waitFor({ timeout: 4000 });
  await page.getByRole("button", { name: /Mint passport/i }).click();
  await page.locator("text=Passport minted").waitFor({ timeout: 6000 });
  return { minted: true };
});

/* 5. join season (the keep-open confirmation) */
await step("flow:join-season", async (page) => {
  await page.goto(BASE + "/app/season/s01", { waitUntil: "networkidle" });
  await wait(1200);
  await page.getByRole("button", { name: /Join season/i }).click();
  await wait(400);
  await page.locator("text=Enroll an agent").waitFor({ timeout: 3000 });
  const firstAgent = page.locator("text=Enroll an agent").locator("..").locator("button").first();
  await firstAgent.click();
  await page.locator("text=joined this season").waitFor({ timeout: 5000 });
  return { joined: true };
});

/* 6. passport history modal */
await step("flow:passport-history", async (page) => {
  await page.goto(BASE + "/app/agent/1", { waitUntil: "networkidle" });
  await wait(1600);
  const btn = page.locator("section:has-text('Decision history') button").first();
  if (await btn.count()) {
    await btn.click();
    await wait(800);
  }
  return { ok: true };
});

await browser.close();

/* ── report ── */
console.log("\n=== FLOW RESULTS ===");
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}  ${JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k]) => !["name", "ok"].includes(k))))}`);
}
console.log(`\n=== CONSOLE / PAGE ERRORS (${allErrors.length}) ===`);
if (!allErrors.length) console.log("  none ✓");
for (const e of allErrors.slice(0, 30)) {
  console.log(`  [${e.where}] ${e.type}: ${e.text.slice(0, 160)}`);
}
process.exit(allErrors.length || results.some((r) => !r.ok) ? 1 : 0);
