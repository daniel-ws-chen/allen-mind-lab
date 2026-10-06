const AML_KIDS_LAST_ACTIVITY_KEY='amlKidsLastActivityV1';
function amlKidsRecordActivity(questionId='',level=''){
  let previous=null;
  try{previous=JSON.parse(localStorage.getItem(AML_KIDS_LAST_ACTIVITY_KEY)||'null');}catch{}
  if(!questionId&&previous&&previous.path===location.pathname){
    questionId=previous.questionId||'';
    level=previous.level||'';
  }
  const title=document.querySelector('h1')?.textContent.trim()||document.title;
  const context=document.querySelector('.eyebrow')?.textContent.trim()||'AML Kids';
  localStorage.setItem(AML_KIDS_LAST_ACTIVITY_KEY,JSON.stringify({path:location.pathname,title,context,questionId,level,updatedAt:Date.now()}));
}
window.addEventListener('DOMContentLoaded',()=>{
  amlKidsRecordActivity();
  const resumeId=new URLSearchParams(location.search).get('resume');
  if(resumeId){
    setTimeout(()=>{
      const target=[...document.querySelectorAll('[data-quiz]')].find(el=>el.dataset.quiz===resumeId);
      if(target){
        target.scrollIntoView({block:'center',behavior:'auto'});
        const control=target.querySelector('input,button');
        if(control) control.focus();
      }
    },120);
  }
});
document.addEventListener('click',event=>{
  const check=event.target.closest('.bank-check');
  if(!check)return;
  const box=check.closest('.challenge-question');
  if(!box)return;
  const level=box.querySelector('.level-chip')?.textContent.trim()||'';
  setTimeout(()=>amlKidsRecordActivity(box.dataset.quiz||'',level),0);
});

