import { chromium, devices } from "playwright";
import fs from "node:fs";

const URL = "http://localhost:3000";
const OUT = "/tmp/pw";
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "iphone-se", width: 375, height: 667 },
  { name: "iphone-12", width: 390, height: 844 },
  { name: "pixel-7", width: 412, height: 915 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
];

const results = [];
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.width < 768,
    hasTouch: vp.width < 768,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // 1) horizontal overflow check (the classic mobile killer)
  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    return {
      scrollW: de.scrollWidth,
      clientW: de.clientWidth,
      overflowing: de.scrollWidth > de.clientWidth + 1,
    };
  });

  // 2) navbar audit
  const nav = await page.evaluate(() => {
    const header = document.querySelector("header");
    const navBar = header?.querySelector("nav");
    const hamburger = document.querySelector('button[aria-label="Open menu"], button[aria-label="Close menu"]');
    const desktopLinks = header?.querySelector(".md\\:flex");
    const rect = navBar?.getBoundingClientRect();
    return {
      headerExists: !!header,
      navWidth: rect ? Math.round(rect.width) : null,
      navRight: rect ? Math.round(rect.right) : null,
      hamburgerVisible: hamburger
        ? getComputedStyle(hamburger).display !== "none" &&
          hamburger.offsetParent !== null
        : false,
      hamburgerLabel: hamburger?.getAttribute("aria-label") ?? null,
    };
  });

  const isMobileVp = vp.width < 768;
  const result = { vp: vp.name, width: vp.width, overflow, nav, errors: [...errors] };

  // 3) interaction: open hamburger on mobile, verify drawer + tap a link
  if (isMobileVp) {
    const btn = page.locator('button[aria-label="Open menu"]');
    const btnCount = await btn.count();
    result.hamburgerFound = btnCount > 0;
    if (btnCount > 0) {
      await btn.tap();
      await page.waitForTimeout(450);
      await page.screenshot({ path: `${OUT}/${vp.name}-nav-open.png` });

      // drawer links visible?
      const drawer = await page.evaluate(() => {
        const links = [...document.querySelectorAll("header a")].filter(
          (a) => a.offsetParent !== null && a.textContent.trim().length,
        );
        // find a nav target link inside the open drawer
        const probTop = document.querySelector('header a[href="#problem"]');
        const r = probTop?.getBoundingClientRect();
        return {
          visibleLinkCount: links.length,
          problemTappable: r ? r.width > 40 && r.height >= 40 : false,
          problemHeight: r ? Math.round(r.height) : null,
        };
      });
      result.drawer = drawer;

      // tap a link, expect it to navigate + close
      const before = page.url();
      await page.locator('header a[href="#agents"]').last().tap();
      await page.waitForTimeout(700);
      const afterHash = await page.evaluate(() => location.hash);
      const stillOpen = await page.evaluate(
        () => !!document.querySelector('button[aria-label="Close menu"]'),
      );
      result.linkNavigatedTo = afterHash;
      result.drawerClosedAfterTap = !stillOpen;
    }
  }

  await page.screenshot({ path: `${OUT}/${vp.name}.png` });
  results.push(result);
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
