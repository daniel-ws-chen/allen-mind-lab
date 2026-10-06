const catalog=window.AML_KIDS_CATALOG;
const units=(catalog?.units||[]).map(unit=>({...unit}));
const questionsPerUnit=catalog?.questionsPerUnit||50;
const subjectOrder=catalog?.subjects||[];
const SCOPE_KEY='amlKidsMyScopeV1';
const gradeLabels={1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'七',8:'八',9:'九',10:'十',11:'十一',12:'十二'};

function readArray(key){
  try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[];}catch{return [];}
}
function scopeKey(unit){
  return [unit.stage,unit.grade,unit.semester].join('|');
}
function scopeLabel(unit){
  return (unit.stage||'')+(gradeLabels[unit.grade]||unit.grade||'')+'年級'+(unit.semester||'');
}

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

const scopeFilter=document.getElementById('scopeFilter');
scopes.forEach(scope=>{
  const option=document.createElement('option');
  option.value=scope.key;
  option.textContent=scopeLabel(scope);
  scopeFilter.appendChild(option);
});
scopeFilter.value=selectedScope;

const mistakes=[];
units.forEach(unit=>{
  const awards=new Set(readArray(unit.awards));
  readArray(unit.mistakes).forEach((m,index)=>{
    mistakes.push({
      stage:unit.stage,
      grade:unit.grade,
      semester:unit.semester,
      subject:unit.subject,
      publisher:unit.publisher,
      version:unit.version,
      unit:unit.title,
      url:unit.url,
      id:m.id||('m'+index),
      text:m.text||'這題曾經答錯，請回原單元重新挑戰。',
      level:m.level||'未分類',
      topic:m.topic||'未分類',
      corrected:awards.has(m.id)
    });
  });
});

let statusFilter='pending';
let subjectFilter='全部';
let editionFilter='全部';

const subjectFilters=document.getElementById('subjectFilters');
const editionFilters=document.getElementById('editionFilters');
const correctionRule=document.getElementById('correctionRule');
if(correctionRule){
  correctionRule.textContent='點「回單元重新挑戰」回到原單元，在 '+questionsPerUnit+' 題挑戰中再次作答；答對後，這題會自動轉成「已訂正」，並獲得完整 5 點學習點數。';
}

function renderSubjectFilters(){
  if(!subjectFilters) return;
  const subjects=subjectOrder.filter(subject=>units.some(u=>scopeKey(u)===selectedScope&&u.subject===subject));
  if(subjectFilter!=='全部'&&!subjects.includes(subjectFilter)) subjectFilter='全部';
  subjectFilters.innerHTML='';
  ['全部',...subjects].forEach(subject=>{
    const btn=document.createElement('button');
    btn.className='filter-btn subject-filter';
    btn.type='button';
    btn.dataset.subject=subject;
    btn.setAttribute('aria-pressed',String(subject===subjectFilter));
    btn.textContent=subject==='全部'?'全部科目':subject;
    btn.addEventListener('click',()=>{
      subjectFilter=subject;
      editionFilter='全部';
      renderSubjectFilters();
      renderEditionFilters();
      renderConceptSummary();
      render();
    });
    subjectFilters.appendChild(btn);
  });
}

function scopedMistakes(){
  return mistakes.filter(m=>scopeKey(m)===selectedScope);
}

function editionKey(m){
  return (m.publisher||'')+'|'+(m.version||'');
}
function editionLabel(key){
  if(key==='全部') return '全部版本';
  const [publisher,version]=key.split('|');
  return [publisher,version].filter(Boolean).join(' ');
}
function renderEditionFilters(){
  if(!editionFilters) return;
  let source=scopedMistakes();
  if(subjectFilter!=='全部') source=source.filter(m=>m.subject===subjectFilter);
  const editions=[...new Set(source.map(editionKey))].filter(Boolean);

  if(editionFilter!=='全部'&&!editions.includes(editionFilter)) editionFilter='全部';
  editionFilters.innerHTML='';
  editionFilters.hidden=editions.length<=1;
  if(editions.length<=1) return;

  ['全部',...editions].forEach(key=>{
    const btn=document.createElement('button');
    btn.className='filter-btn edition-filter';
    btn.type='button';
    btn.dataset.edition=key;
    btn.setAttribute('aria-pressed',String(key===editionFilter));
    btn.textContent=editionLabel(key);
    btn.addEventListener('click',()=>{
      editionFilter=key;
      renderEditionFilters();
      renderConceptSummary();
      render();
    });
    editionFilters.appendChild(btn);
  });
}

