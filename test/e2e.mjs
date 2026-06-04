import { chromium } from "playwright";
const b = await chromium.launch();
const errs = [];
const res = {};

// ---------- LANDING + NAV across viewports ----------
const VPS = [
  ["mobile-375", 375, 667, true],
  ["mobile-390", 390, 844, true],
  ["tablet-768", 768, 1024, false],
  ["desktop-1280", 1280, 800, false],
];
res.landing = [];
for (const [name, w, h, mobile] of VPS) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, isMobile:mobile, hasTouch:mobile });
  const p = await ctx.newPage();
  p.on("pageerror", e=>errs.push(`[${name}] PAGEERR ${e.message}`));
  p.on("console", m=>m.type()==="error"&&errs.push(`[${name}] CONSOLE ${m.text()}`));
  await p.goto("http://localhost:3000",{waitUntil:"networkidle"});
  await p.waitForTimeout(1200);
  const overflow = await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  let navOk = true;
  if (mobile) {
    await p.getByRole("button",{name:"Open menu"}).tap();
    await p.waitForTimeout(400);
    await p.locator('header a[href="#agents"]').last().tap();
    await p.waitForTimeout(500);
    const closed = await p.locator('button[aria-label="Close menu"]').count()===0;
    navOk = closed;
  }
  res.landing.push({vp:name, overflow, navOk});
  await ctx.close();
}

// ---------- APP: dashboard, sort, feed modal ----------
const ctx = await b.newContext({ viewport:{width:1280,height:860} });
const p = await ctx.newPage();
p.on("pageerror", e=>errs.push("[app] PAGEERR "+e.message));
p.on("console", m=>m.type()==="error"&&errs.push("[app] CONSOLE "+m.text()));
await p.goto("http://localhost:3000/app",{waitUntil:"networkidle"});
await p.waitForTimeout(2600);
const stats = await p.$$eval("main .font-mono", els=>els.map(e=>e.textContent.trim()).filter(t=>/^\d/.test(t)).slice(0,4));
await p.getByRole("button",{name:/ROI/}).first().click();
await p.waitForTimeout(500);
const topRoi = await p.$eval("main a[href^='/app/agent/'] .font-medium", e=>e.textContent.trim());
await p.locator("section:has-text('Live decisions') button").first().click();
await p.waitForTimeout(500);
res.dashboard = { counters: stats, topAgentByRoi: topRoi, proofModalOpens: await p.locator("text=Decision Proof").count()>0 };
await ctx.close();

// ---------- APP: agent passport history modal ----------
const c2 = await b.newContext({ viewport:{width:1280,height:860} });
const p2 = await c2.newPage();
p2.on("pageerror", e=>errs.push("[passport] PAGEERR "+e.message));
await p2.goto("http://localhost:3000/app/agent/0001",{waitUntil:"networkidle"});
await p2.waitForTimeout(1500);
await p2.locator("section:has-text('Decision history') button").first().click();
await p2.waitForTimeout(500);
res.passport = { historyModalOpens: await p2.locator("text=Decision Proof").count()>0 };
await c2.close();

// ---------- APP: register flow end-to-end ----------
const c3 = await b.newContext({ viewport:{width:1280,height:860} });
const p3 = await c3.newPage();
p3.on("pageerror", e=>errs.push("[register] PAGEERR "+e.message));
await p3.goto("http://localhost:3000/app/register",{waitUntil:"networkidle"});
await p3.fill("input","FluxGuard");
await p3.locator("main").getByRole("button",{name:/connect wallet/i}).click();
await p3.locator("text=0x12A4").first().waitFor({ timeout: 5000 });
const connected = true;
await p3.getByRole("button",{name:/Continue/}).click();
await p3.locator("text=Strategy type").waitFor({ timeout: 4000 });
await p3.getByRole("button",{name:/Continue/}).click();
await p3.locator("text=Review & mint").waitFor({ timeout: 4000 });
await p3.getByRole("button",{name:/Mint passport/}).click();
await p3.locator("text=Passport minted").waitFor({ timeout: 5000 });
res.register = { walletConnected: connected, minted: true };
await c3.close();

// ---------- APP mobile: overflow + sidebar drawer ----------
const c4 = await b.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true });
const p4 = await c4.newPage();
await p4.goto("http://localhost:3000/app",{waitUntil:"networkidle"});
await p4.waitForTimeout(1200);
const ov = await p4.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
await p4.getByRole("button",{name:"Open menu"}).tap();
await p4.waitForTimeout(400);
res.appMobile = { overflow: ov, drawerOpens: await p4.locator("aside a").count()>0 };
await c4.close();

await b.close();
res.consoleErrors = errs;
console.log(JSON.stringify(res, null, 2));
