(() => {
  'use strict';
  const key='amlMyAmlV1';
  const allowed=new Set(['management','pbs','helper','adhd','ot']);
  const formal={
    management:{key:'amlManagementSelfStudyV1',ids:['detective','direction','strategy','leadership','quality','systems']},
    pbs:{key:'amlPbsSelfStudyV1',ids:['abc','function','strategy','replacement','emotion','family']}
  };
  const read=()=>{try{const raw=localStorage.getItem(key);const s=raw?JSON.parse(raw):{};return {saved:Array.isArray(s.saved)?s.saved.filter(x=>allowed.has(x)):[],recent:Array.isArray(s.recent)?s.recent.filter(x=>allowed.has(x)):[]};}catch(e){return {saved:[],recent:[]};}};
  const write=s=>{try{localStorage.setItem(key,JSON.stringify({saved:s.saved.slice(0,12),recent:s.recent.slice(0,5)}));}catch(e){}};
  const loadFormal=t=>{try{const v=JSON.parse(localStorage.getItem(t.key)||'null');return v&&typeof v==='object'?v:{};}catch(e){return {};}};
  const formalState=id=>{
    const t=formal[id]; if(!t)return null;
    const s=loadFormal(t),a=s.articles||{},g=s.games||{};
    let n=0;t.ids.forEach(k=>{if(a[k])n++;if(g[k])n++;});
    if(s.quiz&&s.quiz.passed)return {label:'已完訓',state:'complete'};
    if(n===12)return {label:'核心完成 · 待總複習',state:'ready'};
    if(n>0)return {label:`已有正式進度 · ${n}/12`,state:'progress'};
    return null;
  };
  const routeState=(id,s)=>formalState(id) || (s.saved.includes(id)?{label:'已加入 My AML',state:'saved'}:s.recent.includes(id)?{label:'最近開啟',state:'recent'}:{label:'尚未開始',state:'new'});
  const sync=()=>{
    const s=read();
    document.querySelectorAll('[data-myaml-save]').forEach(btn=>{const id=btn.dataset.myamlSave;const on=s.saved.includes(id);btn.setAttribute('aria-pressed',String(on));btn.textContent=on?'★ 已加入我的 AML':'☆ 加入我的 AML';});
    allowed.forEach(id=>{const st=routeState(id,s);document.querySelectorAll(`[data-route-status="${id}"]`).forEach(el=>{el.textContent=st.label;el.dataset.state=st.state;});});
  };
  document.addEventListener('click',e=>{
    const save=e.target.closest('[data-myaml-save]');
    if(save){const id=save.dataset.myamlSave;if(!allowed.has(id))return;const s=read();s.saved=s.saved.includes(id)?s.saved.filter(x=>x!==id):[id,...s.saved.filter(x=>x!==id)];write(s);sync();return;}
    const recent=e.target.closest('[data-myaml-recent]');
    if(recent){const id=recent.dataset.myamlRecent;if(!allowed.has(id))return;const s=read();s.recent=[id,...s.recent.filter(x=>x!==id)];write(s);}
  });
  window.addEventListener('pageshow',sync);
  window.addEventListener('storage',e=>{if(e.key===key||Object.values(formal).some(t=>t.key===e.key))sync();});
  sync();
})();
