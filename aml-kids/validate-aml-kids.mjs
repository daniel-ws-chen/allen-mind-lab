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
function localFromUrl(url){return path.join(process.cwd(),url.replace(/^\/+/,'').replaceAll('/',path.sep));}
function storageKeyMap(text){
  const out={};
  for(const name of ['SCORE_KEY','UNIT_SCORE_KEY','AWARDS_KEY','MISTAKES_KEY','RESUME_KEY']){
    const m=text.match(new RegExp(name+"\\s*=\\s*'([^']+)'"));
    if(m) out[name]=m[1];
  }
  return out;
}

const files=walk(ROOT);
const htmlFiles=files.filter(f=>f.endsWith('.html'));
const cssFiles=files.filter(f=>f.endsWith('.css'));
const jsFiles=files.filter(f=>f.endsWith('.js'));
const catalogFile=path.join(ROOT,'assets','kids-catalog.js');

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

for(const file of cssFiles){
  const text=fs.readFileSync(file,'utf8');
  if(/outline\s*:\s*none/i.test(text)) fail(file,'outline:none is not allowed');
  if(!text.includes('prefers-reduced-motion')) warn(file,'no prefers-reduced-motion rule');
}

let entries=[];
let expectedUnits=0;
let questionsPerUnit=50;
let currentScope=null;

if(!fs.existsSync(catalogFile)){
  fail(ROOT,'missing shared kids-catalog.js');
}else{
  const catalog=fs.readFileSync(catalogFile,'utf8');
  const version=Number(catalog.match(/version:\s*(\d+)/)?.[1]||0);
  if(version<4) fail(catalogFile,'catalog version should be 4 or newer');

  expectedUnits=Number(catalog.match(/totalUnits:\s*(\d+)/)?.[1]||0);
  questionsPerUnit=Number(catalog.match(/questionsPerUnit:\s*(\d+)/)?.[1]||50);

  const current=catalog.match(/currentScope:\s*\{stage:'([^']+)',grade:(\d+),semester:'([^']+)',label:'([^']+)'\}/);
  if(current) currentScope={stage:current[1],grade:Number(current[2]),semester:current[3],label:current[4]};
  else warn(catalogFile,'currentScope metadata missing');

  const unitLines=catalog.split('\n').map(x=>x.trim()).filter(x=>x.startsWith('{stage:')&&x.includes("unit:'"));
  const field=(line,name)=>{
    const stringMatch=line.match(new RegExp(name+":'([^']*)'"));
    if(stringMatch) return stringMatch[1];
    const numberMatch=line.match(new RegExp(name+":(\\d+)"));
    return numberMatch?Number(numberMatch[1]):undefined;
  };

  entries=unitLines.map(line=>({
    stage:field(line,'stage'),
    grade:field(line,'grade'),
    semester:field(line,'semester'),
    subject:field(line,'subject'),
    publisher:field(line,'publisher'),
    version:field(line,'version'),
    unit:field(line,'unit'),
    title:field(line,'title'),
    summary:field(line,'summary'),
    url:field(line,'url'),
    script:field(line,'script'),
    awards:field(line,'awards'),
    mistakes:field(line,'mistakes'),
    resume:field(line,'resume')
  }));

  if(expectedUnits!==entries.length) fail(catalogFile,'totalUnits='+expectedUnits+' but catalog contains '+entries.length+' units');

  const required=['stage','grade','semester','subject','publisher','version','unit','title','summary','url','script','awards','mistakes','resume'];
  const gradeRange={國小:[1,6],國中:[7,9],高中:[10,12]};
  entries.forEach((entry,index)=>{
    const missing=required.filter(k=>entry[k]===undefined||entry[k]==='');
    if(missing.length) fail(catalogFile,'unit '+(index+1)+' missing metadata: '+missing.join(', '));
    if(!gradeRange[entry.stage]) fail(catalogFile,'invalid stage for '+entry.url+': '+entry.stage);
    else if(entry.grade<gradeRange[entry.stage][0]||entry.grade>gradeRange[entry.stage][1]) fail(catalogFile,'grade/stage mismatch for '+entry.url);
    if(!['上學期','下學期'].includes(entry.semester)) fail(catalogFile,'invalid semester for '+entry.url+': '+entry.semester);
  });

  for(const keyName of ['url','script','awards','mistakes','resume']){
    const values=entries.map(e=>e[keyName]);
    const dup=[...new Set(values.filter((x,i)=>values.indexOf(x)!==i))];
    if(dup.length) fail(catalogFile,'duplicate '+keyName+': '+dup.join(', '));
  }

  const subjectDetailsBlock=catalog.match(/subjectDetails:\s*\[([\s\S]*?)\],\n\s*units:/);
  if(!subjectDetailsBlock){
    fail(catalogFile,'subjectDetails metadata missing');
  }else{
    const details=[...subjectDetailsBlock[1].matchAll(/\{subject:'([^']+)',slug:'([^']+)',icon:'([^']+)',intro:'([^']+)',wishVersions:\[([^\]]*)\]\}/g)];
    const detailSubjects=details.map(m=>m[1]);
    const entrySubjects=[...new Set(entries.map(e=>e.subject))];
    const missingDetails=entrySubjects.filter(s=>!detailSubjects.includes(s));
    if(missingDetails.length) fail(catalogFile,'subjects missing display metadata: '+missingDetails.join(', '));
    if(new Set(detailSubjects).size!==detailSubjects.length) fail(catalogFile,'duplicate subjectDetails entries');
  }

  const subjectDecl=catalog.match(/subjects:\s*\[([^\]]+)\]/);
  if(!subjectDecl) fail(catalogFile,'subjects list missing');
  else{
    const subjects=[...subjectDecl[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
    const entrySubjects=[...new Set(entries.map(e=>e.subject))];
    const missing=entrySubjects.filter(s=>!subjects.includes(s));
    const unused=subjects.filter(s=>!entrySubjects.includes(s));
    if(missing.length) fail(catalogFile,'unit subjects missing from subjects list: '+missing.join(', '));
    if(unused.length) warn(catalogFile,'subjects list contains no units yet: '+unused.join(', '));
  }

  const stageDecl=[...catalog.matchAll(/\{stage:'(國小|國中|高中)',grades:\[([^\]]+)\]\}/g)];
  if(stageDecl.length!==3) fail(catalogFile,'expected 3 education stage definitions');

  if(currentScope){
    const scopeExists=entries.some(e=>e.stage===currentScope.stage&&e.grade===currentScope.grade&&e.semester===currentScope.semester);
    if(!scopeExists) fail(catalogFile,'currentScope does not match any catalog unit');
  }
}

