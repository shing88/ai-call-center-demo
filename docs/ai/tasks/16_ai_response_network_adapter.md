# タスク 16: ai-response-network-adapter

## ゴール

`AiResponseClient`契約を満たすHTTP network adapter境界を追加する。provider固有SDKや外部AI API仕様へ結合せず、`fetcher`注入でテストできる最小のPOST/response validationを実装する。

## 位置づけ

Task 15 `ai-response-client-adapter`完了後の小さな接続準備タスク。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/16_ai_response_network_adapter.md
```

## 必要な場合のみ読む

```text
package.json
src/ai-response-request.ts
src/ai-response-client.ts
tests/ai-response-client.test.ts
```

## やること

- 失敗する単体テストを先に追加する。
- `AiResponseRequest`をJSON POSTし、`AiResponseClientResult`を受け取るHTTP adapterを追加する。
- adapterは`fetcher`を注入できるようにし、テストでは実networkを使わない。
- response payloadの最低限の型検証、HTTPエラー、call id不一致を扱う。
- 送信/保存不可guardrailはclient result内で維持する。

## やらないこと

- OpenAIなど特定providerのSDKやAPI仕様へ結合しない。
- API key、環境変数、認証、DB、会話履歴保存を追加しない。
- ブラウザUIの送信ボタンや本送信フローを追加しない。
- 本番外部APIへ接続するテストを追加しない。

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

- `AiResponseClient`契約を満たすHTTP adapterが追加されている。
- 単体テストでPOST body、headers、正常response、HTTPエラー、invalid payload、call id不一致が確認されている。
- 実際の外部通信、secret、保存処理が追加されていない。
- 現在の状態が変わった場合は`CURRENT.md`が更新されている。
- `ACTIVE_TASK.md`が次のタスク状態を指している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
