# タスク 02: scaffold-minimal-demo-app

## ゴール

AI call center demoの最初の実行可能なアプリ雛形を作る。現時点ではアプリスタックが存在しないため、小さなWebデモとして起動できる入口、最小テスト、基本的な開発コマンドを同じPRで追加する。

## 位置づけ

このタスクはTask 01 `define-initial-application-scope`の後に実行する最初の実装タスク。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/02_scaffold_minimal_demo_app.md
```

## 必要な場合のみ読む

```text
README.md
package.json
package-lock.json
src/**
tests/**
.github/workflows/**
```

## 読まない

```text
docs/ai/archive/**
docs/ai/reports/**
docs/ai/inbox/pro-instructions/**
古い計画
完了済みのタスク指示
```

## やること

- 既存ファイルを確認し、まだスタックがなければTypeScriptベースの最小Webアプリを追加する。
- ブラウザで開ける最初の画面を作る。
- 最小のテストコマンドを追加し、実行できる状態にする。
- 必要ならREADMEまたは短い開発メモに起動・テスト方法を書く。
- `CURRENT.md`に、追加した入口、スタック、テストコマンド、CIの有無を短く反映する。
- `ACTIVE_TASK.md`を次のタスクへ進めるか、次タスク未定なら明確に未定として更新する。

## やらないこと

- 本格的な通話連携、外部AI API連携、認証、DB設計はまだ実装しない。
- 大きなロードマップや詳細なプロダクト仕様を作らない。
- GPT Proドラフトをsource of truthとして扱わない。
- archive、reports、古い計画を現在仕様として読まない。

## テスト

```bash
git diff --check
# 追加したスタックのinstall/build/testコマンド
```

## レビュー観点

- Context hygiene
- Test / TypeScript
- Frontend entry

## 完了条件

- 実行可能なアプリ入口が存在する。
- ローカルで実行できるテストまたはbuildコマンドが存在する。
- `CURRENT.md`が現在の入口、スタック、テスト経路を短く記録している。
- `ACTIVE_TASK.md`が次のタスク状態を正しく示している。
- PR本文に`Context usage`、`Summary`、`Tests`、`Reviews`、`Known limitations`、`Context handoff`が含まれている。
