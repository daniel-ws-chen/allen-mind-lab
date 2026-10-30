#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const uri="file://"+path.resolve(__dirname,"../tools.html");
  for(const width of [390,1280]){
   const context=await browser.newContext({viewport:{width,height:860}});
   const page=await context.newPage();
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto(uri);
   for(const [anchor,label] of [["#lab-halls","互動探索艙"],["#practice-tools","智能支援艙"],["#decision-simulator-bay","決策模擬艙"]]){
    assert.equal(await page.locator(anchor).count(),1,anchor+" target missing");
    assert(await page.locator('a[href="/tools.html'+anchor+'"], a[href="'+anchor+'"]').count()>0,label+" entry missing");
   }
   const mobile=page.locator("#aml-mobile-menu");
   const desktop=page.locator(".aml-desktop-links");
   for(const locator of [mobile,desktop]){
    for(const anchor of ["#lab-halls","#practice-tools","#decision-simulator-bay"]){
     assert.equal(await locator.locator('a[href="/tools.html'+anchor+'"]').count(),1,"missing navigation link "+anchor);
    }
   }
   assert.equal(await page.locator("#decision-simulator-bay a[href='/decision-simulator/']").count(),1,"third bay actual module link");
   assert.equal(await page.locator(".labx-bay-switch a[href='#decision-simulator-bay']").count(),1,"hero third bay entry");
   assert.equal(await page.locator(".labx-bay-switch a").count(),3,"exactly three hero bays");
   assert.equal(await page.locator("#decision-simulator-bay h2").count(),1);
   const actualHorizontalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   assert.equal(actualHorizontalOverflow,false,width+"px horizontal overflow");
   // Existing scripts can request resources not present under file://, so browser console errors aren't a release gate here.
   console.log("PASS lab navigation at "+width+"px; target ids, desktop/mobile links, third bay href, hero links, overflow.");
   await context.close();
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
