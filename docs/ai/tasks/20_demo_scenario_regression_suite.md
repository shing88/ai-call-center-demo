# タスク 20: demo-scenario-regression-suite

## ゴール

代表シナリオごとに、根拠候補、応答ドラフト、Operator note、policy guard、AI response request/client境界の期待結果を固定する回帰テスト群を追加する。

このタスクでは、外部AI API、provider固有SDK、認証、DB、永続保存、本送信は追加しない。現在の決定的なローカル境界を、デモとして壊れにくいシナリオ単位の期待値へまとめる。

## 位置づけ

Task 19 `response-policy-guard`後の次タスク。Draft 14 `demo_scenarios_regression_tests`を、現在の根拠候補、operator input、policy guard、request/client境界に合わせて回収する。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/20_demo_scenario_regression_suite.md
docs/ai/specs/draft-task-reconciliation.md
```

## 必要な場合のみ読む

```text
package.json
src/app.ts
src/evidence-bridge.ts
src/response-policy.ts
src/ai-response-request.ts
src/ai-response-client.ts
tests/**
knowledge/business_rules/**
knowledge/customer_contracts/**
knowledge/scenarios/**
docs/ai/security/response-policy-guard-safety-audit.md
docs/ai/tests/automated-test-catalog.md
```

## やること

- 失敗する単体テストを先に追加する。
- 代表シナリオを2〜4件選び、queue item、根拠候補、operator input、policy outcome、request/client resultの期待値を固定する。
- 既存の小さなunit testを置き換えすぎず、シナリオ横断の回帰テストとして読みやすい構造にする。
- 本人確認前、本人確認済み、上席確認必須の分岐を最低1件ずつ含める。
- 必要なら`docs/ai/tests/automated-test-catalog.md`を更新する。
- `CURRENT.md` / `ACTIVE_TASK.md`をhandoffに合わせて更新する。

## やらないこと

- 実際の外部送信、DB保存、認証、Realtime音声、tool callingを追加しない。
- provider固有SDKやAPI key、環境変数を追加しない。
- 大きなUIリデザインや役員デモ仕上げはこのタスクに含めない。

## テスト

```bash
npm test
npm run build
git diff --check
```

Windows PowerShellでは`npm.cmd test` / `npm.cmd run build`を使ってよい。

## レビュー観点

- Scenario coverage
- Policy / safety
- API / contract
- Test / TypeScript
- Context hygiene

## 完了条件

- 代表シナリオごとの期待結果がテストで固定されている。
- 本送信・永続保存・外部AI API接続が追加されていない。
- policy guardとrequest/client境界の期待値がシナリオ単位で確認できる。
- 必要なテストが通っている。
- `CURRENT.md`が現在状態だけを反映している。
- `ACTIVE_TASK.md`が次のタスク状態を指している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
