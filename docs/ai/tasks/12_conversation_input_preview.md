# Task 12: conversation-input-preview

## ゴール

会話履歴風プレビューの下に、オペレーターが追記メモを入力できる未送信の入力導線を表示する。

このタスクでは送信、保存、外部AI API、会話履歴DBは実装せず、現在のデモ画面内で安全に確認できる入力欄と未送信状態だけを扱う。

## 位置づけ

Task 11 `conversation-thread-preview`の直後のタスク。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/12_conversation_input_preview.md
```

## 必要な場合のみ読む

```text
README.md
package.json
package-lock.json
src/app.ts
src/main.ts
src/styles.css
tests/app.test.ts
```

## 読まない

```text
docs/ai/archive/**
docs/ai/reports/**
古い計画
完了済みのタスク指示
```

## やること

- コード変更前に、入力導線の生成と描画を検査するテストを追加する。
- 選択中call idに紐づく未送信入力欄をAssistant handoffに表示する。
- 入力欄には選択中キューに合う初期文またはplaceholderを表示する。
- 送信ボタンは置かず、未送信/デモ用であることがUI上で分かる状態にする。
- キュー項目を切り替えたとき、入力導線も同じcall idに追従するようにする。
- 既存のescaping方針を維持する。
- 変更後の現状を`CURRENT.md`と`ACTIVE_TASK.md`へ反映する。

## やらないこと

- 外部AI API、LLM応答生成、ストリーミング、送信、保存、会話履歴DBは実装しない。
- 認証、通話連携、フォーム送信、ネットワークリクエストは追加しない。
- 検索ランキングやknowledge本文を大きく変更しない。
- archive / reports / 完了済みタスク指示を現在仕様として読まない。

## テスト

```bash
git diff --check
npm test
npm run build
```

PowerShellで`npm.ps1`がブロックされる場合は、同等の`npm.cmd test` / `npm.cmd run build`を使う。

可能なら、build後にローカル配信してブラウザで次を確認する。

- 初期表示で選択中call idに紐づく未送信入力欄が表示される
- 別のキュー項目を開くと入力欄のcall id、初期文、未送信状態が切り替わる
- 送信ボタンや外部送信操作がない

## レビュー観点

- Frontend
- Security / safety
- Test / TypeScript
- Context hygiene

## 完了条件

- 選択中キューの未送信入力導線がAssistant handoffに表示される。
- キュー切り替え時に入力導線も切り替わる。
- 送信/保存/外部通信が追加されていない。
- 必要なテストが通る、または未実行理由が説明されている。
- `CURRENT.md`が現在状態だけに更新されている。
- `ACTIVE_TASK.md`が次のタスクを指している。
- PR本文に`Context usage` / `Summary` / `Tests` / `Reviews` / `Known limitations` / `Context handoff`が含まれている。
