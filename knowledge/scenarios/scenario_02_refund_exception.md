---
doc_type: demo_scenario
scenario_id: scenario_02_refund_exception
demo_data: fictional
---

# シナリオ02: 例外返金と解約

この文書はデモ用の架空シナリオであり、実在の通話内容ではない。

## 顧客

- 対象: `customer_1002`
- 目的: 年額契約の途中解約と返金相談。

## 問い合わせ内容

顧客は、サービスが期待と違ったため今すぐ解約し、残期間分の返金も受けたいと求めている。

## 本人確認前の安全な応答

- 一般的な解約と返金の流れだけを案内する。
- 年額契約や個別特約には触れない。

## 本人確認後の応答方針

- `customer_1002.md`の年額契約特約を確認する。
- `002_refund_policy.md`の例外返金条件に該当するため、AIだけで結論を出さない。
- `004_escalation_policy.md`に従い上席確認へ回す。

## 根拠候補

- `business_rules/002_refund_policy.md`
- `business_rules/003_cancellation_policy.md`
- `business_rules/004_escalation_policy.md`
- `customer_contracts/customer_1002.md`

## 期待結果

AIは例外確認が必要であることを伝え、確定返金の約束をしない。
