const stageSelect=document.getElementById('learningStage');
const gradeSelect=document.getElementById('learningGrade');
const statusEl=document.getElementById('selectorStatus');
const titleEl=document.getElementById('selectorTitle');
const noteEl=document.getElementById('selectorNote');
const actionEl=document.getElementById('selectorAction');
const catalog=window.AML_KIDS_CATALOG||{units:[],subjects:[],questionsPerUnit:50};

const stageForGrade=n=>n<=6?'國小':n<=9?'國中':'高中';
const gradeName=n=>['','一年級','二年級','三年級','四年級','五年級','六年級','七年級','八年級','九年級','十年級','十一年級','十二年級'][n];
const semesterOrder=['上學期','下學期'];

function unitsFor(stage,grade){
  return (catalog.units||[]).filter(unit=>unit.stage===stage&&Number(unit.grade)===grade);
}
function scopeSummary(units){
  const semesters=[...new Set(units.map(u=>u.semester))].sort((a,b)=>semesterOrder.indexOf(a)-semesterOrder.indexOf(b));
  const subjects=[...new Set(units.map(u=>u.subject))];
  const semesterText=semesters.length?semesters.join('、'):'目前';
  return {semesters,subjects,text:semesterText+'已有 '+subjects.length+' 科、'+units.length+' 個單元。'};
}
function stageSummary(stage){
  const list=(catalog.units||[]).filter(unit=>unit.stage===stage);
  const grades=[...new Set(list.map(u=>Number(u.grade)))].sort((a,b)=>a-b);
  const subjects=[...new Set(list.map(u=>u.subject))];
  return {list,grades,subjects};
}
function updateStageCards(){
  document.querySelectorAll('[data-stage-card]').forEach(card=>{
    const stage=card.dataset.stageCard;
    const status=card.querySelector('[data-stage-status]');
    const note=card.querySelector('[data-stage-note]');
    const link=card.querySelector('[data-stage-link]');
    const summary=stageSummary(stage);

    if(summary.list.length){
      card.classList.add('stage-live');
      status.textContent='已有內容';
      status.classList.add('live');
      const gradeText=summary.grades.map(gradeName).join('、');
      note.textContent=gradeText+'已有 '+summary.subjects.length+' 科、'+summary.list.length+' 個單元。';

      const current=catalog.currentScope;
      if(current&&current.stage===stage){
        link.href='#quick-title';
        link.textContent='查看'+stage+'內容 →';
      }else{
        link.href=summary.list[0].url;
        link.textContent='從已開放內容開始 →';
      }
    }else{
      card.classList.remove('stage-live');
      status.textContent='陸續建置中';
      status.classList.remove('live');
      note.textContent='目前尚未開放，可依年級、科目與教材版本提出需求。';
      link.href='wish/?stage='+encodeURIComponent(stage);
      link.textContent='前往許願 →';
    }
  });
}
function updateQuickScopeLabel(){
  const el=document.getElementById('quickScopeLabel');
  const current=catalog.currentScope;
  if(!el||!current) return;
  el.textContent='目前已開放｜'+(current.label||current.stage+gradeName(Number(current.grade))+current.semester);
}

function editionHome(list){
  const urls=list.map(u=>u.url);
  const direct=urls.find(url=>!/\/unit\d+\/$/.test(url));
  if(direct) return direct;
  return (urls[0]||'/aml-kids/').replace(/\/unit\d+\/$/,'/');
}
function wishUrl(scope,subject,version){
  const params=new URLSearchParams({
    stage:scope.stage,
    grade:gradeName(Number(scope.grade)),
    semester:scope.semester,
    subject,
    version
  });
  return 'wish/?'+params.toString();
}
function renderSubjectJump(scoped,details,order){
  const nav=document.getElementById('subjectJump');
  if(!nav) return;
  nav.innerHTML='<span class="subject-jump__label">快速選科目</span>';
  order.filter(subject=>scoped.some(u=>u.subject===subject)).forEach((subject,index)=>{
    const detail=details.find(d=>d.subject===subject)||{slug:'subject-'+index,icon:'📘'};
    const link=document.createElement('a');
    link.href='#subject-'+detail.slug;
    link.textContent=detail.icon+' '+subject;
    nav.appendChild(link);
  });
}

