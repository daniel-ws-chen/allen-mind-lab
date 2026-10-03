import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const projectRoot = process.cwd();
const root = process.env.AUDIT_ROOT ? join(projectRoot, process.env.AUDIT_ROOT) : projectRoot;
const excludedDirs = new Set(['.git','node_modules','dist','.wrangler']);
const errors = [];
const warnings = [];
const checked = [];
const restrictedFlags = [];
const scopeFile = join(projectRoot,'accessibility-scope.json');
const scope = existsSync(scopeFile) ? JSON.parse(readFileSync(scopeFile,'utf8')) : null;

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
  if(scope?.restricted_candidates){
    const urlPath='/' + rel.replace(/index\.html$/i,'').replace(/\.html$/i,'.html');
    for(const prefix of scope.restricted_candidates){
      if(urlPath.startsWith(prefix)){
        restrictedFlags.push(`${rel}: 位於 restricted candidate「${prefix}」，在真正 server/edge auth 證據完成前仍納入公開預檢。`);
      }
    }
  }

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

  for(const m of html.matchAll(/<a\b[^>]*target\s*=\s*["']_blank["'][^>]*>/gi)){
    if(!/\brel\s*=\s*["'][^"']*noopener/i.test(m[0])){
      warnings.push(`${rel}: target="_blank" 連結未偵測到 rel="noopener"。`);
    }
  }

  const labelsByFor=new Set([...html.matchAll(/<label\b[^>]*for\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]));
  for(const m of html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)){
    const tag=m[1].toLowerCase(), attrs=m[2];
    if(/type\s*=\s*["'](?:hidden|submit|button|reset|image)["']/i.test(attrs)) continue;
    const id=(attrs.match(/\bid\s*=\s*["']([^"']+)["']/i)||[])[1];
    const named=/aria-label\s*=|aria-labelledby\s*=/i.test(attrs) || (id && labelsByFor.has(id));
    const before=html.slice(Math.max(0,m.index-500),m.index);
    const insideLabel=/<label\b[^>]*>[^<]*(?:<[^>]+>[^<]*)*$/i.test(before);
    if(!named && !insideLabel){
      warnings.push(`${rel}: ${tag} 可能缺少可程式判定的標籤${id?`（id=${id}）`:''}。`);
    }
  }

  for(const m of html.matchAll(/<table\b[\s\S]*?<\/table>/gi)){
    if(!/<th\b/i.test(m[0])) warnings.push(`${rel}: table 未偵測到 th，請人工確認表格標題語意。`);
  }

  for(const m of html.matchAll(/<[^>]+role\s*=\s*["']button["'][^>]*>/gi)){
    if(!/tabindex\s*=\s*["']0["']/i.test(m[0]) && !/^<button\b/i.test(m[0])){
      warnings.push(`${rel}: role="button" 元件未偵測到 tabindex="0"，請確認鍵盤可操作性。`);
    }
  }
}

if(!existsSync(root)){
  console.error(`Audit root does not exist: ${root}`);
  process.exit(2);
}
walk(root);

console.log('\nAML ACCESSIBILITY PREFLIGHT');
console.log('='.repeat(34));
console.log(`Audit root: ${relative(projectRoot,root) || '.'}`);
console.log(`Checked: ${checked.length} HTML file(s)`);
if(warnings.length){
  console.log(`\nWARNINGS (${warnings.length})`);
  warnings.forEach(x=>console.log('! '+x));
}
if(errors.length){
  console.log(`\nERRORS (${errors.length})`);
  errors.forEach(x=>console.log('✗ '+x));
}
if(restrictedFlags.length){
  console.log(`\nRESTRICTED CANDIDATES (${restrictedFlags.length})`);
  restrictedFlags.forEach(x=>console.log('• '+x));
}
console.log(`\nResult: ${errors.length} error(s), ${warnings.length} warning(s).`);
if(process.env.AUDIT_REPORT){
  const reportPath=join(projectRoot,process.env.AUDIT_REPORT);
  writeFileSync(reportPath,JSON.stringify({
    generatedAt:new Date().toISOString(),
    auditRoot:relative(projectRoot,root) || '.',
    checkedCount:checked.length,
    checked,
    errors,
    warnings,
    restrictedFlags
  },null,2));
  console.log(`Report written: ${process.env.AUDIT_REPORT}`);
}
console.log('Note: 此工具僅做靜態預檢，不等同 Freego 或人工無障礙檢測。');
process.exitCode = errors.length ? 1 : 0;
