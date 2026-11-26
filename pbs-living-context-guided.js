(()=>{"use strict";
const $=id=>document.getElementById(id),key="aml-pbs-context-guided-v1";
const topics=["飲食用餐","盥洗更衣","睡眠休息","活動參與","物品需求","人際互動","情緒波動","活動轉換","照顧方式不一致","成功經驗延伸","其他情境"];
const hints=["餐點偏好、用餐環境、吞嚥安全","水溫、感官刺激、隱私及協助方式","休息需求、睡前活動及預告","活動意義、難度、休息與選擇","物品意義、取得方式及需求表達","互動方式、個人空間與關係","早期訊號、安定條件與健康","預告、等待、變動與替代選擇","現行做法、共同原則與交接","本人喜好、有效支持與可複製條件","依實際情境描述"];
const cases=[
["具體發生了什麼？","描述看得到、聽得到的事實，不必猜原因。","行為理解","記錄活動、本人表現及前後變化"],
["什麼時候較容易發生？","想想活動前、環境、互動與身體狀態。","行為理解","比較不同時點、環境、健康與感官狀態"],
["有沒有比較順利的時候？","當時有何不同？本人喜歡什麼？","正向增強","觀察成功情境、偏好及成功機會"],
["本人知道接下來要做什麼嗎？","活動安排是否可理解、有預期及選擇？","生活結構","觀察對作息與選擇的理解"],
["本人如何表達想要或不想要？","語言、動作、表情、輔具都可以。","溝通支持","觀察需求表達、拒絕方式與回應效果"],
["活動開始或結束時有什麼變化？","例如預告、等待、換場地或改變安排。","作息轉銜","比較轉換前後及不同預告方式"],
["情緒或不適前有哪些訊號？","哪些條件有助安定？","情緒支持","記錄早期訊號、安定條件與健康疑慮"],
["照顧者如何回應？後來呢？","不同時段或照顧者做法是否一致？","團隊管理","記錄回應、交接與後續變化"]];
const care=[
["目前照顧過程如何進行？","從準備、開始、進行到結束描述。"],
["哪些環節最不順利？","描述環境或流程困難，保留本人觀點。"],
["哪些做法曾經有效？","保留成功經驗、偏好與參與機會。"],
["活動前可以準備什麼？","例如預告、用品、環境、選擇。"],
["活動中可以怎樣提供支持？","例如提示、溝通、協助、自主參與。"],
["本人拒絕、不適或尚未準備好時如何調整？","尊重拒絕，保留彈性；危機與醫療依既有專業計畫。"],
["活動結束後如何支持下一段生活？","例如正向回饋、休息、轉銜與復原。"],
["需要建立哪些支持條件？","例如工具、環境、溝通、一致支持原則與交接。"],
["如何知道新的方式有幫助？","觀察本人感受、自主、參與、安全及流程落實；何時檢視？"]];
const blank=()=>({version:2,problem:"",topic:"",route:"",teaching:false,answers:[]});let state=blank(),step=0,persist=false;
const clean=x=>typeof x==="string"?x.slice(0,4000):"";
function normalize(x){if(!x||x.version!==2||!["","case","care"].includes(x.route)||!Array.isArray(x.answers))throw Error("不是新版工作紀錄格式，請保留原檔");return {version:2,problem:clean(x.problem),topic:topics.includes(x.topic)?x.topic:"",route:x.route,teaching:x.teaching===true,answers:x.answers.slice(0,x.route==="case"?8:9).map(a=>({status:["已掌握","尚待了解","本次不涉及"].includes(a?.status)?a.status:"尚待了解",text:clean(a?.text)}))}}
const qs=()=>state.route==="case"?cases:care;
function el(tag,t){let e=document.createElement(tag);if(t!==undefined)e.textContent=t;return e}
function say(t){$("status").textContent=t}
function save(){if(persist)try{localStorage.setItem(key,JSON.stringify(state))}catch(e){say("無法保留進度，請儲存工作紀錄。")}}
function screen(id){for(const k of ["welcome","workspace","output"])$(k).hidden=k!==id}
function home(){$("problem").value=state.problem;$("topic").value=state.topic;screen("welcome");$("welcome-title").focus()}
function start(route){if(state.route&&state.route!==route&&state.answers.some(a=>a?.text)&&!confirm("切換路徑會清除原回答，是否繼續？"))return;state.problem=clean($("problem").value);state.topic=$("topic").value;if(state.route!==route)state.answers=[];state.route=route;step=0;render()}
function render(){let q=qs()[step],a=state.answers[step]||(state.answers[step]={status:"尚待了解",text:""});$("route-name").textContent=state.route==="case"?"個案情境建構｜準備個案研討":"照顧者情境建構｜改善照顧方式";$("progress").textContent="第 "+(step+1)+" 題／共 "+qs().length+" 題";$("question").textContent=q[0];$("hint").textContent=q[1];$("topic-hint").textContent=state.topic?"本次情境可留意："+hints[topics.indexOf(state.topic)]:"";$("answer").value=a.text;$("answer-status").value=a.status;$("prev").disabled=step===0;$("next").textContent=step===qs().length-1?"整理我的成果":"下一題";screen("workspace");$("question").focus();save()}
function reportLines(){let isCase=state.route==="case",l=[["title",isCase?"個案研討準備資料":"照顧流程與支持措施模板"],["p","AML PBS 情境建構工作台｜"+(state.teaching?"改編教學示範":"討論草稿")+"｜須經本人及團隊確認"],["h","照顧困擾與情境"],["p",state.problem||"尚待了解"],["p",state.topic||"未指定"]];const a=i=>state.answers[i]||{status:"尚待了解",text:""};const v=i=>a(i).status==="本次不涉及"?"本次不涉及":(a(i).text||"尚待了解")+(a(i).status==="尚待了解"&&a(i).text?"（尚待確認）":"");if(isCase){l.push(["h","已知資料與待確認事項"]);cases.forEach((q,i)=>l.push(["sub",q[0]],["p",v(i)]));l.push(["h","建議帶到個案研討的觀察方向"]);cases.forEach((q,i)=>{if(a(i).status!=="本次不涉及"&&(a(i).status==="尚待了解"||!a(i).text))l.push(["p",q[2]+"｜"+q[3]+"。觀察紀錄：＿＿＿＿"])});l.push(["p","觀察時記錄日期／活動、本人表現、環境回應、後續變化及本人觀點；以上不是行為功能判定。"])}else{l.push(["h","現有照顧情境與成功經驗"]);[0,1,2].forEach(i=>l.push(["sub",care[i][0]],["p",v(i)]));l.push(["h","照顧流程模板（討論草稿）"]);[3,4,5,6].forEach((i,j)=>l.push(["sub",["活動前準備","活動進行","彈性調整","活動結束與轉銜"][j]],["p",v(i)]));l.push(["h","支持措施模板"],["p",v(7)],["h","持續改善與觀察指標"],["p",v(8)])}l.push(["p","安全提醒：立即危險或急性不適，應先啟動既有緊急處理與專業協助。不得限制基本權利；本工具不是診斷或醫療建議。"],["p","Allen Mind Lab · Building A Meaningful Life."]);return l}
function preview(){let r=$("report");r.replaceChildren();for(const [type,t] of reportLines())r.append(el(type==="title"?"h2":type==="h"?"h3":type==="sub"?"h4":"p",t));screen("output");$("output-title").focus()}
function download(blob,name){let url=URL.createObjectURL(blob),a=el("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const enc=new TextEncoder(),mime="application/vnd.oasis.opendocument.text",xml=s=>String(s).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\ufffe\uffff]/g,"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c])).replace(/\r\n|\r|\n/g,"<text:line-break/>");
function crc(b){let c=0xffffffff;for(let x of b){c^=x;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1}return(c^0xffffffff)>>>0}
function zip(entries){let offset=0,size=0,parts=[],central=[];const u16=(v,o,n)=>v.setUint16(o,n,true),u32=(v,o,n)=>v.setUint32(o,n>>>0,true);for(const [name,value] of entries){let n=enc.encode(name),d=enc.encode(value),check=crc(d),l=new Uint8Array(30+n.length),v=new DataView(l.buffer);u32(v,0,0x04034b50);u16(v,4,20);u32(v,14,check);u32(v,18,d.length);u32(v,22,d.length);u16(v,26,n.length);l.set(n,30);parts.push(l,d);let c=new Uint8Array(46+n.length),w=new DataView(c.buffer);u32(w,0,0x02014b50);u16(w,4,20);u16(w,6,20);u32(w,16,check);u32(w,20,d.length);u32(w,24,d.length);u16(w,28,n.length);u32(w,42,offset);c.set(n,46);central.push(c);size+=c.length;offset+=l.length+d.length}let end=new Uint8Array(22),e=new DataView(end.buffer);u32(e,0,0x06054b50);u16(e,8,entries.length);u16(e,10,entries.length);u32(e,12,size);u32(e,16,offset);return new Blob([...parts,...central,end],{type:mime})}
function odt(){let body=reportLines().map(([type,t])=>type==="p"?"<text:p>"+xml(t)+"</text:p>":'<text:h text:outline-level="'+(type==="title"?1:type==="h"?2:3)+'">'+xml(t)+"</text:h>").join("");let content='<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.3"><office:body><office:text>'+body+'</office:text></office:body></office:document-content>';let manifest='<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"><manifest:file-entry manifest:full-path="/" manifest:media-type="'+mime+'" manifest:version="1.3"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>';download(zip([["mimetype",mime],["content.xml",content],["META-INF/manifest.xml",manifest]]),"aml-pbs-context-report.odt")}

for(const t of topics){let o=el("option",t);o.value=t;$("topic").append(o)}
$("problem").oninput=()=>{state.problem=clean($("problem").value);save()};$("topic").onchange=()=>{state.topic=$("topic").value;save()};
$("case").onclick=()=>start("case");$("care").onclick=()=>start("care");$("home").onclick=home;
$("answer").oninput=()=>{state.answers[step].text=clean($("answer").value);save()};
$("answer-status").onchange=()=>{state.answers[step].status=$("answer-status").value;save()};
$("prev").onclick=()=>{if(step>0){step--;render()}};$("next").onclick=()=>{if(step<qs().length-1){step++;render()}else preview()};
$("edit").onclick=render;$("print").onclick=()=>window.print();$("odt").onclick=odt;
$("demo").onclick=()=>{if(!confirm("載入教學案例會取代目前工作，是否繼續？"))return;state=blank();state.teaching=true;state.problem="白天踹櫃子後未取得代幣，晚間未取得餅乾而索取襪子；被要求休息後揮拳。護理師介入後仍生氣。";state.topic="物品需求";save();home();say("已載入第105篇改編教學案例，請選擇練習路徑。")};
$("backup").onclick=()=>download(new Blob([JSON.stringify(state)],{type:"application/json"}),"aml-pbs-work-record.json");
$("import").onchange=async e=>{let f=e.target.files[0];if(!f)return;try{if(f.size>2*1024*1024)throw Error("檔案太大");let n=normalize(JSON.parse(await f.text()));if(confirm("開啟紀錄會取代目前工作，是否繼續？")){state=n;save();home();say("已開啟工作紀錄，可選原路徑繼續。")}}catch(e){say("無法開啟工作紀錄："+e.message)}finally{$("import").value=""}};
function clearStored(){try{localStorage.removeItem(key);return true}catch(e){say("無法清除裝置紀錄，請使用瀏覽器清除網站資料。");return false}}
$("reset").onclick=()=>{if(confirm("結束工作並清除目前紀錄？已下載的檔案不會刪除。")){state=blank();persist=false;$("persist").checked=false;home();if(clearStored())say("已清除工作紀錄。")}};
$("persist").onchange=()=>{persist=$("persist").checked;if(persist&&!confirm("共用裝置不建議保留紀錄，僅使用去識別化資料。是否繼續？")){persist=false;$("persist").checked=false;return}if(persist)save();else clearStored()};
try{let s=localStorage.getItem(key);if(s&&confirm("發現先前保留的工作紀錄，是否恢復？")){state=normalize(JSON.parse(s));persist=true;$("persist").checked=true}else if(s)clearStored()}catch(e){say("無法恢復先前紀錄。")}
home();
})();