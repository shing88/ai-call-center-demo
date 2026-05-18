# 現在のコンテキスト

最終更新: 2026-05-18

このファイルには、現在確認済みの状態だけを書く。長い履歴ログとして使わない。

## 現在の入口

- リポジトリ運用の初期ファイルは`AGENTS.md`と`docs/ai/`配下にある。
- プロダクトまたはアプリケーションの入口はまだ存在しない。
- ルートには`package.json`、`pyproject.toml`、`Gemfile`、`go.mod`、`Cargo.toml`、`README.md`はまだ存在しない。

## 現在のアーキテクチャ / 契約

- アプリケーションスタックは未設定。
- 機械可読な契約はまだ存在しない。

## 現在のテスト / CI

- ローカルテストコマンドはまだ存在しない。
- `.github`配下にはPRテンプレートのみあり、CI workflowはまだ存在しない。

## 現在のワークフロー

- エージェントは`AGENTS.md`、このコンテキストパック、アクティブなタスク指示から開始する。
- GPT Proや外部ツールの計画ドラフトは`docs/ai/inbox/pro-instructions/`に置き、実行前に変換する。

## 既知の未完了項目

- 最小のデモアプリ雛形、入口、テストコマンドを追加する。
- CI workflowを追加するかどうかを、最初のアプリ雛形に合わせて判断する。

## 参照元リンク

- `AGENTS.md`
- `docs/ai/context/ACTIVE_TASK.md`
- `docs/ai/context/SOURCE_OF_TRUTH.md`

## 次のハンドオフ

- 次はTask 02 `scaffold-minimal-demo-app`を実行する。
- 最初の実装では、実行可能なアプリ入口と最小テスト経路を同じPRで作る。
