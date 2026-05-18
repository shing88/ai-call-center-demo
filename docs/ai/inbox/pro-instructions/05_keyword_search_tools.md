# Draft 05: keyword search tools

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## Proposed goal

ベクター検索なしで、業務ルールと顧客契約を検索するキーワード検索toolを作る。

## Suggested executable task name

`Task 05: keyword-search-tools`

## Position

Task 04 `knowledge-loader-chunk-model` の後。

## Scope

作成候補:

```text
src/knowledge/searchKnowledge.ts
src/knowledge/synonyms.ts
src/knowledge/__tests__/searchKnowledge.test.ts
app/api/knowledge/search-rules/route.ts
app/api/knowledge/search-contracts/route.ts
```

## Do

- `KnowledgeChunk` を入力にして検索する純粋関数を作る。
- 同義語辞書を作る。
- 顧客契約検索は `customerId` で対象を絞れるようにする。
- 検索結果には `sourcePath`、`section`、`snippet`、`score` を含める。
- 返金、解約、本人確認、上席確認の代表クエリをテストする。

## Do not

- embeddingやvector DBを導入しない。
- 検索結果をそのまま顧客向け回答にしない。
- Realtime APIを触らない。

## Suggested tests

```bash
npm test -- searchKnowledge
npm run typecheck
npm run lint
git diff --check
```

## Suggested reviews

- Search behavior
- Safety / privacy
- TypeScript / test

## Done when

- 「返金」で返金ルールが返る。
- 「サービスをやめたい」で解約ルールが返る。
- 顧客ID指定で該当顧客契約だけ検索できる。
- sourcePath / section / snippet / score が返る。
