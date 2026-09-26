
(() => {
  const KEY='amlPbsSelfStudyV1';
  const IDS=['abc','function','strategy','replacement','emotion','family'];
  const qs=[
    {q:'工作人員說「先收玩具」，孩子立刻把玩具丟到地上。這裡最清楚的行為 B 是？',o:['先收玩具','把玩具丟到地上','孩子不高興','工作人員的要求'],a:1,tag:'ABC'},
    {q:'每次出現困難作業後，孩子就推開材料；作業一停，他很快平靜。較值得形成的功能假設是？',o:['獲得注意','逃避或延後要求','取得食物','一定是感官刺激'],a:1,tag:'功能'},
    {q:'孩子每次大叫後，成人就立刻把手機交給他。最需要留意的是？',o:['可能意外強化大叫','只要安靜就沒有問題','這一定是消退','和 PBS 無關'],a:0,tag:'策略'},
    {q:'孩子遇到困難時會撕紙。哪個替代行為較適合教？',o:['「可以幫我嗎？」','忍住不要動','等大人猜','直接離開'],a:0,tag:'替代行為'},
    {q:'原本能聊天的人開始反覆詢問、皺眉、聲量變大。較可能代表？',o:['完全平穩','早期升溫訊號','一定已進入危機','沒有任何意義'],a:1,tag:'情緒訊號'},
    {q:'對方情緒正升高時，哪個回應較適合？',o:['一次解釋很多原因','短句、放慢速度、降低刺激','連續追問原因','立刻要求道歉'],a:1,tag:'支持回應'},
    {q:'PBS 中的「後果 C」指的是？',o:['一定是處罰','行為之後環境發生的變化','個案犯錯的結果','只有獎勵才算'],a:1,tag:'ABC'},
    {q:'看到一次行為後就直接判定「他就是為了逃避」，較大的問題是？',o:['功能不重要','單次事件不足以確認功能','PBS 不能做假設','一定要先處罰'],a:1,tag:'功能'},
    {q:'替代行為教學何時最適合開始？',o:['只在爆發當下','平穩時先練習，成功時有一致回應','每次都換新方法','只有家屬能教'],a:1,tag:'技能'},
    {q:'高張情緒或危機現場最優先的目標是？',o:['把道理說完整','取得控制權','安全、降低刺激與傷害','立刻完成原本要求'],a:2,tag:'安全'}
  ];
  const gate=document.querySelector('[data-gate]');
  const gateText=document.querySelector('[data-gate-text]');
  const gateBack=document.querySelector('[data-gate-back]');
  const startBtn=document.querySelector('[data-start]');
  const quiz=document.querySelector('[data-quiz]');
  const step=document.querySelector('[data-step]');
  const question=document.querySelector('[data-question]');
  const options=document.querySelector('[data-options]');
  const result=document.querySelector('[data-result]');
  const scoreEl=document.querySelector('[data-score]');
  const resultTitle=document.querySelector('[data-result-title]');
  const resultText=document.querySelector('[data-result-text]');
  const review=document.querySelector('[data-review]');
  const retry=document.querySelector('[data-retry]');
  const certPanel=document.querySelector('[data-certificate-panel]');
  const nameInput=document.querySelector('[data-name]');
  const generate=document.querySelector('[data-generate]');
  const cert=document.querySelector('[data-certificate]');
  const certName=document.querySelector('[data-cert-name]');
  const certDate=document.querySelector('[data-cert-date]');
  const certId=document.querySelector('[data-cert-id]');
  const printBtn=document.querySelector('[data-print]');
  const completionExit=document.querySelector('[data-completion-exit]');
  let idx=0, correct=0, wrongTags=[];

  function empty(){return {articles:{},games:{},quiz:{passed:false,score:0,date:null,certificateId:null,name:null}}}
  function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x&&typeof x==='object'?{...empty(),...x,articles:{...x.articles},games:{...x.games},quiz:{...empty().quiz,...x.quiz}}:empty()}catch(e){return empty()}}
  function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
  function complete(s){return IDS.every(id=>s.articles[id]&&s.games[id])}
  function today(){return new Date().toLocaleDateString('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit'})}
  function makeId(){
    const d=new Date(), pad=n=>String(n).padStart(2,'0');
    const rand=Math.random().toString(36).slice(2,6).toUpperCase();
    return `AML-PBS-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${rand}`;
  }
  function gateInit(){
    const s=load();
    if(completionExit) completionExit.style.display=s.quiz.passed?'block':'none';
    if(complete(s)){
      gateText.textContent='六堂文章與互動練習都已完成，可以開始總複習。';
      gateBack.style.display='none'; startBtn.style.display='inline-flex';
    }else{
      let done=0; IDS.forEach(id=>{if(s.articles[id])done++;if(s.games[id])done++;});
      gateText.textContent=`目前完成 ${done} / 12 個項目。請先完成六堂文章與互動練習。`;
      startBtn.style.display='none'; gateBack.style.display='inline-flex';
    }
  }
  function renderQ(){
    const item=qs[idx];
    step.textContent=`第 ${idx+1} 題 / 共 ${qs.length} 題`;
    question.textContent=item.q;
    options.innerHTML='';
    item.o.forEach((txt,i)=>{
      const b=document.createElement('button');
      b.type='button'; b.textContent=`${String.fromCharCode(65+i)}. ${txt}`;
      b.addEventListener('click',()=>answer(i));
      options.appendChild(b);
    });
  }
  function answer(choice){
    const item=qs[idx];
    if(choice===item.a) correct++; else wrongTags.push(item.tag);
    idx++;
    if(idx<qs.length) renderQ(); else finish();
  }
  function start(){
    idx=0;correct=0;wrongTags=[];
    gate.style.display='none'; result.style.display='none'; certPanel.style.display='none'; if(completionExit) completionExit.style.display='none'; quiz.style.display='block';
    renderQ();
  }
  function finish(){
    quiz.style.display='none'; result.style.display='block';
    const passed=correct>=8;
    scoreEl.textContent=`${correct} / ${qs.length}`;
    resultTitle.textContent=passed?'完成總複習 ✓':'再複習一下會更穩';
    resultText.textContent=passed?'你已完成 PBS 自學總複習，可以產生 AML 非正式自學完訓證明。':'建議回到較容易混淆的主題，再挑戰一次。';
    const counts={}; wrongTags.forEach(t=>counts[t]=(counts[t]||0)+1);
    review.innerHTML='';
    if(Object.keys(counts).length===0){
      const li=document.createElement('li'); li.textContent='六個主題都掌握得很穩定。'; review.appendChild(li);
    }else{
      Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,3).forEach(([tag,n])=>{
        const li=document.createElement('li'); li.textContent=`${tag}：有 ${n} 題可以再回看相關文章或互動解析。`; review.appendChild(li);
      });
    }
    const s=load();
    s.quiz.score=correct;
    if(passed){
      s.quiz.passed=true; s.quiz.date=s.quiz.date||today(); s.quiz.certificateId=s.quiz.certificateId||makeId();
      save(s); certPanel.style.display='block'; if(completionExit) completionExit.style.display='block';
    } else if(completionExit){ completionExit.style.display='none'; }else save(s);
  }
  function generateCert(){
    const name=(nameInput.value||'').trim();
    if(!name){nameInput.focus();return}
    const s=load();
    if(!s.quiz.passed) return;
    s.quiz.name=name; save(s);
    certName.textContent=name;
    certDate.textContent=s.quiz.date||today();
    certId.textContent=s.quiz.certificateId||makeId();
    cert.hidden=false; printBtn.style.display='inline-flex';
  }
  startBtn.addEventListener('click',start);
  retry.addEventListener('click',start);
  generate.addEventListener('click',generateCert);
  printBtn.addEventListener('click',()=>window.print());
  gateInit();
})();
