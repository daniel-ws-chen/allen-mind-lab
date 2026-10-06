(()=>{
const DATA=window.AML_KIDS_VISUAL_DATA||{};
const SUBJECTS={
  chinese:{label:'國文',kicker:'國文視覺挑戰',note:'事件順序、人物動作、段落結構與圖像線索'},
  english:{label:'英文',kicker:'英文視覺挑戰',note:'課表、場所、數量、位置與生活情境'},
  math:{label:'數學',kicker:'數學視覺挑戰',note:'數線、幾何、對稱、面積與立體圖形'},
  science:{label:'自然',kicker:'自然視覺挑戰',note:'實驗裝置、天體位置、生物構造與條件比較'},
  social:{label:'社會',kicker:'社會視覺挑戰',note:'地圖、時間軸、土地利用與史料判讀'}
};
const KEY='amlKidsVisualChallengeV1';
const LAST_KEY='amlKidsVisualLastActivityV1';
const qs=s=>document.querySelector(s);
const params=new URLSearchParams(location.search);
let subject=params.get('subject');
if(!SUBJECTS[subject]||!DATA[subject]) subject='chinese';
const questions=DATA[subject];
let index=0,locked=false;

function load(){
  try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return{};}
}
function save(state){localStorage.setItem(KEY,JSON.stringify(state));}
function subjectState(){
  const all=load();
  const base=all[subject]||{completed:[],mistakes:[],resume:0,lastCompleted:null};
  return {all,base};
}
function persist(patch){
  const {all,base}=subjectState();
  all[subject]={...base,...patch};
  save(all);
}
function completedSet(){
  const {base}=subjectState();
  return new Set(Array.isArray(base.completed)?base.completed:[]);
}
function updateProgressDisplay(count=completedSet().size){
  const safe=Math.max(0,Math.min(questions.length,Number(count)||0));
  qs('#progress-text').textContent=safe+' / '+questions.length;
  qs('#progress-bar').setAttribute('aria-valuenow',String(safe));
  qs('#progress-fill').style.width=(safe/questions.length*100)+'%';
}
function recordActivity(questionId=''){
  localStorage.setItem(LAST_KEY,JSON.stringify({
    subject,
    label:SUBJECTS[subject].label,
    questionId,
    index,
    path:'/aml-kids/visual-challenges/?subject='+subject,
    updatedAt:Date.now()
  }));
}
function renderVisual(q){
  qs('#visual-content').innerHTML=q.svg;
  qs('#visual-caption').textContent=q.caption||'';
  qs('#visual-description').textContent=q.alt;
}
function render(){
  const q=questions[index];
  locked=false;
  qs('#challenge-title').textContent=SUBJECTS[subject].label+'｜10 題視覺挑戰';
  qs('#subject-kicker').textContent=SUBJECTS[subject].kicker;
  qs('#challenge-note').textContent=SUBJECTS[subject].note;
  qs('#question-number').textContent='第 '+(index+1)+' 題';
  qs('#question-tag').textContent=q.tag;
  qs('#question-stem').textContent=q.q;
  renderVisual(q);
  const box=qs('#options');box.innerHTML='';
  q.o.forEach((label,i)=>{
    const wrap=document.createElement('label');wrap.className='answer-option';
    const input=document.createElement('input');input.type='radio';input.name='visual-answer';input.value=String(i);
    const span=document.createElement('span');span.textContent=String.fromCharCode(65+i)+'. '+label;
    wrap.append(input,span);box.appendChild(wrap);
  });
  qs('#feedback').textContent='';qs('#feedback').className='feedback';
  qs('#next-question').hidden=true;
  qs('#check-answer').hidden=false;
  updateProgressDisplay();
  persist({resume:index});
  recordActivity(q.id);
}
function check(){
  if(locked)return;
  const chosen=document.querySelector('input[name="visual-answer"]:checked');
  const fb=qs('#feedback');
  if(!chosen){
    fb.textContent='請先選一個答案。';fb.className='feedback note';return;
  }
  const q=questions[index],choice=Number(chosen.value);
  const {base}=subjectState();
  const completed=new Set(base.completed||[]);
  const mistakes=new Set(base.mistakes||[]);
  if(choice===q.a){
    locked=true;completed.add(q.id);mistakes.delete(q.id);
    persist({completed:[...completed],mistakes:[...mistakes],resume:index,lastCompleted:q.id});
    recordActivity(q.id);
    fb.textContent='答對了 ✓ '+q.e;fb.className='feedback good';
    document.querySelectorAll('input[name="visual-answer"]').forEach(x=>x.disabled=true);
    qs('#check-answer').hidden=true;qs('#next-question').hidden=false;
    updateProgressDisplay(completed.size);
  }else{
    mistakes.add(q.id);persist({mistakes:[...mistakes],resume:index});
    recordActivity(q.id);
    fb.textContent='再看一次圖中的線索。'+(q.hint?' 提示：'+q.hint:'');
    fb.className='feedback note';
  }
}
function next(){
  if(index<questions.length-1){
    index++;render();qs('#question-card').scrollIntoView({block:'start'});
    return;
  }

  const done=completedSet();
  updateProgressDisplay(done.size);

  if(done.size<questions.length){
    const firstIncomplete=questions.findIndex(q=>!done.has(q.id));
    index=firstIncomplete>=0?firstIncomplete:0;
    persist({resume:index});
    render();
    qs('#feedback').textContent='還有 '+(questions.length-done.size)+' 題尚未完成，先回到未完成題目。';
    qs('#feedback').className='feedback note';
    qs('#question-card').scrollIntoView({block:'start'});
    return;
  }

  persist({resume:0});
  qs('#question-card').hidden=true;
  qs('#completion').hidden=false;
  qs('#completion-copy').textContent='已完成 '+done.size+' / '+questions.length+' 題；視覺挑戰進度獨立保存，不影響原本單元與學習點數。';
  qs('#completion').focus();
}
function restart(){
  persist({completed:[],mistakes:[],resume:0,lastCompleted:null});
  index=0;qs('#completion').hidden=true;qs('#question-card').hidden=false;render();qs('#question-card').scrollIntoView({block:'start'});
}
function init(){
  document.querySelectorAll('[data-subject-link]').forEach(a=>{
    if(a.dataset.subjectLink===subject)a.setAttribute('aria-current','page');
  });
  const {base}=subjectState();
  index=Math.min(Number(base.resume)||0,questions.length-1);
  qs('#check-answer').addEventListener('click',check);
  qs('#next-question').addEventListener('click',next);
  qs('#restart').addEventListener('click',restart);
  render();
}
init();
})();