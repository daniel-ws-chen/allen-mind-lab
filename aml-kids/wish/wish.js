const EMAIL='daniel.ws.chen@gmail.com';
const stage=document.getElementById('stage');
const grade=document.getElementById('grade');
const semester=document.getElementById('semester');
const subject=document.getElementById('subject');
const version=document.getElementById('version');
const unit=document.getElementById('unit');
const need=document.getElementById('need');
const statusLine=document.getElementById('wishStatus');

const stageForGrade=label=>{
  const map={
    '一年級':'國小','二年級':'國小','三年級':'國小','四年級':'國小','五年級':'國小','六年級':'國小',
    '七年級':'國中','八年級':'國中','九年級':'國中',
    '十年級':'高中','十一年級':'高中','十二年級':'高中'
  };
  return map[label]||'';
};

grade.addEventListener('change',()=>{
  const inferred=stageForGrade(grade.value);
  if(inferred) stage.value=inferred;
});

stage.addEventListener('change',()=>{
  const current=stageForGrade(grade.value);
  if(grade.value && current!==stage.value) grade.value='';
});

const params=new URLSearchParams(location.search);
if(params.get('stage')) stage.value=params.get('stage');
if(params.get('grade')){grade.value=params.get('grade');const inferred=stageForGrade(grade.value);if(inferred)stage.value=inferred;}
if(params.get('semester')) semester.value=params.get('semester');
if(params.get('subject')) subject.value=params.get('subject');
if(params.get('version')) version.value=params.get('version');
if(params.get('unit')) unit.value=params.get('unit');

function wishText(){
  return [
    '【AML Kids 學習內容許願】',
    '教育階段：'+(stage.value||'未填'),
    '年級：'+(grade.value||'未填'),
    '學期：'+(semester.value||'未填'),
    '科目：'+(subject.value||'未填'),
    '教材版本／出版社：'+(version.value||'未填'),
    '希望優先的單元／主題：'+(unit.value||'未填'),
    '',
    '希望 AML Kids 怎麼幫我：',
    need.value.trim()||'未填'
  ].join('\n');
}

document.getElementById('kidsWishForm').addEventListener('submit',e=>{
  e.preventDefault();
  if(!e.currentTarget.reportValidity()) return;
  const title='AML Kids 許願｜'+grade.value+' '+subject.value+' '+(version.value||'未指定版本');
  location.href='mailto:'+EMAIL+'?subject='+encodeURIComponent(title)+'&body='+encodeURIComponent(wishText());
  statusLine.textContent='已準備好願望內容，請在郵件程式中確認後寄出。';
});

document.getElementById('copyWish').addEventListener('click',async()=>{
  try{
    await navigator.clipboard.writeText(wishText());
    statusLine.textContent='願望內容已複製。';
  }catch{
    statusLine.textContent='無法自動複製，請改用「寄出願望」。';
  }
});