import fs from 'node:fs';
import path from 'node:path';

const ROOT=path.resolve(process.cwd(),'aml-kids');
const failures=[];
const warnings=[];

function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    return entry.isDirectory()?walk(full):[full];
  });
}
function rel(file){return path.relative(process.cwd(),file).replaceAll('\\','/');}
function fail(file,msg){failures.push(rel(file)+': '+msg);}
function warn(file,msg){warnings.push(rel(file)+': '+msg);}

const files=walk(ROOT);
const htmlFiles=files.filter(f=>f.endsWith('.html'));
const jsFiles=files.filter(f=>f.endsWith('.js'));
const unitHtml=htmlFiles.filter(f=>/\/(?:unit\d+\/index\.html|social-5a\/index\.html)$/.test(f.replaceAll('\\','/')));
const unitJs=jsFiles.filter(f=>/\/(?:unit\d+\/unit\d+\.js|social-5a\/assets\/social5a\.js)$/.test(f.replaceAll('\\','/')));

function unitScriptForUrl(url){
  const clean=url.replace(/^\/+|\/$/g,'');
  if(clean==='aml-kids/social-5a') return path.join(process.cwd(),'aml-kids','social-5a','assets','social5a.js');
  const m=clean.match(/^aml-kids\/(chinese-5a|english-5a|science-5a|math-5a|social-5a)\/unit(\d+)$/);
  if(!m) return null;
  return path.join(process.cwd(),'aml-kids',m[1],'unit'+m[2],'unit'+m[2]+'.js');
}
function storageKeyMap(text){
  const out={};
  for(const name of ['AWARDS_KEY','MISTAKES_KEY','RESUME_KEY']){
    const m=text.match(new RegExp(name+"\\s*=\\s*'([^']+)'"));
    if(m) out[name]=m[1];
  }
  return out;
}


for(const file of htmlFiles){
  const text=fs.readFileSync(file,'utf8');
  if(!text.includes('<meta name="robots" content="noindex,nofollow"')) fail(file,'missing noindex,nofollow');
  if(!text.includes('class="skip-link"')) fail(file,'missing skip link');
  const h1=(text.match(/<h1\b/g)||[]).length;
  if(h1!==1) fail(file,'expected exactly one h1, found '+h1);
  if(!/<html lang="zh-Hant"/.test(text)) fail(file,'missing lang="zh-Hant"');
  const ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const dup=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
  if(dup.length) fail(file,'duplicate ids: '+dup.join(', '));
  for(const legacy of ['拼豆','Prototype','1000 點']){
    if(text.includes(legacy)) fail(file,'legacy copy remains: '+legacy);
  }
}

const storageKeys=new Map();
for(const file of unitJs){
  const text=fs.readFileSync(file,'utf8');
  const keys=[...text.matchAll(/(?:SCORE_KEY|UNIT_SCORE_KEY|AWARDS_KEY|MISTAKES_KEY|RESUME_KEY)\s*=\s*'([^']+)'/g)].map(m=>m[1]);
  for(const key of keys){
    if(!storageKeys.has(key)) storageKeys.set(key,[]);
    storageKeys.get(key).push(file);
  }
  const qBlock=text.match(/const questions=\[(.*?)\];/s);
  if(!qBlock){fail(file,'questions array not found');continue;}
  const count=(qBlock[1].match(/"id":"q\d+"/g)||[]).length;
  if(count!==50) fail(file,'expected 50 questions, found '+count);
  const levels=[...qBlock[1].matchAll(/"level":"([^"]+)"/g)].map(m=>m[1]);
  const counts={基礎:0,進階:0,素養:0};
  for(const level of levels) if(level in counts) counts[level]++;
  if(counts.基礎!==20||counts.進階!==20||counts.素養!==10){
    fail(file,`question mix should be 20/20/10, found ${counts.基礎}/${counts.進階}/${counts.素養}`);
  }
  if(/outline\s*:\s*none/i.test(text)) warn(file,'outline:none found in JS text');
  for(const legacy of ['拼豆',' / 1000','wallet<1000','Math.min(1000']){
    if(text.includes(legacy)) fail(file,'legacy reward logic remains: '+legacy);
  }
}

for(const [key,owners] of storageKeys){
  if(owners.length>1 && !key.includes('RewardWallet')){
    fail(owners[0],`storage key collision ${key}: ${owners.map(rel).join(', ')}`);
  }
}

