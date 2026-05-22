# 現在のコンテキスト

最終更新: 2026-05-22

このファイルには、現在確認済みの状態だけを書く。古い履歴ログとして使わない。

## 現在の入口

- リポジトリ運用の初期ファイルは`AGENTS.md`と`docs/ai/`配下にある。
- Webアプリの入口は`index.html`、ブラウザ実行時の接続点は`src/main.ts`。
- 開発時は`npm run dev`で`dist/`をローカル配信する。
- `npm run build`で`dist/index.html`、`dist/assets/*.js`、`dist/assets/evidence-bundles.json`を生成する。
- デモ担当者向けにはDocker起動を用意している。通常は`docker compose up --build`で起動し、Realtime client secret確認時はGit管理外の`.env.local`を用意して`docker compose --env-file .env.local up --build`で起動し、`http://localhost:4173/`を開く。

## 現在のデモ状態

- 静的TypeScriptデモとして、Live queue、Assistant handoff、Call workspace、Realtime boundary、Realtime call controls、Realtime handoff record、Executive demo brief、Call summary、Response draft、Conversation preview、Operator note、Policy guard、Evidence candidatesを表示する。
- `Call workspace`は選択中call id、review mode、phone connection not connected、架空顧客モック、サービス文脈、policy lane、next actionを1枠で確認するレビュー専用UI。
- `Realtime boundary`はserver-side token endpoint adapter、未設定時の`not-configured` / local fallback、server-minted ephemeral client secret、ブラウザAPI key禁止、実電話接続blockedを示す。ブラウザ起動後に`GET /api/health`を読み、server token endpointが`configured` / `ready`なら境界表示へ反映する。
- `Realtime call controls`は`Start call` / `End call`、connection status、mic permission stateを表示する。`Start call`は`POST /api/realtime/client-secret`でserver-side Realtime設定を確認できた場合だけマイク権限とWebRTC SDP offerへ進み、SDP offerは同一originの`POST /api/realtime/calls`へ送る。成功時はremote WebRTC audio trackを隠し`audio`要素へ接続し、data channel open時に`response.create`を送って最初の音声応答を促す。失敗時はfallback rehearsalへ戻る。fallback時はclient secret、microphone、peer connection、SDP offer、Realtime WebRTC calls、remote descriptionのどこで失敗したか、HTTP status、server error code/message、fetch TypeError detailをsecretなしで画面に残す。
- `Start call`は選択中callのevidence candidates、業務ルール、架空顧客モック、policy guard、会話プレビュー、Operator noteを短いRealtime instructionsへまとめ、server-side Realtime session configへ渡す。根拠外の断定、本人確認前の顧客別断定、送信・保存・変更済みの主張は禁止する。
- `End call`後はdata channel `oai-events`で受け取ったRealtime transcript eventをhandoff recordへまとめ、summary、evidence references、policy decision、next actionと一緒に画面へ残す。recordは`POST /api/realtime/handoffs`でserver-side local JSONへ保存し、画面読み込み時に`GET /api/realtime/handoffs?callId=...`から最新recordを復元する。外部送信・実電話接続・本番DB保存は引き続きblocked。
- Node server runtime foundationとして、`src/server-runtime.ts`が静的配信、`GET /api/health`、`POST /api/realtime/client-secret`、`POST /api/realtime/calls`のdisabled/fallback JSONを扱う。
- `POST /api/realtime/client-secret`は、`OPENAI_API_KEY`未設定時にOpenAIへ接続せず、`not-configured` / `local-rehearsal`を返す。`OPENAI_API_KEY`がserver-side環境変数として設定されている場合だけ、OpenAI `/v1/realtime/client_secrets`へserver-side requestし、短命client secretを返す。Realtime session configにはinstructions、`output_modalities: ["audio"]`、`audio.input.transcription.model: "gpt-4o-transcribe"`、`audio.input.turn_detection.type: "server_vad"`を含める。Docker Composeは`.env.local`の`OPENAI_API_KEY` / `REALTIME_MODEL`をコンテナ環境へ渡す。
- `POST /api/realtime/calls`は、ブラウザから受け取ったSDP offerと選択中callのRealtime instructions/audio session configをserver-side multipart requestにまとめ、OpenAI `/v1/realtime/calls`へ標準API keyで送る。ブラウザはOpenAI標準API keyもephemeral secretもこのcalls requestへ付けない。
- OpenAI Realtime requestの`OpenAI-Safety-Identifier`は、上限64文字に収まるserver-derived hash値だけを送る。
- 標準API keyやbrowser-supplied credentialは受け付けず、server-only runtime fileは静的配信から除外している。`REALTIME_MODEL`未設定時の既定modelは`gpt-realtime`。
- ブラウザ入口`src/main.ts`のruntime dependency graphはNode-only moduleを含めない。fallback rehearsalはbrowser-safeな`src/demo-scenario-cases.ts`を使う。knowledge loaderはブラウザ入口から到達しない。browser-side fetchは`window.fetch(...)` wrapper経由で呼び、`fetch`のunbound invocationを避ける。`src/realtime-runtime-health.ts`はbrowser-safeに`/api/health`を検証し、Realtime boundaryのconfigured表示へ変換する。
- evidence manifestは読み込み時にbundle/result単位まで検証し、不正なmanifestはfallback表示へ戻す。
- CCNet向けデモは公開HP、サービス詳細、約款、重要事項説明に合わせた架空シナリオと架空顧客モックを使う。実顧客データは使わない。
- CCNet向けデモには、既存ネット加入者がケーブルプラス電話を追加する`CALL-CC-04`と、新規ネット加入希望者へケーブルプラス電話を提案する`CALL-CC-05`を含める。どちらも挨拶、本人確認または提供エリア確認、商品選択肢提示、料金目安、断定禁止、担当者確認への引き継ぎを固定する。既契約者の電話申し込みでは、契約者の氏名、登録住所、登録電話番号、電話口の相手が契約者本人であることを確認し、本人以外からの電話申し込みは受け付けない。選択中のデモシナリオは、KPI帯の直下にシナリオ詳細、お客役が知っておく前提情報、本人確認シミュレーション用の架空照合値、デモ開始後に期待される話の流れとして表示する。
- 実電話、認証、本番DB、本番接続は未実装。Realtime音声はブラウザの`Start call`から短命client secretで接続するデモ境界のみ。Realtime handoff recordはserver-side local JSONへ保存できるが、実顧客データや外部送信は扱わない。Operator noteはbrowser-onlyの未送信値。

