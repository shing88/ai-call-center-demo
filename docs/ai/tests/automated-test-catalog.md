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
- Task 22時点では、CCNet-fit scenarioと架空顧客モックを含むExecutive demo briefの説明順、約款・重要事項説明ベースの業務ルール、fallback / rehearsal plan、代表デモシナリオ回帰、policy guard、AI response request/client/network境界、Operator note、knowledge/search/evidenceを含む75件のテストが通る。
