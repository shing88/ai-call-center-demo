# AI Call Center Demo

AIコールセンターの応対支援デモです。ブラウザで開くと、架空の受付キュー、Assistant handoff、根拠候補、応答ドラフト、会話プレビュー、Operator note、Policy guard、Realtime boundary、Realtime call controls、Realtime handoff record、fallback rehearsalを1画面で確認できます。

このリポジトリはデモ用です。Realtime音声はブラウザの`Start call`から短命client secretで接続するデモ境界だけを扱い、実電話、認証、本番DB、実顧客データには接続していません。デモ中に表示される顧客・契約・問い合わせ情報はすべて架空データです。`End call`後のhandoff recordだけ、デモ継続用にserver-side local JSONへ保存できます。

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
5. `Realtime boundary`で、標準API keyはブラウザに出さず、server-side endpointだけでOpenAIへ接続することを説明します。`Start call`はserver token endpointが設定済みのときだけWebRTC接続へ進み、ブラウザはSDP offerをローカルの`/api/realtime/calls`へ渡します。未設定や失敗時はfallback rehearsalに戻り、client secret、microphone、WebRTC callsなどの失敗ステージ、HTTP status、server error code/messageを画面で確認します。
6. `End call`後の`Realtime handoff record`で、transcript、summary、evidence references、policy decision、next actionが画面に残り、server-side local JSONにも保存されることを見せます。外部送信・実電話接続・本番DB保存はblockedのままです。
7. `Fallback rehearsal`で、外部AIや通話連携がなくてもデモ進行できることを見せます。

## ローカル開発

Node.js 24系を使います。Windows PowerShellでは `npm.cmd` を使うと実行ポリシーに引っかかりにくいです。

```bash
npm install
npm run dev
```

`npm run dev` はTypeScriptをビルドし、`dist/assets/evidence-bundles.json`を生成してから、`dist/`を `http://127.0.0.1:4173/` で配信します。

配信はNode server runtimeで行います。静的なデモ画面に加えて、ヘルスチェック、Realtime client secret API、Realtime WebRTC calls server adapterを持ちます。

```text
GET /api/health
POST /api/realtime/client-secret
POST /api/realtime/calls
GET /api/realtime/handoffs
POST /api/realtime/handoffs
```

`OPENAI_API_KEY`が未設定の場合、`POST /api/realtime/client-secret`と`POST /api/realtime/calls`はOpenAIへ接続せず、`not-configured` / `local-rehearsal`のJSON fallbackを返します。`OPENAI_API_KEY`がserver-side環境変数として設定されている場合だけ、OpenAI Realtimeの`/v1/realtime/client_secrets`と`/v1/realtime/calls`へserver-side requestを行います。標準API keyやbrowser-supplied credentialは受け付けず、ブラウザbundleや静的ファイルへAPI keyを埋め込みません。

Realtime client secret発行を確認する場合は、Git管理外の`.env.local`などを使います。`.env.local`は`.gitignore`対象です。

```bash
docker compose --env-file .env.local up --build
```

```env
OPENAI_API_KEY=...
REALTIME_MODEL=gpt-realtime
```

Docker Composeは`.env.local`から`OPENAI_API_KEY`と`REALTIME_MODEL`をコンテナへ渡します。ブラウザは`GET /api/health`を読み、server token endpointが`configured` / `ready`かどうかを`Realtime boundary`へ反映します。ブラウザの`Start call`は選択中callの根拠候補、policy guard、会話プレビュー、Operator noteを短いRealtime instructionsへまとめ、server runtimeへ渡します。短命client secret取得後にだけマイク権限を要求し、ブラウザはSDP offerを同一originの`POST /api/realtime/calls`へ送ります。server runtimeは標準API keyをserver-sideだけで使い、OpenAI Realtimeの`/v1/realtime/calls`へmultipart requestを行い、SDP answerだけをブラウザへ返します。未設定時や接続失敗時は`local-rehearsal`のfallback表示に戻り、client secret、microphone、WebRTC callsなどの失敗ステージ、HTTP status、server error code/message、fetch TypeError detailを表示します。短時間の実機確認では、マイク許可後に接続状態または失敗診断だけ確認し、すぐ`End call`で切断します。

`End call`後のhandoff recordは`POST /api/realtime/handoffs`でserver-side local JSONへ保存され、画面読み込み時に`GET /api/realtime/handoffs?callId=...`から最新recordを復元します。Docker Composeでは`./data:/app/data`をmountし、既定の保存先は`/app/data/realtime-handoffs.json`です。このJSONはGit管理外です。外部送信、実電話接続、本番DB保存はまだ開始しません。

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
- Realtime browser call controls: `src/realtime-call-controls.ts`
- Realtime WebRTC calls server adapter: `src/realtime-calls-endpoint.ts`, `src/server-runtime.ts`
- Realtime runtime health reflection: `src/realtime-runtime-health.ts`
- Realtime call recording / handoff: `src/realtime-call-recording.ts`
- Realtime handoff local JSON API: `src/server-runtime.ts`
- Realtime session grounding: `src/realtime-session-context.ts`
- knowledge loader / search: `src/knowledge.ts`, `src/knowledge-search.ts`
- 根拠候補bridge: `src/evidence-bridge.ts`
- manifest生成: `scripts/generate-evidence-manifest.mjs`
- Node server runtime / 静的配信: `src/server-runtime.ts`, `scripts/serve-static.mjs`
- Docker起動: `Dockerfile`, `docker-compose.yml`
- テスト: `tests/*.test.ts`

## デモ知識ベース

`knowledge/`配下に、応対支援で参照する架空Markdownを置いています。

- 業務ルール: `knowledge/business_rules/`
- 架空顧客契約: `knowledge/customer_contracts/`
- デモシナリオ: `knowledge/scenarios/`

build時に `dist/assets/evidence-bundles.json` を生成し、ブラウザUIはそのmanifestを読み込んでAssistant handoffへ表示します。manifestは読み込み時に構造を検証し、壊れたJSONや不正なbundleはfallback表示へ戻します。

## 現在つないでいないもの

- 実電話接続
- 認証・本番DB
- 実顧客データ

これらはデモ境界として画面上にも明示しています。実電話接続や本番DBを追加する場合は、別タスクで安全なserver-side adapter、設定、ログ、fallbackを確認してから進めます。
