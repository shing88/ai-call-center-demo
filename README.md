# AI Call Center Demo

AI call center demoの最初の実行可能なWebアプリ雛形です。現時点では外部AI API、通話連携、認証、DBは含めず、ブラウザで開ける静的なオペレーション画面と最小テストだけを置いています。

## コマンド

```bash
npm install
npm run dev
npm test
npm run build
```

`npm run dev`でTypeScriptをコンパイルし、build時に根拠候補manifestを生成してから、`dist/`を静的サーバーで配信します。

## 現在の入口

- ブラウザ入口: `index.html`
- アプリ本体: `src/main.ts`
- 描画ロジック: `src/app.ts`
- knowledge loader / search: `src/knowledge.ts`、`src/knowledge-search.ts`
- 根拠候補bridge: `src/evidence-bridge.ts`
- build時manifest生成: `scripts/generate-evidence-manifest.mjs`
- テスト: `tests/*.test.ts`

## デモ知識ベース

`knowledge/`配下に、AI応対の後続実装で参照するための架空Markdownを置いています。Node.js側ではMarkdown loader、keyword search、キュー項目から根拠候補を作るbridgeまで用意しています。build時に`dist/assets/evidence-bundles.json`を生成し、ブラウザUIはそのmanifestを読み込んでAssistant handoffへ表示します。キュー項目を開くと、該当call idの根拠候補、応答ドラフト、会話履歴風プレビュー、未送信のOperator note入力欄へ切り替わります。応答ドラフト、会話プレビュー、入力欄はデモ用の決定的な文面で、外部AI API連携、送信、保存にはまだ接続していません。

- 業務ルール: `knowledge/business_rules/`
- 架空顧客契約: `knowledge/customer_contracts/`
- デモシナリオ: `knowledge/scenarios/`

これらはすべてデモ用の架空データであり、実在の顧客情報、住所、電話番号、契約番号は含めません。
