# AML 工具公開／受限存取盤點

日期：2026-10-03  
目的：支援網站無障礙認證前的範圍界定，避免把真正私有工具與公開內容混在同一檢測範圍。

## 1. 建議維持公開：納入 AML A 級預檢
下列工具目前沒有登入 gate，屬一般訪客可直接使用或瀏覽的公開功能，建議納入無障礙檢測：

- /clinical-training.html
- /pbs-companion-web.html
- /pbs-transition-assessment.html
- /tools/ai/
- /tools/ai-cocreation-lab/
- /tools/ai-collaboration-principles/
- /tools/ai-judgment-challenge/
- /tools/behavior-detective.html
- /tools/energy-rhythm/
- /tools/management/
- /tools/management-advanced/
- /tools/management-coach/
- /tools/management-decision-lab/
- /tools/management-fairness-challenge/
- /tools/management-interactive/
- /tools/management-self-study/
- /tools/management-summary/
- /tools/pbs/
- /tools/pbs-function-challenge/
- /tools/pbs-interactive/
- /tools/pbs-summary/
- /tools/pbs-transition-assessment.html
- /tools/section-chief-busy.html
- /tools/self-awareness/
- /tools/self-awareness-summary/
- /tools/sensory/

備註：
- Management Coach 雖為 noindex，但目前並沒有登入限制；noindex 不等於私有。
- 使用 localStorage 只代表本機保存狀態，並不構成存取限制。

## 2. 明確受限用途：應建立真正的私有邊界

### AML 感控防治文件填報智能助理 Pilot
路徑：
- /tools/infection-control-pilot/
- /tools/infection-control-pilot/cluster.html
- /tools/infection-control-pilot/tracking.html
- /tools/infection-control-pilot/dashboard.html

目前程式狀態：
- 已標示 noindex,nofollow。
- 未列入 sitemap。
- tools.html 仍有公開入口。
- repo 內可確認目前採前端 JavaScript 共用帳號密碼 + sessionStorage gate。
- 登入後內容仍包含在公開部署 HTML / JS 中，因此目前不是可靠的伺服器端私有區。

建議分類：
- 目前：LOGIN ENTRY + PUBLICLY DEPLOYED RESTRICTED UI
- 正式上線前：改為 REAL RESTRICTED AREA（Cloudflare Access / OTP / server-side auth）

## 3. Sera.Phina OTP 工具：暫列「外部驗證邊界待確認」

### 國考精神領域 AI 複習實驗室
路徑：
- /sera-phina/learning-lab/national-exam/

repo 內可確認：
- 頁面清楚標示僅開放亞洲大學學生與教職員。
- 頁面文字明確說明使用 @live.asia.edu.tw / @asia.edu.tw 信箱取得一次性驗證碼 OTP。
- 頁面本身為 noindex。

但 repo 內目前沒有看到 OTP 驗證邏輯直接實作在該頁或 exam.js；因此很可能驗證是由外部層（例如 Cloudflare Access、Worker route、第三方驗證服務）處理，或尚未完整落在此 repository。

送件前必要確認：
- 未登入狀態下，是否真的無法取得 practice / 題庫內容。
- 驗證是否發生在伺服器／邊緣層，而不是單純前端隱藏。
- 若確實由 Cloudflare Access / OTP 擋住，則登入入口需做無障礙，登入後私有內容可再依官方案件範圍主張排除。

## 4. 判定原則

### PUBLIC
任何人直接輸入 URL 即可看到完整功能或內容。

### LOGIN ENTRY
任何人都能看到登入／OTP 頁面，但必須驗證後才能進入工作區。此入口本身仍應符合無障礙。

### RESTRICTED
未通過伺服器端／邊緣層驗證前，伺服器不提供受保護內容。這才是真正可以和公開檢測範圍切開的私有區。

### NOT PRIVATE
以下不算私有：
- noindex
- 不列 sitemap
- hidden / display:none
- 前端 JavaScript gate
- localStorage / sessionStorage flag
- 共用帳號密碼寫在前端 JS

## 5. AML 目前最適合的架構

- AML 主站與一般互動工具：PUBLIC → 做 A 級
- 感控 Pilot：改為真正 RESTRICTED
- Sera.Phina 國考 OTP：確認目前外部驗證是否已是真正 RESTRICTED
- 其他未來含敏感資料工具：預設採 RESTRICTED，不使用前端假登入

## 6. 下一個技術決策
無障礙工程可以繼續，但正式申請前應先完成：
1. 感控 Pilot 真正身份驗證邊界。
2. 驗證 Sera.Phina 國考 OTP 是否真正在伺服器／邊緣層阻擋內容。
3. 產出最終 INCLUDE / LOGIN ENTRY / RESTRICTED / EXCLUDE URL 清單。


## 7. Sera.Phina 國考 OTP 深入查核結果
已新增 docs/SERAPHINA_NATIONAL_EXAM_ACCESS_AUDIT.md。

目前 repo / Worker 可確認：
- national-exam 頁面宣告 OTP 與學校信箱限制。
- 但 AML Worker 沒有 national-exam auth middleware。
- exam.js 沒有 OTP 驗證邏輯。
- data/questions.js 直接包含題目、答案與解析。
- repo 內無 Access policy / _headers / _redirects 等可證明目錄被保護的設定。

因此在實際驗證 Cloudflare 外部 Access policy 前，該目錄維持 VERIFY EXTERNALLY，不直接視為 RESTRICTED。
