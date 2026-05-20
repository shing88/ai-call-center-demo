# AI Call Center Demo

AIコールセンターの応対支援デモです。ブラウザで開くと、架空の受付キュー、Assistant handoff、根拠候補、応答ドラフト、会話プレビュー、Operator note、Policy guard、Realtime boundary、fallback rehearsalを1画面で確認できます。

このリポジトリはデモ用です。外部AI API、実通話、認証、DB、永続保存、実顧客データには接続していません。デモ中に表示される顧客・契約・問い合わせ情報はすべて架空データです。

## すぐデモを起動する

Dockerが使える環境なら、次のコマンドだけで起動できます。

```bash
docker compose up --build
```

起動後、ブラウザで次を開きます。

```text
http://localhost:4173/
```

終了するときは、ターミナルで `Ctrl+C` を押します。バックグラウンド起動した場合は次で止めます。

```bash
docker compose down
```

Docker Composeを使わない場合は、Docker単体でも起動できます。

```bash
docker build -t ai-call-center-demo .
docker run --rm -p 4173:4173 ai-call-center-demo
```

## デモ担当者向けの見せ方

1. `Live queue`で架空の問い合わせが並んでいることを見せます。
2. `開く`ボタンで問い合わせを切り替え、選択したcall idに合わせて根拠候補、応答ドラフト、会話プレビュー、Operator noteが変わることを確認します。
3. `Evidence candidates`で、回答がMarkdown knowledge base由来の候補に基づくことを説明します。
4. `Policy guard`で、本人確認前や上席確認が必要なケースでは確定回答を避けるデモ境界を説明します。
5. `Realtime boundary`で、Realtime APIはまだ未接続で、ブラウザAPI key、マイク取得、外部音声送信、実電話接続、永続保存を行わないことを説明します。
6. `Fallback rehearsal`で、外部AIや通話連携がなくてもデモ進行できることを見せます。

## ローカル開発

Node.js 24系を使います。Windows PowerShellでは `npm.cmd` を使うと実行ポリシーに引っかかりにくいです。

```bash
npm install
npm run dev
```

`npm run dev` はTypeScriptをビルドし、`dist/assets/evidence-bundles.json`を生成してから、`dist/`を `http://127.0.0.1:4173/` で配信します。

テストとビルドは次で確認します。

```bash
npm test
npm run build
```

Windows PowerShellでは次の形でも実行できます。

```powershell
npm.cmd test
npm.cmd run build
```

## 主な入口

- ブラウザ入口: `index.html`
- アプリ起動: `src/main.ts`
- HTML描画とデモ状態: `src/app.ts`
- knowledge loader / search: `src/knowledge.ts`, `src/knowledge-search.ts`
- 根拠候補bridge: `src/evidence-bridge.ts`
- manifest生成: `scripts/generate-evidence-manifest.mjs`
- 静的配信: `scripts/serve-static.mjs`
- Docker起動: `Dockerfile`, `docker-compose.yml`
- テスト: `tests/*.test.ts`

## デモ知識ベース

`knowledge/`配下に、応対支援で参照する架空Markdownを置いています。

- 業務ルール: `knowledge/business_rules/`
- 架空顧客契約: `knowledge/customer_contracts/`
- デモシナリオ: `knowledge/scenarios/`

build時に `dist/assets/evidence-bundles.json` を生成し、ブラウザUIはそのmanifestを読み込んでAssistant handoffへ表示します。manifestは読み込み時に構造を検証し、壊れたJSONや不正なbundleはfallback表示へ戻します。

## 現在つないでいないもの

- 外部AI APIへの実送信
- Realtime音声セッション
- マイク権限要求
- 実電話接続
- 認証・DB・永続保存
- 実顧客データ

これらはデモ境界として画面上にも明示しています。実接続を追加する場合は、別タスクで安全なserver-side adapter、設定、ログ、fallbackを確認してから進めます。
