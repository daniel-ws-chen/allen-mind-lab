(function(){
  'use strict';
  const data=Array.isArray(window.AML_SEARCH_INDEX)?window.AML_SEARCH_INDEX:[];
  const form=document.getElementById('search-form'), input=document.getElementById('q'), out=document.getElementById('results'), count=document.getElementById('result-count'), empty=document.getElementById('empty');
  let activeType='全部';
  const norm=s=>(s||'').toString().toLowerCase().normalize('NFKC').replace(/\s+/g,' ').trim();
  const esc=s=>(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tokens=q=>norm(q).split(/[\s、,，\/]+/).filter(Boolean);
  function score(item,ts){
    const title=norm(item.title), keys=norm(item.keywords), summary=norm(item.summary), cat=norm(item.category), type=norm(item.type);
    let n=0;
    for(const t of ts){
      if(title===t)n+=120; else if(title.includes(t))n+=60;
      if(keys.includes(t))n+=30;
      if(cat.includes(t)||type.includes(t))n+=18;
      if(summary.includes(t))n+=12;
      if(!(title.includes(t)||keys.includes(t)||summary.includes(t)||cat.includes(t)||type.includes(t))) return -1;
    }
    if(item.type==='文章')n+=2;
    return n;
  }
  function highlight(text,ts){
    let safe=esc(text||'');
    for(const t0 of ts){
      const t=esc(t0).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      if(!t)continue;
      try{safe=safe.replace(new RegExp('('+t+')','ig'),'<mark>$1</mark>')}catch(e){}
    }
    return safe;
  }
  function render(push=true){
    const q=input.value.trim(), ts=tokens(q);
    if(push){const u=new URL(location.href); q?u.searchParams.set('q',q):u.searchParams.delete('q'); history.replaceState(null,'',u)}
    out.innerHTML=''; empty.hidden=true;
    if(!ts.length){count.textContent='輸入關鍵字開始搜尋。'; return;}
    const found=data.map(x=>({x,s:score(x,ts)})).filter(r=>r.s>=0 && (activeType==='全部'||r.x.type===activeType)).sort((a,b)=>b.s-a.s || (b.x.date||'').localeCompare(a.x.date||''));
    count.textContent=`找到 ${found.length} 筆相關內容${activeType==='全部'?'':' · '+activeType}`;
    if(!found.length){empty.hidden=false;return;}
    const frag=document.createDocumentFragment();
    found.slice(0,60).forEach(({x})=>{
      const a=document.createElement('a'); a.className='result'; a.href=x.url;
      a.innerHTML=`<div class="result-top"><span class="badge">${esc(x.category||x.type)}</span>${x.date?`<span class="result-date">${esc(x.date.replaceAll('-','.'))}</span>`:''}</div><h2>${highlight(x.title,ts)}</h2><p>${highlight(x.summary||'前往查看內容。',ts)}</p><span class="go">前往內容 →</span>`;
      frag.appendChild(a);
    }); out.appendChild(frag);
  }
  form.addEventListener('submit',e=>{e.preventDefault();render();});
  let timer; input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>render(),140)});
  document.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.q||'';input.focus();render()}));
  document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');activeType=b.dataset.type||'全部';render(false)}));
  const q=new URLSearchParams(location.search).get('q')||''; if(q){input.value=q;render(false);} else input.focus();
})();
