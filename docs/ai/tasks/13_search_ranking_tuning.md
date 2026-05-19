# Task 13: search-ranking-tuning

## Goal

Knowledge検索のランキングを小さく改善し、キュー本文に近い根拠候補が上に来るようにする。

このタスクでは検索エンジンの全面刷新や外部AI API連携は行わず、既存のkeyword searchのスコアリングとテストをPRサイズで調整する。

## Position

Task 12 `conversation-input-preview`の直後のタスク。

## Must read

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/13_search_ranking_tuning.md
```

## Read only if needed

```text
README.md
package.json
package-lock.json
src/knowledge.ts
src/knowledge-search.ts
src/evidence-bridge.ts
src/evidence-manifest-builder.ts
tests/knowledge-search.test.ts
tests/evidence-bridge.test.ts
tests/evidence-manifest.test.ts
knowledge/**
```

## Do not read

```text
docs/ai/archive/**
docs/ai/reports/**
old plans
completed task instructions
```

## Do

- コード変更前に、ランキング改善を表す失敗テストを追加する。
- 既存のkeyword search APIを保ったまま、スコアリングを小さく改善する。
- タイトル、section、本文、連続語句、顧客絞り込みなど、既存データで説明できる要素だけを使う。
- `matchedTerms`、`score`、既存fallbackの意味を壊さない。
- rankingの挙動変更を`CURRENT.md`とREADMEへ反映する。

## Do not

- 外部AI API、embedding、vector DB、LLM rerankingを追加しない。
- knowledge本文を大きく書き換えない。
- UI、送信/保存、認証、DB、通話連携を変更しない。
- archive / reports / 完了済みタスク指示を現在仕様として読まない。

## Tests

```bash
git diff --check
npm test
npm run build
```

PowerShellで`npm.ps1`がブロックされる場合は、同等の`npm.cmd test` / `npm.cmd run build`を使う。

## Reviews

- Search / ranking
- API / contract
- Security / safety
- Test / TypeScript
- Context hygiene

## Done when

- キュー本文に近い根拠候補が安定して上位に来るテストがある。
- 既存の検索APIとmanifest生成が通る。
- 必要なテストが通る、または未実行理由が説明されている。
- `CURRENT.md`が現在状態だけに更新されている。
- `ACTIVE_TASK.md`が次のタスクを指している。
- PR本文に`Context usage` / `Summary` / `Tests` / `Reviews` / `Known limitations` / `Context handoff`が含まれている。
