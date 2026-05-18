# Draft 03: knowledge markdown baseline

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## Proposed goal

デモ用の架空業務ルールと架空顧客契約Markdownを `knowledge/` 配下に作成する。

## Suggested executable task name

`Task 03: knowledge-markdown-baseline`

## Position

Task 02 `project-skeleton` の後。

## Scope

作成候補:

```text
knowledge/business_rules/001_identity_verification.md
knowledge/business_rules/002_refund_policy.md
knowledge/business_rules/003_cancellation_policy.md
knowledge/business_rules/004_escalation_policy.md
knowledge/customer_contracts/customer_1001.md
knowledge/customer_contracts/customer_1002.md
knowledge/customer_contracts/customer_1003.md
knowledge/scenarios/scenario_01_refund_normal.md
knowledge/scenarios/scenario_02_refund_exception.md
knowledge/scenarios/scenario_03_identity_not_verified.md
knowledge/scenarios/scenario_04_complaint_escalation.md
```

## Do

- すべて架空データで作る。
- 本人確認前に話してよいこと / いけないことを明記する。
- 返金、解約、補償、上席確認ルールを分ける。
- 顧客契約には契約状態、本人確認項目、特約、注意事項を含める。
- `knowledge/README.md` を追加し、デモ用架空データであることを明記する。
- Markdownの見出し構造を後続chunk化しやすい形にする。

## Do not

- 実在顧客名、住所、電話番号、契約番号を使わない。
- ベクターDBやembeddingを導入しない。
- AI応答ロジックを作らない。

## Suggested tests

```bash
npm test
git diff --check
```

必要に応じて Markdown lint または構造検査テストを追加する。

## Suggested reviews

- Safety / privacy
- Product demo clarity
- Context hygiene

## Done when

- 業務ルールMarkdownが4本以上ある。
- 顧客契約Markdownが3人分以上ある。
- デモシナリオが4本以上ある。
- 架空データであることが明記されている。
