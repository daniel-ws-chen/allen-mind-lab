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
const UNIT_SCORE_KEY='amlKidsSocial5aU2ScoreV1';
const AWARDS_KEY='amlKidsSocial5aU2AwardsV1';
const MISTAKES_KEY='amlKidsSocial5aU2MistakesV1';
const RESUME_KEY='amlKidsSocial5aU2ResumeV1';
const UNIT_MAX=250;
const state={
 wallet:Number(localStorage.getItem(WALLET_KEY)||0),
 unitScore:Number(localStorage.getItem(UNIT_SCORE_KEY)||0),
 awards:new Set(JSON.parse(localStorage.getItem(AWARDS_KEY)||'[]')),
 mistakes:JSON.parse(localStorage.getItem(MISTAKES_KEY)||'[]'),
 resume:JSON.parse(localStorage.getItem(RESUME_KEY)||'null')
};
const questions=[{"id":"q01","level":"基礎","q":"大航海時代，歐洲人積極尋找通往亞洲的新航路，主要與哪一項需求有關？","o":["擴展亞洲貿易","尋找南極企鵝","避免使用船隻","建立太空站"],"a":0,"e":"歐洲勢力希望拓展亞洲貿易與取得商品。","s":"公開課程重點"},{"id":"q02","level":"基礎","q":"臺灣在大航海時代逐漸受到重視，最重要的地理原因之一是？","o":["沒有任何港灣","位在歐洲中央","位在東亞海上交通位置","完全遠離亞洲"],"a":2,"e":"臺灣位於東亞海上航路附近，具交通與貿易價值。","s":"現行課程"},{"id":"q03","level":"基礎","q":"荷蘭人在臺灣主要建立勢力的區域是？","o":["北部","南部","東部高山","澎湖以外完全沒有"],"a":1,"e":"荷蘭人主要在臺灣南部建立統治據點。","s":"公開評量題型改編"},{"id":"q04","level":"基礎","q":"西班牙人在臺灣主要活動的區域是？","o":["南部","離島全部","中央山脈","北部"],"a":3,"e":"西班牙人主要在臺灣北部建立據點。","s":"公開評量題型改編"},{"id":"q05","level":"基礎","q":"荷蘭與西班牙先後在臺灣建立據點，最能反映什麼？","o":["臺灣完全沒有對外交通","臺灣具有區域貿易與戰略價值","兩國只是來觀光","兩國都不知道亞洲在哪裡"],"a":1,"e":"不同勢力競逐臺灣，反映其位置與貿易價值。","s":"現行課程"},{"id":"q06","level":"基礎","q":"後來荷蘭勢力北上並使西班牙勢力離開臺灣，最適合歸類為？","o":["國際勢力競爭","自然災害","史前遺址","現代選舉"],"a":0,"e":"這是不同國際勢力為利益與據點競爭的例子。","s":"公開課程重點"},{"id":"q07","level":"基礎","q":"鄭成功進入臺灣後，結束了哪一方在臺灣的統治？","o":["清帝國","西班牙人","日本人","荷蘭人"],"a":3,"e":"鄭成功擊敗荷蘭勢力，建立鄭氏政權。","s":"公開評量題型改編"},{"id":"q08","level":"基礎","q":"鄭氏政權在臺灣發展時，哪一項最可能增加？","o":["史前文化重新開始","歐洲國家全面消失","漢人移入與開墾","所有人離開臺灣"],"a":2,"e":"鄭氏政權時期漢人移入與土地開墾增加。","s":"現行課程"},{"id":"q09","level":"基礎","q":"研究大航海時代的臺灣，為什麼要同時看世界史與臺灣史？","o":["臺灣的變化與國際貿易和競爭有關","臺灣與世界完全無關","只要背臺灣地名即可","世界史只研究歐洲"],"a":0,"e":"當時臺灣的歷史變化與東亞、歐洲勢力互動密切。","s":"現行課程"},{"id":"q10","level":"基礎","q":"荷蘭與西班牙在臺留下城堡或遺址，這些最適合稱為？","o":["自然形成的山脈","文化資產與歷史證據","史前化石","現代商場"],"a":1,"e":"歷史建築與遺址能成為理解過去的重要文化資產。","s":"公開課程重點"},{"id":"q11","level":"基礎","q":"大航海時代的臺灣出現不同族群，最合理的原因是？","o":["當時禁止任何交流","所有人同時出生在臺灣","海洋阻止所有移動","貿易、統治與移民活動增加"],"a":3,"e":"海上交通與政權活動促成更多族群往來。","s":"現行課程"},{"id":"q12","level":"基礎","q":"荷蘭人在臺灣推動農業生產與貿易，最可能的目的之一是？","o":["只研究天文","停止所有交易","取得經濟利益","讓港口關閉"],"a":2,"e":"殖民統治常與貿易和資源利益相連。","s":"公開評量題型改編"},{"id":"q13","level":"基礎","q":"西班牙人在北臺灣建立據點，也與哪一項活動有關？","o":["恐龍研究","登月","貿易與傳教","現代選舉"],"a":2,"e":"西班牙人在北臺灣的活動包括貿易與宗教傳播。","s":"公開評量題型改編"},{"id":"q14","level":"基礎","q":"下列哪一項最能表示「歷史留下影響」？","o":["今天仍可見相關遺址、地名或文化痕跡","課本印刷顏色改變","每天氣溫相同","所有人穿同樣衣服"],"a":0,"e":"遺址、地名與文化痕跡都是歷史延續的例子。","s":"現行課程"},{"id":"q15","level":"基礎","q":"大航海時代的「競爭」最可能發生在什麼之間？","o":["不同季節","想取得貿易利益與據點的不同勢力","不同山脈","不同考卷"],"a":1,"e":"國際勢力常因利益與據點產生競爭。","s":"現行課程"},{"id":"q16","level":"基礎","q":"判斷某勢力在臺活動範圍，最適合先看哪一種資料？","o":["數學乘法表","今日菜單","運動成績","歷史地圖"],"a":3,"e":"歷史地圖能幫助理解位置與活動範圍。","s":"題型策略"},{"id":"q17","level":"基礎","q":"「荷蘭南部、西班牙北部」這組資訊主要在比較什麼？","o":["活動位置","使用語言的字數","船隻大小","人口年齡"],"a":0,"e":"這是在比較兩個勢力的主要活動區域。","s":"公開評量題型改編"},{"id":"q18","level":"基礎","q":"鄭氏政權之後臺灣漢人社會逐漸擴大，與哪項最直接相關？","o":["季風停止","臺灣搬到歐洲","海洋消失","移民與開墾增加"],"a":3,"e":"人口移入與農業開墾是社會結構變化的重要因素。","s":"現行課程"},{"id":"q19","level":"基礎","q":"若課本同時介紹荷蘭、西班牙、鄭氏政權，最重要的學習不是？","o":["比較不同勢力的目的與影響","只背三個名稱而不理解關係","了解事件先後","理解臺灣與世界的連結"],"a":1,"e":"真正重要的是理解關係與影響，不只是背名稱。","s":"學習策略"},{"id":"q20","level":"基礎","q":"第二單元的核心主題最接近哪一句？","o":["比較不同時代交通工具的速度與使用方式","整理臺灣主要山脈與河川的名稱及位置","臺灣如何在國際競爭與交流中產生歷史變化","了解史前人類的生活方式與考古證據"],"a":2,"e":"本單元關注大航海時代臺灣與世界互動及後續影響。","s":"現行課程"},{"id":"q21","level":"進階","q":"若歐洲勢力只在意陸上交通，臺灣在大航海時代的重要性可能降低。這個推論主要建立在哪個前提？","o":["臺灣沒有海","當時海上貿易是重要交流方式","歐洲人不會航海","亞洲沒有商品"],"a":1,"e":"臺灣的重要性與當時海上航路和貿易需求密切相關。","s":"因果推理"},{"id":"q22","level":"進階","q":"一張地圖標出日本、中國東南沿海、臺灣與東南亞港口。哪個問題最值得用這張圖回答？","o":["某城堡用了幾塊磚","荷蘭人的服裝顏色","臺灣為何可能成為海上交通節點","每位移民的姓名"],"a":2,"e":"地圖最適合分析相對位置與交通關係。","s":"資料判讀"},{"id":"q23","level":"進階","q":"如果某資料只說「西班牙人在北臺灣建立據點」，下列哪一項不能直接確定？","o":["每位北臺灣居民都接受西班牙統治方式","西班牙勢力曾到北臺灣","北臺灣具一定戰略價值","當時存在跨區域競逐"],"a":0,"e":"一個政權建立據點不等於每個人的生活都完全相同。","s":"證據推論"},{"id":"q24","level":"進階","q":"荷蘭人驅逐西班牙人後擴大勢力，最能說明哪種歷史概念？","o":["文化資產不會留下","地理位置不重要","所有政權和平共存","利益競爭會改變勢力範圍"],"a":3,"e":"勢力範圍會因競爭與戰爭而改變。","s":"公開評量題型改編"},{"id":"q25","level":"進階","q":"鄭成功攻臺若只被描述為「一場戰爭」，會漏掉哪個重要面向？","o":["當天天氣","戰船的顏色","每位士兵的身高","戰後政權、人口與社會發展的改變"],"a":3,"e":"歷史事件要看後續政治與社會影響。","s":"現行課程"},{"id":"q26","level":"進階","q":"若一座古城先後被不同政權使用，最合理的研究方式是？","o":["只看現在外觀就下結論","比較不同時期用途與改建痕跡","假設所有時期用途相同","忽略年代"],"a":1,"e":"同一地點可能隨政權更替而改變用途。","s":"資料判讀"},{"id":"q27","level":"進階","q":"某同學說：「有歐洲人來臺，所以臺灣完全被歐洲文化取代。」最大問題是？","o":["把文化交流誇大成完全取代","沒有使用年代","沒有寫人名","句子太短"],"a":0,"e":"文化交流可能產生影響，但不代表原有文化完全消失。","s":"文化理解"},{"id":"q28","level":"進階","q":"如果要證明大航海時代臺灣與國際貿易有關，下列哪種資料最直接？","o":["今日港口觀光人數","現代高速公路路線圖","航線、港口與交易紀錄","現代各縣市人口密度圖"],"a":2,"e":"航線與交易紀錄能直接支持國際貿易活動。","s":"證據推論"},{"id":"q29","level":"進階","q":"荷蘭、西班牙都選擇在臺灣建立據點，若從共同原因推論，哪項最合理？","o":["臺灣位置有利於東亞海上活動","兩國文化完全相同","兩國都只想種稻米","臺灣當時是歐洲國家"],"a":0,"e":"兩國目的不完全相同，但都重視臺灣的區域位置。","s":"跨資料推理"},{"id":"q30","level":"進階","q":"公開舊試卷常考「誰在北部、誰在南部」。若升級成素養題，最好的做法是？","o":["把選項文字縮短，讓學生更快辨認北部與南部據點","增加更多人物姓名與年代，要求學生記住完整順序","加入地圖與航路資料，要求說明為何選擇據點","保留原本記憶題，只把題號與選項順序重新排列"],"a":2,"e":"素養題應讓學生運用資料解釋，而不是只背答案。","s":"題型改編"},{"id":"q31","level":"進階","q":"若同時看到教堂遺址、城堡與舊地名，最適合推論？","o":["城堡主要具有軍事功能，因此和統治方式及政權活動沒有直接關係","教堂、城堡與地名若出現在同一地區，就表示它們應該是在同一時期形成","教堂最能反映宗教活動，因此其他遺址對理解政治與文化變遷較不重要","不同政權活動可能留下多種類型文化痕跡"],"a":3,"e":"多種文化資產可反映不同活動與時期。","s":"公開評量題型改編"},{"id":"q32","level":"進階","q":"鄭氏政權鼓勵開墾可能帶來哪種連鎖影響？","o":["人口增加，但土地利用與聚落不會改變","人口與農業活動增加，社會結構逐漸改變","沿海港口因此全部停止運作","開墾只影響農業，不會改變人口與社會"],"a":1,"e":"開墾和人口移入會影響土地利用與社會組成。","s":"因果推理"},{"id":"q33","level":"進階","q":"同一歷史事件，統治者與原住民族的感受可能不同。這提醒我們？","o":["歷史只有一個固定立場","歷史需要考慮不同群體觀點","弱勢群體不算歷史","只看勝利者即可"],"a":1,"e":"多元視角有助於更完整理解歷史。","s":"歷史思考"},{"id":"q34","level":"進階","q":"若資料寫「某政權為擴展貿易而來臺」，最不能直接推出哪一句？","o":["國際競爭可能影響臺灣","貿易利益可能是重要因素","臺灣位置可能受到重視","所有來臺的人都只有同一目的"],"a":3,"e":"政權目的不能直接等於每個個人的唯一目的。","s":"證據界線"},{"id":"q35","level":"進階","q":"一項政策讓更多漢人來臺開墾。若要評估影響，最應觀察？","o":["政策發布的年份與名稱","移民使用的交通工具種類","人口、土地利用與族群互動的變化","當時官員的個人經歷"],"a":2,"e":"政策影響需從人口、土地與社會關係觀察。","s":"現行課程"},{"id":"q36","level":"進階","q":"哪一個排序最符合本單元的大致歷史脈絡？","o":["荷西勢力在臺活動→荷蘭擴張→鄭氏政權進入臺灣","鄭氏政權進入臺灣→西班牙建立北部據點→荷蘭勢力南下","清帝國治理臺灣→荷蘭建立據點→鄭氏政權進入臺灣","日本統治臺灣→西班牙建立據點→荷蘭勢力擴張"],"a":0,"e":"本單元聚焦荷西競逐與其後鄭氏政權。","s":"公開評量題型改編"},{"id":"q37","level":"進階","q":"如果一份資料只記錄統治者的政策，還缺少哪種資料能讓歷史更完整？","o":["更多年份","更多統治者肖像","一般居民與不同族群的生活經驗","更多國旗"],"a":2,"e":"不同群體的生活經驗可補充官方紀錄。","s":"多元視角"},{"id":"q38","level":"進階","q":"臺灣由多個外來勢力先後經營，最適合用哪個詞理解？","o":["自然演化","政權更替與文化交流","氣候循環","地殼運動"],"a":1,"e":"本單元主要談政權競逐、統治與文化交流。","s":"概念整合"},{"id":"q39","level":"進階","q":"某古蹟今天成為觀光景點，這表示文化資產除了歷史價值，也可能具有？","o":["教育與地方文化價值","讓歷史消失的作用","證明所有故事都正確","取代所有課本"],"a":0,"e":"文化資產可用於教育、記憶與地方認同。","s":"延伸應用"},{"id":"q40","level":"進階","q":"比較荷蘭、西班牙與鄭氏政權時，最有意義的表格欄位是？","o":["代表建築的名稱與外觀","重要人物姓名與出生地","據點名稱與活動年代","來臺原因、活動區域、政策與影響"],"a":3,"e":"比較歷史勢力應抓原因、位置、作為與影響。","s":"學習策略"},{"id":"q41","level":"素養","q":"【閱讀】十七世紀歐洲勢力積極前往亞洲尋找貿易機會。臺灣位在中國東南沿海、日本與東南亞之間的海域，荷蘭與西班牙先後在臺建立據點。根據材料，哪一項最能解釋臺灣受到重視的原因？","o":["臺灣的位置與亞洲海上貿易網絡相連","臺灣當時已是世界最大城市","歐洲人只為了看風景","所有亞洲商品都只在臺灣生產"],"a":0,"e":"材料把海上貿易需求與臺灣位置連結起來。","s":"公開課程＋評量題型改編"},{"id":"q42","level":"素養","q":"【閱讀】甲資料：荷蘭人在南臺灣建立據點。乙資料：西班牙人在北臺灣建立據點。丙資料：後來荷蘭勢力向北擴張。三份資料合併後，最適合得到哪個結論？","o":["荷蘭與西班牙從未接觸","臺灣曾是不同國際勢力競逐的空間","北部與南部完全沒有交流","所有政權目的完全一樣"],"a":1,"e":"三項資料共同顯示勢力分布與後來的競逐變化。","s":"公開評量題型改編"},{"id":"q43","level":"素養","q":"【閱讀】一位導覽員介紹古城時說：「這座城在不同時期曾被不同政權使用，名稱與功能也曾改變。」這段話最能提醒我們什麼？","o":["古蹟如果名稱或用途改變，就表示原本歷史價值已被新的使用方式取代","古蹟最重要的是原始樣貌，因此建成後若有改建就會失去研究不同時期歷史的意義","文化資產會隨歷史變遷累積不同層次的意義","不同政權通常會建立新的據點，因此同一地點較少反映多個時期的歷史"],"a":2,"e":"古蹟可能經歷改建、改名與用途變化。","s":"文化資產"},{"id":"q44","level":"素養","q":"【閱讀】某史料記錄荷蘭統治者鼓勵農業生產並徵收相關收益；另一份資料記錄部分居民對統治政策不滿。若要理解這段歷史，最好的做法是？","o":["因資料不同就全部放棄","只相信統治者資料","只相信居民資料","同時比較統治者目的與居民經驗"],"a":3,"e":"多種來源可以呈現不同立場，需比較而非只選一方。","s":"公開評量題型改編"},{"id":"q45","level":"素養","q":"【閱讀】鄭氏政權建立後，更多漢人移入臺灣，農業開墾與聚落發展增加。根據這段資料，最合理的長期影響是？","o":["所有原住民族消失","臺灣立即停止農業","臺灣人口與社會組成逐漸改變","所有歐洲文化痕跡立刻消失"],"a":2,"e":"人口移入與開墾會改變社會組成，但不能推成其他文化完全消失。","s":"現行課程"},{"id":"q46","level":"素養","q":"【題組】小宇看到兩張圖：A圖是十七世紀東亞航路，B圖是荷西在臺活動區域。他說：「只看A圖就能知道誰最後贏得戰爭。」這個說法哪裡有問題？","o":["航路圖能解釋位置，但不足以單獨判定戰爭結果","航路圖只能研究商業活動，因此對戰爭與勢力競爭沒有任何用途","戰爭結果主要由天候決定，因此只要知道航路與風向就可以判斷勝負","地圖只能呈現空間位置，不能和其他史料一起用來研究歷史"],"a":0,"e":"不同資料能回答不同問題，不能把用途過度延伸。","s":"資料素養"},{"id":"q47","level":"素養","q":"【題組】某展覽同時展示荷蘭時期城堡遺址、西班牙相關遺跡與鄭氏政權文物。策展標題哪一個最合適？","o":["近代臺灣交通建設：鐵路、港口與城市發展的變化","臺灣文化的共同特色：不同時代如何形成一致的生活方式","史前臺灣人的生活：遺址、工具與聚落發展的故事","十七世紀臺灣：國際競逐與多元歷史痕跡"],"a":3,"e":"這些材料共同反映大航海時代不同勢力在臺活動。","s":"跨資料整合"},{"id":"q48","level":"素養","q":"【閱讀】一名學生寫道：「荷蘭人曾統治臺灣南部，所以今天南部文化全部來自荷蘭。」老師要求修改。哪個版本最好？","o":["荷蘭統治時間有限，因此今天南部應該已經完全沒有任何相關歷史痕跡","荷蘭統治留下部分歷史與文化痕跡，但今日南部文化是長期多族群、多時期互動的結果","一個地區只要曾被外來政權統治，原有文化通常就會被新的文化全面取代","文化形成主要受到自然環境與氣候影響，和不同時期人群互動關係不大"],"a":1,"e":"文化是長期累積的，不能用單一政權解釋全部。","s":"文化素養"},{"id":"q49","level":"素養","q":"【閱讀】某地方準備修復一處大航海時代相關遺址。有人主張只要做成漂亮景點即可，也有人主張先研究歷史資料並保留原有痕跡。若從文化資產角度判斷，哪個做法較適合？","o":["為了安全與觀光需求，最好全部拆除後依想像重建成完整的新建築","先研究與保存重要歷史資訊，再規畫教育與參觀方式","若能吸引遊客拍照與消費，修復時可以優先考慮外觀效果而非原有痕跡","只要遺址外觀保存完整，就不必另外研究它在不同時期的歷史背景"],"a":1,"e":"文化資產保存重視歷史資訊與教育價值。","s":"素養延伸"},{"id":"q50","level":"素養","q":"【總整】下列哪一組推理最符合第二單元？","o":["臺灣位置具海上價值→不同勢力來臺競逐→政權活動留下社會與文化影響","荷蘭來臺→所有文化消失→臺灣與世界隔絕","西班牙來臺→臺灣移到歐洲→鄭氏政權出現","有古蹟→代表所有歷史都沒有爭議"],"a":0,"e":"第二單元的核心是從位置、國際競逐到後續社會文化變化的連鎖關係。","s":"總整"}];
let activeSegment='基礎';

