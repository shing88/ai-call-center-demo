# 現在のコンテキスト

最終更新: 2026-05-20

このファイルには、現在確認済みの状態だけを書く。古い履歴ログとして使わない。

## 現在の入口

- リポジトリ運用の初期ファイルは`AGENTS.md`と`docs/ai/`配下にある。
- Webアプリの入口は`index.html`、ブラウザ実行時の接続点は`src/main.ts`。
- 開発時は`npm run dev`で`dist/`をローカル配信する。
- `npm run build`で`dist/index.html`、`dist/assets/*.js`、`dist/assets/evidence-bundles.json`を生成する。
- デモ担当者向けにはDocker起動を用意している。`docker compose up --build`でコンテナを起動し、`http://localhost:4173/`を開く。

## 現在のデモ状態

- 静的TypeScriptデモとして、Live queue、Assistant handoff、Call workspace、Realtime boundary、Executive demo brief、Call summary、Response draft、Conversation preview、Operator note、Policy guard、Evidence candidatesを表示する。
- `Call workspace`は選択中call id、review mode、phone connection not connected、架空顧客モック、サービス文脈、policy lane、next actionを1枠で確認するレビュー専用UI。
- `Realtime boundary`は`Realtime not configured`を表示し、contract-only token endpoint、disabled adapterの`not-configured` / local fallback、server-minted ephemeral client secret、ブラウザAPI key禁止、マイク未要求、外部音声送信blocked、実電話接続blockedを示す。実Realtime sessionは開始しない。
- Node server runtime foundationとして、`src/server-runtime.ts`が静的配信、`GET /api/health`、`POST /api/realtime/client-secret`のdisabled/fallback JSONを扱う。
- `POST /api/realtime/client-secret`はまだ実OpenAI接続を開始しない。標準API key、browser-supplied credential、ephemeral secret値を転送・保存・応答反映せず、`not-configured` / `local-rehearsal`を返す。
- ブラウザ入口`src/main.ts`のruntime dependency graphはNode-only moduleを含めない。fallback rehearsalはbrowser-safeな`src/demo-scenario-cases.ts`を使う。knowledge loaderはブラウザ入口から到達しない。
- evidence manifestは読み込み時にbundle/result単位まで検証し、不正なmanifestはfallback表示へ戻す。
- CCNet向けデモは公開HP、サービス詳細、約款、重要事項説明に合わせた架空シナリオと架空顧客モックを使う。実顧客データは使わない。
- 外部AI API、Realtime音声、実電話、DB保存、認証、本番接続は未実装。Operator noteはbrowser-onlyの未送信・未保存値。

## 現在の主要コード

- `src/app.ts`: デモ状態、HTML描画、escape、Call workspace、Realtime boundary、Executive demo brief、Call summary、会話プレビュー、Operator note、Policy guard、Evidence candidates。
- `src/server-runtime.ts`: Node server runtime、静的配信、`/api/health`、disabled Realtime client-secret fallback、path traversal拒否。
- `src/realtime-connection.ts`: Realtime未接続境界、contract-only token endpoint表示、公式Docs確認URL、ephemeral client secret前提、ブラウザAPI key禁止、session start disabledのguardrail。
- `src/realtime-token-endpoint.ts`: `POST /api/realtime/client-secret`のcontract-only境界、OpenAI側`/v1/realtime/client_secrets`へのserver-only前提、`value` / `expires_at` / `session` response field、secret非露出enablement、未設定時のdisabled adapter / local fallback response。
- `src/main.ts`: manifest取得、キュー選択、Operator noteのブラウザ内メモリ保持、再描画。
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
- `npm test`は95件。Call workspace、Realtime boundary、contract-only token endpoint、disabled adapter、Node server runtime、manifest validation、ブラウザAPI key禁止、マイク未要求、外部音声送信blocked、session start disabled、compiled browser-facing moduleのsecret非露出、ブラウザ入口dependency graphにNode-only moduleが混ざらないことを固定している。
- `.github/workflows/ci.yml`で`npm ci`、`npm test`、`npm run build`を実行する。

## 現在のワークフロー

- エージェントは`AGENTS.md`、このcontext pack、アクティブなタスク指示から開始する。
- GPT Proなどの外部計画ドラフトは`docs/ai/inbox/pro-instructions/`に置けるが、source of truthではない。実装前に`docs/ai/tasks/`配下の実行可能タスクへ変換する。
- GPT Proドラフトと実行済みTaskの対応、未実装項目、次の大きめPR候補は`docs/ai/specs/draft-task-reconciliation.md`にある。
- 安全監査メモは`docs/ai/security/`配下にある。Task 25は`docs/ai/security/realtime-api-connection-boundary-safety-audit.md`、Task 26は`docs/ai/security/realtime-token-endpoint-contract-safety-audit.md`。

## 次のハンドオフ

- Task 28 `browser-realtime-voice-demo`の1段階目、Server runtime foundationをPR化する。
- 次のTask 28 PR段階はRealtime client secret implementation。`OPENAI_API_KEY`設定時だけserver-sideからOpenAI `client_secrets`へ進み、未設定時はdeterministicな`not-configured` fallbackを維持する。
- 実Realtime音声、ブラウザcall controls、業務ルールgrounding、transcript/summary記録は後続PRに分割する。
