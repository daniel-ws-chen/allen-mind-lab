const WALLET_KEY='amlKidsRewardWalletV1';

const units=[
  {subject:'國文',title:'品格小學堂',url:'../chinese-5a/unit1/',awards:'amlKidsChinese5aU1AwardsV1',mistakes:'amlKidsChinese5aU1MistakesV1'},
  {subject:'國文',title:'自然筆記',url:'../chinese-5a/unit2/',awards:'amlKidsChinese5aU2AwardsV1',mistakes:'amlKidsChinese5aU2MistakesV1'},
  {subject:'國文',title:'用心看世界',url:'../chinese-5a/unit3/',awards:'amlKidsChinese5aU3AwardsV1',mistakes:'amlKidsChinese5aU3MistakesV1'},
  {subject:'國文',title:'作家風華',url:'../chinese-5a/unit4/',awards:'amlKidsChinese5aU4AwardsV1',mistakes:'amlKidsChinese5aU4MistakesV1'},

  {subject:'社會',title:'臺灣的位置與先民足跡',url:'../social-5a/',awards:'amlKidsSocial5aU1AwardsV5',mistakes:'amlKidsSocial5aU1MistakesV5'},
  {subject:'社會',title:'臺灣登上國際舞臺',url:'../social-5a/unit2/',awards:'amlKidsSocial5aU2AwardsV1',mistakes:'amlKidsSocial5aU2MistakesV1'},
  {subject:'社會',title:'成為清帝國的領土',url:'../social-5a/unit3/',awards:'amlKidsSocial5aU3AwardsV1',mistakes:'amlKidsSocial5aU3MistakesV1'},
  {subject:'社會',title:'土地的利用與變遷',url:'../social-5a/unit4/',awards:'amlKidsSocial5aU4AwardsV1',mistakes:'amlKidsSocial5aU4MistakesV1'},
  {subject:'社會',title:'製作小書看見臺灣',url:'../social-5a/unit5/',awards:'amlKidsSocial5aU5AwardsV1',mistakes:'amlKidsSocial5aU5MistakesV1'},

  {subject:'自然',title:'動物世界',url:'../science-5a/unit1/',awards:'amlKidsScience5aU1AwardsV1',mistakes:'amlKidsScience5aU1MistakesV1'},
  {subject:'自然',title:'探索聲光世界',url:'../science-5a/unit2/',awards:'amlKidsScience5aU2AwardsV1',mistakes:'amlKidsScience5aU2MistakesV1'},
  {subject:'自然',title:'神祕的天空',url:'../science-5a/unit3/',awards:'amlKidsScience5aU3AwardsV1',mistakes:'amlKidsScience5aU3MistakesV1'},
  {subject:'自然',title:'燃燒與生鏽',url:'../science-5a/unit4/',awards:'amlKidsScience5aU4AwardsV1',mistakes:'amlKidsScience5aU4MistakesV1'},

  {subject:'英文',title:'What Day Is Today?',url:'../english-5a/unit1/',awards:'amlKidsEnglish5aU1AwardsV1',mistakes:'amlKidsEnglish5aU1MistakesV1'},
  {subject:'英文',title:'Do You Have PE Class on Monday?',url:'../english-5a/unit2/',awards:'amlKidsEnglish5aU2AwardsV1',mistakes:'amlKidsEnglish5aU2MistakesV1'},
  {subject:'英文',title:'Where Are You Going?',url:'../english-5a/unit3/',awards:'amlKidsEnglish5aU3AwardsV1',mistakes:'amlKidsEnglish5aU3MistakesV1'},
  {subject:'英文',title:'How Many Koalas Are There?',url:'../english-5a/unit4/',awards:'amlKidsEnglish5aU4AwardsV1',mistakes:'amlKidsEnglish5aU4MistakesV1'},

  {subject:'數學',title:'多位小數與加減',url:'../math-5a/unit1/',awards:'amlKidsMath5aU1AwardsV1',mistakes:'amlKidsMath5aU1MistakesV1'},
  {subject:'數學',title:'因數與公因數',url:'../math-5a/unit2/',awards:'amlKidsMath5aU2AwardsV1',mistakes:'amlKidsMath5aU2MistakesV1'},
  {subject:'數學',title:'倍數與公倍數',url:'../math-5a/unit3/',awards:'amlKidsMath5aU3AwardsV1',mistakes:'amlKidsMath5aU3MistakesV1'},
  {subject:'數學',title:'擴分、約分與通分',url:'../math-5a/unit4/',awards:'amlKidsMath5aU4AwardsV1',mistakes:'amlKidsMath5aU4MistakesV1'},
  {subject:'數學',title:'多邊形與扇形',url:'../math-5a/unit5/',awards:'amlKidsMath5aU5AwardsV1',mistakes:'amlKidsMath5aU5MistakesV1'},
  {subject:'數學',title:'異分母分數的加減',url:'../math-5a/unit6/',awards:'amlKidsMath5aU6AwardsV1',mistakes:'amlKidsMath5aU6MistakesV1'},
  {subject:'數學',title:'線對稱圖形',url:'../math-5a/unit7/',awards:'amlKidsMath5aU7AwardsV1',mistakes:'amlKidsMath5aU7MistakesV1'},
  {subject:'數學',title:'整數四則運算',url:'../math-5a/unit8/',awards:'amlKidsMath5aU8AwardsV1',mistakes:'amlKidsMath5aU8MistakesV1'},
  {subject:'數學',title:'面積',url:'../math-5a/unit9/',awards:'amlKidsMath5aU9AwardsV1',mistakes:'amlKidsMath5aU9MistakesV1'},
  {subject:'數學',title:'柱體、錐體和球',url:'../math-5a/unit10/',awards:'amlKidsMath5aU10AwardsV1',mistakes:'amlKidsMath5aU10MistakesV1'}
];

