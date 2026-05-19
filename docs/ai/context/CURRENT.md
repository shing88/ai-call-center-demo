# 現在のコンテキスト

最終更新: 2026-05-19

このファイルには、現在確認済みの状態だけを書く。長い履歴ログとして使わない。

## 現在の入口

- リポジトリ運用の初期ファイルは`AGENTS.md`と`docs/ai/`配下にある。
- 最小Webアプリの入口は`index.html`、実行時の接続点は`src/main.ts`。
- Assistant handoffにはbuild時に生成した根拠候補manifestの内容が表示される。
- デモ用knowledge baselineは`knowledge/README.md`、`knowledge/business_rules/`、`knowledge/customer_contracts/`、`knowledge/scenarios/`にある。
- Markdown loader / chunk modelは`src/knowledge.ts`にある。
- keyword search / 根拠候補抽出は`src/knowledge-search.ts`にある。
- キュー項目とknowledge検索結果をつなぐ根拠候補bridgeは`src/evidence-bridge.ts`にある。
- evidence manifestのbrowser-safe helperは`src/evidence-manifest.ts`、build専用builderは`src/evidence-manifest-builder.ts`、browser fetch helperは`src/evidence-manifest-client.ts`にある。
- `npm run build`で`dist/index.html`、`dist/assets/*.js`、`dist/assets/evidence-bundles.json`を生成する。
- 開発時は`npm run dev`で`dist/`をローカル配信する。

## 現在のアーキテクチャ / 契約

- アプリケーションスタックはTypeScript + Node.js標準ライブラリ。
- `src/app.ts`にデモ用のキュー状態、集計、HTML描画、escapingを置いている。
- `src/app.ts`は`AssistantEvidence`表示用データを受け取り、出典、section、snippet、scoreをAssistant handoffに表示する。
- `src/knowledge.ts`は`knowledge/`配下の架空Markdownを読み込み、`KnowledgeDocument` / `KnowledgeChunk`へ変換する。
- chunkは文書タイトルと`##`見出し単位で作られ、カテゴリ、相対パス、見出しパス、安定ID、本文を持つ。
- `src/knowledge-search.ts`は`KnowledgeChunk`配列からキーワード検索し、`sourcePath`、`section`、`snippet`、`score`、`matchedTerms`を持つ根拠候補を返す。
- `src/evidence-bridge.ts`は`QueueItem`の`topic`と`excerpt`から検索クエリを作り、`EvidenceBundle`として根拠候補を返す。
- `scripts/generate-evidence-manifest.mjs`はbuild後のcompiled modulesを使い、demo queue向けの`evidence-bundles.json`を生成する。
- `src/main.ts`はmanifest取得に成功した場合はその根拠候補を表示し、失敗した場合は`demoState`のfallback表示を使う。
- 顧客契約検索は`customerId`で対象顧客を絞れる。
- 現時点ではloader/search/evidence bridgeはNode.js側のbuild時境界であり、ブラウザUIは生成済みmanifestだけをfetchする。
- 外部AI API、通話連携、認証、DBはまだ存在しない。
- 機械可読な契約はTypeScriptの`KnowledgeDocument` / `KnowledgeChunk` / `KnowledgeSearchResult` / `EvidenceBundle`型として存在する。

## 現在のテスト / CI

- ローカルテストコマンドは`npm test`。
- ローカルビルドコマンドは`npm run build`。
- `npm test`はアプリ描画ロジック、Assistant handoffの根拠候補表示、evidence manifest/fallback、knowledge Markdown baselineの構造、Markdown loader / chunk model、keyword search / 根拠候補抽出、evidence bridgeを検査する。
- `.github/workflows/ci.yml`で`npm ci`、`npm test`、`npm run build`を実行する。

## 現在のワークフロー

- エージェントは`AGENTS.md`、このコンテキストパック、アクティブなタスク指示から開始する。
- GPT Proや外部ツールの計画ドラフトは`docs/ai/inbox/pro-instructions/`に置き、実行前に変換する。

## 既知の未完了項目

- 次の実装タスクは未定。候補はキュー項目選択に応じてmanifest内の根拠候補を切り替える作業、または会話フローへ接続する作業だが、実行前に`docs/ai/tasks/`配下の短いタスク指示として定義する。
- キュー選択に応じた根拠候補切り替え、検索ランキング高度化、AI応答接続、本格的な通話連携、外部AI API連携、認証、DB設計は未実装。

## 参照元リンク

- `AGENTS.md`
- `docs/ai/context/ACTIVE_TASK.md`
- `docs/ai/context/SOURCE_OF_TRUTH.md`

## 次のハンドオフ

- Task 08 `evidence-manifest-build`は完了。
- 次はキュー項目選択に応じてmanifest内の根拠候補を切り替える、または会話フローへ接続する実行可能タスク指示を作成してから着手する。
