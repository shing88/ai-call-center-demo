# タスク 14: ai-response-request-contract

## ゴール

外部AI API連携の前段として、現在のキュー項目、根拠候補、会話プレビュー、未送信Operator noteを1つの送信用payloadへ組み立てるTypeScript契約を追加する。実際の外部API呼び出し、API key、永続化、送信処理はこのタスクでは扱わない。

## 位置づけ

Task 13 `search-ranking-tuning`完了後の小さな接続準備タスク。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/14_ai_response_request_contract.md
```

## 必要な場合のみ読む

```text
package.json
src/app.ts
src/evidence-bridge.ts
src/evidence-manifest.ts
tests/app.test.ts
tests/evidence-bridge.test.ts
tests/evidence-manifest.test.ts
```

## やること

- 失敗する単体テストを先に追加する。
- 外部AI APIへ渡せる、provider非依存の送信用payload型とbuilderを追加する。
- payloadには選択中call id、キュー情報、根拠候補、会話プレビュー、未送信Operator note、送信/保存しないためのguardrail情報を含める。
- 現在のデモ境界に合わせ、実際のnetwork callやsecret参照は追加しない。

## やらないこと

- OpenAIなど特定providerのSDKやAPI仕様へ結合しない。
- API key、環境変数、認証、DB、会話履歴保存を追加しない。
- ブラウザUIの送信ボタンや本送信フローを追加しない。
- 検索ランキングやknowledge baselineを広げない。

## テスト

```bash
npm test
npm run build
git diff --check
```

## レビュー観点

- API / contract
- Security
- Test / TypeScript
- Context hygiene

## 完了条件

- AI response requestのTypeScript契約とbuilderが追加されている。
- 単体テストでpayloadの主要フィールド、guardrail、HTML混入時の扱いが確認されている。
- 実際の外部通信、secret、保存処理が追加されていない。
- 現在の状態が変わった場合は`CURRENT.md`が更新されている。
- `ACTIVE_TASK.md`が次のタスク状態を指している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
