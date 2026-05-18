# Draft 13: realtime tool calling

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## Proposed goal

Realtime音声AIから業務ルール検索、顧客契約検索、回答制御toolを呼ばせる。

## Suggested executable task name

`Task 13: realtime-tool-calling`

## Position

Task 12 `realtime-api-connection` の後。

## Scope

作成候補:

```text
src/realtime/toolDefinitions.ts
src/realtime/handleToolCall.ts
src/realtime/__tests__/handleToolCall.test.ts
```

## Tools

```text
search_business_rules(query)
search_customer_contract(customer_id, query)
update_identity_status(status)
decide_response_policy(context)
create_call_summary(call_id)
```

## Do

- 既存の検索・policy・summary関数をtool handlerから呼ぶ。
- tool結果を根拠パネルへ反映する。
- 本人確認前の制御を音声でも維持する。
- 上席確認判定を音声でも維持する。
- Realtime側の自由回答をpolicy decisionで制限する。

## Do not

- tool handler内に新しい業務ルールを直書きしない。
- 検索ロジックを重複実装しない。
- 実電話連携へ進まない。

## Suggested tests

```bash
npm test -- handleToolCall
npm run typecheck
npm run lint
git diff --check
```

## Suggested reviews

- Safety / policy enforcement
- Realtime / API contract
- Test coverage

## Done when

- 音声会話中に検索toolが呼べる。
- tool結果が根拠パネルへ表示される。
- policy guardが音声経路でも効く。