## 現在の主要コード

- `src/app.ts`: デモ状態、HTML描画、escape、Call workspace、Realtime boundary、Realtime call controls、Realtime handoff record、Executive demo brief、Call summary、会話プレビュー、Operator note、Policy guard、Evidence candidates。
- `src/server-runtime.ts`: Node server runtime、静的配信、`/api/health`、未設定時のdisabled Realtime client-secret / calls fallback、設定時のserver-side OpenAI client secret request、server-side Realtime WebRTC calls request、`/api/realtime/handoffs` local JSON save/load、browser credential拒否、server-only runtime fileの静的配信拒否、path traversal拒否。
- `src/realtime-connection.ts`: Realtime未接続境界、contract-only token endpoint表示、公式Docs確認URL、ephemeral client secret前提、ブラウザAPI key禁止、session start disabledのguardrail。
- `src/realtime-call-controls.ts`: browser-safeな`Start call` / `End call`状態、local Realtime WebRTC calls adapter、ephemeral client secret設定確認、mic permission、SDP offer/answer、remote audio stream hook、data channel open時の`response.create`、data channel server event受信、fallback復帰、失敗ステージ診断、local track/peer connection cleanup。
- `src/realtime-calls-endpoint.ts`: browser-facing `/api/realtime/calls` pathとOpenAI upstream `/v1/realtime/calls` path。
- `src/realtime-runtime-health.ts`: browser-safeな`GET /api/health` loaderと、server token endpoint readinessをRealtime boundary optionsへ変換するhelper。
- `src/realtime-call-recording.ts`: Realtime transcript event collector、handoff record、summary/evidence/policy/next actionの記録境界、local JSON API client helperとruntime validation。
- `src/realtime-session-context.ts`: 選択中callのevidence、policy guard、conversation preview、Operator noteをRealtime session instructionsとtoken request bodyへ変換するbrowser-safe contract。
- `src/realtime-token-endpoint.ts`: `POST /api/realtime/client-secret`のserver-adapter境界、OpenAI側`/v1/realtime/client_secrets`へのserver-only前提、`value` / `expires_at` / `session` response field、secret非露出enablement、未設定時のdisabled adapter / local fallback response。
- `src/main.ts`: manifest取得、キュー選択、Operator noteのブラウザ内メモリ保持、Realtime call controlsのクリック処理、選択中callのRealtime grounding request生成、Realtime handoff record生成、local JSON save/load、再描画。
- `src/knowledge.ts`: knowledge Markdown loader / chunk model。
- `src/knowledge-search.ts`: ローカル決定的keyword search。
- `src/evidence-bridge.ts`: キュー項目とknowledge検索結果の橋渡し。
- `src/evidence-manifest.ts` / `src/evidence-manifest-builder.ts` / `src/evidence-manifest-client.ts`: browser-safe evidence manifestとmanifest validation。
- `src/response-policy.ts`: 本人確認前の顧客別回答ブロック、上席確認必要、本人確認済みscoped draft許可の決定的判断。
- `src/call-summary.ts`: 問い合わせ要約、根拠参照、policy判断、Operator note状態、次アクションのローカル決定的生成。
- `src/ai-response-request.ts` / `src/ai-response-client.ts` / `src/ai-response-network-client.ts`: provider非依存payload、決定的stub、HTTP adapter境界。現時点では外部送信・永続保存を許可しない。
- `src/demo-scenario-regression.ts`: 代表シナリオをknowledge検索、Operator note、policy guard、request/client境界に通す回帰runner。
- `src/demo-scenario-cases.ts`: fallback rehearsalと回帰runnerで共有するbrowser-safeな代表シナリオ定義。
- `src/fallback-rehearsal.ts`: 外部送信なしで進行するfallback / rehearsal plan。