const compactSubjectQuery=window.matchMedia('(max-width:800px)');

function readArray(key){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'[]');
    return Array.isArray(value)?value:[];
  }catch{return [];}
}
function unitProgress(unit){
  const total=Number(catalog.questionsPerUnit||50);
  const done=new Set(readArray(unit.awards)).size;
  const safeDone=Math.min(total,done);
  if(safeDone>=total) return {done:safeDone,total,label:'已完成',state:'complete'};
  if(safeDone>0) return {done:safeDone,total,label:'進行中',state:'active'};
  return {done:0,total,label:'未開始',state:'new'};
}

function createUnitLink(unit){
  const link=document.createElement('a');
  link.className='portal-unit-link';
  link.href=unit.url;

  const no=document.createElement('span');
  no.className='portal-unit-number';
  no.textContent=String(Number(unit.unit.replace(/\D/g,''))).padStart(2,'0');

  const copy=document.createElement('span');
  const titleRow=document.createElement('span');
  titleRow.className='portal-unit-title-row';
  const strong=document.createElement('strong');
  strong.textContent=unit.title;
  const progress=unitProgress(unit);
  const progressBadge=document.createElement('span');
  progressBadge.className='portal-unit-progress portal-unit-progress--'+progress.state;
  progressBadge.textContent=progress.label+(progress.state==='new'?'':' '+progress.done+'/'+progress.total);
  titleRow.append(strong,progressBadge);

  const small=document.createElement('small');
  small.textContent=unit.summary||('進入 '+unit.title+' 學習');
  copy.append(titleRow,small);

  const arrow=document.createElement('span');
  arrow.className='portal-arrow';
  arrow.setAttribute('aria-hidden','true');
  arrow.textContent='→';

  link.append(no,copy,arrow);
  return link;
}

function appendEditionUnits(group,edition){
  const sorted=edition.units
    .slice()
    .sort((a,b)=>Number(a.unit.replace(/\D/g,''))-Number(b.unit.replace(/\D/g,'')));

  const visibleCount=compactSubjectQuery.matches?4:sorted.length;
  const visible=sorted.slice(0,visibleCount);
  const hidden=sorted.slice(visibleCount);

  const units=document.createElement('div');
  units.className='portal-units';
  visible.forEach(unit=>units.appendChild(createUnitLink(unit)));
  group.appendChild(units);

  if(hidden.length){
    const details=document.createElement('details');
    details.className='portal-more-units';
    const summary=document.createElement('summary');
    summary.textContent='查看另外 '+hidden.length+' 個單元';
    const more=document.createElement('div');
    more.className='portal-units portal-units--more';
    hidden.forEach(unit=>more.appendChild(createUnitLink(unit)));
    details.append(summary,more);
    group.appendChild(details);
  }
}

