# アクティブタスクコンテキスト

## タスク

次のタスク: Task 27 `realtime-token-endpoint-disabled-adapter`

状態: Task 26 `realtime-token-endpoint-contract`実装済み。Realtime boundaryは`Realtime not configured`を維持しつつ、contract-only token endpoint `POST /api/realtime/client-secret`、OpenAI側`/v1/realtime/client_secrets`のserver-only前提、`value` / `expires_at` / `session` response field、ブラウザAPI key禁止、マイク未要求、外部音声送信blocked、session start disabledを固定している。ブラウザ入口はNode-only moduleを含まない依存グラフへ修正済み。次は実OpenAI API keyや実network呼び出しを入れず、未設定時のdisabled adapter / fallback responseを決定的に扱う。

## タスク開始時に必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/27_realtime_token_endpoint_disabled_adapter.md
```

## 必要な場合のみ読む

```text
README.md
package.json
src/app.ts
src/realtime-connection.ts
src/realtime-token-endpoint.ts
tests/**
docs/ai/security/realtime-token-endpoint-contract-safety-audit.md
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
