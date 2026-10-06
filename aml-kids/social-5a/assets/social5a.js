const AML_KIDS_LAST_ACTIVITY_KEY='amlKidsLastActivityV1';
function amlKidsRecordActivity(questionId='',level=''){
  let previous=null;
  try{previous=JSON.parse(localStorage.getItem(AML_KIDS_LAST_ACTIVITY_KEY)||'null');}catch{}
  if(!questionId&&previous&&previous.path===location.pathname){
    questionId=previous.questionId||'';
    level=previous.level||'';
  }
  const title=document.querySelector('h1')?.textContent.trim()||document.title;
  const context=document.querySelector('.eyebrow')?.textContent.trim()||'AML Kids';
  localStorage.setItem(AML_KIDS_LAST_ACTIVITY_KEY,JSON.stringify({path:location.pathname,title,context,questionId,level,updatedAt:Date.now()}));
}
window.addEventListener('DOMContentLoaded',()=>{
  amlKidsRecordActivity();
  const resumeId=new URLSearchParams(location.search).get('resume');
  if(resumeId){
    setTimeout(()=>{
      const target=[...document.querySelectorAll('[data-quiz]')].find(el=>el.dataset.quiz===resumeId);
      if(target){
        target.scrollIntoView({block:'center',behavior:'auto'});
        const control=target.querySelector('input,button');
        if(control) control.focus();
      }
    },120);
  }
});
document.addEventListener('click',event=>{
  const check=event.target.closest('.bank-check');
  if(!check)return;
  const box=check.closest('.challenge-question');
  if(!box)return;
  const level=box.querySelector('.level-chip')?.textContent.trim()||'';
  setTimeout(()=>amlKidsRecordActivity(box.dataset.quiz||'',level),0);
});

