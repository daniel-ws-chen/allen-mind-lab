# AML Freego 前代表頁人工 QA 驗收紀錄

更新日期：2026-10-03  
Branch：`accessibility/phase1-a-preflight`

狀態定義：
- ✅ **已確認**：已有 CI、原始碼或既有修正紀錄支持。
- ◐ **待瀏覽器人工確認**：原始碼結構看起來合理，但仍需實際 Tab／Zoom／視覺驗收。
- ○ **待輔助科技確認**：需螢幕閱讀器或實際作業系統設定測試。
- ⚠ **邊界未定**：涉及存取控制／認證範圍，尚不能當作 private 排除。

> 本文件是「驗收紀錄」，不是符合性聲明。Freego、人工鍵盤與螢幕閱讀器尚未完成的項目，不標記為通過。

## A. 代表頁樣本

| 類型 | 代表 URL | 目前狀態 | 已有證據 | 仍需人工確認 |
|---|---|---:|---|---|
| 首頁 | `/` | ◐ | skip link、main、H1、曦兒 dialog focus trap / Esc / focus return、搜尋入口 focus、reduced motion 修正 | 200/400% zoom、全頁 Tab 順序、圖片上 hotspot 對比 |
| 主題館藏 | `/articles.html` | ◐ | 共用 nav / skip / main / focus 樣式已納入 CI | 內容卡片全頁 Tab、reflow、meta 小字對比 |
| 完整館藏 | `/library.html` | ◐ | 共用結構與 focus 已納入 CI | 搜尋／篩選若有，需實際鍵盤流程；400% zoom |
| 閱讀路徑 | `/reading-paths.html` | ◐ | 共用結構與卡片 focus 已補強 | 卡片順序、320px reflow、文字截斷 |
| 進階自學室 | `/self-study.html` | ◐ | skip link / main 已補齊；共用 nav 已修正 | 實際 Tab、zoom、行動版 |
| 互動實驗室 | `/tools.html` | ◐ | Engineering Bay inert、Esc return；Xier panel inert；hover/focus parity；reduced motion 多處處理 | 從頁首到頁尾完整 Tab；互動地圖／圖片背景對比；所有動畫人工觀察 |
| 精選資源 | `/resources.html` | ◐ | 共用結構、連結與 focus 規則 | 外部連結命名、zoom/reflow |
| 典型文章 | 任選一篇 `/articles/*.html` | ◐ | share live region、共用 skip/main、相關閱讀 focus | 長文 heading 層級、圖片 alt、表格／引用若存在 |
| Management Coach | `/tools/management-coach/` | ◐ | 狀態 live region、步驟 focus、錯誤導向欄位、reduced motion | 整段工作流程 Tab、檔案上傳、400% zoom |
| PBS Companion | `/pbs-companion-web.html` | ◐ | label、錯誤 focus、live status、table caption/scope | 動態新增 ABC row 的實際朗讀與 Tab；table mobile scroll |
| 管理學測驗 | `/management-self-study-quiz.html` | ◐ | 結果 focus、姓名錯誤 aria-invalid / role=alert | 完整作答、憑證流程、螢幕閱讀器朗讀 |
| PBS 測驗 | `/pbs-self-study-quiz.html` | ◐ | 結果 focus、姓名錯誤 aria-invalid / role=alert | 完整作答、憑證流程、螢幕閱讀器朗讀 |

## B. 鍵盤焦點驗收

| 項目 | 狀態 | 備註 |
|---|---:|---|
| Skip link 可見且移動實際焦點 | ✅ | 共用 JS 已處理 focus + scroll；多頁結構已補齊 |
| sticky nav 不遮住 skip target | ✅/◐ | 已加 scroll-margin-top；仍需瀏覽器視覺確認 |
| mobile menu aria-expanded / aria-label 同步 | ✅ | 開啟／關閉標籤已同步 |
| desktop dropdown focus visible | ✅ | 動態注入樣式已補 3px focus ring |
| Engineering Bay 收合後不可 Tab 進入 | ✅/◐ | 已使用 inert；需瀏覽器實測確認 |
| 首頁曦兒 dialog focus trap / Esc / focus return | ✅/◐ | 原始碼已有完整邏輯；需瀏覽器實測 |
| Management Coach step 切換後焦點進新標題 | ✅/◐ | 程式已實作 focusPanel() |
| 隱藏 aria-hidden 區內可聚焦元件自動警告 | ✅ | preflight 規則已加入，CI success |
| 全站 Tab 順序符合視覺順序 | ◐ | 必須人工走查 |