function save(){
 localStorage.setItem(WALLET_KEY,String(state.wallet));
 localStorage.setItem(UNIT_SCORE_KEY,String(state.unitScore));
 localStorage.setItem(AWARDS_KEY,JSON.stringify([...state.awards]));
 localStorage.setItem(MISTAKES_KEY,JSON.stringify(state.mistakes));
 localStorage.setItem(RESUME_KEY,JSON.stringify(state.resume));
}
function award(id){
 if(state.awards.has(id))return false;
 state.awards.add(id);state.unitScore=Math.min(UNIT_MAX,state.unitScore+5);state.wallet+=5;save();renderScore();renderProgress();renderResume();renderMistakes();updateSegmentUI();return true;
}
function renderAll(){renderScore();renderProgress();renderResume();renderMistakes();updateSegmentUI();}
function renderScore(){
 document.querySelector('#scoreText').textContent=`${state.wallet} 點`;
 document.querySelector('#scoreProgress').hidden=true;
 document.querySelector('#unitScoreText').textContent=`本單元 ${state.unitScore} / 250`;
}
function renderProgress(){
 const done=questions.filter(q=>state.awards.has(q.id)).length;
 document.querySelector('#heroDone').textContent=done;
 document.querySelector('#challengeProgressText').textContent=`已完成 ${done} / 50 題`;
 document.querySelector('#challengeProgress').value=done;
 const r=document.querySelector('#unitResult');
 r.hidden=done!==50;
 if(done===50)r.innerHTML='<div class="completion-medal" aria-hidden="true">🏅</div><div><strong>第二單元挑戰完成！</strong><p>50 / 50 題全部完成，本單元獲得 250 / 250 點。</p></div>';
}
function showPanel(id){
 document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===id));
 document.querySelectorAll('.tab-btn[data-target]').forEach(b=>b.toggleAttribute('aria-current',b.dataset.target===id));
 history.replaceState(null,'',`#${id}`);
 const p=document.getElementById(id);const nav=document.querySelector('.lesson-nav');
 window.scrollTo({top:Math.max(0,p.getBoundingClientRect().top+scrollY-(nav?.offsetHeight||0)-12),behavior:'auto'});
}
document.querySelectorAll('[data-target]').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.target)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.go)));

