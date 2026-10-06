(()=>{
const DATA=window.AML_KIDS_VISUAL_DATA||{};
const CATALOG=window.AML_KIDS_CATALOG||{};
const KEY='amlKidsVisualChallengeV2';
const LEGACY_KEY='amlKidsVisualChallengeV1';
const WALLET_KEY='amlKidsRewardWalletV1';
const POINTS_PER_QUESTION=5;
const LAST_KEY='amlKidsVisualLastActivityV1';
const qs=s=>document.querySelector(s);
const params=new URLSearchParams(location.search);

const scope={
  stage:params.get('stage')||'國小',
  grade:Number(params.get('grade')||5),
  semester:params.get('semester')||'上學期',
  subject:params.get('subject')||'',
  publisher:params.get('publisher')||'',
  version:params.get('version')||''
};
const scopeKey=[scope.stage,scope.grade,scope.semester,scope.subject,scope.publisher,scope.version].join('|');
const questions=DATA.scopes?.[scopeKey]||[];
const scopeUnits=(CATALOG.units||[]).filter(u=>
  u.stage===scope.stage&&u.grade===scope.grade&&u.semester===scope.semester&&
  u.subject===scope.subject&&u.publisher===scope.publisher&&u.version===scope.version
);
const scopeLabel=[scope.subject,scope.publisher,scope.version].filter(Boolean).join('｜');
let index=0,locked=false;

function load(){
  try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return{};}
}
function save(state){localStorage.setItem(KEY,JSON.stringify(state));}
function migrateLegacy(all){
  if(all[scopeKey]) return all;
  try{
    const legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'{}')||{};
    const slugMap={國文:'chinese',英文:'english',數學:'math',自然:'science',社會:'social'};
    const legacyState=legacy[slugMap[scope.subject]];
    if(legacyState){
      all[scopeKey]=legacyState;
      save(all);
    }
  }catch{}
  return all;
}
function subjectState(){
  const all=migrateLegacy(load());
  const base=all[scopeKey]||{completed:[],mistakes:[],wrongEver:[],firstAttempt:{},awarded:[],rewardMigrationV1:false,resume:0,lastCompleted:null};
  if(!Array.isArray(base.awarded)) base.awarded=[];
  if(base.rewardMigrationV1!==true){
    const completed=new Set(Array.isArray(base.completed)?base.completed:[]);
    const awarded=new Set(base.awarded);
    let added=0;
    completed.forEach(id=>{
      if(!awarded.has(id)){
        awarded.add(id);
        added+=POINTS_PER_QUESTION;
      }
    });
    if(added>0){
      const wallet=Number(localStorage.getItem(WALLET_KEY)||0);
      localStorage.setItem(WALLET_KEY,String(wallet+added));
    }
    base.awarded=[...awarded];
    base.rewardMigrationV1=true;
    all[scopeKey]=base;
    save(all);
  }
  return {all,base};
}
function persist(patch){
  const {all,base}=subjectState();
  all[scopeKey]={...base,...patch};
  save(all);
}
function awardedSet(){
  const {base}=subjectState();
  return new Set(Array.isArray(base.awarded)?base.awarded:[]);
}
function visualRewardPoints(){
  return awardedSet().size*POINTS_PER_QUESTION;
}
function grantReward(questionId){
  const {all,base}=subjectState();
  const awarded=new Set(Array.isArray(base.awarded)?base.awarded:[]);
  if(awarded.has(questionId)) return false;
  awarded.add(questionId);
  const wallet=Number(localStorage.getItem(WALLET_KEY)||0);
  localStorage.setItem(WALLET_KEY,String(wallet+POINTS_PER_QUESTION));
  all[scopeKey]={...base,awarded:[...awarded],rewardMigrationV1:true};
  save(all);
  return true;
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
    scopeKey,
    subject:scope.subject,
    publisher:scope.publisher,
    version:scope.version,
    label:scopeLabel,
    questionId,
    index,
    path:'/aml-kids/visual-challenges/?stage='+encodeURIComponent(scope.stage)+'&grade='+scope.grade+'&semester='+encodeURIComponent(scope.semester)+'&subject='+encodeURIComponent(scope.subject)+'&publisher='+encodeURIComponent(scope.publisher)+'&version='+encodeURIComponent(scope.version),
    updatedAt:Date.now()
  }));
}
function versionHomeUrl(){
  const first=scopeUnits[0]?.url||'/aml-kids/';
  const clean=String(first).replace(/\/$/,'');
  return clean.replace(/\/unit\d+$/,'')+'/';
}
function updateVersionBackLinks(){
  const href=versionHomeUrl();
  const top=qs('#version-back');
  const bottom=qs('#completion-version-back');
  if(top) top.href=href;
  if(bottom) bottom.href=href;
}
function renderVisual(q){
  qs('#visual-content').innerHTML=q.svg;
  qs('#visual-caption').textContent=q.caption||'';
  qs('#visual-description').textContent=q.alt;
}
function renderQuestionNav(){
  const wrap=qs('#question-nav-list');
  if(!wrap) return;
  const done=completedSet();
  wrap.innerHTML='';
  questions.forEach((q,i)=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='question-nav-btn'+(done.has(q.id)?' is-complete':'');
    btn.textContent=String(i+1);
    btn.setAttribute('aria-label','第 '+(i+1)+' 題'+(done.has(q.id)?'，已完成':'，未完成'));
    if(i===index) btn.setAttribute('aria-current','step');
    btn.addEventListener('click',()=>{
      index=i;
      render();
      qs('#question-card').scrollIntoView({block:'start'});
    });
    wrap.appendChild(btn);
  });
}
function render(){
  const q=questions[index];
  const done=completedSet();
  locked=done.has(q.id);
  qs('#challenge-title').textContent=scopeLabel+'｜10 題視覺挑戰';
  qs('#subject-kicker').textContent='版本內視覺題型';
  qs('#challenge-note').textContent='此視覺題屬於 '+scopeLabel+'，與同版本的基礎、進階、素養題並列。';
  qs('#question-number').textContent='第 '+(index+1)+' 題';
  qs('#question-tag').textContent=q.tag;
  qs('#question-stem').textContent=q.q;
  renderVisual(q);
  const box=qs('#options');box.innerHTML='';
  q.o.forEach((label,i)=>{
    const wrap=document.createElement('label');wrap.className='answer-option';
    const input=document.createElement('input');input.type='radio';input.name='visual-answer';input.value=String(i);
    input.disabled=locked;
    if(locked&&i===q.a) input.checked=true;
    const span=document.createElement('span');span.textContent=String.fromCharCode(65+i)+'. '+label;
    wrap.append(input,span);box.appendChild(wrap);
  });
  const feedback=qs('#feedback');
  if(locked){
    const rewarded=awardedSet().has(q.id);
    feedback.textContent=(rewarded?'已完成並取得 5 點。':'已完成。')+q.e;
    feedback.className='feedback good';
  }else{
    feedback.textContent='';
    feedback.className='feedback';
  }
  qs('#check-answer').hidden=locked;
  qs('#prev-question').disabled=index===0;
  qs('#next-question').disabled=false;
  qs('#next-question').textContent=index===questions.length-1?'檢查漏答題 →':'下一題 →';
  updateProgressDisplay();
  renderQuestionNav();
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
  const wrongEver=new Set(base.wrongEver||[]);
  const firstAttempt={...(base.firstAttempt||{})};
  const isCorrect=choice===q.a;
  if(!(q.id in firstAttempt)) firstAttempt[q.id]=isCorrect;
  if(!isCorrect) wrongEver.add(q.id);
  if(isCorrect){
    locked=true;completed.add(q.id);mistakes.delete(q.id);
    persist({
      completed:[...completed],
      mistakes:[...mistakes],
      wrongEver:[...wrongEver],
      firstAttempt,
      resume:index,
      lastCompleted:q.id
    });
    const gained=grantReward(q.id);
    recordActivity(q.id);
    fb.textContent=(gained?'答對了！＋5 點。':'答對了！這題 5 點之前已經取得。')+q.e;
    fb.className='feedback good';
    document.querySelectorAll('input[name="visual-answer"]').forEach(x=>x.disabled=true);
    qs('#check-answer').hidden=true;
    updateProgressDisplay(completed.size);
    renderQuestionNav();
  }else{
    mistakes.add(q.id);
    persist({
      mistakes:[...mistakes],
      wrongEver:[...wrongEver],
      firstAttempt,
      resume:index
    });
    recordActivity(q.id);
    fb.textContent='答錯了，這題暫時不加點。再看一次圖中的線索；訂正成功仍可取得 5 點。'+(q.hint?' 提示：'+q.hint:'');
    fb.className='feedback note';
  }
}
function renderCompletionSummary(){
  const {base}=subjectState();
  const firstAttempt=base.firstAttempt||{};
  const answeredIds=questions.map(q=>q.id).filter(id=>id in firstAttempt);
  const firstCorrect=answeredIds.filter(id=>firstAttempt[id]===true).length;
  const total=questions.length;
  const accuracy=answeredIds.length?Math.round(firstCorrect/answeredIds.length*100):0;
  const wrongEver=new Set(base.wrongEver||[]);

  qs('#completion-accuracy').textContent=accuracy+'%';
  qs('#completion-first-correct').textContent=firstCorrect+' / '+answeredIds.length;
  qs('#completion-wrong-count').textContent=wrongEver.size+' 題';
  qs('#completion-reward-points').textContent=visualRewardPoints()+' / '+(questions.length*POINTS_PER_QUESTION)+' 點';

  const list=qs('#completion-wrong-list');
  list.innerHTML='';

  if(!wrongEver.size){
    qs('#completion-review-note').textContent='這次沒有首次答錯題目，表現很好。';
    return;
  }

  qs('#completion-review-note').textContent='點題號可以回到原題，查看正確答案與解析。';
  questions.forEach((q,i)=>{
    if(!wrongEver.has(q.id)) return;
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='review-wrong-btn';
    btn.textContent='第 '+(i+1)+' 題';
    btn.addEventListener('click',()=>{
      index=i;
      qs('#completion').hidden=true;
      qs('#question-card').hidden=false;
      render();
      qs('#question-card').scrollIntoView({block:'start'});
    });
    list.appendChild(btn);
  });
}

