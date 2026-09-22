(() => {
  const lessons = {
    abc: {
      title: 'ABC 偵探',
      intro: '先看清楚事情怎麼發生，再慢慢理解行為。',
      questions: [
        {q:'工作人員說：「先把玩具收起來。」小明隨即把玩具丟到地上。哪一項是行為 B？', opts:['工作人員要求收玩具','小明把玩具丟到地上','工作人員走過去','小明今天心情不好'], a:1, exp:'「把玩具丟到地上」是可以直接看見的行為。PBS 會優先記錄看得到、聽得到的內容。'},
        {q:'阿華正在看影片。工作人員提醒：「準備去洗澡了。」阿華開始大聲喊叫。哪一項最可能是前因 A？', opts:['阿華正在看影片','工作人員提醒要去洗澡','阿華大聲喊叫','阿華不喜歡洗澡'], a:1, exp:'提醒洗澡發生在喊叫之前，是重要的前因線索；「不喜歡洗澡」則是需要更多資料才能確認的推測。'},
        {q:'小琪排隊等午餐時反覆拍桌。工作人員走到她旁邊陪她說話。哪一項最可能是後果 C？', opts:['排隊等午餐','反覆拍桌','工作人員走過來陪她說話','小琪比較焦躁'], a:2, exp:'後果不是「處罰」的意思，而是行為發生之後，周遭出現了什麼變化。'}
      ]
    },
    function: {
      title:'功能猜猜看', intro:'功能是「可能的假設」，不是看一個事件就下定論。',
      questions:[
        {q:'每次開始較困難的作業後，小安就會推開材料；工作一停止，他很快平靜。最值得進一步觀察的功能是？', opts:['獲得注意','逃避或延後要求','取得物品','感官刺激'], a:1, exp:'「要求出現 → 行為發生 → 要求暫停」是一個值得追蹤的模式，但仍需累積多次 ABC 紀錄才能確認。'},
        {q:'小美常在照顧者忙著和別人說話時大聲叫；照顧者一回頭陪她，她就停止。最值得觀察的是？', opts:['獲得注意','逃避活動','取得食物','感官刺激'], a:0, exp:'行為之後出現了他人的關注，因此「注意」可以列為功能假設之一。'},
        {q:'阿哲反覆搖晃身體，即使現場沒有人回應、也沒有要求改變，仍持續出現。下一步較好的做法是？', opts:['直接認定是感官功能','先記錄出現時機與情境','立刻制止','忽略所有行為'], a:1, exp:'即使看起來可能與感官刺激有關，也應先觀察何時出現、頻率與環境條件，再形成較穩健的假設。'}]
    },
    strategy: {
      title:'策略紅綠燈', intro:'先問：這個回應是在教會新的方法，還是可能讓標的行為更容易再次發生？',
      questions:[
        {q:'孩子每次大叫，照顧者就立刻拿手機給他，希望轉移注意力。這個做法需要留意什麼？', opts:['一定是最佳策略','可能意外強化大叫','只要孩子安靜就沒有問題','PBS 不關心後果'], a:1, exp:'如果大叫之後經常得到喜歡的物品，行為可能更容易再次出現。策略要和功能假設一起看。'},
        {q:'孩子遇到困難會離開座位。團隊教他使用「我想休息一下」卡片，適當提出時給短暫休息。較符合哪個方向？', opts:['替代行為教學','只是在獎勵','完全忽略需求','增加要求'], a:0, exp:'讓孩子用更合適的方式達到相似功能，是 PBS 很重要的核心。'},
        {q:'孩子已經明顯情緒升高，成人仍持續長篇說理。哪個調整較適合？', opts:['講得更詳細','先降低刺激與語言量','加快連續提問','立刻要求道歉'], a:1, exp:'情緒升高時，理解與處理長語句的能力可能下降；先穩定、簡短、降低刺激通常更合理。'}]
    },
    replacement: {
      title:'替代行為小幫手', intro:'不是只說「不要」，而是讓人知道「我還可以怎麼做」。',
      questions:[
        {q:'孩子累了時常推開桌上的物品。哪個替代行為最值得教？', opts:['「我想休息一下」','忍住不要動','等大人猜到','直接離開不說'], a:0, exp:'替代行為要簡單、可做到，而且能用較合適的方法表達相同需求。'},
        {q:'孩子遇到不會的作業會撕紙。哪一句更適合作為替代行為？', opts:['「我就是不會」','「可以幫我嗎？」','「不要管我」','保持沉默'], a:1, exp:'「可以幫我嗎？」把原本可能用行為表達的需求，轉成可理解的求助。'},
        {q:'教替代行為時，哪一個原則最重要？', opts:['只在出事後提醒','平穩時先練習並讓成功有回應','一次教很多句','要求每個人用同一種方式'], a:1, exp:'新技能最好在情緒平穩時先學、先練，並在使用成功時得到一致且有意義的回應。'}]
    },
    emotion: {
      title:'情緒溫度計', intro:'越早看到升溫的小訊號，就越有機會在爆發前提供支持。',
      questions:[
        {q:'平常能聊天的孩子，開始反覆問同一件事、皺眉、聲量變大。比較像哪個階段？', opts:['綠｜平穩','黃｜緊張升高','紅｜高張狀態','完全無法判斷'], a:1, exp:'這些變化可能是早期升溫訊號。每個人的黃燈不同，重點是和他平常的狀態相比。'},
        {q:'看到「黃燈」訊號時，較合適的第一步是？', opts:['立刻責備','增加要求測試他','降低語言量、確認需要','等到爆發再處理'], a:2, exp:'越早支持，通常越容易保留選擇與溝通空間。'},
        {q:'情緒已明顯升高、大叫並想離開現場。這時最優先的是？', opts:['把道理說完整','要求立即反省','安全與降低刺激','追問事情經過'], a:2, exp:'高張時先顧安全、降低刺激與要求；事後再回顧，比在當下進行複雜說理更合適。'}]
    },
    family: {
      title:'支持回應小幫手', intro:'好的回應不需要很多話；簡短、穩定、能接住情緒，就能多留一點溝通空間。',
      questions:[
        {q:'對方明顯煩躁地說：「我不要去了！」第一句較友善的回應是？', opts:['「有什麼好生氣的？」','「我知道你現在很不舒服。」','「你每次都這樣。」','「不准再說不要。」'], a:1, exp:'先同理不代表同意所有行為，而是先讓對方知道自己的狀態被看見。'},
        {q:'對方情緒正在升高時，哪種說法比較適合？', opts:['一次解釋很多原因','用短句：「我們先慢一點。」','連續追問為什麼','要求馬上講清楚'], a:1, exp:'簡短、清楚、語速放慢，通常比長篇說理更容易被接收。'},
        {q:'情緒稍微穩定後，要提供選擇，哪個方式較好？', opts:['「你自己想辦法」','「你要不要先喝水，還是先休息？」','「你只能照我說的做」','一次給五個選項'], a:1, exp:'兩個都可接受、簡單可行的選項，能增加掌控感，也減少語言負擔。'}]
    }
  };

  const dialog = document.getElementById('pbs-practice-dialog');
  if (!dialog) return;
  const titleEl = dialog.querySelector('[data-quiz-title]');
  const introEl = dialog.querySelector('[data-quiz-intro]');
  const stepEl = dialog.querySelector('[data-quiz-step]');
  const bodyEl = dialog.querySelector('[data-quiz-body]');
  const closeBtns = dialog.querySelectorAll('[data-quiz-close]');
  let lesson=null, index=0, answered=false;

  function render(){
    const item=lesson.questions[index]; answered=false;
    stepEl.textContent=`${index+1} / ${lesson.questions.length}`;
    bodyEl.innerHTML=`<div class="pbs-question"><h4>${item.q}</h4><div class="pbs-options">${item.opts.map((o,i)=>`<button type="button" data-answer="${i}"><span>${String.fromCharCode(65+i)}</span>${o}</button>`).join('')}</div><div class="pbs-feedback" hidden></div></div>`;
    bodyEl.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>answer(Number(btn.dataset.answer))));
  }
  function answer(choice){
    if(answered) return; answered=true;
    const item=lesson.questions[index];
    const buttons=[...bodyEl.querySelectorAll('[data-answer]')];
    buttons.forEach((b,i)=>{b.disabled=true; if(i===item.a)b.classList.add('is-correct'); if(i===choice&&i!==item.a)b.classList.add('is-wrong');});
    const fb=bodyEl.querySelector('.pbs-feedback');
    const correct=choice===item.a;
    fb.hidden=false; fb.className=`pbs-feedback ${correct?'is-good':'is-note'}`;
    fb.innerHTML=`<strong>${correct?'答對了 ✓':'再看一個線索'}</strong><p>${item.exp}</p><button type="button" class="pbs-next">${index===lesson.questions.length-1?'完成練習':'下一題 →'}</button>`;
    fb.querySelector('.pbs-next').addEventListener('click',()=>{
      if(index<lesson.questions.length-1){index++;render();}else finish();
    });
  }
  function finish(){
    stepEl.textContent='完成';
    bodyEl.innerHTML=`<div class="pbs-finish"><div class="pbs-finish-icon">✓</div><h4>練習完成</h4><p>你剛剛做的，不只是選答案，而是在練習 <strong>先觀察、再理解、再選擇回應</strong>。</p><p class="pbs-finish-note">PBS 不靠單一事件下結論。真正使用在個案時，仍要結合多次觀察、團隊討論與個別差異。</p><button type="button" class="pbs-next" data-quiz-close>回到互動練習室</button></div>`;
    bodyEl.querySelector('[data-quiz-close]').addEventListener('click',()=>dialog.close());
  }
  document.querySelectorAll('[data-pbs-lesson]').forEach(btn=>btn.addEventListener('click',()=>{
    lesson=lessons[btn.dataset.pbsLesson]; if(!lesson)return; index=0;
    titleEl.textContent=lesson.title; introEl.textContent=lesson.intro; render(); dialog.showModal();
  }));
  closeBtns.forEach(b=>b.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
})();
