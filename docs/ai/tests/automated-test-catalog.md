# 自動テストカタログ

最終更新: 2026-05-21

## 現在のコマンド

- Windows PowerShell: `npm.cmd test`
- Windows PowerShell: `npm.cmd run build`
- POSIX / CI: `npm test`
- POSIX / CI: `npm run build`

## CI

- `.github/workflows/ci.yml`で`npm ci`、`npm test`、`npm run build`を実行する。

## メモ

- `npm test`はTypeScriptを`tsconfig.test.json`でcompileし、`.tmp/test/tests/*.test.js`をNode.js test runnerで実行する。
- `npm run build`は`tsc -p tsconfig.json`、静的ファイルcopy、evidence manifest生成を実行する。
- Task 28 Server-side Realtime WebRTC calls adapter時点では、CCNet-fit scenarioと架空顧客モックを含むExecutive demo brief、Call workspace、Realtime boundary、Realtime runtime health reflection、Realtime call controls、Realtime failure diagnostics、Realtime transcript collector、Realtime handoff record、Realtime local JSON persistence、Realtime session grounding、server-side token endpoint adapter、server-side WebRTC calls adapter、disabled fallback、Node server runtime、Call summary、約款・重要事項説明ベースの業務ルール、fallback / rehearsal plan、代表デモシナリオ回帰、policy guard、AI response request/client/network境界、Operator note、knowledge/search/evidence、ブラウザ入口dependency graphを含む122件のテストが通る。
- `tests/app.test.ts`は、選択中call idのreview-only `Call workspace`が、Call summary、Conversation preview、Operator note、Policy guard、Evidence candidatesより前に表示され、電話接続・外部AI生成・送信済み・保存済みを示す文言がないことも固定する。
- `tests/app.test.ts`は、`Realtime boundary`が既定では`Realtime not configured`として表示され、contract-only token endpoint path、disabled adapterのnot-configured / local fallback、ブラウザAPI key、マイク取得、外部音声送信、実電話接続を許可しないdata guardrailも固定する。server runtime healthがconfigured / readyの場合は、UIがToken endpoint configuredとServer token endpoint configuration readyを表示することも固定する。
- `tests/app.test.ts`は、`Realtime call controls`が`Start call` / `End call`、connection status、mic permission stateを表示し、標準API keyや短命client secret値をHTMLへ露出しないことも固定する。fallback時には失敗ステージ、HTTP status、microphone stateをsecretなしで表示することも固定する。
- `tests/app.test.ts`は、`End call`後のRealtime handoff recordがtranscript、summary、evidence references、policy decision、next actionを画面に残し、保存済み・送信済みを示さず、transcript textをHTML escapeすることも固定する。
- `tests/realtime-call-controls.test.ts`は、idle状態、未設定token endpoint時のfallback復帰、server-side calls adapterへのWebRTC SDP offer送信、SDP answer、data channel `oai-events`、server event listener、End call時のtrack/data channel/peer connection cleanupを固定する。client secret失敗、microphone denial、Realtime WebRTC calls HTTP失敗時の診断も固定する。
- `tests/realtime-call-recording.test.ts`は、Realtime transcript event collector、`response.done` fallback抽出、browser-only handoff recordのpolicy/evidence/next action/guardrailを固定する。
- `tests/realtime-session-context.test.ts`は、選択中callのevidence candidates、policy guard、conversation preview、Operator noteが短いRealtime instructionsとtoken request bodyへ変換され、標準API keyや短命client secretを含まないことを固定する。
- `tests/realtime-connection.test.ts`は、Realtime接続境界がserver-minted ephemeral client secret前提で、contract-only token endpointとdisabled adapter fallbackを持つが、setup入力が揃っても現在のデモではsession startを閉じたままにすることを固定する。
- `tests/realtime-runtime-health.test.ts`は、`GET /api/health`のconfigured server healthをsecretなしで読み、Realtime boundary optionへ反映し、不正なhealth responseを無視することを固定する。
- `tests/realtime-token-endpoint.test.ts`は、`POST /api/realtime/client-secret`のserver-only contract、OpenAI側`/v1/realtime/client_secrets`、`value` / `expires_at` / `session` response field、token endpointだけが実装済みでRealtime session startなどは閉じていること、disabled adapterのdeterministic not-configured fallback、ブラウザ由来credential拒否、compiled browser-facing moduleのsecret非露出を固定する。
- `tests/server-runtime.test.ts`は、Node server runtimeの`GET /api/health`、`POST /api/realtime/client-secret`のdeterministic disabled fallback、`OPENAI_API_KEY`設定時のserver-side OpenAI client secret request、`POST /api/realtime/calls`のserver-side multipart request、Realtime instructionsのserver-side session config注入、`POST /api/realtime/handoffs` / `GET /api/realtime/handoffs`のlocal JSON save/load、credential-like value拒否、credential値の非反映、browser-supplied credential拒否、server-only runtime fileの静的配信拒否、静的配信継続、path traversal拒否を固定する。
- `tests/browser-entrypoint.test.ts`は、`src/main.ts`のcompiled dependency graphに`node:` importが混ざらず、ブラウザ入口からNode-only knowledge loaderへ到達しないことを固定する。
