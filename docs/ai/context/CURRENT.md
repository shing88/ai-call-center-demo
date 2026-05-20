# 現在のコンテキスト

最終更新: 2026-05-20

このファイルには現在確認済みの状態だけを書く。長い履歴ログとして使わない。

## 現在の入口

- リポジトリ運用の初期ファイルは`AGENTS.md`と`docs/ai/`配下にある。
- Webアプリの入口は`index.html`、ブラウザ実行時の接続先は`src/main.ts`。
- 開発時は`npm run dev`で`dist/`をローカル配信する。
- `npm run build`で`dist/index.html`、`dist/assets/*.js`、`dist/assets/evidence-bundles.json`を生成する。

## 現在のデモ状態

- 静的TypeScriptデモとして、Live queue、Assistant handoff、Call workspace、Executive demo brief、Call summary、Response draft、Conversation preview、Operator note、Policy guard、Evidence candidatesを表示する。
- `Call workspace`は選択中call id、Review mode、Phone connection not connected、架空顧客モック、サービス文脈、policy lane、next actionを1枚で確認するレビュー専用UI。
- キュー項目の「開く」操作で、該当call idの根拠候補、サマリー、ドラフト、会話プレビュー、Operator note、policyが切り替わる。
- CCNet向けデモは公開HP、サービス詳細、約款、重要事項説明に合わせた架空シナリオと架空顧客モックを使う。実在顧客データは使わない。
- 外部AI API、Realtime音声、実電話、DB保存、認証、本番接続は未実装。Operator noteはbrowser-onlyの未送信・未保存候補。

## 現在の主要コード

- `src/app.ts`: デモ状態、HTML描画、escape、Call workspace、Executive demo brief、Call summary、会話プレビュー、Operator note、Policy guard、Evidence candidates。
- `src/main.ts`: manifest取得、キュー選択、Operator noteのブラウザ内メモリ保持、再描画。
- `src/knowledge.ts`: knowledge Markdown loader / chunk model。
- `src/knowledge-search.ts`: ローカル決定的keyword search。
- `src/evidence-bridge.ts`: キュー項目とknowledge検索結果の橋渡し。
- `src/evidence-manifest.ts` / `src/evidence-manifest-builder.ts` / `src/evidence-manifest-client.ts`: browser-safe evidence manifest。
- `src/response-policy.ts`: 本人確認前の顧客別回答ブロック、上席確認必須、本人確認済みscoped draft許可の決定的判定。
- `src/call-summary.ts`: 問い合わせ要約、根拠参照、policy判断、Operator note状態、次アクションのローカル決定的生成。
- `src/ai-response-request.ts` / `src/ai-response-client.ts` / `src/ai-response-network-client.ts`: provider非依存payload、決定的stub、HTTP adapter境界。現時点では外部送信・永続保存を許可しない。
- `src/demo-scenario-regression.ts`: 代表シナリオをknowledge検索、Operator note、policy guard、request/client境界に通す回帰runner。
- `src/fallback-rehearsal.ts`: 外部通信なしで進行するfallback / rehearsal plan。

## 現在のテスト / CI

- ローカルテスト: `npm.cmd test`（POSIX/CIでは`npm test`）。
- ローカルビルド: `npm.cmd run build`（POSIX/CIでは`npm run build`）。
- `npm test`は82件。Call workspaceのreview-only表示、選択中call id、主要パネル順、送信済み/保存済み/外部AI生成済みを示さないことも固定している。
- `.github/workflows/ci.yml`で`npm ci`、`npm test`、`npm run build`を実行する。

## 現在のワークフロー

- エージェントは`AGENTS.md`、このcontext pack、アクティブなタスク指示から開始する。
- GPT Proなどの外部計画ドラフトは`docs/ai/inbox/pro-instructions/`に置けるが、source of truthではない。実装前に`docs/ai/tasks/`配下の実行可能タスクへ変換する。
- GPT Proドラフトと実行済みTaskの対応、未実装項目、次の大きめPR候補は`docs/ai/specs/draft-task-reconciliation.md`にある。
- 安全監査メモは`docs/ai/security/`配下にある。Task 24のUI安全監査は`docs/ai/security/browser-call-style-ui-safety-audit.md`。

## 次のハンドオフ

- Task 24 `browser-call-style-ui`は実装済み。PRではレビュー専用Call workspace、レスポンシブCSS、表示順テスト、デモ台本、テストカタログ、安全監査を確認する。
- 次の実装タスクはTask 25 `realtime-api-connection-boundary`。Realtimeへ進む前に公式ドキュメント確認と、API key・ephemeral token・マイク許可・外部送信境界の安全設計を必須にする。
