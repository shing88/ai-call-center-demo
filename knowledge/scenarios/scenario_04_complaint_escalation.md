---
doc_type: demo_scenario
scenario_id: scenario_04_complaint_escalation
demo_data: fictional
---

# シナリオ04: 苦情と上席確認

この文書はデモ用の架空シナリオであり、実在の通話内容ではない。

## 顧客

- 対象: `customer_1003`
- 目的: 解約後請求への苦情。

## 問い合わせ内容

顧客は、解約済みだと思っていたのに請求が続いたとして、補償と上席対応を求めている。

## 本人確認前の安全な応答

- 不快な体験への謝意を伝える。
- 個別の請求状態や解約受付状態は本人確認後に確認すると伝える。
- 上席確認のために担当者へつなぐ可能性を案内する。

## 本人確認後の応答方針

- `customer_1003.md`の注意事項を確認する。
- 苦情と補償要求を含むため`004_escalation_policy.md`を優先する。
- AIは補償可否を断定しない。

## 根拠候補

- `business_rules/001_identity_verification.md`
- `business_rules/004_escalation_policy.md`
- `customer_contracts/customer_1003.md`

## 期待結果

AIは謝意と引き継ぎ理由を簡潔に伝え、補償の約束をしない。
