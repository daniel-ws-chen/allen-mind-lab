import fs from 'node:fs';

const dataFile='aml-kids/visual-challenges/visual-data.js';
const indexFile='aml-kids/visual-challenges/index.html';
const engineFile='aml-kids/visual-challenges/visual-challenges.js';
const cssFile='aml-kids/visual-challenges/visual-challenges.css';
const catalogFile='aml-kids/assets/kids-catalog.js';
const homeFile='aml-kids/index.html';
const myFile='aml-kids/my/index.html';

const errors=[];
const warnings=[];
const fail=msg=>errors.push(msg);
const warn=msg=>warnings.push(msg);

for(const file of [dataFile,indexFile,engineFile,cssFile,catalogFile,homeFile,myFile]){
  if(!fs.existsSync(file)) fail('missing '+file);
}

function evalGlobal(file,key){
  const src=fs.readFileSync(file,'utf8');
  const fake={};
  Function('window',src)(fake);
  return fake[key]||{};
}

let data={},catalog={};
try{ if(fs.existsSync(dataFile)) data=evalGlobal(dataFile,'AML_KIDS_VISUAL_DATA'); }
catch(err){ fail('visual-data.js cannot be evaluated: '+err.message); }
try{ if(fs.existsSync(catalogFile)) catalog=evalGlobal(catalogFile,'AML_KIDS_CATALOG'); }
catch(err){ fail('kids-catalog.js cannot be evaluated: '+err.message); }

if(Number(data.version||0)<2) fail('visual data schema must be version 2 or newer');
const scopes=data.scopes||{};
const scopeEntries=Object.entries(scopes);
if(!scopeEntries.length) fail('visual data scopes are empty');

for(const [scopeKey,qs] of scopeEntries){
  const parts=scopeKey.split('|');
  if(parts.length!==6){
    fail(scopeKey+': scope key must contain stage|grade|semester|subject|publisher|version');
    continue;
  }
  const [stage,gradeRaw,semester,subject,publisher,version]=parts;
  const grade=Number(gradeRaw);
  const matchingUnits=(catalog.units||[]).filter(u=>
    u.stage===stage&&u.grade===grade&&u.semester===semester&&
    u.subject===subject&&u.publisher===publisher&&u.version===version
  );
  if(!matchingUnits.length) fail(scopeKey+': no matching catalog edition');

  if(!Array.isArray(qs)){
    fail(scopeKey+': question array missing');
    continue;
  }
  if(qs.length!==10) fail(scopeKey+': expected 10 visual questions, found '+qs.length);

  const ids=new Set();
  const counts=[0,0,0,0];
  let last=-1,run=0,maxRun=0;

  qs.forEach((q,i)=>{
    const label=scopeKey+' q'+String(i+1).padStart(2,'0');
    for(const field of ['id','tag','q','svg','alt','caption','e']){
      if(typeof q[field]!=='string'||!q[field].trim()) fail(label+': missing '+field);
    }
    if(ids.has(q.id)) fail(scopeKey+': duplicate id '+q.id);
    ids.add(q.id);

    if(!Array.isArray(q.o)||q.o.length!==4){
      fail(label+': must have exactly 4 options');
    }else if(new Set(q.o.map(x=>String(x).trim())).size!==4){
      fail(label+': duplicate options');
    }

    if(!Number.isInteger(q.a)||q.a<0||q.a>3){
      fail(label+': invalid answer index');
    }else{
      counts[q.a]++;
      run=q.a===last?run+1:1;
      last=q.a;
      maxRun=Math.max(maxRun,run);
    }

    if(!String(q.svg||'').includes('<svg')) fail(label+': visual must contain SVG');
    if(String(q.alt||'').length<8) warn(label+': alt text may be too short');
    if(String(q.e||'').length<10) warn(label+': explanation may be too short');
  });

  const max=Math.max(...counts),min=Math.min(...counts);
  if(max-min>1) fail(scopeKey+': answer positions should stay balanced, found '+counts.join('/'));
  if(maxRun>2) fail(scopeKey+': same answer repeats '+maxRun+' times');
  console.log('PASS?',scopeKey,qs.length+' questions','A/B/C/D '+counts.join('/'),'max run '+maxRun);
}