## 現在のテスト / CI

- ローカルテスト: `npm.cmd test`。POSIX/CIでは`npm test`。
- ローカルビルド: `npm.cmd run build`。POSIX/CIでは`npm run build`。
- Docker確認: `docker compose up --build`後、`http://localhost:4173/`と`http://localhost:4173/api/health`を確認する。
- `npm test`は126件。Call workspace、Realtime boundary、Realtime runtime health reflection、Realtime call controls、Realtime failure diagnostics、Realtime transcript collector、Realtime handoff record、Realtime local JSON persistence、Realtime session grounding、server-side token endpoint adapter、server-side Realtime WebRTC calls adapter、disabled fallback、Node server runtime、OpenAI client secret request境界、WebRTC SDP offer/answer、server error code/message表示、fetch TypeError detail、remote audio stream hook、data channel open時の`response.create`、`response.output_audio_transcript.done`と`response.done`の同一transcript重複排除、保存済みhandoff record読み込み時のtranscript重複正規化、fallback復帰、manifest validation、ブラウザAPI key禁止、compiled browser-facing moduleのsecret非露出、ブラウザ入口dependency graphにNode-only moduleが混ざらないこと、browser entrypointが`window.fetch(...)` wrapperを使うことを固定している。
- `.github/workflows/ci.yml`で`npm ci`、`npm test`、`npm run build`を実行する。

## 現在のワークフロー

- エージェントは`AGENTS.md`、このcontext pack、アクティブなタスク指示から開始する。
- GPT Proなどの外部計画ドラフトは`docs/ai/inbox/pro-instructions/`に置けるが、source of truthではない。実装前に`docs/ai/tasks/`配下の実行可能タスクへ変換する。
- GPT Proドラフトと実行済みTaskの対応、未実装項目、次の大きめPR候補は`docs/ai/specs/draft-task-reconciliation.md`にある。
- 安全監査メモは`docs/ai/security/`配下にある。Task 25は`docs/ai/security/realtime-api-connection-boundary-safety-audit.md`、Task 26は`docs/ai/security/realtime-token-endpoint-contract-safety-audit.md`。

