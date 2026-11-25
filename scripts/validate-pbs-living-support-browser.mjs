import { chromium } from "playwright";
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname} from "node:path";
const root=process.cwd(), mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8"};
const server=createServer(async(req,res)=>{try{const path=resolve(root,"."+new URL(req.url,"http://localhost").pathname);if(!path.startsWith(root+"/")){res.writeHead(403).end();return;}const data=await readFile(path);res.writeHead(200,{"Content-Type":mime[extname(path)]||"application/octet-stream"});res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,"127.0.0.1",r));const base="http://127.0.0.1:"+server.address().port;
const browser=await chromium.launch({headless:true});const context=await browser.newContext({acceptDownloads:true});const page=await context.newPage();const errors=[];page.on("pageerror",e=>errors.push(e.message));await page.route("https://cdn.jsdelivr.net/**",route=>route.abort());
try{
 await page.goto(base+"/pbs-living-support.html");
 await page.locator("#demo").click();await page.locator("#plan button[type=submit]").click();
 assert.equal(await page.locator("#rows fieldset").count(),2);
 await page.locator("#preview").click();assert.match(await page.locator("#status").innerText(),/確認/);
 await page.locator("#reviewed").check();await page.locator("#preview").click();
 assert.equal(await page.locator("#output").isVisible(),true);assert.equal(await page.locator("#paper tbody tr").count(),2);
 await page.locator("#version").selectOption("easy");assert.equal(await page.locator("#paper img").count(),2);
 assert.ok((await page.locator("#paper img").first().getAttribute("alt")).length);
 const download=page.waitForEvent("download");await page.locator("#downloadOdt").click();const d=await download;assert.equal(d.suggestedFilename(),"AML-PBS-easy-read.odt");await d.saveAs("/tmp/aml-pbs-easy-read.odt");
 await page.locator("#version").selectOption("guide");assert.match(await page.locator("#paper").innerText(),/不扣除/);
 await page.locator("#orientation").selectOption("landscape");assert.equal(await page.locator("#output").isVisible(),false);await page.locator("#reviewed").check();await page.locator("#preview").click();
 await page.locator("#version").selectOption("staff");const pdf=await page.pdf({format:"A4",landscape:true,printBackground:true});assert.equal(pdf.subarray(0,5).toString(),"%PDF-");
 await page.goto(base+"/pbs-living-support.html");await page.locator("#importConsent").check();await page.locator("#sourceFile").setInputFiles({name:"sample.txt",mimeType:"text/plain",buffer:Buffer.from("需要休息時使用休息卡\n使用溝通卡表達需求")});await page.locator("#readSource").click();await page.waitForFunction(()=>document.querySelector("#sourceText").value.includes("休息卡"));await page.locator("#useSource").click();assert.match(await page.locator("#goals").inputValue(),/休息卡/);assert.equal(await page.locator("#sourceText").inputValue(),"");
 await page.goto(base+"/pbs-companion-web.html");await page.locator("#targetBehavior").fill("匿名測試行為");await page.locator('input[name="functionClue"][value="escape"]').check();await page.locator("#analyzeBtn").click();assert.ok(await page.locator("#functionAnalysis").innerText());await page.locator("#reportBtn").click();assert.match(await page.locator("#reportOutput").innerText(),/功能假設/);
 await page.locator("#livingCandidates input").first().check();await page.locator("#livingConsent").check();await Promise.all([page.waitForURL("**/pbs-living-support.html"),page.locator("#livingTransfer").click()]);assert.match(await page.locator("#goals").inputValue(),/休息/);assert.equal(await page.evaluate(()=>sessionStorage.getItem("aml-pbs-living-transfer-v1")),null);
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
 assert.deepEqual(errors,[]);console.log("Browser smoke: demo, review, three previews, image ODT download, PDF rendering, TXT import, original PBS analysis/report, transfer, mobile viewport passed.");
}finally{await browser.close();server.close();}