function renderSubjectPortal(){
  const wrap=document.getElementById('subjectPortalGrid');
  const scope=catalog.currentScope;
  if(!wrap||!scope) return;

  const scoped=(catalog.units||[]).filter(unit=>
    unit.stage===scope.stage &&
    Number(unit.grade)===Number(scope.grade) &&
    unit.semester===scope.semester
  );
  const details=catalog.subjectDetails||[];
  const order=catalog.subjects||[];
  wrap.innerHTML='';
  renderSubjectJump(scoped,details,order);

  order.filter(subject=>scoped.some(u=>u.subject===subject)).forEach((subject,index)=>{
    const detail=details.find(d=>d.subject===subject)||{subject,slug:'subject-'+index,icon:'📘',intro:'自主學習內容',wishVersions:[]};
    const subjectUnits=scoped.filter(u=>u.subject===subject);
    const editions=[];
    const map=new Map();
    subjectUnits.forEach(unit=>{
      const key=unit.publisher+'|'+unit.version;
      if(!map.has(key)){
        const edition={key,publisher:unit.publisher,version:unit.version,units:[]};
        map.set(key,edition);
        editions.push(edition);
      }
      map.get(key).units.push(unit);
    });

    const section=document.createElement('section');
    section.className='subject-portal '+detail.slug+'-portal';
    section.id='subject-'+detail.slug;
    const titleId='subject-'+detail.slug+'-title';
    section.setAttribute('aria-labelledby',titleId);

    const top=document.createElement('div');
    top.className='portal-top';
    const icon=document.createElement('div');
    icon.className='portal-icon';
    icon.setAttribute('aria-hidden','true');
    icon.textContent=detail.icon;
    const headingWrap=document.createElement('div');
    const label=document.createElement('span');
    label.className='subject-label';
    label.textContent=editions.map(e=>e.publisher).filter((v,i,a)=>a.indexOf(v)===i).join('／')+'｜'+subject;
    const h3=document.createElement('h3');
    h3.id=titleId;
    h3.textContent=gradeName(Number(scope.grade))+scope.semester+subject;
    headingWrap.append(label,h3);
    top.append(icon,headingWrap);

    const intro=document.createElement('p');
    intro.textContent=detail.intro;

    const picker=document.createElement('div');
    picker.className='version-picker';
    picker.setAttribute('aria-label',subject+'教材版本');
    const pickerLabel=document.createElement('span');
    pickerLabel.className='version-label';
    pickerLabel.textContent='教材版本';
    picker.appendChild(pickerLabel);

    editions.forEach(edition=>{
      const chip=document.createElement('a');
      chip.className='version-chip active';
      chip.href=editionHome(edition.units);
      chip.textContent=edition.publisher+' '+edition.version+'｜已開放';
      picker.appendChild(chip);
    });
    (detail.wishVersions||[]).filter(version=>!editions.some(e=>e.publisher===version)).forEach(version=>{
      const chip=document.createElement('a');
      chip.className='version-chip';
      chip.href=wishUrl(scope,subject,version);
      chip.textContent=version+'｜陸續建置中';
      picker.appendChild(chip);
    });

    const editionContainer=document.createElement('div');
    editionContainer.className='portal-editions';
    editions.forEach(edition=>{
      const group=document.createElement('div');
      group.className='portal-edition-group';
      if(editions.length>1){
        const editionTitle=document.createElement('h4');
        editionTitle.className='portal-edition-title';
        editionTitle.textContent=edition.publisher+' '+edition.version;
        group.appendChild(editionTitle);
      }
      appendEditionUnits(group,edition);

      const home=document.createElement('a');
      home.className='subject-home-link';
      home.href=editionHome(edition.units);
      home.textContent='進入'+subject+'｜'+edition.publisher+' '+edition.version+' 學習區';
      group.appendChild(home);
      editionContainer.appendChild(group);
    });

    section.append(top,intro,picker,editionContainer);
    wrap.appendChild(section);
  });

  if(!wrap.children.length){
    const empty=document.createElement('p');
    empty.className='portal-loading';
    empty.textContent='目前這個學習範圍尚未有已開放科目。';
    wrap.appendChild(empty);
  }
}

