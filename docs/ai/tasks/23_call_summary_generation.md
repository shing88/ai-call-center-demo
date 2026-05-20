# タスク 23: call-summary-generation

## ゴール

選択中の問い合わせ、根拠候補、会話プレビュー、Operator note、policy guardから、ローカル決定的な応対サマリー、判断結果、次アクションを作る。役員デモで「何が起きたか」「なぜ止めた/進めたか」「次に人が何をするか」を説明できる状態にする。

## 位置づけ

Task 22 `executive-demo-polish`後の次タスク。Draft 10 `call_summary_generation`相当を、現在の静的TypeScriptデモ、policy guard、no-send/no-save境界に合わせて1 PRで扱う。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/23_call_summary_generation.md
```

## 必要な場合のみ読む

```text
package.json
src/app.ts
src/response-policy.ts
src/ai-response-request.ts
src/ai-response-client.ts
src/demo-scenario-regression.ts
tests/**
knowledge/**
docs/ai/demo/executive-demo-script.md
docs/ai/demo/ccnet-executive-scenario.md
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

- コード変更をする場合は、失敗するテストを先に追加する。
- 選択中call idごとに、問い合わせ要約、根拠参照、policy判断、Operator note状態、次アクションを決定的に作る。
- 必要なら`src/app.ts`内のhelper、または小さな`src/call-summary.ts`を追加する。
- Assistant handoffにサマリー表示を追加し、Executive demo brief、policy guard、Evidence candidatesと矛盾しない順番にする。
- 送信済み、保存済み、外部AIが生成済みと誤解される文言を入れない。
- 必要なら`docs/ai/demo/executive-demo-script.md`と`docs/ai/tests/automated-test-catalog.md`を更新する。
- `CURRENT.md` / `ACTIVE_TASK.md`をhandoffに合わせて更新する。

## やらないこと

- 実際のLLM要約生成、外部AI API、provider固有SDK、API key、環境変数を追加しない。
- DB保存、認証、実電話連携、本番監視、会話履歴の永続化を追加しない。
- Realtime音声やtool callingを実装しない。
- 画面全体の大規模リデザインをしない。

## テスト

```bash
npm test
npm run build
git diff --check
```

Windows PowerShellでは`npm.cmd test` / `npm.cmd run build`を使ってよい。

UIを変更した場合は、build後の画面で主要表示が崩れていないことも確認する。

## レビュー観点

- Product demo clarity
- Policy / safety
- Frontend / UX
- Test / TypeScript
- Context hygiene

## 完了条件

- 選択中問い合わせのサマリー、判断結果、次アクションが画面とテストで確認できる。
- no-send / no-save / no-production接続の境界が崩れていない。
- 必要なテストが通っている。
- `CURRENT.md`が現在状態だけを反映している。
- `ACTIVE_TASK.md`が次のタスク状態を指している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