const WALLET_KEY='amlKidsRewardWalletV1';
const UNIT_SCORE_KEY='amlKidsSocial5aU4ScoreV1';
const AWARDS_KEY='amlKidsSocial5aU4AwardsV1';
const MISTAKES_KEY='amlKidsSocial5aU4MistakesV1';
const RESUME_KEY='amlKidsSocial5aU4ResumeV1';
const UNIT_MAX=250;
const state={
 wallet:Number(localStorage.getItem(WALLET_KEY)||0),
 unitScore:Number(localStorage.getItem(UNIT_SCORE_KEY)||0),
 awards:new Set(JSON.parse(localStorage.getItem(AWARDS_KEY)||'[]')),
 mistakes:JSON.parse(localStorage.getItem(MISTAKES_KEY)||'[]'),
 resume:JSON.parse(localStorage.getItem(RESUME_KEY)||'null')
};
const questions=[{"id":"q01","level":"基礎","q":"臺灣地形多樣的重要原因之一是？","o":["位於板塊活動帶附近","完全沒有地殼運動","四面都是平原","只有單一氣候"],"a":0,"e":"臺灣位於板塊交界附近，造就多樣地形。","s":"地形"},{"id":"q02","level":"基礎","q":"哪種地形通常較適合大規模聚落與交通建設？","o":["陡峭山地","平原","深海","懸崖"],"a":1,"e":"較平坦的平原通常較利於聚落與交通。","s":"土地利用"},{"id":"q03","level":"基礎","q":"山林的重要功能不包括？","o":["水土保持","生態棲地","完全阻止降雨","提供資源"],"a":2,"e":"山林不會阻止降雨。","s":"山林"},{"id":"q04","level":"基礎","q":"河川對人類生活的重要性之一是？","o":["停止所有災害","讓山脈消失","讓海岸變高","提供水資源"],"a":3,"e":"河川提供生活、農業等水資源。","s":"河川"},{"id":"q05","level":"基礎","q":"丘陵與台地的土地利用最需要考慮？","o":["坡度、水源與土壤","星座位置","教室大小","手機訊號"],"a":0,"e":"地形與水源等條件會影響利用方式。","s":"土地利用"},{"id":"q06","level":"基礎","q":"沿海地區可以發展哪些活動？","o":["只有農業","漁業、港口、觀光等","只有住宅","完全不能利用"],"a":1,"e":"沿海可有多元利用。","s":"海岸"},{"id":"q07","level":"基礎","q":"港口發展通常較重視哪項條件？","o":["森林密度","山頂高度","停泊與交通條件","星光亮度"],"a":2,"e":"港口需考量海況、港灣與交通。","s":"港口"},{"id":"q08","level":"基礎","q":"養殖漁業若缺乏管理，可能帶來？","o":["季節消失","地球停止自轉","山脈消失","水質與地下水問題"],"a":3,"e":"養殖可能造成水質或地下水壓力。","s":"養殖"},{"id":"q09","level":"基礎","q":"特殊海岸地形除了觀光，也可能有？","o":["教育與保育價值","完全無用途","只適合停車","只適合蓋工廠"],"a":0,"e":"特殊地形兼具自然與教育價值。","s":"海岸"},{"id":"q10","level":"基礎","q":"風力發電常設於部分沿海地區，主要利用？","o":["地熱","風能","核能","水力"],"a":1,"e":"風機利用風能。","s":"能源"},{"id":"q11","level":"基礎","q":"不當開發山坡地，強降雨時可能增加？","o":["海水鹽度","日照時間","土石流風險","星星亮度"],"a":2,"e":"坡地擾動可能增加水土流失與土石流風險。","s":"環境風險"},{"id":"q12","level":"基礎","q":"過度抽取地下水可能造成？","o":["颱風消失","山脈變高","海水變甜","地層下陷"],"a":3,"e":"地下水過度抽取可能造成地層下陷。","s":"地下水"},{"id":"q13","level":"基礎","q":"設置保護區主要目的之一是？","o":["保護重要棲地與資源","讓所有人永遠不能進入任何自然環境","增加污染","讓河川消失"],"a":0,"e":"保護區可維護重要生態與資源。","s":"保育"},{"id":"q14","level":"基礎","q":"「永續利用」較接近哪個概念？","o":["只追求最快開發","滿足現在需求，也考慮未來影響","完全不管未來","只看短期獲利"],"a":1,"e":"永續重視現在與未來的平衡。","s":"永續"},{"id":"q15","level":"基礎","q":"土地利用最能反映？","o":["只有天氣","只有人口數量","人與環境互動","只有政府名稱"],"a":2,"e":"土地使用呈現人如何回應環境與需求。","s":"人地互動"},{"id":"q16","level":"基礎","q":"沿海利用呈現多元發展，主要因為？","o":["只有一種產業","所有海岸都一樣","海岸完全沒有差異","自然條件與人類需求多樣"],"a":3,"e":"海岸條件不同、需求也不同。","s":"海岸"},{"id":"q17","level":"基礎","q":"開發與保育發生衝突時，第一步最好？","o":["整理利益、風險與不同群體需求","只看誰聲音大","直接全部開發","直接全部禁止"],"a":0,"e":"先理解各方需求與影響。","s":"決策"},{"id":"q18","level":"基礎","q":"低衝擊耕作主要希望？","o":["增加土壤流失","降低對土地與環境的傷害","讓農地更陡","完全不生產"],"a":1,"e":"低衝擊方法重視生產與環境兼顧。","s":"永續"},{"id":"q19","level":"基礎","q":"河川污染可能影響？","o":["只有道路名稱","只有天空顏色","用水、生態與下游生活","完全沒有影響"],"a":2,"e":"河川污染會影響多種生活與生態系統。","s":"河川"},{"id":"q20","level":"基礎","q":"第四單元核心最接近？","o":["只看觀光景點","只背地形名稱","只學歷史人物","土地如何利用、改變，以及如何兼顧環境"],"a":3,"e":"本單元聚焦土地利用與永續。","s":"總整"},{"id":"q21","level":"進階","q":"若坡地開發後植被大量減少，豪雨時土石流風險上升，最合理的因果是？","o":["植被減少使水土保持能力下降","豪雨讓植被一定增加","開發與坡地無關","土石流只和海浪有關"],"a":0,"e":"植被減少可能降低坡地穩定與保水能力。","s":"因果"},{"id":"q22","level":"進階","q":"某台地缺水，但地勢平坦。若要發展農業，最需要評估？","o":["星座","灌溉水源是否穩定","海拔是否等於零","手機品牌"],"a":1,"e":"農業需要穩定水源。","s":"資料判讀"},{"id":"q23","level":"進階","q":"同樣是海岸，甲地適合港口、乙地適合觀光，最合理解釋？","o":["只有人口決定","所有海岸條件都一樣","海岸自然條件與區位不同","只是名稱不同"],"a":2,"e":"地形、風浪與腹地差異會影響利用。","s":"比較"},{"id":"q24","level":"進階","q":"若海岸同時有珍貴濕地與工業開發需求，最好的做法是？","o":["不用蒐集資料","只看工業收入","只看單一物種","先評估生態與經濟影響，再比較方案"],"a":3,"e":"重要決策需比較多面向影響。","s":"抉擇"},{"id":"q25","level":"進階","q":"某地抽地下水後地層下陷，最直接應檢討？","o":["地下水使用量與管理","道路顏色","山脈高度","季節名稱"],"a":0,"e":"地層下陷與地下水超抽高度相關。","s":"因果"},{"id":"q26","level":"進階","q":"若養殖業帶來收入，也造成地層下陷，最成熟的政策思考是？","o":["立刻否定所有養殖","尋找降低用水與替代水源的方式","完全忽略下陷","只增加抽水"],"a":1,"e":"應在產業與環境間尋找改善方案。","s":"抉擇"},{"id":"q27","level":"進階","q":"判斷某項海岸工程是否值得，最不應只看？","o":["災害風險","生態影響","短期經濟收入","地方需求"],"a":2,"e":"短期收入只是其中一面。","s":"決策"},{"id":"q28","level":"進階","q":"山林保育和下游居民有關，因為？","o":["兩者完全無關","山林只影響山頂","下游沒有河川","上游水土保持會影響下游水與災害風險"],"a":3,"e":"流域上下游互相關聯。","s":"人地互動"},{"id":"q29","level":"進階","q":"某地設保護區後魚群數量回升。最合理結論？","o":["保護措施可能有幫助，但仍需持續觀察","保護區一定是唯一原因","所有海域都會同樣結果","從此不用管理"],"a":0,"e":"資料支持可能有效，但仍需持續監測。","s":"證據界線"},{"id":"q30","level":"進階","q":"若觀光人數增加、垃圾也增加，最合理的下一步是？","o":["關閉所有景點","改善垃圾管理並評估遊客承載量","增加垃圾","不記錄資料"],"a":1,"e":"可透過管理降低衝擊。","s":"問題解決"},{"id":"q31","level":"進階","q":"同一土地從農地變住宅區，最能反映？","o":["歷史停止","地形一定消失","土地利用會隨人口與需求改變","土地永遠不變"],"a":2,"e":"土地使用會隨社會變遷。","s":"土地變遷"},{"id":"q32","level":"進階","q":"若某地都市擴張後透水地面減少，豪雨積水變嚴重，最值得檢查？","o":["農曆日期","星座盤","海水鹽度","土地覆蓋與排水規畫"],"a":3,"e":"都市地表與排水影響逕流。","s":"都市化"},{"id":"q33","level":"進階","q":"「保護環境就是完全不使用土地」這句最大的問題是？","o":["把永續簡化成完全禁止利用","句子太短","沒有地名","沒有日期"],"a":0,"e":"永續強調合理利用與保護的平衡。","s":"概念辨析"},{"id":"q34","level":"進階","q":"若政府要規畫風力發電，除了風況還應考慮？","o":["只有風機顏色","生態、景觀與居民意見","只有公司名稱","只有道路寬度"],"a":1,"e":"大型設施需評估多面向影響。","s":"決策"},{"id":"q35","level":"進階","q":"要比較開發前後河川水質，哪種資料最有用？","o":["居民姓名","不同河川隨便一次測量","同地點、同方法的水質長期監測","地圖顏色"],"a":2,"e":"固定條件的長期資料較可比較。","s":"資料素養"},{"id":"q36","level":"進階","q":"某坡地農場改採等高線耕作與植生覆蓋，主要目的？","o":["讓雨下更多","增加坡度","抽更多地下水","降低土壤流失"],"a":3,"e":"這些方法有助減少土壤沖蝕。","s":"永續農業"},{"id":"q37","level":"進階","q":"若一項開發讓A村得到工作機會，B村承受污染，這提醒我們？","o":["開發利益與成本可能由不同群體承擔","所有人感受一定相同","污染不重要","只看總收入即可"],"a":0,"e":"不同群體可能承擔不同影響。","s":"多元觀點"},{"id":"q38","level":"進階","q":"土地利用決策若要更公平，最好加入？","o":["只聽單一企業","不同利害關係人的意見與資料","只看一篇廣告","只聽最有權力的人"],"a":1,"e":"公平決策需納入多方觀點。","s":"公共參與"},{"id":"q39","level":"進階","q":"海岸保育與漁業並非一定衝突，因為？","o":["漁業一定破壞所有生態","保育一定讓魚消失","良好管理可維持生態並支持長期漁業","兩者完全無關"],"a":2,"e":"健康生態有助長期資源利用。","s":"永續"},{"id":"q40","level":"進階","q":"第四單元最適合用哪條思考鏈？","o":["開發→一定成功","地形→背名字→結束","人口→完全不管環境","自然條件→土地利用→影響→調整與永續"],"a":3,"e":"這條鏈最能統整單元。","s":"總整"},{"id":"q41","level":"素養","q":"【資料】山坡地A保留大部分植被，山坡地B大量整地。豪雨後B的土壤流失明顯較多。最合理推論？","o":["植被保留可能有助減少土壤流失","A一定永遠不會崩塌","B一定只有一個原因","豪雨與土壤流失無關"],"a":0,"e":"資料支持植被有助水土保持，但不能推成絕對。","s":"資料判讀"},{"id":"q42","level":"素養","q":"【資料】某沿海鄉鎮有漁港、濕地、養殖區與風力發電場。這最能說明？","o":["沿海只能發展漁業","沿海土地利用可能同時具有多種功能","能源與海岸無關","濕地沒有價值"],"a":1,"e":"同一沿海區域可能有多元需求。","s":"跨資料整合"},{"id":"q43","level":"素養","q":"【閱讀】某地養殖業收入高，但多年超抽地下水後出現地層下陷。若要兼顧生計與環境，哪個方案較合理？","o":["完全忽略下陷","立刻增加抽水","改善用水效率、尋找替代水源並限制超抽","只要求居民搬走"],"a":2,"e":"應降低地下水壓力並保留產業可持續性。","s":"永續抉擇"},{"id":"q44","level":"素養","q":"【閱讀】一處海岸準備興建觀光設施，附近卻是候鳥重要棲地。最完整的決策流程是？","o":["只問一家廠商","先蓋再說","只看遊客人數","先做環境與遊憩需求評估，再比較不同位置與規模方案"],"a":3,"e":"需先蒐集資料並比較替代方案。","s":"公共決策"},{"id":"q45","level":"素養","q":"【資料】保護區設立前魚群指數45，設立三年後72，但同期也限制捕撈。哪個結論最好？","o":["魚群增加與保護措施可能相關，但不能只憑這筆資料判定單一原因","完全證明只因保護區","限制捕撈一定沒影響","數字不能用來判斷"],"a":0,"e":"多項措施同時存在，需避免單因果。","s":"證據界線"},{"id":"q46","level":"素養","q":"【閱讀】某城市把部分農地改成住宅後，人口增加、商店變多，但雨天積水也更頻繁。這最能說明？","o":["住宅一定不好","土地利用改變可能同時帶來便利與新的環境問題","農地一定不能改變","積水只和居民數無關"],"a":1,"e":"土地變遷常有多重影響。","s":"人地互動"},{"id":"q47","level":"素養","q":"【題組】甲方案能創造300個工作，但占用濕地；乙方案工作較少，但避開核心棲地。最好的比較方式？","o":["只看濕地面積","只看工作數量","同時比較就業、生態、災害風險與長期成本","哪個名字好聽就選哪個"],"a":2,"e":"公共抉擇需多準則評估。","s":"決策素養"},{"id":"q48","level":"素養","q":"【閱讀】居民反對山坡地大型開發，開發者則強調經濟收益。政府最適合怎麼做？","o":["不做任何調查","只聽開發者","只聽居民","公開資料、評估風險並讓不同群體參與討論"],"a":3,"e":"透明資料與公共參與有助更完整決策。","s":"公共參與"},{"id":"q49","level":"素養","q":"【閱讀】某河川上游恢復植被、減少裸露地後，下游濁度逐年下降。哪種解釋最合理？","o":["上游土地管理可能改善水土保持與下游水質","下游濁度只由海浪決定","植被與河川無關","所有河川都會完全一樣"],"a":0,"e":"流域上下游存在連動。","s":"流域思考"},{"id":"q50","level":"素養","q":"【總整】面對土地開發與環境保護的衝突，最佳策略是？","o":["只追求短期獲利","用資料比較需求、利益、風險與替代方案，再做可持續的選擇","完全不讓任何人使用土地","只聽單一立場"],"a":1,"e":"永續決策需兼顧多面向與長期影響。","s":"總整"}];
let activeSegment='基礎';

