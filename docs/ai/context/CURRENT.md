# 現在のコンテキスト

最終更新: 2026-05-20

このファイルには現在確認済みの状態だけを書く。長い履歴ログとして使わない。

## 現在の入口

- リポジトリ運用の初期ファイルは`AGENTS.md`と`docs/ai/`配下にある。
- Webアプリの入口は`index.html`、ブラウザ実行時の接続先は`src/main.ts`。
- 開発時は`npm run dev`で`dist/`をローカル配信する。
- `npm run build`で`dist/index.html`、`dist/assets/*.js`、`dist/assets/evidence-bundles.json`を生成する。
- デモ担当者向けにはDocker起動を用意している。`docker compose up --build`でコンテナを起動し、`http://localhost:4173/`を開く。

## 現在のデモ状態

- 静的TypeScriptデモとして、Live queue、Assistant handoff、Call workspace、Realtime boundary、Executive demo brief、Call summary、Response draft、Conversation preview、Operator note、Policy guard、Evidence candidatesを表示する。
- `Call workspace`は選択中call id、Review mode、Phone connection not connected、架空顧客モック、サービス文脈、policy lane、next actionを1枚で確認するレビュー専用UI。
- `Realtime boundary`は`Realtime not configured`を表示し、contract-only token endpoint `POST /api/realtime/client-secret`、server-minted ephemeral client secret、ブラウザAPI key禁止、マイク未要求、外部音声送信blocked、実電話接続blockedを明示する。実Realtime sessionは開始しない。
- ブラウザ入口`src/main.ts`のruntime dependency graphはNode-only moduleを含めない。fallback rehearsalはbrowser-safeな`src/demo-scenario-cases.ts`を使い、knowledge loaderはブラウザ入口から到達しない。
- キュー項目の「開く」操作で、該当call idの根拠候補、サマリー、ドラフト、会話プレビュー、Operator note、policyが切り替わる。
- evidence manifestは読み込み時にbundle/result単位まで検証し、不正なmanifestはfallback表示へ戻す。
- CCNet向けデモは公開HP、サービス詳細、約款、重要事項説明に合わせた架空シナリオと架空顧客モックを使う。実在顧客データは使わない。
- 外部AI API、Realtime音声、実電話、DB保存、認証、本番接続は未実装。Operator noteはbrowser-onlyの未送信・未保存候補。

## 現在の主要コード

- `src/app.ts`: デモ状態、HTML描画、escape、Call workspace、Realtime boundary、Executive demo brief、Call summary、会話プレビュー、Operator note、Policy guard、Evidence candidates。
- `src/realtime-connection.ts`: Realtime未接続境界、contract-only token endpoint表示、公式Docs確認URL、ephemeral client secret前提、ブラウザAPI key禁止、session start disabledのguardrail。
- `src/realtime-token-endpoint.ts`: `POST /api/realtime/client-secret`のcontract-only境界、OpenAI側`/v1/realtime/client_secrets`へのserver-only前提、`value` / `expires_at` / `session` response field、secret非露出enablement。
- `src/main.ts`: manifest取得、キュー選択、Operator noteのブラウザ内メモリ保持、再描画。
- `src/knowledge.ts`: knowledge Markdown loader / chunk model。
- `src/knowledge-search.ts`: ローカル決定的keyword search。
- `src/evidence-bridge.ts`: キュー項目とknowledge検索結果の橋渡し。
- `src/evidence-manifest.ts` / `src/evidence-manifest-builder.ts` / `src/evidence-manifest-client.ts`: browser-safe evidence manifestとmanifest validation。
- `src/response-policy.ts`: 本人確認前の顧客別回答ブロック、上席確認必須、本人確認済みscoped draft許可の決定的判定。
- `src/call-summary.ts`: 問い合わせ要約、根拠参照、policy判断、Operator note状態、次アクションのローカル決定的生成。
- `src/ai-response-request.ts` / `src/ai-response-client.ts` / `src/ai-response-network-client.ts`: provider非依存payload、決定的stub、HTTP adapter境界。現時点では外部送信・永続保存を許可しない。
- `src/demo-scenario-regression.ts`: 代表シナリオをknowledge検索、Operator note、policy guard、request/client境界に通す回帰runner。
- `src/demo-scenario-cases.ts`: fallback rehearsalと回帰runnerで共有するbrowser-safeな代表シナリオ定義。
- `src/fallback-rehearsal.ts`: 外部通信なしで進行するfallback / rehearsal plan。

## 現在のテスト / CI

- ローカルテスト: `npm.cmd test`（POSIX/CIでは`npm test`）。
- ローカルビルド: `npm.cmd run build`（POSIX/CIでは`npm run build`）。
- Docker確認: `docker build -t ai-call-center-demo:codex-two-angle-review .`、`docker run -p 4174:4173 ai-call-center-demo:codex-two-angle-review`でHTTP 200を確認。
- `npm test`は90件。Call workspaceのreview-only表示、Realtime boundaryのnot configured表示、contract-only token endpoint、manifest validation、ブラウザAPI key禁止、マイク未要求、外部音声送信blocked、session start disabled、compiled browser-facing moduleのsecret非露出、ブラウザ入口dependency graphにNode-only moduleが混ざらないことも固定している。
- `.github/workflows/ci.yml`で`npm ci`、`npm test`、`npm run build`を実行する。

## 現在のワークフロー

- エージェントは`AGENTS.md`、このcontext pack、アクティブなタスク指示から開始する。
- GPT Proなどの外部計画ドラフトは`docs/ai/inbox/pro-instructions/`に置けるが、source of truthではない。実装前に`docs/ai/tasks/`配下の実行可能タスクへ変換する。
- GPT Proドラフトと実行済みTaskの対応、未実装項目、次の大きめPR候補は`docs/ai/specs/draft-task-reconciliation.md`にある。
- 安全監査メモは`docs/ai/security/`配下にある。Task 25の安全監査は`docs/ai/security/realtime-api-connection-boundary-safety-audit.md`、Task 26の安全監査は`docs/ai/security/realtime-token-endpoint-contract-safety-audit.md`。

## 次のハンドオフ

- 別枠ブランチ`codex/two-angle-review`でDocker化、デモ担当者向けREADME更新、manifest validation堅牢化を実施した。通常の次Task指定は変更していない。
- Task 26 `realtime-token-endpoint-contract`は実装済み。PRではcontract-only token endpoint、公式Docs確認URL、未接続UIへの表示、secret非露出guardrail tests、安全監査、テストカタログを確認する。
- 次の実装タスクはTask 27 `realtime-token-endpoint-disabled-adapter`。実OpenAI API keyや実network呼び出しを入れず、未設定時のserver-side adapter / fallback responseを決定的に扱う。
