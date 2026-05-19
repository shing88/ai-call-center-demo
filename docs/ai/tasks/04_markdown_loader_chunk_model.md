# タスク 04: Markdown loader / chunk model

## ゴール

`knowledge/`配下のデモMarkdownをNode.js側で読み込み、後続の検索やAI応答接続で使える最小の`KnowledgeDocument` / `KnowledgeChunk`モデルへ変換する。

このタスクでは、UI接続、embedding、外部AI API、DB、検索ランキングは実装しない。

## 位置づけ

Task 03 `knowledge-markdown-baseline`の後続タスク。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/04_markdown_loader_chunk_model.md
```

## 必要な場合のみ読む

```text
package.json
tsconfig.json
tsconfig.test.json
src/**
tests/**
knowledge/README.md
knowledge/business_rules/**
knowledge/customer_contracts/**
knowledge/scenarios/**
docs/ai/tasks/README.md
docs/ai/tasks/_template.md
```

## やること

- 実装前に現在のブランチと差分を確認する。
- `knowledge/`の既存Markdownを読み込むloaderを追加する。
- `#`と`##`見出しを使い、安定したID、カテゴリ、相対パス、見出しパス、本文を持つchunkモデルを作る。
- Markdown構造が壊れた場合にテストで検知できるようにする。
- 挙動が変わった現在状態を`CURRENT.md`と`ACTIVE_TASK.md`へ反映する。

## やらないこと

- UIへknowledgeを表示しない。
- 外部AI API、embedding、vector store、DB、認証、通話連携を追加しない。
- Task 03以前の完了済み指示、archive、reportsを現在仕様として読まない。
- knowledge本文を大きく書き換えない。

## テスト

```bash
git diff --check
npm test
npm run build
```

Windows PowerShellで`npm.ps1`が実行ポリシーに阻まれる場合は`npm.cmd`を使う。

## レビュー観点

- TypeScript / model boundary
- Test coverage
- Context hygiene

## 完了条件

- loaderとchunkモデルがTypeScriptで実装され、既存knowledge baselineを読み込める。
- heading-based chunk化のテストが追加されている。
- 必須テストが通る、または未実行の理由が説明されている。
- `CURRENT.md`が現在状態を反映している。
- `ACTIVE_TASK.md`が次のタスク状態を示している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
