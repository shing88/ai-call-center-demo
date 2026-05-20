# Task 27: realtime-token-endpoint-disabled-adapter

## ゴール

Task 26で定義したRealtime token endpoint contractを使い、実OpenAI API keyや実network呼び出しを入れずに、server-side token endpointのdisabled adapterを追加する。未設定時のvalidation、fallback response、ログにsecretを出さない前提を固定し、Realtime session開始、マイク取得、音声送信、tool callingはまだ有効化しない。

## 位置づけ

Task 26 `realtime-token-endpoint-contract`の後続タスク。Task 26では`POST /api/realtime/client-secret`のcontract-only境界を追加した。Task 27では、将来のserver実装に進む前に、未設定時のserver-side adapter結果をローカルで決定的に扱えるようにする。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/27_realtime_token_endpoint_disabled_adapter.md
```

## 必要な場合のみ読む

```text
package.json
src/app.ts
src/realtime-connection.ts
src/realtime-token-endpoint.ts
tests/**
docs/ai/security/realtime-token-endpoint-contract-safety-audit.md
docs/ai/specs/draft-task-reconciliation.md
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

- OpenAI Realtime APIとclient secretの公式Docsを実装前に再確認し、PR本文の`Context usage`に記録する。
- contractを入力にしたdisabled adapterを追加する。未設定時は決定的な`not-configured` / fallback responseを返し、実OpenAI requestは送らない。
- browserから標準API key、Bearer token、`.env`値、実client secretを渡せないことをテストで固定する。
- adapter結果を必要な範囲で`Realtime boundary`へ反映し、`Realtime not configured`とlocal fallbackを維持する。
- `CURRENT.md` / `ACTIVE_TASK.md`をhandoffに合わせて更新する。

## やらないこと

- 実OpenAI API keyを読み込まない。
- 実OpenAI APIへnetwork requestしない。
- 実Realtime sessionを開始しない。
- マイク許可を要求しない。
- 音声を外部へ送らない。
- tool calling、DB、認証、本番電話接続を追加しない。

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
- API / adapter contract
- Fallback behavior
- Test / TypeScript
- Context hygiene

## 完了条件

- disabled adapterが、実secretや実networkなしで未設定状態を決定的に返す。
- browser bundleへ標準API key、`.env`値、実client secretが入らないことをテストで確認している。
- `Realtime not configured`または同等の未接続fallbackが維持されている。
- `npm test`、`npm run build`、`git diff --check`が通っている。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Known limitations` / `Context handoff`が含まれている。
