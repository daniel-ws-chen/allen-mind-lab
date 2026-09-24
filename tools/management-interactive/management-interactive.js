(() => {
 const games={
  ownership:{title:'到底誰要做？',intro:'CASE 001｜ROLE & TASKS｜分工、責任與追蹤',takeaway:'管理不是把事情說出去，而是把主責、協作與回報點說清楚。',panels:['主任：下午三點前要交資料。','大家：我以為別人會做。','下午兩點半：檔案還是空的。'],qs:[
   {q:'這個案例最主要的管理問題是什麼？',o:['人手一定不夠','分工與責任不清','大家太忙所以無法改善','只要再開一次會就好'],a:1,e:'大家都知道「事情要做」，卻沒有清楚的主責人與交付標準，最核心的問題是責任界線不清。'},
   {q:'如果主管只說「這件事你們處理一下」，最可能發生什麼？',o:['團隊自然會更有彈性','工作容易重複、遺漏或彼此等待','所有人都會更清楚自己的責任','進度一定會更快'],a:1,e:'交辦語句太模糊時，大家可能都以為別人會接手，最後出現重複、遺漏或沒有人真正負責。'},
   {q:'較好的下一步是？',o:['再開一次會，但不做明確結論','指定主責、協作者、期限與回報點','等最積極的人主動接手','主管把工作全部收回自己做'],a:1,e:'清楚指定主責、支援角色、期限與回報點，才能把「知道要做」變成「真的有人接住」。'}]},

  priority:{title:'十個第一優先',intro:'CASE 002｜PRIORITY｜優先順序與策略取捨',takeaway:'策略的核心不是把所有好點子都做，而是知道現在先做哪幾件事。',panels:['各組：我們這項最重要！','主管：那十項都是第一優先。','團隊：所以到底先做哪一個？'],qs:[
   {q:'「十個第一優先」最大的管理問題是什麼？',o:['目標太少','缺乏真正的優先排序','員工意見太多','專案數量還不夠'],a:1,e:'當所有事情都被列為最高優先，就等於沒有真正的優先順序。'},
   {q:'如果所有任務都是「第一優先」，團隊最可能出現什麼？',o:['執行會更集中','焦點會更清楚','資源分散、每件事都只做到一點','決策速度一定變快'],a:2,e:'沒有取捨時，有限資源會被切得更碎，團隊反而更難集中力量完成真正重要的事。'},
   {q:'主管較好的作法是？',o:['保留十個第一優先，避免得罪任何人','根據核心目標、影響程度與資源，先選 1–2 個關鍵項目','把所有優先順序交給個別同仁自行決定','選最容易做的項目就好'],a:1,e:'優先順序要回到核心目標、預期影響與資源限制，這就是策略取捨。'}]},

  kpi:{title:'KPI 真的變好了嗎？',intro:'CASE 003｜KPI & DATA｜指標判讀與資料比較',takeaway:'KPI 是幫助判斷，不是幫助自我安慰；先確認資料能不能比，再談成果。',panels:['去年：30 天內完成追蹤 72%。','今年改成 45 天內：91%。','主管：進步好多！'],qs:[
   {q:'可以直接說服務品質進步了嗎？',o:['可以，因為 91% 明顯高於 72%','不一定，因為指標定義已經改變','只要百分比上升就可以','只要主管認為是進步就可以'],a:1,e:'30 天與 45 天是不同的測量窗口，指標定義改變後，前後數據不能直接當成同一標準比較。'},
   {q:'面對兩個年度的 KPI，最需要先確認什麼？',o:['簡報版型是否一致','樣本、定義、時間窗口與計算方式是否一致','哪一年的數字比較漂亮','哪個部門做的報告'],a:1,e:'只有在資料定義與條件具有可比性時，數字的高低才有意義。'},
   {q:'如果 KPI 變好了，但服務使用者實際體驗沒有改善，較合理的下一步是？',o:['直接宣布改善成功','檢查 KPI 是否真正反映想改善的結果','停止蒐集任何資料','增加更多報表數量'],a:1,e:'當數字與實際經驗脫節時，要回頭檢查指標是否抓到真正重要的成果。'}]},

  delegate:{title:'這叫授權，還是丟包？',intro:'CASE 004｜LEADERSHIP｜授權、支持與責任',takeaway:'授權不是把事情甩出去，而是讓別人在有方向、權限與支持的情況下完成任務。',panels:['主管：活動你負責。','同仁：預算、目標、權限呢？','主管：你自己想辦法，我相信你。'],qs:[
   {q:'這個情境最大的問題是什麼？',o:['主管太信任員工','沒有說清楚目標、權限、資源與責任界線','員工問太多問題','授權本來就不需要說明'],a:1,e:'有效授權不是只把任務交出去，而是要把目標、權限、資源與回報方式一起說清楚。'},
   {q:'哪一個情境最像真正的授權？',o:['「你自己想辦法處理。」','「你負責，但所有事情都要先問我。」','「目標與預算清楚，執行方式你可決定，兩週後一起看進度。」','「我自己做最快，所以還是我來。」'],a:2,e:'真正的授權同時保留自主性與責任，也提供清楚的邊界與追蹤機制。'},
   {q:'授權之後，主管是否還有責任？',o:['沒有，責任已經完全轉移','有，仍要提供支持並對團隊結果負管理責任','只有出問題時才有責任','只要口頭交辦完成就沒有責任'],a:1,e:'授權會分配工作與決策權，但不會讓主管的管理責任消失。'}]},

  conflict:{title:'會議開完，怎麼還在吵？',intro:'CASE 005｜TEAMWORK｜溝通、衝突與協作',takeaway:'好的會議不是每個人都講過，而是最後知道共同目標、分歧點，以及接下來誰做什麼。',panels:['OT：應增加生活情境訓練。','PT：應優先肌力和平衡。','主管：不要吵，照我的做。'],qs:[
   {q:'這個案例最核心的管理問題是什麼？',o:['會議時間太短','團隊缺少共同理解與明確結論','大家太有意見','專業越多越難合作'],a:1,e:'不同專業有不同觀點並不奇怪，真正的問題是團隊沒有把差異整理成共享理解與共同決策。'},
   {q:'如果每個專業都只強調自己的觀點，最容易發生什麼？',o:['決策自然會更完整','形成片段化理解，彼此各說各話','工作一定更有效率','衝突會自動消失'],a:1,e:'如果缺乏共同目標與整合機制，每個專業都可能只看到自己熟悉的那一塊。'},
   {q:'主管較好的下一步是？',o:['趕快結束討論，避免再吵','重述共同目標、整理分歧點，並確認結論與分工','讓職位最高的人直接決定','讓不同專業各做各的'],a:1,e:'把討論拉回共同目標，再整理分歧與決策，是把衝突轉成協作的重要一步。'}]},

  system:{title:'個案掉在系統縫隙裡',intro:'CASE 006｜SYSTEMS｜轉銜與跨系統服務',takeaway:'完成轉介不等於完成服務；管理真正要看的是整體路徑有沒有接起來。',panels:['醫院：我們已完成轉介。','社區：還沒收到完整資訊。','家屬：所以我現在到底找誰？'],qs:[
   {q:'這個案例最主要的問題是什麼？',o:['醫院治療次數不夠','跨系統轉銜與資訊銜接不足','家屬配合度不足','個案其實不需要後續服務'],a:1,e:'每個單位可能都有完成自己的工作，但不同系統之間沒有真正接起來，服務仍然會中斷。'},
   {q:'如果醫院、長照與社政都完成自己的部分，卻沒有彼此對接，最可能發生什麼？',o:['服務自然會更完整','家屬仍需自己反覆說明與協調','轉銜一定會更順利','各單位工作量一定下降'],a:1,e:'缺少跨單位銜接時，整合責任常會落到家屬身上，服務也容易在交界處中斷。'},
   {q:'較好的改善方向是？',o:['每個系統只管自己的部分','建立聯絡窗口、資訊交換與後續追蹤機制','請家屬自己整合所有資訊','增加更多轉介表單就好'],a:1,e:'跨系統管理的重點不是增加單一單位工作量，而是建立真正可運作的銜接與追蹤機制。'}]}
 };

 const dialog=document.getElementById('management-game-dialog'); if(!dialog)return;
 const title=dialog.querySelector('[data-title]'), intro=dialog.querySelector('[data-intro]'), body=dialog.querySelector('[data-body]');
 let game=null,index=0,answered=false,correct=0;
 const letters=['A','B','C','D'];

 function render(){
   const q=game.qs[index]; answered=false;
   body.innerHTML=`<div class="mini-comic">${game.panels.map((p,i)=>`<div class="mini-panel"><b>SCENE ${i+1}</b><p>${p}</p></div>`).join('')}</div><div class="progress">第 ${index+1} / ${game.qs.length} 題</div><div class="question"><h4>${q.q}</h4><div class="options">${q.o.map((x,i)=>`<button type="button" data-a="${i}"><span>${letters[i]}</span>${x}</button>`).join('')}</div><div class="feedback" hidden></div></div>`;
   body.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.a),b)));
 }
 function choose(n,btn){
   if(answered)return; answered=true;
   const q=game.qs[index]; if(n===q.a) correct++;
   const bs=[...body.querySelectorAll('[data-a]')];
   bs.forEach((b,i)=>{b.disabled=true;if(i===q.a)b.classList.add('is-correct');}); if(n!==q.a)btn.classList.add('is-wrong');
   const fb=body.querySelector('.feedback'); fb.hidden=false; fb.className=`feedback ${n===q.a?'good':'note'}`;
   fb.innerHTML=`<strong>${n===q.a?'這個判斷很準 ✓':'再看一個管理線索'}</strong><p>${q.e}</p><button type="button" class="next">${index===game.qs.length-1?'完成這一局':'下一題 →'}</button>`;
   fb.querySelector('.next').addEventListener('click',()=>{if(index<game.qs.length-1){index++;render();}else finish();});
 }
 function finish(){
   body.innerHTML=`<div class="finish"><div class="finish-icon">✓</div><h4>${game.title}｜完成</h4><p><strong>${correct} / ${game.qs.length}</strong> 題做出建議判斷。這裡的重點不是分數，而是你已經練習從情境中抓出真正的管理問題。</p><p class="finish-note"><strong>這一局帶走：</strong><br>${game.takeaway}</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px"><button type="button" class="next" data-finish-close>回到六局首頁</button><a class="next" style="text-decoration:none;background:#8a6a32" href="/management-self-study.html">想完整學習 →</a></div></div>`;
   body.querySelector('[data-finish-close]').addEventListener('click',()=>dialog.close());
 }
 document.querySelectorAll('[data-game]').forEach(b=>b.addEventListener('click',()=>{game=games[b.dataset.game];if(!game)return;index=0;correct=0;title.textContent=game.title;intro.textContent=game.intro;render();dialog.showModal();}));
 dialog.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>dialog.close()));
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
})();
