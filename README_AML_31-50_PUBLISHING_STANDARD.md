# Allen Mind Lab｜31–50 篇文章發布標準

目標：讓第 31–50 篇文章從上線第一天就符合 AML 現行的內容、SEO、AI 可理解性、館藏與閱讀航線規格，避免日後回頭補洞。

## 1. 文章定位先於上稿

每篇文章上線前先決定：

- **文章角色**：Anchor Article／Evidence-based Article／AML Note／Research Update
- **主域 primaryDomain**：OT、Mind、PBS、Education、Management、AI 六域擇一
- **跨域 crossDomains**：必要時 0–2 個即可，不為湊分類而增加
- **館藏角色**：入口文／樞紐文／系列中繼文／守城型知識文
- **閱讀航線**：是否屬於既有 Guided Reading；若不屬於，也要至少指定一篇自然的前站或延伸閱讀

原則：**一篇文章可以跨域，但必須有一個清楚的主位置。**

## 2. 每篇文章的必要網站元件

正式文章頁必須包含：

- 唯一 `<h1>`
- Meta description
- Canonical URL（正式網址不含 `.html`）
- Open Graph：type / site_name / title / description / url / image
- Twitter Card：summary_large_image / title / description / image
- `Article` JSON-LD：headline、datePublished、dateModified、author、publisher、mainEntityOfPage、image、description
- AML 全站導覽與 footer
- Hero 圖：頁面優先載入 WebP
- OG 圖：保留 PNG/JPG 作社群預覽
- 本文目錄（長文原則上保留）
- 延伸閱讀
- 「分享文章／複製連結」元件，沿用 `/aml-site.js`
- Continue Reading：至少包含前站／延伸閱讀、主題館、Articles 總館

正式文章不得保留 `noindex`。

## 3. Manifest 是館藏 Source of Truth

新增文章時同步更新 `/data/articles-manifest.json`：

- slug
- title / summary / date
- domains / primaryDomain / crossDomains
- tag / cardMeta / keywords
- articlePath
- canonical
- hero / ogImage
- series（如適用）
- featured / featuredRank / featuredMeta
- navigation

並同步更新 counts。六域文章數可重疊，`total` 必須等於正式文章總數。

## 4. 圖片規格

- 網頁 Hero：優先 WebP
- 社群 OG：PNG 或 JPG
- 不刪原始高畫質圖；網站載入版與社群版分工
- 新 Hero 盡量控制在合理檔案大小，避免單張數 MB 直接載入
- `alt` 要描述文章主視覺，不塞關鍵字

## 5. 文章航線規格

每篇新文至少回答三個問題：

1. **讀者從哪裡來？**（上一篇／相關背景）
2. **讀完後去哪裡？**（下一站／延伸閱讀）
3. **它屬於哪個館？**（主題館／Guided Reading）

不要只依日期機械串接；優先考慮內容邏輯。

目前成熟航線：

- PBS Guided Reading · 10 Articles
- AI × Human Practice Guided Reading · 8 Articles
- Management Core Reading · 9 Articles

## 6. 上線同步項目

每新增一篇正式文章，至少同步檢查：

- 文章 HTML
- Hero WebP / OG image
- `articles-manifest.json`
- `articles.html`（若仍有需要的 static fallback）
- 主題館 static fallback（必要時）
- 首頁 featured / latest（若入選）
- sitemap.xml
- rss.xml
- 前後相關文章的 Continue Reading 導覽
- About / 館藏數字（若非 manifest 自動同步的顯示）

## 7. 發布前驗證

在網站 repository 根目錄執行：

```bash
node validate-aml.mjs
```

目標：

- **0 errors** 才發布
- warnings 逐項人工確認

驗證範圍包括 Manifest、30+ 正式文章檔案、圖片、Canonical、OG/Twitter、JSON-LD、分享／複製元件、Continue Reading、Sitemap、RSS、Series 與站內 root-relative links。

## 8. 31 → 50 的治理原則

- 不為了篇數而寫
- 不為了 SEO 堆關鍵字
- 不為了跨域而硬連
- Research Update 與 Anchor Article 各自保有角色
- 外部引用以可信來源與自然關聯為優先
- 新文優先接進既有知識網路，再決定是否建立新系列

**少一點補洞，多一點從一開始就站對位置。**
