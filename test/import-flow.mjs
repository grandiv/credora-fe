import { chromium } from "playwright";
const b = await chromium.launch();
const errs=[]; const r={};
const ctx = await b.newContext({viewport:{width:1280,height:900}});
const p = await ctx.newPage();
p.on("pageerror",e=>errs.push("PAGEERR "+e.message));
p.on("console",m=>m.type()==="error"&&!/(GL Driver|WebGL|non-static|smooth|Failed to load resource)/.test(m.text())&&errs.push("CONSOLE "+m.text()));

// 1. strategy accounts directory shows backend accounts
await p.goto("http://localhost:3000/app/strategy-accounts",{waitUntil:"networkidle"});await p.waitForTimeout(1500);
const dirBody = await p.textContent("body");
r.directory = { hasImported: dirBody.includes("AlphaMaster")||dirBody.includes("Smart Wallet"), importBtn: await p.getByRole("link",{name:/Import track record/i}).count()>0 };

// 2. open an account proof page
await p.locator("a[href^='/app/strategy-account/']").first().click();await p.waitForTimeout(1500);
const proofBody = await p.textContent("body");
r.proofPage = { hasScore: proofBody.includes("Credora Score"), hasDataHash: proofBody.includes("Data hash"), hasVerification: proofBody.includes("Verification proof") };

// 3. full import flow
await p.goto("http://localhost:3000/app/import",{waitUntil:"networkidle"});await p.waitForTimeout(1200);
await p.getByPlaceholder("AlphaMaster 30D").fill("E2E AlphaBot");
await p.getByPlaceholder("master-trader-001").fill("e2e-alphabot-001");
await p.getByRole("button",{name:/Import & score/i}).click();
await p.locator("text=Track record imported").waitFor({timeout:8000});
const okBody = await p.textContent("body");
r.import = { success: okBody.includes("Track record imported"), gotScore: /\d+\.\d/.test(okBody) };
// navigate to its proof from success
await p.getByRole("link",{name:/View proof/i}).click();await p.waitForTimeout(1500);
r.import.proofOpens = (await p.textContent("body")).includes("Verification proof");

r.errors = errs.slice(0,5);
await b.close();
console.log(JSON.stringify(r,null,2));
