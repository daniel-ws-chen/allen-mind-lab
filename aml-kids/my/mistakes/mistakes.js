const units=[
  {subject:'國文',title:'品格小學堂',url:'../../chinese-5a/unit1/',awards:'amlKidsChinese5aU1AwardsV1',mistakes:'amlKidsChinese5aU1MistakesV1'},
  {subject:'國文',title:'自然筆記',url:'../../chinese-5a/unit2/',awards:'amlKidsChinese5aU2AwardsV1',mistakes:'amlKidsChinese5aU2MistakesV1'},
  {subject:'國文',title:'用心看世界',url:'../../chinese-5a/unit3/',awards:'amlKidsChinese5aU3AwardsV1',mistakes:'amlKidsChinese5aU3MistakesV1'},
  {subject:'國文',title:'作家風華',url:'../../chinese-5a/unit4/',awards:'amlKidsChinese5aU4AwardsV1',mistakes:'amlKidsChinese5aU4MistakesV1'},

  {subject:'社會',title:'臺灣的位置與先民足跡',url:'../../social-5a/',awards:'amlKidsSocial5aU1AwardsV5',mistakes:'amlKidsSocial5aU1MistakesV5'},
  {subject:'社會',title:'臺灣登上國際舞臺',url:'../../social-5a/unit2/',awards:'amlKidsSocial5aU2AwardsV1',mistakes:'amlKidsSocial5aU2MistakesV1'},
  {subject:'社會',title:'成為清帝國的領土',url:'../../social-5a/unit3/',awards:'amlKidsSocial5aU3AwardsV1',mistakes:'amlKidsSocial5aU3MistakesV1'},
  {subject:'社會',title:'土地的利用與變遷',url:'../../social-5a/unit4/',awards:'amlKidsSocial5aU4AwardsV1',mistakes:'amlKidsSocial5aU4MistakesV1'},
  {subject:'社會',title:'製作小書看見臺灣',url:'../../social-5a/unit5/',awards:'amlKidsSocial5aU5AwardsV1',mistakes:'amlKidsSocial5aU5MistakesV1'},

  {subject:'自然',title:'動物世界',url:'../../science-5a/unit1/',awards:'amlKidsScience5aU1AwardsV1',mistakes:'amlKidsScience5aU1MistakesV1'},
  {subject:'自然',title:'探索聲光世界',url:'../../science-5a/unit2/',awards:'amlKidsScience5aU2AwardsV1',mistakes:'amlKidsScience5aU2MistakesV1'},
  {subject:'自然',title:'神祕的天空',url:'../../science-5a/unit3/',awards:'amlKidsScience5aU3AwardsV1',mistakes:'amlKidsScience5aU3MistakesV1'},
  {subject:'自然',title:'燃燒與生鏽',url:'../../science-5a/unit4/',awards:'amlKidsScience5aU4AwardsV1',mistakes:'amlKidsScience5aU4MistakesV1'},

  {subject:'英文',title:'What Day Is Today?',url:'../../english-5a/unit1/',awards:'amlKidsEnglish5aU1AwardsV1',mistakes:'amlKidsEnglish5aU1MistakesV1'},
  {subject:'英文',title:'Do You Have PE Class on Monday?',url:'../../english-5a/unit2/',awards:'amlKidsEnglish5aU2AwardsV1',mistakes:'amlKidsEnglish5aU2MistakesV1'},
  {subject:'英文',title:'Where Are You Going?',url:'../../english-5a/unit3/',awards:'amlKidsEnglish5aU3AwardsV1',mistakes:'amlKidsEnglish5aU3MistakesV1'},
  {subject:'英文',title:'How Many Koalas Are There?',url:'../../english-5a/unit4/',awards:'amlKidsEnglish5aU4AwardsV1',mistakes:'amlKidsEnglish5aU4MistakesV1'},

  {subject:'數學',title:'多位小數與加減',url:'../../math-5a/unit1/',awards:'amlKidsMath5aU1AwardsV1',mistakes:'amlKidsMath5aU1MistakesV1'},
  {subject:'數學',title:'因數與公因數',url:'../../math-5a/unit2/',awards:'amlKidsMath5aU2AwardsV1',mistakes:'amlKidsMath5aU2MistakesV1'},
  {subject:'數學',title:'倍數與公倍數',url:'../../math-5a/unit3/',awards:'amlKidsMath5aU3AwardsV1',mistakes:'amlKidsMath5aU3MistakesV1'},
  {subject:'數學',title:'擴分、約分與通分',url:'../../math-5a/unit4/',awards:'amlKidsMath5aU4AwardsV1',mistakes:'amlKidsMath5aU4MistakesV1'},
  {subject:'數學',title:'多邊形與扇形',url:'../../math-5a/unit5/',awards:'amlKidsMath5aU5AwardsV1',mistakes:'amlKidsMath5aU5MistakesV1'},
  {subject:'數學',title:'異分母分數的加減',url:'../../math-5a/unit6/',awards:'amlKidsMath5aU6AwardsV1',mistakes:'amlKidsMath5aU6MistakesV1'},
  {subject:'數學',title:'線對稱圖形',url:'../../math-5a/unit7/',awards:'amlKidsMath5aU7AwardsV1',mistakes:'amlKidsMath5aU7MistakesV1'},
  {subject:'數學',title:'整數四則運算',url:'../../math-5a/unit8/',awards:'amlKidsMath5aU8AwardsV1',mistakes:'amlKidsMath5aU8MistakesV1'},
  {subject:'數學',title:'面積',url:'../../math-5a/unit9/',awards:'amlKidsMath5aU9AwardsV1',mistakes:'amlKidsMath5aU9MistakesV1'},
  {subject:'數學',title:'柱體、錐體和球',url:'../../math-5a/unit10/',awards:'amlKidsMath5aU10AwardsV1',mistakes:'amlKidsMath5aU10MistakesV1'}
];