function segmentQuestions(level=activeSegment){return questions.filter(q=>q.level===level);}
function updateSegmentUI(){
 const cfg={基礎:['第一區｜基礎 20 題','先掌握人物、位置與主要事件之間的關係。',20],進階:['第二區｜進階挑戰 20 題','比較原因、證據與不同群體的影響。',20],素養:['第三區｜素養 10 題','閱讀較長材料，整合不同線索再判斷。',10]}[activeSegment];
 document.querySelector('#segmentTitle').textContent=cfg[0];
 document.querySelector('#segmentIntro').textContent=cfg[1];
 const done=segmentQuestions().filter(q=>state.awards.has(q.id)).length;
 document.querySelector('#segmentProgressText').textContent=`已完成 ${done} / ${cfg[2]} 題`;
 document.querySelector('#challenge').dataset.activeSegment=activeSegment;
 document.querySelectorAll('.segment-btn').forEach(btn=>{
  const level=btn.dataset.segment, qs=segmentQuestions(level), n=qs.filter(q=>state.awards.has(q.id)).length, complete=n===qs.length;
  btn.setAttribute('aria-pressed',String(level===activeSegment));
  btn.classList.toggle('segment-complete',complete);
  btn.querySelector('[data-count-for]').textContent=`${n} / ${qs.length}`;
  btn.querySelector('[data-state-for]').textContent=complete?'✓ 已完成':n?'進行中':'尚未開始';
 });
}
function showSegment(level,{scroll=true}={}){
 activeSegment=level;renderQuestions();updateSegmentUI();
 if(scroll){
  const t=document.querySelector('#segmentTitle'),nav=document.querySelector('.lesson-nav'),sticky=document.querySelector('.challenge-progress');
  window.scrollTo({top:Math.max(0,t.getBoundingClientRect().top+scrollY-(nav?.offsetHeight||0)-(sticky?.offsetHeight||0)-24),behavior:'auto'});
 }
}
function renderQuestions(){
 const wrap=document.querySelector('#questionList');wrap.innerHTML='';
 const base=activeSegment==='基礎'?0:activeSegment==='進階'?20:40;
 segmentQuestions().forEach((item,i)=>{
  const done=state.awards.has(item.id);
  const read=/^【(閱讀|題組|總整)】/.test(item.q), stem=read?item.q.replace(/^【[^】]+】/,'').trim():item.q;
  const d=document.createElement('article');
  d.className='quiz challenge-question segment-question-'+(activeSegment==='基礎'?'basic':activeSegment==='進階'?'advanced':'literacy')+(done?' correct':'');
  d.dataset.quiz=item.id;
  d.innerHTML=`<div class="question-meta"><span class="level-chip">${item.level}</span><span>第 ${base+i+1} / 50 題</span><span class="source-chip">${item.s}</span>${done?'<span class="done-chip">✓ 已完成</span>':''}</div>${read?'<div class="reading-material-tag">閱讀材料</div>':''}<div class="${read?'question-stem reading-stem':'question-stem'}"><h4>${stem}</h4></div><fieldset class="answer-options"><legend class="sr-only">請選擇一個答案</legend>${item.o.map((t,j)=>`<label class="answer-option"><input type="radio" name="${item.id}" value="${j}"><span class="option-letter" aria-hidden="true">${String.fromCharCode(65+j)}</span><span class="option-text">${t}</span></label>`).join('')}</fieldset><div class="question-actions"><button class="check bank-check">送出答案</button></div><p class="feedback" aria-live="polite">${done?'✅ 這題已完成並取得 5 點。':''}</p>`;
  wrap.appendChild(d);
 });
 document.querySelectorAll('.answer-option input').forEach(input=>input.addEventListener('change',()=>{
  const box=input.closest('.challenge-question');box.querySelectorAll('.answer-option').forEach(x=>x.classList.remove('option-selected'));input.closest('.answer-option').classList.add('option-selected');
 }));
 document.querySelectorAll('.bank-check').forEach(btn=>btn.addEventListener('click',()=>{
  const box=btn.closest('.challenge-question'),item=questions.find(q=>q.id===box.dataset.quiz),sel=box.querySelector('input:checked'),fb=box.querySelector('.feedback');
  if(!sel){fb.textContent='請先選一個答案。';return;}
  state.resume={id:item.id,level:item.level};localStorage.setItem(RESUME_KEY,JSON.stringify(state.resume));
  if(Number(sel.value)===item.a){
   const gained=award(item.id);fb.textContent=(gained?'✅ 答對！+5 點。 ':'✅ 答對！這題已領取過。 ')+item.e;
   box.classList.add('correct');box.classList.remove('incorrect');
   box.querySelectorAll('.answer-option').forEach(x=>x.classList.remove('option-wrong','option-right'));
   sel.closest('.answer-option')?.classList.add('option-right');
   const meta=box.querySelector('.question-meta');
   if(meta && !meta.querySelector('.done-chip')){
    const chip=document.createElement('span');chip.className='done-chip';chip.textContent='✓ 已完成';meta.appendChild(chip);
   }
  }else{
   fb.textContent='🔍 目前答案不對。重新找出「誰、為什麼、造成什麼影響」再判斷；訂正後仍可拿完整 5 點。';
   box.classList.add('incorrect');box.classList.remove('correct');
   box.querySelectorAll('.answer-option').forEach(x=>x.classList.remove('option-wrong','option-right'));
   sel.closest('.answer-option')?.classList.add('option-wrong');
   if(!state.mistakes.some(m=>m.id===item.id)){state.mistakes.push({id:item.id,text:item.q,level:item.level});save();renderMistakes();}
  }
 }));
}
document.querySelectorAll('.segment-btn').forEach(b=>b.addEventListener('click',()=>showSegment(b.dataset.segment)));

