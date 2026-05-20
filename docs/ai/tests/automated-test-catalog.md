# 自動テストカタログ

最終更新: 2026-05-20

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
- Task 27時点では、CCNet-fit scenarioと架空顧客モックを含むExecutive demo brief、Call workspace、Realtime boundary、contract-only token endpoint、disabled adapter、Call summary、約款・重要事項説明ベースの業務ルール、fallback / rehearsal plan、代表デモシナリオ回帰、policy guard、AI response request/client/network境界、Operator note、knowledge/search/evidence、ブラウザ入口dependency graphを含む92件のテストが通る。
- `tests/app.test.ts`は、選択中call idのreview-only `Call workspace`が、Call summary、Conversation preview、Operator note、Policy guard、Evidence candidatesより前に表示され、電話接続・外部AI生成・送信済み・保存済みを示す文言がないことも固定する。
- `tests/app.test.ts`は、`Realtime boundary`が`Realtime not configured`として表示され、contract-only token endpoint path、disabled adapterのnot-configured / local fallback、ブラウザAPI key、マイク取得、外部音声送信、実電話接続を許可しないdata guardrailも固定する。
- `tests/realtime-connection.test.ts`は、Realtime接続境界がserver-minted ephemeral client secret前提で、contract-only token endpointとdisabled adapter fallbackを持つが、setup入力が揃っても現在のデモではsession startを閉じたままにすることを固定する。
- `tests/realtime-token-endpoint.test.ts`は、`POST /api/realtime/client-secret`のserver-only contract、OpenAI側`/v1/realtime/client_secrets`、`value` / `expires_at` / `session` response field、全enablement gate disabled、disabled adapterのdeterministic not-configured fallback、ブラウザ由来credential拒否、compiled browser-facing moduleのsecret非露出を固定する。
- `tests/browser-entrypoint.test.ts`は、`src/main.ts`のcompiled dependency graphに`node:` importが混ざらず、ブラウザ入口からNode-only knowledge loaderへ到達しないことを固定する。
