# アクティブタスクコンテキスト

## タスク

次のタスク: Task 24 `browser-call-style-ui`

状態: Task 23 `call-summary-generation`完了。選択中問い合わせ、根拠候補、会話プレビュー、Operator note、policy guardから、問い合わせ要約、根拠参照、policy判断、Operator note状態、次アクションをローカル決定的に表示できる。次はTask 24で、現在の安全境界を維持したまま役員に見せる通話風UIへ整える。

## タスク開始時に必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/24_browser_call_style_ui.md
```

## 必要な場合のみ読む

```text
README.md
package.json
src/app.ts
src/call-summary.ts
src/response-policy.ts
src/ai-response-request.ts
src/ai-response-client.ts
src/demo-scenario-regression.ts
tests/**
knowledge/**
docs/ai/demo/executive-demo-script.md
docs/ai/demo/ccnet-executive-scenario.md
docs/ai/security/call-summary-generation-safety-audit.md
docs/ai/specs/draft-task-reconciliation.md
docs/ai/tests/automated-test-catalog.md
```

## 読まない

```text
docs/ai/archive/**
docs/ai/reports/**
古い計画
完了済みのタスク指示
```

## 追加ファイルの利用

追加でファイルを読んだ場合は、PRの`Context usage`に記録する。
