# 現在のコンテキスト

最終更新: 2026-05-20

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
- `Realtime boundary`は`Realtime not configured`を表示し、server-side token endpoint adapter、未設定時の`not-configured` / local fallback、server-minted ephemeral client secret、ブラウザAPI key禁止、実電話接続blockedを示す。
- `Realtime call controls`は`Start call` / `End call`、connection status、mic permission stateを表示する。`Start call`は`POST /api/realtime/client-secret`で短命client secretを取得できた場合だけマイク権限とWebRTC SDP offerへ進み、失敗時はfallback rehearsalへ戻る。
- `Start call`は選択中callのevidence candidates、業務ルール、架空顧客モック、policy guard、会話プレビュー、Operator noteを短いRealtime instructionsへまとめ、server-side client secret session configへ渡す。根拠外の断定、本人確認前の顧客別断定、送信・保存・変更済みの主張は禁止する。
- `End call`後はdata channel `oai-events`で受け取ったRealtime transcript eventをhandoff recordへまとめ、summary、evidence references、policy decision、next actionと一緒に画面へ残す。recordは`POST /api/realtime/handoffs`でserver-side local JSONへ保存し、画面読み込み時に`GET /api/realtime/handoffs?callId=...`から最新recordを復元する。外部送信・実電話接続・本番DB保存は引き続きblocked。
- Node server runtime foundationとして、`src/server-runtime.ts`が静的配信、`GET /api/health`、`POST /api/realtime/client-secret`のdisabled/fallback JSONを扱う。
- `POST /api/realtime/client-secret`は、`OPENAI_API_KEY`未設定時にOpenAIへ接続せず、`not-configured` / `local-rehearsal`を返す。`OPENAI_API_KEY`がserver-side環境変数として設定されている場合だけ、OpenAI `/v1/realtime/client_secrets`へserver-side requestし、短命client secretを返す。Docker Composeは`.env.local`の`OPENAI_API_KEY` / `REALTIME_MODEL`をコンテナ環境へ渡す。
- OpenAI Realtime requestの`OpenAI-Safety-Identifier`は、上限64文字に収まるserver-derived hash値だけを送る。
- 標準API keyやbrowser-supplied credentialは受け付けず、server-only runtime fileは静的配信から除外している。`REALTIME_MODEL`未設定時の既定modelは`gpt-realtime`。
- ブラウザ入口`src/main.ts`のruntime dependency graphはNode-only moduleを含めない。fallback rehearsalはbrowser-safeな`src/demo-scenario-cases.ts`を使う。knowledge loaderはブラウザ入口から到達しない。
- evidence manifestは読み込み時にbundle/result単位まで検証し、不正なmanifestはfallback表示へ戻す。
- CCNet向けデモは公開HP、サービス詳細、約款、重要事項説明に合わせた架空シナリオと架空顧客モックを使う。実顧客データは使わない。
- 実電話、認証、本番DB、本番接続は未実装。Realtime音声はブラウザの`Start call`から短命client secretで接続するデモ境界のみ。Realtime handoff recordはserver-side local JSONへ保存できるが、実顧客データや外部送信は扱わない。Operator noteはbrowser-onlyの未送信値。

## 現在の主要コード

- `src/app.ts`: デモ状態、HTML描画、escape、Call workspace、Realtime boundary、Realtime call controls、Realtime handoff record、Executive demo brief、Call summary、会話プレビュー、Operator note、Policy guard、Evidence candidates。
- `src/server-runtime.ts`: Node server runtime、静的配信、`/api/health`、未設定時のdisabled Realtime client-secret fallback、設定時のserver-side OpenAI client secret request、`/api/realtime/handoffs` local JSON save/load、browser credential拒否、server-only runtime fileの静的配信拒否、path traversal拒否。
- `src/realtime-connection.ts`: Realtime未接続境界、contract-only token endpoint表示、公式Docs確認URL、ephemeral client secret前提、ブラウザAPI key禁止、session start disabledのguardrail。
- `src/realtime-call-controls.ts`: browser-safeな`Start call` / `End call`状態、OpenAI Realtime WebRTC calls endpoint、ephemeral client secret取得、mic permission、SDP offer/answer、data channel server event受信、fallback復帰、local track/peer connection cleanup。
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
- `npm test`は112件。Call workspace、Realtime boundary、Realtime call controls、Realtime transcript collector、Realtime handoff record、Realtime local JSON persistence、Realtime session grounding、server-side token endpoint adapter、disabled fallback、Node server runtime、OpenAI client secret request境界、WebRTC SDP offer/answer、fallback復帰、manifest validation、ブラウザAPI key禁止、compiled browser-facing moduleのsecret非露出、ブラウザ入口dependency graphにNode-only moduleが混ざらないことを固定している。
- `.github/workflows/ci.yml`で`npm ci`、`npm test`、`npm run build`を実行する。

## 現在のワークフロー

- エージェントは`AGENTS.md`、このcontext pack、アクティブなタスク指示から開始する。
- GPT Proなどの外部計画ドラフトは`docs/ai/inbox/pro-instructions/`に置けるが、source of truthではない。実装前に`docs/ai/tasks/`配下の実行可能タスクへ変換する。
- GPT Proドラフトと実行済みTaskの対応、未実装項目、次の大きめPR候補は`docs/ai/specs/draft-task-reconciliation.md`にある。
- 安全監査メモは`docs/ai/security/`配下にある。Task 25は`docs/ai/security/realtime-api-connection-boundary-safety-audit.md`、Task 26は`docs/ai/security/realtime-token-endpoint-contract-safety-audit.md`。

## 次のハンドオフ

- Task 28 `browser-realtime-voice-demo`はlocal JSON handoff persistenceまでPR化・merge済み。
- `OPENAI_API_KEY`をGit管理外の`.env.local`で用意したDocker環境では、`GET /api/health`が`configured` / `ready`を返し、`POST /api/realtime/client-secret`が`HTTP 200` / `status=ready` / `valueあり`を返すところまで確認済み。secret値は表示・保存しない。
- Codex in-app browserでは`Start call`後に`Realtime unavailable, using fallback rehearsal`へ戻り、実Realtime音声接続完了までは確認できていない。次は実マイクを許可できる通常ブラウザで、接続状態を見たらすぐ`End call`する短時間確認を行う。
- keyがない環境では実Realtime接続成功を主張しない。`OPENAI_API_KEY`なしのfallback表示、secret非露出、既存112件のテストだけを確認し、live音声確認はkey準備後または実ブラウザ確認時に回す。
- 実電話接続、認証、本番DB、外部送信は引き続き対象外。
