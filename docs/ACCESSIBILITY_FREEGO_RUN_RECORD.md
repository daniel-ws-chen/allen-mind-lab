# AML Freego 掃描紀錄模板

掃描日期：  
Branch / commit：  
掃描工具版本：  
掃描起始 URL：  
掃描範圍：代表樣本 / 全站 104 URL  
執行者：

## 摘要

- 掃描 URL 數：
- Error：
- Warning：
- 人工確認：
- 無法判定：
- Blocker：
- Major：
- Minor：

## 問題清單

| # | URL | 規則／問題 | 等級 | 判定 | 修正 commit | 重測 |
|---|---|---|---|---|---|---|
| 1 |  |  |  |  |  |  |

## 判定規則

- **確認缺失**：可重現，且有明確可及性影響。
- **工具誤判**：經 DOM / keyboard / assistive-tech 驗證後可說明。
- **需人工確認**：自動工具不足以判定。
- **範圍問題**：涉及 authenticated / restricted / public boundary，需另附證據。

## 重測紀錄

每次修正後至少記錄：

```
URL:
原問題:
修正 commit:
branch preview:
重測日期:
重測方式:
結果:
```

## 完成門檻

- 所有 Blocker = 0。
- Major 已修正或有清楚、可驗證的例外理由。
- 代表樣本全部重測。
- 共用模板修正後，重新跑全站掃描。
- 不把工具 warning 直接當成通過或失敗；需保留人工判讀。
