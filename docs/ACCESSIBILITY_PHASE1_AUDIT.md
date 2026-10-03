# AML Accessibility Phase 1 — A 級申請前健檢

日期：2026-10-03  
目標：台灣網站無障礙認證標章 A 等級申請前預檢

## 本輪抽查範圍
- index.html
- tools.html
- articles.html
- library.html
- reading-paths.html
- self-study.html
- resources.html
- contact.html
- privacy.html
- terms.html
- aml-site.css
- aml-site.js

## 初步結果
### 已具備的基礎
- 抽查頁面皆有有效的 html lang 屬性（zh-Hant）
- 抽查頁面皆有 title
- 抽查頁面皆有單一 h1
- 抽查頁面皆有主要內容區域 main / #aml-main
- 抽查圖片未發現缺少 alt 的情況
- 全站共用 CSS 已具備 focus-visible 樣式
- 共用 CSS 已包含 prefers-reduced-motion 處理
- 主選單、Lumi 維護艙與曦兒互動已有 aria-expanded / aria-controls 等狀態標記
- 曦兒非 button 觸發元件已有 Enter / Space 鍵盤操作支援

### 本輪已修正
- self-study.html 原本缺少「跳到主要內容」skip link，已補上：
  <a class="aml-skip-link" href="#aml-main">跳到主要內容</a>

## 下一輪高優先檢查
1. 全站鍵盤操作順序與 focus 可視性
2. 表單 label / 錯誤訊息 / 必填欄位可辨識性
3. 動態狀態更新是否需要 aria-live
4. 對比度（文字、按鈕、hover/focus 狀態）
5. 標題階層與 landmark 結構
6. iframe / video / canvas / SVG 的替代文字或可存取名稱
7. 新分頁連結是否有足夠語意提示
8. JavaScript 關閉時的核心內容與導覽可用性
9. 全站 Freego A 級自動檢測
10. 人工檢測項目逐條覆核

## 注意
此報告是 AML 自有程式碼的申請前預檢，不等同官方 Freego 或人工檢測通過結果。


## 第二輪：鍵盤導覽與動態狀態
本輪新增檢查 search.html 與 tools/management-coach/index.html。

### 已修正
- search.html：新增「跳到主要內容」skip link，並為 main 補上 id="aml-main"。
- tools/management-coach/index.html：新增「跳到主要內容」skip link，並為 main 補上 id="aml-main"。
- Management Coach 的章節辨識狀態 stateBadge 新增 aria-live="polite"，讓狀態更新可被輔助科技感知。

### 判讀說明
- Management Coach 靜態原始碼可看到多個 h1 字串，但其中兩個位於輸出／列印用的 JavaScript 樣板字串；實際主介面仍以頁首 h1 為主要頁面標題，因此不直接視為主 DOM 多 h1 缺失。
- 動態 textarea/select 雖未逐一設 id，但目前置於 label 元素內，已有標籤關聯；下一輪仍會以實際鍵盤與輔助科技行為為準。


## 官方送件條件對照
依數位發展部無障礙網路空間服務網目前流程：
- 申請前須先以 Freego 進行全網站檢測並通過。
- 完成案件登錄與自我評量後，才進入軟體／人工檢測。
- 官方近期 Freego 報告可見檢測設定包含 JavaScript 停用，因此 AML 申請前除互動操作外，也需確認核心導覽、主要內容、標題與替代文字在無 JavaScript 狀態下仍具備可檢測的靜態結構。

## 第三輪工作重點
1. 將 audit-accessibility.mjs 納入例行申請前檢查。
2. 優先清理缺少 skip link、main landmark、iframe title、img alt 等可機器判定項目。
3. 再進入需人工判讀的對比、焦點順序、互動狀態與內容語意。
4. 完成上述項目後再執行 Freego 全站 A 級檢測，避免過早送件造成大量往返。