function save(){
 localStorage.setItem(WALLET_KEY,String(state.wallet));
 localStorage.setItem(UNIT_SCORE_KEY,String(state.unitScore));
 localStorage.setItem(AWARDS_KEY,JSON.stringify([...state.awards]));
 localStorage.setItem(MISTAKES_KEY,JSON.stringify(state.mistakes));
 localStorage.setItem(RESUME_KEY,JSON.stringify(state.resume));
}
function award(id){
 if(state.awards.has(id))return false;
 state.awards.add(id);state.unitScore=Math.min(UNIT_MAX,state.unitScore+5);state.wallet+=5;save();renderAll();return true;
}
function renderAll(){renderScore();renderProgress();renderResume();renderMistakes();updateSegmentUI();}
function renderScore(){
 document.querySelector('#scoreText').textContent=`${state.wallet} 點`;
 document.querySelector('#scoreProgress').hidden=true;
 document.querySelector('#unitScoreText').textContent=`本單元 ${state.unitScore} / 250`;
}
function renderProgress(){
 const done=questions.filter(q=>state.awards.has(q.id)).length;
 document.querySelector('#heroDone').textContent=done;
 document.querySelector('#challengeProgressText').textContent=`已完成 ${done} / 50 題`;
 document.querySelector('#challengeProgress').value=done;
 const r=document.querySelector('#unitResult');
 r.hidden=done!==50;
 if(done===50)r.innerHTML='<div class="completion-medal" aria-hidden="true">🏅</div><div><strong>第四單元挑戰完成！</strong><p>50 / 50 題全部完成，本單元獲得 250 / 250 點。</p></div>';
}
function showPanel(id){
 document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===id));
 document.querySelectorAll('.tab-btn[data-target]').forEach(b=>b.toggleAttribute('aria-current',b.dataset.target===id));
 history.replaceState(null,'',`#${id}`);
 const p=document.getElementById(id);const nav=document.querySelector('.lesson-nav');
 window.scrollTo({top:Math.max(0,p.getBoundingClientRect().top+scrollY-(nav?.offsetHeight||0)-12),behavior:'auto'});
}
document.querySelectorAll('[data-target]').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.target)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.go)));

