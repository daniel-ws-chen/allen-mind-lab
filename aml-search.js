(function(){
  'use strict';
  const data=Array.isArray(window.AML_SEARCH_INDEX)?window.AML_SEARCH_INDEX:[];
  const form=document.getElementById('search-form'), input=document.getElementById('q'), out=document.getElementById('results'), count=document.getElementById('result-count'), empty=document.getElementById('empty');
  let activeType='全部';
  const norm=s=>(s||'').toString().toLowerCase().normalize('NFKC').replace(/\s+/g,' ').trim();
  const esc=s=>(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tokens=q=>norm(q).split(/[\s、,，\/]+/).filter(Boolean);

  // AML 常用詞彙的輕量同義詞表。只用於搜尋擴充，不改變原始內容。
  const aliases={
    'pbs':['正向行為支持','行為功能','行為支持'],
    '正向行為支持':['pbs','行為功能','行為支持'],
    'adhd':['注意力不足過動症','過動','注意力'],
    '注意力不足過動症':['adhd','過動','注意力'],
    'ot':['職能治療','職能'],
    '職能治療':['ot','職能'],
    'ai':['人工智慧','生成式ai','生成式人工智慧'],
    '人工智慧':['ai','生成式ai'],
    '管理':['領導','主管','方案管理','團隊'],
    '領導':['管理','主管','團隊'],
    '情緒':['壓力','焦慮','情緒行為'],
    '感覺處理':['感覺統合','sensory','感覺'],
    '感覺統合':['感覺處理','sensory','感覺'],
    '自學':['自主學習','完訓','學習路徑'],
    '自主學習':['自學','完訓','學習路徑']
  };
  const variants=t=>[t,...(aliases[t]||[])].map(norm).filter(Boolean);
  const latin=s=>/^[a-z0-9-]+$/i.test(s);
  function editDistance(a,b){
    if(a===b)return 0; if(!a.length)return b.length; if(!b.length)return a.length;
    const prev=Array.from({length:b.length+1},(_,i)=>i), cur=new Array(b.length+1);
    for(let i=1;i<=a.length;i++){
      cur[0]=i;
      let rowMin=cur[0];
      for(let j=1;j<=b.length;j++){
        cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
        rowMin=Math.min(rowMin,cur[j]);
      }
      if(rowMin>1 && Math.abs(a.length-b.length)>1)return rowMin;
      for(let j=0;j<=b.length;j++)prev[j]=cur[j];
    }
    return prev[b.length];
  }
  function fuzzyLatinMatch(hay,t){
    if(!latin(t)||t.length<4)return false;
    const words=hay.match(/[a-z0-9-]{3,}/g)||[];
    return words.some(w=>Math.abs(w.length-t.length)<=1 && editDistance(w,t)<=1);
  }
  function fieldMatch(field,t){ return field.includes(t); }
  function score(item,ts,q){
    const title=norm(item.title), keys=norm(item.keywords), summary=norm(item.summary), cat=norm(item.category), type=norm(item.type);
    const all=[title,keys,summary,cat,type].join(' ');
    let n=0;
    const nq=norm(q);
    if(nq && title===nq)n+=180;
    else if(nq && title.includes(nq))n+=90;
    else if(nq && summary.includes(nq))n+=24;

    for(const original of ts){
      const vs=variants(original);
      let best=-1;
      for(const t of vs){
        let s=0;
        const isOriginal=t===original;
        if(title===t)s+=isOriginal?120:75; else if(fieldMatch(title,t))s+=isOriginal?60:38;
        if(fieldMatch(keys,t))s+=isOriginal?30:20;
        if(fieldMatch(cat,t)||fieldMatch(type,t))s+=isOriginal?18:12;
        if(fieldMatch(summary,t))s+=isOriginal?12:8;
        best=Math.max(best,s);
      }
      if(best<=0 && fuzzyLatinMatch(all,original)) best=8;
      if(best<=0)return -1;
      n+=best;
    }
    if(item.type==='文章')n+=2;
    return n;
  }
  function highlight(text,ts){
    let safe=esc(text||'');
    const hs=[...new Set(ts.flatMap(variants))].sort((a,b)=>b.length-a.length);
    for(const t0 of hs){
      const t=esc(t0).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      if(!t)continue;
      try{safe=safe.replace(new RegExp('('+t+')','ig'),'<mark>$1</mark>')}catch(e){}
    }
    return safe;
  }
  function suggestions(q){
    const nq=norm(q), picks=[];
    const pool=['PBS','ADHD','管理','AI','職能治療','情緒','感覺處理','自學'];
    if(aliases[nq]) picks.push(...aliases[nq].slice(0,3));
    for(const p of pool){ if(norm(p)!==nq && !picks.includes(p)) picks.push(p); }
    return picks.slice(0,5);
  }
  function render(push=true){
    const q=input.value.trim(), ts=tokens(q);
    if(push){const u=new URL(location.href); q?u.searchParams.set('q',q):u.searchParams.delete('q'); history.replaceState(null,'',u)}
    out.innerHTML=''; empty.hidden=true;
    if(!ts.length){count.textContent='輸入關鍵字開始搜尋。'; return;}
    const found=data.map(x=>({x,s:score(x,ts,q)})).filter(r=>r.s>=0 && (activeType==='全部'||r.x.type===activeType)).sort((a,b)=>b.s-a.s || (b.x.date||'').localeCompare(a.x.date||''));
    count.textContent=`找到 ${found.length} 筆相關內容${activeType==='全部'?'':' · '+activeType}`;
    if(!found.length){
      empty.hidden=false;
      const qs=suggestions(q);
      empty.innerHTML=`<strong>目前沒有找到相符內容。</strong><span>可以縮短關鍵字，或試試：</span><div class="empty-suggestions">${qs.map(x=>`<button type="button" data-suggest="${esc(x)}">${esc(x)}</button>`).join('')}</div><a class="empty-path" href="/reading-paths.html">不知道怎麼搜？從閱讀路徑開始 →</a>`;
      empty.querySelectorAll('[data-suggest]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.suggest||'';input.focus();render();}));
      return;
    }
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
  document.addEventListener('keydown',e=>{
    if(e.key==='/' && !/input|textarea|select/i.test(document.activeElement?.tagName||'')){e.preventDefault();input.focus();}
  });
  const q=new URLSearchParams(location.search).get('q')||''; if(q){input.value=q;render(false);}
})();