## 第三輪：全站公開頁 landmark / skip navigation 掃描
已擴大抽查根目錄公開 HTML 與主要互動工具頁。

### 本輪已修正
- about.html：將主要內容完整包入 main landmark，skip link 現在落在真正的主要內容區。
- notes.html：補正 main landmark，保留既有 skip link。
- publications.html：補上 main landmark，讓既有 skip link 有明確目標。
- management-self-study-quiz.html：新增 skip link 與 #aml-main。
- pbs-self-study-quiz.html：新增 skip link 與 #aml-main。
- pbs-companion-web.html：新增 skip link 與 #aml-main。
- tools/management-interactive/index.html：新增 skip link 與 #aml-main。
- tools/ai-judgment-challenge/index.html：新增 skip link 與 #aml-main。
- tools/management-decision-lab/index.html：新增 skip link 與 #aml-main。
- tools/management-fairness-challenge/index.html：新增 skip link 與 #aml-main。

### 掃描工具校正
- audit-accessibility.mjs 現在會忽略沒有 <html> 根元素的工程片段／暫存 HTML，避免把 lumi-tools-replacement.html 這類非獨立公開頁誤判成缺失。

### 目前判斷
- 核心主站頁面的 lang、H1、圖片 alt、main landmark 與 skip navigation 結構已大致一致。
- 下一輪應把重點轉往較難由靜態掃描判斷的項目：色彩對比、鍵盤焦點順序、互動元件 focus 狀態、動態內容宣告與表單錯誤提示。


## 第四輪：互動流程、焦點與表單錯誤
本輪聚焦 PBS Companion 與兩套自學總複習。

### 已修正
- PBS Companion：
  - 標的行為缺漏時，不再只用 alert；改為對欄位加 aria-invalid、將焦點移到缺漏欄位，並以 role="alert" 顯示可讀錯誤訊息。
  - 完成分析與完整報告初稿後，新增輔助科技可感知的狀態訊息。
  - 為連結、按鈕、輸入框、select、textarea、summary 加強 :focus-visible。
  - prefers-reduced-motion 下關閉平滑捲動。
- Management Challenge / PBS 自學總複習：
  - 每換一題，程式焦點會移到新題目的標題，避免舊答案按鈕被移除後焦點遺失。
  - 測驗完成後，焦點移到結果標題。
  - 產生完訓證明時若姓名空白，輸入框會標示 aria-invalid，並提供 role="alert" 錯誤訊息。

### 本輪意義
這些修正主要處理「視覺上看得到新內容，但鍵盤／螢幕閱讀器使用者不知道畫面已經換了」的風險，是人工無障礙檢查常見的互動流程問題。


## 第五輪：公開檢測範圍界定
已新增 docs/ACCESSIBILITY_SCOPE_MAP.md。

重要發現：
- 感控 Pilot 雖有 noindex,nofollow 且未列 sitemap，但 tools.html 有公開入口。
- 感控 Pilot 現行 gate 為前端 JavaScript 共用帳密，內容仍隨公開資產部署；因此目前不能把登入後區域當作真正私有內容排除。
- Sera.Phina 與 AML 共用網域，且 resources.html / tools.html 均有公開連結，因此送件前也要確認是否被視為同一網站範圍。
- 在真正伺服器端 / Cloudflare Access / OTP 邊界完成前，不會把受限工具目錄從 accessibility audit 中整體排除。


## 第六輪：受限工具證據門檻
- 確認 Sera.Phina Learning Lab 公開頁有連到 national-exam。
- national-exam 本身再直接連到 practice.html。
- 目前沒有 repo / Worker 證據能證明國考工具已被真正 OTP 保護。
- 外部匿名抓取環境本輪無法連線正式站，因此不把「抓不到」誤判成 Access 已生效。
- 在看到 Cloudflare Access policy 或完成未登入三 URL 實測前，national-exam 不列入 RESTRICTED。


