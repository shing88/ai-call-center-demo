# Draft 11: browser call style UI

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## Proposed goal

テキストチャット画面を、役員に見せられる通話風UIへ整える。

## Suggested executable task name

`Task 11: browser-call-style-ui`

## Position

Task 10 `call-summary-generation` の後。

## Scope

作成候補:

```text
components/CallShell.tsx
components/VoiceStatusPlaceholder.tsx
components/CustomerSelector.tsx
components/OperatorDashboard.tsx
app/page.tsx
```

## Do

- 通話開始 / 終了ボタンを作る。
- 顧客選択を作る。
- 本人確認状態、問い合わせ種別、上席確認状態を見せる。
- 音声未接続でも通話デモに見える画面にする。
- 根拠パネル、判断パネル、サマリーを同一画面に配置する。

## Do not

- Realtime APIをここで実装しない。
- 本番向けUIまで作り込まない。
- 複雑な状態管理ライブラリを入れない。

## Suggested tests

```bash
npm test
npm run typecheck
npm run lint
git diff --check
```

必要に応じてPlaywrightまたはReact component testを追加する。

## Suggested reviews

- Frontend / accessibility
- Product demo
- Context hygiene

## Done when

- 音声なしでも役員向けに説明できる画面になっている。
- 通話開始からサマリーまで1画面で確認できる。
