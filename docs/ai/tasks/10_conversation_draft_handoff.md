# Task 10: conversation-draft-handoff

## ゴール

選択中のキュー項目とAssistant handoffの根拠候補から、オペレーターが会話で使える短い応答ドラフトを表示する。

このタスクでは外部AI APIへ接続せず、ブラウザ内で決定的に作れるデモ用ドラフトだけを扱う。

## 位置づけ

Task 09 `queue-evidence-selection`の直後のタスク。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/10_conversation_draft_handoff.md
```

## 必要な場合のみ読む

```text
README.md
package.json
package-lock.json
src/app.ts
src/main.ts
src/evidence-manifest.ts
src/evidence-manifest-client.ts
src/styles.css
tests/app.test.ts
tests/evidence-manifest.test.ts
tests/evidence-manifest-client.test.ts
```

## 読まない

```text
docs/ai/archive/**
docs/ai/reports/**
古い計画
完了済みのタスク指示
```

## やること

- コード変更前に、選択中キューと根拠候補から応答ドラフトが作られるテストを追加する。
- 応答ドラフトは選択中call id、キュー項目のtopic/excerpt/caller、根拠候補の先頭source/sectionに基づく。
- キュー項目を切り替えたとき、Assistant handoffの根拠候補と一緒に応答ドラフトも切り替わるようにする。
- 根拠候補が0件の場合も、空のまま崩れず「確認中」の文脈が分かる表示にする。
- 既存のescaping方針を維持する。
- 変更後の現状を`CURRENT.md`と`ACTIVE_TASK.md`へ反映する。

## やらないこと

- 外部AI API、LLM応答生成、ストリーミング、会話履歴保存は実装しない。
- 認証、DB、通話連携は追加しない。
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

- 初期表示で選択中キューに対応した応答ドラフトが表示される
- 別のキュー項目を開くとcall id、根拠候補、応答ドラフトが一緒に切り替わる
- 根拠候補のsource/sectionがドラフトの根拠表示に反映される

## レビュー観点

- Frontend
- Security / safety
- Test / TypeScript
- Context hygiene

## 完了条件

- 選択中キューと根拠候補から応答ドラフトが表示される。
- キュー切り替え時に応答ドラフトも切り替わる。
- 失敗時fallbackとescapingが維持される。
- 必要なテストが通る、または未実行理由が説明されている。
- `CURRENT.md`が現在状態だけに更新されている。
- `ACTIVE_TASK.md`が次のタスクを指している。
- PR本文に`Context usage` / `Summary` / `Tests` / `Reviews` / `Known limitations` / `Context handoff`が含まれている。