const storageOwners=new Map();
const catalogScripts=new Set();

for(const entry of entries){
  const htmlFile=path.join(localFromUrl(entry.url),'index.html');
  const scriptFile=localFromUrl(entry.script);
  if(!fs.existsSync(htmlFile)){fail(catalogFile,'catalog URL has no index.html: '+entry.url);continue;}
  if(!fs.existsSync(scriptFile)){fail(catalogFile,'catalog script missing: '+entry.script);continue;}

  catalogScripts.add(path.resolve(scriptFile));
  const text=fs.readFileSync(scriptFile,'utf8');
  const qBlock=text.match(/const questions=\[(.*?)\];/s);
  if(!qBlock){fail(scriptFile,'questions array not found');continue;}

  const count=(qBlock[1].match(/"id":"q\d+"/g)||[]).length;
  if(count!==questionsPerUnit) fail(scriptFile,'expected '+questionsPerUnit+' questions, found '+count);

  const levels=[...qBlock[1].matchAll(/"level":"([^"]+)"/g)].map(m=>m[1]);
  const counts={基礎:0,進階:0,素養:0};
  for(const level of levels) if(level in counts) counts[level]++;
  if(questionsPerUnit===50&&(counts.基礎!==20||counts.進階!==20||counts.素養!==10)){
    fail(scriptFile,`question mix should be 20/20/10, found ${counts.基礎}/${counts.進階}/${counts.素養}`);
  }

  const keys=storageKeyMap(text);
  if(keys.AWARDS_KEY!==entry.awards) fail(catalogFile,`awards key mismatch for ${entry.url}: catalog=${entry.awards} script=${keys.AWARDS_KEY||'missing'}`);
  if(keys.MISTAKES_KEY!==entry.mistakes) fail(catalogFile,`mistakes key mismatch for ${entry.url}: catalog=${entry.mistakes} script=${keys.MISTAKES_KEY||'missing'}`);
  if(keys.RESUME_KEY!==entry.resume) fail(catalogFile,`resume key mismatch for ${entry.url}: catalog=${entry.resume} script=${keys.RESUME_KEY||'missing'}`);

  Object.values(keys).forEach(key=>{
    if(!storageOwners.has(key)) storageOwners.set(key,[]);
    storageOwners.get(key).push(scriptFile);
  });

  if(!text.includes("AML_KIDS_LAST_ACTIVITY_KEY='amlKidsLastActivityV1'")) fail(scriptFile,'missing recent activity tracking');
  if(!text.includes("new URLSearchParams(location.search).get('resume')")) fail(scriptFile,'missing resume query support');
  if(/outline\s*:\s*none/i.test(text)) warn(scriptFile,'outline:none found in JS text');
  for(const legacy of ['拼豆',' / 1000','wallet<1000','Math.min(1000']){
    if(text.includes(legacy)) fail(scriptFile,'legacy reward logic remains: '+legacy);
  }
}

