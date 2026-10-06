import fs from 'node:fs';

const reports=[];
const errors=[];
const warnings=[];

function summarize(name, answers){
  const counts=[0,0,0,0];
  let last=-1, run=0, maxRun=0;
  answers.forEach(a=>{
    if(!Number.isInteger(a)||a<0||a>3){
      errors.push(`${name}: invalid answer index ${a}`);
      return;
    }
    counts[a]++;
    run=a===last?run+1:1;
    last=a;
    maxRun=Math.max(maxRun,run);
  });
  const total=answers.length;
  const max=Math.max(...counts);
  const min=Math.min(...counts);
  const ratio=total?max/total:0;

  if(total>=10 && ratio>0.5){
    errors.push(`${name}: one answer position exceeds 50% (${counts.join('/')})`);
  }
  if(total>=12 && counts.some(n=>n===0)){
    errors.push(`${name}: at least one answer position is unused (${counts.join('/')})`);
  }
  if(maxRun>=4){
    errors.push(`${name}: same answer repeats ${maxRun} times in a row`);
  }
  if(total>=10 && max-min>3){
    warnings.push(`${name}: answer-position spread is ${max-min} (${counts.join('/')})`);
  }

  reports.push({name,total,counts,maxRun,sequence:answers.map(a=>'ABCD'[a]).join('')});
}

function extractArray(file, re){
  const text=fs.readFileSync(file,'utf8');
  const m=text.match(re);
  if(!m) throw new Error(`${file}: question array not found`);
  return Function('"use strict";return ('+m[1]+')')();
}

function extractObject(file, re){
  const text=fs.readFileSync(file,'utf8');
  const m=text.match(re);
  if(!m) throw new Error(`${file}: question object not found`);
  return Function('"use strict";return ('+m[1].replace(/;$/,'')+')')();
}

try{
  const management=extractArray('management-self-study-quiz.js',/const qs\s*=\s*(\[[\s\S]*?\]);/);
  summarize('Management self-study final',management.map(q=>q.a));

  const pbs=extractArray('pbs-self-study-quiz.js',/const qs\s*=\s*(\[[\s\S]*?\]);/);
  summarize('PBS self-study final',pbs.map(q=>q.a));

  const managementLessons=extractObject('tools/management-self-study/management-self-study-challenge.js',/const lessons\s*=\s*(\{[\s\S]*?\n\});/);
  summarize('Management lesson quizzes',Object.values(managementLessons).flatMap(x=>x.qs.map(q=>q.a)));

  const pbsLessons=extractObject('tools/pbs-interactive/pbs-interactive.js',/const lessons\s*=\s*(\{[\s\S]*?\n\s*\});/);
  summarize('PBS lesson quizzes',Object.values(pbsLessons).flatMap(x=>x.questions.map(q=>q.a)));

  const managementGames=extractObject('tools/management-interactive/management-interactive.js',/const games\s*=\s*(\{[\s\S]*?\n\s*\};)/);
  summarize('Management interactive',Object.values(managementGames).flatMap(x=>x.qs.map(q=>q.a)));
}catch(err){
  errors.push(String(err.message||err));
}

for(const r of reports){
  console.log(
    `PASS? ${r.name}: ${r.total} questions | A/B/C/D ${r.counts.join('/')} | max run ${r.maxRun} | ${r.sequence}`
  );
}
warnings.forEach(x=>console.warn('WARN:',x));

if(errors.length){
  errors.forEach(x=>console.error('FAIL:',x));
  process.exit(1);
}
console.log('PASS: AML quiz answer-position QA passed.');
