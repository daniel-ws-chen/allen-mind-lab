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
  const entries=[...catalog.matchAll(/\{subject:'([^']+)',unit:'([^']+)',title:'([^']+)',url:'([^']+)',awards:'([^']+)',mistakes:'([^']+)',resume:'([^']+)'\}/g)];
  if(entries.length!==27) fail(catalogFile,'expected 27 catalog units, found '+entries.length);
  const urls=entries.map(m=>m[4]);
  const duplicateUrls=[...new Set(urls.filter((x,i)=>urls.indexOf(x)!==i))];
  if(duplicateUrls.length) fail(catalogFile,'duplicate unit URLs: '+duplicateUrls.join(', '));
  for(const m of entries){
    const url=m[4];
    const local=url.replace(/^\/+/,'');
    const target=path.join(process.cwd(),local,'index.html');
    if(!fs.existsSync(target)) fail(catalogFile,'catalog URL has no index.html: '+url);
  }
  for(const keyIndex of [5,6,7]){
    const keys=entries.map(m=>m[keyIndex]);
    const dup=[...new Set(keys.filter((x,i)=>keys.indexOf(x)!==i))];
    if(dup.length) fail(catalogFile,'duplicate catalog storage keys: '+dup.join(', '));
  }
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
