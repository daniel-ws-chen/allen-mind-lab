(() => {
"use strict";

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const text = id => ($(id)?.value || "").trim();

const rows = $("#abcRows");
let lastAnalysis = null;
let lastReportText = "";
let lastAiPack = "";

function addRow(data={}) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input class="abc-context" type="text" value="${esc(data.context||"")}" placeholder="日期／時段／場域"></td>
    <td><textarea class="abc-a" rows="3" placeholder="前事">${esc(data.a||"")}</textarea></td>
    <td><textarea class="abc-b" rows="3" placeholder="可觀察行為">${esc(data.b||"")}</textarea></td>
    <td><textarea class="abc-c" rows="3" placeholder="行為後發生什麼">${esc(data.c||"")}</textarea></td>
    <td><button class="remove-row" type="button" aria-label="刪除這筆 ABC">刪除</button></td>`;
  tr.querySelector(".remove-row").addEventListener("click", () => tr.remove());
  rows.appendChild(tr);
}

function getRows(){
  return $$("#abcRows tr").map(tr => ({
    context: tr.querySelector(".abc-context").value.trim(),
    a: tr.querySelector(".abc-a").value.trim(),
    b: tr.querySelector(".abc-b").value.trim(),
    c: tr.querySelector(".abc-c").value.trim()
  })).filter(r => r.a || r.b || r.c || r.context);
}

addRow();
$("#addAbcRow").addEventListener("click", () => addRow());

const confirm = $("#deidConfirm");
const fileInput = $("#abcFile");
const parseBtn = $("#parseFileBtn");
const uploadGate = $("#uploadGate");
const fileStatus = $("#fileStatus");

function updateUploadState(){
  const ready = confirm.checked;
  const hasFile = !!fileInput.files?.length;
  fileInput.disabled = !ready;
  parseBtn.disabled = !(ready && hasFile);
  uploadGate.classList.toggle("locked", !ready);
  uploadGate.classList.toggle("ready", ready);

  if(!ready){
    uploadGate.textContent = "🔒 請先確認已完成去識別化";
    fileStatus.textContent = "尚未啟用檔案匯入。";
  }else if(!hasFile){
    uploadGate.textContent = "✓ 可以選擇 Word / Excel";
    fileStatus.textContent = "已完成去識別化確認，請選擇 .docx 或 .xlsx。";
  }else{
    uploadGate.textContent = "✓ 檔案已選擇，可進行解析";
    fileStatus.textContent = `已選擇：${fileInput.files[0].name}。按「③ 解析檔案」開始。`;
  }
}

confirm.addEventListener("change", updateUploadState);
fileInput.addEventListener("change", updateUploadState);
updateUploadState();

function findKey(obj, candidates){
  const keys = Object.keys(obj || {});
  const norm = x => String(x).toLowerCase().replace(/\s+/g,"");
  for (const c of candidates){
    const hit = keys.find(k => norm(k).includes(norm(c)));
    if (hit) return hit;
  }
  return null;
}

function workbookRows(workbook){
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, {defval:""});
  const out = [];
  data.forEach(obj => {
    const ka=findKey(obj,["前事","前因","antecedent","a"]);
    const kb=findKey(obj,["行為","behavior","b"]);
    const kc=findKey(obj,["後果","結果","consequence","c"]);
    const kt=findKey(obj,["日期","時間","時段","場域","情境","date","time"]);
    if (ka || kb || kc) out.push({context:kt?obj[kt]:"",a:ka?obj[ka]:"",b:kb?obj[kb]:"",c:kc?obj[kc]:""});
  });
  return {rows:out, raw: data.map(o => Object.entries(o).map(([k,v])=>`${k}: ${v}`).join(" | ")).join("\n")};
}

function parseDocxTableHtml(html){
  if(!html) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");

  const norm = value => String(value || "")
    .replace(/\s+/g, "")
    .replace(/[（）()]/g, "")
    .toLowerCase();

  const expandRow = tr => {
    const out = [];
    Array.from(tr.cells || []).forEach(cell => {
      const span = Math.max(1, Number(cell.getAttribute("colspan") || 1));
      const text = (cell.textContent || "").replace(/\s+/g, " " ).trim();
      for(let i=0;i<span;i++) out.push(text);
    });
    return out;
  };

  const findIndex = (headers, candidates) => {
    const hs = headers.map(norm);
    for(const candidate of candidates){
      const c = norm(candidate);
      const idx = hs.findIndex(h => h.includes(c));
      if(idx >= 0) return idx;
    }
    return -1;
  };

  // Word 表單常以真正的 table 儲存 ABC，而不是「A：／B：／C：」純文字。
  // 只取第一個可可靠辨識的 ABC 資料表，避免把文件後方的填寫示例也匯入。
  for(const table of Array.from(doc.querySelectorAll("table"))){
    const htmlRows = Array.from(table.rows || []);
    if(htmlRows.length < 2) continue;

    let headerRow = -1;
    let headers = [];
    for(let i=0;i<Math.min(4, htmlRows.length);i++){
      const candidate = expandRow(htmlRows[i]);
      const joined = norm(candidate.join("|"));
      if(joined.includes("前事") && joined.includes("行為") && joined.includes("後果")){
        headerRow = i; headers = candidate; break;
      }
    }
    if(headerRow < 0) continue;

    let ia = findIndex(headers, ["立即前事", "前事", "前因"]);
    let ib = findIndex(headers, ["標的行為問題", "標的行為", "行為問題", "行為"]);
    let ic = findIndex(headers, ["後果", "結果"]);
    const idate = findIndex(headers, ["日期"]);
    const itime = findIndex(headers, ["時間", "時段"]);
    const iplace = findIndex(headers, ["地點", "場域", "情境"]);
    const iact = findIndex(headers, ["課程或活動", "課程活動", "活動"]);
    const ibg = findIndex(headers, ["背景因素", "遠因"]);

    // 常見 PBS 觀察表固定為：日期、時間、地點、活動、背景因素、A、B、C……
    if((ia < 0 || ib < 0 || ic < 0) && headers.length >= 8){
      ia = ia < 0 ? 5 : ia;
      ib = ib < 0 ? 6 : ib;
      ic = ic < 0 ? 7 : ic;
    }
    if(ia < 0 || ib < 0 || ic < 0) continue;

    const parsed = [];
    for(let r=headerRow+1;r<htmlRows.length;r++){
      const cells = expandRow(htmlRows[r]);
      const get = idx => idx >= 0 && idx < cells.length ? String(cells[idx] || "").trim() : "";
      const a = get(ia), b = get(ib), c = get(ic);
      if(!a && !b && !c) continue;

      const date = get(idate), time = get(itime), place = get(iplace), activity = get(iact), bg = get(ibg);
      const when = [date, time].filter(Boolean).join(" " );
      const contextParts = [when, place, activity].filter(Boolean);
      if(bg && norm(bg) !== "無") contextParts.push(`背景因素：${bg}`);
      parsed.push({context:contextParts.join("｜"), a, b, c});
    }
    if(parsed.length) return parsed;
  }
  return [];
}

function parseLabeledText(raw){
  const clean = raw.replace(/\r/g,"");
  const blocks = clean.split(/\n(?=(?:紀錄|事件|ABC)\s*\d+|日期[:：])/i);
  const out=[];
  const grab = (block, label, nextLabels) => {
    const next = nextLabels.map(x=>`(?:${x})`).join("|");
    const re = new RegExp(`(?:^|\\n)\\s*(?:${label})\\s*[:：]\\s*([\\s\\S]*?)(?=\\n\\s*(?:${next})\\s*[:：]|$)`,"i");
    const m=block.match(re); return m?m[1].trim():"";
  };
  blocks.forEach(b=>{
    const a=grab(b,"A\\s*前事|A\\s*前因|前事|前因",["B\\s*行為","行為","C\\s*後果","後果"]);
    const bb=grab(b,"B\\s*行為|行為",["C\\s*後果","後果"]);
    const c=grab(b,"C\\s*後果|後果|結果",["備註","日期","A\\s*前事","前事"]);
    const ctx=(b.match(/(?:日期|時間|情境|場域)\s*[:：]\s*([^\n]+)/i)||[])[1]||"";
    if(a||bb||c) out.push({context:ctx,a,b:bb,c});
  });
  return out;
}

$("#parseFileBtn").addEventListener("click", async () => {
  const file=fileInput.files[0];
  if(!confirm.checked){ alert("請先確認已完成去識別化。"); return; }
  if(!file){ alert("請先選擇檔案。"); return; }
  const status=$("#fileStatus");
  try{
    status.textContent="正在本機解析…";
    const buf=await file.arrayBuffer();
    let parsedRows=[], raw="";
    if(file.name.toLowerCase().endsWith(".xlsx")){
      if(!window.XLSX) throw new Error("Excel 解析元件尚未載入。");
      const wb=XLSX.read(buf,{type:"array"});
      const result=workbookRows(wb); parsedRows=result.rows; raw=result.raw;
    }else if(file.name.toLowerCase().endsWith(".docx")){
      if(!window.mammoth) throw new Error("Word 解析元件尚未載入。");
      // 優先保留 Word 表格結構解析；若不是表格型 ABC，再退回 A：/B：/C：文字辨識。
      const htmlResult=await mammoth.convertToHtml({arrayBuffer:buf});
      parsedRows=parseDocxTableHtml(htmlResult.value||"");
      const textResult=await mammoth.extractRawText({arrayBuffer:buf});
      raw=textResult.value||"";
      if(!parsedRows.length) parsedRows=parseLabeledText(raw);
    }else throw new Error("目前支援 .docx 與 .xlsx。");
    $("#rawImportedText").value=raw;
    if(parsedRows.length){
      rows.innerHTML="";
      parsedRows.forEach(addRow);
      status.textContent=`已解析 ${parsedRows.length} 筆可能的 ABC，請逐筆人工確認。`;
      $("#dataSource").value="ABC紀錄";
    }else{
      status.textContent="已讀取檔案，但未能可靠辨識 ABC 欄位。請檢視原始文字並手動整理。";
    }
  }catch(err){
    status.textContent=`解析失敗：${err.message}`;
  }
});

$("#parseRawBtn").addEventListener("click", () => {
  const raw=$("#rawImportedText").value.trim();
  if(!raw) return;
  const parsed=parseLabeledText(raw);
  if(!parsed.length){ $("#fileStatus").textContent="未辨識出明確 A／B／C 標籤，請手動新增 ABC。"; return; }
  rows.innerHTML=""; parsed.forEach(addRow);
  $("#fileStatus").textContent=`從文字辨識 ${parsed.length} 筆 ABC，請人工確認。`;
});

const functionMeta = {
  attention:{name:"取得關注／互動", reason:"行為後若較常得到他人靠近、說話、安撫或互動，此結果可能具有維持行為的作用。"},
  escape:{name:"逃避／避免", reason:"若行為常在要求、等待、轉換或困難活動後發生，且行為後要求暫停、延後或離開情境，需考慮逃避／避免功能。"},
  tangible:{name:"取得物品／活動／具體結果", reason:"若行為後較常得到特定物品、活動、食物、手機或安排，需考慮取得具體結果的功能。"},
  sensory:{name:"自動／感官增強", reason:"若行為在不同人員或情境下皆可能出現，甚至無人在場時也發生，需考慮行為本身帶來的感官或自我調節結果。"},
  medical:{name:"生理不適／醫療因素需優先排除", reason:"若疼痛、睡眠、排泄、藥物或其他生理狀態與事件時間相關，應先納入背景因素並視需要尋求醫療評估。"},
  unclear:{name:"目前資料不足／可能多重功能", reason:"現有資料尚未形成穩定模式，或不同事件支持不同功能，不宜強迫歸入單一功能。"}
};

function selectedFunctions(){
  return $$('input[name="functionClue"]:checked').map(x=>x.value);
}

function unique(arr){ return [...new Set(arr.filter(Boolean))]; }

function buildStrategies(functions, data){
  let before=[
    "先確認並降低可預測的誘發因素；使用短句、視覺提示、預告與一致流程。",
    "將要求拆小、控制等待時間，提供可理解且有限度的選擇。",
    "建立可使用的求助、拒絕、休息或等待方式，並在平穩時先練習。",
    "持續記錄 ABC、時段、人物、活動與背景因素，確認假設是否穩定。"
  ];
  let during=[
    "先維持安全，降低環境刺激與說話量，由一位主要人員簡短回應。",
    "避免爭辯、說教、反覆追問原因，並依個案狀態調整距離與要求。",
    "若個案能使用替代行為，立即提示最簡單可行的表達方式。",
    "若情緒持續升高，逐步從『教學』轉為『降載與安全支持』。"
  ];
  let after=[
    "恢復平穩後再進行短而具體的修復與回顧，不在高張時要求反省。",
    "當替代行為出現時，讓它能獲得合理且較有效率的回應。",
    "檢視行為後環境是否無意間讓原行為更有效，必要時調整團隊一致做法。",
    "補記事件結果、恢復時間與策略成效，作為下一輪 PBS 修正依據。"
  ];
  if(functions.includes("attention")){
    before.push("在平穩時安排可預測的正向關注，並教導適當取得互動的方式。");
    during.push("降低大量情緒性注意，但維持必要、安全且中性的支持。");
    after.push("優先強化適當求助、呼喚、等待或互動行為，而非只在高挑戰行為後大量關注。");
  }
  if(functions.includes("escape")){
    before.push("檢查活動難度、工作量、轉換與等待；必要時提供工作拆解、先後順序與休息選項。");
    during.push("避免把所有要求永久撤除；待安全與穩定後，以可成功的小步驟重新銜接。");
    after.push("強化適當提出『休息、幫忙、不要、等一下』等替代溝通。");
  }
  if(functions.includes("tangible")){
    before.push("將物品／活動取得條件視覺化，先教等待、選擇與替代取得方式。");
    during.push("不要在高張時反覆談判；使用一致、簡短且可預測的回應。");
    after.push("讓適當要求與等待比高挑戰行為更有效率地取得合理結果。");
  }
  if(functions.includes("sensory")){
    before.push("觀察噪音、觸覺、動作量、空間、人群與其他感官負荷，安排可接受的調節活動。");
    during.push("降低感官刺激與不必要靠近，提供熟悉且安全的調節方式。");
    after.push("記錄替代感官活動是否降低行為頻率或縮短恢復時間。");
  }
  if(functions.includes("medical")){
    before.push("同步檢核睡眠、疼痛、排泄、飲食、藥物與其他身體狀態；有疑慮時先轉介醫療評估。");
    during.push("若出現疑似急性不適或醫療警訊，不以單純行為問題處理。");
  }
  if(data.preferences) before.push(`善用已知偏好與可理解方式：${data.preferences}`);
  if(data.supportHistory) before.push(`延續已知有效支持，並避免已知較無效做法：${data.supportHistory}`);
  if(data.riskNotes) during.unshift(`依既有安全／通報原則處理：${data.riskNotes}`);
  return {before:unique(before),during:unique(during),after:unique(after)};
}

function buildCycles(data){
  return [
    ["1｜建立","建立","相對平穩、可互動、可學習","建立關係與可預測作息；教導求助、拒絕、休息、等待等替代行為；安排成功與正向互動。","不要只在出事時才大量互動。"],
    ["2｜發現","發現","出現個別化早期警訊、節奏改變、重複詢問、皺眉、走動、拒絕等","辨識前兆；快速檢查背景因素與 A；提早給預告、選擇、休息或支持。","不要忽略前兆，等到高峰才介入。"],
    ["3｜介入","介入","情緒／行為開始升高但仍可能接受簡短提示","使用最少必要語言；降低任務難度與刺激；提示替代行為；把握可逆轉窗口。","避免長篇說理、多人同時指令、爭辯。"],
    ["4｜撤退","撤退","持續升高、接受資訊能力下降","開始做減法：降低要求、減少人員、降低語言與環境刺激，保留安全距離與出口。","不要在此階段密集教學或追問原因。"],
    ["5｜安全","安全","高張／危機、可能出現自傷他傷破壞或重大安全風險","安全優先；依既有危機與通報程序；保護本人與他人；限制刺激與圍觀。","不要以處罰、羞辱或挑釁方式回應。"],
    ["6｜陪伴","陪伴","高峰已過、能量下降但仍脆弱","保持低刺激與陪伴；提供水分、安靜空間或熟悉活動；給足恢復時間。","不要立刻檢討、逼迫道歉或重新提出大量要求。"],
    ["7｜恢復","恢復","逐漸回到可互動、可學習狀態","短而具體地修復與回顧；強化適當恢復與替代行為；補記 ABC；團隊檢討策略。","避免把事件重新情緒化或長時間責備。"]
  ];
}

function gather(){
  return {
    caseCode:text("#caseCode")||"（代號未填）",
    dataSource:$("#dataSource").value,
    target:text("#targetBehavior"),
    operational:text("#operationalDef"),
    frequency:text("#frequency"),
    duration:text("#duration"),
    intensity:$("#intensity").value,
    context:text("#context"),
    setting:text("#settingEvents"),
    preferences:text("#preferences"),
    supportHistory:text("#supportHistory"),
    riskNotes:text("#riskNotes"),
    abc:getRows(),
    functions:selectedFunctions()
  };
}

function analyze(){
  const d=gather();
  if(!d.target){ alert("請先填寫標的行為。"); return null; }
  const fs=d.functions.length ? d.functions : ["unclear"];
  const cards=fs.map((f,i)=>({
    key:f,name:functionMeta[f].name,
    role:i===0 && f!=="unclear" ? "主要假設" : "其他／待確認",
    reason:functionMeta[f].reason
  }));
  const strategies=buildStrategies(fs,d);
  const cycles=buildCycles(d);
  return {data:d,functions:cards,strategies,cycles};
}

function renderAnalysis(a){
  $("#analysisEmpty").hidden=true; $("#analysisResult").hidden=false;
  $("#functionAnalysis").innerHTML=a.functions.map(f=>`
    <div class="pbsw-function-card"><strong>${esc(f.role)}｜${esc(f.name)}</strong>
    <p>${esc(f.reason)}</p><p><b>提醒：</b>需以多筆 ABC、反證與後續觀察持續驗證。</p></div>`).join("");
  const fill=(id,items)=>{$(id).innerHTML=items.map(x=>`<li>${esc(x)}</li>`).join("")};
  fill("#antecedentStrategies",a.strategies.before);
  fill("#duringStrategies",a.strategies.during);
  fill("#consequenceStrategies",a.strategies.after);
  $("#cycleTable").innerHTML=a.cycles.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join("")}</tr>`).join("");
}

