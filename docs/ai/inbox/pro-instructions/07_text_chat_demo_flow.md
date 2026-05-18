# Draft 07: text chat demo flow

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## Proposed goal

音声より先に、テキスト入力でAI応対の中核フローを成立させる。

## Suggested executable task name

`Task 07: text-chat-demo-flow`

## Position

Task 06 `call-session-state` の後。

## Scope

作成候補:

```text
src/ai/respondToUserMessage.ts
src/ai/types.ts
src/ai/__tests__/respondToUserMessage.test.ts
app/api/calls/[id]/user-message/route.ts
components/ChatPanel.tsx
components/CallStatePanel.tsx
```

## Do

- ユーザー入力を受け、検索toolを呼び、根拠付きの応答オブジェクトを返す。
- 初期はLLMを使わず、ルールベースの仮応答でもよい。
- 本人確認前は契約詳細を返さない。
- 顧客契約と業務ルールの検索結果を応答に含める。
- UIでテキスト応対を確認できるようにする。

## Do not

- Realtime音声を実装しない。
- 回答制御の完全版をここで作り込まない。
- 本物の個人情報を使わない。

## Suggested tests

```bash
npm test -- respondToUserMessage
npm run typecheck
npm run lint
git diff --check
```

## Suggested reviews

- Safety / privacy
- Product flow
- Frontend / test

## Done when

- テキストで質問できる。
- 業務ルール・顧客契約検索が呼ばれる。
- 参照根拠IDが応答に含まれる。
- 本人確認前の契約詳細制御が効く。
