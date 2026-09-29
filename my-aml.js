(() => {
  'use strict';
  const tracks = {
    management:{key:'amlManagementSelfStudyV1',ids:['detective','direction','strategy','leadership','quality','systems'],home:'/management-self-study.html',quiz:'/management-self-study-quiz.html'},
    pbs:{key:'amlPbsSelfStudyV1',ids:['abc','function','strategy','replacement','emotion','family'],home:'/pbs-self-study.html',quiz:'/pbs-self-study-quiz.html'}
  };
  const readJSON = key => { try { const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch(e){ return null; } };
  const has = key => { try { return localStorage.getItem(key) !== null; } catch(e){ return false; } };
  function coreCount(t,s){ let n=0; const a=(s&&s.articles)||{},g=(s&&s.games)||{}; t.ids.forEach(id=>{if(a[id])n++;if(g[id])n++;}); return n; }
  function renderTrack(name){
    const t=tracks[name], s=readJSON(t.key)||{}, n=coreCount(t,s), passed=!!(s.quiz&&s.quiz.passed), pct=Math.round(n/12*100);
    const count=document.querySelector(`[data-track-count="${name}"]`), bar=document.querySelector(`[data-track-bar="${name}"]`), chip=document.querySelector(`[data-track-chip="${name}"]`), main=document.querySelector(`[data-track-main="${name}"]`), text=document.querySelector(`[data-track-text="${name}"]`);
    if(count) count.textContent=`${n} / 12`; if(bar) bar.style.width=`${pct}%`;
    if(!chip||!main||!text) return;
    chip.classList.toggle('done',passed);
    if(passed){ chip.textContent='已完訓'; main.href=t.quiz; main.textContent='查看總測驗／完訓證明 →'; text.textContent=`核心進度 ${n} / 12；總測驗已通過。完訓資格由原自學系統判定，本頁只顯示結果。`; }
    else if(n===12){ chip.textContent='核心完成'; main.href=t.quiz; main.textContent='前往總測驗 →'; text.textContent='核心任務已完成，可依原自學流程進入總測驗。'; }
    else if(n>0){ chip.textContent='進行中'; main.href=t.home; main.textContent='繼續自學 →'; text.textContent=`目前完成 ${n} / 12 個核心節點；既有解鎖與完訓規則維持不變。`; }
    else { chip.textContent='尚未開始'; main.href=t.home; main.textContent=name==='management'?'開始管理學自學 →':'開始 PBS 自學 →'; }
  }
  function renderLab(){
    const flags={
      mgmt1:has('aml.progress.management.decision'), mgmt2:has('aml.progress.management.fairness'),
      pbs1:has('aml.progress.pbs.intro'), pbs2:has('aml.progress.pbs.advanced')||has('aml.pbs.advanced.v1'),
      self1:has('aml.self.sensory.v1'), self2:has('aml.self.energy.v1'),
      ai1:has('aml.ai.cocreate.v1'), ai2:has('aml.ai.judgment.v1')
    };
    const total=Object.values(flags).filter(Boolean).length, mgmt=[flags.mgmt1,flags.mgmt2].filter(Boolean).length, pbs=[flags.pbs1,flags.pbs2].filter(Boolean).length, other=total-mgmt-pbs;
    const c=document.querySelector('[data-lab-count]'),b=document.querySelector('[data-lab-bar]'),m=document.querySelector('[data-lab-mgmt]'),p=document.querySelector('[data-lab-pbs]'),o=document.querySelector('[data-lab-other]');
    if(c)c.textContent=`${total} / 8`; if(b)b.style.width=`${Math.round(total/8*100)}%`; if(m)m.textContent=`${mgmt} / 2`; if(p)p.textContent=`${pbs} / 2`; if(o)o.textContent=`${other} / 4`;
  }
  function render(){renderTrack('management');renderTrack('pbs');renderLab();}
  window.addEventListener('pageshow',render);
  window.addEventListener('storage',render);
  render();
})();
