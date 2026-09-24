(() => {
 const games={
  ownership:{title:'到底誰要做？',intro:'CASE 001｜任務釐清、分工與追蹤',panels:['主任：下午三點前要交資料。','大家：我以為別人會做。','下午兩點半：檔案還是空的。'],qs:[
   {q:'這個團隊眼前最需要先補強什麼？',o:['再開一次全員會議','明確指定負責人、期限與交付內容','要求大家更積極','等到有人主動接手'],a:1,e:'任務如果沒有清楚的 owner、期限與交付標準，就很容易出現「大家都知道，但沒有人真正負責」。'},
   {q:'指定負責人後，主管下一步最合理的是？',o:['所有細節都自己做','確認資源與權限，並設定回報點','完全不再過問','每天每小時追問一次'],a:1,e:'好的管理不是丟任務，也不是微管理，而是把責任、資源與追蹤點一起說清楚。'},
   {q:'如果下午兩點才發現進度落後，最值得反思的是？',o:['員工能力一定不足','原本缺少適當的進度追蹤機制','資料本身太難','主管應該全部自己做'],a:1,e:'若到截止前才第一次發現問題，通常代表控制與追蹤點設計得太晚。'}]},
  priority:{title:'十個第一優先',intro:'CASE 002｜優先順序與策略取捨',panels:['各組：我們這項最重要！','主管：那十項都是第一優先。','團隊：所以到底先做哪一個？'],qs:[
   {q:'「十個第一優先」最大的管理問題是？',o:['目標太少','缺乏真正的優先順序與取捨','員工意見太多','應該增加更多專案'],a:1,e:'當所有事情都是第一優先，就等於沒有優先。策略的核心之一就是在有限資源下做選擇。'},
   {q:'若只能先做兩件事，最合理的依據是？',o:['誰講得最大聲','哪件事最容易','與核心目標、影響程度與資源條件的匹配','哪件事名字最好聽'],a:2,e:'優先順序應回到目標、影響與限制，而不是聲量或方便程度。'},
   {q:'決定暫時不做某些方案，代表什麼？',o:['管理失敗','策略取捨的一部分','團隊不夠努力','主管沒有企圖心'],a:1,e:'策略不是把所有好點子都做一遍，而是知道現在最值得把資源放在哪裡。'}]},
  kpi:{title:'KPI 真的變好了嗎？',intro:'CASE 003｜資料判讀與品質指標',panels:['去年：30 天內完成追蹤 72%。','今年改成 45 天內：91%。','主管：進步好多！'],qs:[
   {q:'可以直接說服務品質進步了嗎？',o:['可以，因為 91% 比 72% 高','不宜，因為指標定義改變後不可直接比較','只要百分比上升就可以','只要主管認同就可以'],a:1,e:'計算窗口從 30 天改成 45 天，指標定義已不同，因此前後不能直接當成同一標準比較。'},
   {q:'要讓 KPI 真正有意義，最重要的是？',o:['越多越好','與核心目標有直接關聯且定義穩定','每個人都設定不同算法','只看最漂亮的數字'],a:1,e:'好的 KPI 應能反映重要目標，而且定義要清楚、穩定，才有比較價值。'},
   {q:'如果 KPI 變好，但使用者經驗沒有改善，下一步較合理的是？',o:['宣布成功','檢查指標是否真的反映想改善的結果','停止蒐集資料','增加更多報表'],a:1,e:'指標只是工具。如果數字和實際體驗脫節，就要重新檢視指標的有效性。'}]},
  delegate:{title:'這叫授權，還是丟包？',intro:'CASE 004｜授權、責任與邊界',panels:['主管：活動你負責。','同仁：預算、目標、權限呢？','主管：你自己想辦法，我相信你。'],qs:[
   {q:'這個情境最大的問題是？',o:['主管太信任員工','沒有把目標、資源、權限與責任界線說清楚','員工問太多','授權本來就不用說明'],a:1,e:'有效授權不是只把任務交出去，而是清楚說明目標、可用資源、決策範圍與回報方式。'},
   {q:'下列哪個更像真正授權？',o:['你負責，全部自己想','你負責，任何小事都要先問我','目標與預算清楚，執行方式可自行決定，兩週後檢視','我自己做最快'],a:2,e:'授權的重點是保留適當自主性，同時有清楚的責任與追蹤機制。'},
   {q:'授權之後主管是否還有責任？',o:['沒有，責任全部轉移','有，仍需提供支持並對團隊結果負管理責任','只有出問題時才有','只要口頭交代就沒有'],a:1,e:'授權會分配工作與決策權，但不會讓管理責任消失。'}]},
  conflict:{title:'會議開完，怎麼還在吵？',intro:'CASE 005｜衝突、共同目標與協作',panels:['OT：應增加生活情境訓練。','PT：應優先肌力和平衡。','主管：不要吵，照我的做。'],qs:[
   {q:'主管直接壓下衝突，最大的風險是？',o:['會議太短','真正的專業差異沒有被處理','大家會太開心','決策一定會更好'],a:1,e:'衝突不一定是壞事。若差異背後有重要資訊，單純壓下去可能讓問題暫時消失但沒有真正解決。'},
   {q:'較好的下一步是？',o:['回到共同目標與個案需求，整理各專業理由','讓職位最高的人決定','兩邊各做各的','禁止再討論'],a:0,e:'把不同專業觀點拉回共同目標，可以讓衝突從「誰對誰錯」變成「如何一起解決問題」。'},
   {q:'團隊意見不同時，最不代表什麼？',o:['可能有不同專業視角','一定代表團隊合作失敗','需要更好的協調方式','可能需要重新釐清目標'],a:1,e:'有差異不等於合作失敗，真正重要的是團隊是否有能力處理差異。'}]},
  system:{title:'個案掉在系統縫隙裡',intro:'CASE 006｜轉銜與跨系統服務',panels:['醫院：我們已完成轉介。','社區：還沒收到完整資訊。','家屬：所以我現在到底找誰？'],qs:[
   {q:'這個案例最主要的問題是？',o:['醫院治療次數不夠','跨系統轉銜與資訊銜接不足','家屬配合度不足','個案不需要服務'],a:1,e:'「有轉介」不等於「有銜接」。如果不同系統之間沒有接住彼此，服務仍會中斷。'},
   {q:'較適當的改善方向是？',o:['增加一份宣傳單','建立跨單位資訊交換、角色分工與追蹤機制','請家屬自己聯絡全部單位','各單位只做自己的工作'],a:1,e:'跨系統管理的核心是讓不同服務形成連續支持，而不是單一單位做得更多。'},
   {q:'如果同類問題反覆出現在很多個案身上，代表可能需要？',o:['只教育某一位家屬','從組織或制度層級重新設計轉銜流程','忽略它','只增加治療次數'],a:1,e:'當問題反覆影響一群人，就值得從流程、制度與資源配置層級處理。'}]}
 };
 const dialog=document.getElementById('management-game-dialog'); if(!dialog)return;
 const title=dialog.querySelector('[data-title]'), intro=dialog.querySelector('[data-intro]'), body=dialog.querySelector('[data-body]');
 let game=null,index=0,answered=false;
 const letters=['A','B','C','D'];
 function render(){const q=game.qs[index];answered=false;body.innerHTML=`<div class="mini-comic">${game.panels.map((p,i)=>`<div class="mini-panel"><b>SCENE ${i+1}</b><p>${p}</p></div>`).join('')}</div><div class="progress">第 ${index+1} / ${game.qs.length} 題</div><div class="question"><h4>${q.q}</h4><div class="options">${q.o.map((x,i)=>`<button type="button" data-a="${i}"><span>${letters[i]}</span>${x}</button>`).join('')}</div><div class="feedback" hidden></div></div>`;body.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.a),b)));}
 function choose(n,btn){if(answered)return;answered=true;const q=game.qs[index];const bs=[...body.querySelectorAll('[data-a]')];bs.forEach((b,i)=>{b.disabled=true;if(i===q.a)b.classList.add('is-correct');});if(n!==q.a)btn.classList.add('is-wrong');const fb=body.querySelector('.feedback');fb.hidden=false;fb.className=`feedback ${n===q.a?'good':'note'}`;fb.innerHTML=`<strong>${n===q.a?'答對了 ✓':'再看一個線索'}</strong><p>${q.e}</p><button type="button" class="next">${index===game.qs.length-1?'完成這一局':'下一題 →'}</button>`;fb.querySelector('.next').addEventListener('click',()=>{if(index<game.qs.length-1){index++;render();}else finish();});}
 function finish(){body.innerHTML=`<div class="finish"><div class="finish-icon">✓</div><h4>${game.title}｜完成</h4><p>你剛剛練習的不是背管理名詞，而是從情境裡找到真正需要處理的管理問題。</p><p class="finish-note">這裡是互動實驗室的自由探索內容，不計入管理學自學館進度。可以關閉後直接挑下一局。</p><button type="button" class="next" data-finish-close>回到六局首頁</button></div>`;body.querySelector('[data-finish-close]').addEventListener('click',()=>dialog.close());}
 document.querySelectorAll('[data-game]').forEach(b=>b.addEventListener('click',()=>{game=games[b.dataset.game];if(!game)return;index=0;title.textContent=game.title;intro.textContent=game.intro;render();dialog.showModal();}));
 dialog.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
})();