function nextQuestion(){const start=questions.findIndex(q=>q.id===state.resume?.id);for(let i=Math.max(0,start+1);i<questions.length;i++)if(!state.awards.has(questions[i].id))return questions[i];return questions.find(q=>!state.awards.has(q.id));}
function renderResume(){
 const c=document.querySelector('#resumeCard'),done=questions.filter(q=>state.awards.has(q.id)).length;
 if(!state.resume&&done===0){c.hidden=true;return;} c.hidden=false;
 const n=nextQuestion();
 if(!n){document.querySelector('#resumeTitle').textContent='第二單元 50 題已完成';document.querySelector('#resumeText').textContent='可以前往錯題小本本複習。';return;}
 const idx=questions.findIndex(q=>q.id===n.id)+1;
 document.querySelector('#resumeTitle').textContent=`繼續第二單元挑戰｜第 ${idx} 題`;
 document.querySelector('#resumeText').textContent=`目前已完成 ${done} / 50 題；下一題位於「${n.level}」區。`;
}
document.querySelector('#resumeChallenge').addEventListener('click',()=>{
 const n=nextQuestion();if(!n)return;
 showPanel('challenge');showSegment(n.level,{scroll:false});
 requestAnimationFrame(()=>{
  const card=document.querySelector(`[data-quiz="${n.id}"]`);if(!card)return;
  const offset=(document.querySelector('.lesson-nav')?.offsetHeight||0)+(document.querySelector('.challenge-progress')?.offsetHeight||0)+24;
  window.scrollTo({top:Math.max(0,card.getBoundingClientRect().top+window.scrollY-offset),behavior:'auto'});
  const heading=card.querySelector('h4');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
 });
});