function readArray(key){
  try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x:[];}catch{return [];}
}
function stats(unit){
  const awards=new Set(readArray(unit.awards));
  const mistakes=readArray(unit.mistakes);
  const pending=mistakes.filter(m=>!awards.has(m.id)).length;
  return {...unit,done:awards.size,pending,complete:awards.size>=50};
}

const data=units.map(stats);
const totalPoints=Number(localStorage.getItem(WALLET_KEY)||0);
const totalDone=data.reduce((a,u)=>a+Math.min(50,u.done),0);
const totalPending=data.reduce((a,u)=>a+u.pending,0);
const completeUnits=data.filter(u=>u.complete).length;

document.getElementById('totalPoints').textContent=totalPoints.toLocaleString();
document.getElementById('completedUnits').textContent=completeUnits+' / '+units.length;
document.getElementById('completedQuestions').textContent=totalDone+' / '+(units.length*50);
document.getElementById('pendingMistakes').textContent=totalPending;

const inProgress=data.find(u=>u.done>0&&!u.complete);
if(inProgress){
  document.getElementById('continueSection').hidden=false;
  document.getElementById('continueText').textContent=inProgress.subject+'｜'+inProgress.title+'，目前完成 '+inProgress.done+' / 50 題。';
  const link=document.getElementById('continueLink');
  link.href=inProgress.url+'#challenge';
  link.textContent='繼續 '+inProgress.subject+' →';
}

const subjectOrder=['國文','社會','自然','英文','數學'];
const wrap=document.getElementById('subjectProgress');
subjectOrder.forEach(subject=>{
  const list=data.filter(u=>u.subject===subject);
  const done=list.reduce((a,u)=>a+Math.min(50,u.done),0);
  const max=list.length*50;
  const complete=list.filter(u=>u.complete).length;
  const article=document.createElement('article');
  article.className='subject-progress-card';
  article.innerHTML=
    '<div class="subject-progress-head"><div><span class="section-kicker">'+subject+'</span><h3>'+complete+' / '+list.length+' 單元完成</h3></div><strong>'+done+' / '+max+' 題</strong></div>'+
    '<div class="progress-line" role="progressbar" aria-label="'+subject+'完成度" aria-valuemin="0" aria-valuemax="'+max+'" aria-valuenow="'+done+'"><div class="progress-fill" style="width:'+Math.round(done/max*100)+'%"></div></div>'+
    '<div class="unit-mini-grid">'+list.map(u=>
      '<a class="unit-mini" href="'+u.url+'"><span><strong>'+u.title+'</strong><small>'+u.done+' / 50 題'+(u.pending?' · 待訂正 '+u.pending:'')+'</small></span><span aria-hidden="true">'+(u.complete?'✓':'→')+'</span></a>'
    ).join('')+'</div>';
  wrap.appendChild(article);
});
