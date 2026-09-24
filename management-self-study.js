(() => {
  const KEY='amlManagementSelfStudyV1';
  const IDS=['detective','direction','strategy','leadership','quality','systems'];
  const empty=()=>({articles:{},games:{},reflections:{},quiz:{passed:false,score:0,date:null,certificateId:null,name:null}});
  function load(){
    try{
      const v=JSON.parse(localStorage.getItem(KEY)||'null');
      return v&&typeof v==='object'
        ? {...empty(),...v,articles:{...v.articles},games:{...v.games},reflections:{...v.reflections},quiz:{...empty().quiz,...v.quiz}}
        : empty();
    }catch(e){return empty();}
  }
  function save(s){localStorage.setItem(KEY,JSON.stringify(s));}
  function count(s){let n=0;IDS.forEach(id=>{if(s.articles[id])n++;if(s.games[id])n++;});return n;}
  function bonusCount(s){return IDS.filter(id=>((s.reflections[id]||'').trim().length>=30)).length;}
  function updateReflectionUI(id,value){
    const n=(value||'').trim().length;
    const c=document.querySelector(`[data-reflection-count="${id}"]`);
    const st=document.querySelector(`[data-reflection-status="${id}"]`);
    if(c)c.textContent=`${n} / 100`;
    if(st){
      st.textContent=n>=30?'✓ Bonus 已完成':(n>0?'至少 30 字才計入 Bonus':'');
      st.className=n>=30?'bonus-ok':'';
    }
  }
  function render(){
    const s=load();
    IDS.forEach(id=>{
      const card=document.querySelector(`[data-lesson="${id}"]`);
      if(!card)return;
      const a=!!s.articles[id],g=!!s.games[id];
      card.classList.toggle('is-done',a&&g);
      const as=card.querySelector('[data-article-status]');
      const gs=card.querySelector('[data-game-status]');
      if(as){as.textContent=a?'✓ 核心閱讀已完成':'○ 尚未完成閱讀';as.classList.toggle('ok',a);}
      if(gs){gs.textContent=g?'✓ 課後小測已完成':'○ 課後小測未完成';gs.classList.toggle('ok',g);}
      const ta=card.querySelector(`[data-reflection="${id}"]`);
      if(ta&&document.activeElement!==ta)ta.value=s.reflections[id]||'';
      updateReflectionUI(id,ta?ta.value:(s.reflections[id]||''));
    });
    const n=count(s),pct=Math.round(n/12*100);
    document.querySelector('[data-progress-count]').textContent=`${n} / 12`;
    document.querySelector('[data-progress-bar]').style.width=`${pct}%`;
    document.querySelector('[data-bonus-count]').textContent=`Reflection Bonus ${bonusCount(s)} / 6`;
    const quiz=document.querySelector('[data-quiz-link]');
    const unlocked=n===12;
    quiz.setAttribute('aria-disabled',unlocked?'false':'true');
    quiz.textContent=unlocked?'開始 Management Challenge →':'尚未解鎖';
  }
  document.querySelectorAll('[data-reflection]').forEach(ta=>ta.addEventListener('input',()=>updateReflectionUI(ta.dataset.reflection,ta.value)));
  document.querySelectorAll('[data-save-reflection]').forEach(btn=>btn.addEventListener('click',()=>{
    const id=btn.dataset.saveReflection;
    const ta=document.querySelector(`[data-reflection="${id}"]`);
    const text=(ta.value||'').trim();
    if(text.length<30){alert('加分反思至少需要 30 字。');ta.focus();return;}
    const s=load();
    s.reflections[id]=text;
    save(s);
    render();
  }));
  const reset=document.querySelector('[data-reset-progress]');
  if(reset)reset.addEventListener('click',()=>{
    if(!confirm('確定要清除這台裝置上的管理學自學紀錄嗎？\n\n文章閱讀、課後小測、Reflection Bonus、主測驗與完訓證明都會歸零，且無法復原。'))return;
    localStorage.removeItem(KEY);
    render();
    window.scrollTo({top:0,behavior:'smooth'});
    setTimeout(()=>window.alert('學習紀錄已清除，現在可以讓下一位使用者重新開始。'),120);
  });
  window.addEventListener('storage',e=>{if(e.key===KEY)render();});
  window.addEventListener('pageshow',render);
  render();
})();
