# AML P0 人工無障礙測試腳本

更新日期：2026-10-03  
Branch：`accessibility/phase1-a-preflight`

這份腳本把 P0 四個代表頁拆成「照著做就能完成」的人工驗收流程。每個測試都應在 branch preview 上執行，發現問題後先修 branch，再重測同一步驟。

## 共通準備

每個頁面都先做以下設定：

1. 開新無痕視窗，避免 localStorage / cache 干擾。
2. 先以 100% zoom、約 1280px 寬度測鍵盤。
3. 再測 200% zoom。
4. 再測 400% zoom。
5. 最後用 DevTools 設 320px 寬、100% zoom。
6. 全程至少完成一次只用鍵盤操作：Tab、Shift+Tab、Enter、Space、Escape。
7. 每發現一個問題，立即記錄 URL、viewport、zoom、區塊、現象。

---

## P0-1｜首頁 `/`

### A. 鍵盤主流程

1. 重新整理頁面後按 Tab。
   - 預期：第一個可見焦點是「跳到主要內容」。
2. 按 Enter。
   - 預期：焦點移到主要內容，且內容沒有被 sticky nav 遮住。
3. 持續 Tab。
   - 預期：品牌、桌面／行動導覽、首頁地圖 hotspot、曦兒入口、卡片、搜尋、footer 依合理順序出現。
4. 聚焦曦兒 hotspot。
   - 預期：focus ring 清楚；提示文字與 hover 等價。
5. Enter 開啟曦兒。
   - 預期：焦點進入 dialog。
6. Tab 一圈。
   - 預期：焦點不離開 dialog。
7. Shift+Tab 反向一圈。
   - 預期：同樣不逃出。
8. 按 Escape。
   - 預期：dialog 關閉，焦點回到曦兒入口。
9. 再開啟曦兒，輸入文字並送出。
   - 預期：結果區更新；reduce motion 開啟時不強迫 smooth scroll。

### B. Zoom / Reflow

200%：
- 檢查 nav 是否仍可使用。
- 首頁地圖與 route cards 不重疊。
- 曦兒 dialog 可完整操作與關閉。

400%：
- 預期桌面 nav 退化為 mobile menu。
- 首頁核心入口仍為單欄可讀。
- 搜尋 CTA 文字不可被切掉。

320px：
- 不應出現整頁水平捲動。
- 手機 route cards 全部可讀。
- 曦兒 hotspot 若仍存在，不可遮住主要入口。
- dialog 寬度不超出 viewport。

---

## P0-2｜互動實驗室 `/tools.html`

### A. 頁首與導覽

1. Tab → 啟動 skip link。
2. 確認 mobile/desktop nav focus ring 明顯。
3. 展開任一 `details` 導覽。
4. 用 Tab 走過選單連結，再移出。
   - 預期：沒有 focus trap；離開後選單狀態合理。
5. 按 Escape（若適用）。
   - 預期：互動元件不留下不可理解狀態。

### B. 互動探索艙

1. 用 Tab 逐一走到四個 exploration node。
   - 預期：focus 與 hover 有等價視覺提示。
2. 開啟曦兒控制核心。
   - 預期：panel 開啟時可聚焦；關閉時 `inert`，Tab 不會進去。
3. 按 Escape。
   - 預期：panel 關閉。
4. 檢查所有「開始／繼續」CTA。
   - 預期：focus ring 清楚，不只靠 hover。

### C. Engineering Bay

1. Tab 到「開啟維護艙」。
2. 不開啟，繼續按 Tab。
   - 預期：焦點完全略過 Engineering Bay 內 hotspot / route。
3. 回到按鈕 Enter 開啟。
   - 預期：內容可 Tab 進入。
4. Tab 進 hotspot 與系統航圖。
   - 預期：focus ring 在圖片／深色背景上清楚。
5. 按 Escape。
   - 預期：維護艙收合，焦點回到開啟按鈕。
6. 再 Tab。
   - 預期：內部連結再次被略過。

### D. Zoom / Reflow

200%：
- 四個探索館、support cards、status badge 不互相蓋住。
- Xier panel 可完整操作。

400%：
- 所有大型 cockpit / map 元件應退化成可讀單欄或合理替代。
- 固定尺寸圖形不能造成整頁左右捲動。

