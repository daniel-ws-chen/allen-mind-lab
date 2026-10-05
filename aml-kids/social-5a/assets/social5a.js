const WALLET_KEY='amlKidsRewardWalletV1';
const UNIT_SCORE_KEY='amlKidsSocial5aU1ScoreV3';
const AWARDS_KEY='amlKidsSocial5aU1AwardsV3';
const MISTAKES_KEY='amlKidsSocial5aU1MistakesV3';
const UNIT_MAX=250;

const state={
 wallet:Number(localStorage.getItem(WALLET_KEY)||0),
 unitScore:Number(localStorage.getItem(UNIT_SCORE_KEY)||0),
 awards:new Set(JSON.parse(localStorage.getItem(AWARDS_KEY)||'[]')),
 mistakes:JSON.parse(localStorage.getItem(MISTAKES_KEY)||'[]')
};

const bossQuestions=[
 {
  id:'bossv3-1',
  title:'Boss 1｜位置 × 交流',
  q:'十五至十七世紀，東亞海上貿易逐漸頻繁。若一座島嶼位在日本、中國大陸與東南亞之間的海域，下列哪一項最合理？',
  opts:[['a','這座島嶼一定會成為所有國家的首都'],['b','它可能因交通位置而增加與不同地區接觸的機會'],['c','只要四面環海就不可能與外界交流'],['d','地理位置只會影響氣候，不會影響人的活動']],
  ans:'b',
  review:'1-1｜位置與交流',
  explain:'題目不是要你背「重要位置」，而是從相對位置推論：位在多個地區之間，可能提高交通與交流機會。'
 },
 {
  id:'bossv3-2',
  title:'Boss 2｜資料判讀',
  q:'某地冬季常有來自東北方向的風，迎風面的地區降雨較多。若要解釋這個現象，下列哪一組資料最有幫助？',
  opts:[['a','風向資料＋地形位置'],['b','便利商店數量＋人口姓名'],['c','學校數量＋道路名稱'],['d','手機品牌＋房屋顏色']],
  ans:'a',
  review:'1-1｜季風、位置與生活',
  explain:'判讀天氣差異時，風從哪裡來與地形是否迎風，比與天氣無直接關係的生活資料更有解釋力。'
 },
 {
  id:'bossv3-3',
  title:'Boss 3｜證據的界線',
  q:'遺址出土大量魚骨、貝殼、捕魚工具與少量穀物。哪一個結論最符合目前證據？',
  opts:[['a','居民只吃魚，完全沒有其他食物'],['b','居民可能重視水域資源，也可能接觸或使用部分植物性食物'],['c','居民一定不會耕作，因為魚骨比較多'],['d','只要有穀物，就能確定居民已經有大型農業社會']],
  ans:'b',
  review:'1-2｜多項證據與合理推論',
  explain:'證據可以支持「較常利用什麼」，卻不代表能排除所有其他可能。'
 },
 {
  id:'bossv3-4',
  title:'Boss 4｜人與環境',
  q:'甲、乙兩個族群都生活在山區，但各自保留不同語言、祭儀與社會傳統。哪個說法最能解釋這個現象？',
  opts:[['a','自然環境對文化沒有任何影響'],['b','只要住山區，文化理論上就必須完全相同'],['c','環境會影響資源與生活，但歷史與傳統也會讓文化走出不同發展'],['d','文化不同代表其中一族一定比較落後']],
  ans:'c',
  review:'1-3｜環境不是唯一因素',
  explain:'文化是多種因素共同形成的，不能只用單一環境特徵解釋。'
 },
 {
  id:'bossv3-5',
  title:'Boss 5｜跨課整合',
  q:'下列哪一段推理同時符合第一單元三課強調的方法？',
  opts:[
   ['a','看到臺灣在地圖上的位置→思考交流機會；看到文物→依證據推測生活；看到文化差異→同時考慮環境與歷史'],
   ['b','看到地圖→直接猜歷史；看到一件文物→斷定全部生活；看到傳統服飾→認為所有族人每天都一樣'],
   ['c','所有問題都只要記住一個固定答案，不必看資料'],
   ['d','只要選項有「一定」兩字就一定正確']
  ],
  ans:'a',
  review:'第一單元概念總圖',
  explain:'第一單元真正共通的方法是：看資料、找關係、根據證據推論，而且避免把有限資訊說成絕對結論。'
 }
];

