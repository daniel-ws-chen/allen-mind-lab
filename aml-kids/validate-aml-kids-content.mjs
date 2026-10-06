import fs from 'node:fs';
import path from 'node:path';

const ROOT=path.resolve(process.cwd(),'aml-kids');
const CATALOG_FILE=path.join(ROOT,'assets','kids-catalog.js');
const failures=[];
const warnings=[];
const unitReports=[];
const globalStemOwners=new Map();

function rel(file){return path.relative(process.cwd(),file).replaceAll('\\','/');}
function fail(file,msg){failures.push(rel(file)+': '+msg);}
function warn(file,msg){warnings.push(rel(file)+': '+msg);}
function localFromUrl(url){return path.join(process.cwd(),url.replace(/^\/+/, '').replaceAll('/',path.sep));}
function normalize(text){
  return String(text??'')
    .normalize('NFKC')
    .replace(/\s+/g,'')
    .replace(/[，。！？；：、,.!?;:'"「」『』（）()【】\[\]<>《》]/g,'')
    .toLowerCase();
}
function visibleLength(text){return normalize(text).length;}

if(!fs.existsSync(CATALOG_FILE)){
  fail(ROOT,'missing assets/kids-catalog.js');
}else{
  const catalogText=fs.readFileSync(CATALOG_FILE,'utf8');
  const questionsPerUnit=Number(catalogText.match(/questionsPerUnit:\s*(\d+)/)?.[1]||50);
  const unitLines=catalogText.split('\n').map(x=>x.trim()).filter(x=>x.startsWith('{stage:')&&x.includes("unit:'"));
  const field=(line,name)=>{
    const m=line.match(new RegExp(name+":'([^']*)'"));
    return m?m[1]:'';
  };

  const units=unitLines.map(line=>({
    subject:field(line,'subject'),
    publisher:field(line,'publisher'),
    version:field(line,'version'),
    unit:field(line,'unit'),
    title:field(line,'title'),
    script:field(line,'script')
  }));

  for(const unit of units){
    const scriptFile=localFromUrl(unit.script);
    if(!fs.existsSync(scriptFile)){
      fail(CATALOG_FILE,'missing question script: '+unit.script);
      continue;
    }

    const text=fs.readFileSync(scriptFile,'utf8');
    const qBlock=text.match(/const questions=\[(.*?)\];/s);
    if(!qBlock){
      fail(scriptFile,'questions array not found');
      continue;
    }

    let questions;
    try{
      questions=JSON.parse('['+qBlock[1]+']');
    }catch(error){
      fail(scriptFile,'questions array is not valid JSON-like data: '+error.message);
      continue;
    }

    const unitLabel=[unit.subject,unit.publisher,unit.version,unit.unit,unit.title].filter(Boolean).join('｜');
    if(questions.length!==questionsPerUnit){
      fail(scriptFile,'expected '+questionsPerUnit+' questions, found '+questions.length);
    }

    const ids=new Set();
    const stems=new Map();
    const answerCounts=[];
    let longestAnswerRun=0;
    let currentRun=0;
    let lastAnswer=null;
    let shortStemCount=0;
    let shortExplanationCount=0;
    let qualityShortExplanationCount=0;
    let answerLengthCueCount=0;
    const levelCounts={基礎:0,進階:0,素養:0};
    let duplicateStemCount=0;
    let duplicateOptionCount=0;
    let invalidQuestionCount=0;

    questions.forEach((q,index)=>{
      const position=index+1;
      const expectedId='q'+String(position).padStart(2,'0');

      if(!q||typeof q!=='object'||Array.isArray(q)){
        fail(scriptFile,'question '+position+' is not an object');
        invalidQuestionCount++;
        return;
      }

      for(const key of ['id','level','q','o','a','e']){
        if(q[key]===undefined||q[key]===null||q[key]===''){
          fail(scriptFile,(q.id||expectedId)+' missing field '+key);
          invalidQuestionCount++;
        }
      }

      if(typeof q.id!=='string'||!/^q\d{2}$/.test(q.id)){
        fail(scriptFile,expectedId+' has invalid id '+String(q.id));
      }else{
        if(ids.has(q.id)) fail(scriptFile,'duplicate question id '+q.id);
        ids.add(q.id);
        if(q.id!==expectedId) warn(scriptFile,'question order '+position+' uses '+q.id+'; expected '+expectedId);
      }

      if(!['基礎','進階','素養'].includes(q.level)){
        fail(scriptFile,(q.id||expectedId)+' has unsupported level '+String(q.level));
      }else{
        levelCounts[q.level]++;
      }

      if(!Array.isArray(q.o)||q.o.length!==4){
        fail(scriptFile,(q.id||expectedId)+' must have exactly 4 answer choices');
      }else{
        const normalizedOptions=q.o.map(normalize);
        if(normalizedOptions.some(x=>!x)){
          fail(scriptFile,(q.id||expectedId)+' contains an empty option');
        }
        if(new Set(normalizedOptions).size!==normalizedOptions.length){
          warn(scriptFile,(q.id||expectedId)+' contains duplicate or near-identical options');
          duplicateOptionCount++;
        }
      }

      if(!Number.isInteger(q.a)||!Array.isArray(q.o)||q.a<0||q.a>=q.o.length){
        fail(scriptFile,(q.id||expectedId)+' has answer index outside option range');
      }else{
        answerCounts[q.a]=(answerCounts[q.a]||0)+1;
        if(q.a===lastAnswer) currentRun++;
        else currentRun=1;
        longestAnswerRun=Math.max(longestAnswerRun,currentRun);
        lastAnswer=q.a;
      }

      const stem=normalize(q.q);
      if(stem){
        if(stems.has(stem)){
          warn(scriptFile,(q.id||expectedId)+' repeats the same question stem as '+stems.get(stem));
          duplicateStemCount++;
        }else{
          stems.set(stem,q.id||expectedId);
        }

        if(!globalStemOwners.has(stem)) globalStemOwners.set(stem,[]);
        globalStemOwners.get(stem).push({script:scriptFile,id:q.id||expectedId,label:unitLabel});
      }

      if(visibleLength(q.q)<6) shortStemCount++;
      if(visibleLength(q.e)<6) shortExplanationCount++;
      if(visibleLength(q.e)<10) qualityShortExplanationCount++;

      if(Array.isArray(q.o)&&q.o.length===4&&Number.isInteger(q.a)&&q.a>=0&&q.a<4){
        const lengths=q.o.map(visibleLength);
        const correctLength=lengths[q.a];
        const otherLengths=lengths.filter((_,i)=>i!==q.a);
        const otherAverage=otherLengths.reduce((sum,n)=>sum+n,0)/otherLengths.length;
        const otherMax=Math.max(...otherLengths);
        if(correctLength>=10&&correctLength>=otherAverage*1.7&&correctLength-otherMax>=4){
          answerLengthCueCount++;
        }
      }

      if(normalize(q.q)&&normalize(q.q)===normalize(q.e)){
        warn(scriptFile,(q.id||expectedId)+' explanation repeats the question instead of explaining the answer');
      }
    });

    const validAnswerTotal=answerCounts.reduce((a,b)=>a+(b||0),0);
    const maxAnswerCount=Math.max(0,...answerCounts.map(x=>x||0));
    const maxAnswerRatio=validAnswerTotal?maxAnswerCount/validAnswerTotal:0;
    if(questionsPerUnit===50&&(levelCounts.基礎!==20||levelCounts.進階!==20||levelCounts.素養!==10)){
      fail(scriptFile,'question mix should be 20/20/10, found '+levelCounts.基礎+'/'+levelCounts.進階+'/'+levelCounts.素養);
    }

    const nonzeroAnswerCounts=answerCounts.map(x=>x||0);
    const answerSpread=Math.max(...nonzeroAnswerCounts)-Math.min(...nonzeroAnswerCounts);
    if(maxAnswerRatio>=0.7){
      warn(scriptFile,'answer distribution is highly concentrated: '+answerCounts.map((n,i)=>String.fromCharCode(65+i)+'='+(n||0)).join(', ')+'; largest share '+Math.round(maxAnswerRatio*100)+'%');
    }else if(answerSpread>2){
      warn(scriptFile,'answer positions are imbalanced: '+nonzeroAnswerCounts.map((n,i)=>String.fromCharCode(65+i)+'='+(n||0)).join(', '));
    }
    if(longestAnswerRun>=4){
      warn(scriptFile,'same answer index appears '+longestAnswerRun+' questions in a row');
    }
    if(shortStemCount>=Math.ceil(questions.length*0.2)){
      warn(scriptFile,shortStemCount+' questions have very short stems; review whether enough context is provided');
    }
    if(shortExplanationCount>=Math.ceil(questions.length*0.2)){
      warn(scriptFile,shortExplanationCount+' explanations are very short; review whether feedback teaches the concept');
    }
    if(qualityShortExplanationCount>0){
      warn(scriptFile,qualityShortExplanationCount+' explanations are under the current QA target of 10 visible characters');
    }
    if(answerLengthCueCount>0){
      warn(scriptFile,answerLengthCueCount+' questions may cue the answer because the correct option is much longer than distractors');
    }

    unitReports.push({
      label:unitLabel,
      questions:questions.length,
      answers:answerCounts.map(x=>x||0),
      longestAnswerRun,
      shortStemCount,
      shortExplanationCount,
      qualityShortExplanationCount,
      answerLengthCueCount,
      levelCounts,
      duplicateStemCount,
      duplicateOptionCount,
      invalidQuestionCount
    });
  }

  for(const [stem,owners] of globalStemOwners){
    if(owners.length<2) continue;
    const uniqueScripts=[...new Set(owners.map(x=>x.script))];
    if(uniqueScripts.length<2) continue;
    const sample=owners.slice(0,4).map(x=>x.label+' '+x.id).join(' / ');
    warn(ROOT,'same normalized question stem appears across units: '+sample+(owners.length>4?' / …':''));
  }
}

console.log('AML Kids Content QA');
console.log('Units checked: '+unitReports.length);
console.log('Questions checked: '+unitReports.reduce((sum,u)=>sum+u.questions,0));

for(const report of unitReports){
  console.log(
    '- '+report.label+
    ' | answers '+report.answers.map((n,i)=>String.fromCharCode(65+i)+':'+n).join(' ')+
    ' | longest run '+report.longestAnswerRun+
    ' | short stems '+report.shortStemCount+
    ' | short explanations '+report.shortExplanationCount+
    ' | QA<10 '+report.qualityShortExplanationCount+
    ' | length cues '+report.answerLengthCueCount+
    ' | levels '+report.levelCounts.基礎+'/'+report.levelCounts.進階+'/'+report.levelCounts.素養+
    ' | duplicate stems '+report.duplicateStemCount+
    ' | duplicate options '+report.duplicateOptionCount
  );
}

if(warnings.length){
  console.log('\nWarnings:');
  warnings.forEach(x=>console.log('  - '+x));
}
if(failures.length){
  console.error('\nFailures:');
  failures.forEach(x=>console.error('  - '+x));
  process.exitCode=1;
}else{
  console.log('\nPASS: no blocking content-structure issues found.');
  if(warnings.length) console.log('Review warnings before treating the question bank as content-QA complete.');
}
