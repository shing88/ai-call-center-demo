# Draft 08: evidence panel UI

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## Proposed goal

AIが何を根拠に回答したかを画面上で見せる根拠パネルを追加する。

## Suggested executable task name

`Task 08: evidence-panel-ui`

## Position

Task 07 `text-chat-demo-flow` の後。

## Scope

作成候補:

```text
components/EvidencePanel.tsx
components/SourceCard.tsx
components/DecisionPanel.tsx
components/__tests__/EvidencePanel.test.tsx
```

## Do

- 顧客契約と業務ルールの根拠を分けて表示する。
- `sourcePath`、`section`、`snippet`、`score` を表示する。
- AI判断理由を別枠で表示する。
- テキスト応対フローと連動させる。
- UIの見た目は役員デモ向けに分かりやすくする。

## Do not

- まだ音声を実装しない。
- まだ本格デザインシステムを導入しない。
- 検索ロジックを大きく変更しない。

## Suggested tests

```bash
npm test -- EvidencePanel
npm run typecheck
npm run lint
git diff --check
```

## Suggested reviews

- Frontend / accessibility
- Product demo clarity
- Context hygiene

## Done when

- 応答ごとに参照根拠が表示される。
- 顧客契約と業務ルールが分かれている。
- 根拠表示なしの回答が分かる。
