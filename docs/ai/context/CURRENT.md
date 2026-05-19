# 現在のコンテキスト

最終更新: 2026-05-19

このファイルには、現在確認済みの状態だけを書く。長い履歴ログとして使わない。

## 現在の入口

- リポジトリ運用の初期ファイルは`AGENTS.md`と`docs/ai/`配下にある。
- 最小Webアプリの入口は`index.html`、実行時の接続点は`src/main.ts`。
- デモ用knowledge baselineは`knowledge/README.md`、`knowledge/business_rules/`、`knowledge/customer_contracts/`、`knowledge/scenarios/`にある。
- Markdown loader / chunk modelは`src/knowledge.ts`にある。
- `npm run build`で`dist/index.html`と`dist/assets/*.js`を生成する。
- 開発時は`npm run dev`で`dist/`をローカル配信する。

## 現在のアーキテクチャ / 契約

- アプリケーションスタックはTypeScript + Node.js標準ライブラリ。
- `src/app.ts`にデモ用のキュー状態、集計、HTML描画、escapingを置いている。
- `src/knowledge.ts`は`knowledge/`配下の架空Markdownを読み込み、`KnowledgeDocument` / `KnowledgeChunk`へ変換する。
- chunkは文書タイトルと`##`見出し単位で作られ、カテゴリ、相対パス、見出しパス、安定ID、本文を持つ。
- 現時点ではloaderはNode.js側の境界であり、ブラウザUIには接続していない。
- 外部AI API、通話連携、認証、DBはまだ存在しない。
- 機械可読な契約はTypeScriptの`KnowledgeDocument` / `KnowledgeChunk`型として存在する。

## 現在のテスト / CI

- ローカルテストコマンドは`npm test`。
- ローカルビルドコマンドは`npm run build`。
- `npm test`はアプリ描画ロジック、knowledge Markdown baselineの構造、Markdown loader / chunk modelを検査する。
- `.github/workflows/ci.yml`で`npm ci`、`npm test`、`npm run build`を実行する。

## 現在のワークフロー

- エージェントは`AGENTS.md`、このコンテキストパック、アクティブなタスク指示から開始する。
- GPT Proや外部ツールの計画ドラフトは`docs/ai/inbox/pro-instructions/`に置き、実行前に変換する。

## 既知の未完了項目

- 次の実装タスクは未定。候補はchunk検索 / 根拠候補抽出だが、実行前に`docs/ai/tasks/`配下の短いタスク指示として定義する。
- knowledgeのUI接続、検索ランキング、AI応答接続、本格的な通話連携、外部AI API連携、認証、DB設計は未実装。

## 参照元リンク

- `AGENTS.md`
- `docs/ai/context/ACTIVE_TASK.md`
- `docs/ai/context/SOURCE_OF_TRUTH.md`

## 次のハンドオフ

- Task 04 `markdown-loader-chunk-model`は完了。
- 次はchunk検索 / 根拠候補抽出の実行可能タスク指示を作成してから着手する。