function next(){
  if(index<questions.length-1){
    index++;
    render();
    qs('#question-card').scrollIntoView({block:'start'});
    return;
  }

  const done=completedSet();
  updateProgressDisplay(done.size);

  if(done.size<questions.length){
    const firstIncomplete=questions.findIndex(q=>!done.has(q.id));
    index=firstIncomplete>=0?firstIncomplete:0;
    persist({resume:index});
    render();
    qs('#feedback').textContent='還有 '+(questions.length-done.size)+' 題尚未完成，已帶你回到第一個未完成題目。';
    qs('#feedback').className='feedback note';
    qs('#question-card').scrollIntoView({block:'start'});
    return;
  }

  persist({resume:0});
  qs('#question-card').hidden=true;
  qs('#completion').hidden=false;
  qs('#completion-copy').textContent='已完成 '+done.size+' / '+questions.length+' 題；視覺挑戰進度獨立保存，不影響原本單元與學習點數。';
  renderCompletionSummary();
  qs('#completion').focus();
}
function restart(){
  const {base}=subjectState();
  persist({
    completed:[],
    mistakes:[],
    wrongEver:[],
    firstAttempt:{},
    awarded:[...(base.awarded||[])],
    rewardMigrationV1:true,
    resume:0,
    lastCompleted:null
  });
  index=0;qs('#completion').hidden=true;qs('#question-card').hidden=false;render();qs('#question-card').scrollIntoView({block:'start'});
}
function init(){
  updateVersionBackLinks();
  if(!questions.length||!scopeUnits.length){
    qs('#question-card').innerHTML='<div class="feedback note">目前這個教材版本尚未建立視覺題，請回到版本頁選擇其他題型。</div>';
    qs('#challenge-title').textContent='此版本尚無視覺題';
    return;
  }
  const {base}=subjectState();
  index=Math.min(Number(base.resume)||0,questions.length-1);
  qs('#check-answer').addEventListener('click',check);
  qs('#prev-question').addEventListener('click',()=>{
    if(index>0){
      index--;
      render();
      qs('#question-card').scrollIntoView({block:'start'});
    }
  });
  qs('#next-question').addEventListener('click',next);
  qs('#restart').addEventListener('click',restart);
  render();
}
init();
})();