# AML 半自動文章上稿防呆機制

## 固定流程
1. 確認正式篇號、文章標題、文章網址與海報 PNG／WebP。
2. **沿用上一篇已驗收的 AML HTML 模板**，保留全站導覽、hero、分享區、閱讀導覽與頁尾。
3. 建立文章 HTML 與圖片，並同步更新 `data/articles-manifest.json`（館藏與首頁共用資料來源）。
4. 更新上一篇的「下一篇」卡片、預告文字，並確認第 N 篇連到第 N+1 篇。
5. 同步更新 RSS、Sitemap；提交後檢查 GitHub Actions。
6. 部署後人工驗收桌面與手機版、圖片、連結及無障礙操作，才能標記「已上線驗收」。

## 自動檢查
`python scripts/check_articles.py --changed articles/new-article.html data/articles-manifest.json`

未提供 `--changed` 時，檢查所有已索引文章；對既有歷史資料可能產生警告。
GitHub Actions 在 PR、main 分支相關變更及手動執行時運作。

**限制**：自動檢查能發現缺漏索引、必要模板元件、圖片與內部文章連結問題，但不能取代實際瀏覽器的排版、響應式及無障礙驗收。直接推送 main 時，Actions 會在提交後檢查，無法事前阻止；建議使用 PR 與分支保護，要求此檢查成功才合併。
