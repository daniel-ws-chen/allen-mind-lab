# 第七輪：焦點修正及鍵盤回歸驗收（2026-10-31）

## 問題
第六輪發現：進入下一題以及作答後，鍵盤焦點會落回 body。

## 修正
在畫面階段（phase 與 status）有變更時，明確將焦點設至 #screen；僅線索面板展開／收合不觸發畫面階段變更，保持其操作按鈕焦點。

## 自動化測試
- Chromium（系統執行檔）＋ Playwright，390×844。
- 以與 GitHub 本次程式變更一致的本地 v5.8 HTML 測試，而非已部署網站。
- 測試情境為教室島第 1 回合，先由 start(1) 進入 intro，再 question() 進入有線索的題目。
- 用鍵盤 Enter 展開線索：aria-expanded=true，焦點維持 investigationButton。
- 再次 Enter 收合：aria-expanded=false，焦點維持 investigationButton。
- 以鍵盤 Enter 選擇策略：phase=reaction，焦點移至 screen。
- 以鍵盤 Enter 前往下一題：phase=question，焦點移至 screen。
- 0 個未處理的 JavaScript pageerror。
- JS 語法檢查通過。

## 未完成
- 未使用實際 PR 部署預覽 URL 測試。
- 未測完整一般島＋魔王島全程鍵盤與焦點。
- 未做 NVDA／TalkBack／VoiceOver 螢幕閱讀器實測。
- 未做 WCAG 2.2 AA 全面檢查。
- 未取得 PBS 逐題專家效度確認。

PR #42 繼續維持 Draft；勿合併至 main。
