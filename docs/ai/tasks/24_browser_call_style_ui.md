# タスク 24: browser-call-style-ui

## ゴール

現在の静的TypeScriptデモを、役員に見せやすい通話風UIへ整える。Live queue、Call summary、Conversation preview、Operator note、policy guard、Evidence candidatesの関係を保ち、短時間で「通話中に何が起きているか」が見える状態にする。

## 位置づけ

Task 23 `call-summary-generation`後の次タスク。Draft 11 `browser_call_style_ui`相当を、現在の静的UI、安全境界、no-send/no-save方針に合わせて1 PRで扱う。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/24_browser_call_style_ui.md
```

## 必要な場合のみ読む

```text
package.json
src/app.ts
src/styles.css
src/main.ts
src/call-summary.ts
src/response-policy.ts
tests/**
docs/ai/demo/executive-demo-script.md
docs/ai/demo/ccnet-executive-scenario.md
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
- 画面全体を大きく作り替えず、現在の静的HTML/TypeScript構成を維持する。
- 選択中call idの状態、Call summary、Conversation preview、Operator note、policy guard、Evidence candidatesが追いやすい通話風レイアウトにする。
- 送信済み、保存済み、外部AI生成済み、本番通話接続済みと誤解される文言を入れない。
- モバイル幅でもテキストがはみ出さず、主要パネルが読めるようにする。
- 必要なら`docs/ai/demo/executive-demo-script.md`と`docs/ai/tests/automated-test-catalog.md`を更新する。
- `CURRENT.md` / `ACTIVE_TASK.md`をhandoffに合わせて更新する。

## やらないこと

- 実電話、Realtime音声、外部AI API、tool calling、provider SDK、API key、環境変数を追加しない。
- DB保存、認証、本番監視、会話履歴の永続化を追加しない。
- React化や大規模なフレームワーク変更をしない。
- 実在顧客情報を追加しない。

## テスト

```bash
npm test
npm run build
git diff --check
```

Windows PowerShellでは`npm.cmd test` / `npm.cmd run build`を使ってよい。

UIを変更するため、build後の画面またはrender checkで主要表示が崩れていないことも確認する。

## レビュー観点

- Product demo clarity
- Frontend / UX
- Policy / safety
- Test / TypeScript
- Context hygiene

## 完了条件

- 役員デモで、通話中の問い合わせ、要約、判断、次アクション、根拠が追いやすい。
- no-send / no-save / no-production接続の境界が崩れていない。
- 必要なテストが通っている。
- `CURRENT.md`が現在状態だけを反映している。
- `ACTIVE_TASK.md`が次のタスク状態を指している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
