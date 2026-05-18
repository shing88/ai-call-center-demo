# Draft 16: executive demo polish

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## Proposed goal

役員向けデモとして、説明資料、画面表示、台本、安全説明を仕上げる。

## Suggested executable task name

`Task 16: executive-demo-polish`

## Position

Task 15 `fallback-rehearsal-mode` の後。

## Scope

作成候補:

```text
docs/ai/demo/executive-demo-script.md
docs/ai/demo/demo-architecture.md
docs/ai/demo/demo-risk-and-safety.md
docs/ai/demo/faq.md
README.md
```

## Do

- 5分デモ台本と15分デモ台本を作る。
- アーキテクチャ図または構成説明を書く。
- 本物の個人情報を使っていないことを明記する。
- AIが自由判断しないこと、根拠とpolicyで制御することを説明する。
- 画面上のラベルや説明を役員向けに分かりやすくする。
- 必要なら管理職向けHTMLレポートを作る。

## Do not

- 本番導入計画に踏み込みすぎない。
- 費用見積を断定しない。
- 実電話連携をこのPRに入れない。

## Suggested tests

```bash
npm test
npm run typecheck
npm run lint
git diff --check
```

必要に応じて画面の手動確認をPR本文に記録する。

## Suggested reviews

- Executive communication
- Safety / privacy
- Context hygiene

## Done when

- READMEだけでデモ起動と実施ができる。
- 5分 / 15分の台本がある。
- 役員からの想定質問に答えられるFAQがある。
- デモの安全境界が明記されている。
