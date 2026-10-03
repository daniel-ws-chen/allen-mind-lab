# AML Freego 前人工 QA Checklist

更新日期：2026-10-03

這份清單是 AML 在送交 Freego／正式無障礙檢測前的「人工驗收層」。它不取代官方檢測，也不代表網站已達成任何等級；用途是把靜態 CI 無法可靠判斷的事項固定下來，避免靠記憶逐頁重複檢查。

## 1. 驗收範圍

- 以 `docs/ACCESSIBILITY_PUBLIC_URLS.md` 的公開 URL 基線為主。
- restricted candidates 在沒有真實 edge/server authentication 證據前，仍視為公開部署風險，不因 sitemap 缺席而自動排除。
- 每次人工 QA 至少涵蓋：
  - 首頁：`/`
  - 主題館藏：`/articles.html`
  - 完整文章館藏：`/library.html`
  - 閱讀路徑：`/reading-paths.html`
  - 進階自學室：`/self-study.html`
  - 互動實驗室：`/tools.html`
  - 精選資源：`/resources.html`
  - 一篇典型文章
  - 一個互動工具
  - 一個表單／測驗
  - Management Coach
  - PBS Companion

## 2. 鍵盤操作

逐頁只使用 Tab / Shift+Tab / Enter / Space / Escape：

- [ ] 第一個可操作項目可到達「跳到主要內容」。
- [ ] 啟動 skip link 後，焦點真正移到主要內容，不只是畫面捲動。
- [ ] 所有可互動元件都有可見焦點。
- [ ] 焦點順序符合視覺與閱讀順序。
- [ ] 沒有焦點跳進收合、隱藏或 aria-hidden 區塊。
- [ ] details / menu / dialog / panel 可用鍵盤開啟與關閉。
- [ ] Escape 關閉後，焦點回到合理的觸發控制項。
- [ ] mobile menu 關閉時，其中連結不會留在 Tab 序列。
- [ ] Engineering Bay 關閉時，hotspot / route 不會留在 Tab 序列。
- [ ] 首頁曦兒 dialog 的 Tab 不會逃出 dialog。
- [ ] 不存在只能 hover 才能取得的重要資訊或操作。

## 3. 焦點與視覺狀態

- [ ] 深色、淺色、漸層背景上的 focus ring 都清楚可辨。
- [ ] hover 才出現的重要資訊，也能在 focus 或一般畫面取得。
- [ ] focus 不會被 sticky navigation 或其他固定元件遮住。
- [ ] current-page 狀態不是只靠顏色辨識。
- [ ] disabled 狀態與一般狀態可辨識。

## 4. 文字、縮放與 reflow

在桌面瀏覽器測試：

- [ ] 200% zoom 時仍能閱讀與操作。
- [ ] 400% zoom 時核心流程沒有水平與垂直雙向捲動造成無法操作。
- [ ] 約 320 CSS px 寬度時，主要內容可單欄閱讀。
- [ ] 表格如需要水平捲動，使用者仍能理解表頭與內容。
- [ ] 按鈕、標籤、輸入框文字沒有被截斷。
- [ ] 不以固定高度造成文字溢出或被遮蔽。

## 5. 色彩與圖片背景

- [ ] 一般正文文字與背景對比人工抽查。
- [ ] 小字、muted text、caption、meta、placeholder 特別抽查。
- [ ] 漸層背景上的文字逐區確認。
- [ ] 圖片上疊字／hotspot label 在實際圖片上仍清楚。
- [ ] focus indicator 與相鄰顏色有足夠辨識度。
- [ ] 不只靠紅／黃／綠或其他單一顏色傳遞必要資訊。

## 6. 圖片與非文字內容

- [ ] 有資訊目的的圖片 alt 能表達用途。
- [ ] 純裝飾圖片使用空 alt 或從輔助科技隱藏。
- [ ] 圖片中的文字不是理解內容的唯一來源。
- [ ] 海報／地圖／圖像互動旁有等價文字入口。
- [ ] SVG icon 若本身不需朗讀，不製造多餘名稱。

