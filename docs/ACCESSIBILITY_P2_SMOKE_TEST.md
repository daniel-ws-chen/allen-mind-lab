# AML P2 Smoke Test 人工無障礙測試腳本

更新日期：2026-10-03  
Branch：`accessibility/phase1-a-preflight`

P2 用來快速確認低互動、主要使用共用模板的頁面沒有因共用 CSS / nav / footer 回歸而失效。P2 不需要像 P0/P1 一樣走完整工作流程，但必須完成鍵盤 smoke test 與 320px reflow。

## P2-1｜進階自學室 `/self-study.html`

### 鍵盤 smoke test
1. 啟動 skip link。
2. Tab 走過所有主要 CTA、reset / start controls、學習入口與 footer。
3. 確認 focus ring 清楚。
4. 確認沒有只能 hover 才可理解的必要資訊。

### 320px
- CTA / reset 若使用 nowrap，不可撐寬 viewport。
- 卡片、進度區與 badge 可換行。
- 無頁面級水平 overflow。
- footer 不重疊。

---

## P2-2｜精選資源 `/resources.html`

### 鍵盤 smoke test
1. 啟動 skip link。
2. Tab 走過主要資源連結與 footer。
3. 外部連結名稱必須能從 link text 理解目的。
4. 新分頁連結不應只靠圖示表示。

### 320px
- 資源卡片改為單欄。
- 長網址／長名稱可換行。
- 外部網站按鈕不超出容器。

---

## P2-3｜About / Research / Publications / Recognition

至少抽兩頁：

- `/about.html`
- `/research.html`
- `/publications.html`
- `/recognition.html`

Smoke test：
- skip link → main。
- heading 順序合理。
- 圖片 alt 合理。
- 所有 link / button 可 Tab。
- 320px 無頁面級水平 overflow。
- 200% zoom 不出現文字重疊。

---

## P2-4｜Privacy / Terms / Contact

- `/privacy.html`
- `/terms.html`
- `/contact.html`

Smoke test：
- title / H1 / main 清楚。
- 長段落可 200% zoom 閱讀。
- contact 若有表單，label / focus / error 狀態可理解。
- 320px 下 footer 與內容不互相覆蓋。

---

## P2-5｜其他公開工具抽樣

每次發版至少從以下類型各抽一個：
- AI 類工具
- PBS 類工具
- Self-awareness / sensory 類工具
- 管理類工具

每頁只做：
- skip link。
- 頁首到第一個核心互動的 Tab。
- 核心互動可操作。
- Escape / 返回行為合理（若有 panel）。
- 320px smoke test。
- reduced-motion 開啟後確認沒有必要資訊消失。

## P2 完成門檻

- 所有 P2 頁面／抽樣頁完成 smoke test。
- 沒有 Blocker。
- 若出現共用模板 Major，先修共用 CSS / JS，再重新抽樣。
- P2 通過不代表全頁逐項人工驗證完成；其用途是防止共用回歸。