## 次のハンドオフ

- Task 28 `browser-realtime-voice-demo`はlocal JSON handoff persistenceまでPR化・merge済み。
- 現在の小PRは、CCNet公開情報に合わせたケーブルプラス電話シナリオ追加。`knowledge/business_rules/005_ccnet_public_service_guidance.md`、`knowledge/customer_contracts/customer_ccnet_2004.md`、`knowledge/customer_contracts/customer_ccnet_2005.md`、`knowledge/scenarios/scenario_06_ccnet_cableplus_existing_net_add.md`、`knowledge/scenarios/scenario_07_ccnet_new_internet_cableplus_recommendation.md`、`src/app.ts`、`src/demo-scenario-cases.ts`、関連テストを確認する。
- `OPENAI_API_KEY`をGit管理外の`.env.local`で用意したDocker環境では、`GET /api/health`が`configured` / `ready`を返し、`POST /api/realtime/client-secret`が`HTTP 200` / `status=ready` / `valueあり`を返すところまで確認済み。secret値は表示・保存しない。
- ユーザー実機ブラウザでは、マイク許可後に`Stage: realtime-calls`でfallbackへ戻り、同一originの`/api/realtime/calls`到達までは確認できた。その後、browser entrypointでunbound `fetch`が`TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation.`になることも確認したため、`window.fetch(...)` wrapper経由に修正済み。
- 修正後のユーザー実機ブラウザでは、`Realtime call connected`まで到達し、ユーザーが`End call`した。Docker local JSONには`CALL-CC-03`の`status=recorded` handoff recordが保存され、assistant transcript delta、summary、evidence references、policy decision、next action、guardrailsが残った。`GET /api/realtime/handoffs?callId=CALL-CC-03`は最新recordを返し、ブラウザreload後も`Realtime handoff record`が復元表示された。
- Realtime接続失敗時は、fallback時の失敗ステージ、HTTP status、server error code/message、fetch TypeError detail、microphone stateを画面で読める。画面の`HTTP status`、`Error code`、`Message`を見れば、local adapterの502なのか、上流OpenAIの400なのか、fetch/network failureなのかを切り分けられる。
- keyがない環境では実Realtime接続成功を主張しない。`OPENAI_API_KEY`なしのfallback表示、secret非露出、既存126件のテストだけを確認する。keyあり環境では短時間の実機ブラウザ確認で`Realtime call connected`、AI音声応答、`End call`、handoff復元まで確認済み。`response.output_audio_transcript.done`と`response.done`が同一発話を送る場合は、handoff transcriptへ二重表示しないようcollectorと読み込み時正規化で隣接重複を排除する。
- 実電話接続、認証、本番DB、外部送信は引き続き対象外。
# 更新メモ (2026-05-22)

- PR #47 follow-up: デモシナリオ詳細は左のシナリオ一覧の上ではなく、選択後に中央ペイン先頭へ表示する。
- 左のデモシナリオ一覧は「開く」ボタンを廃止し、カード全体をクリックまたはEnter/Spaceで選択する。`data-queue-open` / `aria-pressed` / `aria-current`は維持する。
- `CALL-CC-04`のお客役前提情報には、本人確認で答える情報として契約者氏名、登録住所、登録電話番号、契約者本人からの架電、照合補助を独立ブロックで表示する。
- 契約者氏名と登録住所には、お客役が読み上げやすいようにふりがなを併記する。
- 検証済み: `npm.cmd test` 129件成功、`npm.cmd run build`成功、`git diff --check`成功、`docker compose --env-file .env.local up --build -d`成功、`http://localhost:4173/`で`CALL-CC-04`カード選択と中央ペインの本人確認ブロック表示を確認。