## 7. 標題、landmark 與閱讀順序

- [ ] 每頁只有一個合理 H1。
- [ ] H2/H3 層級不因純視覺需求而亂跳。
- [ ] main / nav / footer 等 landmark 可理解。
- [ ] 重複導覽有可辨識名稱。
- [ ] 頁面 title 能辨識目前頁面。
- [ ] 頁面主要語言設定正確。

## 8. 表單、錯誤與動態訊息

- [ ] 每個輸入欄位都有可程式判定的標籤。
- [ ] required / invalid 狀態不是只靠顏色。
- [ ] 錯誤發生時，訊息說明「哪裡錯、怎麼改」。
- [ ] 必要時焦點移到第一個需要修正的欄位。
- [ ] 成功、匯入、複製、分析完成等狀態可被 live region 感知。
- [ ] alert / status 不會重複朗讀或大量干擾。
- [ ] placeholder 不作為唯一 label。

## 9. 表格

- [ ] 每個資料表都有可理解的用途／caption 或相鄰說明。
- [ ] column / row header 使用 th。
- [ ] 必要時使用 scope。
- [ ] 空白表頭不是唯一的操作欄說明。
- [ ] 手機水平捲動後仍可理解欄位。

## 10. Dialog / 收合區 / 動態 panel

- [ ] dialog 開啟時焦點進入 dialog。
- [ ] modal dialog 的焦點不會跑到背景頁面。
- [ ] dialog 可 Escape 關閉。
- [ ] 關閉後焦點回到觸發按鈕。
- [ ] 收合區內的可操作控制項在收合時不可聚焦。
- [ ] aria-expanded / aria-hidden / inert / hidden 等狀態彼此一致。

## 11. Reduced motion

系統開啟「減少動態效果」後：

- [ ] 自動動畫停止或顯著減少。
- [ ] scrollIntoView / panel transitions 不強迫平滑動畫。
- [ ] 動畫停止後不會失去內容或功能。
- [ ] 閃爍／循環動畫不是理解內容的必要條件。

## 12. 螢幕閱讀器抽查

至少以一套桌面螢幕閱讀器做代表性流程：

- [ ] 從頁首 landmarks / headings 能快速理解頁面結構。
- [ ] 導覽、按鈕、連結的可存取名稱合理。
- [ ] dialog 標題與說明會被讀出。
- [ ] form label / error / status 能被讀出。
- [ ] 表格移動時能理解欄列標題。
- [ ] 裝飾圖示沒有造成大量噪音。

## 13. 公開範圍與驗證邊界

- [ ] infection-control pilot 未取得真實 edge/server authentication 前，不宣稱為 private。
- [ ] Sera.Phina national-exam 只有在實際未登入測試／Access policy 證據完成後，才可標為 restricted。
- [ ] 直接測試受保護目錄下的 HTML 與資料檔，不只測入口頁。
- [ ] sitemap / noindex / 隱藏連結不當作存取控制。

## 14. Freego 前最後紀錄

- [ ] Accessibility preflight workflow 最新 head = success。
- [ ] Cloudflare branch preview 最新 head = deploy successful。
- [ ] 把 Freego 掃描日期、網址範圍與結果保存。
- [ ] 對每一個 Freego 錯誤記錄：URL、規則、修正 commit、重測結果。
- [ ] 人工 QA 未完成的項目不得寫成「已通過」。
- [ ] 最終仍保留「自動掃描不能取代人工檢測」的註記。

## 建議驗收節奏

第一輪先走「首頁 → 館藏 → 文章 → 工具 → 表單」五種代表頁，把共通問題修掉；第二輪再抽查 104 個公開 URL 中的不同模板；最後才跑正式全站 Freego。這樣能避免同一個共用問題在數十頁重複報錯。