## 第七輪：認證範圍自動化與公開部署清理
- 新增 accessibility-scope.json，將「受限候選區」以機器可讀方式記錄。
- audit-accessibility.mjs 會標示 restricted candidate，但在真正 server/edge auth 證據完成前仍照公開頁面檢查，不會偷渡排除。
- 發現 docs/ 與 audit-accessibility.mjs 原本會被 build-dist.mjs 複製到公開 dist。
- 已將 docs/ 與 audit-accessibility.mjs 加入 build 排除清單，避免內部認證稽核文件與工程腳本公開發布。


### Build guard
- build-dist.mjs 現在會在建置後驗證 docs/、audit-accessibility.mjs、accessibility-scope.json 等內部稽核／工程檔沒有進入 dist；若誤發布會直接讓 build 失敗。
- 對尚未真正受保護的感控 Pilot 與 Sera.Phina national-exam，部署時只提出警告，不阻斷部署，避免目前功能突然失效。


## 第八輪：公開 URL 基線固定
- 目前 sitemap.xml 共 104 個 URL。
- 未發現重複 URL。
- 感控 Pilot 與 Sera.Phina national-exam 兩個受限候選區都不在 sitemap。
- 新增 docs/ACCESSIBILITY_PUBLIC_URLS.md，將 sitemap 現況固定為 Freego 前的 INCLUDE 基線。
- 注意：不在 sitemap 不等於私有；仍須依實際可達性與 server/edge auth 判定。


## 第九輪：Freego 前共通規則補強
- aml-site.css：補強曦兒支援選項的 focus-visible ring，避免只有 hover／背景變色而缺乏清楚鍵盤焦點。
- audit-accessibility.mjs 新增靜態預檢：
  - target="_blank" 是否有 rel="noopener"
  - input/select/textarea 是否具可程式判定的標籤
  - table 是否至少具有 th
  - role="button" 非原生按鈕是否具 tabindex="0"
- 這些新增規則先以 warning 為主，避免因靜態解析限制造成誤判；正式結論仍需 Freego 與人工測試。


## 第十輪：以「真正公開 dist」作為稽核對象
- audit-accessibility.mjs 新增 AUDIT_ROOT 支援；本機仍可掃 repo，但 CI 可指定 dist。
- Accessibility preflight workflow 調整為：
  1. node validate-aml.mjs
  2. node build-dist.mjs
  3. AUDIT_ROOT=dist node audit-accessibility.mjs
  4. 驗證內部稽核／工程檔未進入 dist
- 這可避免 article-template、工程片段或 repository-only 檔案造成假陽性，讓結果更接近 Freego 實際看到的公開網站。


## 第十一輪：CI 產出可追蹤稽核報告
- Accessibility preflight CI 已在 head f23bdf3 成功執行：source validation、public dist build、dist accessibility preflight、private artifact guard 全部通過。
- 為了不只看到「成功／失敗」，audit-accessibility.mjs 現可輸出 JSON 報告。
- workflow 會保存 accessibility-preflight-report artifact 14 天，後續可直接依 warnings 清單逐項修正。


## 第十二輪：Skip link 與動態訊息人工可用性
- 共用 aml-site.js 現在會在 skip link 啟動後，把程式焦點真正移到目標內容，而不只是改變捲動位置。
- 共用 CSS 為 #aml-main / #main 增加 scroll-margin-top，降低 sticky 導覽遮住跳轉目標的風險。
- prefers-reduced-motion 使用者不會被強制平滑捲動。
- 文章分享／複製狀態現在自動補上 role="status"、aria-live="polite"、aria-atomic="true"，讓「連結已複製」等動態回饋可被輔助科技感知。


