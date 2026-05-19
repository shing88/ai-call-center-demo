# Task 05: keyword-search-tools

## ゴール

`KnowledgeChunk`を入力にしたキーワード検索の純粋関数を追加し、業務ルールと顧客契約から根拠候補を取り出せるようにする。

このタスクではUIや外部APIには接続しない。後続タスクが使える検索結果の契約とテストを作る。

## 位置づけ

Task 04 `markdown-loader-chunk-model` の後続タスク。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/05_keyword_search_tools.md
```

## 必要な場合のみ読む

```text
package.json
src/knowledge.ts
tests/knowledge-loader.test.ts
knowledge/business_rules/**
knowledge/customer_contracts/**
docs/ai/inbox/pro-instructions/05_keyword_search_tools.md
```

## 読まない

```text
docs/ai/archive/**
docs/ai/reports/**
古い計画
完了済みのタスク指示
```

## やること

- `KnowledgeChunk`配列とqueryを受け取る検索関数を追加する。
- 検索結果に`sourcePath`、`section`、`snippet`、`score`を含める。
- 返金、解約、本人確認、上席確認の代表クエリを小さな同義語辞書で拾う。
- 顧客契約検索では`customerId`で対象顧客を絞れるようにする。
- テストを先に追加し、現行の`npm test`で検証する。
- 実装後に`CURRENT.md`と`ACTIVE_TASK.md`を更新する。

## やらないこと

- embedding、vector DB、外部AI APIを追加しない。
- Realtime API、通話連携、認証、DBを触らない。
- ブラウザUIやAPI routeへ接続しない。
- 検索結果を顧客向けの最終回答として扱わない。

## テスト

```bash
git diff --check
npm test
npm run build
```

## レビュー観点

- Search behavior
- Safety / privacy
- TypeScript / test
- Context hygiene

## 完了条件

- 「返金」で返金ルールが根拠候補として返る。
- 「サービスをやめたい」で解約ルールが根拠候補として返る。
- 「本人確認」「上席確認」系の代表クエリが該当ルールを返す。
- `customerId`指定で該当顧客契約だけを検索できる。
- 必須テストが通る、または実行できない理由が説明されている。
- `CURRENT.md`が現在の状態に更新されている。
- `ACTIVE_TASK.md`が次のタスク状態を示している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
