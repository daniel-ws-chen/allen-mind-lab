import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {TextEncoder} from "node:util";
const read=p=>readFileSync(p,"utf8");
const files=["pbs-companion-web.js","pbs-living-support.js","pbs-living-support-rules.js","pbs-living-support-import.js","pbs-living-support-cards.js","pbs-living-support-export.js","pbs-living-support-ai.js","pbs-living-support-structured.js","pbs-living-support-start.js"];
for(const f of files){new vm.Script(read(f),{filename:f});console.log("Syntax OK:",f);}
const html=read("pbs-living-support.html"), ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,"Duplicate HTML IDs");
for(const f of files.slice(1)){for(const m of read(f).matchAll(/\$\("([A-Za-z][A-Za-z0-9]*)"\)/g)){if(m[1]!=="pageStyle")assert.ok(ids.includes(m[1]),f+": missing "+m[1]);}}
assert.ok(read("tools.html").includes('href="/pbs-living-support.html"'));
const context=vm.createContext({TextEncoder,Blob,Uint8Array,DataView});vm.runInContext(read("pbs-living-support-rules.js"),context);const suggest=context.PBSLivingRules.suggest;
assert.match(suggest("不可以發脾氣").warning,/替代行為/);assert.equal(suggest("不可以使用休息卡").condition,"");assert.match(suggest("使用休息卡").easy,/休息卡/);assert.equal(suggest("全新未知項目").condition,"");
vm.runInContext(read("pbs-living-support-export.js"),context);
const para=(tagName,textContent)=>({tagName,textContent,closest:()=>null});
const blob=await context.PBSLivingExport.build({children:[para("H2","匿名測試 & < >"),para("P","行為約定\n第二行")]}, "landscape");
const data=Buffer.from(await blob.arrayBuffer());assert.equal(data.readUInt32LE(0),0x04034b50);let off=0;const entries={};while(data.readUInt32LE(off)===0x04034b50){const size=data.readUInt32LE(off+18),n=data.readUInt16LE(off+26),extra=data.readUInt16LE(off+28),name=data.subarray(off+30,off+30+n).toString(),start=off+30+n+extra;assert.equal(data.readUInt16LE(off+8),0);entries[name]=data.subarray(start,start+size).toString();off=start+size;}
assert.equal(Object.keys(entries)[0],"mimetype");assert.equal(entries.mimetype,"application/vnd.oasis.opendocument.text");assert.match(entries["content.xml"],/匿名測試 &amp; &lt; &gt;/);assert.match(entries["content.xml"],/<text:line-break\/>/);assert.match(entries["styles.xml"],/fo:page-width="29.7cm"/);assert.ok(entries["META-INF/manifest.xml"]);assert.equal(data.readUInt32LE(off),0x02014b50);
console.log("Static structure, PBS rules, and text-only ODT package smoke tests passed.");
vm.runInContext(read("pbs-living-support-ai.js"),context);
const ai=context.PBSLivingAI;
const item={goal:"需要休息時使用休息卡",easy:"我可以拿休息卡",condition:"有需要時使用卡片",prompt:"依能力提示"};
assert.equal(ai.parse(JSON.stringify({items:[item]}),1)[0].goal,item.goal);
assert.throws(()=>ai.parse(JSON.stringify({items:[item]}),2));
assert.throws(()=>ai.parse(JSON.stringify({items:[{...item,condition:""}]}),1));
assert.throws(()=>ai.parse(JSON.stringify({items:[{...item,goal:"x".repeat(251)}]}),1));
assert.match(ai.task(["休息卡"],"可理解圖卡","行為約定"),/不要/);
console.log("AI collaboration schema tests passed.");
