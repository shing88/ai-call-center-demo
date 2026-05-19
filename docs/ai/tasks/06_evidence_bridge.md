# タスク 06: evidence-bridge

## ゴール

検索結果をデモUIまたは会話フローへ接続する前段として、既存のキュー項目とknowledge検索結果をつなぐ薄いbridgeを追加する。
このタスクではブラウザUIへ直接表示せず、Node.js側で会話/画面に渡せる根拠候補の形を定義してテストする。

## 位置づけ

Task 05 `keyword-search-tools`の後続。
次のUI接続または会話フロー接続タスクの入力になる。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/06_evidence_bridge.md
```

## 必要な場合のみ読む

```text
README.md
package.json
src/app.ts
src/knowledge.ts
src/knowledge-search.ts
tests/app.test.ts
tests/knowledge-loader.test.ts
tests/knowledge-search.test.ts
docs/ai/tasks/README.md
docs/ai/tasks/_template.md
```

## やること

- コード変更がある場合は先に失敗するテストを追加する。
- `QueueItem`から検索用クエリを作り、`KnowledgeSearchResult`を会話/画面へ渡しやすい形にまとめる小さな型と関数を追加する。
- 既存の`loadKnowledgeBase` / `searchKnowledge`を再利用する。
- ブラウザの`src/main.ts`がNode.jsのファイル読み込み境界へ依存しないことを保つ。
- 現在状態が変わる場合は`CURRENT.md`と`ACTIVE_TASK.md`を更新する。

## やらないこと

- 外部AI API、通話連携、認証、DBを追加しない。
- 検索ランキングの大幅な作り直しはしない。
- ブラウザUIへの根拠候補表示はこのタスクでは行わない。
- 完了済みタスク指示、アーカイブ、レポートを現在仕様として読まない。

## テスト

```bash
git diff --check
npm test
npm run build
```

## レビュー観点

- API / contract
- Test / TypeScript
- Context hygiene

## 完了条件

- キュー項目から根拠候補bundleを作れることがテストで確認されている。
- 空または該当なしの問い合わせで安全に空結果を返す。
- `npm test`と`npm run build`が通る、または未実行/失敗理由が説明されている。
- `CURRENT.md`が現在状態に合っている。
- `ACTIVE_TASK.md`が次のタスク状態を指している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
