# タスク 21: fallback-rehearsal-mode

## ゴール

役員デモ中に外部AI API、音声、通信が使えない場合でも、現在の決定的なローカル境界だけでデモを継続できるfallback / rehearsal modeを追加する。

このタスクでは、Task 20で固定した代表シナリオ回帰を土台に、デモ進行時に「外部送信なし」「保存なし」「手動進行可」が画面とrunbookで分かる状態を作る。

## 位置づけ

Task 20 `demo-scenario-regression-suite`後の次タスク。Draft 15 `fallback_rehearsal_mode`を、現在のTypeScript静的デモ構成に合わせて回収する。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/21_fallback_rehearsal_mode.md
```

## 必要な場合のみ読む

```text
package.json
src/app.ts
src/main.ts
src/demo-scenario-regression.ts
src/evidence-manifest.ts
src/evidence-manifest-client.ts
src/ai-response-client.ts
src/ai-response-network-client.ts
tests/**
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
- 現在の静的TypeScriptアプリに合う小さなrehearsal/fallback modeの状態、表示、またはhelperを追加する。
- 代表シナリオを手動で進められること、外部AI APIに依存しないこと、送信/保存が引き続き禁止されることを固定する。
- UIを変更する場合は、既存レイアウトを保ちつつ、デモ継続に必要な表示だけを追加する。
- fallback時の説明、手動進行、失敗時の話し方を`docs/ai/demo/fallback-runbook.md`などに文書化する。
- 必要なら`docs/ai/tests/automated-test-catalog.md`を更新する。
- `CURRENT.md` / `ACTIVE_TASK.md`をhandoffに合わせて更新する。

## やらないこと

- 実際の外部AI API、Realtime音声、tool calling、provider固有SDK、API key、環境変数を追加しない。
- DB保存、認証、実電話連携、本番監視を追加しない。
- React component構成や大きなUIリデザインへ作り替えない。
- 複雑なデモスクリプトエンジンにしない。

## テスト

```bash
npm test
npm run build
git diff --check
```

Windows PowerShellでは`npm.cmd test` / `npm.cmd run build`を使ってよい。

UIを変更した場合は、build後の画面でfallback / rehearsal表示が確認できることも検証する。

## レビュー観点

- Product demo operations
- Frontend / UX
- Policy / safety
- Test / TypeScript
- Context hygiene

## 完了条件

- 外部AI APIや音声が使えない想定でも、デモを手動で継続できる状態がある。
- fallback / rehearsal状態が、送信済み・保存済み・本番接続済みと誤解されない。
- 代表シナリオまたは既存demo queueと整合したテストがある。
- 必要なテストが通っている。
- `CURRENT.md`が現在状態だけを反映している。
- `ACTIVE_TASK.md`が次のタスク状態を指している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
