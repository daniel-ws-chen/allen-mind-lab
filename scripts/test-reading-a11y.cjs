#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;

const base = process.env.AML_TEST_BASE || "http://127.0.0.1:8765";
const articles = [
  ["PBS", "/articles/pbs-emotion-escalation-deescalation.html"],
  ["Management", "/articles/ot-management-strategy-swot.html"],
  ["AI", "/articles/ai-era-teaching-learning.html"]
];
const sizes = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 900 }
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  let passed = 0;
  try {
    for (const size of sizes) {
      const context = await browser.newContext({
        viewport: { width: size.width, height: size.height },
        reducedMotion: "reduce"
      });
      const page = await context.newPage();
      for (const [topic, route] of articles) {
        await page.goto(base + route, { waitUntil: "domcontentloaded" });
        await page.locator(".aml-related-reading__card").first().waitFor({ state: "visible" });
        await page.locator(".aml-practice-bridge").waitFor({ state: "visible" });
        // Scan the dynamic additions introduced/maintained for the knowledge network.
        const result = await new AxeBuilder({ page })
          .include(".aml-related-reading")
          .include(".aml-practice-bridge")
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        const details = result.violations.map(v =>
          v.id + " (" + v.impact + "): " + v.nodes.map(n => n.target.join(" ")).join(", ")
        );
        assert.deepEqual(details, [], topic + " " + size.name + " axe violations");

        // Emulate the effective CSS width of 1280px at 200% and 400% zoom.
        // This is only a reflow proxy; true browser zoom + assistive technology
        // still require separate manual acceptance before AML 3.6 release.
        for (const width of [640, 320]) {
          await page.setViewportSize({ width, height: 768 });
          const overflowing = await page.evaluate(() => {
            const selectors = [".aml-related-reading", ".aml-practice-bridge"];
            return selectors.flatMap(selector => [...document.querySelectorAll(selector)].flatMap(root => {
              const nodes = [root, ...root.querySelectorAll("a, strong, p, span, h2")];
              return nodes.filter(node => {
                const r = node.getBoundingClientRect();
                return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1);
              }).map(node => selector + " " + node.tagName.toLowerCase() + " " + node.className);
            }));
          });
          assert.deepEqual(overflowing, [], topic + ": component protrudes at " + width + "px viewport");
        }
        await page.setViewportSize({ width: size.width, height: size.height });
        process.stdout.write("PASS axe/reflow " + topic + " / " + size.name + "\n");
        passed++;
      }
      await context.close();
    }
    process.stdout.write("AML 3.6 focused axe/reflow: " + passed + "/6 passed\n");
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
