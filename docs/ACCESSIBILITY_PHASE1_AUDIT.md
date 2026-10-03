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
