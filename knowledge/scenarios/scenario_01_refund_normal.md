---
doc_type: demo_scenario
scenario_id: scenario_01_refund_normal
demo_data: fictional
---

# シナリオ01: 通常返金相談

この文書はデモ用の架空シナリオであり、実在の通話内容ではない。

## 顧客

- 対象: `customer_1001`
- 目的: 返品と通常返金の相談。

## 問い合わせ内容

顧客は、最近利用を始めたサービスの一部が期待と違ったため、返金手順を知りたい。

## 本人確認前の安全な応答

- 一般的な返金条件を案内する。
- 顧客別の契約状態や特約は本人確認後に確認すると伝える。

## 本人確認後の応答方針

- `002_refund_policy.md`の通常返金条件を確認する。
- `customer_1001.md`の特約により、条件を満たす場合は初回手数料免除の可能性を案内する。
- 返金額はこのbaselineでは確定しない。

## 根拠候補

- `business_rules/001_identity_verification.md`
- `business_rules/002_refund_policy.md`
- `customer_contracts/customer_1001.md`

## 期待結果

AIは通常返金の流れを案内し、返金額の断定は避ける。
