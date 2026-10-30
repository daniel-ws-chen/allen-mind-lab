# 第六輪｜鍵盤焦點回歸測試（2026-10-31）

## 實測方法
Chromium + Playwright，390×844 畫面，測試版本依 PR #42 的焦點與 live-region 修正重現；測試原本 v5.8 的教室島第 1 回合（`1-0`）。

## 結果
- Enter 展開線索：`aria-expanded=false→true`、內容可見、焦點保留在 `investigationButton`。
- 再次 Enter 收合：`aria-expanded=true→false`、內容隱藏、焦點仍保留在 `investigationButton`。
- Enter 選擇策略：成功切換至 `reaction`，但 `document.activeElement` 回到 `body`。
- Enter 進入下一題：成功切換至下一回合 `question`，但焦點仍回到 `body`。
- 無未處理 JavaScript 頁面錯誤。

## 發現問題
第五輪逾時部分源於測試進入不含線索的回合；改成 `1-0` 後成功完成該段測試。**仍存在真實的回合切換焦點遺失問題**；目前不宜把整體鍵盤操作標記為通過。

## 本輪修正狀態
僅新增測試紀錄與阻塞資訊；**未將未驗證的焦點修補提交到遊戲**。下次須為所有動態換頁點建立可靠且不搶線索按鈕焦點的焦點管理，然後重跑完整鍵盤流程。

## 發布界線
維持 Draft PR #42；未合併 main，沒有公開上架。未做實機螢幕閱讀器及 WCAG 2.2 AA 審查。
