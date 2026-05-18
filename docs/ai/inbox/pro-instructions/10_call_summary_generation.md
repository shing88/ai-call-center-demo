# Draft 10: call summary generation

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## Proposed goal

通話終了時に応対履歴、要約、判断結果、次アクションを生成する。

## Suggested executable task name

`Task 10: call-summary-generation`

## Position

Task 09 `response-policy-guard` の後。

## Scope

作成候補:

```text
src/summary/types.ts
src/summary/createCallSummary.ts
src/summary/__tests__/createCallSummary.test.ts
app/api/calls/[id]/summary/route.ts
components/CallSummaryPanel.tsx
```

## Do

- 通話ログから要約を作る。
- 問い合わせ種別、本人確認状態、判断結果、次アクションを含める。
- 参照根拠をサマリーに残す。
- 初期はルールベース生成でよい。
- LLMを使う場合でもfallback可能にする。

## Do not

- 本番CRM連携をしない。
- 本物の応対履歴保存を想定しない。
- 長い自由文章だけのサマリーにしない。

## Suggested tests

```bash
npm test -- createCallSummary
npm run typecheck
npm run lint
git diff --check
```

## Suggested reviews

- Product / operations
- Safety / auditability
- TypeScript / test

## Done when

- 通話終了ボタンでサマリーが出る。
- 次アクションが出る。
- 判断結果と根拠が残る。
