#!/usr/bin/env node
"use strict";
const { chromium } = require("playwright");
const path = require("node:path");
const assert = require("node:assert/strict");

(async()=>{
  const browser=await chromium.launch({headless:true});
  let paths=0;
  try {
    for(const viewport of [{width:390,height:844},{width:1280,height:900}]){
      const page=await browser.newPage({viewport, reducedMotion:"reduce"});
      const errors=[];
      page.on("pageerror",e=>errors.push(e.message));
      await page.goto("file://"+path.resolve(__dirname,"index.html"));
      // Verify natural Tab and Shift+Tab navigation from the focused stage heading.
      assert.equal(await page.locator("#stepTitle").evaluate(e=>document.activeElement===e),true,"initial heading must receive focus");
      await page.keyboard.press("Tab");
      assert.equal(await page.locator("#actions button").first().evaluate(e=>document.activeElement===e),true,"Tab should reach first option");
      await page.keyboard.press("Tab");
      assert.equal(await page.locator("#actions button").nth(1).evaluate(e=>document.activeElement===e),true,"Tab should reach second option");
      await page.keyboard.press("Shift+Tab");
      assert.equal(await page.locator("#actions button").first().evaluate(e=>document.activeElement===e),true,"Shift+Tab should return to first option");
      await page.locator("#stepTitle").focus();
      for(const [label,idx] of [["PBS 正向行為支持",0],["管理學",1],["身心障礙服務知能",2]]){
        // Independent complete three-stage pathway on each viewport.
        await page.getByRole("button",{name:label,exact:true}).click();
        for(let stage=1;stage<=3;stage++){
          if(label==="PBS 正向行為支持" && stage===2){
            const narrative=await page.locator("#body").innerText();
            assert.match(narrative,/待驗證的行為功能假設/,"PBS dual functions must remain hypotheses");
          }
          const heading=page.locator("#stepTitle");
          await heading.waitFor();
          assert.match(await heading.innerText(),new RegExp("第 "+stage+" / 3 階段"));
          assert.equal(await heading.evaluate(e=>document.activeElement===e),true,"heading focus must move after navigation");
          const buttons=page.locator("#actions button");
          assert.equal(await buttons.count(),4,"three options + leave action");
          await buttons.nth((idx+stage-1)%3).click();
          assert.match(await heading.innerText(),/模擬推演/);
          assert.match(await page.locator("#body").innerText(),/專家觀點（情境示意）/);
          assert.equal(await page.locator("#body .info-block.info-expert").count(),1,"expert feedback highlighted");
          assert.equal(await page.locator("#body .info-block.info-next").count(),1,"next action highlighted");
          assert.match(await page.locator("#body").innerText(),/可以再試什麼/);
          assert.equal(await heading.evaluate(e=>document.activeElement===e),true,"outcome heading focus");
          assert.equal(await page.locator("#log li").count(),stage);
          if(stage<3)await page.getByRole("button",{name:"繼續下一階段"}).click();
          else await page.getByRole("button",{name:"閱讀本次探索回顧"}).click();
        }
        assert.match(await page.locator("#stepTitle").innerText(),/我的探索回顧/);
        const reviewText=await page.locator("#body").innerText();
        assert.match(reviewText,/三階段專家解析重點/);
        assert.equal(await page.locator("#body .info-block.info-expert").count(),3,"all expert review stages highlighted");
        assert.equal(await page.locator("#body .info-block.info-next").count(),3,"all action stages highlighted");
        assert.match(reviewText,/延伸閱讀｜從模擬走向實務/);
        assert.equal(await page.locator("#body section[aria-label='AML 建議延伸閱讀'] a").count(),3,"three curated article recommendations");
        assert.equal(await page.locator("#body section[aria-label='AML 建議延伸閱讀'] li").count(),3,"three decision-linked reading prompts");
        assert.equal((reviewText.match(/連結您的選擇：/g)||[]).length,3,"each reading relates to selected decision");
        assert.equal(await page.locator("#body section[aria-label='AML 建議延伸閱讀'] a[target='_blank'][rel='noopener noreferrer']").count(),3,"safe external article links");
        assert.equal(await page.locator("#body .info-block.info-expert").count(),3,"every decision has expert review");
        assert.match(reviewText,/安全、自主、參與、時間與資源/,"review should prompt balanced reflection");
        assert.doesNotMatch(reviewText,/您多次選擇/,"review must not infer a user strategy profile");
        await page.getByRole("button",{name:"探索其他領域",exact:true}).click();
        assert.equal(await page.locator("#historyPanel").isHidden(),true,"history must reset");
        paths++;
      }
      // Keyboard-only traversal of one complete scenario, without mouse clicks.
      await page.goto("file://"+path.resolve(__dirname,"index.html"));
      await page.locator("#actions button").first().focus();
      await page.keyboard.press("Enter");
      for(let step=1;step<=3;step++){
        assert.match(await page.locator("#stepTitle").innerText(),new RegExp("第 "+step+" / 3 階段"));
        await page.locator("#actions button").first().focus();
        await page.keyboard.press("Enter");
        assert.equal(await page.locator("#log li").count(),step);
        if(step<3){
          await page.getByRole("button",{name:"繼續下一階段"}).focus();
          await page.keyboard.press("Enter");
        } else {
          await page.getByRole("button",{name:"閱讀本次探索回顧"}).focus();
          await page.keyboard.press("Enter");
        }
      }
      assert.match(await page.locator("#stepTitle").innerText(),/我的探索回顧/);
      await page.getByRole("button",{name:"探索其他領域",exact:true}).focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.locator("#historyPanel").isHidden(),true,"keyboard reset");
      const horizontalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
      assert.equal(horizontalOverflow,false,"horizontal overflow at "+viewport.width);
      assert.deepEqual(errors,[],"browser errors at "+viewport.width);
      await page.close();
    }
    console.log("PASS: "+paths+" pointer-driven explorations plus 2 keyboard-driven complete explorations; focus, reset, stage transitions, no horizontal overflow.");
    console.log("Not covered: NVDA/VoiceOver, human WCAG assessment, physical devices, or all 81 end-to-end choices.");
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