function readArray(key){
  try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[];}catch{return [];}
}

const mistakes=[];
units.forEach(unit=>{
  const awards=new Set(readArray(unit.awards));
  readArray(unit.mistakes).forEach((m,index)=>{
    mistakes.push({
      subject:unit.subject,
      unit:unit.title,
      url:unit.url,
      id:m.id||('m'+index),
      text:m.text||'這題曾經答錯，請回原單元重新挑戰。',
      level:m.level||'未分類',
      corrected:awards.has(m.id)
    });
  });
});

const all=mistakes.length;
const corrected=mistakes.filter(m=>m.corrected).length;
const pending=all-corrected;
document.getElementById('allMistakes').textContent=all;
document.getElementById('pendingMistakes').textContent=pending;
document.getElementById('correctedMistakes').textContent=corrected;

let statusFilter='pending';
let subjectFilter='全部';

function render(){
  let list=mistakes;
  if(statusFilter==='pending') list=list.filter(m=>!m.corrected);
  else if(statusFilter==='corrected') list=list.filter(m=>m.corrected);
  if(subjectFilter!=='全部') list=list.filter(m=>m.subject===subjectFilter);

  const wrap=document.getElementById('mistakeList');
  wrap.innerHTML='';
  if(!list.length){
    const empty=document.createElement('div');
    empty.className='empty-state';
    empty.innerHTML='<strong>目前沒有符合條件的錯題 🎉</strong><p>可以換一個篩選條件，或回 AML Kids 繼續挑戰。</p>';
    wrap.appendChild(empty);
    return;
  }

  list.forEach(m=>{
    const card=document.createElement('article');
    card.className='mistake-card'+(m.corrected?' corrected':'');
    const meta=document.createElement('div');
    meta.className='mistake-meta';
    [m.subject,m.unit,m.level,m.corrected?'已訂正':'待訂正'].forEach(x=>{
      const chip=document.createElement('span');
      chip.className='mistake-chip';
      chip.textContent=x;
      meta.appendChild(chip);
    });
    const title=document.createElement('h3');
    title.textContent=m.text;
    const note=document.createElement('p');
    note.textContent=m.corrected?'這題已經重新答對，可以保留作為複習紀錄。':'回到原單元重新挑戰，答對後會自動更新為已訂正。';
    const link=document.createElement('a');
    link.className='mistake-link';
    link.href=m.url+'#challenge';
    link.textContent=m.corrected?'回單元再複習 →':'回單元重新挑戰 →';
    card.append(meta,title,note,link);
    wrap.appendChild(card);
  });
}

document.querySelectorAll('[data-status]').forEach(btn=>btn.addEventListener('click',()=>{
  statusFilter=btn.dataset.status;
  document.querySelectorAll('[data-status]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  render();
}));

document.querySelectorAll('[data-subject]').forEach(btn=>btn.addEventListener('click',()=>{
  subjectFilter=btn.dataset.subject;
  document.querySelectorAll('[data-subject]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  render();
}));

render();