function renderConceptSummary(){
  const wrap=document.getElementById('conceptSummary');
  if(!wrap) return;

  let source=scopedMistakes().filter(m=>!m.corrected);
  if(subjectFilter!=='全部') source=source.filter(m=>m.subject===subjectFilter);
  if(editionFilter!=='全部') source=source.filter(m=>editionKey(m)===editionFilter);

  const counts=new Map();
  source.forEach(m=>{
    const key=(m.topic||'未分類').trim()||'未分類';
    counts.set(key,(counts.get(key)||0)+1);
  });

  const ranked=[...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'zh-Hant'));
  wrap.innerHTML='';

  if(!ranked.length){
    const empty=document.createElement('div');
    empty.className='concept-card concept-card--empty';
    empty.innerHTML='<strong>目前沒有待訂正概念 🎉</strong><span>完成新的挑戰後，錯題主題會逐步整理在這裡。</span>';
    wrap.appendChild(empty);
    return;
  }

  ranked.slice(0,6).forEach(([topic,count],index)=>{
    const card=document.createElement('div');
    card.className='concept-card';
    card.innerHTML='<strong>'+(index+1)+'. '+topic+'</strong><span>'+count+' 題待訂正</span>';
    wrap.appendChild(card);
  });

  const unclassified=counts.get('未分類')||0;
  if(unclassified){
    const note=document.createElement('div');
    note.className='concept-card concept-card--empty';
    note.innerHTML='<strong>還有 '+unclassified+' 題舊紀錄未分類</strong><span>舊錯題沒有主題 tag 時會保留在錯題中心，但不強行推測概念。</span>';
    wrap.appendChild(note);
  }
}

function renderSummary(){
  const scoped=scopedMistakes();
  const corrected=scoped.filter(m=>m.corrected).length;
  const pending=scoped.length-corrected;
  document.getElementById('allMistakes').textContent=scoped.length;
  document.getElementById('pendingMistakes').textContent=pending;
  document.getElementById('correctedMistakes').textContent=corrected;
  const counts={all:scoped.length,pending,corrected};
  Object.entries(counts).forEach(([key,value])=>{
    const el=document.querySelector('[data-status-count="'+key+'"]');
    if(el) el.textContent=value;
  });
}

function render(){
  let list=scopedMistakes();
  if(statusFilter==='pending') list=list.filter(m=>!m.corrected);
  else if(statusFilter==='corrected') list=list.filter(m=>m.corrected);
  if(subjectFilter!=='全部') list=list.filter(m=>m.subject===subjectFilter);
  if(editionFilter!=='全部') list=list.filter(m=>editionKey(m)===editionFilter);

  const wrap=document.getElementById('mistakeList');
  wrap.innerHTML='';
  if(!list.length){
    const empty=document.createElement('div');
    empty.className='empty-state';
    empty.innerHTML='<strong>目前沒有符合條件的錯題 🎉</strong><p>可以換一個篩選條件，或回 AML Kids 繼續挑戰。</p>';
    wrap.appendChild(empty);
    return;
  }

  list.forEach(m=>{
    const card=document.createElement('article');
    card.className='mistake-card '+(m.corrected?'corrected':'pending');
    const meta=document.createElement('div');
    meta.className='mistake-meta';
    [scopeLabel(m),m.subject,m.publisher+' '+m.version,m.unit,m.level,m.topic].forEach(x=>{
      const chip=document.createElement('span');
      chip.className='mistake-chip';
      chip.textContent=x;
      meta.appendChild(chip);
    });
    const stateChip=document.createElement('span');
    stateChip.className='mistake-chip mistake-state';
    stateChip.textContent=m.corrected?'已訂正':'待訂正';
    meta.appendChild(stateChip);
    const title=document.createElement('h3');
    title.textContent=m.text;
    const note=document.createElement('p');
    note.textContent=m.corrected?'這題已經重新答對，可以保留作為複習紀錄。':'回到原單元重新挑戰，答對後會自動更新為已訂正。';
    const link=document.createElement('a');
    link.className='mistake-link';
    link.href=m.url+'?resume='+encodeURIComponent(m.id)+'#challenge';
    link.textContent=m.corrected?'回到這一題再複習 →':'直接回到這一題訂正 →';
    card.append(meta,title,note,link);
    wrap.appendChild(card);
  });
}

document.querySelectorAll('[data-status]').forEach(btn=>btn.addEventListener('click',()=>{
  statusFilter=btn.dataset.status;
  document.querySelectorAll('[data-status]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  renderSummary();
  renderConceptSummary();
  render();
}));

scopeFilter.addEventListener('change',()=>{
  selectedScope=scopeFilter.value;
  localStorage.setItem(SCOPE_KEY,selectedScope);
  editionFilter='全部';
  renderSubjectFilters();
  renderEditionFilters();
  renderSummary();
  renderConceptSummary();
  render();
});

renderSubjectFilters();
renderEditionFilters();
renderSummary();
renderConceptSummary();
render();
