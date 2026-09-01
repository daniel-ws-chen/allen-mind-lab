Allen Mind Lab｜全站優化 v2
2026-09-01

這個更新包一次處理：

【導覽 / UX】
- 全站桌機 Navigation 統一
- 手機新增 ☰ 漢堡選單
- About / Research / Recognition / Publications / Articles / Contact 全站一致
- 手機不再只能依賴 Footer 找 Research / Recognition
- ESC、點選連結、點擊選單外可關閉手機選單
- 自動標示目前所在頁面

【Footer】
- 全站統一 Explore AML
- 全站統一 Explore Topics
- Research / Recognition 補齊
- Facebook / Newsletter / Privacy / Terms / RSS / Sitemap 保留

【SEO / 分享】
- canonical URL
- Open Graph：Facebook / LINE 分享標題、摘要、圖片
- Twitter / X summary_large_image
- 目前統一使用既有 images/allen-banner.png 作為分享預覽圖
- Sitemap 同步納入 Research / Recognition 與兩篇文章
- robots.txt 指向 Sitemap

【行動裝置與效能】
- 保留首頁已成功的 allen-banner-mobile.png 響應式 Banner
- 非首屏圖片加入 loading="lazy"
- 導覽與 Footer focus-visible 鍵盤焦點
- Skip to main content 無障礙連結

【本包不會處理】
- 不改寫既有文章與專業內容
- 不新增公開留言系統
- 不改自訂網域
- 不更換您現有 Banner 圖檔

GitHub 上傳方式
1. 解壓縮
2. 將本包所有檔案／articles 資料夾上傳到 repository 根目錄
3. 同名檔案選擇覆蓋
4. 新增 aml-site.css 與 aml-site.js
5. Commit 到 main

Commit message 建議：
Optimize site navigation mobile UX and SEO

注意：
images/ 資料夾不用重新上傳；本版沿用目前 GitHub 已存在的圖片。
