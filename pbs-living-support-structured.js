(()=>{"use strict";
const $=id=>document.getElementById(id),container=$("structuredRows"),goals=$("goals"),kind=$("kind");
const examples={"個人作息":[["07:00","起床","口語提醒"],["07:10","刷牙、洗臉","圖卡提示"],["07:30","吃早餐","依需要協助"],["早餐後","整理餐具","手勢提示"],["21:00","準備就寢","口語提醒"]],"任務步驟":[["","拿取牙刷","圖卡提示"],["","擠牙膏","必要時協助"],["","刷牙","依本人能力提示"],["","清洗牙刷","手勢提示"]]};
let activeKind="",rows=[];
function make(tag,text){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
function input(parent,label,value,max,key,row){const l=make("label",label),n=make("input");n.type="text";n.maxLength=max;n.value=value;n.dataset.field=key;n.addEventListener("input",()=>{row[key]=n.value;sync();});l.append(n);parent.append(l);}
function sync(){if(!activeKind)return;const value=rows.map(r=>r.activity.trim()).filter(Boolean).join("\n");if(goals.value!==value){goals.value=value;goals.dispatchEvent(new Event("input",{bubbles:true}));goals.dispatchEvent(new Event("change",{bubbles:true}));}}
function draw(){container.replaceChildren();rows.forEach((row,i)=>{const f=make("fieldset");f.className="structured-row";f.append(make("legend",(activeKind==="個人作息"?"作息 ":"步驟 ")+(i+1)));const grid=make("div");grid.className="structured-grid";if(activeKind==="個人作息")input(grid,"時間或生活時段（必填）",row.time,40,"time",row);input(grid,activeKind==="個人作息"?"作息活動（必填）":"操作內容（必填）",row.activity,150,"activity",row);f.append(grid);input(f,"提示與協助（選填）",row.help,150,"help",row);const b=make("button","移除此項");b.type="button";b.className="secondary";b.setAttribute("aria-label","移除第 "+(i+1)+" 項");b.onclick=()=>{rows.splice(i,1);draw();sync();$("addStructured").focus();};f.append(b);container.append(f);});$("addStructured").disabled=rows.length>=12;}
function resetRows(data){rows=data.map(([time,activity,help])=>({time,activity,help}));draw();sync();}
function select(next,demonstration=false){const structured=next!=="行為約定";$("structuredGoals").hidden=!structured;$("freeGoalLabel").hidden=structured;$("behaviorHint").hidden=structured;goals.required=!structured;
if(!structured){activeKind="";rows=[];container.replaceChildren();return;}
if(activeKind===next&&!demonstration)return;
const previous=goals.value.split(/\n/).map(x=>x.trim()).filter(Boolean);
activeKind=next;$("structuredHint").textContent=next==="個人作息"?"請依生活順序新增活動，時間可填 07:00、早餐後或午休前；最多 12 項。":"依實際操作順序新增步驟，最多 12 項。";
resetRows(demonstration?examples[next]:previous.length?previous.slice(0,12).map(a=>["",a,""]):[["","",""]]);}
$("addStructured").onclick=()=>{if(rows.length>=12)return;rows.push({time:"",activity:"",help:""});draw();container.lastElementChild.querySelector("input").focus();};
function validate(){if(!activeKind)return true;const i=rows.findIndex(r=>!r.activity.trim()||(activeKind==="個人作息"&&!r.time.trim()));if(!rows.length||i>=0){$("structuredStatus").textContent="請至少新增一項，並填寫每項"+(activeKind==="個人作息"?"時間與作息活動。":"操作內容。");if(i>=0)container.children[i].querySelector("input").focus();return false;}$("structuredStatus").textContent="";sync();return true;}
function get(){return activeKind===kind.value?rows.map(r=>({time:r.time.trim(),activity:r.activity.trim(),help:r.help.trim()})):[];}
function clear(){activeKind="";rows=[];container.replaceChildren();$("structuredStatus").textContent="";$("structuredGoals").hidden=true;$("freeGoalLabel").hidden=false;$("behaviorHint").hidden=false;goals.required=true;}
globalThis.PBSLivingStructured=Object.freeze({select,validate,get,clear});
})();