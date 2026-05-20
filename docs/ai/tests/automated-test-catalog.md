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
- Task 25時点では、CCNet-fit scenarioと架空顧客モックを含むExecutive demo brief、Call workspace、Realtime boundary、Call summary、約款・重要事項説明ベースの業務ルール、fallback / rehearsal plan、代表デモシナリオ回帰、policy guard、AI response request/client/network境界、Operator note、knowledge/search/evidenceを含む85件のテストが通る。
- `tests/app.test.ts`は、選択中call idのreview-only `Call workspace`が、Call summary、Conversation preview、Operator note、Policy guard、Evidence candidatesより前に表示され、電話接続・外部AI生成・送信済み・保存済みを示す文言がないことも固定する。
- `tests/app.test.ts`は、`Realtime boundary`が`Realtime not configured`として表示され、ブラウザAPI key、マイク取得、外部音声送信、実電話接続を許可しないdata guardrailも固定する。
- `tests/realtime-connection.test.ts`は、Realtime接続境界がserver-minted ephemeral client secret前提で、setup入力が揃っても現在のデモではsession startを閉じたままにすることを固定する。