$("#analyzeBtn").addEventListener("click",()=>{
  lastAnalysis=analyze(); if(lastAnalysis) renderAnalysis(lastAnalysis);
});

function li(items){return `<ul>${items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`}
function abcHtml(rows){
  if(!rows.length) return "<p>尚未提供可整理之 ABC 紀錄。</p>";
  return `<ol>${rows.map((r,i)=>`<li><b>紀錄 ${i+1}${r.context?`｜${esc(r.context)}`:""}</b><br>A：${esc(r.a||"待補")}<br>B：${esc(r.b||"待補")}<br>C：${esc(r.c||"待補")}</li>`).join("")}</ol>`;
}

function buildReport(a){
  const d=a.data;
  const funNames=a.functions.map(f=>`${f.role}：${f.name}`).join("；");
  const dataCaveat=d.abc.length<2 ? "目前 ABC 筆數有限，尚不足以判定穩定功能模式；以下均以初步假設呈現。" : "已依目前提供的多筆紀錄整理共同線索，但仍需持續觀察與反證。";
  const html=`
    <p class="draft"><b>草稿提醒：</b>本報告由 AML PBS Companion Web 協助整理，功能為假設，須人工確認與團隊核定。</p>
    <h2>一、個案與分析背景</h2>
    <p>個案代號：${esc(d.caseCode)}。資料來源：${esc(d.dataSource)}。本次以「${esc(d.target)}」為主要標的行為進行 PBS 初步整理。</p>
    <h2>二、標的行為操作型定義</h2>
    <p>${esc(d.operational||"尚待補充可觀察、可紀錄之操作型定義。")}</p>
    <p>頻率：${esc(d.frequency||"待補")}；持續時間：${esc(d.duration||"待補")}；強度：${esc(d.intensity||"待補")}。</p>
    <h2>三、資料來源與情境摘要</h2>
    <p>常見情境：${esc(d.context||"待補")}。背景因素：${esc(d.setting||"待補")}。</p>
    <h2>四、ABC 資料整理</h2>
    ${abcHtml(d.abc)}
    <h2>五、行為功能假設</h2>
    <p>${esc(dataCaveat)}</p>
    <p>${esc(funNames)}</p>
    ${a.functions.map(f=>`<p><b>${esc(f.name)}：</b>${esc(f.reason)}</p>`).join("")}
    <h2>六、前事與環境調整策略</h2>${li(a.strategies.before)}
    <h2>七、替代行為與教學方向</h2>
    <p>優先教導能達成相近功能、且比原行為更容易使用的替代方式，例如求助、休息、拒絕、等待、選擇或適當取得互動／物品。實際替代行為應依個案能力、功能假設與團隊資源具體化。</p>
    <h2>八、行為發生中之支持策略</h2>${li(a.strategies.during)}
    <h2>九、後事與強化策略</h2>${li(a.strategies.after)}
    <h2>十、情緒行為七週期支持計畫</h2>
    <p>七週期以「建立 → 發現 → 介入 → 撤退 → 安全 → 陪伴 → 恢復」作為支持任務轉換。實際前兆與策略仍需依個案個別化。</p>
    <div class="pbsw-table-wrap"><table class="pbsw-table cycle"><thead><tr><th>週期</th><th>任務</th><th>線索</th><th>策略</th><th>避免</th></tr></thead><tbody>${a.cycles.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    <h2>十一、已知偏好與可運用資源</h2><p>${esc(d.preferences||"待補")}</p>
    <h2>十二、安全與風險注意事項</h2><p>${esc(d.riskNotes||"未提供特殊風險；若後續出現立即安全或醫療風險，應依機構程序及專業評估處理。")}</p>
    <h2>十三、成效追蹤建議</h2>
    <ul><li>標的行為頻率、持續時間與強度</li><li>替代行為／主動溝通使用次數</li><li>需要提示的程度</li><li>成功等待或完成轉換的時間</li><li>恢復平穩所需時間</li><li>各項策略執行一致性與可行性</li></ul>
    <h2>十四、團隊後續討論事項</h2>
    <ul><li>功能假設是否有足夠 ABC 支持？是否存在反證？</li><li>策略是否現場可執行、符合個案理解與能力？</li><li>替代行為是否比原行為更容易、且能獲得合理回應？</li><li>是否需要醫療、心理、職能治療、語言治療、社工、特教或其他專業共同評估？</li><li>下一階段需要增加哪些觀察資料？</li></ul>`;
  const plain = `AML PBS Companion Web｜行為功能分析暨正向行為支持報告（初稿）

個案代號：${d.caseCode}
標的行為：${d.target}
操作型定義：${d.operational||"待補"}
頻率／持續／強度：${d.frequency||"待補"}／${d.duration||"待補"}／${d.intensity||"待補"}

【ABC】
${d.abc.map((r,i)=>`${i+1}. ${r.context||""}\nA：${r.a||"待補"}\nB：${r.b||"待補"}\nC：${r.c||"待補"}`).join("\n\n")||"尚未提供"}

【功能假設】
${dataCaveat}
${a.functions.map(f=>`${f.role}｜${f.name}\n${f.reason}`).join("\n")}

【前事策略】
- ${a.strategies.before.join("\n- ")}

【行為中策略】
- ${a.strategies.during.join("\n- ")}

【後事策略】
- ${a.strategies.after.join("\n- ")}

【七週期】
${a.cycles.map(r=>`${r[0]} ${r[1]}｜${r[3]}`).join("\n")}

【安全風險】
${d.riskNotes||"待團隊確認"}

【追蹤】
頻率、持續時間、強度、替代行為使用、提示程度、恢復時間與策略一致性。

本文件為工具輔助初稿，功能為假設，須結合現場觀察、持續資料與團隊專業判斷。`;
  return {html,plain};
}