const WALLET_KEY='amlKidsRewardWalletV1';
const UNIT_SCORE_KEY='amlKidsSocial5aU1ScoreV5';
const AWARDS_KEY='amlKidsSocial5aU1AwardsV5';
const MISTAKES_KEY='amlKidsSocial5aU1MistakesV5';
const RESUME_KEY='amlKidsSocial5aU1ResumeV1';
const UNIT_MAX=250;
const state={
 wallet:Number(localStorage.getItem(WALLET_KEY)||0),
 unitScore:Number(localStorage.getItem(UNIT_SCORE_KEY)||0),
 awards:new Set(JSON.parse(localStorage.getItem(AWARDS_KEY)||'[]')),
 mistakes:JSON.parse(localStorage.getItem(MISTAKES_KEY)||'[]'),
 resume:JSON.parse(localStorage.getItem(RESUME_KEY)||'null')
};
const questions=[{"id":"q01","level":"基礎","q":"從世界地圖判讀，臺灣的海陸位置最接近下列哪一項？","o":["亞洲東部、太平洋西側","歐洲西部、大西洋東側","非洲北部、印度洋西側","南美洲東部、大西洋西側"],"a":0,"e":"臺灣位於亞洲東部、太平洋西側。","s":"現行課程"},{"id":"q02","level":"基礎","q":"臺灣四面環海，若從「人與海洋互動」思考，最合理的發展是？","o":["完全不會與外界往來","只能發展高山畜牧","航運、漁業與海上交流較有機會發展","所有居民都一定從事漁業"],"a":2,"e":"海洋提供資源與交通機會，但不代表所有人都從事同一產業。","s":"歷屆題型改編"},{"id":"q03","level":"基礎","q":"一張十七世紀外國人繪製的臺灣古地圖，最適合幫助我們理解什麼？","o":["臺灣今天每條道路的位置","不同時代的人如何認識與看待臺灣","明天的天氣","每一位居民的日常生活"],"a":1,"e":"古地圖可反映當時人們對空間與位置的認識。","s":"現行課程"},{"id":"q04","level":"基礎","q":"冬季東北季風吹向臺灣時，哪一項最能說明季風會影響生活？","o":["只要有季風就不能上學","所有地區天氣一定完全相同","季風只影響海面，不影響陸地","部分迎風地區較容易有降雨，交通與活動安排也可能受影響"],"a":3,"e":"季風影響天氣，進而可能影響交通、農業與生活安排。","s":"現行課程"},{"id":"q05","level":"基礎","q":"臺灣的海洋資源與海洋文化之間，最合理的關係是？","o":["文化只由法律決定","人們長期利用海洋資源，可能形成與海洋相關的生活與文化","只要住在島上文化就完全相同","海洋只能作為國界"],"a":1,"e":"人與海洋長期互動會影響產業與文化。","s":"現行課程"},{"id":"q06","level":"基礎","q":"臺灣位在東亞海陸交會位置，這項特色除了影響交通，也可能影響下列哪一項？","o":["生物遷徙與族群交流","島內各地的地形高度完全一致","所有族群只會在原居地生活","海陸位置只會影響貨運，不影響生物與人群"],"a":0,"e":"現行課程把交通運輸與動物遷徙都列為地理位置影響。","s":"現行課程"},{"id":"q07","level":"基礎","q":"要了解沒有充分文字紀錄的史前生活，最可靠的做法是？","o":["只看今天的新聞","只憑想像寫故事","詢問現代人的記憶","分析遺址與出土文物"],"a":3,"e":"考古證據是推測史前生活的重要依據。","s":"歷屆題型改編"},{"id":"q08","level":"基礎","q":"「史前」最適合解釋為下列哪一項？","o":["所有人都住在山洞","完全沒有任何人類活動","缺少充分文字紀錄，需要從其他證據了解過去","一定沒有使用工具"],"a":2,"e":"史前不等於沒有歷史，而是文字紀錄不足。","s":"歷屆題型改編"},{"id":"q09","level":"基礎","q":"遺址中發現大量魚骨與貝殼，最適合先提出哪一種推論？","o":["居民可能曾利用水域資源","居民每天只吃魚","居民一定住在高山","居民一定會寫字"],"a":0,"e":"證據支持「可能利用水域資源」，不能過度延伸。","s":"歷屆題型改編"},{"id":"q10","level":"基礎","q":"為什麼考古學家通常會同時看多種文物，而不是只看一件？","o":["文物愈多就一定愈新","多種證據互相支持，可以讓推論更可靠","一件文物完全沒有價值","只要數量多就不必分析"],"a":1,"e":"多項證據可互相驗證，但仍須謹慎解釋。","s":"現行課程"},{"id":"q11","level":"基礎","q":"下列對臺灣原住民族的理解，哪一項較恰當？","o":["文化差異代表高低優劣","所有族群文化完全相同","所有族群都只住在高山","不同族群可能有不同語言、生活方式與文化"],"a":3,"e":"理解文化多樣性，不把不同族群視為完全相同。","s":"現行課程"},{"id":"q12","level":"基礎","q":"海岸、山區、平原能取得的自然資源不同，最可能先影響什麼？","o":["一週有幾天","地球自轉方向","人們取得食物、建材與交通方式","文字是否存在"],"a":2,"e":"自然環境會影響人可利用的資源與生活方式。","s":"現行課程"},{"id":"q13","level":"基礎","q":"看到某族群的傳統服飾後，哪一種說法較適當？","o":["有傳統服飾就不能使用現代科技","所有族人每天一定穿同一套","它能反映部分文化特色，但不能代表每位族人每天都這樣穿","服飾可以解釋全部文化"],"a":2,"e":"避免把傳統文化簡化成刻板印象。","s":"現行課程"},{"id":"q14","level":"基礎","q":"傳統文化與現代生活之間，哪一項說法較合理？","o":["兩者可以同時存在並持續變化","有手機就不能保存傳統","保存傳統就不能上學","文化只要改變就等於消失"],"a":0,"e":"文化會傳承，也會隨時代調整。","s":"現行課程"},{"id":"q15","level":"基礎","q":"社會科題目中出現「一定、全部、完全」等詞時，最適合怎麼做？","o":["看到「一定」就直接選","先檢查資料是否真的足以支持這麼絕對的說法","只看最後一個字","不用閱讀題幹"],"a":1,"e":"社會科推論常需要區分可能與絕對。","s":"題型策略"},{"id":"q16","level":"基礎","q":"若要判斷臺灣與日本、菲律賓的相對位置，最適合使用哪一種資料？","o":["農產品價格表","氣溫表","人口姓名冊","東亞地圖"],"a":3,"e":"相對位置最直接用地圖判讀。","s":"現行課程"},{"id":"q17","level":"基礎","q":"冬季某地受到東北季風影響，若又位於迎風面，較可能出現哪種情況？","o":["降雨機會較高","背風面通常比迎風面更容易降雨","風向不會影響水氣移動","只要有季風，各地降雨量就完全相同"],"a":0,"e":"迎風面較容易接收季風帶來的水氣。","s":"歷屆題型改編"},{"id":"q18","level":"基礎","q":"「四面環海」不等於「與外界隔絕」，最主要的理由是？","o":["島嶼一定人口很多","海水可以直接變成公路","所有船都不受天氣影響","海洋也能成為交通與交流的通道"],"a":3,"e":"海洋既可能是阻隔，也可能是交通通道。","s":"現行課程"},{"id":"q19","level":"基礎","q":"從古地圖、航線與不同族群來臺的紀錄，可以共同理解哪一個概念？","o":["地圖只能用來看山的高度","臺灣的地理位置與歷史文化發展有關聯","歷史與空間沒有關係","所有外來者目的都相同"],"a":1,"e":"位置、交通與歷史交流彼此相關。","s":"現行課程"},{"id":"q20","level":"基礎","q":"下列哪一個做法最符合「欣賞不同文化」？","o":["把所有族群特色混成一種","先用自己的習慣判斷誰比較進步","先理解文化背景，再比較不同生活方式","只記服飾名稱而不理解原因"],"a":2,"e":"尊重與理解文化差異是本單元的重要目標。","s":"現行課程"},{"id":"q21","level":"進階","q":"某港口位在東亞重要航線附近，但實際船隻是否停靠還會受港口設備、天候與政策影響。這段資料最能提醒我們什麼？","o":["只要位置好，所有船一定停靠","地理位置重要，但不是決定所有結果的唯一因素","港口設備與航運完全無關","天候只影響陸地交通"],"a":1,"e":"位置提供條件，但實際結果還受其他因素影響。","s":"歷屆題型改編"},{"id":"q22","level":"進階","q":"甲地冬季多雨、乙地冬季較乾燥。若兩地都在臺灣，想判斷是否與季風和地形有關，還需要哪一組資料？","o":["居民最喜歡的顏色","兩地便利商店數量","兩地位置、地形與冬季風向","學校制服樣式"],"a":2,"e":"要解釋季風與降雨，需結合位置、地形與風向。","s":"資料判讀"},{"id":"q23","level":"進階","q":"一位同學說：「臺灣位在海上交通位置，所以歷史上每個外來族群都是為了同一目的來臺。」這句話最大的問題是？","o":["把「容易接觸」過度推論成「目的完全相同」","完全沒有提到地理位置","臺灣不在海上","不同族群不能交流"],"a":0,"e":"相同位置條件不代表不同時代、不同族群的動機完全一致。","s":"推論"},{"id":"q24","level":"進階","q":"某遺址出土大量捕魚工具、少量農具與許多陶器。下列哪一項敘述最謹慎？","o":["農具少就表示沒有人種植","居民一定完全不耕作","陶器證明居民已經有學校","居民可能重視水域資源，也可能有其他生產活動"],"a":3,"e":"考古資料適合用「可能、較多、較少」等謹慎語言。","s":"歷屆題型改編"},{"id":"q25","level":"進階","q":"若兩處遺址都有陶器，但甲有大量魚骨、乙有較多穀物與農具，最合理的比較是？","o":["只要都有陶器就無法比較","兩地生活一定完全相同","乙一定比甲文明","甲較顯示水域資源利用，乙較顯示農耕活動"],"a":3,"e":"相同文物不代表生活型態完全相同，要看整體證據組合。","s":"證據比較"},{"id":"q26","level":"進階","q":"考古學家在原本認為「沒有農作」的遺址後來發現新的農作痕跡，最合理的做法是？","o":["忽略新證據維持原答案","依新證據修正原本推論","認為所有舊研究都沒有價值","直接推論居民只從事農業"],"a":1,"e":"好的推論會隨新證據調整。","s":"科學與歷史思考"},{"id":"q27","level":"進階","q":"一個族群居住在靠海地區，長期發展出與海洋相關的生活技術。下列哪一項說法最完整？","o":["環境提供資源與條件，但文化也受歷史與傳統影響","只要靠海文化就一定完全相同","海洋決定所有文化","現代化後就不可能保留海洋文化"],"a":0,"e":"環境是文化形成的因素之一，不是唯一因素。","s":"現行課程"},{"id":"q28","level":"進階","q":"兩個族群生活在相近山區，卻有不同祭儀與語言。這個現象最能反駁哪一個說法？","o":["文化具有多樣性","環境可能影響生活","相同環境一定會形成完全相同文化","歷史也會影響文化"],"a":2,"e":"相似環境下仍有文化差異，說明環境不是唯一決定因素。","s":"推論"},{"id":"q29","level":"進階","q":"老師要求「用證據支持你的答案」。下列哪個回答最符合要求？","o":["我認為居民利用水域資源，因為遺址有大量魚骨、貝殼與捕魚工具","我覺得就是這樣，沒有理由","大家都這麼說","我先選最長的選項"],"a":0,"e":"主張後面要接可檢查的資料或證據。","s":"素養策略"},{"id":"q30","level":"進階","q":"若一張圖顯示候鳥遷徙路線經過臺灣，最適合用來說明哪個概念？","o":["候鳥只受人類交通影響","臺灣所有鳥類都不會離開","臺灣的地理位置可能影響動物遷徙","地圖不能呈現遷徙"],"a":2,"e":"現行課程提到海陸位置對動物遷徙的影響。","s":"現行課程"},{"id":"q31","level":"進階","q":"某地漁獲下降，研究發現與過度捕撈及海洋污染有關。這最適合連結本單元哪個觀念？","o":["文化與環境完全無關","海洋資源永遠用不完","只有陸地需要保護","利用海洋資源也需要考慮人與環境的互動與永續"],"a":3,"e":"海洋資源利用應同時關注環境影響。","s":"延伸應用"},{"id":"q32","level":"進階","q":"若古地圖把臺灣畫得比例不準，是否就完全沒有歷史價值？","o":["是，比例不準就全部無效","不是，仍可研究當時繪圖者如何認識臺灣與周邊世界","只有現代地圖才是歷史資料","古地圖只能看顏色"],"a":1,"e":"歷史資料的價值不只在精確測量，也在反映當時觀點。","s":"資料判讀"},{"id":"q33","level":"進階","q":"同一件陶器可能被用來裝水、食物或其他物品。這最能說明什麼？","o":["陶器沒有任何研究價值","單一文物的用途需要搭配其他證據判斷","看到陶器就能確定用途","所有陶器用途都相同"],"a":1,"e":"單一證據常有多種可能解釋。","s":"證據推論"},{"id":"q34","level":"進階","q":"若要比較海岸與山區生活方式的差異，哪種方法最適合？","o":["先假設山區一定落後","只比較服飾顏色","只看一張照片就下結論","同時比較可利用資源、交通條件與生活需求"],"a":3,"e":"比較生活方式需要多面向資料。","s":"比較分析"},{"id":"q35","level":"進階","q":"某位學生把「傳統祭儀」理解成「所有族人每天都做同一件事」。這屬於哪一種問題？","o":["地圖比例錯誤","證據太多","把文化特色過度概括成每個人的日常生活","季風判讀錯誤"],"a":2,"e":"文化描述不應被擴大成所有人的固定行為。","s":"文化理解"},{"id":"q36","level":"進階","q":"如果一個社會同時保留傳統語言、祭儀，也使用手機與現代交通，最適合怎麼理解？","o":["文化可以在傳承中持續變化","傳統與現代不能並存","使用科技等於文化消失","所有文化都會變成一樣"],"a":0,"e":"文化可以同時有延續與變化。","s":"文化理解"},{"id":"q37","level":"進階","q":"下列哪一組最符合「原因→影響」的邏輯？","o":["季風→所有文化相同","出土陶器→地球自轉","臺灣位於東亞海域→增加區域交流機會","住山區→一定不使用科技"],"a":2,"e":"地理位置與交流之間有合理因果關係。","s":"因果"},{"id":"q38","level":"進階","q":"若題目問「哪個證據最能支持」，作答時應優先選哪種選項？","o":["字數最長的選項","與題目主張直接相關、能具體支持的資料","最有趣的故事","自己最熟悉但與題意無關的資料"],"a":1,"e":"判斷證據時要看它是否能直接支持題目的主張，而不是只看資料是否熟悉或有趣。","s":"素養策略"},{"id":"q39","level":"進階","q":"公開舊試卷常把史前文化與原住民族特色做配對。若改成現在的素養題，最適合怎麼升級？","o":["加入資料與情境，要求說明判斷依據","只增加更多死背名稱","把答案藏得更小","只考字形"],"a":0,"e":"素養題強調在情境中運用概念與證據。","s":"歷屆題型改編"},{"id":"q40","level":"進階","q":"一份資料顯示臺灣同時受到海洋、季風與區域交通影響。哪一個結論最完整？","o":["所有影響都與位置無關","只有氣候重要","只有歷史重要","自然環境與地理位置會共同影響人類活動與歷史發展"],"a":3,"e":"本單元核心是位置、環境與人的活動彼此關聯。","s":"跨概念"},{"id":"q41","level":"素養","q":"【閱讀】小晴一家冬天從臺北前往南部旅行。出發時臺北陰雨又濕冷，到南部後天氣較乾暖。爸爸說：「臺灣不大，但冬季天氣仍可能有區域差異。」若要用本單元概念解釋，哪一項最合理？","o":["冬季季風、水氣與地形位置共同影響不同地區天氣","南部緯度較低，因此所有冬日都不會下雨","北部城市較多，所以一定比較容易降雨","臺灣南北距離不遠，因此天氣差異只能由海拔決定"],"a":0,"e":"要把季風、水氣、位置與地形一起考慮，而非用誇張單一原因解釋。","s":"歷屆題型＋現行課程改編"},{"id":"q42","level":"素養","q":"【閱讀】一艘船由日本南方航向菲律賓，途中經過臺灣東方海域。船員查閱風向、洋流與港口資料，決定是否調整航線。這段材料最能說明哪一項？","o":["海上交通完全不受自然條件影響","地理位置與自然環境都可能影響交通活動","所有經過臺灣的船都會停靠","位置只影響文化，不影響交通"],"a":1,"e":"位置提供交通條件，自然環境則會影響實際航行。","s":"歷屆題型改編"},{"id":"q43","level":"素養","q":"【閱讀】考古隊在河口遺址發現大量魚骨、貝殼、陶器、石器，以及少量植物種子。研究員寫下：「居民很可能利用水域資源，但目前還不能斷定他們完全沒有種植作物。」這段話最符合哪種研究態度？","o":["沒有文字就不能研究","只要證據很多就可以說一定","依證據提出有限度的推論，並保留其他可能","先決定答案再找證據"],"a":2,"e":"研究結論應符合證據範圍並保留不確定性。","s":"歷屆題型改編"},{"id":"q44","level":"素養","q":"【閱讀】遺址甲靠海，常見魚骨、貝殼與捕魚工具；遺址乙位於較內陸處，有較多穀物、農具與儲藏容器。下列比較最合理？","o":["兩地工具不同就證明從未交流","甲一定完全不農耕，乙一定完全不捕魚","乙一定比甲先進","甲較顯示水域資源利用，乙較顯示農耕與儲存，但兩地都可能還有其他活動"],"a":3,"e":"比較時要描述證據較能支持的活動，避免絕對化。","s":"證據題型改編"},{"id":"q45","level":"素養","q":"【閱讀】博物館介紹某原住民族的傳統服飾、祭儀與建築。小安看完後說：「所以現在每位族人每天都穿傳統服飾、住傳統建築。」哪個回應最好？","o":["只要使用手機就不算原住民族","完全正確，文化永遠不會改變","展覽呈現重要文化特色，但不能因此推論所有人的現代日常生活完全相同","傳統文化現在已不存在"],"a":2,"e":"傳統特色與現代生活可以並存，不能過度概括。","s":"文化素養"},{"id":"q46","level":"素養","q":"【題組】甲、乙兩族群都生活在山區。甲長期與鄰近平原族群交易，乙較常與另一側山區聚落往來。多年後兩族群在語言借詞、祭儀與飲食上出現不同特色。哪個因素最能補充「環境」以外的解釋？","o":["不同的歷史交流經驗","兩地都在山區，所以差異只能由自然資源造成","只要生活環境相近，文化應該逐漸完全相同","不同祭儀與語言只能用氣候差異解釋"],"a":0,"e":"相似環境下，不同交流歷史仍可能帶來文化差異。","s":"素養改編"},{"id":"q47","level":"素養","q":"【題組】某學生看到「臺灣四面環海」就寫：「因此臺灣歷史上完全與外界隔絕。」老師要求他修正。下列哪一句最適合？","o":["島嶼一定只能靠飛機交流","四面環海一定代表完全孤立","只要有海就沒有文化交流","海洋有時是阻隔，但也能成為航運與交流通道，因此要看交通技術與歷史情境"],"a":3,"e":"海洋兼具阻隔與連結功能，要依情境判斷。","s":"歷屆題型改編"},{"id":"q48","level":"素養","q":"【閱讀】研究人員比較古地圖與現代地圖，發現古地圖比例不精準，但仍標示臺灣與周邊海域及航行方向。為什麼古地圖仍有價值？","o":["比例不準就完全沒有資料價值","它能反映當時人們如何理解臺灣的位置與航海世界","古地圖一定比現代地圖精準","只能用來欣賞顏色"],"a":1,"e":"歷史資料可反映當時人的知識與觀點，不只看測量精準度。","s":"現行課程延伸"},{"id":"q49","level":"素養","q":"【閱讀】一處海岸社區發展漁業與觀光，但近年面臨漁獲減少、垃圾與生態受損。若用「人與環境互動」觀念提出建議，哪一項最完整？","o":["只要觀光賺錢就不必管環境","利用海洋資源的同時，也要管理捕撈、減少污染並維護生態","完全禁止所有人靠近海岸","海洋資源會自動恢復，不必管理"],"a":1,"e":"資源利用與環境保護需要同時考量。","s":"素養延伸"},{"id":"q50","level":"素養","q":"【總整】同學整理第一單元後寫下四句話：①位置可能影響交流；②考古推論要有證據；③環境會影響生活但不是文化唯一因素；④看到一件文物就能確定全部歷史。哪一組最符合本單元？","o":["①②③","①④","②④","③④"],"a":0,"e":"④是過度推論；前三項都是本單元的核心思考方式。","s":"總整"}];