## 第十三輪：表單狀態、流程焦點與表格語意
- Management Coach 既有 import/workspace/member import/confirm/cafe/prompt 狀態區補上 role="status" + aria-live="polite"。
- 組員模式新增 assertive 錯誤訊息區；缺少課前評量或章節內容時，不再只依賴 alert，而會顯示可被輔助科技讀取的錯誤並把焦點移到需要修正的欄位。
- 主流程與組員流程切換 panel 後，焦點會移到新 panel 的 h2；捲動會尊重 prefers-reduced-motion。
- PBS Companion 兩張資料表新增 caption 與 th scope="col"；原本空白的操作欄改為「操作」，提升螢幕閱讀器表格導覽語意。


## 第十四輪：Mobile navigation 與共用色彩對比
- 修正 aml-site.js 動態注入的下拉導覽樣式：原本 focus-visible 會被較高 specificity 的 outline:none 蓋掉；現在下拉選單連結有明確 3px gold focus ring。
- 行動版選單按鈕開啟後 aria-label 會從「開啟網站選單」切換為「關閉網站選單」，關閉時再恢復；aria-expanded 原有狀態同步保留。
- 共用 AML 色彩抽樣（以實際不透明色值計算 WCAG 對比）：
  - #5f6875 / #ffffff ≈ 5.64:1
  - #6b7280 / #ffffff ≈ 4.83:1
  - #8c6f38 / #ffffff ≈ 4.72:1
  - #c7a76a / #071a33 ≈ 7.61:1
  - #e5e7eb / #081626 ≈ 14.71:1
  - #aab6c5 / #081626 ≈ 8.85:1
  - footer #7f8b90 / #101719 ≈ 5.18:1
- 以上核心文字配色均高於一般文字 4.5:1 門檻；但漸層、半透明覆蓋、圖片背景上的文字仍需人工／瀏覽器實測，不能據此宣稱全站對比已通過。


## 第十五輪：隱藏互動區的鍵盤焦點隔離
- 發現 Engineering Bay 收合時只使用 max-height/opacity + aria-hidden；其中的 hotspot 與 route 連結仍可能留在鍵盤 Tab 序列。
- lumi-bay-reveal 現在初始即加 inert；開啟時解除 inert，收合時恢復 inert。
- aria-expanded / aria-hidden / is-open / inert 由同一個 setOpen() 統一同步，降低狀態不同步風險。
- 在 Engineering Bay 內容中按 Escape 會關閉維護艙，並把焦點送回「開啟維護艙」按鈕。
- 這一修正直接處理「視覺上隱藏，但鍵盤仍能進入」的人工 QA 風險。


## 第十六輪：隱藏區焦點風險自動化
- accessibility preflight 新增規則：若 div/section/nav/aside/article 使用 aria-hidden="true"，內部又包含 a/button/input/select/textarea/summary 或 tabindex="0"，但容器沒有 inert，列為 warning。
- 目的不是把所有 aria-hidden 都視為錯誤；裝飾性 icon / SVG 不受影響。規則只抓「隱藏區裡疑似還有可聚焦控制項」的情況。
- Engineering Bay 已補 inert，因此不應再被此規則列為風險。


## 第十七輪：隱藏區焦點抽查完成
- 新增 hidden-focus 規則後，Accessibility preflight CI 已再次完整成功。
- 另外抽查主要公開互動頁（tools.html、PBS Companion、兩套自學測驗、Management Coach、管理決策／公平挑戰、PBS 互動、自我覺察、能量節奏、感覺工具等），未再找到「aria-hidden=true + 可聚焦控制項 + 無 inert」的案例。
- 這代表目前已知的「視覺隱藏但仍可 Tab 進入」風險已明顯收斂；仍需保留瀏覽器實際 Tab 測試作為人工確認。


