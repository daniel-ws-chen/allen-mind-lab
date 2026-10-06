const stageSelect=document.getElementById('learningStage');
const gradeSelect=document.getElementById('learningGrade');
const statusEl=document.getElementById('selectorStatus');
const titleEl=document.getElementById('selectorTitle');
const noteEl=document.getElementById('selectorNote');
const actionEl=document.getElementById('selectorAction');

const stageForGrade=n=>n<=6?'國小':n<=9?'國中':'高中';
const gradeName=n=>['','一年級','二年級','三年級','四年級','五年級','六年級','七年級','八年級','九年級','十年級','十一年級','十二年級'][n];

function updateSelector(source){
  let grade=Number(gradeSelect.value||5);
  if(source==='grade'){
    stageSelect.value=stageForGrade(grade);
  }else if(source==='stage'){
    const ranges={國小:[1,6],國中:[7,9],高中:[10,12]};
    const [min,max]=ranges[stageSelect.value];
    if(grade<min||grade>max){
      grade=min;
      gradeSelect.value=String(min);
    }
  }
  const stage=stageSelect.value;
  const label=gradeName(grade);
  titleEl.textContent=stage+label;

  if(stage==='國小'&&grade===5){
    statusEl.textContent='已有內容';
    statusEl.classList.add('live');
    noteEl.textContent='目前已完成五年級上學期 5 科複習內容。';
    actionEl.textContent='查看已開放內容 →';
    actionEl.href='#quick-title';
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
updateSelector('grade');
