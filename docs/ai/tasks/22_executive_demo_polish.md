# タスク 22: executive-demo-polish

## ゴール

役員向けデモとして、現在の静的TypeScriptアプリの画面密度、説明順、安全説明、デモ台本を整える。Task 21までに固めた根拠候補、policy guard、fallback / rehearsal modeを前提に、CCNet株式会社の公開HPに合う架空シナリオも作成し、見せ方と説明の一貫性を改善する。

## 位置づけ

Task 21 `fallback-rehearsal-mode`後の次タスク。Draft 16 `executive_demo_polish`相当の仕上げを、現在の実装とcontext packに合わせて1 PRで扱う。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/22_executive_demo_polish.md
```

## 必要な場合のみ読む

```text
package.json
src/app.ts
src/main.ts
src/fallback-rehearsal.ts
src/demo-scenario-regression.ts
tests/**
knowledge/**
docs/ai/demo/fallback-runbook.md
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
- 役員デモの最初の画面で、何を確認すべきかが自然に伝わる情報順へ整える。
- policy guard、fallback / rehearsal、送信/保存不可の説明が矛盾なく見えるようにする。
- CCNet株式会社の公開HP、サービス詳細、契約約款、重要事項説明を確認し、公開情報だけを根拠に、実在顧客情報を使わない会社フィットシナリオと架空顧客モックを作る。
- 必要ならデモ台本やrunbookを更新する。
- UIを変更する場合は、既存の静的HTML/TypeScript構成を保ち、React化や大規模リデザインはしない。
- 必要なら`docs/ai/tests/automated-test-catalog.md`を更新する。
- `CURRENT.md` / `ACTIVE_TASK.md`をhandoffに合わせて更新する。

## やらないこと

- 実際の外部AI API、Realtime音声、tool calling、provider固有SDK、API key、環境変数を追加しない。
- DB保存、認証、実電話連携、本番監視を追加しない。
- 画面全体のデザインシステム作り替えや大規模な情報設計変更をしない。

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
- Frontend / UX
- Policy / safety
- Test / TypeScript
- Context hygiene

## 完了条件

- 役員デモで、根拠候補、policy guard、fallback / rehearsal、送信/保存不可の関係を説明しやすい状態になっている。
- 外部送信、保存、本番接続を行ったように誤解されない。
- CCNet向けシナリオと顧客モックが、公開情報、約款、重要事項説明ベースの架空データとして説明できる。
- 必要なテストが通っている。
- `CURRENT.md`が現在状態だけを反映している。
- `ACTIVE_TASK.md`が次のタスク状態を指している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