function readLastActivity(){
  try{return JSON.parse(localStorage.getItem('amlKidsLastActivityV1')||'null');}catch{return null;}
}
function updateHeroLauncher(){
  const title=document.getElementById('heroLaunchTitle');
  const note=document.getElementById('heroLaunchNote');
  const primary=document.getElementById('heroLaunchPrimary');
  if(!title||!note||!primary) return;

  const scope=catalog.currentScope;
  const scoped=(catalog.units||[]).filter(unit=>!scope||(
    unit.stage===scope.stage &&
    Number(unit.grade)===Number(scope.grade) &&
    unit.semester===scope.semester
  ));
  const fallback=scoped[0]||(catalog.units||[])[0];
  const last=readLastActivity();
  const recent=last?.path
    ? (catalog.units||[]).find(unit=>unit.url===last.path||unit.url.replace(/\/$/,'')===String(last.path).replace(/\/$/,''))
    : null;

  if(recent){
    const q=last.questionId||'';
    title.textContent='繼續 '+recent.subject+'｜'+recent.title;
    note.textContent=q?'上次停在 '+q+'，可以直接回到原來的位置。':'可以直接回到上次學習的單元。';
    primary.textContent='繼續上次學習 →';
    primary.href=recent.url+(q?('?resume='+encodeURIComponent(q)):'')+'#challenge';
    return;
  }

  if(scope) title.textContent=scope.label||scope.stage+gradeName(Number(scope.grade))+scope.semester;
  if(fallback){
    note.textContent='第一次來，可以先從「'+fallback.subject+'｜'+fallback.title+'」開始，也可以往下選自己想學的科目。';
    primary.textContent='從第一個單元開始 →';
    primary.href=fallback.url;
  }else{
    note.textContent='目前內容正在建置中，可以先向 AML Kids 許願。';
    primary.textContent='前往許願 →';
    primary.href='wish/';
  }
}

function updatePortalSummary(){
  const units=catalog.units||[];
  const subjects=[...new Set(units.map(u=>u.subject))];
  const qpu=Number(catalog.questionsPerUnit||50);
  const values={
    portalSubjectCount:subjects.length,
    portalUnitCount:units.length,
    portalQuestionCount:units.length*qpu,
    portalQuestionsPerUnit:qpu
  };
  Object.entries(values).forEach(([id,value])=>{
    const el=document.getElementById(id);
    if(el) el.textContent=Number(value).toLocaleString();
  });
}

function updateSelector(source){
  let grade=Number(gradeSelect.value||5);
  if(source==='grade'){
    stageSelect.value=stageForGrade(grade);
  }else if(source==='stage'){
    const ranges={國小:[1,6],國中:[7,9],高中:[10,12]};
    const [min,max]=ranges[stageSelect.value];
    if(grade<min||grade>max){
      const available=(catalog.units||[])
        .filter(u=>u.stage===stageSelect.value)
        .map(u=>Number(u.grade))
        .sort((a,b)=>a-b);
      grade=available[0]||min;
      gradeSelect.value=String(grade);
    }
  }

  const stage=stageSelect.value;
  const label=gradeName(grade);
  const available=unitsFor(stage,grade);
  titleEl.textContent=stage+label;

  if(available.length){
    const summary=scopeSummary(available);
    statusEl.textContent='已有內容';
    statusEl.classList.add('live');
    noteEl.textContent=summary.text;

    const current=catalog.currentScope;
    const matchesCurrent=current&&current.stage===stage&&Number(current.grade)===grade;
    if(matchesCurrent){
      actionEl.textContent='查看已開放內容 →';
      actionEl.href='#quick-title';
    }else{
      actionEl.textContent='從第一個單元開始 →';
      actionEl.href=available[0].url;
    }
  }else{
    statusEl.textContent='陸續建置中';
    statusEl.classList.remove('live');
    noteEl.textContent='這個年級目前尚未開放，可以先向 AML Kids 許願。';
    actionEl.textContent='前往許願 →';
    actionEl.href='wish/?stage='+encodeURIComponent(stage)+'&grade='+encodeURIComponent(label);
  }
}

stageSelect.addEventListener('change',()=>updateSelector('stage'));
gradeSelect.addEventListener('change',()=>updateSelector('grade'));
updatePortalSummary();
updateStageCards();
updateQuickScopeLabel();
renderSubjectPortal();
updateHeroLauncher();
updateSelector('grade');

if(typeof compactSubjectQuery.addEventListener==='function'){
  compactSubjectQuery.addEventListener('change',renderSubjectPortal);
}else if(typeof compactSubjectQuery.addListener==='function'){
  compactSubjectQuery.addListener(renderSubjectPortal);
}