function save(){
 localStorage.setItem(WALLET_KEY,String(state.wallet));
 localStorage.setItem(UNIT_SCORE_KEY,String(state.unitScore));
 localStorage.setItem(AWARDS_KEY,JSON.stringify([...state.awards]));
 localStorage.setItem(MISTAKES_KEY,JSON.stringify(state.mistakes));
 localStorage.setItem(RESUME_KEY,JSON.stringify(state.resume));
}
function renderScore(){
 document.querySelector('#scoreText').textContent=`${state.wallet} 點`;
 document.querySelector('#scoreProgress').hidden=true;
 document.querySelector('#unitScoreText').textContent=`本單元 ${Math.min(state.unitScore,UNIT_MAX)} / ${UNIT_MAX}`;
 renderChallengeProgress();
 renderResume();
}
function award(id){
 if(state.awards.has(id)) return false;
 state.awards.add(id);
 state.unitScore=Math.min(UNIT_MAX,state.unitScore+5);
 state.wallet+=5;
 save();renderScore();
 return true;
}
function inferLesson(id){
 const n=Number(String(id).replace(/\D/g,''));
 if([1,2,3,4,5,6,16,17,18,19,21,22,23,30,31,32,37,38,40,41,42,47,48].includes(n)) return '1-1';
 if([7,8,9,10,24,25,26,29,33,39,43,44].includes(n)) return '1-2';
 if([11,12,13,14,20,27,28,34,35,36,45,46,49].includes(n)) return '1-3';
 return '跨課整合';
}
function questionForMistake(id){return questions.find(q=>q.id===id);}
function recordMistake(id,text,review){
 if(!state.mistakes.some(x=>x.id===id)){
  const q=questionForMistake(id);
  state.mistakes.push({id,text,review,level:q?.level||'課前',lesson:q?inferLesson(id):'課前'});
  save();renderMistakes();
 }
}
let mistakeFilter='全部';
function renderMistakes(){
 const wrap=document.querySelector('#mistakeList');
 if(!wrap)return;
 const normalized=state.mistakes.map(m=>{
  const q=questionForMistake(m.id);
  return {...m,level:m.level||q?.level||'課前',lesson:m.lesson||(q?inferLesson(m.id):'課前')};
 });
 const corrected=normalized.filter(m=>state.awards.has(m.id)).length;
 const pending=normalized.length-corrected;
 const totalEl=document.querySelector('#mistakeTotal');
 const correctedEl=document.querySelector('#mistakeCorrected');
 const pendingEl=document.querySelector('#mistakePending');
 if(totalEl)totalEl.textContent=normalized.length;
 if(correctedEl)correctedEl.textContent=corrected;
 if(pendingEl)pendingEl.textContent=pending;

 let visible=normalized;
 if(mistakeFilter==='待複習') visible=normalized.filter(m=>!state.awards.has(m.id));
 else if(mistakeFilter!=='全部') visible=normalized.filter(m=>m.level===mistakeFilter);

 wrap.innerHTML='';
 if(!normalized.length){
  wrap.innerHTML='<div class="mistake-empty"><span aria-hidden="true">✨</span><strong>目前沒有錯題</strong><p>先去完成挑戰題，曾經答錯的題目會自動整理到這裡。</p></div>';
  return;
 }
 if(!visible.length){
  wrap.innerHTML='<div class="mistake-empty"><strong>這個分類目前沒有題目</strong><p>可以切換其他分類查看。</p></div>';
  return;
 }
 visible.forEach(m=>{
  const q=questionForMistake(m.id);
  const fixed=state.awards.has(m.id);
  const card=document.createElement('article');
  card.className='mistake-card '+(fixed?'is-corrected':'is-pending');
  card.innerHTML=`<div class="mistake-meta"><span class="level-chip">${m.level}</span><span class="lesson-chip">${m.lesson}</span><span class="mistake-status">${fixed?'✓ 已訂正':'待複習'}</span></div><h3>${m.text}</h3><p>${fixed?(q?.e||'已重新答對，考前仍可再確認一次。'):'先回到題目重新判讀，再查看解析。'}</p>${q?`<button type="button" class="secondary review-question" data-review-id="${m.id}" data-review-level="${m.level}">回到這一題</button>`:''}`;
  wrap.appendChild(card);
 });
 document.querySelectorAll('.review-question').forEach(btn=>btn.addEventListener('click',()=>{
  const id=btn.dataset.reviewId;
  const level=btn.dataset.reviewLevel;
  showPanel('boss');
  showSegment(level,{scroll:false});
  requestAnimationFrame(()=>{
   const card=document.querySelector(`[data-quiz="${id}"]`);
   if(card){
    const nav=document.querySelector('.lesson-nav');
    const sticky=document.querySelector('.challenge-progress');
    const offset=(nav?.offsetHeight||0)+(sticky?.offsetHeight||0)+24;
    const top=Math.max(0,card.getBoundingClientRect().top+window.scrollY-offset);
    window.scrollTo({top,behavior:'auto'});
    const heading=card.querySelector('h4');
    if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
   }
  });
 }));
}
function setResume(item){
 if(!item)return;
 state.resume={id:item.id,level:item.level};
 localStorage.setItem(RESUME_KEY,JSON.stringify(state.resume));
 renderResume();
}
function nextQuestionFromResume(){
 const lastIndex=questions.findIndex(q=>q.id===state.resume?.id);
 if(lastIndex>=0){
  for(let i=lastIndex+1;i<questions.length;i++){
   if(!state.awards.has(questions[i].id)) return questions[i];
  }
 }
 return questions.find(q=>!state.awards.has(q.id))||questions[questions.length-1];
}
function renderResume(){
 const card=document.querySelector('#resumeCard');
 if(!card)return;
 const completed=questions.filter(q=>state.awards.has(q.id)).length;
 if(completed===0&&!state.resume){card.hidden=true;return;}
 card.hidden=false;
 const next=nextQuestionFromResume();
 const title=document.querySelector('#resumeTitle');
 const text=document.querySelector('#resumeText');
 if(completed===50){
  title.textContent='第一單元 50 題已完成';
  text.textContent='可以回到錯題小本本複習，或重新查看各區題目。';
  return;
 }
 const n=questions.findIndex(q=>q.id===next?.id)+1;
 title.textContent=`繼續第一單元挑戰｜第 ${n} 題`;
 text.textContent=`目前已完成 ${completed} / 50 題；下一題位於「${next?.level||'基礎'}」區。`;
}
function goToResume(){
 const target=nextQuestionFromResume();
 if(!target)return;
 showPanel('boss');
 showSegment(target.level,{scroll:false});
 requestAnimationFrame(()=>{
  const card=document.querySelector(`[data-quiz="${target.id}"]`);
  if(!card)return;
  const offset=(document.querySelector('.lesson-nav')?.offsetHeight||0)+(document.querySelector('.challenge-progress')?.offsetHeight||0)+24;
  window.scrollTo({top:Math.max(0,card.getBoundingClientRect().top+window.scrollY-offset),behavior:'auto'});
  const heading=card.querySelector('h4');
  if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
 });
}

