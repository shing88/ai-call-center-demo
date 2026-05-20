# タスク 18: operator-input-submit-save-design

## ゴール

現在の未送信Operator noteを、キュー選択ごとに編集・送信準備・保存境界へ進める。

このタスクでは外部AI API、DB、認証、本送信は追加しない。ブラウザ内の状態、送信候補payload、保存不可/未永続の明示、テストをまとめ、今後の会話履歴保存やprovider固有client設定へつなげる。

## 位置づけ

Task 17 `roadmap-reconciliation`後の次タスク。Draft 06 `call-session-state`、Draft 07 `text-chat-demo-flow`、Draft 09 `response-policy-guard`の残りを、現在の実装に合わせて大きめPRとして回収する。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/18_operator_input_submit_save_design.md
docs/ai/specs/draft-task-reconciliation.md
```

## 必要な場合のみ読む

```text
package.json
src/app.ts
src/main.ts
src/ai-response-request.ts
src/ai-response-client.ts
src/ai-response-network-client.ts
tests/app.test.ts
tests/ai-response-request.test.ts
tests/ai-response-client.test.ts
tests/ai-response-network-client.test.ts
docs/ai/tests/automated-test-catalog.md
```

## やること

- 失敗する単体テストを先に追加する。
- キュー項目ごとにOperator noteの編集状態を持てるようにする。
- 選択中call idが変わっても、各call idの入力内容が混線しないようにする。
- 「送信準備済み」または「保存候補」のような、外部送信前のpayload境界を追加する。
- UI上では、本送信/永続保存ではないことを明示する。
- `AiResponseRequest`や`AiResponseClient`境界と矛盾しない形で、operator inputがどのpayloadへ入るかをテストする。
- 必要なら`docs/ai/tests/automated-test-catalog.md`を更新する。
- `CURRENT.md` / `ACTIVE_TASK.md`をhandoffに合わせて更新する。

## やらないこと

- OpenAIなど特定providerのSDKやAPI仕様へ結合しない。
- API key、環境変数、認証、DB、会話履歴の永続保存を追加しない。
- 実際の外部送信ボタンや本番送信フローを追加しない。
- Realtime音声、tool calling、通話録音を追加しない。

## テスト

```bash
npm test
npm run build
git diff --check
```

## レビュー観点

- Frontend state
- API / contract
- Security
- Test / TypeScript
- Context hygiene

## 完了条件

- Operator noteの編集状態がcall idごとに分離されている。
- 送信/保存候補payloadが型とテストで確認できる。
- 本送信・永続保存・外部AI API接続が追加されていない。
- UIまたは表示文言で未送信/未保存状態が明確である。
- 必要なテストが通っている。
- `CURRENT.md`が現在状態だけを反映している。
- `ACTIVE_TASK.md`が次のタスク状態を指している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
