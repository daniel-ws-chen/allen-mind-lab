const stageSelect=document.getElementById('learningStage');
const gradeSelect=document.getElementById('learningGrade');
const statusEl=document.getElementById('selectorStatus');
const titleEl=document.getElementById('selectorTitle');
const noteEl=document.getElementById('selectorNote');
const actionEl=document.getElementById('selectorAction');
const catalog=window.AML_KIDS_CATALOG||{units:[],subjects:[],questionsPerUnit:50};

const stageForGrade=n=>n<=6?'國小':n<=9?'國中':'高中';
const gradeName=n=>['','一年級','二年級','三年級','四年級','五年級','六年級','七年級','八年級','九年級','十年級','十一年級','十二年級'][n];
const semesterOrder=['上學期','下學期'];

function unitsFor(stage,grade){
  return (catalog.units||[]).filter(unit=>unit.stage===stage&&Number(unit.grade)===grade);
}
function scopeSummary(units){
  const semesters=[...new Set(units.map(u=>u.semester))].sort((a,b)=>semesterOrder.indexOf(a)-semesterOrder.indexOf(b));
  const subjects=[...new Set(units.map(u=>u.subject))];
  const semesterText=semesters.length?semesters.join('、'):'目前';
  return {semesters,subjects,text:semesterText+'已有 '+subjects.length+' 科、'+units.length+' 個單元。'};
}
function updatePortalSummary(){
  const units=catalog.units||[];
  const subjects=[...new Set(units.map(u=>u.subject))];
  const qpu=Number(catalog.questionsPerUnit||50);
  const values={
    portalSubjectCount:subjects.length,
    portalUnitCount:units.length,
    portalQuestionCount:units.length*qpu,
    portalQuestionsPerUnit:qpu
  };
  Object.entries(values).forEach(([id,value])=>{
    const el=document.getElementById(id);
    if(el) el.textContent=Number(value).toLocaleString();
  });
}

function updateSelector(source){
  let grade=Number(gradeSelect.value||5);
  if(source==='grade'){
    stageSelect.value=stageForGrade(grade);
  }else if(source==='stage'){
    const ranges={國小:[1,6],國中:[7,9],高中:[10,12]};
    const [min,max]=ranges[stageSelect.value];
    if(grade<min||grade>max){
      const available=(catalog.units||[])
        .filter(u=>u.stage===stageSelect.value)
        .map(u=>Number(u.grade))
        .sort((a,b)=>a-b);
      grade=available[0]||min;
      gradeSelect.value=String(grade);
    }
  }

  const stage=stageSelect.value;
  const label=gradeName(grade);
  const available=unitsFor(stage,grade);
  titleEl.textContent=stage+label;

  if(available.length){
    const summary=scopeSummary(available);
    statusEl.textContent='已有內容';
    statusEl.classList.add('live');
    noteEl.textContent=summary.text;

    const current=catalog.currentScope;
    const matchesCurrent=current&&current.stage===stage&&Number(current.grade)===grade;
    if(matchesCurrent){
      actionEl.textContent='查看已開放內容 →';
      actionEl.href='#quick-title';
    }else{
      actionEl.textContent='從第一個單元開始 →';
      actionEl.href=available[0].url;
    }
  }else{
    statusEl.textContent='陸續建置中';
    statusEl.classList.remove('live');
    noteEl.textContent='這個年級目前尚未開放，可以先向 AML Kids 許願。';
    actionEl.textContent='前往許願 →';
    actionEl.href='wish/?stage='+encodeURIComponent(stage)+'&grade='+encodeURIComponent(label);
  }
}

stageSelect.addEventListener('change',()=>updateSelector('stage'));
gradeSelect.addEventListener('change',()=>updateSelector('grade'));
updatePortalSummary();
updateSelector('grade');