function segmentQuestions(level=activeSegment){return questions.filter(q=>q.level===level);}
function updateSegmentUI(){
 const cfg={基礎:['第一區｜基礎 20 題','先掌握地形、河川、海岸與土地利用的核心關係。',20],進階:['第二區｜進階挑戰 20 題','比較開發原因、環境影響與不同群體的取捨。',20],素養:['第三區｜素養 10 題','閱讀較長材料，整合資料、風險與永續方案再判斷。',10]}[activeSegment];
 document.querySelector('#segmentTitle').textContent=cfg[0];
 document.querySelector('#segmentIntro').textContent=cfg[1];
 const done=segmentQuestions().filter(q=>state.awards.has(q.id)).length;
 document.querySelector('#segmentProgressText').textContent=`已完成 ${done} / ${cfg[2]} 題`;
 document.querySelector('#challenge').dataset.activeSegment=activeSegment;
 document.querySelectorAll('.segment-btn').forEach(btn=>{
  const level=btn.dataset.segment, qs=segmentQuestions(level), n=qs.filter(q=>state.awards.has(q.id)).length, complete=n===qs.length;
  btn.setAttribute('aria-pressed',String(level===activeSegment));
  btn.classList.toggle('segment-complete',complete);
  btn.querySelector('[data-count-for]').textContent=`${n} / ${qs.length}`;
  btn.querySelector('[data-state-for]').textContent=complete?'✓ 已完成':n?'進行中':'尚未開始';
 });
}
function showSegment(level,{scroll=true}={}){
 activeSegment=level;renderQuestions();updateSegmentUI();
 if(scroll){
  const t=document.querySelector('#segmentTitle'),nav=document.querySelector('.lesson-nav'),sticky=document.querySelector('.challenge-progress');
  window.scrollTo({top:Math.max(0,t.getBoundingClientRect().top+scrollY-(nav?.offsetHeight||0)-(sticky?.offsetHeight||0)-24),behavior:'auto'});
 }
}
function renderQuestions(){
 const wrap=document.querySelector('#questionList');wrap.innerHTML='';
 const base=activeSegment==='基礎'?0:activeSegment==='進階'?20:40;
 segmentQuestions().forEach((item,i)=>{
  const done=state.awards.has(item.id);
  const read=/^【(閱讀|題組|總整)】/.test(item.q), stem=read?item.q.replace(/^【[^】]+】/,'').trim():item.q;
  const d=document.createElement('article');
  d.className='quiz challenge-question segment-question-'+(activeSegment==='基礎'?'basic':activeSegment==='進階'?'advanced':'literacy')+(done?' correct':'');
  d.dataset.quiz=item.id;
  d.innerHTML=`<div class="question-meta"><span class="level-chip">${item.level}</span><span>第 ${base+i+1} / 50 題</span><span class="source-chip">${item.s}</span>${done?'<span class="done-chip">✓ 已完成</span>':''}</div>${read?'<div class="reading-material-tag">閱讀材料</div>':''}<div class="${read?'question-stem reading-stem':'question-stem'}"><h4>${stem}</h4></div><fieldset class="answer-options"><legend class="sr-only">請選擇一個答案</legend>${item.o.map((t,j)=>`<label class="answer-option"><input type="radio" name="${item.id}" value="${j}"><span class="option-letter" aria-hidden="true">${String.fromCharCode(65+j)}</span><span class="option-text">${t}</span></label>`).join('')}</fieldset><div class="question-actions"><button class="check bank-check">送出答案</button></div><p class="feedback" aria-live="polite">${done?'✅ 這題已完成並取得 5 點。':''}</p>`;
  wrap.appendChild(d);
 });
 document.querySelectorAll('.answer-option input').forEach(input=>input.addEventListener('change',()=>{
  const box=input.closest('.challenge-question');box.querySelectorAll('.answer-option').forEach(x=>x.classList.remove('option-selected'));input.closest('.answer-option').classList.add('option-selected');
 }));
 document.querySelectorAll('.bank-check').forEach(btn=>btn.addEventListener('click',()=>{
  const box=btn.closest('.challenge-question'),item=questions.find(q=>q.id===box.dataset.quiz),sel=box.querySelector('input:checked'),fb=box.querySelector('.feedback');
  if(!sel){fb.textContent='請先選一個答案。';return;}
  state.resume={id:item.id,level:item.level};localStorage.setItem(RESUME_KEY,JSON.stringify(state.resume));
  if(Number(sel.value)===item.a){
   const gained=award(item.id);fb.textContent=(gained?'✅ 答對！+5 點。 ':'✅ 答對！這題已領取過。 ')+item.e;
   box.classList.add('correct');box.classList.remove('incorrect');
   box.querySelectorAll('.answer-option').forEach(x=>x.classList.remove('option-wrong','option-right'));
   sel.closest('.answer-option')?.classList.add('option-right');
   const meta=box.querySelector('.question-meta');
   if(meta && !meta.querySelector('.done-chip')){
    const chip=document.createElement('span');chip.className='done-chip';chip.textContent='✓ 已完成';meta.appendChild(chip);
   }
  }else{
   fb.textContent='🔍 目前答案不對。重新找出「誰、為什麼、造成什麼影響」再判斷；訂正後仍可拿完整 5 點。';
   box.classList.add('incorrect');box.classList.remove('correct');
   box.querySelectorAll('.answer-option').forEach(x=>x.classList.remove('option-wrong','option-right'));
   sel.closest('.answer-option')?.classList.add('option-wrong');
   if(!state.mistakes.some(m=>m.id===item.id)){state.mistakes.push({id:item.id,text:item.q,level:item.level});save();renderMistakes();}
  }
 }));
}
document.querySelectorAll('.segment-btn').forEach(b=>b.addEventListener('click',()=>showSegment(b.dataset.segment)));