function renderChallengeProgress(){
 const done=questions.filter(x=>state.awards.has(x.id)).length;
 const t=document.querySelector('#challengeProgressText');
 const p=document.querySelector('#challengeProgress');
 if(t)t.textContent=`已完成 ${done} / 50 題`;
 if(p)p.value=done;
 const hero=document.querySelector('#heroDone');
 if(hero)hero.textContent=done;
 if(document.querySelector('#segmentTitle')) updateSegmentUI();
 const result=document.querySelector('#bossResult');
 if(result){
  result.hidden=done!==50;
  if(done===50){
   result.innerHTML='<div class="completion-medal" aria-hidden="true">🏅</div><div><strong>第一單元挑戰完成！</strong><p>50 / 50 題全部完成，本單元獲得 250 / 250 點。</p><p class="completion-note">你完成的不只是題目，也完成了一次完整的閱讀與作答耐力訓練。</p></div>';
  }
 }
}
function showPanel(id){
 document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===id));
 document.querySelectorAll('.tab-btn').forEach(b=>{
  if(b.dataset.target===id)b.setAttribute('aria-current','page');
  else b.removeAttribute('aria-current');
 });
 history.replaceState(null,'',`#${id}`);
 const p=document.getElementById(id);
 const nav=document.querySelector('.lesson-nav');
 const offset=(nav?.offsetHeight||0)+12;
 const top=Math.max(0,p.getBoundingClientRect().top+window.scrollY-offset);
 window.scrollTo({top,behavior:'auto'});
 requestAnimationFrame(()=>{
  const heading=p.querySelector('h2');
  if(heading){
   if(!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex','-1');
   heading.focus({preventScroll:true});
  }
 });
}
document.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.target)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.go)));

