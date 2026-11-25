(()=>{"use strict";const $=id=>document.getElementById(id),kind=$("kind"),goals=$("goals"),mode=$("mode");let step=0,demo=false;const examples={"個人作息":"起床後刷牙\n早餐後整理餐具","行為約定":"需要休息時，出示休息卡\n想要物品時，使用溝通卡","任務步驟":"拿取牙刷\n擠牙膏\n刷牙後清洗牙刷"};
function change(n,v){if(n.value!==v){n.value=v;n.dispatchEvent(new Event("input",{bubbles:true}));n.dispatchEvent(new Event("change",{bubbles:true}));}}
function selectKind(next){change(kind,next);goals.placeholder=examples[next];document.querySelectorAll("[data-kind]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.kind===next)));$("kindHint").textContent="目前選擇："+next;}
function show(n,focus=true){step=n;$("wizardHome").hidden=n!==0;$("wizardProgress").hidden=n===0;$("wizardChoose").hidden=n!==1;$("plan").hidden=n!==2&&n!==3;$("wizardGoals").hidden=n!==2;$("wizardSupport").hidden=n!==3;$("edit").hidden=n!==4;$("output").hidden=n!==5;$("aiPanel").hidden=n!==5;$("wizardClear").hidden=n===0;$("wizardImport").hidden=true;$("wizardContext").textContent=demo?"引導式教學｜可修改示例資料":"自行製作｜依本人能力及需求調整";document.querySelectorAll("[data-step]").forEach(li=>{const i=Number(li.dataset.step);li.classList.toggle("done",i<n);if(i===n)li.setAttribute("aria-current","step");else li.removeAttribute("aria-current");});if(focus)$([ "startTitle","chooseTitle","goalsTitle","supportTitle","editTitle","outTitle"][n]).focus();}
function lesson(){ $("goalsLesson").textContent=demo?"示範：先閱讀已填好的兩項替代行為與能力描述，也可以試著修改。":"請輸入可觀察、可達成的目標。";$("supportLesson").textContent=demo?"示範：選擇每週及星星兌換。下一步將看到每項目標的建議與增強物設定。":"選擇適合本人的紀錄及增強方式。";}
$("startDemo").onclick=()=>{if(goals.value.trim()&&!confirm("載入示例會取代目前目標，是否繼續？"))return;demo=true;selectKind("行為約定");$("demo").click();$("cost").value="5";$("orientation").value="landscape";lesson();show(1);};
$("startOwn").onclick=()=>{demo=false;lesson();selectKind(kind.value);show(1);};
document.querySelectorAll("[data-kind]").forEach(b=>b.onclick=()=>{if(kind.value!==b.dataset.kind&&goals.value.trim()&&!confirm("切換工具類型？目前目標會保留，請確認是否適合。"))return;selectKind(b.dataset.kind);change(mode,b.dataset.kind==="行為約定"?"exchange":"check");});
$("chooseNext").onclick=()=>show(2);
$("goalsNext").onclick=()=>{const lines=goals.value.split(/\n/).map(x=>x.trim()).filter(Boolean);if(!lines.length||lines.length>12||lines.some(x=>x.length>250)){$("status").textContent="請輸入 1 至 12 項目標，每項最多 250 字。";goals.focus();return;}show(3);};
document.querySelectorAll("[data-back]").forEach(b=>b.onclick=()=>{if(step===4&&!confirm("返回後若修改來源資料，需重新建立草稿；是否繼續？"))return;show(Number(b.dataset.back));});
$("backToEdit").onclick=()=>show(4);$("openImport").onclick=()=>{$("wizardImport").hidden=false;$("importDetails").open=true;$("importTitle").focus();};
$("useSource").addEventListener("click",()=>{if(document.activeElement===goals){demo=false;lesson();show(2);}});
$("discardTransfer").addEventListener("click",()=>show(2));
$("plan").addEventListener("submit",()=>{if(!$("edit").hidden)show(4);});
$("preview").addEventListener("click",()=>{if(!$("output").hidden)show(5);});
document.querySelectorAll("[data-version]").forEach(b=>b.onclick=()=>{change($("version"),b.dataset.version);syncTabs();});function syncTabs(){document.querySelectorAll("[data-version]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.version===$("version").value)));}$("version").addEventListener("change",syncTabs);syncTabs();
$("clearWorkspace").addEventListener("click",()=>{if(!goals.value.trim()&&$("rows").children.length===0){demo=false;show(0);}});
/* Source edits invalidate generated drafts; keep current step but require rebuilding. */
$("edit").addEventListener("input",()=>{if(step===5)show(4);});
selectKind(kind.value);lesson();if(!$("transferNotice").hidden)show(2);else show(0,false);
})();