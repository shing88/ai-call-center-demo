# Draft 06: call session state

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## Proposed goal

通話セッションの状態管理を実装する。

## Suggested executable task name

`Task 06: call-session-state`

## Position

Task 05 `keyword-search-tools` の後。

## Scope

作成候補:

```text
src/calls/types.ts
src/calls/callSessionStore.ts
src/calls/__tests__/callSessionStore.test.ts
app/api/calls/start/route.ts
app/api/calls/[id]/route.ts
app/api/calls/[id]/messages/route.ts
```

## Suggested model

```ts
type CallSession = {
  id: string;
  customerId?: string;
  identityStatus: "not_started" | "in_progress" | "verified" | "failed";
  intent?: "refund" | "cancellation" | "complaint" | "general";
  escalationStatus: "none" | "required" | "completed";
  messages: CallMessage[];
};
```

## Do

- まずメモリ保存でよい。
- 通話開始、取得、メッセージ追加、状態更新をテストする。
- セッションIDを生成する。
- 後でDB化できるようにstore interfaceを分ける。

## Do not

- まだ永続DBを入れない。
- まだ音声やRealtimeへ進まない。
- まだAI回答を生成しない。

## Suggested tests

```bash
npm test -- callSessionStore
npm run typecheck
npm run lint
git diff --check
```

## Suggested reviews

- API / state contract
- TypeScript / test
- Context hygiene

## Done when

- 通話開始APIが動く。
- 会話ログを保存できる。
- 本人確認状態、問い合わせ種別、上席確認状態を更新できる。