for(const [key,owners] of storageOwners){
  if(owners.length>1&&!key.includes('RewardWallet')) fail(owners[0],`storage key collision ${key}: ${owners.map(rel).join(', ')}`);
}

const questionScripts=jsFiles.filter(file=>/const questions=\[/.test(fs.readFileSync(file,'utf8')));
for(const file of questionScripts){
  if(!catalogScripts.has(path.resolve(file))) fail(file,'question-bearing unit script is not listed in AML Kids catalog');
}
if(questionScripts.length!==entries.length) fail(ROOT,'catalog/unit script count mismatch: catalog='+entries.length+', question scripts='+questionScripts.length);

for(const [htmlRel,jsName,catalogSrc] of [
  ['index.html','kids-portal.js','assets/kids-catalog.js'],
  ['my/index.html','my-kids.js','../assets/kids-catalog.js'],
  ['my/mistakes/index.html','mistakes.js','../../assets/kids-catalog.js'],
  ['qa/index.html','qa.js','../assets/kids-catalog.js'],
  ['my/backup/index.html','backup.js','../../assets/kids-catalog.js']
]){
  const htmlFile=path.join(ROOT,...htmlRel.split('/'));
  if(!fs.existsSync(htmlFile)){fail(ROOT,'missing '+htmlRel);continue;}
  const html=fs.readFileSync(htmlFile,'utf8');
  const catalogAt=html.indexOf(catalogSrc);
  const pageAt=html.indexOf(jsName);
  if(catalogAt<0) fail(htmlFile,'shared catalog script not loaded');
  if(pageAt<0) fail(htmlFile,'page script not loaded: '+jsName);
  if(catalogAt>=0&&pageAt>=0&&catalogAt>pageAt) fail(htmlFile,'shared catalog must load before '+jsName);
}

for(const [htmlRel,jsRel] of [
  ['my/index.html','my/my-kids.js'],
  ['my/mistakes/index.html','my/mistakes/mistakes.js']
]){
  const htmlFile=path.join(ROOT,...htmlRel.split('/'));
  const jsFile=path.join(ROOT,...jsRel.split('/'));
  const html=fs.readFileSync(htmlFile,'utf8');
  const js=fs.readFileSync(jsFile,'utf8');
  if(!html.includes('id="scopeSelect"')&&!html.includes('id="scopeFilter"')) fail(htmlFile,'learning scope selector missing');
  if(!js.includes("amlKidsMyScopeV1")) fail(jsFile,'shared learning scope persistence missing');
  if(!js.includes('catalog?.currentScope')) fail(jsFile,'currentScope fallback missing');
  if(!js.includes('scopeKey(')) fail(jsFile,'scope-aware filtering missing');
  if(js.includes('const units=[')) fail(jsFile,'local duplicate unit catalog found');
  if(!js.includes('window.AML_KIDS_CATALOG')) fail(jsFile,'does not read shared AML Kids catalog');
}

const portalJsFile=path.join(ROOT,'assets','kids-portal.js');
if(fs.existsSync(portalJsFile)){
  const portalJs=fs.readFileSync(portalJsFile,'utf8');
  if(!portalJs.includes('window.AML_KIDS_CATALOG')) fail(portalJsFile,'portal must read shared AML Kids catalog');
  if(portalJs.includes("stage==='國小'&&grade===5")) fail(portalJsFile,'hard-coded grade availability found; use shared catalog');
  for(const id of ['portalSubjectCount','portalUnitCount','portalQuestionCount','portalQuestionsPerUnit']){
    if(!portalJs.includes(id)) fail(portalJsFile,'dynamic portal summary missing: '+id);
  }
  if(!portalJs.includes("document.querySelectorAll('[data-stage-card]')")) fail(portalJsFile,'stage cards are not catalog-driven');
  if(!portalJs.includes('updateQuickScopeLabel')) fail(portalJsFile,'current scope label is not catalog-driven');
  if(!portalJs.includes('renderSubjectPortal')) fail(portalJsFile,'subject portal is not catalog-driven');
  if(!portalJs.includes('renderSubjectJump')) fail(portalJsFile,'subject quick navigation is not catalog-driven');
  if(!portalJs.includes("window.matchMedia('(max-width:800px)')")) fail(portalJsFile,'mobile subject compaction breakpoint missing');
  if(!portalJs.includes('appendEditionUnits')) fail(portalJsFile,'long unit lists are not compacted for mobile');
  if(!portalJs.includes("document.createElement('details')")) fail(portalJsFile,'mobile unit disclosure must use native details/summary');
  if(!portalJs.includes('catalog.subjectDetails')) fail(portalJsFile,'subject portal does not use catalog subjectDetails');
  if(!portalJs.includes('updateHeroLauncher')) fail(portalJsFile,'home quick-start launcher is not catalog-driven');
  if(!portalJs.includes("localStorage.getItem('amlKidsLastActivityV1')")) fail(portalJsFile,'home quick-start launcher does not support recent learning resume');
}

const portalHtmlFile=path.join(ROOT,'index.html');
if(fs.existsSync(portalHtmlFile)){
  const portalHtml=fs.readFileSync(portalHtmlFile,'utf8');
  const stageCards=(portalHtml.match(/data-stage-card="(國小|國中|高中)"/g)||[]).length;
  if(stageCards!==3) fail(portalHtmlFile,'expected 3 catalog-driven stage cards, found '+stageCards);
  if(!portalHtml.includes('id="quickScopeLabel"')) fail(portalHtmlFile,'dynamic quick-start scope label missing');
  if(!portalHtml.includes('id="subjectPortalGrid"')) fail(portalHtmlFile,'dynamic subject portal mount missing');
  if(!portalHtml.includes('id="subjectJump"')) fail(portalHtmlFile,'subject quick navigation mount missing');
  if(!portalHtml.includes('id="heroLaunchPrimary"')) fail(portalHtmlFile,'home quick-start launcher missing');
  if(/<section class="subject-portal [^"]+-portal"/.test(portalHtml)) fail(portalHtmlFile,'static subject portal cards remain in home page');
}

const myJsFile=path.join(ROOT,'my','my-kids.js');
if(fs.existsSync(myJsFile)){
  const myJs=fs.readFileSync(myJsFile,'utf8');
  if(/const subjectOrder=\[['"]/.test(myJs)) fail(myJsFile,'hard-coded subject order found; use shared catalog');
  if(/length\*50/.test(myJs)) fail(myJsFile,'hard-coded 50-question total found; use questionsPerUnit');
}
const backupJsFile=path.join(ROOT,'my','backup','backup.js');
if(fs.existsSync(backupJsFile)){
  const backupJs=fs.readFileSync(backupJsFile,'utf8');
  if(!backupJs.includes("key.startsWith('amlKids')")) fail(backupJsFile,'backup import/export must stay limited to amlKids keys');
  if(!backupJs.includes("MAX_FILE_BYTES=1024*1024")) fail(backupJsFile,'backup file-size guard missing');
  if(!backupJs.includes("confirmImport")) fail(backupJsFile,'backup import confirmation missing');
  if(!backupJs.includes("RESTORE_POINT_KEY='amlKidsBackupRestorePointV1'")) fail(backupJsFile,'pre-import restore point missing');
  if(!backupJs.includes("if(!includeRestorePoint&&key===RESTORE_POINT_KEY) continue")) fail(backupJsFile,'restore point must be excluded from downloadable backups');
  if(!backupJs.includes("createRestorePoint();")) fail(backupJsFile,'import must create a restore point first');
  if(!backupJs.includes("clearCurrentAmlKidsData();")) fail(backupJsFile,'rollback must clear imported AML Kids state before restoring snapshot');
}

const aboutFile=path.join(ROOT,'about','index.html');
if(!fs.existsSync(aboutFile)){
  fail(ROOT,'missing AML Kids usage and rights notice page');
}else{
  const about=fs.readFileSync(aboutFile,'utf8');
  for(const phrase of ['智慧財產權','免費公開','不負學習進度','daniel.ws.chen@gmail.com']){
    if(!about.includes(phrase)) fail(aboutFile,'usage notice missing required phrase: '+phrase);
  }
  if(!about.includes('../my/backup/')) fail(aboutFile,'usage notice missing backup link');
}

const mistakesJsFile=path.join(ROOT,'my','mistakes','mistakes.js');
if(fs.existsSync(mistakesJsFile)){
  const mistakesJs=fs.readFileSync(mistakesJsFile,'utf8');
  if(/\['國文','社會','自然','英文','數學'\]/.test(mistakesJs)) fail(mistakesJsFile,'hard-coded subject list found; use shared catalog');
}

console.log(`AML Kids QA: ${entries.length} catalog units / ${questionScripts.length} question scripts / ${htmlFiles.length} HTML pages checked.`);
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
