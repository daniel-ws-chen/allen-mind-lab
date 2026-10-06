const WALLET_KEY='amlKidsRewardWalletV1';
const SCOPE_KEY='amlKidsMyScopeV1';
const VISUAL_KEY='amlKidsVisualChallengeV2';
const VISUAL_LAST_KEY='amlKidsVisualLastActivityV1';
const DAILY_KEY='amlKidsDaily5V1';

const catalog=window.AML_KIDS_CATALOG;
const units=(catalog?.units||[]).map(unit=>({...unit}));
const questionsPerUnit=catalog?.questionsPerUnit||50;
const subjectOrder=catalog?.subjects||[];
const gradeLabels={1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'七',8:'八',9:'九',10:'十',11:'十一',12:'十二'};

function readArray(key){
  try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x:[];}catch{return [];}
}
function readResumeId(key){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'null');
    if(value&&typeof value==='object'&&typeof value.id==='string') return value.id;
    if(typeof value==='string') return value;
  }catch{}
  return '';
}
function unitState(unit){
  if(unit.complete) return {key:'complete',label:'已完成'};
  if(unit.done>0) return {key:'active',label:'進行中'};
  return {key:'new',label:'未開始'};
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
let visualLastActivity=null;
try{visualLastActivity=JSON.parse(localStorage.getItem(VISUAL_LAST_KEY)||'null');}catch{}
let visualState={};
try{visualState=JSON.parse(localStorage.getItem(VISUAL_KEY)||'{}')||{};}catch{}

function todayKey(){
  const d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function renderDailyFive(){
  const wrap=document.getElementById('dailyFiveCard');
  if(!wrap) return;
  let all={};
  try{all=JSON.parse(localStorage.getItem(DAILY_KEY)||'{}')||{};}catch{}
  const state=all[todayKey()]||{};
  const done=Math.min(5,new Set(Array.isArray(state.completed)?state.completed:[]).size);
  wrap.innerHTML=
    '<div><strong>'+(done>=5?'今天完成了 5 / 5 題 🌟':'今天完成 '+done+' / 5 題')+'</strong>'+
    '<p>'+(done>=5?'明天會換成新的五科題目。':'國文、英文、數學、自然、社會各 1 題；不影響原單元進度與點數。')+'</p></div>'+
    '<a href="../daily/">'+(done>=5?'查看今日題目':'繼續今日 5 題')+' →</a>';
}

function visualScopeKey(subject,publisher,version){
  const selected=scopes.find(s=>s.key===selectedScope);
  const stage=selected?.stage||catalog?.currentScope?.stage||'國小';
  const grade=selected?.grade||catalog?.currentScope?.grade||5;
  const semester=selected?.semester||catalog?.currentScope?.semester||'上學期';
  return [stage,grade,semester,subject,publisher,version].join('|');
}
function visualHref(subject,publisher,version){
  const selected=scopes.find(s=>s.key===selectedScope);
  const stage=selected?.stage||catalog?.currentScope?.stage||'國小';
  const grade=selected?.grade||catalog?.currentScope?.grade||5;
  const semester=selected?.semester||catalog?.currentScope?.semester||'上學期';
  return '../visual-challenges/?stage='+encodeURIComponent(stage)+
    '&grade='+encodeURIComponent(grade)+
    '&semester='+encodeURIComponent(semester)+
    '&subject='+encodeURIComponent(subject)+
    '&publisher='+encodeURIComponent(publisher)+
    '&version='+encodeURIComponent(version);
}

function renderRecentLearning(){
  const wrap=document.getElementById('recentLearning');
  if(!wrap) return;
  const standardTime=Number(lastActivity?.updatedAt||0);
  const visualTime=Number(visualLastActivity?.updatedAt||0);

  if(!standardTime&&!visualTime){
    wrap.innerHTML='<strong>還沒有最近學習紀錄</strong><p>完成任一題目或開始視覺挑戰後，這裡會顯示最近一次活動。</p>';
    return;
  }

  if(visualTime>standardTime){
    const label=visualLastActivity?.label||'視覺';
    const qn=Number(visualLastActivity?.index)+1;
    const href=visualLastActivity?.path||visualHref(
      visualLastActivity?.subject||'',
      visualLastActivity?.publisher||'',
      visualLastActivity?.version||''
    );
    wrap.innerHTML='<strong>'+label+'｜視覺題</strong><p>最近做到第 '+(Number.isFinite(qn)?qn:1)+' 題。</p><a href="'+href+'">回到視覺題 →</a>';
    return;
  }

  const recentUnit=lastActivity?.path
    ? data.find(u=>u.url===lastActivity.path||u.url.replace(/\/$/,'')===String(lastActivity.path).replace(/\/$/,''))
    : null;
  if(recentUnit){
    const qn=Number(String(lastActivity.questionId||'').replace(/\D/g,''));
    const detail=qn?('第 '+qn+' 題'+(lastActivity.level?'（'+lastActivity.level+'）':'')):'最近一次題目';
    const params=lastActivity.questionId?('?resume='+encodeURIComponent(lastActivity.questionId)):'';
    wrap.innerHTML='<strong>'+recentUnit.subject+'｜'+recentUnit.title+'</strong><p>最近活動：'+detail+'。</p><a href="'+recentUnit.url+params+'#challenge">回到最近學習 →</a>';
  }else{
    wrap.innerHTML='<strong>最近學習已記錄</strong><p>目前找不到對應單元入口，可從各科完成度繼續。</p>';
  }
}

function renderDashboard(){
  renderDailyFive();
  renderRecentLearning();
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
      const resumeId=readResumeId(inProgress.resume);
      continueLink.href=inProgress.url+(resumeId?('?resume='+encodeURIComponent(resumeId)):'')+'#challenge';
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
      const percent=max?Math.round(done/max*100):0;
      const visualKey=visualScopeKey(subject,edition.publisher,edition.version);
      const visual=visualState[visualKey]||{};
      const visualDone=Math.min(10,new Set(Array.isArray(visual.completed)?visual.completed:[]).size);
      const visualPending=new Set(Array.isArray(visual.mistakes)?visual.mistakes:[]).size;
      article.innerHTML=
        '<div class="subject-progress-head"><div><span class="section-kicker">'+subject+'｜'+editionLabel+'</span><h3>'+complete+' / '+list.length+' 單元完成</h3></div><strong>'+done+' / '+max+' 題<span class="subject-progress-percent">'+percent+'%</span></strong></div>'+
        '<div class="progress-line" role="progressbar" aria-label="'+subject+' '+editionLabel+' 完成度 '+percent+'%" aria-valuemin="0" aria-valuemax="'+max+'" aria-valuenow="'+done+'"><div class="progress-fill" style="width:'+percent+'%"></div></div>'+
        '<a class="edition-visual-link" href="'+visualHref(subject,edition.publisher,edition.version)+'"><strong>👁 視覺題 '+visualDone+' / 10</strong><span>'+(visualPending?'待複習 '+visualPending+' 題':'版本內第四題型')+' →</span></a>'+
        '<div class="unit-mini-grid">'+list.map(u=>{
          const state=unitState(u);
          const resumeId=state.key==='active'?readResumeId(u.resume):'';
          const href=u.url+(resumeId?('?resume='+encodeURIComponent(resumeId)):'')+(state.key==='active'?'#challenge':'');
          return '<a class="unit-mini unit-mini--'+state.key+'" href="'+href+'"><span class="unit-mini-copy"><span class="unit-mini-head"><strong>'+u.title+'</strong><span class="unit-mini-state">'+state.label+'</span></span><small>'+u.done+' / '+questionsPerUnit+' 題'+(u.pending?' · 待訂正 '+u.pending:'')+'</small></span><span aria-hidden="true">'+(u.complete?'✓':'→')+'</span></a>';
        }).join('')+'</div>';
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
