#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const base = process.env.AML_TEST_BASE || "http://127.0.0.1:8765";
const cases = [
  { topic: "PBS", article: "/articles/pbs-emotion-escalation-deescalation.html", tool: "/tools/pbs/" },
  { topic: "Management", article: "/articles/ot-management-strategy-swot.html", tool: "/tools/management-coach/" },
  { topic: "AI", article: "/articles/ai-era-teaching-learning.html", tool: "/tools/ai/" }
];
const viewports = [
  { width: 390, height: 844 },
  { width: 1280, height: 900 }
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  let passed = 0;
  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
      for (const journey of cases) {
        const response = await page.goto(base + journey.article, { waitUntil: "domcontentloaded" });
        assert.equal(response.status(), 200, journey.topic + ": article HTTP status");
        assert.equal(await page.locator("h1").count(), 1, journey.topic + ": one main heading");
        // Related-reading recommendations were intentionally retired site-wide.
        assert.equal(await page.locator(".aml-related-reading, [data-aml-auto-related]").count(), 0,
          journey.topic + ": recommendation block must be absent");
        assert.equal(await page.locator("main #section-related").count(), 0,
          journey.topic + ": no legacy related-reading heading");
        const footer = page.locator(".aml-article-footer-nav");
        assert.equal(await footer.count(), 1, journey.topic + ": keep footer navigation");
        const footerLinks = footer.locator("a[href]");
        assert.ok(await footerLinks.count() > 0, journey.topic + ": keep navigation links");
        assert.ok(await page.locator('[data-aml-share], #aml-share').count() > 0,
          journey.topic + ": preserve share button");
        assert.ok(await page.locator('[data-aml-copy-link], #aml-copy').count() > 0,
          journey.topic + ": preserve copy-link button");

        const practice = page.locator(".aml-practice-bridge");
        await practice.waitFor({ state: "visible", timeout: 12000 });
        const practiceLink = practice.locator("a.aml-practice-bridge__btn");
        assert.equal(await practiceLink.count(), 1, journey.topic + ": one practice link");
        const practiceUrl = await practiceLink.getAttribute("href");
        assert.equal(practiceUrl, journey.tool, journey.topic + ": expected practice destination");

        // Practice link remains keyboard accessible after recommendations are removed.
        await practiceLink.focus();
        assert.ok(await practiceLink.evaluate(el => document.activeElement === el),
          journey.topic + ": practice link can receive keyboard focus");

        const toolResponse = await page.goto(base + journey.tool, { waitUntil: "domcontentloaded" });
        assert.equal(toolResponse.status(), 200, journey.topic + ": practice page HTTP status");
        assert.ok((await page.title()).trim().length > 0, journey.topic + ": tool has page title");
        passed++;
        process.stdout.write("PASS " + journey.topic + " / " + viewport.width + "px\n");
      }
      await page.close();
    }
    process.stdout.write("AML 3.6 browser journey checks: " + passed + " / 6 passed\n");
  } finally {
    await browser.close();
  }
})().catch(err => { console.error(err); process.exitCode = 1; });
