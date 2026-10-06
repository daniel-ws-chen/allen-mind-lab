const WALLET_KEY='amlKidsRewardWalletV1';
const SCOPE_KEY='amlKidsMyScopeV1';

const catalog=window.AML_KIDS_CATALOG;
const units=(catalog?.units||[]).map(unit=>({...unit}));
const questionsPerUnit=catalog?.questionsPerUnit||50;
const subjectOrder=catalog?.subjects||[];
const gradeLabels={1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'七',8:'八',9:'九',10:'十',11:'十一',12:'十二'};

function readArray(key){
  try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x:[];}catch{return [];}
}
function stats(unit){
  const awards=new Set(readArray(unit.awards));
  const mistakes=readArray(unit.mistakes);
  const pending=mistakes.filter(m=>!awards.has(m.id)).length;
  return {...unit,done:awards.size,pending,complete:awards.size>=questionsPerUnit};
}
function scopeKey(unit){
  return [unit.stage,unit.grade,unit.semester].join('|');
}
function scopeText(scope){
  return (scope.stage||'')+(gradeLabels[scope.grade]||scope.grade||'')+'年級'+(scope.semester||'');
}

const data=units.map(stats);
const scopes=[];
const seenScopes=new Set();
units.forEach(unit=>{
  const key=scopeKey(unit);
  if(seenScopes.has(key)) return;
  seenScopes.add(key);
  scopes.push({key,stage:unit.stage,grade:unit.grade,semester:unit.semester});
});

const defaultScope=catalog?.currentScope?scopeKey(catalog.currentScope):(scopes[0]?.key||'');
let selectedScope=localStorage.getItem(SCOPE_KEY)||defaultScope;
if(!scopes.some(s=>s.key===selectedScope)) selectedScope=defaultScope;

const scopeSelect=document.getElementById('scopeSelect');
scopes.forEach(scope=>{
  const option=document.createElement('option');
  option.value=scope.key;
  option.textContent=scopeText(scope);
  scopeSelect.appendChild(option);
});
scopeSelect.value=selectedScope;

let lastActivity=null;
try{lastActivity=JSON.parse(localStorage.getItem('amlKidsLastActivityV1')||'null');}catch{}

function renderDashboard(){
  const scopedData=data.filter(u=>scopeKey(u)===selectedScope);
  const scopedUnits=units.filter(u=>scopeKey(u)===selectedScope);
  const totalPoints=Number(localStorage.getItem(WALLET_KEY)||0);
  const totalDone=scopedData.reduce((a,u)=>a+Math.min(questionsPerUnit,u.done),0);
  const totalPending=scopedData.reduce((a,u)=>a+u.pending,0);
  const completeUnits=scopedData.filter(u=>u.complete).length;
  const totalQuestions=scopedUnits.length*questionsPerUnit;

  document.getElementById('totalPoints').textContent=totalPoints.toLocaleString();
  document.getElementById('completedUnits').textContent=completeUnits+' / '+scopedUnits.length;
  document.getElementById('completedQuestions').textContent=totalDone+' / '+totalQuestions;
  document.getElementById('pendingMistakes').textContent=totalPending;

  const selected=scopes.find(s=>s.key===selectedScope);
  const scopeLabel=document.getElementById('scopeLabel');
  if(scopeLabel) scopeLabel.textContent=(selected?scopeText(selected):(catalog?.scopeLabel||'目前內容'))+'學習地圖';
  const progressRule=document.getElementById('progressRule');
  if(progressRule) progressRule.textContent='完成度依每單元 '+questionsPerUnit+' 題計算；學習點數為跨學習範圍累積總點數。';

  const continueSection=document.getElementById('continueSection');
  const continueText=document.getElementById('continueText');
  const continueLink=document.getElementById('continueLink');
  continueSection.hidden=true;

  const recentUnit=lastActivity?.path
    ? scopedData.find(u=>u.url===lastActivity.path||u.url.replace(/\/$/,'')===String(lastActivity.path).replace(/\/$/,''))
    : null;

  if(recentUnit){
    continueSection.hidden=false;
    const qn=Number(String(lastActivity.questionId||'').replace(/\D/g,''));
    const detail=qn?('，上次做到第 '+qn+' 題'+(lastActivity.level?'（'+lastActivity.level+'）':'')):'';
    continueText.textContent=(lastActivity.title||recentUnit.title)+detail+'。';
    const params=lastActivity.questionId?('?resume='+encodeURIComponent(lastActivity.questionId)):'';
    continueLink.href=recentUnit.url+params+'#challenge';
    continueLink.textContent='回到最近學習 →';
  }else{
    const inProgress=scopedData.find(u=>u.done>0&&!u.complete);
    if(inProgress){
      continueSection.hidden=false;
      continueText.textContent=inProgress.subject+'｜'+inProgress.title+'，目前完成 '+inProgress.done+' / '+questionsPerUnit+' 題。';
      continueLink.href=inProgress.url+'#challenge';
      continueLink.textContent='繼續 '+inProgress.subject+' →';
    }
  }

  const wrap=document.getElementById('subjectProgress');
  wrap.innerHTML='';
  const scopedSubjects=subjectOrder.filter(subject=>scopedData.some(u=>u.subject===subject));
  scopedSubjects.forEach(subject=>{
    const subjectUnits=scopedData.filter(u=>u.subject===subject);
    const editions=[];
    const editionMap=new Map();
    subjectUnits.forEach(unit=>{
      const key=unit.publisher+'|'+unit.version;
      if(!editionMap.has(key)){
        const group={publisher:unit.publisher,version:unit.version,units:[]};
        editionMap.set(key,group);
        editions.push(group);
      }
      editionMap.get(key).units.push(unit);
    });

    editions.forEach(edition=>{
      const list=edition.units;
      const done=list.reduce((a,u)=>a+Math.min(questionsPerUnit,u.done),0);
      const max=list.length*questionsPerUnit;
      const complete=list.filter(u=>u.complete).length;
      const editionLabel=edition.publisher+' '+edition.version;
      const article=document.createElement('article');
      article.className='subject-progress-card';
      article.innerHTML=
        '<div class="subject-progress-head"><div><span class="section-kicker">'+subject+'｜'+editionLabel+'</span><h3>'+complete+' / '+list.length+' 單元完成</h3></div><strong>'+done+' / '+max+' 題</strong></div>'+
        '<div class="progress-line" role="progressbar" aria-label="'+subject+' '+editionLabel+' 完成度" aria-valuemin="0" aria-valuemax="'+max+'" aria-valuenow="'+done+'"><div class="progress-fill" style="width:'+Math.round(done/max*100)+'%"></div></div>'+
        '<div class="unit-mini-grid">'+list.map(u=>
          '<a class="unit-mini" href="'+u.url+'"><span><strong>'+u.title+'</strong><small>'+u.done+' / '+questionsPerUnit+' 題'+(u.pending?' · 待訂正 '+u.pending:'')+'</small></span><span aria-hidden="true">'+(u.complete?'✓':'→')+'</span></a>'
        ).join('')+'</div>';
      wrap.appendChild(article);
    });
  });
}

scopeSelect.addEventListener('change',()=>{
  selectedScope=scopeSelect.value;
  localStorage.setItem(SCOPE_KEY,selectedScope);
  renderDashboard();
});

renderDashboard();
