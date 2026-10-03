# AML 無障礙認證：公開檢測範圍地圖

日期：2026-10-03  
用途：在正式 Freego / 人工檢測前，先界定「公開主站」「公開工具」「受限系統」「非公開工程檔」的範圍。

## A. 明確屬於公開檢測範圍
以下為 AML 主站公開頁面與公開工具，應視為 A 級認證主要檢測範圍：

- 首頁、About、Research、Publications、Recognition
- Articles、Library、Reading Paths、Self-study、My AML
- OT / PBS / Management / Education / AI / Mind / Notes 等主題頁
- Contact / Resources / Privacy / Terms / Search
- tools.html 互動實驗室
- 未受登入限制的互動工具與自學測驗
- sitemap.xml 已列出的文章、學習頁與公開工具

原則：凡一般訪客可直接由 AML 導覽、站內連結或 sitemap 進入者，均優先按「公開」處理，不先假設可排除。

## B. 公開入口 + 受限功能：需特別處理

### 感控防治文件填報智能助理 Pilot
路徑：
- /tools/infection-control-pilot/
- /tools/infection-control-pilot/cluster.html
- /tools/infection-control-pilot/tracking.html
- /tools/infection-control-pilot/dashboard.html

目前狀態：
- 四頁皆已有 meta robots=noindex,nofollow。
- 未列入 sitemap.xml。
- 但 tools.html 仍公開連結到 /tools/infection-control-pilot/。
- 目前登入機制為前端 JavaScript 共用帳密 gate；登入後內容仍隨 HTML/JS 一起公開部署。
- 因此目前「不能把登入後區域視為真正受到伺服器端保護的私有內容」。

認證範圍判斷：
- 登入入口既然可由公開 tools.html 進入，應先視為公開頁面處理。
- 登入後內容只有在改成真正的伺服器端／Cloudflare Access／OTP 身分驗證後，才適合主張為受限區域並與公開檢測範圍分開。
- 在此之前，不應讓 accessibility audit 自動忽略整個 infection-control-pilot 目錄。

## C. Sera.Phina 子網站：目前仍是公開範圍風險

路徑：/sera-phina/

目前狀態：
- 與 AML 共用 allenmindlab.com 網域並由同一 build 流程發布。
- resources.html 公開連到 /sera-phina/。
- tools.html 公開連到 /sera-phina/learning-lab/。
- 因此即使 Sera.Phina 不在 AML 主 sitemap 中，也不能只靠「未列 sitemap」就假設完全不在公開網站範圍。

建議：
- 送件前確認認證案件是否以整個網域、指定站點或指定目錄為檢測單位。
- 若 Sera.Phina 必須保留公開且同網域，保守做法是將其公開頁同步納入無障礙預檢。
- 若希望 AML 與 Sera.Phina 的認證範圍完全分離，需使用明確的網站邊界設計，而不是只靠 sitemap 排除。

## D. 非獨立公開頁 / 工程檔
例如：
- lumi-tools-replacement.html
- repository-only snippets
- source templates / superseded files
- build script、wrangler、validator、audit scripts

這些不是正常公開導覽頁，不應與使用者可瀏覽頁混為一談。build-dist.mjs 已排除部分工程檔；accessibility audit 也已調整為忽略沒有 <html> 根元素的片段檔。

## E. 目前最重要的決策

### 1. 不停止 A 級準備
AML 主站仍有大量明確公開內容，持續做 A 級預檢有價值。

### 2. 先處理「受限工具邊界」
在正式送件前，要將真正受限的工具改為真正的身分驗證邊界。單純前端隱藏、共用帳密或 JavaScript gate 不足以形成可靠的私有區。

### 3. OTP / 私有工具原則
若未來工具採真正 OTP、Cloudflare Access 或伺服器端驗證：
- 公開登入入口仍需符合無障礙要求。
- 成功驗證後的私有工作區可再依官方案件範圍確認是否排除。
- 不提供測試帳號前，不應主動把私有內容納入公開掃描。

### 4. 正式 Freego 前的範圍清單
最後送件前應產出：
- INCLUDE：正式公開檢測 URL
- LOGIN ENTRY：公開登入入口
- RESTRICTED：真正受保護的登入後區域
- EXCLUDE：非公開工程／測試檔
- SUBSITE：Sera.Phina 等同網域子站，另行確認邊界

## 結論
目前最大的範圍風險不是「AML 有登入工具所以不能申請」，而是「哪些頁面真的公開、哪些頁面只是視覺上被登入畫面遮住」。

只要先把身分驗證邊界做真，再明確列出公開檢測 URL，AML 的 A 級準備仍可繼續。
