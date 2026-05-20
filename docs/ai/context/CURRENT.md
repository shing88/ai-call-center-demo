# 現在のコンテキスト

最終更新: 2026-05-20

このファイルには、現在確認済みの状態だけを書く。長い履歴ログとして使わない。

## 現在の入口

- リポジトリ運用の初期ファイルは`AGENTS.md`と`docs/ai/`配下にある。
- 最小Webアプリの入口は`index.html`、実行時の接続点は`src/main.ts`。
- Assistant handoffにはbuild時に生成した根拠候補manifestの内容、デモ用応答ドラフト、会話履歴風プレビュー、未送信のOperator note入力欄が表示され、キュー項目の選択に応じて該当call idの根拠候補、ドラフト、プレビュー、入力欄へ切り替わる。
- デモ用knowledge baselineは`knowledge/README.md`、`knowledge/business_rules/`、`knowledge/customer_contracts/`、`knowledge/scenarios/`にある。
- Markdown loader / chunk modelは`src/knowledge.ts`にある。
- keyword search / 根拠候補抽出は`src/knowledge-search.ts`にある。
- キュー項目とknowledge検索結果をつなぐ根拠候補bridgeは`src/evidence-bridge.ts`にある。
- evidence manifestのbrowser-safe helperは`src/evidence-manifest.ts`、build専用builderは`src/evidence-manifest-builder.ts`、browser fetch helperは`src/evidence-manifest-client.ts`にある。
- 外部AI API連携前の送信用payload契約とbuilderは`src/ai-response-request.ts`にある。
- AI response client adapter契約と実外部通信を行わない決定的stubは`src/ai-response-client.ts`にある。
- AI response HTTP network adapter境界は`src/ai-response-network-client.ts`にある。`fetcher`注入でテストでき、provider固有SDKやsecret参照は持たない。
- `npm run build`で`dist/index.html`、`dist/assets/*.js`、`dist/assets/evidence-bundles.json`を生成する。
- 開発時は`npm run dev`で`dist/`をローカル配信する。

## 現在のアーキテクチャ / 契約

- アプリケーションスタックはTypeScript + Node.js標準ライブラリ。
- `src/app.ts`にデモ用のキュー状態、集計、HTML描画、escapingを置いている。
- `src/app.ts`は`AssistantEvidence`表示用データを受け取り、出典、section、snippet、scoreをAssistant handoffに表示し、選択中キューと根拠候補からデモ用応答ドラフト、会話履歴風プレビュー、未送信入力プレビューを決定的に作る。
- `src/knowledge.ts`は`knowledge/`配下の架空Markdownを読み込み、`KnowledgeDocument` / `KnowledgeChunk`へ変換する。
- chunkは文書タイトルと`##`見出し単位で作られ、カテゴリ、相対パス、見出しパス、安定ID、本文を持つ。
- `src/knowledge-search.ts`は`KnowledgeChunk`配列からキーワード検索し、`sourcePath`、`section`、`snippet`、`score`、`matchedTerms`を持つ根拠候補を返す。ランキングはタイトル、見出し、本文、source pathの一致に加えて、クエリ内の複数語が同じchunk内で近く出る候補を加点する。
- `src/evidence-bridge.ts`は`QueueItem`の`topic`と`excerpt`から検索クエリを作り、`EvidenceBundle`として根拠候補を返す。
- `scripts/generate-evidence-manifest.mjs`はbuild後のcompiled modulesを使い、demo queue向けの`evidence-bundles.json`を生成する。
- `src/main.ts`はmanifest取得に成功した場合はその根拠候補を表示し、キュー項目の「開く」操作で該当bundleをAssistant handoffへ反映する。表示再描画時に応答ドラフト、会話履歴風プレビュー、未送信入力欄も選択中call idへ追従する。manifest取得失敗時や該当bundleなしの場合は既存表示を維持する。
- `src/ai-response-request.ts`は選択中キュー項目、根拠候補、応答ドラフト、会話プレビュー、未送信Operator noteをprovider非依存の送信用payloadへまとめる。現時点では`externalSendAllowed`と`persistenceAllowed`は常に`false`で、外部通信や保存は行わない。
- `src/ai-response-client.ts`は`AiResponseRequest`を消費するclient adapter境界を定義し、決定的stubでprovider/model識別子、応答ドラフト、根拠参照、human review要否、送信/保存不可guardrailを返す。
- `src/ai-response-network-client.ts`は`AiResponseRequest`をJSON POSTし、`AiResponseClientResult`を受け取るHTTP adapterを定義する。response payload、HTTPエラー、call id不一致を検証するが、本番provider SDK、API key、環境変数は扱わない。
- 顧客契約検索は`customerId`で対象顧客を絞れる。
- 現時点ではloader/search/evidence bridgeはNode.js側のbuild時境界であり、ブラウザUIは生成済みmanifestだけをfetchする。
- 外部AI APIのprovider固有本番接続、LLM応答生成、会話履歴保存、通話連携、認証、DBはまだ存在しない。
- 機械可読な契約はTypeScriptの`KnowledgeDocument` / `KnowledgeChunk` / `KnowledgeSearchResult` / `EvidenceBundle` / `AiResponseRequest` / `AiResponseClient` / `AiResponseClientResult` / `AiResponseNetworkFetcher`型として存在する。

## 現在のテスト / CI

- ローカルテストコマンドは`npm test`。
- ローカルビルドコマンドは`npm run build`。
- `npm test`はアプリ描画ロジック、キュー選択状態、Assistant handoffの根拠候補表示、デモ用応答ドラフト、会話履歴風プレビュー、未送信入力プレビュー、AI response request payload、AI response client adapter、AI response network adapter、evidence manifest/fallback、knowledge Markdown baselineの構造、Markdown loader / chunk model、keyword search / 複数語ランキング / 根拠候補抽出、evidence bridgeを検査する。
- `.github/workflows/ci.yml`で`npm ci`、`npm test`、`npm run build`を実行する。

## 現在のワークフロー

- エージェントは`AGENTS.md`、このコンテキストパック、アクティブなタスク指示から開始する。
- GPT Proや外部ツールの計画ドラフトは`docs/ai/inbox/pro-instructions/`に置き、実行前に変換する。

## 既知の未完了項目

- 次の実装タスクは未定。候補はprovider固有client設定、入力内容の送信/保存設計、または検索ランキングの追加評価だが、実行前に`docs/ai/tasks/`配下の短いタスク指示として定義する。
- LLM応答生成、会話履歴保存、本格的な通話連携、外部AI API連携、認証、DB設計は未実装。

## 参照元リンク

- `AGENTS.md`
- `docs/ai/context/ACTIVE_TASK.md`
- `docs/ai/context/SOURCE_OF_TRUTH.md`

## 次のハンドオフ

- Task 16 `ai-response-network-adapter`は完了。
- 次はprovider固有client設定、入力内容の送信/保存設計、または検索ランキングの追加評価を進める実行可能タスク指示を作成してから着手する。