## C. 視覺與對比

| 項目 | 狀態 | 備註 |
|---|---:|---|
| 核心共用文字色值抽樣 ≥ 4.5:1 | ✅ | 已記錄多組共用 token 對比 |
| 共用 focus ring 明確 | ✅/◐ | 多處改為實色；仍需深淺背景人工看 |
| Engineering Bay focus ring | ✅ | toggle / route 已改實色 |
| 圖片背景文字／hotspot label | ◐ | 必須實際圖片上檢查 |
| 漸層、半透明 overlay 上文字 | ◐ | 靜態色值不足以證明 |
| 小字／meta／muted text | ◐ | 抽樣未等於全站確認 |
| 顏色不是唯一訊息來源 | ◐ | 尤其紅黃綠燈／badge 需人工確認 |

## D. Zoom / Reflow

| 項目 | 狀態 |
|---|---:|
| 200% zoom 可操作 | ◐ |
| 400% zoom 可操作 | ◐ |
| 320 CSS px 單欄閱讀 | ◐ |
| 固定高度不截斷文字 | ◐ |
| 表格需水平捲動時仍可理解 | ◐ |

> 這一組目前沒有瀏覽器實測證據，因此全部保持待確認。

## E. 表單與動態訊息

| 項目 | 狀態 | 備註 |
|---|---:|---|
| 靜態表單欄位 label 預檢 | ✅/◐ | scanner 會 warning；動態生成欄位仍需人工 |
| PBS target behavior 缺漏錯誤 | ✅ | aria-invalid + focus + alert |
| 測驗姓名錯誤 | ✅ | aria-invalid + role=alert |
| Management Coach 狀態訊息 | ✅ | 多個 status 區已 aria-live |
| 文章分享／複製成功訊息 | ✅ | role=status + aria-live |
| live region 不重複／不過度朗讀 | ○ | 需螢幕閱讀器 |

## F. 表格

| 項目 | 狀態 | 備註 |
|---|---:|---|
| PBS ABC 表 | ✅/◐ | caption + scope=col 已補；mobile scroll 待測 |
| PBS 七週期表 | ✅/◐ | caption + scope=col 已補；mobile scroll 待測 |
| 全站其他表格語意 | ◐ | scanner 可抓缺 th，但 caption/context 仍需人工 |

## G. Motion

| 項目 | 狀態 | 備註 |
|---|---:|---|
| 共用 prefers-reduced-motion | ✅/◐ | 多處 CSS/JS 已處理 |
| 首頁曦兒結果 scroll | ✅ | reduce motion 時改 auto |
| Management Coach panel scroll | ✅ | reduce motion 時改 auto |
| Tools 動畫全部不造成必要資訊遺失 | ◐ | 仍需實際開啟系統設定觀察 |

## H. Screen reader

| 項目 | 狀態 |
|---|---:|
| landmarks / headings 導覽 | ○ |
| dialog 標題／說明 | ○ |
| form label / error / status | ○ |
| table header 導覽 | ○ |
| 裝飾 icon 噪音 | ○ |

> 目前尚未執行 NVDA / VoiceOver 等實測，不標記通過。

## I. 公開範圍與驗證邊界

| 路徑 | 狀態 | 結論 |
|---|---:|---|
| `/tools/infection-control-pilot/` | ⚠ | 前端 gate 不算真實 private boundary；未證明 edge/server auth 前仍視為公開部署 |
| `/sera-phina/learning-lab/national-exam/` | ⚠ | UI 宣稱 OTP，但 repo 未證明 edge/server enforcement；需 unauthenticated direct-file test 或 Access policy 證據 |
| sitemap 104 URLs | ✅ | 已固定為目前公開 INCLUDE baseline；但「不在 sitemap」不等於 private |

## J. 目前門檻判定

截至 2026-10-03：

- ✅ Accessibility preflight：最新已成功。
- ✅ Cloudflare Pages：最新 head 已成功部署。
- ✅ Cloudflare Workers：最新 head 已成功部署。
- ✅ 已知結構性問題持續收斂，且新增 regression guard。
- ◐ 瀏覽器人工 QA 尚未完成。
- ○ 螢幕閱讀器抽查尚未完成。
- ◐ Freego 正式全站掃描尚未執行／尚未保存結果。
- ⚠ 兩個 restricted candidate 的真實認證邊界仍需外部驗證。

