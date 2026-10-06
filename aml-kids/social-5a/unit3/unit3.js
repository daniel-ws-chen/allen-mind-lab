const WALLET_KEY='amlKidsRewardWalletV1';
const UNIT_SCORE_KEY='amlKidsSocial5aU3ScoreV1';
const AWARDS_KEY='amlKidsSocial5aU3AwardsV1';
const MISTAKES_KEY='amlKidsSocial5aU3MistakesV1';
const RESUME_KEY='amlKidsSocial5aU3ResumeV1';
const UNIT_MAX=250;
const state={
 wallet:Number(localStorage.getItem(WALLET_KEY)||0),
 unitScore:Number(localStorage.getItem(UNIT_SCORE_KEY)||0),
 awards:new Set(JSON.parse(localStorage.getItem(AWARDS_KEY)||'[]')),
 mistakes:JSON.parse(localStorage.getItem(MISTAKES_KEY)||'[]'),
 resume:JSON.parse(localStorage.getItem(RESUME_KEY)||'null')
};
const questions=[{"id":"q01","level":"基礎","q":"清帝國統治臺灣前期，對漢人來臺採取什麼態度？","o":["限制渡臺","全面鼓勵所有人自由來臺","禁止任何人離開臺灣","完全不管理"],"a":0,"e":"前期採限制渡臺政策。","s":"公開課程重點"},{"id":"q02","level":"基礎","q":"早期漢人移民來臺，最常見的重要活動之一是？","o":["建造捷運","開墾土地","發射衛星","經營網路公司"],"a":1,"e":"移民開墾土地並形成聚落。","s":"現行課程"},{"id":"q03","level":"基礎","q":"下列哪一項最可能是民變或械鬥的背景因素？","o":["海水顏色","地球自轉","治理困難與利益競爭","課本頁數"],"a":2,"e":"資源與利益衝突、治理不足可能引發社會衝突。","s":"現行課程"},{"id":"q04","level":"基礎","q":"「械鬥」最接近哪一種情況？","o":["商人一起合作","政府舉辦運動會","農民一起收成","不同群體間的武力衝突"],"a":3,"e":"械鬥指群體間的武力衝突。","s":"核心概念"},{"id":"q05","level":"基礎","q":"隨漢人移民增加，臺灣社會出現哪種變化？","o":["漢人文化逐漸成為重要主流","所有原有文化立刻消失","臺灣不再有人居住","完全沒有聚落"],"a":0,"e":"人口與社會結構改變，使漢人文化影響增加。","s":"現行課程"},{"id":"q06","level":"基礎","q":"開港通商後，臺灣最直接增加的是？","o":["史前遺址數量","對外貿易往來","山脈高度","季風方向"],"a":1,"e":"開港通商使對外交易增加。","s":"公開課程重點"},{"id":"q07","level":"基礎","q":"開港通商後，哪個地區的經濟活動特別受到帶動？","o":["歐洲內陸","南極","北部","中央山脈頂端"],"a":2,"e":"公開課程計畫強調開港後經濟重心北移。","s":"公開課程重點"},{"id":"q08","level":"基礎","q":"牡丹社事件後，清廷派誰來臺加強防務？","o":["哥倫布","鄭成功","劉邦","沈葆楨"],"a":3,"e":"沈葆楨來臺強化防務。","s":"公開課程重點"},{"id":"q09","level":"基礎","q":"沈葆楨在臺灣的重要措施之一是？","o":["加強軍事防禦","建立荷蘭東印度公司","發明火車","統治西班牙"],"a":0,"e":"他推動防務與相關建設。","s":"公開課程重點"},{"id":"q10","level":"基礎","q":"清法戰爭後，清廷對臺灣的態度有何改變？","o":["完全放棄臺灣","更加重視臺灣","停止所有建設","臺灣立刻獨立"],"a":1,"e":"清法戰爭使清廷更重視臺灣戰略位置。","s":"公開課程重點"},{"id":"q11","level":"基礎","q":"臺灣建省後，首任巡撫是？","o":["斯文豪","沈葆楨","劉銘傳","馬偕"],"a":2,"e":"劉銘傳是臺灣建省後首任巡撫。","s":"公開課程重點"},{"id":"q12","level":"基礎","q":"劉銘傳推動的建設不包括哪一項？","o":["鐵路","電報","軍事防禦","高速鐵路"],"a":3,"e":"高速鐵路不是清代建設。","s":"人物與建設"},{"id":"q13","level":"基礎","q":"斯文豪在臺灣較著名的活動是？","o":["自然調查研究","修築高鐵","統治臺灣","創辦便利商店"],"a":0,"e":"斯文豪進行鳥類、蛙類等自然調查。","s":"公開課程重點"},{"id":"q14","level":"基礎","q":"清帝國後期外國傳教士來臺，也推動哪些活動？","o":["太空探索","醫療與教育","晶片製造","高速公路"],"a":1,"e":"傳教士也推動西方醫療與教育。","s":"公開課程重點"},{"id":"q15","level":"基礎","q":"巴克禮在臺灣的重要影響之一是？","o":["清法戰爭","鐵路建設","教育與印刷","土地測量"],"a":2,"e":"巴克禮推動教育與印刷文化。","s":"公開課程重點"},{"id":"q16","level":"基礎","q":"下列哪一組最能代表清帝國後期臺灣的變化？","o":["所有城市消失","完全與世界隔絕","只有農業沒有其他變化","貿易增加、建設增加、外來交流增加"],"a":3,"e":"後期的核心是貿易、治理建設與交流增加。","s":"總整"},{"id":"q17","level":"基礎","q":"研究移民開墾，最適合觀察哪種資料？","o":["人口、聚落與土地利用","星座","手機品牌","今日電影票房"],"a":0,"e":"這些資料能反映移民與開墾影響。","s":"資料判讀"},{"id":"q18","level":"基礎","q":"研究開港通商的影響，最適合觀察？","o":["班級座位表","港口貿易與商品流通","天文星圖","恐龍化石"],"a":1,"e":"開港影響最直接反映在港口和貿易。","s":"資料判讀"},{"id":"q19","level":"基礎","q":"「清廷更重視臺灣」最可能帶來？","o":["海岸線消失","所有人停止工作","治理與建設投入增加","臺灣移到別處"],"a":2,"e":"重視程度提高往往伴隨治理與建設增加。","s":"因果"},{"id":"q20","level":"基礎","q":"第三單元核心最接近哪一句？","o":["只學史前生活","只記人名","只學地形","臺灣從移民開墾走向開港通商與治理轉變"],"a":3,"e":"本單元串連移民、開港、治理與西方影響。","s":"總整"},{"id":"q21","level":"進階","q":"清帝國限制渡臺，但仍有漢人來臺，最合理的解釋是？","o":["生活與土地需求仍形成移民動力","政策等於完全沒有效果","所有人都是官員","臺灣沒有任何風險"],"a":0,"e":"政策限制與實際移民需求可同時存在。","s":"因果推理"},{"id":"q22","level":"進階","q":"人口與開墾增加後，若水源與土地有限，最可能出現？","o":["所有衝突自動消失","合作與競爭都可能增加","人口一定下降為零","所有文化完全一致"],"a":1,"e":"資源有限時可能產生競爭，也可能促成合作。","s":"因果推理"},{"id":"q23","level":"進階","q":"只因某時期曾發生械鬥，就說「所有族群彼此永遠敵對」，問題在哪？","o":["沒有寫地名","年代太新","過度推論","句子太短"],"a":2,"e":"局部衝突不能代表所有人、所有時間。","s":"證據界線"},{"id":"q24","level":"進階","q":"若要理解漢人文化成為社會主流的過程，最應一起看？","o":["手機數量","今日天氣","海拔高度","人口移入、聚落、語言與制度變化"],"a":3,"e":"文化主流形成與人口和社會制度有關。","s":"資料整合"},{"id":"q25","level":"進階","q":"開港通商使經濟重心北移，最合理的機制是？","o":["北部港口與外銷貿易活動增加","北部突然沒有居民","南部完全停止生產","山脈移動"],"a":0,"e":"貿易與港口活動會帶動區域經濟。","s":"因果推理"},{"id":"q26","level":"進階","q":"牡丹社事件與沈葆楨來臺之間的關係最接近？","o":["兩者完全無關","外來挑戰促使清廷加強防務","沈葆楨先發動事件","事件讓臺灣停止治理"],"a":1,"e":"事件凸顯防務與治理的重要性。","s":"因果推理"},{"id":"q27","level":"進階","q":"清法戰爭與臺灣建省之間，最合理的關係是？","o":["建省發生在戰爭前幾百年","戰爭使臺灣完全無人","戰略威脅提高臺灣重要性，促使治理升級","兩者只和氣候有關"],"a":2,"e":"外來威脅促使清廷更重視臺灣。","s":"因果推理"},{"id":"q28","level":"進階","q":"劉銘傳推動鐵路與電報，最直接改善？","o":["族群血統","史前考古","季風方向","交通與資訊傳遞"],"a":3,"e":"鐵路改善交通，電報改善通訊。","s":"人物與建設"},{"id":"q29","level":"進階","q":"研究劉銘傳建設的影響，哪種資料最直接？","o":["交通路線、通訊速度與行政管理變化","服裝顏色","姓名筆畫","每日氣溫"],"a":0,"e":"這些資料能反映建設效益。","s":"證據"},{"id":"q30","level":"進階","q":"若只說「開港後臺灣更繁榮」，還缺少什麼？","o":["更多形容詞","具體貿易、城市與產業資料","更大的字體","更多插圖"],"a":1,"e":"歷史判斷需要具體證據。","s":"證據素養"},{"id":"q31","level":"進階","q":"斯文豪的活動最能代表哪種西方影響？","o":["鐵路管理","殖民統治","自然科學調查與知識交流","土地徵稅"],"a":2,"e":"他以自然調查研究聞名。","s":"人物"},{"id":"q32","level":"進階","q":"傳教士推動醫療與教育，最可能產生哪種影響？","o":["人口完全不變","臺灣停止對外交流","所有傳統立即消失","新的知識與制度進入臺灣社會"],"a":3,"e":"醫療教育會帶來新知識與社會影響。","s":"文化交流"},{"id":"q33","level":"進階","q":"哪種說法最符合歷史多元觀點？","o":["建設可能帶來便利，也可能伴隨不同群體的不同經驗","所有政策只有好處","所有政策只有壞處","只看官員紀錄就夠"],"a":0,"e":"歷史影響可因群體而異。","s":"歷史思考"},{"id":"q34","level":"進階","q":"若某城市開港後商人、洋行與貨物流動增加，最可推論？","o":["城市與世界隔絕","城市與國際貿易連結加深","城市人口一定下降","農業完全消失"],"a":1,"e":"港口貿易增加代表對外連結加深。","s":"資料推理"},{"id":"q35","level":"進階","q":"沈葆楨與劉銘傳都與臺灣治理轉變有關，但兩者背景不同。這提醒我們？","o":["年代完全不重要","只背名字就夠","人物要放在事件脈絡中理解","人物彼此沒有差異"],"a":2,"e":"人物政策需結合當時事件理解。","s":"歷史思考"},{"id":"q36","level":"進階","q":"若要比較清帝國前期與後期治理，最好的欄位是？","o":["姓名、星座、生日","今天人口、手機、捷運、網路","山脈高度、河流長度、天氣","移民政策、防務、建設、對外交流"],"a":3,"e":"這些欄位能比較治理政策變化。","s":"比較策略"},{"id":"q37","level":"進階","q":"「外來挑戰→加強治理→更多建設」屬於哪種歷史思考？","o":["因果關係","地形分類","生物分類","文法分析"],"a":0,"e":"這是在建立事件間的因果鏈。","s":"歷史思考"},{"id":"q38","level":"進階","q":"若只讀官方建設紀錄，還應補充哪種資料？","o":["更多官方標語","地方居民與不同群體的生活經驗","更多官員肖像","更多年份"],"a":1,"e":"不同來源有助呈現多元經驗。","s":"多元視角"},{"id":"q39","level":"進階","q":"開港後臺灣與外界交流增加，最不能直接推出？","o":["貿易活動可能成長","外國商品與人士增加","臺灣原有文化全部消失","新知識可能傳入"],"a":2,"e":"交流不等於原有文化完全被取代。","s":"證據界線"},{"id":"q40","level":"進階","q":"第三單元最適合用哪條因果鏈整理？","o":["鐵路→臺灣位置改變","開港→史前時代→恐龍","民變→地球停止自轉","移民開墾→社會變化；開港與外來挑戰→治理與建設轉變"],"a":3,"e":"這條鏈最符合單元核心。","s":"總整"},{"id":"q41","level":"素養","q":"【閱讀】清帝國前期限制漢人渡臺，但仍有不少人冒險來臺開墾。隨人口與聚落增加，也出現土地、水源與利益衝突。最合理的結論是？","o":["移民同時帶來發展與社會挑戰","限制政策完全不存在","移民只帶來衝突","人口增加一定沒有影響"],"a":0,"e":"移民可帶來開墾發展，也可能增加資源衝突。","s":"閱讀整合"},{"id":"q42","level":"素養","q":"【閱讀】某地開港後，外國商人增加，貨物進出口變多，附近市街快速成長。哪個因素最能解釋市街變化？","o":["山脈突然降低","港口貿易帶動商業活動","人口全部離開","季風停止"],"a":1,"e":"貿易增加會帶動人口、商業與城市發展。","s":"閱讀整合"},{"id":"q43","level":"素養","q":"【閱讀】牡丹社事件後，清廷派沈葆楨來臺加強防禦。這段材料最能支持哪個推論？","o":["沈葆楨是商人","清廷完全不重視臺灣","外來事件可能促使政府調整治理政策","事件只影響氣候"],"a":2,"e":"外來挑戰促使治理改變。","s":"閱讀整合"},{"id":"q44","level":"素養","q":"【閱讀】清法戰爭後，臺灣建省，劉銘傳推動鐵路、電報等建設。哪個因果鏈最合理？","o":["建省使所有衝突消失","鐵路出現→清法戰爭才發生","電報讓臺灣成為島嶼","戰略重要性提高→治理升級→交通通訊建設增加"],"a":3,"e":"事件順序與因果最合理。","s":"閱讀整合"},{"id":"q45","level":"素養","q":"【閱讀】斯文豪調查臺灣鳥類、蛙類與哺乳類並發表研究。這最能說明？","o":["臺灣與西方科學知識交流增加","臺灣沒有自然環境","斯文豪是臺灣巡撫","自然調查就是軍事統治"],"a":0,"e":"自然調查是科學交流的一部分。","s":"閱讀整合"},{"id":"q46","level":"素養","q":"【閱讀】外國傳教士來臺建立醫療與教育機構。若要評估長期影響，最適合觀察？","o":["只有建築顏色","醫療服務、學校與知識傳播的變化","每日降雨量","海岸形狀"],"a":1,"e":"這些指標直接對應醫療與教育影響。","s":"資料素養"},{"id":"q47","level":"素養","q":"【題組】甲資料說開港後貿易大增；乙資料說清廷後期增加防務與建設。把兩份資料合起來，最合理結論是？","o":["貿易增加必然讓政府消失","兩份資料互相矛盾","臺灣對外連結與戰略重要性同步提高","建設與國際環境無關"],"a":2,"e":"經濟與戰略重要性可同時上升。","s":"跨資料整合"},{"id":"q48","level":"素養","q":"【題組】某同學說：「劉銘傳修鐵路，所以清代臺灣已經和今天一樣現代化。」這句話哪裡要修正？","o":["現代化只看服裝","鐵路不存在","劉銘傳不是清代人物","單一建設不能代表整個社會已與今日相同"],"a":3,"e":"歷史變遷是漸進的，不能用單一建設過度推論。","s":"證據界線"},{"id":"q49","level":"素養","q":"【閱讀】一處城市同時保留清代港口、傳教醫療機構與早期鐵路遺跡。最適合的展覽主題是？","o":["清帝國後期臺灣的對外交流與近代化變遷","史前人的一天","大航海時代只有荷蘭人","現代手機發展史"],"a":0,"e":"這些材料共同反映開港、醫療與建設。","s":"文化資產"},{"id":"q50","level":"素養","q":"【總整】哪一組最能統整第三單元？","o":["限制渡臺→臺灣完全沒有人→歷史停止","移民開墾改變社會→開港通商加深對外連結→外來挑戰促使治理與建設改變→西方知識與文化進入","開港→所有傳統消失→只有西方文化","清法戰爭→臺灣移到歐洲"],"a":1,"e":"第三單元核心是社會、經濟、治理與文化交流的連鎖變化。","s":"總整"}];
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
 if(done===50)r.innerHTML='<div class="completion-medal" aria-hidden="true">🏅</div><div><strong>第三單元挑戰完成！</strong><p>50 / 50 題全部完成，本單元獲得 250 / 250 點。</p></div>';
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
 const cfg={基礎:['第一區｜基礎 20 題','先掌握移民、開港、建設與人物之間的關係。',20],進階:['第二區｜進階挑戰 20 題','比較原因、證據與不同群體的影響。',20],素養:['第三區｜素養 10 題','閱讀較長材料，整合不同線索再判斷。',10]}[activeSegment];
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
 if(!n){document.querySelector('#resumeTitle').textContent='第三單元 50 題已完成';document.querySelector('#resumeText').textContent='可以前往錯題小本本複習。';return;}
 const idx=questions.findIndex(q=>q.id===n.id)+1;
 document.querySelector('#resumeTitle').textContent=`繼續第三單元挑戰｜第 ${idx} 題`;
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