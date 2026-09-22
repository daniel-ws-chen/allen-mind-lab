
(() => {
  const KEY = 'amlPbsSelfStudyV1';
  const IDS = ['abc','function','strategy','replacement','emotion','family'];
  const empty = () => ({articles:{},games:{},quiz:{passed:false,score:0,date:null,certificateId:null,name:null}});
  function load(){
    try{
      const v=JSON.parse(localStorage.getItem(KEY)||'null');
      return v && typeof v==='object' ? {...empty(), ...v, articles:{...v.articles}, games:{...v.games}, quiz:{...empty().quiz,...v.quiz}} : empty();
    }catch(e){ return empty(); }
  }
  function save(state){ localStorage.setItem(KEY, JSON.stringify(state)); }
  function count(state){
    let n=0;
    IDS.forEach(id=>{ if(state.articles[id]) n++; if(state.games[id]) n++; });
    return n;
  }
  function render(){
    const state=load();
    IDS.forEach(id=>{
      const card=document.querySelector(`[data-lesson="${id}"]`);
      if(!card) return;
      const a=!!state.articles[id], g=!!state.games[id];
      card.classList.toggle('is-done', a&&g);
      const as=card.querySelector('[data-article-status]');
      const gs=card.querySelector('[data-game-status]');
      if(as){ as.textContent=a?'✓ 文章已讀':'○ 文章未標記'; as.classList.toggle('ok',a); }
      if(gs){ gs.textContent=g?'✓ 遊戲已完成':'○ 遊戲未完成'; gs.classList.toggle('ok',g); }
      const btn=card.querySelector('[data-mark-read]');
      if(btn){ btn.textContent=a?'取消文章已讀':'標記文章已讀'; }
    });
    const n=count(state), pct=Math.round(n/12*100);
    const countEl=document.querySelector('[data-progress-count]');
    const bar=document.querySelector('[data-progress-bar]');
    if(countEl) countEl.textContent=`${n} / 12`;
    if(bar) bar.style.width=`${pct}%`;
    const quiz=document.querySelector('[data-quiz-link]');
    if(quiz){
      const unlocked=n===12;
      quiz.setAttribute('aria-disabled', unlocked?'false':'true');
      quiz.textContent=unlocked?'開始總複習 →':'尚未解鎖';
    }
  }
  const PENDING_KEY = 'amlPbsSelfStudyPendingArticle';
  document.querySelectorAll('[data-article-link]').forEach(link=>{
    link.addEventListener('click',()=>{
      const id=link.dataset.articleLink;
      if(id) sessionStorage.setItem(PENDING_KEY,id);
    });
  });
  function completePendingArticle(){
    const id=sessionStorage.getItem(PENDING_KEY);
    if(!id || !IDS.includes(id)) return;
    sessionStorage.removeItem(PENDING_KEY);
    const state=load();
    state.articles[id]=true;
    save(state);
    render();
    const card=document.getElementById(`lesson-${id}`) || document.querySelector(`[data-lesson="${id}"]`);
    if(card){ setTimeout(()=>card.scrollIntoView({behavior:'smooth',block:'center'}),80); }
  }
  const resetBtn=document.querySelector('[data-reset-progress]');
  if(resetBtn){
    resetBtn.addEventListener('click',()=>{
      const ok=window.confirm('確定要清除這台裝置上的 PBS 自學紀錄嗎？\n\n文章閱讀、互動遊戲、總測驗與完訓證明紀錄都會歸零，且無法復原。');
      if(!ok) return;
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(PENDING_KEY);
      render();
      window.scrollTo({top:0,behavior:'smooth'});
      setTimeout(()=>window.alert('學習紀錄已清除，現在可以讓下一位使用者重新開始。'),120);
    });
  }
  document.querySelectorAll('[data-mark-read]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id=btn.dataset.markRead;
      const state=load();
      state.articles[id]=!state.articles[id];
      save(state); render();
    });
  });
  window.addEventListener('storage', e=>{ if(e.key===KEY) render(); });
  window.addEventListener('pageshow', ()=>{ render(); completePendingArticle(); });
  render();
})();
