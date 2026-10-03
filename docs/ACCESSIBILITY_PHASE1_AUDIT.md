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
