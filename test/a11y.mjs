import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  ["landing", "http://localhost:3100/"],
  ["dashboard", "http://localhost:3100/app"],
  ["agents", "http://localhost:3100/app/agents"],
  ["passport", "http://localhost:3100/app/agent/0001"],
  ["register", "http://localhost:3100/app/register"],
];

const b = await chromium.launch();
const summary = {};
for (const [name, url] of PAGES) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const results = await new AxeBuilder({ page: p })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  summary[name] = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    n: v.nodes.length,
    help: v.help,
    sample: v.nodes[0]?.target?.[0],
  }));
  await ctx.close();
}
b.close();
let total = 0;
for (const [pg, vs] of Object.entries(summary)) {
  console.log(`\n## ${pg} — ${vs.length} violation type(s)`);
  for (const v of vs) {
    total += v.n;
    console.log(`  [${v.impact}] ${v.id} ×${v.n} — ${v.help}`);
    console.log(`      e.g. ${v.sample}`);
  }
}
console.log(`\nTOTAL violation instances: ${total}`);
