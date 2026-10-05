const WALLET_KEY='amlKidsRewardWalletV1';
const UNIT_SCORE_KEY='amlKidsSocial5aU5ScoreV1';
const AWARDS_KEY='amlKidsSocial5aU5AwardsV1';
const MISTAKES_KEY='amlKidsSocial5aU5MistakesV1';
const RESUME_KEY='amlKidsSocial5aU5ResumeV1';
const UNIT_MAX=250;
const state={
 wallet:Number(localStorage.getItem(WALLET_KEY)||0),
 unitScore:Number(localStorage.getItem(UNIT_SCORE_KEY)||0),
 awards:new Set(JSON.parse(localStorage.getItem(AWARDS_KEY)||'[]')),
 mistakes:JSON.parse(localStorage.getItem(MISTAKES_KEY)||'[]'),
 resume:JSON.parse(localStorage.getItem(RESUME_KEY)||'null')
};
const questions=[{"id":"q01","level":"基礎","q":"哪個主題最適合做成五年級的小書專題？","o":["開港通商後北部港口的變化","臺灣全部歷史","世界所有國家","人類文明"],"a":0,"e":"範圍明確、可找到資料的主題較適合。","s":"選題"},{"id":"q02","level":"基礎","q":"選題時最重要的原則之一是？","o":["越大越好","範圍清楚且能找到資料","越抽象越好","完全不用問題"],"a":1,"e":"明確範圍有助蒐集與整理。","s":"選題"},{"id":"q03","level":"基礎","q":"哪一個較像研究問題？","o":["臺灣","河川","為什麼某河川沿岸形成聚落？","歷史"],"a":2,"e":"研究問題要能引導找資料與解釋。","s":"選題"},{"id":"q04","level":"基礎","q":"找資料時，哪種來源通常較容易查證？","o":["匿名轉傳訊息","聊天截圖","沒有作者的貼文","政府或博物館網站"],"a":3,"e":"可追溯機構與資料來源較可靠。","s":"來源"},{"id":"q05","level":"基礎","q":"看一份網路資料，首先應確認？","o":["作者或發布單位","背景顏色","廣告數量","字體大小"],"a":0,"e":"先確認來源身分。","s":"來源"},{"id":"q06","level":"基礎","q":"為什麼要看資料日期？","o":["日期越新一定全部正確","部分資訊會隨時間改變","日期只為裝飾","舊資料永遠不能用"],"a":1,"e":"人口、政策等資料可能改變。","s":"來源"},{"id":"q07","level":"基礎","q":"「臺灣某港去年貨運量增加10%」較接近？","o":["詩句","純個人喜好","可查證事實","命令"],"a":2,"e":"數據可以查驗。","s":"事實意見"},{"id":"q08","level":"基礎","q":"「這是臺灣最漂亮的港口」較接近？","o":["地圖比例","統計事實","法律條文","個人評價"],"a":3,"e":"漂亮帶有主觀評價。","s":"事實意見"},{"id":"q09","level":"基礎","q":"重要結論最好怎麼處理？","o":["用兩個以上可靠來源交叉查證","只看一個來源","只看標題","只看留言"],"a":0,"e":"交叉查證可降低錯誤。","s":"查證"},{"id":"q10","level":"基礎","q":"摘要資料時最重要的是？","o":["整篇複製","用自己的話保留重點","只抄第一句","只存圖片"],"a":1,"e":"摘要要理解後重新整理。","s":"摘要"},{"id":"q11","level":"基礎","q":"小書中的地圖最重要的是？","o":["越大張越好","顏色越多越好","能支持主題並有說明","完全不用標示"],"a":2,"e":"圖像應服務研究問題。","s":"呈現"},{"id":"q12","level":"基礎","q":"圖表下方最適合加什麼？","o":["無關笑話","同學姓名而已","裝飾圖案","圖表來源與簡短說明"],"a":3,"e":"來源和解讀能增加可信度。","s":"呈現"},{"id":"q13","level":"基礎","q":"小書較好的基本順序是？","o":["問題→背景→證據→解釋→結論","結論→亂放圖片→標題","只放圖片","只放參考資料"],"a":0,"e":"有邏輯順序較能說清楚。","s":"結構"},{"id":"q14","level":"基礎","q":"團隊分工之後還需要？","o":["完全不能看別人的內容","互相校對與整合","只管自己","各自用不同主題"],"a":1,"e":"分工後仍要共同整合。","s":"合作"},{"id":"q15","level":"基礎","q":"若兩位組員找到不同答案，最好的做法是？","o":["猜拳","誰先找到就算對","比較來源與證據","全部刪掉"],"a":2,"e":"應回到來源與證據判斷。","s":"查證"},{"id":"q16","level":"基礎","q":"「有來源」是否等於「一定正確」？","o":["只要在網路上就正確","是","只有圖片才正確","不是，仍要檢查來源品質與證據"],"a":3,"e":"來源仍有品質差異。","s":"媒體素養"},{"id":"q17","level":"基礎","q":"選照片時最重要的是？","o":["和主題有關且知道來源","越可愛越好","越多越好","不用說明"],"a":0,"e":"圖片也應具有證據或說明功能。","s":"呈現"},{"id":"q18","level":"基礎","q":"完成小書後，最應確認？","o":["頁數是不是最多","是否回答原本的研究問題","圖片是不是最多","字是不是最小"],"a":1,"e":"研究作品應回應核心問題。","s":"檢核"},{"id":"q19","level":"基礎","q":"引用資料最重要的原因之一是？","o":["增加字數","讓頁面更滿","讓讀者知道資訊從哪裡來","避免自己閱讀"],"a":2,"e":"引用使資訊可追溯。","s":"引用"},{"id":"q20","level":"基礎","q":"第五單元核心最接近？","o":["只做美勞","多背十個人名","只畫封面","把學過的社會知識轉成探究作品"],"a":3,"e":"本單元是整合與實作。","s":"總整"},{"id":"q21","level":"進階","q":"研究「臺灣海岸」太大，最好的縮小方式是？","o":["限定某地區與某種利用問題","再加更多國家","不要設定範圍","只寫海岸兩字"],"a":0,"e":"加上地點與問題可縮小範圍。","s":"選題"},{"id":"q22","level":"進階","q":"若網站資料沒有作者、日期，也沒有引用來源，應？","o":["直接當唯一證據","降低信任並找其他來源驗證","只看圖片判斷","一定是官方資料"],"a":1,"e":"缺乏可追溯資訊要提高警覺。","s":"來源判讀"},{"id":"q23","level":"進階","q":"兩個政府資料數字不同，第一步最好？","o":["選較新的就一定對","選較大的","確認年份、定義與統計口徑是否相同","平均兩個數字"],"a":2,"e":"不同年份與定義會造成差異。","s":"資料判讀"},{"id":"q24","level":"進階","q":"一張地圖沒有比例尺與圖例，最大的問題是？","o":["沒有照片","顏色不夠漂亮","紙太小","難以正確理解距離與符號"],"a":3,"e":"地圖元素會影響判讀。","s":"地圖"},{"id":"q25","level":"進階","q":"文章說「某政策一定造成全部人口移入」，但只提供一個案例。問題是？","o":["證據不足且過度推論","案例太多","主題太清楚","資料太官方"],"a":0,"e":"單一案例不足以支持全面結論。","s":"證據界線"},{"id":"q26","level":"進階","q":"若想研究土地利用變化，哪種資料最有用？","o":["同一天兩張自拍","不同年份的地圖或空照圖","課本封面","班級座位表"],"a":1,"e":"跨時間資料能比較變遷。","s":"資料選擇"},{"id":"q27","level":"進階","q":"若研究「開港通商影響」，哪種資料最直接？","o":["星座圖","今日天氣","港口貿易、人口與城市發展資料","體育成績"],"a":2,"e":"這些資料直接對應經濟與都市發展。","s":"資料選擇"},{"id":"q28","level":"進階","q":"小書內兩頁文字重複，最好的處理是？","o":["縮小字體","全部保留","再複製一次","重新分類並合併重點"],"a":3,"e":"避免重複有助結構清楚。","s":"編輯"},{"id":"q29","level":"進階","q":"哪種標題最好？","o":["淡水開港後，城市生活發生哪些變化？","一些事情","臺灣很棒","我的作業"],"a":0,"e":"好的標題能指出主題與問題。","s":"選題"},{"id":"q30","level":"進階","q":"小組中一人蒐集資料、一人寫文、一人排版，最大風險是？","o":["分工一定不好","各部分可能缺乏共同邏輯","排版不能合作","資料不能分享"],"a":1,"e":"需要共同架構與整合。","s":"合作"},{"id":"q31","level":"進階","q":"若照片與文字結論不一致，應？","o":["刪掉文字","只留下漂亮照片","重新檢查證據與說明","忽略矛盾"],"a":2,"e":"矛盾代表需再查證。","s":"檢核"},{"id":"q32","level":"進階","q":"要呈現「不同族群留下的文化資產」，最好的方式之一是？","o":["只寫自己喜歡的","只列名字","只放一張圖","用時間、地點、類型整理比較"],"a":3,"e":"分類與比較能呈現多樣性。","s":"資料整理"},{"id":"q33","level":"進階","q":"一份資料是十年前的人口統計，還能不能用？","o":["可以，但要標示年份並判斷是否適合回答問題","絕對不能","一定比新資料準","不用標年份"],"a":0,"e":"舊資料可用於歷史比較。","s":"來源判讀"},{"id":"q34","level":"進階","q":"若研究「變遷」，最好至少需要？","o":["一張現在照片","兩個不同時間點的可比較資料","一個人的感想","一個標題"],"a":1,"e":"變遷需要時間比較。","s":"研究設計"},{"id":"q35","level":"進階","q":"一篇報導引用專家、一篇匿名貼文沒來源，應如何處理？","o":["兩者一定一樣可靠","匿名貼文一定較真","先評估兩者證據與可追溯性，不只看誰寫得有趣","只看分享數"],"a":2,"e":"來源品質需依證據判斷。","s":"媒體素養"},{"id":"q36","level":"進階","q":"小書加入自己的觀點時，最好？","o":["只用情緒詞","把意見寫成事實","不要任何理由","清楚區分「資料顯示」與「我的判斷」"],"a":3,"e":"事實與觀點應區分。","s":"表達"},{"id":"q37","level":"進階","q":"想比較兩個地區，最公平的方法是？","o":["用相同欄位與標準比較","一個看人口、一個看天氣","只找自己喜歡的資料","只看一個地區"],"a":0,"e":"共同標準才能公平比較。","s":"比較"},{"id":"q38","level":"進階","q":"同一歷史事件有不同觀點時，最好？","o":["只保留一種","比較來源立場與證據","認為有差異就都錯","選字最多的"],"a":1,"e":"不同觀點需分析來源與脈絡。","s":"歷史思考"},{"id":"q39","level":"進階","q":"小書結論最好的寫法是？","o":["只寫謝謝觀看","加入新主題","回答研究問題並指出證據支持什麼","重抄封面"],"a":2,"e":"結論應回扣問題與證據。","s":"結論"},{"id":"q40","level":"進階","q":"完成作品後進行同儕互評，最有價值的是？","o":["只給分數不說原因","比誰畫得漂亮","比頁數","找出哪裡不清楚或證據不足"],"a":3,"e":"互評可提升內容清楚度與可信度。","s":"檢核"},{"id":"q41","level":"素養","q":"【情境】小組研究「臺灣原住民族文化」，但只找到一篇旅遊部落格。下一步最好？","o":["補找官方、博物館或族群相關可靠資料，並比較內容","直接完成","把部落格全文貼上","只找更多同作者文章"],"a":0,"e":"單一非權威來源不足，需補強與交叉驗證。","s":"專題判讀"},{"id":"q42","level":"素養","q":"【情境】甲資料顯示某地人口增加，乙資料顯示住宅面積擴張。哪個說法最合理？","o":["已完全證明唯一原因","兩者可支持都市擴張的可能，但仍需更多資料確認原因","兩份資料互相矛盾","人口與土地完全無關"],"a":1,"e":"可建立合理推論但不宜過度因果。","s":"跨資料整合"},{"id":"q43","level":"素養","q":"【情境】小書寫「清代鐵路讓所有臺灣人生活立刻現代化」。哪裡需要修正？","o":["清代沒有臺灣","鐵路不是交通","單一建設不能代表所有地區與所有人的生活都立刻改變","現代化不能研究"],"a":2,"e":"敘述過度概括。","s":"證據界線"},{"id":"q44","level":"素養","q":"【情境】某組研究海岸開發，只找建設公司的資料。怎麼改進？","o":["只看宣傳影片","只把公司資料放大","刪除所有反對意見","加入居民、生態調查與政府資料等不同來源"],"a":3,"e":"多元來源能減少單一立場偏差。","s":"多元觀點"},{"id":"q45","level":"素養","q":"【情境】A圖是1980年農地，B圖是2025年住宅區。若要說明變遷，還應加入什麼？","o":["時間、位置一致性與可能造成改變的資料","更多裝飾","人物生日","不同地點的照片"],"a":0,"e":"時空一致與背景資料才能合理比較。","s":"資料素養"},{"id":"q46","level":"素養","q":"【情境】同學把AI生成的一段文字直接放進小書。最重要的下一步是？","o":["直接相信AI","查核內容、找到可追溯來源，再用自己的話整理","刪除全部參考資料","只改字體"],"a":1,"e":"AI內容仍需查證與來源支持。","s":"資訊素養"},{"id":"q47","level":"素養","q":"【情境】小組有四人，兩人做完全部內容，另外兩人不知道進度。哪裡出了問題？","o":["做得快一定不好","人數太多","分工缺乏共同規畫與進度檢查","小書不能四人做"],"a":2,"e":"團隊合作需要共同規畫與進度同步。","s":"團隊合作"},{"id":"q48","level":"素養","q":"【情境】小書中有一張漂亮老照片，但沒標年份、地點與來源。問題是？","o":["年份不重要","照片越舊越可靠","有照片就不需文字","難以判斷照片能證明什麼"],"a":3,"e":"缺少脈絡會降低證據價值。","s":"史料判讀"},{"id":"q49","level":"素養","q":"【情境】研究「臺灣河川與聚落」時，學生同時用了地形圖、河川圖與聚落分布圖。最大的好處是？","o":["可以疊合不同資料，找出空間關係","圖越多一定越正確","不用再解釋","可以忽略來源"],"a":0,"e":"多圖層資料有助分析空間關聯。","s":"地理探究"},{"id":"q50","level":"素養","q":"【總整】一份好的「看見臺灣」小書最重要的是？","o":["圖片最多","有清楚問題、可靠來源、合理整理、證據支持與自己的解釋","頁數最多","字最小"],"a":1,"e":"探究作品的核心是問題、證據與解釋。","s":"總整"}];
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
 document.querySelector('#scoreText').textContent=`${state.wallet} / 1000`;
 document.querySelector('#scoreProgress').value=Math.min(state.wallet,1000);
 document.querySelector('#unitScoreText').textContent=`本單元 ${state.unitScore} / 250`;
}
function renderProgress(){
 const done=questions.filter(q=>state.awards.has(q.id)).length;
 document.querySelector('#heroDone').textContent=done;
 document.querySelector('#challengeProgressText').textContent=`已完成 ${done} / 50 題`;
 document.querySelector('#challengeProgress').value=done;
 const r=document.querySelector('#unitResult');
 r.hidden=done!==50;
 if(done===50)r.innerHTML='<div class="completion-medal" aria-hidden="true">🏅</div><div><strong>第五單元挑戰完成！</strong><p>50 / 50 題全部完成，本單元獲得 250 / 250 點。</p></div>';
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
 const cfg={基礎:['第一區｜基礎 20 題','先掌握選題、資料來源與基本整理方法。',20],進階:['第二區｜進階挑戰 20 題','比較來源品質、整理方式與不同資料之間的關係。',20],素養:['第三區｜素養 10 題','閱讀專題情境，整合來源、證據與呈現方式再判斷。',10]}[activeSegment];
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
 if(!n){document.querySelector('#resumeTitle').textContent='第五單元 50 題已完成';document.querySelector('#resumeText').textContent='可以前往錯題小本本複習。';return;}
 const idx=questions.findIndex(q=>q.id===n.id)+1;
 document.querySelector('#resumeTitle').textContent=`繼續第五單元挑戰｜第 ${idx} 題`;
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