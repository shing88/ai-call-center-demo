# AI Call Center Demo

AI call center demoの最初の実行可能なWebアプリ雛形です。現時点では外部AI API、通話連携、認証、DBは含めず、ブラウザで開ける静的なオペレーション画面と最小テストだけを置いています。

## コマンド

```bash
npm install
npm run dev
npm test
npm run build
```

`npm run dev`でTypeScriptをコンパイルしてから、`dist/`を静的サーバーで配信します。

## 現在の入口

- ブラウザ入口: `index.html`
- アプリ本体: `src/main.ts`
- 描画ロジック: `src/app.ts`
- テスト: `tests/app.test.ts`

## デモ知識ベース

`knowledge/`配下に、AI応対の後続実装で参照するための架空Markdownを置いています。現時点では読み込み処理や検索処理には接続していません。

- 業務ルール: `knowledge/business_rules/`
- 架空顧客契約: `knowledge/customer_contracts/`
- デモシナリオ: `knowledge/scenarios/`

これらはすべてデモ用の架空データであり、実在の顧客情報、住所、電話番号、契約番号は含めません。
