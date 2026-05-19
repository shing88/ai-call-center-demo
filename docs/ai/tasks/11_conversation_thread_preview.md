# Task 11: conversation-thread-preview

## ゴール

選択中キューの問い合わせ文、AIの応答ドラフト、根拠メモを、会話履歴風のプレビューとしてAssistant handoffに表示する。

このタスクでは外部AI API、会話履歴保存、ストリーミングは実装せず、現在のデモ状態から決定的に描画できる履歴風UIだけを扱う。

## 位置づけ

Task 10 `conversation-draft-handoff`の直後のタスク。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/11_conversation_thread_preview.md
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

- コード変更前に、会話履歴風プレビューの生成と描画を検査するテストを追加する。
- 選択中キューのcaller/excerptを顧客発話として表示する。
- Task 10の応答ドラフトをAI応答として表示する。
- 根拠source/sectionまたは確認中状態を内部メモとして表示する。
- キュー項目を切り替えたとき、会話履歴風プレビューも同じcall idに追従するようにする。
- 既存のescaping方針を維持する。
- 変更後の現状を`CURRENT.md`と`ACTIVE_TASK.md`へ反映する。

## やらないこと

- 外部AI API、LLM応答生成、ストリーミング、会話履歴保存は実装しない。
- ユーザー入力フォーム、送信ボタン、DB、認証、通話連携は追加しない。
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

- 初期表示で選択中キューに対応した会話履歴風プレビューが表示される
- 別のキュー項目を開くとcall id、顧客発話、AI応答、根拠メモが一緒に切り替わる
- 未確定のデモプレビューであり、外部送信操作がない

## レビュー観点

- Frontend
- Security / safety
- Test / TypeScript
- Context hygiene

## 完了条件

- 選択中キューの会話履歴風プレビューがAssistant handoffに表示される。
- キュー切り替え時にプレビューも切り替わる。
- 失敗時fallbackとescapingが維持される。
- 必要なテストが通る、または未実行理由が説明されている。
- `CURRENT.md`が現在状態だけに更新されている。
- `ACTIVE_TASK.md`が次のタスクを指している。
- PR本文に`Context usage` / `Summary` / `Tests` / `Reviews` / `Known limitations` / `Context handoff`が含まれている。