let mistakeFilter='全部';
function renderMistakes(){
 const wrap=document.querySelector('#mistakeList'),all=state.mistakes,corrected=all.filter(m=>state.awards.has(m.id)).length;
 document.querySelector('#mistakeTotal').textContent=all.length;
 document.querySelector('#mistakeCorrected').textContent=corrected;
 document.querySelector('#mistakePending').textContent=all.length-corrected;
 let visible=all;
 if(mistakeFilter==='待複習')visible=all.filter(m=>!state.awards.has(m.id));
 else if(mistakeFilter!=='全部')visible=all.filter(m=>m.level===mistakeFilter);
 wrap.innerHTML='';
 if(!all.length){wrap.innerHTML='<div class="mistake-empty"><span aria-hidden="true">✨</span><strong>目前沒有錯題</strong><p>挑戰中答錯的題目會自動出現在這裡。</p></div>';return;}
 if(!visible.length){wrap.innerHTML='<div class="mistake-empty"><strong>這個分類目前沒有題目</strong><p>可以切換其他分類查看。</p></div>';return;}
 visible.forEach(m=>{
  const fixed=state.awards.has(m.id),item=questions.find(q=>q.id===m.id),card=document.createElement('article');
  card.className='mistake-card '+(fixed?'is-corrected':'is-pending');
  card.innerHTML=`<div class="mistake-meta"><span class="level-chip">${m.level}</span><span class="mistake-status">${fixed?'✓ 已訂正':'待複習'}</span></div><h3>${m.text}</h3><p>${fixed?(item?.e||'已重新答對，可以考前再確認一次。'):'先回到原題重新閱讀與判斷。'}</p><button type="button" class="secondary review-question" data-review-id="${m.id}" data-review-level="${m.level}">回到這一題</button>`;
  wrap.appendChild(card);
 });
 document.querySelectorAll('.review-question').forEach(btn=>btn.addEventListener('click',()=>{
  showPanel('challenge');showSegment(btn.dataset.reviewLevel,{scroll:false});
  requestAnimationFrame(()=>{
   const card=document.querySelector(`[data-quiz="${btn.dataset.reviewId}"]`);if(!card)return;
   const offset=(document.querySelector('.lesson-nav')?.offsetHeight||0)+(document.querySelector('.challenge-progress')?.offsetHeight||0)+24;
   window.scrollTo({top:Math.max(0,card.getBoundingClientRect().top+window.scrollY-offset),behavior:'auto'});
   const heading=card.querySelector('h4');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
  });
 }));
}
document.querySelectorAll('.mistake-filter').forEach(btn=>btn.addEventListener('click',()=>{
 mistakeFilter=btn.dataset.mistakeFilter;
 document.querySelectorAll('.mistake-filter').forEach(b=>{const active=b===btn;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
 renderMistakes();
}));
showSegment(state.resume?.level||'基礎',{scroll:false});renderAll();showPanel(location.hash.slice(1)&&document.getElementById(location.hash.slice(1))?location.hash.slice(1):'home');