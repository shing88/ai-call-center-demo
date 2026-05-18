# Draft 09: response policy guard

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## Proposed goal

AIの自由回答を制御し、回答可否・本人確認要求・上席確認・回答不可を明示する。

## Suggested executable task name

`Task 09: response-policy-guard`

## Position

Task 08 `evidence-panel-ui` の後。

## Scope

作成候補:

```text
src/policy/types.ts
src/policy/decideResponsePolicy.ts
src/policy/policyRules.ts
src/policy/__tests__/decideResponsePolicy.test.ts
```

## Suggested model

```ts
type ResponsePolicyDecision = {
  decision: "answer_allowed" | "identity_required" | "requires_supervisor" | "cannot_answer";
  reason: string;
  requiredSources: string[];
  customerFacingResponse: string;
};
```

## Do

- 本人確認前は契約詳細を回答不可にする。
- 返金は返金ルール参照なしでは回答不可にする。
- 特約ありの場合は上席確認へ回す。
- クレーム強度が高い場合は上席確認へ回す。
- 根拠がない場合は断定しない。
- テキスト応対フローに組み込む。

## Do not

- LLMに判断を丸投げしない。
- Realtime音声へ進まない。
- 返金・補償・解約を自由回答にしない。

## Suggested tests

```bash
npm test -- decideResponsePolicy
npm run typecheck
npm run lint
git diff --check
```

## Suggested reviews

- Safety / compliance
- Product behavior
- Test coverage

## Done when

- 主要シナリオで期待decisionが出る。
- 根拠なしの断定回答が防止される。
- UIに判断結果が表示される。
