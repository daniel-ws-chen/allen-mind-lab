#!/usr/bin/env node
"use strict";
// Manifest-driven full-hall browser acceptance: all articles desktop + mobile samples.
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const base = process.env.AML_TEST_BASE || "http://127.0.0.1:8765";
const noExt = value => new URL(value, base).pathname.replace(/\.html$/, "");
(async () => {
  const manifest = await (await fetch(base + "/data/articles-manifest.json")).json();
  const articles = manifest.articles;
  assert.equal(manifest.counts.total, articles.length);
  const browser = await chromium.launch({headless: true});
  let passed = 0;
  const failures = [];
  try {
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const widths = i % 8 === 0 ? [1280, 390] : [1280];
      for (const width of widths) {
        const page = await browser.newPage({ viewport: {width, height: 820}, reducedMotion: "reduce" });
        try {
          const response = await page.goto(base + article.articlePath, {waitUntil: "domcontentloaded", timeout: 12000});
          assert.equal(response?.status(), 200);
          await page.locator('.aml-article-footer-nav[data-aml-unified-footer="yes"]').waitFor({timeout: 10000});
          const footer = page.locator(".aml-article-footer-nav");
          assert.equal(await footer.count(), 1);
          const grid = footer.locator(".aml-article-footer-nav__grid");
          const children = grid.locator(":scope > *");
          assert.equal(await children.count(), 3, "three standard columns");
          const previous = children.nth(0);
          const center = children.nth(1);
          const next = children.nth(2);
          assert.ok(await previous.getAttribute("class").then(x => x.includes("card--prev")));
          assert.ok(await center.getAttribute("class").then(x => x.includes("__hub")));
          assert.ok(await next.getAttribute("class").then(x => x.includes("card--next")));
          const expectedPrevious = articles[i + 1], expectedNext = articles[i - 1];
          if (expectedPrevious) {
            assert.equal(noExt(await previous.getAttribute("href")), noExt(expectedPrevious.articlePath), "previous article");
            assert.equal((await previous.innerText()).includes(expectedPrevious.title), true);
          } else {
            assert.equal(await previous.locator("a").count(), 0);
          }
          if (expectedNext) {
            assert.equal(noExt(await next.getAttribute("href")), noExt(expectedNext.articlePath), "next article");
            assert.equal((await next.innerText()).includes(expectedNext.title), true);
          } else {
            assert.equal(await next.locator("a").count(), 0);
          }
          assert.equal(await center.locator('a[href="/' + article.primaryDomain + '.html"]').count(), 1);
          assert.equal(await center.locator('a[href="/library.html"]').count(), 1);
          assert.equal(await footer.locator('a[href="#top"]').count(), 1);
          const body = await page.locator("body");
          assert.equal(await body.getAttribute("id"), "top");
          const buttons = await page.locator("button").allTextContents();
          assert.ok(buttons.some(x => x.includes("分享文章")), "share action preserved");
          assert.ok(buttons.some(x => x.includes("複製連結")), "copy action preserved");
          assert.equal(await page.locator(".aml-related-reading:visible").count(), 0, "no related-reading cards");
          if (width === 390) {
            const geometry = await footer.evaluate(node => {
              const rect = node.getBoundingClientRect();
              return {left: rect.left, right: rect.right, viewport: innerWidth};
            });
            assert.ok(geometry.left >= -1 && geometry.right <= geometry.viewport + 1,
              "footer within mobile viewport: " + JSON.stringify(geometry));
          }
          passed++;
        } catch (error) {
          failures.push(article.slug + " / " + width + "px: " + error.message);
        } finally {await page.close();}
      }
      if ((i + 1) % 20 === 0) process.stdout.write("Checked " + (i + 1) + "/" + articles.length + " articles\n");
    }
    if (failures.length) throw Error(failures.slice(0, 25).join("\n") + "\nTOTAL FAILURES " + failures.length);
    process.stdout.write("PASS unified AML navigation: " + passed + " article/viewport combinations (" + articles.length + " articles)\n");
  } finally {await browser.close();}
})().catch(error => {console.error(error); process.exitCode = 1;});
