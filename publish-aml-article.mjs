#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const DOMAIN_PAGES = { ot:'ot.html', mind:'mind.html', pbs:'pbs.html', education:'education.html', management:'management.html', ai:'ai.html' };
const DOMAIN_LABELS = { ot:'OT & Human Occupation', mind:'Mind & Well-being', pbs:'PBS', education:'Education', management:'Management & Leadership', ai:'AI × Practice' };
const DOMAIN_HUB_LABELS = { ot:'OT 特色館', mind:'Mind 特色館', pbs:'PBS 特色館', education:'Education 特色館', management:'Management 特色館', ai:'AI 特色館' };
const READING_PATHS = {
  management:{page:'management-learning.html',label:'管理實務學習'},
  pbs:{page:'pbs-learning.html',label:'PBS 實務學習'},
  helper:{page:'helper-learning.html',label:'助人者永續實踐'}
};

function die(msg, code=1){ console.error(`\n✗ ${msg}`); process.exit(code); }
function ok(msg){ console.log(`✓ ${msg}`); }
function warn(msg){ console.log(`! ${msg}`); }
function ensureDir(p){ mkdirSync(p,{recursive:true}); }
function read(p){ return readFileSync(p,'utf8'); }
function write(p,s){ ensureDir(dirname(p)); writeFileSync(p,s,'utf8'); }
function esc(s=''){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }
function escAttr(s=''){ return esc(s).replaceAll("'",'&#39;'); }
function slugOk(s){ return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s); }
function relFrom(base, p){ return resolve(base,p); }
function nowIso(){ return new Date().toISOString(); }
function fmtDateDot(s){ return s.replaceAll('-','.'); }
function jsonPretty(x){ return JSON.stringify(x,null,2)+'\n'; }
function safeRm(p){ if (existsSync(p)) rmSync(p,{recursive:true,force:true}); }

function loadConfig(configPath){
  const abs=resolve(configPath);
  if(!existsSync(abs)) die(`Config not found: ${abs}`);
  let cfg; try{ cfg=JSON.parse(read(abs)); } catch(e){ die(`Config JSON parse failed: ${e.message}`); }
  cfg.__path=abs; cfg.__dir=dirname(abs);
  return cfg;
}

function validateConfig(c){
  const req=['slug','title','subtitle','seoDescription','summary','date','primaryDomain','bodyFile','heroWebp','ogImage'];
  const miss=req.filter(k=>!c[k]); if(miss.length) die(`Missing config field(s): ${miss.join(', ')}`);
  if(!slugOk(c.slug)) die(`Invalid slug '${c.slug}'. Use lowercase kebab-case.`);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(c.date)) die(`date must be YYYY-MM-DD.`);
  if(!DOMAIN_PAGES[c.primaryDomain]) die(`primaryDomain must be one of: ${Object.keys(DOMAIN_PAGES).join(', ')}`);
  c.crossDomains ??=[]; c.domains=[c.primaryDomain,...c.crossDomains.filter(x=>x!==c.primaryDomain)];
  for(const d of c.domains) if(!DOMAIN_PAGES[d]) die(`Unknown domain '${d}'.`);
  c.keywords ??=[]; c.relatedReading ??=[]; c.series ??=[]; c.navigation ??={};
  c.tag ??= c.domains.map(d=>DOMAIN_LABELS[d]).join(' × ');
  // Topic-hall cards use one stable public convention: date + domain taxonomy only.
  // Do not place series/teaching labels such as 延伸閱讀、課後學習、Research Update in cardMeta.
  c.cardMeta = `${fmtDateDot(c.date)} · ${c.domains.map(d=>DOMAIN_LABELS[d]).join(' × ')}`;
  c.eyebrow ??= c.tag.toUpperCase();
  c.heroAlt ??= `${c.title} AML 主視覺`;
  c.articleRole ??='Article'; c.collectionRole ??='';
  c.featured ??=false; c.featuredRank ??=null;
  c.isNote ??=false; c.readingPaths ??=[]; c.homepageFeatured ??=false;
  if(!Array.isArray(c.readingPaths)) die('readingPaths must be an array, e.g. [{"id":"helper","stage":5}].');
  c.readingPaths=c.readingPaths.map(x=>typeof x==='string'?{id:x,stage:null}:x);
  for(const rp of c.readingPaths){ if(!rp?.id || !READING_PATHS[rp.id]) die(`Unknown reading path '${rp?.id||''}'. Use: ${Object.keys(READING_PATHS).join(', ')}`); if(!Number.isInteger(rp.stage)||rp.stage<1||rp.stage>5) die(`readingPaths '${rp.id}' requires integer stage 1-5.`); }
  c.rss ??=true; c.sitemap ??=true;
  c.reciprocalPrevious ??=false;
  return c;
}

