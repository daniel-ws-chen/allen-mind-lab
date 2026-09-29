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
    return {name,n,passed,home:t.home,quiz:t.quiz};
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
    return total;
  }
  function renderContinue(mgmt,pbs,lab){
    const title=document.querySelector('[data-continue-title]'), text=document.querySelector('[data-continue-text]'), link=document.querySelector('[data-continue-link]');
    if(!title||!text||!link) return;
    let target={title:'從 AML 自主學習入口開始',text:'目前尚未偵測到管理學或 PBS 的既有進度，可先從進階自學室選一條路徑開始。',href:'/self-study.html',label:'前往自主學習 →'};
    const candidates=[mgmt,pbs].filter(x=>x && !x.passed && x.n>0).sort((a,b)=>b.n-a.n);
    if(candidates.length){
      const x=candidates[0], isMgmt=x.name==='management', label=isMgmt?'管理學':'PBS';
      if(x.n===12){target={title:`${label}核心任務已完成`,text:'下一步可依原本自學流程進入總測驗；完訓條件與證明機制完全不變。',href:x.quiz,label:'前往總測驗 →'};}
      else{target={title:`繼續${label}自學`,text:`目前已完成 ${x.n} / 12 個核心節點，可從原自學頁接著進行。`,href:x.home,label:`繼續${label} →`};}
    } else if(mgmt&&pbs&&mgmt.passed&&pbs.passed&&lab<8){
      target={title:'兩條自學路徑都已完成',text:`互動實驗室目前完成 ${lab} / 8 個探索節點，可以繼續自由探索。`,href:'/tools.html#lab-halls',label:'繼續互動探索 →'};
    } else if((mgmt&&mgmt.passed)||(pbs&&pbs.passed)){
      const other=(mgmt&&mgmt.passed)?pbs:mgmt, label=other&&other.name==='management'?'管理學':'PBS';
      if(other && !other.passed){target={title:`下一條可以試試 ${label}`,text:'已完成一條正式自學路徑；另一條路徑仍可依自己的節奏開始。',href:other.home,label:`前往${label}自學 →`};}
    }
    title.textContent=target.title; text.textContent=target.text; link.href=target.href; link.textContent=target.label;
  }
  function render(){const mgmt=renderTrack('management');const pbs=renderTrack('pbs');const lab=renderLab();renderContinue(mgmt,pbs,lab);}
  window.addEventListener('pageshow',render);
  window.addEventListener('storage',render);
  render();
})();