document.querySelectorAll('.check').forEach(btn=>btn.addEventListener('click',()=>{
 const box=btn.closest('.quiz,.competency');
 if(box.closest('#boss')) return;
 const radio=box.querySelector('input[type=radio]:checked');
 const fb=box.querySelector('.feedback');
 if(!radio){fb.textContent='請先選一個答案。';return;}
 const correct=radio.value===btn.dataset.answer;
 fb.textContent=correct?'✅ 判斷正確。這是課前示範題，不計入250點。 '+(btn.dataset.explain||''):'🔍 再想想：找出題目真正提供的證據，不要把「可能」說成「一定」。';
 box.classList.toggle('correct',correct);
 box.classList.toggle('incorrect',!correct);
}));

let activeSegment='基礎';

function segmentQuestions(){
 return questions.filter(q=>q.level===activeSegment);
}

function updateSegmentUI(){
 const configs={
  '基礎':{title:'第一區｜基礎 20 題',count:20,intro:'先把本單元的核心概念讀懂、判斷清楚。'},
  '進階':{title:'第二區｜進階挑戰 20 題',count:20,intro:'開始比較證據、判斷因果，練習不被表面關鍵字帶走。'},
  '素養':{title:'第三區｜素養 10 題',count:10,intro:'閱讀較長情境，整合多個線索後再做出判斷。'}
 };
 const cfg=configs[activeSegment];
 const done=segmentQuestions().filter(q=>state.awards.has(q.id)).length;
 document.querySelector('#segmentTitle').textContent=cfg.title;
 const intro=document.querySelector('#segmentIntro');
 if(intro) intro.textContent=cfg.intro;
 document.querySelector('#segmentProgressText').textContent=`已完成 ${done} / ${cfg.count} 題`;
 const boss=document.querySelector('#boss');
 if(boss) boss.dataset.activeSegment=activeSegment;
 document.querySelectorAll('.segment-btn').forEach(btn=>{
  const level=btn.dataset.segment;
  const active=level===activeSegment;
  const levelQuestions=questions.filter(q=>q.level===level);
  const levelDone=levelQuestions.filter(q=>state.awards.has(q.id)).length;
  const isComplete=levelDone===levelQuestions.length;
  btn.setAttribute('aria-pressed',String(active));
  btn.classList.toggle('segment-complete',isComplete);
  const count=btn.querySelector('[data-count-for]');
  const status=btn.querySelector('[data-state-for]');
  if(count) count.textContent=`${levelDone} / ${levelQuestions.length}`;
  if(status) status.textContent=isComplete?'✓ 已完成':(levelDone>0?'進行中':'尚未開始');
  btn.setAttribute('aria-label',`${level}題，已完成 ${levelDone} / ${levelQuestions.length}${isComplete?'，已完成':''}`);
 });
}

