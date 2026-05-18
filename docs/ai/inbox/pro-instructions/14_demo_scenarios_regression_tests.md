# Draft 14: demo scenarios and regression tests

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## Proposed goal

デモが毎回同じ結果になるよう、シナリオと回帰テストを固定する。

## Suggested executable task name

`Task 14: demo-scenarios-regression-tests`

## Position

Task 13 `realtime-tool-calling` の後。

## Scope

作成候補:

```text
tests/scenarios/refund_normal.test.ts
tests/scenarios/refund_exception.test.ts
tests/scenarios/identity_not_verified.test.ts
tests/scenarios/complaint_escalation.test.ts
docs/ai/tests/automated-test-catalog.md
```

## Scenarios

```text
Scenario 1: 通常返金不可
Scenario 2: 契約特約により上席確認
Scenario 3: 本人確認未完了
Scenario 4: クレーム escalation
Scenario 5: 通話後サマリー
```

## Do

- 音声ではなくテキスト入力で再現可能な回帰テストを作る。
- decision、sourcePath、nextActionsを固定する。
- 本人確認前に契約詳細が出ないことを確認する。
- 上席確認が必要なケースで `answer_allowed` にならないことを確認する。
- test catalogを更新する。

## Do not

- 音声品質を完全自動テストしようとしない。
- flakyな外部API依存テストをCI必須にしない。
- 実データを使わない。

## Suggested tests

```bash
npm test
npm run typecheck
npm run lint
git diff --check
```

## Suggested reviews

- Test strategy
- Safety / compliance
- Context hygiene

## Done when

- 主要デモシナリオがテストで固定されている。
- 失敗したときにどの業務判断が壊れたか分かる。
