# 00: draft conversion guide

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## 目的

このディレクトリ内のドラフトを、`ai-call-center-demo` の既存スキル運用に沿って `docs/ai/tasks/` 配下の実行可能タスクへ変換する。

## 前提

現在のリポジトリは、`docs/ai/` 構成を採用している。

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/
docs/ai/inbox/pro-instructions/
.agents/skills/
```

## 変換ルール

`.agents/skills/active-task-instructions` を使い、各ドラフトを次の形式へ変換する。

```text
docs/ai/tasks/02_project_skeleton.md
docs/ai/tasks/03_knowledge_markdown_baseline.md
...
```

変換後のタスク指示には、必ず以下を含める。

```text
Goal
Position
Must read
Read only if needed
Do not read
Do
Do not
Tests
Reviews
Done when
```

## Must read の基本形

各実行タスクの Must read は原則として以下だけにする。

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/XX_task_name.md
```

必要な実装ファイルやテストファイルは `Read only if needed` に入れる。

## スキル利用

各実行タスクでは、次のスキルを想定する。

```text
.agents/skills/active-task-instructions
.agents/skills/context-pack-handoff
.agents/skills/pr-body-with-context-usage
```

コード変更を伴う場合は、可能な範囲で以下も使う。

```text
.agents/skills/safety-audit-before-feature
.agents/skills/executive-pr-report
```

## 完了条件

- `docs/ai/tasks/XX_*.md` に実行可能タスクが作成されている。
- `ACTIVE_TASK.md` がそのタスクを指している。
- `CURRENT.md` は現在状態だけを短く保っている。
- GPT Proドラフトは `SOURCE_OF_TRUTH.md` 上、実行タスクより下位のままである。
