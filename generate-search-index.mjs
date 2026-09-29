#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const argv = process.argv.slice(2);
function arg(name, fallback=''){
  const i = argv.indexOf(name);
  return i >= 0 && argv[i+1] ? argv[i+1] : fallback;
}
const root = resolve(arg('--site-root', process.cwd()));
const manifestPath = resolve(arg('--manifest', join(root,'data','articles-manifest.json')));
const outputPath = resolve(arg('--output', join(root,'search-index.js')));

const STATIC_PAGES = [
  ['about.html','關於','認識 AML'],
  ['articles.html','館藏','主題館藏'],
  ['library.html','館藏','完整文章館藏'],
  ['reading-paths.html','學習','閱讀路徑'],
  ['management-learning.html','學習','管理實務學習'],
  ['pbs-learning.html','學習','PBS 實務學習'],
  ['helper-learning.html','學習','助人者永續實踐'],
  ['adhd-self-understanding-learning.html','學習','ADHD × 自我理解'],
  ['ot-beyond-clinic-learning.html','學習','OT Beyond the Clinic'],
  ['self-study.html','學習','進階自學室'],
  ['management-self-study.html','學習','管理學自主學習'],
  ['management-self-study-quiz.html','學習','管理學總測驗'],
  ['pbs-self-study.html','學習','PBS 自主學習'],
  ['pbs-self-study-quiz.html','學習','PBS 總複習'],
  ['my-aml.html','學習','My AML'],
  ['tools.html','工具','互動實驗室'],
  ['pbs-companion-web.html','工具','PBS 智能助理'],
  ['pbs-transition-assessment.html','工具','跨系統轉銜評估'],
  ['resources.html','資源','精選資源'],
  ['research.html','關於','研究'],
  ['publications.html','關於','出版與成果'],
  ['recognition.html','關於','專業肯定'],
  ['contact.html','關於','聯繫 AML']
];

function read(p){ return readFileSync(p,'utf8'); }
function decode(s=''){
  return s
    .replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
    .replace(/&quot;/gi,'"').replace(/&#39;/gi,"'").replace(/&#x27;/gi,"'")
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)));
}
function clean(s=''){
  return decode(s.replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
}
function attr(html, re){ const m=html.match(re); return m ? clean(m[1]) : ''; }
function extractPage(file,type,category){
  const p=join(root,file);
  if(!existsSync(p)) return null;
  const html=read(p);
  const title=attr(html,/<title>([\s\S]*?)<\/title>/i).replace(/\s*[｜|]\s*Allen Mind Lab.*$/i,'').trim() || category;
  const summary=attr(html,/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || attr(html,/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)
    || '';
  let body=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi,' ').replace(/<footer[\s\S]*?<\/footer>/gi,' ');
  const headings=[...body.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map(m=>clean(m[1])).filter(Boolean);
  const labels=[...body.matchAll(/<(?:a|button)[^>]*>([\s\S]*?)<\/(?:a|button)>/gi)].map(m=>clean(m[1])).filter(Boolean);
  const keywords=[title,category,...headings.slice(0,18),...labels.slice(0,14)].join(' ').replace(/\s+/g,' ').trim();
  return {title,url:'/'+file,type,category,summary,keywords,date:''};
}

if(!existsSync(manifestPath)) throw new Error(`Manifest not found: ${manifestPath}`);
const manifest=JSON.parse(read(manifestPath));
const articles=(manifest.articles||[]).map(a=>({
  title:a.title,
  url:a.articlePath || `/articles/${a.slug}.html`,
  type:'文章',
  category:a.tag || a.domains?.join(' × ') || '文章',
  summary:a.summary || '',
  keywords:[...(a.keywords||[]),...(a.domains||[])].join(' '),
  date:a.date || ''
}));
const staticEntries=STATIC_PAGES.map(([f,t,c])=>extractPage(f,t,c)).filter(Boolean);
const index=[...articles,...staticEntries];
const payload=`window.AML_SEARCH_INDEX = ${JSON.stringify(index)};\n`;
writeFileSync(outputPath,payload,'utf8');
console.log(`✓ AML search index generated: ${index.length} entries (${articles.length} articles + ${staticEntries.length} site pages).`);
console.log(`  ${outputPath}`);
