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