function nextQuestion(){const start=questions.findIndex(q=>q.id===state.resume?.id);for(let i=Math.max(0,start+1);i<questions.length;i++)if(!state.awards.has(questions[i].id))return questions[i];return questions.find(q=>!state.awards.has(q.id));}
function renderResume(){
 const c=document.querySelector('#resumeCard'),done=questions.filter(q=>state.awards.has(q.id)).length;
 if(!state.resume&&done===0){c.hidden=true;return;} c.hidden=false;
 const n=nextQuestion();
 if(!n){document.querySelector('#resumeTitle').textContent='第四單元 50 題已完成';document.querySelector('#resumeText').textContent='可以前往錯題小本本複習。';return;}
 const idx=questions.findIndex(q=>q.id===n.id)+1;
 document.querySelector('#resumeTitle').textContent=`繼續第四單元挑戰｜第 ${idx} 題`;
 document.querySelector('#resumeText').textContent=`目前已完成 ${done} / 50 題；下一題位於「${n.level}」區。`;
}
document.querySelector('#resumeChallenge').addEventListener('click',()=>{
 const n=nextQuestion();if(!n)return;
 showPanel('challenge');showSegment(n.level,{scroll:false});
 requestAnimationFrame(()=>{
  const card=document.querySelector(`[data-quiz="${n.id}"]`);if(!card)return;
  const offset=(document.querySelector('.lesson-nav')?.offsetHeight||0)+(document.querySelector('.challenge-progress')?.offsetHeight||0)+24;
  window.scrollTo({top:Math.max(0,card.getBoundingClientRect().top+window.scrollY-offset),behavior:'auto'});
  const heading=card.querySelector('h4');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
 });
});

