# アクティブタスクコンテキスト

## タスク

次のタスク: Task 23 `call-summary-generation`

状態: Task 22 `executive-demo-polish`完了。Assistant handoffの冒頭にExecutive demo briefを追加し、根拠候補、policy guard、fallback / rehearsal、送信/保存不可の関係を役員デモで説明しやすくした。次はTask 23で、選択中問い合わせの応対サマリー、判断結果、次アクションをローカル決定的に作る。

## タスク開始時に必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/23_call_summary_generation.md
```

## 必要な場合のみ読む

```text
README.md
package.json
src/app.ts
src/response-policy.ts
src/ai-response-request.ts
src/ai-response-client.ts
src/demo-scenario-regression.ts
tests/**
knowledge/**
docs/ai/demo/executive-demo-script.md
docs/ai/demo/ccnet-executive-scenario.md
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
