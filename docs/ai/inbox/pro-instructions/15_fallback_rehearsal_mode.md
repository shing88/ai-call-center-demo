# Draft 15: fallback and rehearsal mode

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## Proposed goal

役員デモ中に音声APIや通信が失敗しても進行できるfallback / rehearsal modeを作る。

## Suggested executable task name

`Task 15: fallback-rehearsal-mode`

## Position

Task 14 `demo-scenarios-regression-tests` の後。

## Scope

作成候補:

```text
components/DemoScenarioSelector.tsx
components/FallbackBanner.tsx
src/demo/demoScriptRunner.ts
src/demo/__tests__/demoScriptRunner.test.ts
docs/ai/demo/fallback-runbook.md
```

## Do

- シナリオ選択UIを作る。
- 事前定義された顧客発話を投入できるようにする。
- 音声失敗時にテキストモードへ切り替える。
- AI応答が遅い場合の手動進行を用意する。
- デモ失敗時の説明文をrunbookに書く。

## Do not

- 本番運用監視を作らない。
- 複雑なデモスクリプトエンジンにしない。
- 実電話連携へ進まない。

## Suggested tests

```bash
npm test -- demoScriptRunner
npm run typecheck
npm run lint
git diff --check
```

## Suggested reviews

- Product demo operations
- Frontend
- Context hygiene

## Done when

- 音声APIが失敗してもデモを継続できる。
- シナリオをボタンで切り替えられる。
- fallback手順が文書化されている。