for(const file of files.filter(f=>f.endsWith('.css'))){
  const text=fs.readFileSync(file,'utf8');
  if(/outline\s*:\s*none/i.test(text)) fail(file,'outline:none is not allowed');
  if(!text.includes('prefers-reduced-motion')) warn(file,'no prefers-reduced-motion rule');
}

if(unitHtml.length!==27) fail(ROOT,'expected 27 live unit HTML pages, found '+unitHtml.length);
if(unitJs.length!==27) fail(ROOT,'expected 27 live unit JS files, found '+unitJs.length);

const catalogFile=path.join(ROOT,'assets','kids-catalog.js');
if(!fs.existsSync(catalogFile)){
  fail(ROOT,'missing shared kids-catalog.js');
}else{
  const catalog=fs.readFileSync(catalogFile,'utf8');
  const unitLines=catalog.split('\n').map(x=>x.trim()).filter(x=>x.startsWith('{stage:')&&x.includes("unit:'"));
  const field=(line,name)=>{
    const stringMatch=line.match(new RegExp(name+":'([^']*)'"));
    if(stringMatch) return stringMatch[1];
    const numberMatch=line.match(new RegExp(name+":(\\d+)"));
    return numberMatch?Number(numberMatch[1]):undefined;
  };
  const entries=unitLines.map(line=>({
    stage:field(line,'stage'),
    grade:field(line,'grade'),
    semester:field(line,'semester'),
    subject:field(line,'subject'),
    publisher:field(line,'publisher'),
    version:field(line,'version'),
    unit:field(line,'unit'),
    title:field(line,'title'),
    url:field(line,'url'),
    awards:field(line,'awards'),
    mistakes:field(line,'mistakes'),
    resume:field(line,'resume')
  }));

  if(!/version:\s*2\b/.test(catalog)) fail(catalogFile,'catalog version should be 2');
  if(entries.length!==27) fail(catalogFile,'expected 27 catalog units, found '+entries.length);

  const required=['stage','grade','semester','subject','publisher','version','unit','title','url','awards','mistakes','resume'];
  entries.forEach((entry,index)=>{
    const missing=required.filter(k=>entry[k]===undefined||entry[k]==='');
    if(missing.length) fail(catalogFile,'unit '+(index+1)+' missing metadata: '+missing.join(', '));
    if(!['國小','國中','高中'].includes(entry.stage)) fail(catalogFile,'invalid stage for '+entry.url+': '+entry.stage);
    if(!Number.isInteger(entry.grade)||entry.grade<1||entry.grade>12) fail(catalogFile,'invalid grade for '+entry.url+': '+entry.grade);
    if(!['上學期','下學期'].includes(entry.semester)) fail(catalogFile,'invalid semester for '+entry.url+': '+entry.semester);
  });

  const urls=entries.map(e=>e.url);
  const duplicateUrls=[...new Set(urls.filter((x,i)=>urls.indexOf(x)!==i))];
  if(duplicateUrls.length) fail(catalogFile,'duplicate unit URLs: '+duplicateUrls.join(', '));

  for(const entry of entries){
    const url=entry.url;
    const local=url.replace(/^\/+/,'');
    const target=path.join(process.cwd(),local,'index.html');
    if(!fs.existsSync(target)) fail(catalogFile,'catalog URL has no index.html: '+url);

    const script=unitScriptForUrl(url);
    if(!script || !fs.existsSync(script)){
      fail(catalogFile,'catalog URL has no matching unit script: '+url);
    }else{
      const scriptText=fs.readFileSync(script,'utf8');
      const keys=storageKeyMap(scriptText);
      if(keys.AWARDS_KEY!==entry.awards) fail(catalogFile,`awards key mismatch for ${url}: catalog=${entry.awards} script=${keys.AWARDS_KEY||'missing'}`);
      if(keys.MISTAKES_KEY!==entry.mistakes) fail(catalogFile,`mistakes key mismatch for ${url}: catalog=${entry.mistakes} script=${keys.MISTAKES_KEY||'missing'}`);
      if(keys.RESUME_KEY!==entry.resume) fail(catalogFile,`resume key mismatch for ${url}: catalog=${entry.resume} script=${keys.RESUME_KEY||'missing'}`);
    }
  }

  for(const keyName of ['awards','mistakes','resume']){
    const keys=entries.map(e=>e[keyName]);
    const dup=[...new Set(keys.filter((x,i)=>keys.indexOf(x)!==i))];
    if(dup.length) fail(catalogFile,'duplicate catalog '+keyName+' keys: '+dup.join(', '));
  }

  const subjectDecl=catalog.match(/subjects:\s*\[([^\]]+)\]/);
  if(!subjectDecl){
    fail(catalogFile,'subjects list missing');
  }else{
    const subjects=[...subjectDecl[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
    const entrySubjects=[...new Set(entries.map(e=>e.subject))];
    const missing=entrySubjects.filter(s=>!subjects.includes(s));
    const unused=subjects.filter(s=>!entrySubjects.includes(s));
    if(missing.length) fail(catalogFile,'unit subjects missing from subjects list: '+missing.join(', '));
    if(unused.length) warn(catalogFile,'subjects list contains no units yet: '+unused.join(', '));
  }

  if(!/currentScope:\s*\{stage:'國小',grade:5,semester:'上學期',label:'國小五年級上學期'\}/.test(catalog)){
    warn(catalogFile,'currentScope metadata missing or unexpected');
  }
  if(!/scopeLabel:\s*'[^']+'/.test(catalog)) warn(catalogFile,'scopeLabel metadata missing');

  const stageDecl=[...catalog.matchAll(/\{stage:'(國小|國中|高中)',grades:\[([^\]]+)\]\}/g)];
  if(stageDecl.length!==3) fail(catalogFile,'expected 3 education stage definitions');
}
for(const file of unitJs){
  const text=fs.readFileSync(file,'utf8');
  if(!text.includes("AML_KIDS_LAST_ACTIVITY_KEY='amlKidsLastActivityV1'")) fail(file,'missing recent activity tracking');
  if(!text.includes("new URLSearchParams(location.search).get('resume')")) fail(file,'missing resume query support');
}

