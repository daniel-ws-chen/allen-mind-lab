# AML Screen Reader 最小驗收腳本

更新日期：2026-10-03  
Branch：`accessibility/phase1-a-preflight`

這份腳本定義「最低限度」的螢幕閱讀器驗收。建議 Windows 使用 NVDA + Chrome/Edge；macOS 可用 VoiceOver + Safari 作交叉抽查。若只有一套環境可用，先完成一套，再在紀錄中標明限制。

## SR-1｜首頁

1. 從頁首開始，以 headings / landmarks 快速導覽。
   - 預期：可辨識 nav、main、footer。
2. 用 heading navigation 確認 H1/H2 層級能理解頁面結構。
3. 聚焦曦兒入口。
   - 預期：會讀出「開啟曦兒 AML 導航」與 button/dialog 關係。
4. 開啟曦兒 dialog。
   - 預期：讀出 dialog 名稱與說明。
5. Tab chips、textarea、submit。
   - 預期：控制項名稱清楚。
6. 送出空白內容。
   - 預期：錯誤／提示可被讀到。
7. Escape 關閉。
   - 預期：焦點回到曦兒入口。

## SR-2｜Management Coach

1. 用 landmarks / headings 了解頁面結構。
2. 不完成課前評量直接下一步。
   - 預期：錯誤訊息會被讀出，焦點落到正確欄位。
3. 完成後切換 panel。
   - 預期：新 panel H2 被讀到。
4. 觸發 import / workspace status。
   - 預期：role=status 訊息可被讀到，但不重複朗讀。
5. 組員模式重做一次缺漏流程。

## SR-3｜PBS Companion

1. 聚焦 target behavior。
   - 預期：label 與欄位角色可理解。
2. 留白執行分析。
   - 預期：invalid / alert 被讀到。
3. 聚焦 ABC 表。
   - 預期：caption「ABC 行為紀錄」可辨識。
4. 在 table navigation 下移動。
   - 預期：column header 能被讀出。
5. 七週期策略表同樣確認 caption 與表頭。
6. 分析完成／報告完成訊息可被 live region 讀到。

## SR-4｜自學 Quiz

管理學與 PBS 各抽一套完整流程：

1. 題目 heading 可被讀到。
2. 選項角色、名稱與選取狀態清楚。
3. 下一題／結果切換後，新 heading 可被讀到。
4. 姓名漏填時，錯誤訊息讀得到且焦點位置合理。
5. 結果不是只靠顏色區分。
6. 憑證下載／列印按鈕名稱清楚。

## SR-5｜典型文章

1. heading navigation 可快速理解長文結構。
2. 圖片 alt 不重複檔名或無意義描述。
3. share buttons 名稱清楚。
4. 複製成功後 status 被讀到一次。
5. related reading 連結名稱能單獨理解。
6. 若有 table，header navigation 正確。

## SR-6｜全站噪音抽查

特別留意：
- 純裝飾 emoji / SVG 是否大量被朗讀。
- icon + visible text 是否重複名稱。
- hidden / aria-hidden 區塊是否仍被讀到。
- live region 是否反覆廣播同一訊息。
- 導覽中相同 link text 是否缺乏必要情境。

## 結果紀錄格式

```
日期：
OS / Screen reader / Browser：
URL：
操作：
預期：
實際：
問題等級：
修正 commit：
重測：
```

## 完成門檻

最低門檻：
- 首頁、Management Coach、PBS Companion、其中一套 Quiz、至少一篇文章完成實測。
- 所有 Blocker 修正。
- Major 修正或有明確例外。
- 對未測的作業系統／screen reader 不宣稱通過。