## 第十八輪：Hover / Focus 對等與焦點對比
- 共用 lab shell navigation 原本 hover 會提升 opacity，但 keyboard focus 沒有同等視覺回饋；已補 focus-visible opacity 與 3px currentColor outline。
- lab mini footer 連結補上 focus-visible underline/border 與 outline。
- 部分共用閱讀卡片焦點環由半透明金色改為實色 #8a6a32，降低焦點指示器在白底上對比不足的風險。
- Engineering Bay 的 toggle 與 route focus ring 改為實色（#137d68 / #e6bb61），避免低透明度 outline 在不同背景下失去辨識度。
- tool-card 本身的 hover 陰影屬非必要裝飾；互動按鈕已有獨立 focus-visible，因此不強迫把卡片 hover 動畫複製成鍵盤效果。


## 第十九輪：首頁曦兒與搜尋入口鍵盤 QA
- 首頁站內搜尋入口原本只有 hover 視覺效果；已加入 focus-visible 對等樣式與 3px 實色焦點環。
- 曦兒 dialog 內的 chips、關閉、送出按鈕補上明確 focus-visible outline。
- 曦兒 textarea 原本只有低透明度 box-shadow；現在保留邊框回饋並增加實色 focus-visible outline。
- 導航結果的 scrollIntoView 現在尊重 prefers-reduced-motion；使用者設定減少動態時改為 auto。
- 曦兒 dialog 原本已有焦點陷阱、Escape 關閉與焦點返回，這輪保留既有行為。


## 第二十輪：Freego 前人工 QA 固定化
- 新增 `docs/ACCESSIBILITY_FREEGO_MANUAL_CHECKLIST.md`。
- 把 CI 無法可靠判定的項目固定成可重複執行的人工驗收：鍵盤、焦點、縮放/reflow、圖片與漸層對比、表單錯誤、表格、dialog、reduced motion、螢幕閱讀器與驗證邊界。
- 清單明確區分「已自動檢查」與「仍需人工確認」，避免把 preflight success 誤寫成正式無障礙等級通過。
- 建議流程固定為：代表頁人工 QA → 不同模板抽查 → Freego 全站掃描 → 逐項修正與重測。


## 第二十一輪：代表頁驗收紀錄化
- 新增 `docs/ACCESSIBILITY_MANUAL_QA_RECORD.md`，將人工 checklist 轉成實際狀態矩陣。
- 狀態拆分為：已確認、待瀏覽器人工確認、待輔助科技確認、存取邊界未定。
- 代表頁涵蓋首頁、館藏、閱讀路徑、自學、互動實驗室、文章、Management Coach、PBS Companion、兩套測驗。
- 明確保留 zoom/reflow、圖片／漸層對比、完整 Tab 順序、screen reader 與 Freego 正式掃描為 pending，避免過度宣稱。
- 目前可描述為「Freego 前工程預檢已建立且持續通過；已進入人工驗收階段」。


## 第二十二輪：Zoom / Reflow 測試標準化
- 新增 `docs/ACCESSIBILITY_REFLOW_TEST_PLAN.md`，固定 200%、400% 與 320 CSS px 三組人工測試。
- 依靜態 CSS 複雜度與互動密度建立 P0/P1/P2 代表頁優先序。
- `tools.html` 因固定尺寸、互動元件與 responsive 規則最多列為 P0；這是「測試優先級」，不是已判定缺失。
- 已整理 nowrap 高風險觀察點，僅在實際造成頁面級水平 overflow 時再修，避免為了掃描數字破壞正常 UI。


## 第二十三輪：P0 人工驗收腳本化
- 新增 `docs/ACCESSIBILITY_P0_TEST_SCRIPT.md`。
- 首頁、tools、Management Coach、PBS Companion 已拆成可直接照著執行的 Tab / Escape / 200% / 400% / 320px 測試步驟。
- Engineering Bay 特別驗證收合時 Tab 略過、展開後可進入、Escape 關閉後焦點返回。
- Management Coach 特別驗證錯誤後焦點導向與 panel H2 focus。
- PBS Companion 特別驗證 target behavior error 與動態 ABC table。
- P0 完成門檻固定：鍵盤 + 三組 reflow 測試完成，且沒有未處理 Blocker。