for(const [htmlRel,jsName,catalogSrc] of [
  ['my/index.html','my-kids.js','../assets/kids-catalog.js'],
  ['my/mistakes/index.html','mistakes.js','../../assets/kids-catalog.js']
]){
  const htmlFile=path.join(ROOT,...htmlRel.split('/'));
  const html=fs.readFileSync(htmlFile,'utf8');
  const catalogAt=html.indexOf(catalogSrc);
  const pageAt=html.indexOf(jsName);
  if(catalogAt<0) fail(htmlFile,'shared catalog script not loaded');
  if(pageAt<0) fail(htmlFile,'page script not loaded: '+jsName);
  if(catalogAt>=0&&pageAt>=0&&catalogAt>pageAt) fail(htmlFile,'shared catalog must load before '+jsName);
  const jsFile=path.join(path.dirname(htmlFile),jsName);
  const js=fs.readFileSync(jsFile,'utf8');
  if(js.includes('const units=[')) fail(jsFile,'local duplicate unit catalog found');
  if(!js.includes('window.AML_KIDS_CATALOG')) fail(jsFile,'does not read shared AML Kids catalog');
}

const myJsFile=path.join(ROOT,'my','my-kids.js');
if(fs.existsSync(myJsFile)){
  const myJs=fs.readFileSync(myJsFile,'utf8');
  if(/const subjectOrder=\[['"]/.test(myJs)) fail(myJsFile,'hard-coded subject order found; use shared catalog');
  if(/length\*50/.test(myJs)) fail(myJsFile,'hard-coded 50-question total found; use questionsPerUnit');
}
const mistakesJsFile=path.join(ROOT,'my','mistakes','mistakes.js');
if(fs.existsSync(mistakesJsFile)){
  const mistakesJs=fs.readFileSync(mistakesJsFile,'utf8');
  if(/\['國文','社會','自然','英文','數學'\]/.test(mistakesJs)) fail(mistakesJsFile,'hard-coded subject list found; use shared catalog');
}

console.log(`AML Kids QA: ${unitHtml.length} unit pages / ${unitJs.length} unit scripts checked.`);
if(warnings.length){
  console.log('\nWarnings:');
  warnings.forEach(x=>console.log('  - '+x));
}
if(failures.length){
  console.error('\nFailures:');
  failures.forEach(x=>console.error('  - '+x));
  process.exitCode=1;
}else{
  console.log('\nPASS: no blocking AML Kids QA issues found.');
}
