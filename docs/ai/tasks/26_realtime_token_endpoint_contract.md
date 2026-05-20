# Task 26: realtime-token-endpoint-contract

## ゴール

Realtime API接続へ進む前に、ブラウザへ標準API keyを出さず、サーバー側でephemeral client secretを発行するための最小契約を追加する。実Realtime session開始、マイク取得、音声送信、tool callingはまだ有効化しない。

## 位置づけ

Task 25 `realtime-api-connection-boundary`の後続タスク。Task 25では未接続UIと境界モデルを追加した。Task 26では、その境界を満たすためのserver-side token endpoint contractを小さく定義する。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/26_realtime_token_endpoint_contract.md
```

## 必要な場合のみ読む

```text
package.json
src/app.ts
src/main.ts
src/realtime-connection.ts
src/ai-response-network-client.ts
tests/**
docs/ai/security/realtime-api-connection-boundary-safety-audit.md
docs/ai/tests/automated-test-catalog.md
```

## 読まない

```text
docs/ai/archive/**
docs/ai/reports/**
docs/ai/inbox/pro-instructions/**
古い計画
完了済みのタスク指示
```

## やること

- OpenAI Realtime APIとephemeral client secretの公式Docsを実装前に再確認し、PR本文の`Context usage`に記録する。
- サーバー側でclient secretを発行するためのcontractを定義する。実API key、実token、実network呼び出しはまだrepoに入れない。
- ブラウザbundleに標準API key、`.env`値、実client secretが入らないことをテストで固定する。
- token endpoint未設定時はTask 25の`Realtime not configured`表示とlocal fallbackを維持する。
- 必要なら`src/realtime-connection.ts`の境界状態を、token endpoint contractの有無に合わせて更新する。
- `CURRENT.md` / `ACTIVE_TASK.md`をhandoffに合わせて更新する。

## やらないこと

- 実Realtime sessionを開始しない。
- マイク許可を要求しない。
- 音声を外部へ送らない。
- tool callingを追加しない。
- 実API key、実token、DB、認証、本番電話接続を追加しない。

## テスト

```bash
npm test
npm run build
git diff --check
```

Windows PowerShellでは`npm.cmd test` / `npm.cmd run build`を使ってよい。

## レビュー観点

- OpenAI docs freshness
- Security / secrets / browser exposure
- API / contract
- Test / TypeScript
- Context hygiene

## 完了条件

- token endpoint contractが、標準API keyをサーバー側に閉じ込める前提で定義されている。
- ブラウザbundleへ実secretが入らないことをテストで確認している。
- `Realtime not configured`または同等の未接続fallbackが維持されている。
- `npm test`、`npm run build`、`git diff --check`が通っている。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Known limitations` / `Context handoff`が含まれている。