function resolveInput(c, field){
  const p=relFrom(c.__dir,c[field]);
  if(!existsSync(p)) die(`${field} not found: ${p}`);
  return p;
}

function manifest(){
  const p=join(root,'data','articles-manifest.json');
  if(!existsSync(p)) die('Missing data/articles-manifest.json');
  return JSON.parse(read(p));
}

function latestArticle(m){
  return [...m.articles].sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0];
}

function replaceOrInsertMeta(head, attr, key, content){
  const re=new RegExp(`<meta([^>]*?)${attr}=["']${key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["']([^>]*?)>`,`i`);
  const tag=`<meta ${attr}="${escAttr(key)}" content="${escAttr(content)}">`;
  return re.test(head) ? head.replace(re,tag) : head.replace('</head>',`  ${tag}\n</head>`);
}
function replaceCanonical(head,url){
  const re=/<link[^>]+rel=["']canonical["'][^>]*>/i;
  const tag=`<link rel="canonical" href="${escAttr(url)}">`;
  return re.test(head)?head.replace(re,tag):head.replace('</head>',`  ${tag}\n</head>`);
}
function buildHead(refHead,c){
  let h=refHead;
  h=h.replace(/<title>[\s\S]*?<\/title>/i,`<title>${esc(c.title)}｜Allen Mind Lab</title>`);
  h=replaceOrInsertMeta(h,'name','description',c.seoDescription);
  h=replaceCanonical(h,`https://allenmindlab.com/articles/${c.slug}`);
  for(const [k,v] of Object.entries({
    'og:type':'article','og:site_name':'Allen Mind Lab','og:title':c.title,'og:description':c.subtitle,
    'og:url':`https://allenmindlab.com/articles/${c.slug}`,
    'og:image':`https://allenmindlab.com/images/articles/${c.slug}-hero.png`,
    'og:image:alt':c.heroAlt
  })) h=replaceOrInsertMeta(h,'property',k,v);
  for(const [k,v] of Object.entries({
    'twitter:card':'summary_large_image','twitter:title':c.title,'twitter:description':c.subtitle,
    'twitter:image':`https://allenmindlab.com/images/articles/${c.slug}-hero.png`
  })) h=replaceOrInsertMeta(h,'name',k,v);
  const ld={
    '@context':'https://schema.org','@type':'Article',headline:c.title,alternativeHeadline:c.subtitle,
    datePublished:c.date,dateModified:c.date,author:{'@type':'Person',name:'陳威勝'},
    publisher:{'@type':'Organization',name:'Allen Mind Lab'},
    mainEntityOfPage:`https://allenmindlab.com/articles/${c.slug}`,
    image:`https://allenmindlab.com/images/articles/${c.slug}-hero.png`,description:c.seoDescription,isAccessibleForFree:true
  };
  const ldTag=`<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
  const re=/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i;
  h=re.test(h)?h.replace(re,ldTag):h.replace('</head>',`  ${ldTag}\n</head>`);
  h=h.replace(/<meta[^>]+name=["']robots["'][^>]*>/gi,'');
  return h;
}

function addIdsAndToc(body){
  let n=0; const items=[];
  body=body.replace(/<h2(?:\s+id=["'][^"']+["'])?>([\s\S]*?)<\/h2>/gi,(m,inner)=>{
    if(/延伸閱讀|參考資料/.test(inner)) return m;
    n++; const plain=inner.replace(/<[^>]+>/g,'').trim(); const id=`section-${n}`; items.push([id,plain]);
    return `<h2 id="${id}">${inner}</h2>`;
  });
  if(!items.length) return body;
  const toc=`<nav aria-label="本文目錄" class="aml-article-toc"><strong>本文目錄</strong><div>${items.map(([id,t])=>`<a href="#${id}">${esc(t)}</a>`).join('')}</div></nav>`;
  if(body.includes('<!-- AML_TOC -->')) return body.replace('<!-- AML_TOC -->',toc);
  const idx=body.search(/<h2\b/i); return idx>=0 ? body.slice(0,idx)+toc+body.slice(idx) : toc+body;
}

function relatedHtml(c,m){
  if(!c.relatedReading.length) return '';
  const bySlug=new Map(m.articles.map(a=>[a.slug,a]));
  const lis=c.relatedReading.map(x=>{
    const o=typeof x==='string'?{slug:x}:x; const a=bySlug.get(o.slug); if(!a) die(`relatedReading references unknown slug: ${o.slug}`);
    return `<li><a href="/articles/${a.slug}.html">${esc(o.label||a.title)}</a></li>`;
  }).join('');
  return `<h2 id="section-related">延伸閱讀</h2><ul>${lis}</ul>`;
}
function shareHtml(){ return `<section aria-label="分享文章" class="aml-share"><div class="aml-share-copy"><strong>分享這篇文章</strong><p>把這篇 AML 文章分享給可能也會需要的人。</p></div><div class="aml-share-actions"><button class="aml-share-btn" data-aml-share type="button">分享文章 ↗</button><button class="aml-share-btn secondary" data-aml-copy-link type="button">複製連結</button></div><div aria-live="polite" class="aml-share-status" data-aml-share-status></div></section>`; }
function navTarget(o,m){
  if(!o) return null; const a=m.articles.find(x=>x.slug===o.slug); if(!a) die(`navigation references unknown slug: ${o.slug}`);
  return {slug:a.slug,title:a.title,kind:o.kind||'',label:o.label||a.title};
}
function footerNav(c,m){
  const prev=navTarget(c.navigation.previous,m), next=navTarget(c.navigation.next,m);
  const route=c.navigation.routeLabel||`${DOMAIN_LABELS[c.primaryDomain]} 館藏閱讀路徑`;
  const hub=c.navigation.hub||{label:DOMAIN_HUB_LABELS[c.primaryDomain],href:`/${DOMAIN_PAGES[c.primaryDomain]}`};
  const prevHtml=prev?`<a class="aml-article-footer-nav__card aml-article-footer-nav__card--prev" href="/articles/${prev.slug}.html"><small>${esc(prev.kind||'上一篇')}</small><strong>← ${esc(prev.label)}</strong></a>`:`<div class="aml-article-footer-nav__card aml-article-footer-nav__card--prev"><small>起點</small><strong>本篇為此航線起點</strong></div>`;
  const nextHtml=next?`<a class="aml-article-footer-nav__card aml-article-footer-nav__card--next" href="/articles/${next.slug}.html"><small>${esc(next.kind||'下一篇')}</small><strong>${esc(next.label)} →</strong></a>`:`<div class="aml-article-footer-nav__card aml-article-footer-nav__card--next"><small>下一站</small><strong>待後續文章延伸</strong></div>`;
  return `<section aria-label="文章閱讀導覽" class="aml-article-footer-nav"><div class="aml-article-footer-nav__head"><div class="aml-article-footer-nav__eyebrow">Continue Reading · AML</div><div class="aml-article-footer-nav__route">${esc(route)}</div></div><div class="aml-article-footer-nav__grid">${prevHtml}<div class="aml-article-footer-nav__hub"><small>回到館藏</small><strong>${esc(hub.label)}</strong><div class="aml-article-footer-nav__hub-links"><a href="${escAttr(hub.href)}">進入主館</a></div></div>${nextHtml}</div><div class="aml-article-footer-nav__utility"><a href="/articles.html">Articles 總館</a><a href="#top" onclick="window.scrollTo({top:0,behavior:'smooth'});return false;">↑ Back to top</a></div></section>`;
}

function generateArticle(c,m){
  const ref=latestArticle(m); const refPath=join(root,ref.articlePath.replace(/^\//,'')); const html=read(refPath);
  const headMatch=html.match(/<head>[\s\S]*?<\/head>/i); if(!headMatch) die('Reference article head not found.');
  const navMatch=html.match(/<body>([\s\S]*?<\/nav>)/i); if(!navMatch) die('Reference article global nav not found.');
  const footerIdx=html.indexOf('<footer class="aml-global-footer">'); if(footerIdx<0) die('Reference article global footer not found.');
  const tail=html.slice(footerIdx).replace(/<section aria-label="文章閱讀導覽"[\s\S]*?(?=<footer class="aml-global-footer">)/i,'');
  let body=read(resolveInput(c,'bodyFile')).trim(); body=addIdsAndToc(body);
  const main=`<main>${body}${relatedHtml(c,m)}${shareHtml()}</main>`;
  const hero=`<section class="hero"><div class="hero-inner"><div class="eyebrow">${esc(c.eyebrow)}</div><h1>${esc(c.title)}</h1><p class="subtitle">${esc(c.subtitle)}</p><div class="meta">陳威勝 · Allen Mind Lab · ${fmtDateDot(c.date)}</div><a class="series-link" href="/${DOMAIN_PAGES[c.primaryDomain]}">${esc(c.navigation.seriesLinkLabel||`進入 ${DOMAIN_HUB_LABELS[c.primaryDomain]}`)}</a></div></section>`;
  const img=`<div class="hero-image"><picture><source srcset="/images/articles/${c.slug}-hero.webp" type="image/webp"/><img alt="${escAttr(c.heroAlt)}" src="/images/articles/${c.slug}-hero.webp"/></picture></div>`;
  return `<!doctype html>\n<html lang="zh-Hant">\n${buildHead(headMatch[0],c)}\n<body>${navMatch[1]}\n${hero}\n${img}\n${main}\n${footerNav(c,m)}\n${tail}`;
}

function articleCard(c){
  return `<a class="article-card${c.featured?' latest-feature':''}" data-category="${escAttr(c.domains.join(' '))}" data-date="${c.date}" data-keywords="${escAttr(c.keywords.join(' '))}" data-order="${c.order ?? -4}" href="articles/${c.slug}.html"><div class="meta">${fmtDateDot(c.date)}</div><span class="tag">${esc(c.tag)}</span><h2>${esc(c.title)}</h2><p>${esc(c.summary)}</p><div class="read">Read Article →</div></a>`;
}
function domainCard(c){ return `<a class="aml-domain-catalog__card" href="articles/${c.slug}.html"><div class="aml-domain-catalog__meta">${esc(c.cardMeta)}</div><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p><span class="aml-domain-catalog__read">閱讀文章 →</span></a>`; }

function updateLibraryPage(html,c,total){
  const marker='<div class="article-grid" id="aml-article-grid">'; if(!html.includes(marker)) die('library.html grid marker not found.');
  html=html.replace(marker,marker+articleCard(c));
  html=html.replace(/目前共有 \d+ 篇文章/g,`目前共有 ${total} 篇文章`);
  return html;
}
function noteCard(c){ return `<a class="article-card" href="/articles/${c.slug}.html"><div class="meta">${fmtDateDot(c.date)} · AML Notes</div><span class="tag">${esc(c.tag)}</span><h2>${esc(c.title)}</h2><p>${esc(c.summary)}</p><div class="read">Read Note →</div></a>`; }
function updateNotesPage(html,c){
  const marker='<section id="notes"><div class="article-grid"'; const pos=html.indexOf(marker); if(pos<0) die('notes.html notes grid marker not found.');
  const open=html.indexOf('>',pos+marker.length); if(open<0) die('notes.html notes grid opening tag not found.');
  return html.slice(0,open+1)+noteCard(c)+html.slice(open+1);
}
function readingPathLink(c){ return `<a href="/articles/${c.slug}.html">${esc(c.title)} →</a>`; }
function updateReadingPathPage(html,c,rp){
  const marker=`<!-- AML_READING_PATH:${rp.id}:stage-${rp.stage} -->`;
  if(!html.includes(marker)) die(`${READING_PATHS[rp.id].page} marker not found: ${marker}`);
  return html.replace(marker,marker+readingPathLink(c));
}
function homepageCard(c){ return `<article class="home-reading__card"><a aria-label="閱讀：${escAttr(c.title)}" class="home-reading__image" href="/articles/${c.slug}.html"><img alt="${escAttr(c.title)}" loading="lazy" src="/images/articles/${c.slug}-hero.webp"/></a><div class="home-reading__body"><div class="home-reading__meta">${esc(DOMAIN_LABELS[c.primaryDomain])}</div><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p><a class="home-reading__link" href="/articles/${c.slug}.html">閱讀文章 →</a></div></article>`; }
function updateHomepageFeatured(html,c){
  const track='<div aria-label="AML 精選文章" class="home-reading__track" data-carousel-track="" tabindex="0">';
  if(!html.includes(track)) die('index.html featured-reading track marker not found.');
  return html.replace(track,track+homepageCard(c));
}
function updateDomainPage(html,c,count){
  const marker='<div class="aml-domain-catalog__grid">'; if(!html.includes(marker)) die(`${c.primaryDomain} domain grid marker not found.`);
  html=html.replace(marker,marker+domainCard(c));
  html=html.replace(/aria-label="本領域收錄 \d+ 篇文章"/g,`aria-label="本領域收錄 ${count} 篇文章"`);
  html=html.replace(/(<div[^>]+class="aml-domain-catalog__count"[^>]*><strong>)\d+(<\/strong>篇文章<\/div>)/,`$1${String(count).padStart(2,'0')}$2`);
  return html;
}
function updateSitemap(xml,c){
  const url=`https://allenmindlab.com/articles/${c.slug}`; if(xml.includes(url)) return xml;
  const block=`  <url>\n    <loc>${url}</loc>\n    <lastmod>${c.date}</lastmod>\n  </url>\n`;
  return xml.replace('</urlset>',block+'</urlset>');
}
function updateRss(xml,c){
  const url=`https://allenmindlab.com/articles/${c.slug}`; if(xml.includes(url)) return xml;
  const pub=new Date(`${c.date}T08:00:00+08:00`).toUTCString();
  const item=`\n    <item>\n      <title>${esc(c.title)}</title>\n      <link>${url}</link>\n      <guid isPermaLink="true">${url}</guid>\n      <pubDate>${pub}</pubDate>\n      <description>${esc(c.summary)}</description>\n    </item>`;
  const pos=xml.indexOf('<item>'); if(pos>=0) return xml.slice(0,pos)+item+'\n    '+xml.slice(pos);
  return xml.replace('</channel>',item+'\n  </channel>');
}

function newManifest(c,m){
  if(m.articles.some(a=>a.slug===c.slug)) die(`Slug already exists in manifest: ${c.slug}`);
  const nav=[];
  if(c.navigation.previous) nav.push({kind:'previous',label:`${c.navigation.previous.kind||'上一篇'} ← ${c.navigation.previous.label||m.articles.find(a=>a.slug===c.navigation.previous.slug)?.title||''}`,href:`/articles/${c.navigation.previous.slug}.html`});
  if(c.navigation.next) nav.push({kind:'next',label:`${c.navigation.next.kind||'下一篇'} ${c.navigation.next.label||m.articles.find(a=>a.slug===c.navigation.next.slug)?.title||''} →`,href:`/articles/${c.navigation.next.slug}.html`});
  const a={slug:c.slug,title:c.title,summary:c.summary,date:c.date,domains:c.domains,primaryDomain:c.primaryDomain,crossDomains:c.crossDomains,tag:c.tag,cardMeta:c.cardMeta,keywords:c.keywords,articlePath:`/articles/${c.slug}.html`,order:c.order ?? -4,canonical:`https://allenmindlab.com/articles/${c.slug}`,hero:`/images/articles/${c.slug}-hero.webp`,ogImage:`/images/articles/${c.slug}-hero.png`,series:c.series,featured:c.featured,featuredRank:c.featuredRank,featuredMeta:c.featuredMeta||undefined,navigation:nav,readingPaths:c.readingPaths,isNote:c.isNote};
  Object.keys(a).forEach(k=>a[k]===undefined&&delete a[k]);
  m.articles.unshift(a); m.generatedAt=nowIso(); m.counts.total=m.articles.length;
  for(const d of Object.keys(DOMAIN_PAGES)) m.counts[d]=m.articles.filter(x=>x.domains?.includes(d)).length;
  if(c.featured && !m.featuredReading.includes(c.slug)) m.featuredReading.unshift(c.slug);
  for(const s of c.series){ const id=typeof s==='string'?s:s.id; if(!m.series[id]) die(`Unknown series '${id}'. Add series definition manually first.`); if(!m.series[id].items.includes(c.slug)){
      const order=typeof s==='object'?s.order:null; if(order && order>0 && order<=m.series[id].items.length+1) m.series[id].items.splice(order-1,0,c.slug); else m.series[id].items.push(c.slug);
    }}
  return m;
}

function patchReciprocalPrevious(html,c){
  if(!c.reciprocalPrevious || !c.navigation.previous) return html;
  const label=esc(c.title); const href=`/articles/${c.slug}.html`;
  const re=/<(?:a|div) class="aml-article-footer-nav__card aml-article-footer-nav__card--next"(?: href="[^"]*")?>[\s\S]*?<\/(?:a|div)>/i;
  const repl=`<a class="aml-article-footer-nav__card aml-article-footer-nav__card--next" href="${href}"><small>下一篇</small><strong>${label} →</strong></a>`;
  if(!re.test(html)) { warn('Could not patch reciprocal previous article footer; leaving unchanged.'); return html; }
  return html.replace(re,repl);
}

function stagePath(c){ return join(root,'.aml-publish',c.slug); }
function prepare(c){
  c=validateConfig(c); const m=manifest(); const stage=stagePath(c), changes=join(stage,'changes'); safeRm(changes); ensureDir(changes);
  // Inputs
  const hero=resolveInput(c,'heroWebp'), og=resolveInput(c,'ogImage');
  cpSync(hero,join(changes,'images','articles',`${c.slug}-hero.webp`),{recursive:false});
  cpSync(og,join(changes,'images','articles',`${c.slug}-hero.png`),{recursive:false});
  // Article
  write(join(changes,'articles',`${c.slug}.html`),generateArticle(c,m));
  // Manifest
  const m2=newManifest(c,structuredClone(m)); write(join(changes,'data','articles-manifest.json'),jsonPretty(m2));
  // Library + domain pages
  write(join(changes,'library.html'),updateLibraryPage(read(join(root,'library.html')),c,m2.counts.total));
  for(const d of c.domains){ const f=DOMAIN_PAGES[d]; const cc={...c,primaryDomain:d}; write(join(changes,f),updateDomainPage(read(join(root,f)),cc,m2.counts[d])); }
  // Optional collection / curation surfaces
  if(c.isNote) write(join(changes,'notes.html'),updateNotesPage(read(join(root,'notes.html')),c));
  for(const rp of c.readingPaths){ const info=READING_PATHS[rp.id]; const f=info.page; const source=existsSync(join(changes,f))?read(join(changes,f)):read(join(root,f)); write(join(changes,f),updateReadingPathPage(source,c,rp)); }
  if(c.homepageFeatured) write(join(changes,'index.html'),updateHomepageFeatured(read(join(root,'index.html')),c));
  // sitemap/rss
  if(c.sitemap) write(join(changes,'sitemap.xml'),updateSitemap(read(join(root,'sitemap.xml')),c));
  if(c.rss) write(join(changes,'rss.xml'),updateRss(read(join(root,'rss.xml')),c));
  // Reciprocal previous
  if(c.reciprocalPrevious && c.navigation.previous){
    const prev=m.articles.find(a=>a.slug===c.navigation.previous.slug); if(!prev) die(`Previous slug not found: ${c.navigation.previous.slug}`);
    const prevFile=join(root,prev.articlePath.replace(/^\//,'')); write(join(changes,prev.articlePath.replace(/^\//,'')),patchReciprocalPrevious(read(prevFile),c));
    const mm=JSON.parse(read(join(changes,'data','articles-manifest.json'))); const pa=mm.articles.find(a=>a.slug===prev.slug); if(pa){
      pa.navigation=(pa.navigation||[]).filter(x=>x.kind!=='next'); pa.navigation.push({kind:'next',label:`下一篇 ${c.title} →`,href:`/articles/${c.slug}.html`});
      write(join(changes,'data','articles-manifest.json'),jsonPretty(mm));
    }
  }
  const plan=[
    `Library: library.html`,
    `Domains: ${c.domains.map(d=>DOMAIN_PAGES[d]).join(', ')}`,
    `AML Notes: ${c.isNote?'YES':'no'}`,
    `Reading paths: ${c.readingPaths.length?c.readingPaths.map(r=>`${READING_PATHS[r.id].label} / Stage ${r.stage}`).join(', '):'none'}`,
    `Homepage featured: ${c.homepageFeatured?'YES':'no'}`,
    `RSS: ${c.rss?'YES':'no'}`,
    `Sitemap: ${c.sitemap?'YES':'no'}`
  ];
  write(join(stage,'PUBLISH_PLAN.txt'),`AML 2.0 publish plan\nslug: ${c.slug}\nprepared: ${nowIso()}\n\n${plan.join('\n')}\n`);
  write(join(stage,'CHANGELOG.txt'),`AML 2.0 semi-auto publish\nslug: ${c.slug}\nprepared: ${nowIso()}\n\nFiles:\n${listFiles(changes).join('\n')}\n`);
  console.log('\nPublish plan'); for(const line of plan) console.log(`  - ${line}`);
  ok(`Prepared ${listFiles(changes).length} staged file(s) under ${relative(root,changes)}.`);
  console.log('No live site files were modified.');
}

function listFiles(dir,prefix=''){
  if(!existsSync(dir)) return []; const out=[];
  for(const ent of readdirSync(dir,{withFileTypes:true})){ const name=ent.name, p=join(dir,name), r=join(prefix,name); if(name==='.DS_Store') continue; if(ent.isDirectory()) out.push(...listFiles(p,r)); else out.push(r.replaceAll('\\','/')); }
  return out.sort();
}
function overlay(src,dst){ for(const rel of listFiles(src)){ const s=join(src,rel), d=join(dst,rel); ensureDir(dirname(d)); cpSync(s,d); } }
function copyRepoForPreview(dst){
  safeRm(dst); ensureDir(dst);
  const skip=new Set(['.git','dist','node_modules','.aml-publish']);
  for(const name of readdirSync(root)){ if(skip.has(name)) continue; cpSync(join(root,name),join(dst,name),{recursive:true}); }
}
function validateStage(c){
  const stage=stagePath(c),changes=join(stage,'changes'); if(!existsSync(changes)) die('No staged changes. Run prepare first.');
  const preview=join(stage,'preview-site'); copyRepoForPreview(preview); overlay(changes,preview);
  const r=spawnSync(process.execPath,['validate-aml.mjs'],{cwd:preview,encoding:'utf8'}); process.stdout.write(r.stdout||''); process.stderr.write(r.stderr||'');
  if(r.status!==0) die('Validation failed. Live site remains unchanged.',r.status||1);
  ok('Preview validation passed. Live site remains unchanged.');
}
function apply(c,yes){ if(!yes) die('Apply requires explicit --yes. Nothing was changed.'); const changes=join(stagePath(c),'changes'); if(!existsSync(changes)) die('No staged changes. Run prepare first.'); overlay(changes,root); ok(`Applied ${listFiles(changes).length} staged file(s) to repository.`); }
function packageStage(c){
  const stage=stagePath(c),changes=join(stage,'changes'); if(!existsSync(changes)) die('No staged changes. Run prepare first.');
  const pkg=join(stage,'github-upload'); safeRm(pkg); cpSync(changes,pkg,{recursive:true}); cpSync(join(stage,'CHANGELOG.txt'),join(pkg,'CHANGELOG.txt')); if(existsSync(join(stage,'PUBLISH_PLAN.txt'))) cpSync(join(stage,'PUBLISH_PLAN.txt'),join(pkg,'PUBLISH_PLAN.txt'));
  const zipPath=join(stage,`AML_${c.slug}_GitHub_Update.zip`); if(existsSync(zipPath)) rmSync(zipPath,{force:true});
  const zip=spawnSync('zip',['-qr',zipPath,'.'],{cwd:pkg,encoding:'utf8'});
  if(zip.status===0) ok(`Package ready: ${relative(root,zipPath)}`); else warn(`Package folder ready at ${relative(root,pkg)}; 'zip' command unavailable, so ZIP was not created.`);
}
function init(slug){
  if(!slugOk(slug)) die('init slug must be lowercase kebab-case.'); const dir=join(root,'.aml-publish',slug); ensureDir(dir);
  const cfg={slug,title:'',subtitle:'',seoDescription:'',summary:'',date:new Date().toISOString().slice(0,10),eyebrow:'',primaryDomain:'pbs',crossDomains:[],tag:'',cardMeta:'',keywords:[],heroAlt:'',bodyFile:'body.html',heroWebp:'hero.webp',ogImage:'hero.png',relatedReading:[],navigation:{routeLabel:'',seriesLinkLabel:'',previous:null,next:null,hub:null},reciprocalPrevious:false,series:[],featured:false,featuredRank:null,isNote:false,readingPaths:[],homepageFeatured:false,rss:true,sitemap:true,articleRole:'Article',collectionRole:''};
  const p=join(dir,'article.json'); if(!existsSync(p)) write(p,jsonPretty(cfg)); if(!existsSync(join(dir,'body.html'))) write(join(dir,'body.html'),'<!-- AML_TOC -->\n<p>文章開場。</p>\n<h2>第一節</h2>\n<p>正文。</p>\n');
  ok(`Draft workspace created: ${relative(root,dir)}`);
}

const [,,cmd,arg,...rest]=process.argv;
if(!cmd || ['-h','--help','help'].includes(cmd)){
  console.log(`\nAML Semi-auto Publisher\n\nCommands:\n  node publish-aml-article.mjs init <slug>\n  node publish-aml-article.mjs prepare <article.json>\n  node publish-aml-article.mjs validate <article.json>\n  node publish-aml-article.mjs package <article.json>\n  node publish-aml-article.mjs apply <article.json> --yes\n\nSafety model: prepare/validate/package never modify live site files. Only apply --yes writes staged changes into the repository.\n`); process.exit(0);
}
if(cmd==='init') init(arg);
else {
  if(!arg) die(`${cmd} requires article.json path.`); const c=validateConfig(loadConfig(arg));
  if(cmd==='prepare') prepare(c);
  else if(cmd==='validate') validateStage(c);
  else if(cmd==='package') packageStage(c);
  else if(cmd==='apply') apply(c,rest.includes('--yes'));
  else die(`Unknown command '${cmd}'.`);
}
