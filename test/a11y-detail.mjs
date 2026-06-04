import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const PAGES = [["landing","http://localhost:3100/"],["dashboard","http://localhost:3100/app"]];
const b = await chromium.launch();
for (const [name,url] of PAGES){
  const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
  await p.goto(url,{waitUntil:"networkidle"}); await p.waitForTimeout(1200);
  const r = await new AxeBuilder({page:p}).withTags(["wcag2aa","wcag21aa"]).analyze();
  for (const v of r.violations.filter(v=>v.id==="color-contrast")){
    for (const node of v.nodes){
      const d = node.any?.[0]?.data || {};
      console.log(`[${name}] ratio=${d.contrastRatio} need=${d.expectedContrastRatio} fg=${d.fgColor} bg=${d.bgColor} size=${d.fontSize} weight=${d.fontWeight}`);
      console.log(`         text="${(node.html||"").replace(/\s+/g," ").slice(0,90)}"`);
    }
  }
  await p.context().close();
}
b.close();
