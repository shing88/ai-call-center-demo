# Draft 04: knowledge loader and chunk model

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## Proposed goal

`knowledge/` 配下のMarkdownを読み込み、見出し単位で検索用chunkへ変換する。

## Suggested executable task name

`Task 04: knowledge-loader-chunk-model`

## Position

Task 03 `knowledge-markdown-baseline` の後。

## Scope

作成候補:

```text
src/knowledge/types.ts
src/knowledge/loadKnowledge.ts
src/knowledge/chunkMarkdown.ts
src/knowledge/__tests__/chunkMarkdown.test.ts
app/api/knowledge/chunks/route.ts
```

## Suggested model

```ts
export type KnowledgeChunk = {
  id: string;
  sourcePath: string;
  documentType: "business_rule" | "customer_contract" | "scenario";
  title: string;
  section: string;
  keywords: string[];
  body: string;
};
```

## Do

- failing test から始める。
- Markdownファイルを安全に読み込む。
- `#` / `##` / `###` 見出し単位でchunk化する。
- `sourcePath`、`section`、`body` を保持する。
- 後続のベクター化に備え、検索実装とは分離する。
- APIでchunk一覧を確認できる最小endpointを作る。

## Do not

- OpenAI APIを呼ばない。
- embeddingを作らない。
- データベースを導入しない。
- 顧客契約の内容をAIに渡す処理はまだ作らない。

## Suggested tests

```bash
npm test -- chunkMarkdown
npm run typecheck
npm run lint
git diff --check
```

## Suggested reviews

- TypeScript / test
- Data modeling
- Context hygiene

## Done when

- `knowledge/` のMarkdownをchunk化できる。
- chunkの型がテストで固定されている。
- `/api/knowledge/chunks` でデバッグ確認できる。
