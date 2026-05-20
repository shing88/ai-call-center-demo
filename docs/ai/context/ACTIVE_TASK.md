# アクティブタスクコンテキスト

## タスク

次のタスク: Task 25 `realtime-api-connection-boundary`

状態: Task 24 `browser-call-style-ui`実装済み。選択中call idを中心に、Call workspace、Call summary、Conversation preview、Operator note、Policy guard、Evidence candidatesを追えるレビュー専用UIになった。電話・Realtime音声・外部AI・DB保存・本番接続は未接続のまま。次はRealtimeへ進むため、公式ドキュメント確認、設定境界、未接続UI、安全監査を先に固める。

## タスク開始時に必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/25_realtime_api_connection_boundary.md
```

## 必要な場合のみ読む

```text
README.md
package.json
src/app.ts
src/main.ts
src/fallback-rehearsal.ts
src/ai-response-request.ts
src/ai-response-client.ts
src/ai-response-network-client.ts
src/response-policy.ts
tests/**
docs/ai/demo/executive-demo-script.md
docs/ai/security/browser-call-style-ui-safety-audit.md
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
