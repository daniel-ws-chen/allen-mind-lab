(() => {
  'use strict';
  const key='amlMyAmlV1';
  const allowed=new Set(['management','pbs','helper','adhd','ot']);
  const read=()=>{try{const raw=localStorage.getItem(key);const s=raw?JSON.parse(raw):{};return {saved:Array.isArray(s.saved)?s.saved.filter(x=>allowed.has(x)):[],recent:Array.isArray(s.recent)?s.recent.filter(x=>allowed.has(x)):[]};}catch(e){return {saved:[],recent:[]};}};
  const write=s=>{try{localStorage.setItem(key,JSON.stringify({saved:s.saved.slice(0,12),recent:s.recent.slice(0,5)}));}catch(e){}};
  const sync=()=>{const s=read();document.querySelectorAll('[data-myaml-save]').forEach(btn=>{const id=btn.dataset.myamlSave;const on=s.saved.includes(id);btn.setAttribute('aria-pressed',String(on));btn.textContent=on?'★ 已加入我的 AML':'☆ 加入我的 AML';});};
  document.addEventListener('click',e=>{
    const save=e.target.closest('[data-myaml-save]');
    if(save){const id=save.dataset.myamlSave;if(!allowed.has(id))return;const s=read();s.saved=s.saved.includes(id)?s.saved.filter(x=>x!==id):[id,...s.saved.filter(x=>x!==id)];write(s);sync();return;}
    const recent=e.target.closest('[data-myaml-recent]');
    if(recent){const id=recent.dataset.myamlRecent;if(!allowed.has(id))return;const s=read();s.recent=[id,...s.recent.filter(x=>x!==id)];write(s);}
  });
  sync();
})();
