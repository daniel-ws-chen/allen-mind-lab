import fs from 'node:fs';

const dataFile='aml-kids/visual-challenges/visual-data.js';
const indexFile='aml-kids/visual-challenges/index.html';
const engineFile='aml-kids/visual-challenges/visual-challenges.js';
const cssFile='aml-kids/visual-challenges/visual-challenges.css';

const errors=[];
const warnings=[];

function fail(msg){errors.push(msg)}
function warn(msg){warnings.push(msg)}

for(const file of [dataFile,indexFile,engineFile,cssFile]){
  if(!fs.existsSync(file)) fail('missing '+file);
}

let data={};
if(fs.existsSync(dataFile)){
  const src=fs.readFileSync(dataFile,'utf8');
  const fake={};
  try{
    Function('window',src)(fake);
    data=fake.AML_KIDS_VISUAL_DATA||{};
  }catch(err){
    fail('visual-data.js cannot be evaluated: '+err.message);
  }
}

const expected=['chinese','english','math','science','social'];
for(const subject of expected){
  const qs=data[subject];
  if(!Array.isArray(qs)){
    fail(subject+': question array missing');
    continue;
  }
  if(qs.length!==10) fail(subject+': expected 10 questions, found '+qs.length);
  const ids=new Set();
  const counts=[0,0,0,0];
  let last=-1,run=0,maxRun=0;

  qs.forEach((q,i)=>{
    const label=subject+' q'+String(i+1).padStart(2,'0');
    for(const field of ['id','tag','q','svg','alt','caption','e']){
      if(typeof q[field]!=='string'||!q[field].trim()) fail(label+': missing '+field);
    }
    if(ids.has(q.id)) fail(subject+': duplicate id '+q.id);
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
  if(max-min>1) fail(subject+': answer positions should stay balanced, found '+counts.join('/'));
  if(maxRun>2) fail(subject+': same answer repeats '+maxRun+' times');
  console.log('PASS?',subject,qs.length+' questions','A/B/C/D '+counts.join('/'),'max run '+maxRun);
}

if(fs.existsSync(indexFile)){
  const html=fs.readFileSync(indexFile,'utf8');
  for(const token of ['class="skip-link"','aria-live="polite"','fieldset class="answer-options"','id="visual-description"']){
    if(!html.includes(token)) fail('index.html missing '+token);
  }
  if(!html.includes('meta name="robots" content="noindex,nofollow"')) fail('index.html missing noindex,nofollow');
}

if(fs.existsSync(engineFile)){
  const js=fs.readFileSync(engineFile,'utf8');
  if(!js.includes("amlKidsVisualChallengeV1")) fail('visual progress storage key missing');
  if(!js.includes("input[name=\"visual-answer\"]:checked")) fail('radio answer handling missing');
  if(!js.includes("localStorage")) fail('independent progress persistence missing');
  if(!js.includes('function updateProgressDisplay')) fail('visual challenge must use saved completion count for progress');
  if(js.includes('const progress=index')) fail('visual progress must not use question index as completion count');
  if(!js.includes('firstIncomplete')) fail('completion flow must return to unfinished questions instead of showing a false completion state');
  if(!js.includes('function renderQuestionNav')) fail('visual challenge must expose direct question-number navigation');
  if(!js.includes("qs('#prev-question')")) fail('visual challenge previous-question control missing');
  if(!js.includes("fb.textContent='答錯了。")) fail('visual challenge must explicitly announce an incorrect answer');
  if(!js.includes("fb.textContent='答對了。")) fail('visual challenge must explicitly announce a correct answer');
}

if(fs.existsSync(cssFile)){
  const css=fs.readFileSync(cssFile,'utf8');
  if(/outline\s*:\s*none/i.test(css)) fail('outline:none is not allowed');
  if(!css.includes(':focus-visible')&&!css.includes(':focus{')&&!css.includes(':focus {')) fail('visible keyboard focus styling missing');
  if(!css.includes('prefers-reduced-motion')) fail('prefers-reduced-motion rule missing');
}

warnings.forEach(x=>console.warn('WARN:',x));
if(errors.length){
  errors.forEach(x=>console.error('FAIL:',x));
  process.exit(1);
}
console.log('PASS: AML Kids visual challenge QA passed.');
