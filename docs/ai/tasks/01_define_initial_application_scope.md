# タスク 01: 初期アプリケーションスコープを定義する

## ゴール

このリポジトリの初期アプリケーションスタック、入口、テスト、CIの期待値、最初の実装タスクを確認する。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/01_define_initial_application_scope.md
```

## 必要な場合のみ読む

```text
docs/ai/inbox/pro-instructions/**
docs/ai/specs/**
docs/ai/adr/**
README.md
package.json
pyproject.toml
Gemfile
go.mod
Cargo.toml
```

## やること

- 想定されるアプリケーションスタックと主要な入口を特定する。
- ローカルテストコマンドとCIコマンドがあれば特定する。
- `CURRENT.md`に短い現在状態メモを作成または更新する。
- `docs/ai/tasks/`配下に次の実装タスクを作成する。
- `ACTIVE_TASK.md`が次のタスクを指すように更新する。

## やらないこと

- 大きなロードマップを作成しない。
- 受け入れ箱のドラフトを正本として扱わない。
- 初期スコープとテスト経路が明確になる前にプロダクト機能を実装しない。

## テスト

```bash
# リポジトリ既存のテストコマンドが特定できた場合は実行する。
```

## 完了条件

- アプリケーションの入口とテスト経路が`CURRENT.md`に記録されている。
- 次の実行可能なタスクが`docs/ai/tasks/`配下に存在する。
- `ACTIVE_TASK.md`が次のタスクを指している。
- PR本文に`Context usage` / `Tests` / `Handoff`が含まれている。
