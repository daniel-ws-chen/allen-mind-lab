const catalog=window.AML_KIDS_CATALOG;
const units=(catalog?.units||[]).map(unit=>({...unit}));
const questionsPerUnit=catalog?.questionsPerUnit||50;
const subjectOrder=catalog?.subjects||[];

function readArray(key){
  try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[];}catch{return [];}
}

const mistakes=[];
units.forEach(unit=>{
  const awards=new Set(readArray(unit.awards));
  readArray(unit.mistakes).forEach((m,index)=>{
    mistakes.push({
      subject:unit.subject,
      unit:unit.title,
      url:unit.url,
      id:m.id||('m'+index),
      text:m.text||'這題曾經答錯，請回原單元重新挑戰。',
      level:m.level||'未分類',
      corrected:awards.has(m.id)
    });
  });
});

const all=mistakes.length;
const corrected=mistakes.filter(m=>m.corrected).length;
const pending=all-corrected;
document.getElementById('allMistakes').textContent=all;
document.getElementById('pendingMistakes').textContent=pending;
document.getElementById('correctedMistakes').textContent=corrected;

let statusFilter='pending';
let subjectFilter='全部';

const subjectFilters=document.getElementById('subjectFilters');
if(subjectFilters){
  ['全部',...subjectOrder].forEach(subject=>{
    const btn=document.createElement('button');
    btn.className='filter-btn subject-filter';
    btn.type='button';
    btn.dataset.subject=subject;
    btn.setAttribute('aria-pressed',String(subject==='全部'));
    btn.textContent=subject==='全部'?'全部科目':subject;
    subjectFilters.appendChild(btn);
  });
}
const correctionRule=document.getElementById('correctionRule');
if(correctionRule){
  correctionRule.textContent='點「回單元重新挑戰」回到原單元，在 '+questionsPerUnit+' 題挑戰中再次作答；答對後，這題會自動轉成「已訂正」，並獲得完整 5 點學習點數。';
}

function render(){
  let list=mistakes;
  if(statusFilter==='pending') list=list.filter(m=>!m.corrected);
  else if(statusFilter==='corrected') list=list.filter(m=>m.corrected);
  if(subjectFilter!=='全部') list=list.filter(m=>m.subject===subjectFilter);

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
    card.className='mistake-card'+(m.corrected?' corrected':'');
    const meta=document.createElement('div');
    meta.className='mistake-meta';
    [m.subject,m.unit,m.level,m.corrected?'已訂正':'待訂正'].forEach(x=>{
      const chip=document.createElement('span');
      chip.className='mistake-chip';
      chip.textContent=x;
      meta.appendChild(chip);
    });
    const title=document.createElement('h3');
    title.textContent=m.text;
    const note=document.createElement('p');
    note.textContent=m.corrected?'這題已經重新答對，可以保留作為複習紀錄。':'回到原單元重新挑戰，答對後會自動更新為已訂正。';
    const link=document.createElement('a');
    link.className='mistake-link';
    link.href=m.url+'#challenge';
    link.textContent=m.corrected?'回單元再複習 →':'回單元重新挑戰 →';
    card.append(meta,title,note,link);
    wrap.appendChild(card);
  });
}

document.querySelectorAll('[data-status]').forEach(btn=>btn.addEventListener('click',()=>{
  statusFilter=btn.dataset.status;
  document.querySelectorAll('[data-status]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  render();
}));

document.querySelectorAll('[data-subject]').forEach(btn=>btn.addEventListener('click',()=>{
  subjectFilter=btn.dataset.subject;
  document.querySelectorAll('[data-subject]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  render();
}));

render();