if(fs.existsSync(indexFile)){
  const html=fs.readFileSync(indexFile,'utf8');
  for(const token of [
    'class="skip-link"',
    'aria-live="polite"',
    'fieldset class="answer-options"',
    'id="visual-description"',
    'id="version-back"',
    '../assets/kids-catalog.js'
  ]){
    if(!html.includes(token)) fail('visual index missing '+token);
  }
  if(html.includes('data-subject-link')) fail('visual page must not expose global cross-subject tabs');
  if(!html.includes('meta name="robots" content="noindex,nofollow"')) fail('visual index missing noindex,nofollow');
  const catalogAt=html.indexOf('../assets/kids-catalog.js');
  const dataAt=html.indexOf('visual-data.js');
  if(catalogAt<0||dataAt<0||catalogAt>dataAt) fail('catalog must load before visual data/engine');
}

if(fs.existsSync(engineFile)){
  const js=fs.readFileSync(engineFile,'utf8');
  for(const token of [
    "amlKidsVisualChallengeV2",
    "LEGACY_KEY='amlKidsVisualChallengeV1'",
    "const scopeKey=[scope.stage,scope.grade,scope.semester,scope.subject,scope.publisher,scope.version].join('|')",
    'DATA.scopes?.[scopeKey]',
    'scopeUnits=(CATALOG.units||[])',
    'function versionHomeUrl',
    'function updateProgressDisplay',
    'firstIncomplete',
    'function renderQuestionNav',
    "qs('#prev-question')",
    "fb.textContent='答錯了。",
    "fb.textContent='答對了。",
    'firstAttempt',
    'wrongEver',
    'function renderCompletionSummary',
    "className='review-wrong-btn'",
    "WALLET_KEY='amlKidsRewardWalletV1'",
    "POINTS_PER_QUESTION=5",
    "function grantReward",
    "awarded",
    "rewardMigrationV1",
    "這題 5 點之前已經取得",
    "訂正成功仍可取得 5 點"
  ]){
    if(!js.includes(token)) fail('visual engine missing '+token);
  }
  if(js.includes('const progress=index')) fail('visual progress must not use question index as completion count');
  if(js.includes("persist({completed:[],mistakes:[],wrongEver:[],firstAttempt:{},awarded:[]")) fail('restart must not clear awarded visual rewards');

}

if(fs.existsSync(cssFile)){
  const css=fs.readFileSync(cssFile,'utf8');
  if(/outline\s*:\s*none/i.test(css)) fail('outline:none is not allowed');
  if(!css.includes(':focus-visible')&&!css.includes(':focus{')&&!css.includes(':focus {')) fail('visible keyboard focus styling missing');
  if(!css.includes('prefers-reduced-motion')) fail('prefers-reduced-motion rule missing');
}

if(fs.existsSync(homeFile)){
  const home=fs.readFileSync(homeFile,'utf8');
  if(home.includes('visual-challenge-banner')) fail('AML Kids home must not expose a global visual challenge entry');
  if(/href=["']visual-challenges\//.test(home)) fail('AML Kids home must not link directly to unscoped visual challenge');
}

if(fs.existsSync(myFile)){
  const my=fs.readFileSync(myFile,'utf8');
  if(my.includes('id="visualProgress"')) fail('My AML Kids must not expose a standalone cross-version visual progress grid');
}

const versionPages=[
  'aml-kids/chinese-5a/index.html',
  'aml-kids/english-5a/index.html',
  'aml-kids/math-5a/index.html',
  'aml-kids/science-5a/index.html',
  'aml-kids/social-5a/index.html'
];
for(const file of versionPages){
  if(!fs.existsSync(file)){fail('missing '+file);continue;}
  const html=fs.readFileSync(file,'utf8');
  const link=html.match(/href="([^"]*visual-challenges\/\?[^"]+)"/)?.[1]||'';
  if(!link){
    fail(file+': version-scoped visual challenge link missing');
    continue;
  }
  for(const param of ['stage=','grade=','semester=','subject=','publisher=','version=']){
    if(!link.includes(param)) fail(file+': visual link missing '+param);
  }
}

warnings.forEach(x=>console.warn('WARN:',x));
if(errors.length){
  errors.forEach(x=>console.error('FAIL:',x));
  process.exit(1);
}
console.log('PASS: AML Kids edition-scoped visual challenge QA passed.');
