(()=>{
const catalog=window.AML_KIDS_CATALOG;
const subjects=catalog?.subjects||[];
const units=catalog?.units||[];
const STORE='amlKidsDaily5V1';
const LAST='amlKidsDailyLastActivityV1';

function localDateKey(){
  const d=new Date();
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,'0');
  const day=String(d.getDate()).padStart(2,'0');
  return y+'-'+m+'-'+day;
}
const dateKey=localDateKey();

function hash(text){
  let h=2166136261;
  for(let i=0;i<text.length;i++){
    h^=text.charCodeAt(i);
    h=Math.imul(h,16777619);
  }
  return h>>>0;
}
function currentScopeUnit(u){
  const s=catalog?.currentScope||{};
  return u.stage===s.stage&&u.grade===s.grade&&u.semester===s.semester;
}
function readState(){
  try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{};}catch{return{};}
}
function writeState(state){localStorage.setItem(STORE,JSON.stringify(state))}
function todayState(){
  const all=readState();
  if(!all[dateKey]) all[dateKey]={completed:[],attempted:[],startedAt:Date.now()};
  return {all,state:all[dateKey]};
}
function persist(patch){
  const {all,state}=todayState();
  all[dateKey]={...state,...patch,updatedAt:Date.now()};
  const keys=Object.keys(all).sort().slice(-35);
  const trimmed={};
  keys.forEach(k=>trimmed[k]=all[k]);
  writeState(trimmed);
}
function recordLast(subject,id){
  localStorage.setItem(LAST,JSON.stringify({date:dateKey,subject,questionId:id,path:'/aml-kids/daily/',updatedAt:Date.now()}));
}
async function loadQuestion(unit,index){
  const res=await fetch(unit.script,{cache:'no-store'});
  if(!res.ok) throw new Error('無法讀取題庫：'+unit.script);
  const text=await res.text();
  const match=text.match(/const questions=\[(.*?)\];/s);
  if(!match) throw new Error('找不到題庫資料：'+unit.script);
  const questions=JSON.parse('['+match[1]+']');
  if(!questions.length) throw new Error('題庫沒有題目：'+unit.script);
  return questions[index%questions.length];
}
async function buildDailySet(){
  const result=[];
  for(const subject of subjects){
    const list=units.filter(u=>u.subject===subject&&currentScopeUnit(u));
    if(!list.length) continue;
    const unit=list[hash(dateKey+'|'+subject+'|unit')%list.length];
    const qIndex=hash(dateKey+'|'+subject+'|question')%(catalog?.questionsPerUnit||50);
    const q=await loadQuestion(unit,qIndex);
    result.push({subject,unit,q});
  }
  return result;
}
function safeText(value){return String(value??'')}
function renderQuestion(item){
  const {state}=todayState();
  const complete=new Set(state.completed||[]).has(item.subject+'|'+item.q.id);
  const card=document.createElement('article');
  card.className='daily-question'+(complete?' is-complete':'');
  card.dataset.key=item.subject+'|'+item.q.id;

  const meta=document.createElement('div');
  meta.className='daily-meta';
  [item.subject,item.unit.title,item.q.level,item.q.s||item.q.tag||'今日挑戰'].filter(Boolean).forEach(value=>{
    const chip=document.createElement('span');
    chip.className='daily-chip';
    chip.textContent=safeText(value);
    meta.appendChild(chip);
  });

  const title=document.createElement('h3');
  title.textContent=item.q.q;

  const fieldset=document.createElement('fieldset');
  fieldset.className='daily-options';
  const legend=document.createElement('legend');
  legend.className='sr-only';
  legend.textContent=item.subject+'今日挑戰，請選擇一個答案';
  fieldset.appendChild(legend);

  item.q.o.forEach((option,i)=>{
    const label=document.createElement('label');
    label.className='daily-option';
    const input=document.createElement('input');
    input.type='radio';
    input.name='daily-'+item.subject;
    input.value=String(i);
    input.disabled=complete;
    const span=document.createElement('span');
    span.textContent=String.fromCharCode(65+i)+'. '+option;
    label.append(input,span);
    fieldset.appendChild(label);
  });

  const actions=document.createElement('div');
  actions.className='daily-actions';
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='daily-check';
  btn.textContent=complete?'今天已完成':'送出答案';
  btn.disabled=complete;
  const fb=document.createElement('p');
  fb.className='daily-feedback'+(complete?' good':'');
  fb.setAttribute('role','status');
  fb.setAttribute('aria-live','polite');
  if(complete) fb.textContent='已完成。'+item.q.e;
  actions.append(btn);

  btn.addEventListener('click',()=>{
    const chosen=card.querySelector('input[type="radio"]:checked');
    if(!chosen){
      fb.className='daily-feedback note';
      fb.textContent='請先選一個答案。';
      return;
    }
    const key=item.subject+'|'+item.q.id;
    const snapshot=todayState().state;
    const attempted=new Set(snapshot.attempted||[]);
    attempted.add(key);
    if(Number(chosen.value)===item.q.a){
      const completed=new Set(snapshot.completed||[]);
      completed.add(key);
      persist({attempted:[...attempted],completed:[...completed]});
      recordLast(item.subject,item.q.id);
      fb.className='daily-feedback good';
      fb.textContent='答對了 ✓ '+item.q.e;
      card.classList.add('is-complete');
      card.querySelectorAll('input').forEach(x=>x.disabled=true);
      btn.disabled=true;
      btn.textContent='今天已完成';
      updateProgress();
    }else{
      persist({attempted:[...attempted]});
      recordLast(item.subject,item.q.id);
      fb.className='daily-feedback note';
      fb.textContent='再想一下，這題還可以重試。';
    }
  });

  card.append(meta,title,fieldset,actions,fb);
  return card;
}
function updateProgress(){
  const {state}=todayState();
  const done=new Set(state.completed||[]).size;
  document.getElementById('daily-progress-text').textContent=done+' / 5';
  const complete=document.getElementById('daily-complete');
  if(done>=5){
    complete.hidden=false;
    complete.focus();
  }
}
function formatDate(){
  const [y,m,d]=dateKey.split('-');
  return y+' 年 '+Number(m)+' 月 '+Number(d)+' 日';
}
async function init(){
  document.getElementById('daily-date').textContent=formatDate()+'｜今日挑戰';
  const wrap=document.getElementById('daily-questions');
  const note=document.getElementById('load-note');
  try{
    const set=await buildDailySet();
    if(set.length!==5) throw new Error('目前可用科目不是 5 科。');
    wrap.innerHTML='';
    set.forEach(item=>wrap.appendChild(renderQuestion(item)));
    note.textContent='今天的五科題目已準備好；同一天重新開啟仍會是這一組。';
    updateProgress();
  }catch(err){
    wrap.innerHTML='';
    const box=document.createElement('div');
    box.className='daily-question';
    box.innerHTML='<strong>今天的題目暫時無法載入</strong><p>請回 AML Kids 原單元繼續學習，稍後再試一次。</p>';
    wrap.appendChild(box);
    note.textContent='載入題庫時發生問題。';
    console.error(err);
  }
}
init();
})();