let mistakeFilter='全部';
function renderMistakes(){
 const wrap=document.querySelector('#mistakeList'),all=state.mistakes,corrected=all.filter(m=>state.awards.has(m.id)).length;
 document.querySelector('#mistakeTotal').textContent=all.length;
 document.querySelector('#mistakeCorrected').textContent=corrected;
 document.querySelector('#mistakePending').textContent=all.length-corrected;
 let visible=all;
 if(mistakeFilter==='待複習')visible=all.filter(m=>!state.awards.has(m.id));
 else if(mistakeFilter!=='全部')visible=all.filter(m=>m.level===mistakeFilter);
 wrap.innerHTML='';
 if(!all.length){wrap.innerHTML='<div class="mistake-empty"><span aria-hidden="true">✨</span><strong>目前沒有錯題</strong><p>挑戰中答錯的題目會自動出現在這裡。</p></div>';return;}
 if(!visible.length){wrap.innerHTML='<div class="mistake-empty"><strong>這個分類目前沒有題目</strong><p>可以切換其他分類查看。</p></div>';return;}
 visible.forEach(m=>{
  const fixed=state.awards.has(m.id),item=questions.find(q=>q.id===m.id),card=document.createElement('article');
  card.className='mistake-card '+(fixed?'is-corrected':'is-pending');
  card.innerHTML=`<div class="mistake-meta"><span class="level-chip">${m.level}</span><span class="mistake-status">${fixed?'✓ 已訂正':'待複習'}</span></div><h3>${m.text}</h3><p>${fixed?(item?.e||'已重新答對，可以考前再確認一次。'):'先回到原題重新閱讀與判斷。'}</p><button type="button" class="secondary review-question" data-review-id="${m.id}" data-review-level="${m.level}">回到這一題</button>`;
  wrap.appendChild(card);
 });
 document.querySelectorAll('.review-question').forEach(btn=>btn.addEventListener('click',()=>{
  showPanel('challenge');showSegment(btn.dataset.reviewLevel,{scroll:false});
  requestAnimationFrame(()=>{
   const card=document.querySelector(`[data-quiz="${btn.dataset.reviewId}"]`);if(!card)return;
   const offset=(document.querySelector('.lesson-nav')?.offsetHeight||0)+(document.querySelector('.challenge-progress')?.offsetHeight||0)+24;
   window.scrollTo({top:Math.max(0,card.getBoundingClientRect().top+window.scrollY-offset),behavior:'auto'});
   const heading=card.querySelector('h4');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
  });
 }));
}
document.querySelectorAll('.mistake-filter').forEach(btn=>btn.addEventListener('click',()=>{
 mistakeFilter=btn.dataset.mistakeFilter;
 document.querySelectorAll('.mistake-filter').forEach(b=>{const active=b===btn;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
 renderMistakes();
}));
showSegment(state.resume?.level||'基礎',{scroll:false});renderAll();showPanel(location.hash.slice(1)&&document.getElementById(location.hash.slice(1))?location.hash.slice(1):'home');