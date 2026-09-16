# Allen Mind Lab｜半自動文章上稿腳本

`publish-aml-article.mjs` 是 AML 第 31–50 篇之後的半自動發布工具。

設計原則：**prepare → validate → package → 人工確認 → apply**。

腳本預設不直接修改正式網站，也不會 push GitHub / deploy。只有執行 `apply ... --yes` 才會把已驗證的 staged changes 寫回 repository。

## 0. 每次使用前

請先確認目前資料夾就是 AML 最新 repository 根目錄，且至少包含：

- `data/articles-manifest.json`
- `articles/`
- `articles.html`
- 六大主題館頁面
- `rss.xml`
- `sitemap.xml`
- `validate-aml.mjs`

## 1. 建立新文章工作區

```bash
node publish-aml-article.mjs init my-new-article-slug
```

會建立：

```text
.aml-publish/my-new-article-slug/
├─ article.json
└─ body.html
```

接著把海報放入同一資料夾：

```text
hero.webp
hero.png
```

其中：

- `hero.webp`：網站頁面載入
- `hero.png`：OG / social preview

## 2. 填寫 article.json

必要欄位包含：

- slug
- title
- subtitle
- seoDescription
- summary
- date
- primaryDomain
- bodyFile
- heroWebp
- ogImage

另可指定：

- crossDomains
- keywords
- relatedReading
- navigation.previous / next / hub
- reciprocalPrevious
- series
- featured

主域僅接受：

`ot` / `mind` / `pbs` / `education` / `management` / `ai`

## 3. 準備 staged changes

```bash
node publish-aml-article.mjs prepare .aml-publish/my-new-article-slug/article.json
```

這一步只會產生：

```text
.aml-publish/my-new-article-slug/changes/
```

**不會修改正式網站檔案。**

目前會半自動處理：

- 新文章 HTML
- SEO / canonical / OG / Twitter
- Article JSON-LD
- Hero / OG 圖片路徑
- TOC（`body.html` 可放 `<!-- AML_TOC -->` 決定位置）
- 延伸閱讀
- 分享文章／複製連結
- Continue Reading
- `articles-manifest.json`
- `articles.html` static fallback
- 對應主題館 static fallback
- `sitemap.xml`
- `rss.xml`
- 可選：前一篇文章的下一篇連動

## 4. 驗證預覽站

```bash
node publish-aml-article.mjs validate .aml-publish/my-new-article-slug/article.json
```

腳本會建立臨時 preview site，套入 staged changes，再執行：

```bash
node validate-aml.mjs
```

目標：

```text
0 errors / 0 warnings
```

此步驟仍不會修改正式網站。

## 5. 產生 GitHub 更新包

```bash
node publish-aml-article.mjs package .aml-publish/my-new-article-slug/article.json
```

會建立：

```text
.aml-publish/my-new-article-slug/github-upload/
```

若環境有 `zip` 指令，也會額外產生：

```text
AML_my-new-article-slug_GitHub_Update.zip
```

## 6. 最後人工確認

建議人工確認：

- 文章內容／文獻／醫療安全性
- 主域與跨域是否合理
- 前後文章是否真的適合串接
- 是否需要進首頁 featured
- 是否要加入 / 改動 Guided Reading
- Hero 與 OG 圖是否正確

**Guided Reading 的既有航線若需要重新排序，建議仍由人工確認，不由腳本自行決定。**

## 7. 套用至 repository

人工確認後才執行：

```bash
node publish-aml-article.mjs apply .aml-publish/my-new-article-slug/article.json --yes
```

只有這一個指令會修改 repository 中的正式檔案。

套用後建議再跑一次：

```bash
node validate-aml.mjs
```

再由 Allen 人工上傳 / commit GitHub。

## 安全邊界

這支腳本刻意不做：

- 不自動 push GitHub
- 不自動 deploy Cloudflare
- 不自行判斷醫療／研究內容是否正確
- 不自行決定一篇文章應加入哪條 Guided Reading
- 不自動覆蓋已存在的同 slug 文章

它的角色是把**重複工程標準化**，不是取代內容判斷與最後驗收。

## 建議 AML 工作流

```text
文章定稿
→ 海報完成
→ init
→ 填 article.json + body.html
→ prepare
→ validate
→ package
→ 人工確認
→ apply --yes
→ validate-aml.mjs
→ GitHub 上線
```

這就是 AML 的「半自動造艦工廠」。
