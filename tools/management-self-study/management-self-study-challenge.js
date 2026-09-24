(() => {
const KEY='amlManagementSelfStudyV1';
const lessons={
 detective:{stageIcon:'🏥',stageTitle:'復健部門的一天',title:'管理偵探社',lead:'從忙碌的日常裡，找出真正的管理問題。',icon:'🔍',quote:'管理不是把事情做完，而是知道要去哪裡、如何配置資源，並確認是否真的產生結果。',qs:[
  {story:['主任：「下個月開始辦跌倒預防團體！」','林組長：「目標改善多少？對象是誰？每週幾場？」','主任：「先做再說，大家有做就好！」'],q:'這個團隊目前最需要補強哪一項管理功能？',o:['Planning 規劃','Organizing 組織','Directing 領導','Controlling 控制'],a:0,f:'團隊只有「想做什麼」，尚未明確界定目標、對象、方法與成果，因此首先缺的是 Planning。'},
  {story:['團隊已決定每週三辦團體、每場 8 人。','活動前一天卻發現：沒人知道誰聯絡個案、誰借場地、誰準備教材。'],q:'這時最主要的管理問題是什麼？',o:['缺乏成果控制','缺乏工作與資源配置','缺乏願景','缺乏績效獎勵'],a:1,f:'目標已有，但角色、任務與資源配置不清，核心問題轉為 Organizing。'},
  {story:['一個月後，團隊完成四場活動。','林組長：「四場都有辦完，成功！」','小安：「那跌倒有減少嗎？」','全場安靜。'],q:'以下哪個說法最精確？',o:['活動完成就代表方案有效','完成場次反映執行量，但不能直接證明服務成效','只要滿意就不用其他資料','管理只需確保工作做完'],a:1,f:'場次屬於服務產出，是否有效還需要 Outcome 或其他成果指標。'}]},
 direction:{stageIcon:'🧭',stageTitle:'年度策略會議',title:'方向導航局',lead:'把漂亮的方向性語句，轉成真正可管理的目標。',icon:'🧭',quote:'方向不是寫得漂亮，而是讓團隊知道為什麼存在、往哪裡走，以及如何知道自己正在前進。',qs:[
  {story:['主任在白板寫：「成為最有溫度、最值得信賴的復健團隊。」','小安：「主任，這是今年 KPI 嗎？」'],q:'這句話最接近哪一類管理陳述？',o:['Mission','Vision','KPI','作業標準'],a:1,f:'這句描述團隊希望未來成為什麼樣子，較接近 Vision；它提供方向，但本身不是可直接追蹤的 KPI。'},
  {story:['團隊都認同「以個案為中心、促進生活參與」。','會議結束後，小安問：「所以今年到底要改善什麼？」'],q:'以下哪一項最適合作為年度可衡量目標？',o:['持續提供優質服務','讓每位同仁更有熱忱','今年底前將初次評估等待時間由 14 天降至 10 天內','成為全國最好的復健團隊'],a:2,f:'這個選項具體描述改善對象、目標值與期限，較接近可管理、可追蹤的 Objective。'},
  {story:['主任列出九個 KPI：場次、人次、會議次數、貼文數、教材數……','小安：「可是我們到底想知道什麼？」'],q:'以下哪項最符合 KPI 的設計原則？',o:['越多越完整','優先選擇與核心目標直接相關的指標','所有可量化資料都列入 KPI','主要功能是增加員工透明度'],a:1,f:'KPI 的價值在於反映核心目標的進展，而不是把所有能量化的資料都蒐集起來。'}]},
 strategy:{stageIcon:'♟️',stageTitle:'策略選擇現場',title:'策略診療室',lead:'SWOT 不是終點；真正的策略發生在選擇與取捨。',icon:'♟️',quote:'Strategy = Choice。沒有取捨，就很難稱為策略。',qs:[
  {story:['團隊完成跌倒預防服務的 SWOT，列出許多優勢、限制、機會與威脅。','主任：「太好了，策略做完了！」'],q:'完成 SWOT 後，下一步最適當的是？',o:['繼續增加 SWOT 項目','根據目標與 SWOT 形成可比較的策略選項','立即執行最容易的活動','先設定所有 KPI'],a:1,f:'SWOT 是分析工具，不是策略本身；下一步是形成策略選項，才能進一步做選擇與取捨。'},
  {story:['人力只有兩位治療師。','方案 A 最省力；方案 B 可進入社區；方案 C 想一次做院內、社區、到宅、線上四種服務。','主任：「C 最完整，就選 C！」'],q:'哪種思考方式最符合策略管理？',o:['選能同時做最多事情的方案','只選最省力的方案','依目標、需求、優勢與限制進行取捨','讓每位成員各做一種'],a:2,f:'策略的核心是有限資源下的取捨，而不是把所有好點子一起做。'},
  {story:['資料顯示參與率低的主要原因是交通困難與活動時間不合。','團隊卻提議增加宣傳海報。'],q:'這個提案最大的策略問題是什麼？',o:['海報一定沒有效果','問題分析與策略選擇沒有對上','任何宣傳都不屬於策略','只能增加人力'],a:1,f:'宣傳不是絕對無效，但目前已知主要障礙是交通與時間；策略應優先回應核心問題。'}]},
 leadership:{stageIcon:'👥',stageTitle:'主管的一天',title:'主管的一天',lead:'在授權、支持與責任之間做出管理判斷。',icon:'👥',quote:'Give direction. Give authority. Keep accountability.',qs:[
  {story:['新人衛教單張不完整，林組長：「算了，我自己改比較快。」','排程有問題：「我自己排。」','週五他累倒：「為什麼大家都不會主動？」'],q:'這個團隊最可能出現哪個管理問題？',o:['主管工作多所以效率一定高','主管過度集中工作，壓縮成員學習與承擔責任機會','重要工作都應由主管完成','授權只會降低品質'],a:1,f:'短期自己做可能較快，但長期會限制團隊能力與責任感的發展。'},
  {story:['主任：「下月健康促進活動，小安你負責。」','小安：「預算？目標？可找誰協助？」','主任：「你自己想辦法，我相信你。」'],q:'以下哪個判斷最精確？',o:['這就是完整授權','授權應包含目標、權限、資源與責任界線','只要交期限即可','被授權者應承擔所有風險'],a:1,f:'授權不是把任務丟出去；執行者需要清楚目標、資源、可決策範圍與回報責任。'},
  {story:['OT 與 PT 對團體內容意見不同，越講越大聲。','林組長：「不要吵，全部照我的版本！」'],q:'若衝突來自真正的專業觀點差異，主管較適當的下一步是？',o:['立刻終止討論','各做各的','回到共同目標與服務需求，釐清各自專業理由並整合','永遠採職位最高者意見'],a:2,f:'專業衝突不一定等於合作失敗；好的主管協助團隊把差異放回共同目標與證據中處理。'}]},
 quality:{stageIcon:'📊',stageTitle:'品質改善會議',title:'品質改善實驗室',lead:'不要被漂亮數字騙了；先看資料能不能回答真正的問題。',icon:'📊',quote:'Data is not decoration.',qs:[
  {story:['改善前滿意度 80%，改善後 90%。','主任：「提升 10%，新流程有效！」','小安：「兩次問卷的人數跟題目一樣嗎？」'],q:'在判斷改善是否有效前，最應先確認什麼？',o:['數字上升就足夠','樣本數、測量方式與比較條件是否一致','員工是否喜歡新流程','宣傳是否增加'],a:1,f:'若樣本、題目或測量條件不同，百分比的變化不一定可以直接解讀成品質改善。'},
  {story:['去年：200 位住民、20 件跌倒。','今年：100 位住民、12 件跌倒。','主管：「跌倒變少了！」'],q:'以下哪個判斷最合理？',o:['件數下降就代表風險改善','需考慮服務人口或暴露量，不能只比事件件數','今年人少所以不必統計','件數下降即可結案'],a:1,f:'服務人口改變時，只看事件總數容易誤判，應使用適當分母或暴露量比較。'},
  {story:['今年辦了 12 場活動、320 人次參加、做了 6 份教材。','主任：「成果超好！」','小安：「所以參加者真的有改變嗎？」'],q:'上述資料主要反映哪一類成果？',o:['Output 服務產出','Outcome 結果','Impact 長期影響','服務品質一定良好'],a:0,f:'場次、人次與教材數主要描述「做了多少」；是否產生功能或健康改變，需要 Outcome 資料。'}]},
 systems:{stageIcon:'🌐',stageTitle:'跨系統服務現場',title:'跨系統任務局',lead:'當每個人都完成自己的工作，服務仍可能在系統縫隙中掉下去。',icon:'🌐',quote:'The client does not live inside one system.',qs:[
  {story:['中風個案準備出院。OT、PT、護理與社工都完成各自工作。','家屬問：「那回家後誰會繼續協助？」','全場安靜。'],q:'這個案例最主要呈現哪一類問題？',o:['個別專業能力不足','跨系統轉銜與服務銜接不足','治療目標錯誤','家屬配合度不足'],a:1,f:'各專業完成自身工作，卻沒有把醫療與後續社區支持接起來，問題已超過單一專業範圍。'},
  {story:['醫院內 OT、PT、護理師、醫師、社工一起討論出院。','小安：「這樣就是跨系統合作了吧？」'],q:'以下哪個判斷最精確？',o:['不同專業開會就是跨系統','這主要是跨專業；跨系統還需與院外服務體系建立實際連結','跨系統不需要跨專業','跨系統只存在政府部門'],a:1,f:'院內不同專業合作主要屬跨專業；跨越醫療、長照、社政、教育等體系，才進入跨系統合作。'},
  {story:['腦傷青年出院後需要居家復能、就業準備與家屬支持。','服務都有部分啟動，但各單位彼此不知道對方正在做什麼。'],q:'從跨系統服務管理角度，下一步最適當的是？',o:['只增加醫院 OT 次數','建立跨單位資訊交換、角色分工與後續追蹤','讓家屬自己協調全部單位','等各單位各自完成'],a:1,f:'問題不是缺少單一服務，而是服務彼此沒有連結；需要建立協作與追蹤機制。'}]}
};
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}function save(s){localStorage.setItem(KEY,JSON.stringify(s));}
const id=new URLSearchParams(location.search).get('lesson')||'detective';const lesson=lessons[id]||lessons.detective;let i=0,answered=false;
const $=s=>document.querySelector(s);
function comicLine(line,idx){
  let speaker='情境旁白',avatar='📋',text=line,cls='narrator';
  const m=line.match(/^([^：:]{1,10})[：:]\s*[「“]?(.+?)[」”]?$/);
  if(m){speaker=m[1];text=m[2];cls='';if(/小安/.test(speaker))avatar='🧑‍⚕️';else if(/林組長|組長/.test(speaker))avatar='🧑‍💼';else if(/主任/.test(speaker))avatar='👔';else if(/家屬/.test(speaker))avatar='👪';else if(/OT/.test(speaker))avatar='🧑‍⚕️';else if(/PT/.test(speaker))avatar='🏃';else avatar='💬';}
  return `<article class="comic-frame ${cls}"><span class="frame-no">${String(idx+1).padStart(2,'0')}</span><div class="frame-head"><span class="avatar">${avatar}</span><span class="speaker">${speaker}</span></div><div class="speech">${text}</div></article>`;
}
$('[data-title]').textContent=lesson.title;$('[data-lead]').textContent=lesson.lead;$('[data-kicker]').textContent=`AML MANAGEMENT · ${id.toUpperCase()}`;$('[data-stage-icon]').textContent=lesson.stageIcon||'🎬';$('[data-stage-title]').textContent=lesson.stageTitle||'管理現場';
function render(){const item=lesson.qs[i];answered=false;$('[data-scene]').textContent=`SCENE ${i+1}`;$('[data-story]').innerHTML=item.story.map((t,idx)=>comicLine(t,idx)).join('');$('[data-question]').textContent=item.q;$('[data-step]').textContent=`${i+1} / ${lesson.qs.length}`;$('[data-bar]').style.width=`${Math.round(i/lesson.qs.length*100)}%`;$('[data-feedback]').style.display='none';$('[data-next]').disabled=true;const opts=$('[data-options]');opts.innerHTML='';item.o.forEach((label,idx)=>{const b=document.createElement('button');b.className='opt';b.type='button';b.textContent=`${String.fromCharCode(65+idx)}. ${label}`;b.addEventListener('click',()=>choose(idx,b));opts.appendChild(b);});}
function choose(idx,btn){if(answered)return;answered=true;const item=lesson.qs[i];document.querySelectorAll('.opt').forEach((b,n)=>{b.disabled=true;if(n===item.a)b.classList.add('correct');});if(idx!==item.a)btn.classList.add('wrong');const fb=$('[data-feedback]');fb.textContent=item.f;fb.style.display='block';$('[data-next]').disabled=false;}
function done(){const s=load();s.games=s.games||{};s.games[id]=true;save(s);$('[data-comic]').style.display='none';$('[data-done]').style.display='block';$('[data-bar]').style.width='100%';$('[data-icon]').textContent=lesson.icon;$('[data-done-title]').textContent=`${lesson.title}｜課後小測完成`;$('[data-quote]').textContent=lesson.quote;$('[data-done-text]').textContent='已記錄本堂課後小測完成狀態。回到自學路徑後，核心進度會自動更新。';}
$('[data-next]').addEventListener('click',()=>{if(i<lesson.qs.length-1){i++;render();}else done();});render();
})();
