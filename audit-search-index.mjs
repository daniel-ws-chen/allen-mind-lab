#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const argv=process.argv.slice(2);
function arg(name,fallback=''){
  const i=argv.indexOf(name);
  return i>=0 && argv[i+1] ? argv[i+1] : fallback;
}
const root=resolve(arg('--site-root',process.cwd()));
const indexPath=resolve(arg('--index',join(root,'search-index.js')));
const manifestPath=resolve(arg('--manifest',join(root,'data','articles-manifest.json')));
const errors=[];
const warnings=[];
const ok=[];
const norm=s=>(s||'').toString().toLowerCase().normalize('NFKC').replace(/\s+/g,' ').trim();

function addError(m){errors.push(m)}
function addWarn(m){warnings.push(m)}
function addOk(m){ok.push(m)}
function localPathFromUrl(url){
  if(!url || !url.startsWith('/') || url.startsWith('//')) return null;
  const clean=url.split('#')[0].split('?')[0];
  if(clean==='/') return join(root,'index.html');
  const rel=clean.replace(/^\//,'');
  if(rel.endsWith('/')) return join(root,rel,'index.html');
  if(/\.[a-z0-9]+$/i.test(rel)) return join(root,rel);
  return join(root,rel+'.html');
}

if(!existsSync(indexPath)){
  addError(`Missing search index: ${indexPath}`);
}else{
  const raw=readFileSync(indexPath,'utf8');
  const m=raw.match(/window\.AML_SEARCH_INDEX\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
  if(!m){
    addError('search-index.js format not recognized.');
  }else{
    let data=[];
    try{ data=JSON.parse(m[1]); }
    catch(e){ addError(`search-index.js JSON parse failed: ${e.message}`); }
    if(Array.isArray(data)){
      if(!data.length) addError('Search index has no entries.');
      else addOk(`Search index loaded: ${data.length} entries.`);

      const urls=new Map();
      for(const item of data){
        if(!item?.title) addError('Search entry missing title.');
        if(!item?.url) addError(`Search entry missing URL: ${item?.title||'(untitled)'}`);
        if(item?.url){
          urls.set(item.url,(urls.get(item.url)||0)+1);
          const p=localPathFromUrl(item.url);
          if(p && !existsSync(p)) addError(`Broken indexed URL: ${item.url}`);
        }
      }
      const dup=[...urls.entries()].filter(([,n])=>n>1).map(([u,n])=>`${u} ×${n}`);
      if(dup.length) addError(`Duplicate indexed URL(s): ${dup.join(', ')}`);
      else addOk('No duplicate search URLs detected.');
      if(!errors.some(x=>x.startsWith('Broken indexed URL'))) addOk('All indexed local URLs resolve to files.');

      const aliases={
        'pbs':['正向行為支持','行為功能','行為支持'],
        'adhd':['注意力不足過動症','過動','注意力'],
        'ot':['職能治療','職能'],
        'ai':['人工智慧','生成式ai','生成式人工智慧'],
        '管理':['領導','主管','方案管理','團隊'],
        '感覺處理':['感覺統合','sensory','感覺'],
        '自學':['自主學習','完訓','學習路徑']
      };
      function matches(item,q){
        const hay=norm([item.title,item.keywords,item.summary,item.category,item.type].join(' '));
        const vars=[q,...(aliases[norm(q)]||[])].map(norm);
        return vars.some(v=>v && hay.includes(v));
      }
      const fixtures=['PBS','ADHD','OT','AI','管理','感覺處理','自學'];
      for(const q of fixtures){
        const found=data.filter(x=>matches(x,q));
        if(!found.length) addError(`Regression query '${q}' returns no discoverable entry.`);
        else addOk(`Regression query '${q}' has ${found.length} discoverable entr${found.length===1?'y':'ies'}.`);
      }

      const types=new Set(data.map(x=>x.type).filter(Boolean));
      for(const needed of ['文章','學習','工具','資源']){
        if(!types.has(needed)) addWarn(`No '${needed}' entry currently present in search index.`);
      }

      if(existsSync(manifestPath)){
        try{
          const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
          const articles=Array.isArray(manifest.articles)?manifest.articles:[];
          const indexedArticles=data.filter(x=>x.type==='文章');
          if(indexedArticles.length!==articles.length) addError(`Indexed article count ${indexedArticles.length} does not match manifest ${articles.length}.`);
          else addOk(`Indexed article count matches manifest: ${articles.length}.`);
        }catch(e){ addWarn(`Manifest comparison skipped: ${e.message}`); }
      }else addWarn('Manifest not found; article-count comparison skipped.');
    }
  }
}

console.log('\nAML SEARCH REGRESSION AUDIT');
console.log('='.repeat(30));
for(const x of ok) console.log(`✓ ${x}`);
if(warnings.length){ console.log(`\nWARNINGS (${warnings.length})`); for(const x of warnings) console.log(`! ${x}`); }
if(errors.length){ console.log(`\nERRORS (${errors.length})`); for(const x of errors) console.log(`✗ ${x}`); }
console.log(`\nResult: ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exitCode=errors.length?1:0;
