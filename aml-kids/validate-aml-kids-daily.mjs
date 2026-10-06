import fs from 'node:fs';
import path from 'node:path';

const errors=[];
function fail(msg){errors.push(msg)}

const catalogFile='aml-kids/assets/kids-catalog.js';
const pageFile='aml-kids/daily/index.html';
const jsFile='aml-kids/daily/daily.js';
const cssFile='aml-kids/daily/daily.css';

for(const file of [catalogFile,pageFile,jsFile,cssFile]){
  if(!fs.existsSync(file)) fail('missing '+file);
}

let catalog={};
if(fs.existsSync(catalogFile)){
  const src=fs.readFileSync(catalogFile,'utf8');
  try{
    const fake={};
    Function('window',src)(fake);
    catalog=fake.AML_KIDS_CATALOG||{};
  }catch(err){fail('catalog cannot be evaluated: '+err.message)}
}

const subjects=catalog.subjects||[];
if(subjects.length!==5) fail('Daily 5 expects exactly 5 subjects, found '+subjects.length);

const scope=catalog.currentScope||{};
for(const subject of subjects){
  const units=(catalog.units||[]).filter(u=>u.subject===subject&&u.stage===scope.stage&&u.grade===scope.grade&&u.semester===scope.semester);
  if(!units.length){
    fail(subject+': no units available in current scope');
    continue;
  }
  for(const unit of units){
    const script=String(unit.script||'').replace(/^\/+/, '');
    if(!fs.existsSync(script)){
      fail(subject+': missing script '+script);
      continue;
    }
    const text=fs.readFileSync(script,'utf8');
    const m=text.match(/const questions=\[(.*?)\];/s);
    if(!m){
      fail(subject+': questions array not found in '+script);
      continue;
    }
    try{
      const qs=JSON.parse('['+m[1]+']');
      if(qs.length!==(catalog.questionsPerUnit||50)) fail(subject+': '+script+' has '+qs.length+' questions');
      qs.forEach((q,i)=>{
        if(!Array.isArray(q.o)||q.o.length!==4) fail(subject+': '+script+' question '+(i+1)+' does not have 4 choices');
        if(!Number.isInteger(q.a)||q.a<0||q.a>3) fail(subject+': '+script+' question '+(i+1)+' has invalid answer');
      });
    }catch(err){
      fail(subject+': cannot parse '+script+': '+err.message);
    }
  }
}

if(fs.existsSync(pageFile)){
  const html=fs.readFileSync(pageFile,'utf8');
  for(const token of ['class="skip-link"','aria-live="polite"','id="daily-questions"','id="daily-progress-text"']){
    if(!html.includes(token)) fail('daily page missing '+token);
  }
  if(!html.includes('meta name="robots" content="noindex,nofollow"')) fail('daily page missing noindex,nofollow');
  if(!html.includes('../assets/kids-catalog.js')) fail('daily page must load shared catalog');
}

if(fs.existsSync(jsFile)){
  const js=fs.readFileSync(jsFile,'utf8');
  for(const token of [
    "amlKidsDaily5V1",
    "catalog?.subjects",
    "currentScopeUnit",
    "fetch(unit.script",
    "const questions=\\[(.*?)\\];",
    "dateKey+'|'+subject+'|unit'",
    "dateKey+'|'+subject+'|question'"
  ]){
    if(!js.includes(token)) fail('daily.js missing '+token);
  }
  if(!js.includes("item.q.o.forEach")) fail('daily.js must render four choices from source questions');
  if(!js.includes("aria-live")) fail('daily.js feedback live region missing');
}

if(fs.existsSync(cssFile)){
  const css=fs.readFileSync(cssFile,'utf8');
  if(/outline\s*:\s*none/i.test(css)) fail('outline:none is not allowed');
  if(!css.includes(':focus-visible')&&!css.includes(':focus{')&&!css.includes(':focus {')) fail('visible keyboard focus styling missing');
  if(!css.includes('prefers-reduced-motion')) fail('prefers-reduced-motion missing');
}

if(errors.length){
  errors.forEach(x=>console.error('FAIL:',x));
  process.exit(1);
}
console.log('PASS: AML Kids Daily 5 QA passed.');
