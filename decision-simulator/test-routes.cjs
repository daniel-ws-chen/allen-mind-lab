#!/usr/bin/env node
"use strict";
/**
 * AML Decision Simulator static route test.
 * Run: node decision-simulator/test-routes.cjs
 * No packages, internet, user data or deployment required.
 * This is NOT a browser, accessibility, security or specialist-content audit.
 */
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const html=fs.readFileSync(path.join(__dirname,"index.html"),"utf8");
const from=html.indexOf("const catalog=");
const to=html.indexOf("function sceneFor(",from);
assert(from>=0&&to>from,"Cannot locate simulator model");
const model=vm.runInNewContext(html.slice(from,to)+"\n({catalog,branchScenes})",{},{timeout:1000});
let routes=0;
for(const [key,domain] of Object.entries(model.catalog)){
  assert.equal(domain.stages.length,3,key+": must contain three stages");
  assert.equal(model.branchScenes[key].length,2,key+": two transition tables");
  for(let stage=0;stage<3;stage++){
    assert.equal(domain.stages[stage].options.length,3,key+": three choices per stage");
    for(const item of domain.stages[stage].options)
      for(const field of ["label","reaction","reflection","tag"])
        assert(typeof item[field]==="string"&&item[field].trim().length>0,key+": missing "+field);
  }
  for(const table of model.branchScenes[key])
    assert.equal(table.length,3,key+": every transition has three possible prior choices");
  for(let first=0;first<3;first++)for(let second=0;second<3;second++)for(let third=0;third<3;third++){
    const choices=[first,second,third];
    for(let stage=0;stage<3;stage++){
      const entry=stage===0?domain.stages[0].scene:
        model.branchScenes[key][stage-1][choices[stage-1]]+" "+domain.stages[stage].scene;
      assert(entry.trim().length>0,key+": empty scene "+choices.join("-"));
      assert(domain.stages[stage].options[choices[stage]],key+": inaccessible option");
    }
    routes++;
  }
}
assert.equal(routes,81);
assert(!/\b(fetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|innerHTML\s*=)/.test(html),"Unexpected browser network/storage/HTML sink in prototype");
console.log("PASS: "+routes+" complete combinations, all branching references, option fields and static policy checks.");
console.log("Not covered: browser interactions, content consistency, assistive technology and WCAG conformity.");
