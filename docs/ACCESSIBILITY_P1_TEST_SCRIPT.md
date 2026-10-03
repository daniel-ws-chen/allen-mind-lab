# AML P1 人工無障礙測試腳本

更新日期：2026-10-03  
Branch：`accessibility/phase1-a-preflight`

P1 用來驗證公開資訊型頁面與測驗流程。這些頁面不像 P0 那麼高互動，但很容易在縮放、卡片 metadata、結果區或憑證流程出現細部問題。

## 共通規則

- 使用 branch preview。
- 每頁先做 keyboard-only，再做 200% zoom 與 320px。
- 有互動流程／結果區者加做 400%。
- 不以「看起來差不多」判定；每一頁至少走到 footer。
- 發現問題時，用 Blocker / Major / Minor 分級，並記錄 selector。

---

## P1-1｜完整文章館藏 `/library.html`

### 鍵盤
1. 啟動 skip link。
2. Tab 走過搜尋、篩選、卡片與 footer。
3. 若搜尋欄位存在：
   - 輸入關鍵字。
   - 送出搜尋。
   - 清除／重設。
   - 預期：焦點順序合理，按鈕名稱可理解。
4. 確認任何 topic meta / tag 不會因 nowrap 讓焦點或文字溢出。

### 200% / 320px
- 搜尋列可換行或堆疊。
- 送出按鈕文字完整。
- 館藏卡片 metadata 不重疊。
- 不應有頁面級水平捲動。
- filter / tag 若很多，應可換行而不是把頁面撐寬。

---

## P1-2｜主題館藏 `/articles.html`

### 鍵盤
1. 啟動 skip link。
2. Tab 走過 topic halls / article cards。
3. 確認所有卡片都能以鍵盤進入。
4. hover 出現的視覺變化不應承載唯一資訊。

### 200% / 320px
- topic meta 最後一欄目前使用 nowrap，特別確認不造成溢出。
- Notes bridge CTA 不可把容器撐寬。
- 卡片縮成單欄後，日期、tag、標題、摘要閱讀順序合理。
- 圖片與文字不互相覆蓋。

---

## P1-3｜閱讀路徑 `/reading-paths.html`

### 鍵盤
1. 啟動 skip link。
2. 逐一 Tab 到閱讀路徑卡片。
3. 每張卡片 focus ring 可見。
4. 進入一個路徑後返回，確認焦點／瀏覽器返回行為合理。

### 200% / 320px
- 圖片／縮圖不超出卡片。
- 卡片標題與說明不截斷。
- `.aml-learning-journey__copy small` 的 ellipsis 只是輔助資訊；若因此隱藏必要內容，視為問題。
- 卡片高度不因固定尺寸造成文字被切掉。

---

## P1-4｜管理學自學測驗 `/management-self-study-quiz.html`

### 鍵盤作答
1. 啟動 skip link。
2. 只用鍵盤完成至少一題。
3. 確認題目選項可用 Tab / Space / Enter 操作。
4. 送出／下一題後：
   - 預期：新題目或結果 heading 取得合理焦點。
5. 故意觸發姓名未填錯誤。
   - 預期：aria-invalid / alert 訊息出現，焦點回到姓名欄位。
6. 完成到憑證／結果區。
   - 預期：結果不是只靠顏色表達。
   - 下載／列印按鈕可鍵盤操作。

### 200% / 400% / 320px
- 題目與選項不被 min-height 卡住。
- 結果區與憑證區可完整捲動。
- 按鈕文字完整。
- 無頁面級水平 overflow。

### 螢幕閱讀器後續
- 題號、題目、選項名稱與目前選取狀態可理解。
- 結果 heading 在更新後被讀到。
- 錯誤訊息不重複轟炸。

---

## P1-5｜PBS 自學測驗 `/pbs-self-study-quiz.html`

流程與管理學測驗相同，另外確認：
- PBS 專有名詞與題目說明沒有被 aria-label 簡化到失去語意。
- 結果／回饋區的 heading 層級合理。
- 姓名錯誤修正後，狀態能恢復。

### 200% / 400% / 320px
- 題目長句可自然換行。
- 選項高度可隨文字增加。
- 結果與憑證區不因固定 min-height 造成大片空白或內容被切掉。

---

## P1-6｜典型文章頁

從公開文章中挑至少三種模板：
1. 一般長文。
2. 含圖片／海報。
3. 含表格或較複雜區塊。

### 鍵盤
- skip link → main。
- heading 順序合理。
- 相關閱讀卡片可聚焦。
- share buttons 可聚焦且成功訊息可被 status region 感知。

### 200% / 320px
- 長段落、引用、圖片 caption 不截斷。
- 圖片 max-width 不超出內容。
- 表格若寬，限制在自己的 scroll container。
- related-reading 三欄能正確退化成單欄。

---

## 完成門檻

P1 頁面要從 ◐ 改成 ✅ 前：

1. Library / Articles / Reading Paths 完成 keyboard + 200% + 320px。
2. 兩套 quiz 完成 keyboard + 200% + 400% + 320px。
3. 至少 3 篇不同模板文章完成 keyboard + 200% + 320px。
4. 沒有未處理 Blocker。
5. Major 已修正或有可接受例外與依據。
6. branch preview 完成重測。

## 建議執行順序

`Library → Articles → Reading Paths → Management Quiz → PBS Quiz → 3 篇典型文章`

先做前三頁可以快速驗證共用內容卡片與館藏版型；若有共通 CSS 問題，先修掉再進兩套 quiz，會省很多重測時間。