function save(){
 localStorage.setItem(WALLET_KEY,String(state.wallet));
 localStorage.setItem(UNIT_SCORE_KEY,String(state.unitScore));
 localStorage.setItem(AWARDS_KEY,JSON.stringify([...state.awards]));
 localStorage.setItem(MISTAKES_KEY,JSON.stringify(state.mistakes));
}
function renderScore(){
 document.querySelector('#scoreText').textContent=`${state.wallet} / 1000`;
 document.querySelector('#scoreProgress').value=Math.min(state.wallet,1000);
 document.querySelector('#unitScoreText').textContent=`本單元 ${Math.min(state.unitScore,UNIT_MAX)} / ${UNIT_MAX}`;
 const redeem=document.querySelector('#redeemBox');
 if(redeem) redeem.hidden=state.wallet<1000;
}
function award(id,points){
 if(state.awards.has(id)) return false;
 state.awards.add(id);
 state.unitScore=Math.min(UNIT_MAX,state.unitScore+points);
 state.wallet+=points;
 save();renderScore();checkBonuses();
 return true;
}
function awardBonus(id,points){
 if(state.awards.has(id)) return;
 state.awards.add(id);
 state.unitScore=Math.min(UNIT_MAX,state.unitScore+points);
 state.wallet+=points;
 save();renderScore();
}
function checkBonuses(){
 const allBoss=bossQuestions.every(q=>state.awards.has(q.id));
 if(allBoss) awardBonus('u1-v3-boss-complete',20);
 const allCompetency=['l11c1','l12c1','l13c1'].every(id=>state.awards.has(id));
 if(allCompetency) awardBonus('u1-v3-competency-complete',25);
}
function recordMistake(id,text,review){
 if(!state.mistakes.some(x=>x.id===id)){
  state.mistakes.push({id,text,review});
  save();renderMistakes();
 }
}
function renderMistakes(){
 const ul=document.querySelector('#mistakeList');ul.innerHTML='';
 if(!state.mistakes.length){ul.innerHTML='<li>目前沒有錯題，繼續保持！</li>';return;}
 state.mistakes.forEach(m=>{
  const li=document.createElement('li');
  li.textContent=`${m.text}｜建議回看：${m.review}`;
  ul.appendChild(li);
 });
}
function showPanel(id){
 document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===id));
 document.querySelectorAll('.tab-btn').forEach(b=>{
  if(b.dataset.target===id)b.setAttribute('aria-current','page');
  else b.removeAttribute('aria-current');
 });
 history.replaceState(null,'',`#${id}`);

 // 換頁時固定回到目前內容區塊頂端，避免焦點造成畫面停在中段。
 const p=document.getElementById(id);
 const nav=document.querySelector('.lesson-nav');
 const offset=(nav?.offsetHeight||0)+12;
 const top=Math.max(0,p.getBoundingClientRect().top+window.scrollY-offset);
 window.scrollTo({top,behavior:'auto'});

 // 先捲動再把焦點移到該頁第一個標題；preventScroll 避免瀏覽器再次把畫面拉到中間。
 requestAnimationFrame(()=>{
  const heading=p.querySelector('h2');
  if(heading){
   if(!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex','-1');
   heading.focus({preventScroll:true});
  }else{
   p.focus({preventScroll:true});
  }
 });
}
document.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.target)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.go)));

document.querySelectorAll('.check').forEach(btn=>btn.addEventListener('click',()=>{
 const box=btn.closest('.quiz,.competency');
 if(btn.classList.contains('boss-check')) return;
 const radio=box.querySelector('input[type=radio]:checked');
 const fb=box.querySelector('.feedback');
 if(!radio){fb.textContent='請先選一個答案。';return;}
 const qid=box.dataset.quiz||radio.name;
 const correct=radio.value===btn.dataset.answer;
 if(correct){
   const gained=award(qid,Number(btn.dataset.points));
   fb.textContent=(gained?`✅ 推理正確！+${btn.dataset.points} 點。 `:'✅ 推理正確！這題積分已領取過。 ')+(btn.dataset.explain||'');
   box.classList.add('correct');box.classList.remove('incorrect');
 }else{
   fb.textContent='🔍 這個選項看起來有可能，但證據還不夠支持。請再比較各選項的「可能」與「一定」。';
   box.classList.add('incorrect');box.classList.remove('correct');
   recordMistake(qid,box.querySelector('p').textContent,'回看本課「一句話記住」與三個推理重點');
 }
}));

function renderBoss(){
 const wrap=document.querySelector('#bossQuestions');
 bossQuestions.forEach((q,i)=>{
  const d=document.createElement('div');
  d.className='quiz';
  d.dataset.quiz=q.id;
  d.innerHTML=`<span class="level-chip">高階挑戰</span><h3>${q.title}</h3><p>${q.q}</p>${q.opts.map(([v,t])=>`<label><input type="radio" name="${q.id}" value="${v}"> ${t}</label>`).join('')}<button class="check boss-check">送出答案</button><p class="feedback" aria-live="polite"></p>`;
  wrap.appendChild(d);
 });
 document.querySelectorAll('.boss-check').forEach(btn=>btn.addEventListener('click',()=>{
   const box=btn.closest('.quiz');
   const q=bossQuestions.find(x=>x.id===box.dataset.quiz);
   const sel=box.querySelector('input:checked');
   const fb=box.querySelector('.feedback');
   if(!sel){fb.textContent='請先選一個答案。';return;}
   if(sel.value===q.ans){
     const gained=award(q.id,20);
     fb.textContent=(gained?'✅ Boss 推理成功！+20 點。 ':'✅ 推理正確！這題積分已領取過。 ')+q.explain;
     box.classList.add('correct');box.classList.remove('incorrect');
   }else{
     fb.textContent=`🔍 這題不是只找關鍵字。建議回看：${q.review}`;
     box.classList.add('incorrect');box.classList.remove('correct');
     recordMistake(q.id,q.q,q.review);
   }
   const done=bossQuestions.filter(x=>state.awards.has(x.id)).length;
   const result=document.querySelector('#bossResult');
   result.hidden=false;
   result.textContent=done===bossQuestions.length?'🎉 Boss 全部完成！已加上 20 點 Boss 完成獎勵。':`目前 Boss 已完成 ${done} / ${bossQuestions.length} 題。`;
 }));
}

const redeemBtn=document.querySelector('#parentRedeemInfo');
if(redeemBtn){
 redeemBtn.addEventListener('click',()=>{
  document.querySelector('#redeemInfo').textContent='請由爸爸媽媽確認實際獎勵與兌換；Prototype 暫不自動扣點，避免誤觸。';
 });
}

renderBoss();renderScore();renderMistakes();checkBonuses();
showPanel(location.hash?.slice(1)&&document.getElementById(location.hash.slice(1))?location.hash.slice(1):'home');