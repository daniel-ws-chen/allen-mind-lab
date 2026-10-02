(function(){
  const KEY='seraphinaLearningHistoryV1';
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function write(v){localStorage.setItem(KEY,JSON.stringify(v))}
  function now(){return new Date().toISOString()}
  function upsert(meta){if(!meta||!meta.id)return;const h=read();const old=h[meta.id]||{};h[meta.id]={...old,...meta,lastVisited:now()};write(h)}
  function progress(id,pct){const h=read();if(!h[id])return;h[id].progress=Math.max(0,Math.min(100,Math.round(Number(pct)||0)));h[id].lastVisited=now();write(h)}
  function complete(id){const h=read();if(!h[id])return;h[id].completed=true;h[id].progress=100;h[id].completedAt=now();h[id].lastVisited=now();write(h)}
  function currentMeta(){const b=document.body;return {id:b.dataset.labId,title:b.dataset.labTitle,path:b.dataset.labPath||location.pathname};}
  function initLab(){const m=currentMeta();if(!m.id)return;upsert(m);window.SeraLearningTrace={updateProgress:p=>progress(m.id,p),complete:()=>complete(m.id),get:read};
    const final=document.getElementById('finalSelfCheck'); if(final){if(final.checked)complete(m.id);final.addEventListener('change',()=>{if(final.checked)complete(m.id);});}
  }
  function fmt(iso){if(!iso)return'';try{return new Intl.DateTimeFormat('zh-TW',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(iso));}catch(e){return''}}
  function renderDashboard(){const recent=document.getElementById('spRecentLearning');if(!recent)return;const h=read();const items=Object.entries(h).map(([id,v])=>({id,...v})).sort((a,b)=>String(b.lastVisited||'').localeCompare(String(a.lastVisited||'')));
    if(!items.length){recent.classList.add('hidden');return;} recent.classList.remove('hidden');const r=items[0];
    document.getElementById('spRecentTitle').textContent=r.title||'Learning Lab';
    document.getElementById('spRecentDesc').textContent=r.completed?'已完成一次流程，可回來複習或進行下一次練習。':(typeof r.progress==='number'?`目前紀錄約 ${r.progress}% 完成，可繼續上次的學習。`:'已開始使用，可繼續上次的學習。');
    document.getElementById('spRecentMeta').textContent=`最近使用：${fmt(r.lastVisited)}${r.completed?' · 已完成':''}`;
    const a=document.getElementById('spRecentLink');a.href=r.path||'#';a.textContent=r.completed?'再次進入 →':'繼續學習 →';
    const list=document.getElementById('spHistoryList'); if(list){list.innerHTML=items.slice(0,3).map(x=>`<div class="sp-history-item"><strong>${x.title||x.id}</strong><small>${x.completed?'已完成':'進行中'}${typeof x.progress==='number'?' · '+x.progress+'%':''}<br>${fmt(x.lastVisited)}</small></div>`).join('');}
  }
  document.addEventListener('DOMContentLoaded',()=>{initLab();renderDashboard();});
})();