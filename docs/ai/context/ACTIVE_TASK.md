# アクティブタスクコンテキスト

## タスク

次のタスク: Task 26 `realtime-token-endpoint-contract`

状態: Task 25 `realtime-api-connection-boundary`実装済み。Realtime boundaryは`Realtime not configured`を表示し、server-minted ephemeral client secret前提、ブラウザAPI key禁止、マイク未要求、外部音声送信blocked、実電話接続blocked、session start disabledを固定している。次は標準API keyをブラウザへ出さず、サーバー側でephemeral client secretを発行するためのcontractを定義する。

## タスク開始時に必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/26_realtime_token_endpoint_contract.md
```

## 必要な場合のみ読む

```text
README.md
package.json
src/app.ts
src/main.ts
src/realtime-connection.ts
src/ai-response-network-client.ts
tests/**
docs/ai/security/realtime-api-connection-boundary-safety-audit.md
docs/ai/specs/draft-task-reconciliation.md
docs/ai/tests/automated-test-catalog.md
```

## 読まない

```text
docs/ai/archive/**
docs/ai/reports/**
docs/ai/inbox/pro-instructions/**
古い計画
完了済みのタスク指示
```

## 追加ファイルの利用

追加でファイルを読んだ場合は、PRの`Context usage`に記録する。
