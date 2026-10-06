const WALLET_KEY='amlKidsRewardWalletV1';

const catalog=window.AML_KIDS_CATALOG;
const units=(catalog?.units||[]).map(unit=>({...unit}));
const questionsPerUnit=catalog?.questionsPerUnit||50;

function readArray(key){
  try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x:[];}catch{return [];}
}
function stats(unit){
  const awards=new Set(readArray(unit.awards));
  const mistakes=readArray(unit.mistakes);
  const pending=mistakes.filter(m=>!awards.has(m.id)).length;
  return {...unit,done:awards.size,pending,complete:awards.size>=questionsPerUnit};
}

const data=units.map(stats);
const totalPoints=Number(localStorage.getItem(WALLET_KEY)||0);
const totalDone=data.reduce((a,u)=>a+Math.min(questionsPerUnit,u.done),0);
const totalPending=data.reduce((a,u)=>a+u.pending,0);
const completeUnits=data.filter(u=>u.complete).length;

document.getElementById('totalPoints').textContent=totalPoints.toLocaleString();
document.getElementById('completedUnits').textContent=completeUnits+' / '+units.length;
document.getElementById('completedQuestions').textContent=totalDone+' / '+(units.length*questionsPerUnit);
document.getElementById('pendingMistakes').textContent=totalPending;

let lastActivity=null;
try{lastActivity=JSON.parse(localStorage.getItem('amlKidsLastActivityV1')||'null');}catch{}
const continueSection=document.getElementById('continueSection');
const continueText=document.getElementById('continueText');
const continueLink=document.getElementById('continueLink');

if(lastActivity&&lastActivity.path&&lastActivity.path.startsWith('/aml-kids/')){
  continueSection.hidden=false;
  const qn=Number(String(lastActivity.questionId||'').replace(/\D/g,''));
  const detail=qn?('，上次做到第 '+qn+' 題'+(lastActivity.level?'（'+lastActivity.level+'）':'')):'';
  continueText.textContent=(lastActivity.title||'最近學習單元')+detail+'。';
  const params=lastActivity.questionId?('?resume='+encodeURIComponent(lastActivity.questionId)):'';
  continueLink.href=lastActivity.path+params+'#challenge';
  continueLink.textContent='回到最近學習 →';
}else{
  const inProgress=data.find(u=>u.done>0&&!u.complete);
  if(inProgress){
    continueSection.hidden=false;
    continueText.textContent=inProgress.subject+'｜'+inProgress.title+'，目前完成 '+inProgress.done+' / 50 題。';
    continueLink.href=inProgress.url+'#challenge';
    continueLink.textContent='繼續 '+inProgress.subject+' →';
  }
}

const subjectOrder=['國文','社會','自然','英文','數學'];
const wrap=document.getElementById('subjectProgress');
subjectOrder.forEach(subject=>{
  const list=data.filter(u=>u.subject===subject);
  const done=list.reduce((a,u)=>a+Math.min(questionsPerUnit,u.done),0);
  const max=list.length*50;
  const complete=list.filter(u=>u.complete).length;
  const article=document.createElement('article');
  article.className='subject-progress-card';
  article.innerHTML=
    '<div class="subject-progress-head"><div><span class="section-kicker">'+subject+'</span><h3>'+complete+' / '+list.length+' 單元完成</h3></div><strong>'+done+' / '+max+' 題</strong></div>'+
    '<div class="progress-line" role="progressbar" aria-label="'+subject+'完成度" aria-valuemin="0" aria-valuemax="'+max+'" aria-valuenow="'+done+'"><div class="progress-fill" style="width:'+Math.round(done/max*100)+'%"></div></div>'+
    '<div class="unit-mini-grid">'+list.map(u=>
      '<a class="unit-mini" href="'+u.url+'"><span><strong>'+u.title+'</strong><small>'+u.done+' / '+questionsPerUnit+' 題'+(u.pending?' · 待訂正 '+u.pending:'')+'</small></span><span aria-hidden="true">'+(u.complete?'✓':'→')+'</span></a>'
    ).join('')+'</div>';
  wrap.appendChild(article);
});
