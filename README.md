# AIコールセンター デモ

AIコールセンターの応対支援デモです。ブラウザで開くと、架空のデモシナリオ、上部KPI、シナリオ詳細、お客役が知っておく前提情報、根拠候補、応答ドラフト、会話プレビュー、オペレーターメモ、ポリシー判定、リアルタイム接続境界、リアルタイム通話操作、リアルタイム通話引き継ぎ記録、フォールバック演習を1画面で確認できます。

このリポジトリはデモ用です。Realtime音声はブラウザの`通話を開始`から短命client secretで接続するデモ境界だけを扱い、実電話、認証、本番DB、実顧客データには接続していません。デモ中に表示される顧客・契約・問い合わせ情報はすべて架空データです。`終了`後のhandoff recordだけ、デモ継続用にserver-side local JSONへ保存できます。

## 現在のデモの要点

- 画面は日本語ラベルの3カラム構成です。左にデモシナリオ一覧、中央に選択シナリオの詳細と通話ワークスペース、右に根拠候補とポリシー判定を表示します。
- デモシナリオはカード全体をクリック、またはキーボードのEnter/Spaceで選択します。選択中カードは見た目と`aria-current` / `aria-pressed`で分かるようにしています。
- 選択中シナリオの詳細、お客役が知っておく前提情報、本人確認シミュレーション用の架空照合値、デモ開始後に期待される話の流れは中央ペイン先頭に表示します。
- CCNet向けシナリオでは、AIはCCNetコールセンターのAIオペレーターとして名乗り、まず用件の大枠を聞き、お客様が話した内容だけを復唱し、個別確認の前に本人確認へ進みます。
- シナリオ、架空顧客プロファイル、本人確認用の照合値は内部コンテキストです。AIが本人確認前から氏名、住所、登録電話番号、契約中サービス、相談詳細を知っているかのように話すことは禁止しています。
- 既契約者の電話申し込みでは、契約者の氏名、登録住所、登録電話番号、電話口の相手が契約者本人であることを確認します。本人以外からの電話申し込みは受け付けず、一般案内に留めます。
- Realtime接続はserver-side token endpointで短命client secretを発行できる場合だけ開始します。ブラウザに標準OpenAI API keyを渡しません。
- `終了`後のtranscript、summary、evidence references、policy decision、next actionは画面に残り、server-side local JSONへ保存できます。

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

1. `デモシナリオ`で架空の問い合わせが並んでいることを見せます。
2. シナリオカードを選択し、中央ペインのシナリオ詳細、お客役の前提情報、本人確認で答える情報、期待される話の流れを確認します。
3. `根拠候補`で、回答がMarkdown knowledge base由来の候補に基づくことを説明します。
4. `ポリシー判定`で、本人確認前や上席確認が必要なケースでは確定回答を避けるデモ境界を説明します。
5. `リアルタイム接続境界`で、標準API keyはブラウザに出さず、server-side endpointだけでOpenAIへ接続することを説明します。`通話を開始`はserver token endpointが設定済みのときだけWebRTC接続へ進み、ブラウザはSDP offerをローカルの`/api/realtime/calls`へ渡します。未設定や失敗時はフォールバック演習に戻り、client secret、microphone、WebRTC callsなどの失敗ステージ、HTTP status、server error code/messageを画面で確認します。
6. 通話デモでは、AIが「はい、CCNetコールセンターのAIオペレーターです。本日はどのようなご用件でしょうか。」の流れで始めることを確認します。AIがシナリオ内の前提情報を先回りして話していないかも確認します。
7. `終了`後の`リアルタイム通話 引き継ぎ記録`で、transcript、summary、evidence references、policy decision、next actionが画面に残り、server-side local JSONにも保存されることを見せます。外部送信・実電話接続・本番DB保存はblockedのままです。
8. `フォールバック演習`で、外部AIや通話連携がなくてもデモ進行できることを見せます。

## AIロール定義の場所

AIのロール定義は1ファイルだけで完結しているわけではなく、用途ごとに分かれています。

