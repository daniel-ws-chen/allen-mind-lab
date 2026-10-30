#!/usr/bin/env node
"use strict";
/** Automated axe-core scan for AML simulator. This is not an accessibility certification. */
const {chromium}=require("playwright");
const {AxeBuilder}=require("@axe-core/playwright");
const path=require("node:path");
const assert=require("node:assert/strict");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  for(const width of [320,390,1280]){
   const page=await browser.newPage({viewport:{width,height:850}});
   await page.goto("file://"+path.resolve(__dirname,"index.html"));
   const scan=async(label)=>{
    const result=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]).analyze();
    const issues=result.violations.map(v=>v.id+"("+v.impact+"): "+v.nodes.length+" elements");
    assert.equal(issues.length,0,label+" accessibility violations: "+issues.join(", "));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1),false,label+" horizontal overflow");
   };
   await scan(width+"px entry");
   await page.getByRole("button",{name:"PBS 正向行為支持"}).click();
   await scan(width+"px stage");
   await page.locator("#actions button").first().click();
   await scan(width+"px outcome");
   await page.close();
  }
  console.log("PASS: axe-core automated WCAG A/AA checks on entry, decision and outcome states at three viewport widths.");
  console.log("Manual assistive technology, contrast judgment, content review, zoom and device tests remain required.");
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
