# タスク 19: response-policy-guard

## ゴール

キュー項目、根拠候補、会話プレビュー、Operator noteから、回答してよい範囲、上席確認が必要な条件、回答不可にすべき条件を決定的に判定するpolicy guardを追加する。

このタスクでは、外部AI API、provider固有SDK、認証、DB、永続保存、本送信は追加しない。Task 18で追加した未送信/未保存のoperator input境界と矛盾しない形で、次のAI response request/client境界へpolicy判断を渡す。

## 位置づけ

Task 18 `operator-input-submit-save-design`後の次タスク。Draft 09 `response_policy_guard`の残りを、現在の実装に合わせて大きめPRとして回収する。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/19_response_policy_guard.md
docs/ai/specs/draft-task-reconciliation.md
```

## 必要な場合のみ読む

```text
package.json
src/app.ts
src/ai-response-request.ts
src/ai-response-client.ts
src/ai-response-network-client.ts
src/knowledge-search.ts
tests/app.test.ts
tests/ai-response-request.test.ts
tests/ai-response-client.test.ts
tests/ai-response-network-client.test.ts
knowledge/business_rules/**
knowledge/scenarios/**
docs/ai/security/operator-input-submit-save-design-safety-audit.md
docs/ai/tests/automated-test-catalog.md
```

## やること

- 失敗する単体テストを先に追加する。
- 本人確認前に案内してよい内容、上席確認が必要な内容、回答不可にすべき内容を、現在のデモデータとknowledge根拠から決定的に判定する。
- policy結果をTypeScriptの型として表現し、`AiResponseRequest`または`AiResponseClient`境界へ渡す。
- UI上で、policy判断が「外部送信済み」や「保存済み」ではないことを既存のguardrail表示と矛盾しない形で示す。
- operator input、evidence、queue状態がpolicy判断にどう使われるかをテストする。
- 必要なら`docs/ai/tests/automated-test-catalog.md`と安全監査メモを更新する。
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

Windows PowerShellでは`npm.cmd test` / `npm.cmd run build`を使ってよい。

## レビュー観点

- Policy / safety
- API / contract
- Frontend state
- Security
- Test / TypeScript
- Context hygiene

## 完了条件

- policy guardの判定結果が型とテストで確認できる。
- 本送信・永続保存・外部AI API接続が追加されていない。
- Operator noteと根拠候補がpolicy判断へ混線なく渡る。
- 必要なテストが通っている。
- `CURRENT.md`が現在状態だけを反映している。
- `ACTIVE_TASK.md`が次のタスク状態を指している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