320px：
- 特別檢查：
  - progress CTA
  - Xier trigger
  - support status
  - Engineering Bay toggle
  - route code
- 若 `nowrap` 撐寬 viewport，記錄 selector。

---

## P0-3｜Management Coach `/tools/management-coach/`

### A. 入口與步驟導覽

1. Tab 到 skip link 並啟動。
2. 不勾課前評量，嘗試前往下一步。
   - 預期：錯誤訊息可見，焦點回到需要處理的欄位／控制項。
3. 勾選後繼續。
   - 預期：切換 panel 後焦點移到新 panel 的 H2。
4. 反覆前進／返回。
   - 預期：每次 panel 切換焦點位置一致且可預期。

### B. 檔案與狀態

1. Tab 到檔案選擇。
2. 嘗試無檔案／錯誤格式／可接受格式（若手邊有測試檔）。
   - 預期：import status 被讀取邏輯可理解，不只靠顏色。
3. 人工輸入至少一章。
4. 觸發初步分析。
   - 預期：分析狀態更新；新 panel H2 取得焦點。

### C. 組員模式

1. 不勾課前評量直接下一步。
   - 預期：assertive 錯誤訊息出現，焦點回到 checkbox。
2. 勾選後但不貼章節內容，前往檢核。
   - 預期：錯誤訊息出現，焦點回到 textarea。
3. 貼內容後前進。
   - 預期：新 panel H2 取得焦點。

### D. Zoom / Reflow

200% / 400%：
- step navigation 不遮住內容。
- textarea、file input、button 文字完整。
- panel 切換後 H2 在視窗內。
- 長狀態訊息可換行。

320px：
- 所有 action buttons 可單欄或合理換行。
- 不因 step label / badge 產生整頁水平捲動。

---

## P0-4｜PBS Companion `/pbs-companion-web.html`

### A. 表單與錯誤

1. Tab 到 target behavior 欄位。
2. 留白直接執行分析。
   - 預期：欄位標記 invalid，錯誤訊息顯示，焦點移回 target behavior。
3. 填寫 target behavior 後重新分析。
   - 預期：錯誤清除，分析完成狀態可見。

### B. ABC 表格

1. 用 Tab 走完整個 ABC row。
   - 預期：輸入順序符合 A → B → C → 操作。
2. 新增一列。
   - 預期：新增後不會造成焦點消失或跳到不可預期位置。
3. 移除一列。
   - 預期：剩餘焦點仍落在合理控制項。
4. 用螢幕閱讀器時（後續）確認：
   - caption 可辨識為 ABC 行為紀錄。
   - column headers 可被讀出。

### C. 七週期策略表

1. Tab 到表格前後的操作控制。
2. 320px viewport 下檢查 table。
   - 預期：若需橫向捲動，應限制在 table wrapper；正文頁面本身不左右漂移。

### D. Zoom / Reflow

200% / 400%：
- 表單 labels 與 controls 不重疊。
- status / alert 可完整換行。
- report / analysis 區塊不截斷。

320px：
- ABC 表可操作。
- 七週期表可理解。
- 檔案上傳控制（若使用）不超出 viewport。

---

## 問題嚴重度

### Blocker
- 鍵盤無法完成核心操作。
- 焦點陷入／消失。
- 400% 或 320px 下核心內容完全不可取得。
- dialog 無法關閉。
- 隱藏區仍可 Tab 進入且造成迷失。

### Major
- 明顯文字重疊、截斷。
- focus ring 在主要操作上不可見。
- 錯誤發生但沒有可理解訊息。
- 重要 table 在 mobile 完全不可操作。

### Minor
- 純裝飾 hover/focus 差異。
- 非必要 spacing / animation 細節。
- 不影響理解或操作的小型視覺瑕疵。

## 完成門檻

P0 四頁要從「◐」改成「✅」前，至少需要：

- 鍵盤腳本全部完成。
- 200%、400%、320px 全部完成。
- 沒有未處理 Blocker。
- Major 全部修正或有明確例外理由。
- 修正後 branch preview 重測。
- 測試日期與執行者記錄在 `ACCESSIBILITY_MANUAL_QA_RECORD.md`。
