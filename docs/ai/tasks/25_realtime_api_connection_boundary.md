# Task 25: realtime-api-connection-boundary

## ゴール

現在の静的TypeScriptデモに、Realtime APIへ進むための安全な接続境界と画面上の未接続状態を追加する。すぐに本番通話・マイク送信・外部AI応答を有効化するのではなく、公式ドキュメント確認、設定境界、未設定/接続不可時の表示、local fallback維持を1 PRで整える。

## 位置づけ

Task 24 `browser-call-style-ui`の後続タスク。Call workspace、Call summary、Conversation preview、Operator note、Policy guard、Evidence candidates、no-send/no-save/no-production境界を維持したまま、Realtime接続へ進む前の安全な土台を作る。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/25_realtime_api_connection_boundary.md
```

## 必要な場合のみ読む

```text
package.json
src/app.ts
src/main.ts
src/fallback-rehearsal.ts
src/ai-response-request.ts
src/ai-response-client.ts
src/ai-response-network-client.ts
src/response-policy.ts
tests/**
docs/ai/demo/executive-demo-script.md
docs/ai/security/browser-call-style-ui-safety-audit.md
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

- OpenAI Realtime APIに関わる仕様は、実装前に必ず最新の公式OpenAIドキュメントで確認する。PR本文の`Context usage`に、確認した公式ドキュメントを記録する。
- API key、ephemeral token、マイク権限、録音、外部送信、永続保存の境界を明示した小さな設計を追加する。
- 本番接続を有効化しない初期状態として、UIに`Realtime not configured`または同等の未接続状態を表示する。
- 既存のlocal deterministic demo、fallback rehearsal、Call workspace、Call summary、Operator note、Policy guardを壊さない。
- ブラウザに秘密情報を埋め込まない。`.env`、API key、実token、音声録音、実電話接続、DB保存は追加しない。
- コード変更をする場合は、失敗するテストを先に追加する。
- 必要に応じて`docs/ai/security/`にRealtime接続境界の安全監査を追加する。
- `CURRENT.md` / `ACTIVE_TASK.md`をhandoffに合わせて更新する。

## やらないこと

- 実マイク音声を外部へ送らない。
- 実電話、認証、DB、会話履歴永続化、本番監視を追加しない。
- provider SDKやAPI keyを固定で組み込まない。
- Realtime tool callingまで広げない。tool callingは接続境界が固まった後の別タスクにする。
- GPT Proドラフトをsource of truthとして直接実行しない。

## テスト

```bash
npm test
npm run build
git diff --check
```

Windows PowerShellでは`npm.cmd test` / `npm.cmd run build`を使ってよい。

## レビュー観点

- Realtime / OpenAI docs freshness
- Security / secrets / browser exposure
- Product demo clarity
- Frontend / UX
- Policy / safety
- Test / TypeScript
- Context hygiene

## 完了条件

- 未接続状態が役員デモ上で明確で、本番接続済み・送信済み・保存済みと誤解されない。
- Realtime接続へ進むための境界、設定、失敗時fallbackがテストで固定されている。
- API keyや実tokenがrepoやブラウザbundleに入っていない。
- `npm test`、`npm run build`、`git diff --check`が通っている。
- `CURRENT.md`が現在状態だけを反映している。
- `ACTIVE_TASK.md`が次のタスク状態を指している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Known limitations` / `Context handoff`が含まれている。
