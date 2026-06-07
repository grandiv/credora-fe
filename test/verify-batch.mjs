import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const b = await chromium.launch();
const errs = [];
const r = {};

// ---- a11y across all pages ----
const PAGES = [["landing","/"],["dash","/app"],["seasons","/app/seasons"],["season","/app/season/s01"],["submit","/app/submit"],["register","/app/register"],["passport","/app/agent/0001"]];
let a11yTotal = 0; const a11y = {};
for (const [n,u] of PAGES){
  const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
  await p.goto("http://localhost:3000"+u,{waitUntil:"networkidle"}); await p.waitForTimeout(900);
  const res = await new AxeBuilder({page:p}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
  const inst = res.violations.reduce((s,v)=>s+v.nodes.length,0); a11yTotal+=inst;
  a11y[n]= inst + (inst?(" ["+res.violations.map(v=>v.id).join(",")+"]"):"");
  await p.context().close();
}
r.a11y = a11y; r.a11yTotal = a11yTotal;

// ---- mobile overflow on all pages ----
const ov = {};
for (const [n,u] of PAGES){
  const p = await (await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})).newPage();
  await p.goto("http://localhost:3000"+u,{waitUntil:"networkidle"}); await p.waitForTimeout(700);
  ov[n] = await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1) ? "OVF" : "ok";
  await p.context().close();
}
r.mobileOverflow = ov;

// ---- flow: run demo agent -> submit -> dashboard shows NEW ----
const ctx = await b.newContext({viewport:{width:1280,height:900}});
const p = await ctx.newPage();
p.on("pageerror",e=>errs.push("PAGEERR "+e.message));
p.on("console",m=>m.type()==="error"&&errs.push("CONSOLE "+m.text()));
await p.goto("http://localhost:3000/app/submit",{waitUntil:"networkidle"}); await p.waitForTimeout(700);
await p.getByRole("button",{name:/Run demo agent/i}).click(); await p.waitForTimeout(400);
const generated = await p.locator("text=review and submit").count() > 0;
// connect wallet then submit
await p.getByRole("button",{name:/Connect wallet to log/i}).click();
await p.waitForTimeout(1100);
await p.getByRole("button",{name:/Submit Proof on Mantle/i}).click();
await p.locator("text=Decision logged on Mantle").waitFor({timeout:5000});
r.submitFlow = { generated, logged: true };
await ctx.close();

// ---- proof modal shows rationale + data hash ----
const c2 = await b.newContext({viewport:{width:1280,height:900}});
const p2 = await c2.newPage();
await p2.goto("http://localhost:3000/app/agent/0001",{waitUntil:"networkidle"}); await p2.waitForTimeout(1200);
await p2.locator("section:has-text('Decision history') button").first().click(); await p2.waitForTimeout(700);
r.proofModal = {
  rationaleHash: await p2.locator("text=Rationale hash").count()>0,
  dataSnapshot: await p2.locator("text=Data snapshot").count()>0,
};
await c2.close();

// ---- join season ----
const c3 = await b.newContext({viewport:{width:1280,height:900}});
const p3 = await c3.newPage();
await p3.goto("http://localhost:3000/app/season/s01",{waitUntil:"networkidle"}); await p3.waitForTimeout(900);
await p3.getByRole("button",{name:/Join season/i}).click(); await p3.waitForTimeout(400);
await p3.locator("text=Enroll an agent").waitFor({timeout:3000});
await p3.getByRole("button",{name:/MantaScout/}).click();
await p3.locator("text=joined this season").waitFor({timeout:4000});
r.joinSeason = true;
await c3.close();

// ---- winRate + accuracy both visible on passport ----
const c4 = await b.newContext({viewport:{width:1280,height:900}});
const p4 = await c4.newPage();
await p4.goto("http://localhost:3000/app/agent/0001",{waitUntil:"networkidle"}); await p4.waitForTimeout(800);
r.bothMetrics = { accuracy: await p4.locator("text=Accuracy").count()>0, winRate: await p4.locator("text=Win rate").count()>0 };
await c4.close();

r.errors = errs;
await b.close();
console.log(JSON.stringify(r,null,2));
