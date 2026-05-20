# アクティブタスクコンテキスト

## タスク

次のタスク: Task 19 `response-policy-guard`

状態: Task 18 `operator-input-submit-save-design`完了。未送信Operator noteはcall id別のブラウザ内編集状態、送信/保存候補payload、保存不可/未永続の明示へ進んだ。次はTask 19で本人確認前に回答できる範囲、上席確認が必要な条件、回答不可条件を決定的に判定するpolicy guardへ進む。

## タスク開始時に必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/19_response_policy_guard.md
```

## 必要な場合のみ読む

```text
README.md
package.json
package-lock.json
src/**
tests/**
.github/workflows/**
docs/ai/tasks/README.md
docs/ai/tasks/_template.md
docs/ai/inbox/pro-instructions/**
docs/ai/specs/**
docs/ai/adr/**
docs/ai/security/operator-input-submit-save-design-safety-audit.md
knowledge/**
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