因此目前適合描述為：**「Freego 前工程預檢已建立且持續通過；已進入人工驗收階段。」**  
不適合描述為：**「已通過 A 級」或「已完成正式送審條件」。**


## K. Zoom / Reflow 執行計畫

- 已新增 `docs/ACCESSIBILITY_REFLOW_TEST_PLAN.md`。
- 靜態風險排序：
  - P0：`/tools.html`、首頁、Management Coach、PBS Companion
  - P1：兩套 quiz、Library、Articles、Reading Paths
  - P2：Self-study、Resources
- 靜態掃描顯示 `tools.html` 的固定尺寸與 responsive 規則最多，因此優先人工測試，不直接視為錯誤。
- nowrap 項目已整理成觀察清單；只有在 320px / 400% 造成頁面級 overflow 時才修正，避免不必要的視覺改版。


## L. P0 實際操作腳本

- 已新增 `docs/ACCESSIBILITY_P0_TEST_SCRIPT.md`。
- P0 四頁已拆成逐步操作：
  - 首頁：skip link、曦兒 dialog、搜尋、zoom/reflow
  - tools：導覽、Xier、Engineering Bay inert/Escape、zoom/reflow
  - Management Coach：錯誤焦點、step focus、檔案狀態、組員模式
  - PBS Companion：target behavior error、ABC 表、七週期表
- 問題嚴重度固定為 Blocker / Major / Minor，避免人工驗收時每次重新判斷優先級。
- P0 只有在鍵盤 + 200% + 400% + 320px 都完成、且無未處理 Blocker 時，才能從 ◐ 改成 ✅。


## M. P1 實際操作腳本

- 已新增 `docs/ACCESSIBILITY_P1_TEST_SCRIPT.md`。
- P1 已拆成 Library、Articles、Reading Paths、管理學 Quiz、PBS Quiz 與三類典型文章。
- Library / Articles / Reading Paths：keyboard + 200% + 320px。
- Quiz：keyboard + 200% + 400% + 320px。
- 典型文章至少抽 3 種模板，確認 related reading、share status、圖片與表格 reflow。
- P1 同樣採 Blocker / Major / Minor 分級；未實測前維持 ◐。


## N. P2 與 Screen Reader 腳本

- 已新增 `docs/ACCESSIBILITY_P2_SMOKE_TEST.md`：
  - Self-study、Resources、About/Research/Publications/Recognition、Privacy/Terms/Contact，以及其他公開工具抽樣。
  - P2 以 keyboard smoke test + 320px 為主，目的為抓共用模板回歸。
- 已新增 `docs/ACCESSIBILITY_SCREEN_READER_TEST.md`：
  - 首頁、Management Coach、PBS Companion、Quiz、典型文章與全站噪音抽查。
  - 最低實測組合：首頁 + Management Coach + PBS Companion + 1 套 Quiz + 1 篇文章。
- 螢幕閱讀器尚未實測，因此相關項目維持 ○。


## O. Freego 代表樣本與掃描紀錄

- 新增 `docs/ACCESSIBILITY_REPRESENTATIVE_URLS.md`：固定正式全站掃描前的代表模板 URL 組。
- 新增 `docs/ACCESSIBILITY_FREEGO_RUN_RECORD.md`：固定每次 Freego 掃描的 URL、規則、嚴重度、修正 commit 與重測紀錄。
- 代表樣本只用於提早抓共通問題；最終範圍仍回到 104 個公開 URL 基線。


## P. 代表樣本靜態反模式抽查

已對核心代表頁與三篇文章樣本額外抽查下列項目：
- duplicate id
- positive tabindex
- autofocus
- accesskey
- meta refresh
- 非原生 div/span click/role=button 互動

本輪代表樣本未發現上述反模式。為避免未來回歸，duplicate id 與 positive tabindex 已提升為 preflight error；autofocus / accesskey / meta refresh 則列 warning，保留人工判斷空間。


## Q. Duplicate ID 修正與 ARIA reference guard

- CI 新增 duplicate-id error 後，實際抓到 `management-self-study.html` 與 `pbs-self-study.html` 各有兩個 `id="aml-main"`。
- 已保留真正的 `<main id="aml-main">`，移除 hero header 上的重複 id，讓 skip link 有唯一目標。
- accessibility preflight 進一步新增 `aria-labelledby`、`aria-describedby`、`aria-controls` 的 id reference integrity 檢查；任何不存在的目標 id 將列為 error。
