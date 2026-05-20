# タスク 15: ai-response-client-adapter

## ゴール

`AiResponseRequest`を消費するAI response client adapterのTypeScript契約を追加する。外部AI APIの本番呼び出しではなく、provider差し替え前の境界と決定的なstub実装を作る。

## 位置づけ

Task 14 `ai-response-request-contract`完了後の小さな接続準備タスク。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/15_ai_response_client_adapter.md
```

## 必要な場合のみ読む

```text
package.json
tsconfig.json
src/ai-response-request.ts
tests/ai-response-request.test.ts
```

## やること

- 失敗する単体テストを先に追加する。
- `AiResponseRequest`を受け取ってAI応答ドラフト結果を返すclient adapterの型を追加する。
- 実外部通信を行わない決定的stub clientを追加し、将来のprovider別clientが守る入出力の形を固定する。
- 結果にはcall id、provider/model識別子、応答文、根拠参照、human review要否、外部送信/保存不可のguardrailを含める。

## やらないこと

- OpenAIなど特定providerのSDKやAPI仕様へ結合しない。
- network call、API key、環境変数、認証、DB、会話履歴保存を追加しない。
- ブラウザUIの送信ボタンや本送信フローを追加しない。
- 既存の`AiResponseRequest`契約を広げすぎない。

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

- AI response client adapterのTypeScript契約と決定的stubが追加されている。
- 単体テストでprovider/model識別子、根拠参照、guardrail、human review要否が確認されている。
- 実際の外部通信、secret、保存処理が追加されていない。
- 現在の状態が変わった場合は`CURRENT.md`が更新されている。
- `ACTIVE_TASK.md`が次のタスク状態を指している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
