#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const base = process.env.AML_TEST_BASE || "http://127.0.0.1:8765";

(async () => {
  const browser = await chromium.launch({headless:true});
  try {
    for (const width of [390,1280]) {
      const context = await browser.newContext({viewport:{width,height:850},reducedMotion:"reduce"});
      const page=await context.newPage();
      await page.goto(base+"/disability-self-study.html");
      const units=await page.locator(".lesson-card[data-lesson]").evaluateAll(nodes => nodes.map(n=>({
        id:n.dataset.lesson, link:n.querySelector('a[href*="/tools/disability-self-study/"]')?.getAttribute("href")
      })));
      assert.equal(units.length,9,"Nine disability self-study units");
      for(const unit of units){
        assert.equal(unit.link,"/tools/disability-self-study/?lesson="+unit.id,"Correct quiz URL for "+unit.id);
        const response=await page.goto(base+unit.link);
        assert.equal(response.status(),200,"Quiz HTTP for "+unit.id);
        const lesson=await page.evaluate(id=>window.AML_DISABILITY_LESSONS?.[id],unit.id);
        assert.ok(lesson,"Quiz data exists for "+unit.id);
        assert.ok(lesson.questions.length>=3,"At least three questions "+unit.id);
        await page.locator("[data-question]").waitFor({state:"visible"});
        assert.ok((await page.locator("[data-title]").innerText()).includes(lesson.title),"Quiz heading matches unit "+unit.id);
        for(let i=0;i<lesson.questions.length;i++){
          assert.equal(await page.locator("[data-options] button").count(),4,"Four options "+unit.id);
          const answer=lesson.questions[i].options[lesson.questions[i].answer];
          await page.getByRole("button",{name:answer,exact:true}).click();
          assert.match(await page.locator("[data-feedback]").innerText(),/答對了/,"Correct answer "+unit.id);
          if(i<lesson.questions.length-1)await page.locator("[data-next]").click();
        }
        assert.ok(await page.locator("[data-finish]").isVisible(),"Finish action appears "+unit.id);
        const complete=await page.evaluate(id => {
          const x=JSON.parse(localStorage.getItem("amlDisabilitySelfStudyV1")||"{}");
          return x.games?.[id]===true;
        },unit.id);
        assert.ok(complete,"Unit quiz progress is stored "+unit.id);
      }
      await page.goto(base+"/articles/pbs-emotional-cycle-intervention-timing.html?course=pbs&lesson=strategy");
      const editorial=page.locator("main section.aml-related-reading[aria-label='延伸閱讀']");
      assert.equal(await editorial.count(),1,"One editorial reading section");
      assert.equal(await editorial.locator("a.aml-related-card").count(),3,"Three editorial cards");
      const layout=await editorial.evaluate(el=>{
        const r=el.getBoundingClientRect();
        const h=el.querySelector("h2").getBoundingClientRect();
        return {left:r.left,right:r.right,titleLeft:h.left,titleRight:h.right,viewport:innerWidth};
      });
      assert.ok(layout.left>=-1&&layout.right<=layout.viewport+1,"Editorial box stays within viewport: "+JSON.stringify(layout));
      assert.ok(layout.titleLeft>=layout.left-1&&layout.titleRight<=layout.right+1,"Editorial heading stays within box: "+JSON.stringify(layout));
      await context.close();
      console.log("PASS disability quiz 9/9 + editorial reading at "+width+"px");
    }
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
