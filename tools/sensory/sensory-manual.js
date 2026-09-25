(()=>{
const contexts={
 work:{icon:'💻',title:'專心工作／讀書',hint:'例如寫報告、閱讀、準備資料',items:['旁邊有人交談時，我很容易跟著注意其他人的聲音','突然有聲響或畫面跳出時，我需要一點時間才能回到原本的事情','太安靜時，我反而比較難進入狀態，會想放音樂或找些刺激','桌面、螢幕或周圍東西很多時，我比較容易分心或疲累']},
 group:{icon:'👥',title:'開會／上課／多人互動',hint:'例如會議、課堂、聚會或多人談話',items:['多人同時說話時，我很難只把注意放在一個人的聲音上','我常常一邊聽主要談話，一邊注意到旁邊的小聲音或動作','人多、資訊多一段時間後，我會明顯想安靜或離開一下','如果刺激不夠或內容節奏慢，我會開始想動、摸東西或做別的事']},
 travel:{icon:'🚇',title:'通勤／外出',hint:'例如搭車、走在街上、逛街或排隊',items:['人群靠得很近、被碰到或動線擁擠時，我比較容易耗能','車聲、廣播、氣味或燈光同時出現時，我會很快注意到','移動中的景物與聲音對我影響不大，我甚至可能沉浸到沒注意周圍','等待或排隊太久時，我會需要走動、滑手機或找些事情做']},
 home:{icon:'🏠',title:'在家休息／做家事',hint:'例如休息、煮飯、整理或做自己的事',items:['回到家後，我會特別想降低聲音、光線或與人的互動','太安靜時，我反而喜歡開電視、音樂或讓環境有一點聲音','做家事時，如果同時有很多聲音或事情，我容易覺得雜亂','熟悉的環境裡，我比較容易找到讓自己舒服的刺激方式']},
 body:{icon:'🍽️',title:'忙碌時的身體訊號',hint:'例如投入工作、趕時間或連續處理事情',items:['忙起來時，我常做到一個段落才突然發現自己很餓、很渴或很累','我通常很快就能察覺飢餓、疲累、溫度或身體不舒服','身體已經不舒服時，我有時還是不容易判斷自己到底需要休息、吃東西還是活動一下','如果沒有刻意安排，我很容易一路做下去而錯過休息']},
 movement:{icon:'🧍',title:'久坐／等待／需要維持姿勢',hint:'例如長時間坐著、排隊、聽講或搭車',items:['坐一段時間後，我會開始想換姿勢、抖腳、走動或伸展','如果可以邊走、邊動或手上有東西操作，我反而比較能維持注意','長時間不能動時，我會明顯覺得耗能或煩躁','我常常直到身體很僵、很累，才發現自己維持同一姿勢太久']}
};
const steps=[...document.querySelectorAll('.step')],bar=document.getElementById('bar'),form=document.getElementById('sensoryForm'),result=document.getElementById('result');let i=0;
const cc=document.getElementById('contextChoices');Object.entries(contexts).forEach(([k,c])=>{cc.insertAdjacentHTML('beforeend',`<label class="choice"><input type="checkbox" name="context" value="${k}"><span><strong>${c.icon} ${c.title}</strong><br><span class="helper">${c.hint}</span></span></label>`)});
function selectedContexts(){return [...document.querySelectorAll('input[name="context"]:checked')].map(x=>x.value)}
function renderScenarios(){const box=document.getElementById('scenarioQuestions');box.innerHTML='';let ks=selectedContexts();if(!ks.length)ks=['work'];ks.forEach(k=>{const c=contexts[k];const opts=c.items.map((t,n)=>`<label class="choice"><input type="checkbox" data-context="${k}" value="${t}"><span>${t}</span></label>`).join('');box.insertAdjacentHTML('beforeend',`<div class="context-card"><h3>${c.icon} ${c.title}</h3><p class="hint">${c.hint}</p><div class="choices">${opts}</div></div>`)})}
function show(n,opts={scroll:true}){i=Math.max(0,Math.min(steps.length-1,n));if(i===1)renderScenarios();steps.forEach((s,x)=>s.classList.toggle('active',x===i));bar.style.width=((i+1)/steps.length*100)+'%';if(opts.scroll){window.scrollTo({top:document.querySelector('.progress').offsetTop-90,behavior:'smooth'})}}
document.querySelectorAll('[data-next]').forEach(b=>b.onclick=()=>show(i+1));document.querySelectorAll('[data-prev]').forEach(b=>b.onclick=()=>show(i-1));
function vals(k){const a=[...document.querySelectorAll(`[data-key="${k}"] input:checked`)].map(x=>x.value);return a.length?a.join('、')+'。':'目前還沒有特別選到；可以繼續從生活中觀察。'}
function textOr(id,fallback='目前先留白，之後也可以再補充。'){return document.getElementById(id).value.trim()||fallback}
document.getElementById('finish').onclick=()=>{const cr=document.getElementById('contextResults');cr.innerHTML='';let ks=selectedContexts();if(!ks.length)ks=['work'];ks.forEach(k=>{const c=contexts[k],a=[...document.querySelectorAll(`[data-context="${k}"]:checked`)].map(x=>x.value);cr.insertAdjacentHTML('beforeend',`<div class="manual-card"><h3>${c.icon} ${c.title}</h3>${a.length?'<ul>'+a.map(v=>`<li>${v}</li>`).join('')+'</ul>':'<p>這個情境目前還沒有特別選到反應；可以繼續觀察。</p>'}</div>`)});document.getElementById('r-impact').textContent=vals('impact');let h=vals('help'),custom=document.getElementById('customHelp').value.trim();document.getElementById('r-help').textContent=h+(custom?'另外，我也發現：'+custom+'。':'');document.getElementById('r-warning').textContent=vals('warning');document.getElementById('r-focus').textContent=textOr('focusQuestion');document.getElementById('r-wonder').textContent=textOr('wonderQuestion');document.getElementById('r-support').textContent=vals('support');
try{
  const ctx=ks.map(k=>({key:k,title:contexts[k].title,selected:[...document.querySelectorAll(`[data-context="${k}"]:checked`)].map(x=>x.value)}));
  localStorage.setItem('aml.self.sensory.v1',JSON.stringify({
    savedAt:new Date().toISOString(),
    contexts:ctx,
    impact:document.getElementById('r-impact').textContent,
    help:document.getElementById('r-help').textContent,
    warning:document.getElementById('r-warning').textContent,
    focus:document.getElementById('r-focus').textContent,
    wonder:document.getElementById('r-wonder').textContent,
    support:document.getElementById('r-support').textContent
  }));
}catch(e){}
form.classList.add('hidden');document.querySelector('.progress').classList.add('hidden');result.classList.add('active');result.scrollIntoView({behavior:'smooth',block:'start'})};
document.getElementById('restart').onclick=()=>{form.reset();document.getElementById('customHelp').value='';document.getElementById('focusQuestion').value='';document.getElementById('wonderQuestion').value='';form.classList.remove('hidden');document.querySelector('.progress').classList.remove('hidden');result.classList.remove('active');show(0)};show(0,{scroll:false})})();