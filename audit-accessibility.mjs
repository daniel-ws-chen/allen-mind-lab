import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const excludedDirs = new Set(['.git','node_modules','dist','.wrangler']);
const errors = [];
const warnings = [];
const checked = [];

function walk(dir){
  for(const name of readdirSync(dir)){
    if(excludedDirs.has(name)) continue;
    const p=join(dir,name);
    const st=statSync(p);
    if(st.isDirectory()) walk(p);
    else if(name.endsWith('.html')) inspect(p);
  }
}
function stripNonDom(html){
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi,'')
    .replace(/<style\b[\s\S]*?<\/style>/gi,'')
    .replace(/<!--([\s\S]*?)-->/g,'');
}
function inspect(file){
  const raw=readFileSync(file,'utf8');
  // Ignore HTML fragments / engineering snippets that are not standalone public documents.
  if(!/<html\b/i.test(raw)) return;
  const html=stripNonDom(raw);
  const rel=relative(root,file).replaceAll('\\','/');
  checked.push(rel);

  if(!/<html[^>]*\blang\s*=\s*["'][^"']+["']/i.test(html)) errors.push(`${rel}: <html> 缺少 lang。`);
  if(!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${rel}: 缺少有效 <title>。`);
  if(!/<meta[^>]+name=["']viewport["']/i.test(html)) warnings.push(`${rel}: 未偵測到 viewport meta。`);

  const h1=(html.match(/<h1\b/gi)||[]).length;
  if(h1!==1) warnings.push(`${rel}: 靜態 DOM 偵測到 ${h1} 個 H1（建議人工確認）。`);

  const hasMain=/<main\b/i.test(html);
  if(!hasMain) warnings.push(`${rel}: 未偵測到 <main> landmark。`);

  if(/<nav\b/i.test(html) && hasMain && !/跳到主要內容|class\s*=\s*["'][^"']*skip-link|class\s*=\s*["'][^"']*aml-skip-link/i.test(html)){
    warnings.push(`${rel}: 有導覽與 main，但未偵測到 skip link。`);
  }

  for(const m of html.matchAll(/<img\b[^>]*>/gi)){
    if(!/\balt\s*=/i.test(m[0])) errors.push(`${rel}: 圖片缺少 alt：${m[0].slice(0,140)}`);
  }
  for(const m of html.matchAll(/<iframe\b[^>]*>/gi)){
    if(!/\btitle\s*=/i.test(m[0])) errors.push(`${rel}: iframe 缺少 title。`);
  }
  for(const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)){
    const attrs=m[1], body=m[2].replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').trim();
    if(!body && !/aria-label\s*=|aria-labelledby\s*=|title\s*=/i.test(attrs)){
      errors.push(`${rel}: 發現沒有可存取名稱的 button。`);
    }
  }
}

walk(root);

console.log('\nAML ACCESSIBILITY PREFLIGHT');
console.log('='.repeat(34));
console.log(`Checked: ${checked.length} HTML file(s)`);
if(warnings.length){
  console.log(`\nWARNINGS (${warnings.length})`);
  warnings.forEach(x=>console.log('! '+x));
}
if(errors.length){
  console.log(`\nERRORS (${errors.length})`);
  errors.forEach(x=>console.log('✗ '+x));
}
console.log(`\nResult: ${errors.length} error(s), ${warnings.length} warning(s).`);
console.log('Note: 此工具僅做靜態預檢，不等同 Freego 或人工無障礙檢測。');
process.exitCode = errors.length ? 1 : 0;