function buildAiPack(a){
  const d=a.data;
  return `你是一位協助整理 PBS（Positive Behavior Support）資料的 AI 協作者。請遵守：
1. 功能只能以「假設」呈現，不得把相關性寫成確定因果。
2. 不得補造未提供的頻率、時間、強度、診斷或事件細節。
3. 將行為描述維持客觀、可觀察、可紀錄。
4. 主要從取得關注、逃避／避免、取得物品／活動、自動／感官增強思考；生理不適需另行排除。
5. 策略請分為：前事／預防、替代行為與教學、行為中支持、後事與強化。
6. 七週期使用：建立、發現、介入、撤退、安全、陪伴、恢復。
7. 若資料不足或互相矛盾，直接指出需要增加觀察，不要強迫單一功能。
8. AI 只產出初稿；現場觀察、專業評估與團隊判斷優先。

【個案代號】${d.caseCode}
【標的行為】${d.target}
【操作型定義】${d.operational||"待補"}
【頻率／持續／強度】${d.frequency||"待補"}／${d.duration||"待補"}／${d.intensity||"待補"}
【常見情境】${d.context||"待補"}
【背景因素】${d.setting||"待補"}
【偏好／溝通／替代能力】${d.preferences||"待補"}
【已知支持經驗】${d.supportHistory||"待補"}
【安全風險】${d.riskNotes||"待補"}

【ABC 紀錄】
${d.abc.map((r,i)=>`紀錄${i+1}｜${r.context||""}\nA：${r.a||"待補"}\nB：${r.b||"待補"}\nC：${r.c||"待補"}`).join("\n\n")||"未提供"}

【使用者勾選的功能線索】
${d.functions.map(f=>functionMeta[f].name).join("、")||"未選擇"}

請依序輸出：
一、資料品質與仍缺少的資訊
二、標的行為操作型定義修正建議
三、ABC 共同模式
四、主要與次要功能假設（支持理由、反證、需再觀察事項）
五、前事策略
六、替代行為與教學策略
七、行為中策略
八、後事與強化策略
九、七週期個別化策略表
十、成效指標
十一、風險與跨專業建議
十二、完整 PBS 報告初稿`;
}

$("#reportBtn").addEventListener("click",()=>{
  if(!lastAnalysis){ lastAnalysis=analyze(); if(!lastAnalysis) return; renderAnalysis(lastAnalysis); }
  const report=buildReport(lastAnalysis);
  $("#reportOutput").innerHTML=report.html;
  lastReportText=report.plain;
  lastAiPack=buildAiPack(lastAnalysis);
  $("#copyReportBtn").disabled=false;
  $("#copyAiBtn").disabled=false;
  $("#printBtn").disabled=false;
});

async function copyText(value,button,label){
  try{
    await navigator.clipboard.writeText(value);
    const old=button.textContent; button.textContent=label;
    setTimeout(()=>button.textContent=old,1400);
  }catch{
    alert("瀏覽器未允許直接複製，請手動選取內容。");
  }
}
$("#copyReportBtn").addEventListener("click",e=>copyText(lastReportText,e.currentTarget,"已複製報告"));
$("#copyAiBtn").addEventListener("click",e=>copyText(lastAiPack,e.currentTarget,"已複製 AI 任務包"));
$("#printBtn").addEventListener("click",()=>window.print());

})();