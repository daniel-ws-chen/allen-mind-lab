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
        const related = page.locator(".aml-related-reading");
        await related.waitFor({ state: "visible", timeout: 12000 });
        const cards = related.locator("a.aml-related-reading__card");
        assert.equal(await cards.count(), 3, journey.topic + ": three related cards");
        const hrefs = await cards.evaluateAll(nodes => nodes.map(a => new URL(a.href).pathname.replace(/\.html$/, "")));
        assert.equal(new Set(hrefs).size, 3, journey.topic + ": no duplicate recommendation cards");
        const footerHrefs = await page.locator(
          ".aml-article-footer-nav__card--prev[href], .aml-article-footer-nav__card--next[href]"
        ).evaluateAll(nodes => nodes.map(a => new URL(a.href).pathname.replace(/\.html$/, "")));
        // Editorial manual selections are intentionally allowed to repeat an existing footer link.
        const curated = await cards.evaluateAll(nodes => nodes.filter(a =>
          a.querySelector(".aml-related-reading__reason")?.textContent.trim() === "編輯精選延伸"
        ).map(a => new URL(a.href).pathname.replace(/\.html$/, "")));
        for (const href of hrefs) {
          if (!curated.includes(href)) {
            assert.ok(!footerHrefs.includes(href), journey.topic + ": automatic suggestion should not repeat the footer");
          }
        }
        const reasons = await cards.locator(".aml-related-reading__reason").allTextContents();
        assert.equal(reasons.length, 3, journey.topic + ": each card has an explained reason");
        assert.ok(reasons.every(x => x.trim()), journey.topic + ": empty related reason");

        const practice = page.locator(".aml-practice-bridge");
        await practice.waitFor({ state: "visible", timeout: 12000 });
        const practiceLink = practice.locator("a.aml-practice-bridge__btn");
        assert.equal(await practiceLink.count(), 1, journey.topic + ": one practice link");
        const practiceUrl = await practiceLink.getAttribute("href");
        assert.equal(practiceUrl, journey.tool, journey.topic + ": expected practice destination");

        // Verify both interactive destinations are reachable through keyboard or real links.
        await cards.first().focus();
        assert.ok(await cards.first().evaluate(el => document.activeElement === el),
          journey.topic + ": related card can receive keyboard focus");
        const chosen = await cards.first().getAttribute("href");
        await page.keyboard.press("Enter");
        await page.waitForURL(url => url.pathname === new URL(chosen, base).pathname ||
          url.pathname === new URL(chosen, base).pathname.replace(/\.html$/, ""), { timeout: 12000 });
        assert.equal(await page.locator("h1").count(), 1, journey.topic + ": recommended article opens");

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