- `knowledge/business_rules/006_ccnet_call_center_operator_role.md`: CCNetコールセンター応対ロールの共通ルールです。名乗り、用件聞き取り、聞いた内容だけの復唱、本人確認、詳細確認、内部シナリオ情報の事前開示禁止をここで定義します。
- `src/realtime-session-context.ts`: ブラウザの`通話を開始`時に、選択中シナリオ、根拠候補、ポリシー判定、会話プレビュー、オペレーターメモをRealtime session instructionsへ変換します。実際にRealtimeモデルへ渡る`# Role and Objective`とガードレールはここで組み立てます。
- `knowledge/business_rules/005_ccnet_public_service_guidance.md`: CCNet公開情報ベースのサービス案内、ケーブルプラス電話、ケーブルライン、本人確認後に扱う項目、断定禁止事項を定義します。
- `knowledge/scenarios/scenario_05_ccnet_wifi_safety_handoff.md`、`knowledge/scenarios/scenario_06_ccnet_cableplus_existing_net_add.md`、`knowledge/scenarios/scenario_07_ccnet_new_internet_cableplus_recommendation.md`: デモシナリオごとの応対ステップ、根拠候補、期待結果を定義します。
- `src/app.ts`: 画面に出すシナリオ詳細と「デモ開始後に期待される話の流れ」を組み立てます。これは表示用の期待フローで、Realtimeモデルに渡すロール本文の本体ではありません。
- `src/response-policy.ts`: 本人確認前の顧客別回答ブロック、上席確認、本人確認済み範囲の下書き可否を決定的に判定します。

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

Docker Composeは`.env.local`から`OPENAI_API_KEY`と`REALTIME_MODEL`をコンテナへ渡します。ブラウザは`GET /api/health`を読み、server token endpointが`configured` / `ready`かどうかを`リアルタイム接続境界`へ反映します。ブラウザの`通話を開始`は選択中callの根拠候補、ポリシー判定、会話プレビュー、オペレーターメモを短いRealtime instructionsへまとめ、server runtimeへ渡します。短命client secret取得後にだけマイク権限を要求し、ブラウザはSDP offerを同一originの`POST /api/realtime/calls`へ送ります。server runtimeは標準API keyをserver-sideだけで使い、OpenAI Realtimeの`/v1/realtime/calls`へmultipart requestを行い、SDP answerだけをブラウザへ返します。ブラウザはremote WebRTC audio trackをhidden audio要素へ接続し、data channel open時に`response.create`を送って最初の音声応答を促します。session configにはaudio output、input transcription、server VADを明示します。未設定時や接続失敗時は`local-rehearsal`のfallback表示に戻り、client secret、microphone、WebRTC callsなどの失敗ステージ、HTTP status、server error code/message、fetch TypeError detailを表示します。短時間の実機確認では、マイク許可後にAI応答または失敗診断だけ確認し、すぐ`終了`で切断します。

`終了`後のhandoff recordは`POST /api/realtime/handoffs`でserver-side local JSONへ保存され、画面読み込み時に`GET /api/realtime/handoffs?callId=...`から最新recordを復元します。Docker Composeでは`./data:/app/data`をmountし、既定の保存先は`/app/data/realtime-handoffs.json`です。このJSONはGit管理外です。外部送信、実電話接続、本番DB保存はまだ開始しません。

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
- Realtime session grounding / Realtimeモデルへ渡すロール指示: `src/realtime-session-context.ts`
- CCNetコールセンター応対ロール: `knowledge/business_rules/006_ccnet_call_center_operator_role.md`
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

CCNetコールセンターのAIロールは`knowledge/business_rules/006_ccnet_call_center_operator_role.md`を共通ルールとして持ち、`src/realtime-session-context.ts`がそれと選択中シナリオの文脈をRealtime instructionsへ変換します。シナリオや架空顧客プロファイルはデモ進行のための内部文脈であり、AIがお客様に先回りして開示するための情報ではありません。

build時に `dist/assets/evidence-bundles.json` を生成し、ブラウザUIはそのmanifestを読み込んで根拠候補やAIサポート表示へ使います。manifestは読み込み時に構造を検証し、壊れたJSONや不正なbundleはfallback表示へ戻します。

## 現在つないでいないもの

- 実電話接続
- 認証・本番DB
- 実顧客データ

これらはデモ境界として画面上にも明示しています。実電話接続や本番DBを追加する場合は、別タスクで安全なserver-side adapter、設定、ログ、fallbackを確認してから進めます。
