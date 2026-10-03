# Sera.Phina 國考 OTP 存取邊界查核

日期：2026-10-03

## 查核目的
確認 /sera-phina/learning-lab/national-exam/ 是否已具備「真正的受限區域」條件，足以與 AML 公開網站的無障礙認證範圍分開。

## Repository 查核結果

### 1. 頁面宣告
國考精神領域 AI 複習實驗室頁面：
- 有 noindex,nofollow,noarchive。
- 明確寫明僅開放亞洲大學學生與教職員。
- 明確寫明以 @live.asia.edu.tw / @asia.edu.tw 信箱接收 OTP。

### 2. AML Worker
目前 worker/index.js：
- 只針對 /api/sera-phina/interview/* 與感控 API 做 Worker 邏輯。
- 其餘網址直接 return env.ASSETS.fetch(request)。
- 未看到 national-exam 路徑的 OTP / auth middleware。

### 3. 國考頁面與 JS
- national-exam/index.html 與 practice.html 均為靜態頁。
- exam.js 未看到 OTP / login / auth / token 驗證邏輯。
- data/questions.js 直接包含題目、選項、答案與解析資料。
- repo 內沒有 _headers / _redirects / Access policy / OTP middleware 設定檔可證明此目錄在部署層被保護。

## 目前能得出的結論
從 repository 與 Worker 程式碼本身，**無法證明** Sera.Phina 國考複習實驗室已被伺服器端或邊緣層 OTP 真正保護。

更重要的是，題庫資料本身以靜態 JS 檔部署；如果 Cloudflare Access 沒有在 repository 外部對整個目錄實施保護，未登入訪客理論上仍可能直接取得：
- /sera-phina/learning-lab/national-exam/
- /sera-phina/learning-lab/national-exam/practice.html
- /sera-phina/learning-lab/national-exam/data/questions.js

因此在無障礙認證範圍判斷上，現階段不能只因頁面寫有 OTP 就將它視為 RESTRICTED。

## 唯一可能的真正保護來源
若目前真的已啟用 OTP，最可能是在 repository 外：
- Cloudflare Access / Zero Trust policy
- Cloudflare Pages / Workers 的外部存取規則
- 其他上游 identity proxy

這類設定不會出現在目前 repository，因此必須從實際未登入瀏覽結果或 Cloudflare Dashboard 驗證。

## 送件前判定規則

### 若未登入開啟上述 URL 會先被導向 Cloudflare Access / OTP
則可分類為：
- 國考入口：LOGIN ENTRY
- 驗證後題庫：RESTRICTED

### 若未登入可以直接看到頁面或直接讀取 questions.js
則目前仍應分類為：
- PUBLIC / PUBLICLY DEPLOYED CONTENT
不得因 noindex 或頁面文字寫「僅限登入」而排除。

## 建議
在正式無障礙送件前，將這個目錄列為「VERIFY EXTERNALLY」而非直接排除。只要完成一次未登入測試即可定案。
