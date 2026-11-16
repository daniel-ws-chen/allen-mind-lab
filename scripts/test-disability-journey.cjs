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
      // AML 3.6: each published core reading must retain the recovered
      // longform body and its learning-progress completion exit.
      const articleSlugs=[
        "disability-system-map", "icf-life-function",
        "disability-profiles-service-focus", "support-not-doing-for",
        "behavior-as-message-pbs", "disability-communication-skills",
        "aac-more-than-speech", "disability-aging-care",
        "disability-service-field-judgment"
      ];
      for(let index=0;index<units.length;index++){
        const unit=units[index],slug=articleSlugs[index];
        const articleResponse=await page.goto(base+"/articles/"+slug+".html?course=disability&lesson="+unit.id);
        assert.equal(articleResponse.status(),200,"Core article HTTP "+slug);
        assert.ok(await page.locator("main h2[id^='section-']").count()>=8,
          "Restored core article has full chapter headings: "+slug);
        const length=await page.locator("main").evaluate(node=>node.innerText.length);
        assert.ok(length>=2800,"Restored article body is unexpectedly short: "+slug+" ("+length+")");
        const done=page.locator('a[href="/disability-self-study.html#lesson-'+unit.id+'"]');
        assert.equal(await done.count(),1,"Reading completion link preserved "+slug);
        await done.click();
        await page.waitForURL(url=>url.pathname==="/disability-self-study.html");
        const marked=await page.evaluate(id=>{
          const state=JSON.parse(localStorage.getItem("amlDisabilitySelfStudyV1")||"{}");
          return state.articles?.[id]===true;
        },unit.id);
        assert.ok(marked,"Article reading completion is persisted "+slug);
      }
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
          assert.equal(await page.locator("[data-next]").isVisible(),false,"Next button hidden before answering "+unit.id+" Q"+(i+1));
          assert.equal(await page.locator("[data-finish]").isVisible(),false,"Finish hidden until final answer "+unit.id+" Q"+(i+1));
          assert.equal(await page.locator("[data-options] button").count(),4,"Four options "+unit.id);
          const answer=lesson.questions[i].options[lesson.questions[i].answer];
          await page.getByRole("button",{name:answer,exact:true}).click();
          assert.match(await page.locator("[data-feedback]").innerText(),/答對了/,"Correct answer "+unit.id);
          if(i<lesson.questions.length-1){
            assert.equal(await page.locator("[data-next]").isVisible(),true,"Next visible after a non-final answer "+unit.id);
            await page.locator("[data-next]").click();
          }
        }
        assert.equal(await page.locator("[data-next]").isVisible(),false,"Next hidden after last answer "+unit.id);
        assert.equal(await page.locator("[data-step]").innerText(),lesson.questions.length+" / "+lesson.questions.length,"Question counter never exceeds total "+unit.id);
        assert.ok(await page.locator("[data-finish]").isVisible(),"Finish action appears "+unit.id);
        const complete=await page.evaluate(id => {
          const x=JSON.parse(localStorage.getItem("amlDisabilitySelfStudyV1")||"{}");
          return x.games?.[id]===true;
        },unit.id);
        assert.ok(complete,"Unit quiz progress is stored "+unit.id);
      }
      // A passed learner must reopen their certificate without repeating 15 questions.
      const certUrl=base+"/disability-self-study-quiz.html";
      await page.goto(certUrl);
      await page.evaluate(()=>{
        const key="amlDisabilitySelfStudyV1",s=JSON.parse(localStorage.getItem(key)||"{}");
        s.quiz={passed:true,score:13,date:"2026-11-16T07:00:00.000Z",certificateId:"AML-DS-20261116-TEST01",name:"驗收測試"};
        localStorage.setItem(key,JSON.stringify(s));
      });
      await page.reload();
      assert.equal(await page.locator("[data-quiz]").isVisible(),false,"Passed learners do not need to restart the exam");
      assert.equal(await page.locator("[data-certificate]").isVisible(),true,"Saved completion certificate visible");
      assert.equal(await page.locator("[data-cert-name]").innerText(),"驗收測試","Certificate restores saved name");
      assert.equal(await page.locator("[data-cert-id]").innerText(),"AML-DS-20261116-TEST01","Certificate restores saved ID");
      assert.equal(await page.locator("[data-print]").isVisible(),true,"Certificate can be printed again");
      await page.evaluate(()=>{
        const key="amlDisabilitySelfStudyV1",s=JSON.parse(localStorage.getItem(key));
        s.quiz.name=null;s.quiz.certificateId=null;
        localStorage.setItem(key,JSON.stringify(s));
      });
      await page.reload();
      assert.equal(await page.locator("[data-certificate-panel]").isVisible(),true,"Passed learner without certificate can create one");
      assert.equal(await page.locator("[data-certificate]").isVisible(),false,"Unissued certificate stays hidden");
      await page.locator("[data-name]").fill("補發測試");
      await page.locator("[data-generate]").click();
      assert.equal(await page.locator("[data-certificate]").isVisible(),true,"Certificate generated without retaking");
      assert.equal(await page.locator("[data-cert-name]").innerText(),"補發測試","New certificate name saved");
      await page.reload();
      assert.equal(await page.locator("[data-cert-name]").innerText(),"補發測試","New certificate survives reload");
      assert.equal(await page.locator("[data-certificate]").isVisible(),true,"New certificate visible on return");
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
