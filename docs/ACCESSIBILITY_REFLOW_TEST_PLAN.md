# AML Zoom / Reflow 人工測試計畫

更新日期：2026-10-03  
Branch：`accessibility/phase1-a-preflight`

本計畫專門處理靜態 CI 很難可靠判斷的縮放與 reflow 問題。目標不是「看起來漂亮」，而是確認在放大、窄視窗與行動版條件下，核心資訊與操作仍可取得。

## 測試環境

建議使用最新版 Chrome 或 Edge，先關閉瀏覽器額外縮放外掛。每輪測試都記錄：
- 頁面 URL
- viewport 寬度
- browser zoom
- 是否出現水平捲動
- 是否有文字截斷／重疊
- 是否有控制項不可見或不可操作
- 若發現問題，截圖並記錄 selector / 區塊名稱

## Test A｜200% Zoom

桌面 viewport 約 1280–1440 CSS px，browser zoom 設為 200%。

驗收重點：
- 導覽可操作，選單文字不互相重疊。
- H1/H2、卡片標題、按鈕文字完整。
- 主要流程不因固定高度而截斷。
- dialog / panel 不超出 viewport 到無法關閉。
- 表單欄位與錯誤訊息仍在可見範圍。
- 若有水平捲動，只能出現在本來就需要的資料表／圖像容器，不應讓整頁左右捲動才能閱讀正文。

## Test B｜400% Zoom

桌面 viewport 約 1280 CSS px，browser zoom 設為 400%。

優先確認：
- 全站導覽是否切成 mobile menu。
- 主要內容是否變成單欄。
- 所有主要按鈕仍能讀到完整文字。
- sticky / fixed 元件不覆蓋大量內容。
- dialog 可以在可視範圍內滾動與關閉。
- 互動卡片沒有因 min-width / nowrap 造成頁面級水平溢出。

## Test C｜320 CSS px Reflow

DevTools responsive viewport 設為 320px 寬，zoom 100%。

驗收重點：
- 不出現頁面級水平捲動。
- 文字不需要左右移動才能閱讀。
- navigation、footer、cards、form 都能單欄使用。
- CTA、badge、status 若原本 white-space:nowrap，不可把頁面撐寬。
- 表格可在自己的 wrapper 內水平捲動，不應撐開整頁。
- 圖片寬度不超過容器。
- 互動地圖若降級為卡片／文字入口，功能仍完整。

## 代表頁順序與風險

| 優先 | URL | 靜態風險線索 | 人工重點 |
|---|---|---|---|
| P0 | `/tools.html` | 固定寬高與 responsive 規則最多；多個互動地圖／panel／badge | 320px、400%、Engineering Bay、Xier、support bay |
| P0 | `/` | 地圖 hotspot、dialog、carousel、部分 nowrap | 400%、曦兒 dialog、站內搜尋、首頁卡片 |
| P0 | `/tools/management-coach/` | 多步驟、長 textarea、檔案輸入、狀態區 | 400%、panel 切換、file controls |
| P0 | `/pbs-companion-web.html` | 動態表格 | 320px table wrapper、ABC row 操作 |
| P1 | `/management-self-study-quiz.html` | min-height 620px | 小螢幕結果／憑證區是否被高度限制 |
| P1 | `/pbs-self-study-quiz.html` | min-height 620px | 同上 |
| P1 | `/library.html` | 搜尋／館藏卡片、少量 nowrap | 320px 搜尋控制項、卡片 metadata |
| P1 | `/articles.html` | 卡片 meta 有 nowrap | 窄版 meta 與標籤是否擠壓 |
| P1 | `/reading-paths.html` | 圖片固定尺寸、ellipsis | 卡片圖像與說明在 320px 是否合理 |
| P2 | `/self-study.html` | CTA / reset 有 nowrap | CTA 是否把容器撐寬 |
| P2 | `/resources.html` | 主要使用共用模板 | 一般 reflow smoke test |

## 已知 nowrap 項目

目前靜態抽查發現的 nowrap 多數用於短 CTA、badge、狀態字或刻意 ellipsis。這些不直接判錯，但在 320px / 400% 時需特別看：

- 首頁 Featured Reading CTA
- Articles / Library topic meta
- Library 搜尋送出按鈕
- Self-study CTA / reset
- Tools：coming CTA、progress CTA、badge、Xier trigger、support status、Engineering Bay toggle / route code
- Reading paths 小字 ellipsis

若任何一項造成頁面級水平溢出，優先改為 `white-space:normal`、`overflow-wrap:anywhere` 或在小螢幕 media query 解除 nowrap；不要用縮小字體硬塞。

## 問題紀錄格式

每個問題用以下格式記錄：

```
URL:
Viewport:
Zoom:
區塊:
現象:
鍵盤是否受影響:
建議修正:
Commit:
重測結果:
```

## 完成條件

Zoom / Reflow 這一層只有在下列條件完成後才可從「◐ 待確認」改為「✅ 已確認」：

1. P0 全部通過 200%、400%、320px。
2. P1 至少完成 200% 與 320px；有互動／表格者加做 400%。
3. P2 完成 320px smoke test。
4. 所有頁面級水平 overflow 都已修正或有合理例外紀錄。
5. 所有修正都經 branch preview 重測。
