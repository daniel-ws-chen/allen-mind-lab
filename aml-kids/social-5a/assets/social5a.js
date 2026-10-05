const WALLET_KEY='amlKidsRewardWalletV1';
const UNIT_SCORE_KEY='amlKidsSocial5aU1ScoreV2';
const AWARDS_KEY='amlKidsSocial5aU1AwardsV2';
const MISTAKES_KEY='amlKidsSocial5aU1MistakesV2';
const UNIT_MAX=250;

const state={
 wallet:Number(localStorage.getItem(WALLET_KEY)||0),
 unitScore:Number(localStorage.getItem(UNIT_SCORE_KEY)||0),
 awards:new Set(JSON.parse(localStorage.getItem(AWARDS_KEY)||'[]')),
 mistakes:JSON.parse(localStorage.getItem(MISTAKES_KEY)||'[]')
};

const bossQuestions=[
 {id:'boss1',q:'臺灣位在下列哪個位置？',opts:[['a','亞洲東部、太平洋西側'],['b','歐洲西部、大西洋東側'],['c','北美洲東部、大西洋西側']],ans:'a',review:'1-1 第1關｜臺灣在哪裡？'},
 {id:'boss2',q:'哪一項最能支持「臺灣雖不大，但歷史上常與許多地方交流」？',opts:[['a','臺灣有很多高山'],['b','臺灣位在東亞海上交通附近'],['c','臺灣夏天很熱']],ans:'b',review:'1-1 第2關｜位置為什麼重要？'},
 {id:'boss3',q:'某遺址發現大量魚骨、貝殼與捕魚工具，最合理的推論是？',opts:[['a','居民可能利用水域資源'],['b','居民每天只吃魚'],['c','居民一定住高山頂']],ans:'a',review:'1-2 第2～3關｜文物與資源'},
 {id:'boss4',q:'兩個族群都住在山區但文化不同，最合理的說法是？',opts:[['a','環境完全沒有影響'],['b','文化只由環境決定'],['c','環境會影響生活，但歷史、傳統與交流也會影響文化']],ans:'c',review:'1-3 第2～5關｜環境與文化'},
 {id:'boss5',q:'哪一條因果關係最合理？',opts:[['a','臺灣的位置 → 容易產生交流 → 影響生活與歷史'],['b','發現一件文物 → 就知道所有歷史細節'],['c','住相同環境 → 文化一定相同']],ans:'a',review:'第一單元概念總圖'}
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
 save();renderScore();
 checkBonuses();
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
 if(allBoss) awardBonus('u1-boss-complete',25);
 const allCompetency=['l11c1','l12c1','l13c1'].every(id=>state.awards.has(id));
 if(allCompetency) awardBonus('u1-competency-complete',25);
}
function recordMistake(id,text,review){
 if(!state.mistakes.some(x=>x.id===id)){state.mistakes.push({id,text,review});save();renderMistakes();}
}
function renderMistakes(){
 const ul=document.querySelector('#mistakeList');ul.innerHTML='';
 if(!state.mistakes.length){ul.innerHTML='<li>目前沒有錯題，繼續保持！</li>';return;}
 state.mistakes.forEach(m=>{const li=document.createElement('li');li.textContent=`${m.text}｜建議回看：${m.review}`;ul.appendChild(li);});
}
function showPanel(id){
 document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===id));
 document.querySelectorAll('.tab-btn').forEach(b=>{if(b.dataset.target===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 const p=document.getElementById(id);p.focus();history.replaceState(null,'',`#${id}`);
}

document.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.target)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.go)));

document.querySelectorAll('.check').forEach(btn=>btn.addEventListener('click',()=>{
 const box=btn.closest('.quiz,.competency');const radio=box.querySelector('input[type=radio]:checked');const fb=box.querySelector('.feedback');
 if(!radio){fb.textContent='請先選一個答案。';return;}
 const qid=box.dataset.quiz||radio.name;const correct=radio.value===btn.dataset.answer;
 if(correct){
   const gained=award(qid,Number(btn.dataset.points));
   fb.textContent=gained?`✅ 答對了！+${btn.dataset.points} 點`:'✅ 答對了！這題積分已領取過。';
   box.classList.add('correct');box.classList.remove('incorrect');
 }else{
   fb.textContent='🔍 還差一點。先看解析提示，再重新想一次。';
   box.classList.add('incorrect');box.classList.remove('correct');
   recordMistake(qid,box.querySelector('p').textContent,'回到本課「一句話記住」與步驟整理');
 }
}));

function renderBoss(){
 const wrap=document.querySelector('#bossQuestions');
 bossQuestions.forEach((q,i)=>{
  const d=document.createElement('div');d.className='quiz';d.dataset.quiz=q.id;
  d.innerHTML=`<h3>Boss ${i+1}</h3><p>${q.q}</p>${q.opts.map(([v,t])=>`<label><input type="radio" name="${q.id}" value="${v}"> ${t}</label>`).join('')}<button class="check boss-check">送出答案</button><p class="feedback" aria-live="polite"></p>`;
  wrap.appendChild(d);
 });
 document.querySelectorAll('.boss-check').forEach(btn=>btn.addEventListener('click',()=>{
   const box=btn.closest('.quiz');const q=bossQuestions.find(x=>x.id===box.dataset.quiz);const sel=box.querySelector('input:checked');const fb=box.querySelector('.feedback');
   if(!sel){fb.textContent='請先選一個答案。';return;}
   if(sel.value===q.ans){const gained=award(q.id,25);fb.textContent=gained?'✅ Boss 答對！+25 點':'✅ 答對了！這題積分已領取過。';box.classList.add('correct');box.classList.remove('incorrect');}
   else{fb.textContent=`🔍 這題需要再想想。建議回看：${q.review}`;box.classList.add('incorrect');box.classList.remove('correct');recordMistake(q.id,q.q,q.review);}
   const done=bossQuestions.filter(x=>state.awards.has(x.id)).length;
   const result=document.querySelector('#bossResult');result.hidden=false;
   result.textContent=done===bossQuestions.length?'🎉 Boss 全部完成！已加上 25 點單元 Boss 完成獎勵。':`目前 Boss 已完成 ${done} / ${bossQuestions.length} 題。`;
 }));
}

const redeemBtn=document.querySelector('#parentRedeemInfo');
if(redeemBtn){
 redeemBtn.addEventListener('click',()=>{
  const out=document.querySelector('#redeemInfo');
  out.textContent='請由爸爸媽媽確認實際獎勵與兌換；Prototype 暫不自動扣點，避免誤觸。';
 });
}

renderBoss();renderScore();renderMistakes();checkBonuses();
showPanel(location.hash?.slice(1)&&document.getElementById(location.hash.slice(1))?location.hash.slice(1):'home');