function showSegment(level,{scroll=true}={}){
 activeSegment=level;
 renderQuestions();
 updateSegmentUI();
 if(scroll){
  const target=document.querySelector('#segmentTitle');
  const nav=document.querySelector('.lesson-nav');
  const sticky=document.querySelector('.challenge-progress');
  const offset=(nav?.offsetHeight||0)+(sticky?.offsetHeight||0)+28;
  const top=Math.max(0,target.getBoundingClientRect().top+window.scrollY-offset);
  window.scrollTo({top,behavior:'auto'});
  requestAnimationFrame(()=>target.focus({preventScroll:true}));
 }
}

function renderQuestions(){
 const wrap=document.querySelector('#bossQuestions');
 wrap.innerHTML='';
 const segment=segmentQuestions();
 const baseIndex=activeSegment==='基礎'?0:activeSegment==='進階'?20:40;

 segment.forEach((item,localIndex)=>{
  const globalIndex=baseIndex+localIndex;
  const d=document.createElement('article');
  d.className='quiz challenge-question segment-question-'+(activeSegment==='基礎'?'basic':activeSegment==='進階'?'advanced':'literacy');
  d.dataset.quiz=item.id;
  if(state.awards.has(item.id)) d.classList.add('correct');
  const isReading=/^【(閱讀|題組|總整)】/.test(item.q);
  const stem=isReading?item.q.replace(/^【[^】]+】/,'').trim():item.q;
  d.innerHTML=`<div class="question-meta"><span class="level-chip">${item.level}</span><span>第 ${globalIndex+1} / 50 題</span><span class="source-chip">${item.s}</span>${state.awards.has(item.id)?'<span class="done-chip">✓ 已完成</span>':''}</div>${isReading?'<div class="reading-material-tag">閱讀材料</div>':''}<div class="${isReading?'question-stem reading-stem':'question-stem'}"><h4>${stem}</h4></div><fieldset class="answer-options"><legend class="sr-only">請選擇一個答案</legend>${item.o.map((t,j)=>`<label class="answer-option"><input type="radio" name="${item.id}" value="${j}"><span class="option-letter" aria-hidden="true">${String.fromCharCode(65+j)}</span><span class="option-text">${t}</span></label>`).join('')}</fieldset><div class="question-actions"><button class="check bank-check">送出答案</button></div><p class="feedback" aria-live="polite">${state.awards.has(item.id)?'✅ 這題已完成並取得 5 點。':''}</p>`;
  wrap.appendChild(d);
 });

 document.querySelectorAll('.answer-option input').forEach(input=>input.addEventListener('change',()=>{
  const box=input.closest('.challenge-question');
  box.querySelectorAll('.answer-option').forEach(label=>label.classList.remove('option-selected'));
  input.closest('.answer-option').classList.add('option-selected');
 }));
 document.querySelectorAll('.bank-check').forEach(btn=>btn.addEventListener('click',()=>{
  const box=btn.closest('.challenge-question');
  const item=questions.find(x=>x.id===box.dataset.quiz);
  const sel=box.querySelector('input:checked');
  const fb=box.querySelector('.feedback');
  if(!sel){fb.textContent='請先選一個答案。';return;}
  setResume(item);
  const correct=Number(sel.value)===item.a;
  if(correct){
   const gained=award(item.id);
   fb.textContent=(gained?'✅ 答對！+5 點。 ':'✅ 答對！這題 5 點已領取過。 ')+item.e;
   box.classList.add('correct');box.classList.remove('incorrect');
   box.querySelectorAll('.answer-option').forEach(label=>label.classList.remove('option-wrong','option-right'));
   sel.closest('.answer-option')?.classList.add('option-right');
   updateSegmentUI();
   if(gained){
    const meta=box.querySelector('.question-meta');
    if(meta && !meta.querySelector('.done-chip')){
     const chip=document.createElement('span');
     chip.className='done-chip';
     chip.textContent='✓ 已完成';
     meta.appendChild(chip);
    }
   }
  }else{
   fb.textContent='🔍 目前答案不對。先重新讀題，找出關鍵證據後再作答；答對仍可取得完整 5 點。';
   box.classList.add('incorrect');box.classList.remove('correct');
   box.querySelectorAll('.answer-option').forEach(label=>label.classList.remove('option-wrong','option-right'));
   sel.closest('.answer-option')?.classList.add('option-wrong');
   recordMistake(item.id,item.q,item.level+'題｜回看相關課次與解析');
  }
 }));
}

document.querySelectorAll('.segment-btn').forEach(btn=>{
 btn.addEventListener('click',()=>showSegment(btn.dataset.segment));
});
const resumeBtn=document.querySelector('#resumeChallenge');
if(resumeBtn)resumeBtn.addEventListener('click',goToResume);
document.querySelectorAll('.mistake-filter').forEach(btn=>{
 btn.addEventListener('click',()=>{
  mistakeFilter=btn.dataset.mistakeFilter;
  document.querySelectorAll('.mistake-filter').forEach(b=>{
   const active=b===btn;
   b.classList.toggle('is-active',active);
   b.setAttribute('aria-pressed',String(active));
  });
  renderMistakes();
 });
});
showSegment(state.resume?.level||'基礎',{scroll:false});renderScore();renderMistakes();renderResume();
showPanel(location.hash?.slice(1)&&document.getElementById(location.hash.slice(1))?location.hash.slice(1):'home');