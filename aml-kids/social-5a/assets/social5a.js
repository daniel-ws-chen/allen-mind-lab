const WALLET_KEY='amlKidsRewardWalletV1';
const UNIT_SCORE_KEY='amlKidsSocial5aU1ScoreV4';
const AWARDS_KEY='amlKidsSocial5aU1AwardsV4';
const MISTAKES_KEY='amlKidsSocial5aU1MistakesV4';
const UNIT_MAX=250;

const state={
 wallet:Number(localStorage.getItem(WALLET_KEY)||0),
 unitScore:Number(localStorage.getItem(UNIT_SCORE_KEY)||0),
 awards:new Set(JSON.parse(localStorage.getItem(AWARDS_KEY)||'[]')),
 mistakes:JSON.parse(localStorage.getItem(MISTAKES_KEY)||'[]')
};

const bossSets=[
 {
  id:'set-a',
  title:'題組一｜航線、季風與臺灣的位置',
  passage:[
   '小恩閱讀一份東亞航海資料。資料指出：某商船從日本南部出發，準備前往菲律賓與東南亞港口。航線經過臺灣附近海域。船長在冬季航行時，也會特別注意東北季風、海象與港口位置。',
   '小恩因此提出一個想法：「臺灣雖然面積不大，但因為位在東亞不同地區之間，地理位置可能同時影響交通、交流與人們的生活安排。」老師提醒他：要判斷這個說法是否合理，必須把『資料中真正提供的證據』和『自己過度延伸的想像』分開。'
  ],
  questions:[
   {
    id:'bossv4-1',
    q:'根據材料，哪一項最能支持「臺灣的位置有利於區域往來」？',
    opts:[['a','商船航線經過臺灣附近海域'],['b','臺灣有許多山地'],['c','冬天有時很冷'],['d','臺灣有很多城市']],
    ans:'a',
    review:'1-1｜位置與交流',
    explain:'材料直接提供「日本往東南亞的航線經過臺灣附近」這項證據，因此最能支持位置與區域往來的關係。'
   },
   {
    id:'bossv4-2',
    q:'船長冬季特別注意東北季風與海象，這最能說明哪一個觀念？',
    opts:[['a','季風只影響課本內容，不影響生活'],['b','自然環境條件可能影響交通與人的活動安排'],['c','只要有季風，所有船一定不能航行'],['d','臺灣的位置與季風完全無關']],
    ans:'b',
    review:'1-1｜季風、環境與生活',
    explain:'材料沒有說「一定不能航行」，而是指出航行者需要依季風與海象調整安排，這就是環境條件影響人類活動。'
   },
   {
    id:'bossv4-3',
    q:'下列哪一句屬於「材料還不能證明的過度推論」？',
    opts:[['a','臺灣附近可能有區域航線經過'],['b','季風可能影響航行安排'],['c','所有經過臺灣附近的商船都一定停靠臺灣'],['d','位置可能影響交流機會']],
    ans:'c',
    review:'1-1｜證據與推論的界線',
    explain:'「航線經過」不等於「每艘船都一定停靠」。素養題常考的正是：資料支持到哪裡，就說到哪裡。'
   }
  ]
 },
 {
  id:'set-b',
  title:'題組二｜考古線索與文化理解',
  passage:[
   '考古隊在一處靠近河口的遺址發現大量魚骨、貝殼、捕魚工具、陶器與少量穀物痕跡。研究人員因此推測，當地居民可能經常利用水域資源，但他們沒有直接說「居民完全不種植作物」，因為目前的證據還不足以排除其他可能。',
   '另一份資料記錄兩個都居住在山區的族群。兩個族群利用的自然資源有部分相似，但語言、祭儀、飲食與社會傳統仍有不同。研究者認為，自然環境會影響生活條件，但歷史經驗、傳統與族群交流也會共同形塑文化。'
  ],
  questions:[
   {
    id:'bossv4-4',
    q:'根據第一段考古資料，哪一項推論最合理？',
    opts:[['a','居民一定只吃魚和貝類'],['b','居民可能常利用水域資源，但不能因此斷定完全沒有農作'],['c','只要找到陶器，就能證明有文字'],['d','少量穀物可以證明當地一定是大型農業社會']],
    ans:'b',
    review:'1-2｜證據能支持到哪裡',
    explain:'大量魚骨、貝殼與捕魚工具支持水域資源利用；但證據不足時，不能把「尚未發現」說成「一定不存在」。'
   },
   {
    id:'bossv4-5',
    q:'第二段資料最能支持下列哪一項說法？',
    opts:[['a','相同自然環境一定形成相同文化'],['b','文化差異表示其中一族比較進步'],['c','環境是影響文化的因素之一，但不是唯一因素'],['d','只要保留傳統，就不能有現代生活']],
    ans:'c',
    review:'1-3｜環境、歷史與文化',
    explain:'兩族群都在山區卻有不同文化，正好說明環境會影響生活，但不能單獨解釋所有文化差異。'
   }
  ]
 }
];

const bossQuestions=bossSets.flatMap(s=>s.questions);

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
 if(allBoss) awardBonus('u1-v4-boss-complete',20);
 const allCompetency=['l11c1','l12c1','l13c1'].every(id=>state.awards.has(id));
 if(allCompetency) awardBonus('u1-v4-competency-complete',25);
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
 const p=document.getElementById(id);
 const nav=document.querySelector('.lesson-nav');
 const offset=(nav?.offsetHeight||0)+12;
 const top=Math.max(0,p.getBoundingClientRect().top+window.scrollY-offset);
 window.scrollTo({top,behavior:'auto'});
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
 bossSets.forEach((set,setIndex)=>{
  const group=document.createElement('section');
  group.className='reading-set';
  group.setAttribute('aria-labelledby',`${set.id}-title`);
  const title=document.createElement('h3');
  title.id=`${set.id}-title`;
  title.textContent=set.title;
  group.appendChild(title);

  const passage=document.createElement('div');
  passage.className='reading-passage';
  passage.setAttribute('aria-label',`${set.title}閱讀材料`);
  set.passage.forEach((para,i)=>{
   const p=document.createElement('p');
   p.innerHTML=`<strong>材料${i+1}：</strong>${para}`;
   passage.appendChild(p);
  });
  group.appendChild(passage);

  set.questions.forEach((q,i)=>{
   const d=document.createElement('div');
   d.className='quiz';
   d.dataset.quiz=q.id;
   d.innerHTML=`<span class="level-chip">題組 ${setIndex+1}－第 ${i+1} 題</span><h4>${q.q}</h4>${q.opts.map(([v,t])=>`<label><input type="radio" name="${q.id}" value="${v}"> ${t}</label>`).join('')}<button class="check boss-check">送出答案</button><p class="feedback" aria-live="polite"></p>`;
   group.appendChild(d);
  });
  wrap.appendChild(group);
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
     fb.textContent=`🔍 先回到上方材料找證據。建議回看：${q.review}`;
     box.classList.add('incorrect');box.classList.remove('correct');
     recordMistake(q.id,q.q,q.review);
   }
   const done=bossQuestions.filter(x=>state.awards.has(x.id)).length;
   const result=document.querySelector('#bossResult');
   result.hidden=false;
   result.textContent=done===bossQuestions.length?'🎉 兩組閱讀 Boss 全部完成！已加上 20 點 Boss 完成獎勵。':`目前 Boss 已完成 ${done} / ${bossQuestions.length} 題。`;
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