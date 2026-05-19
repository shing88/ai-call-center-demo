# タスク 08: evidence-manifest-build

## ゴール

`EvidenceBundle`をブラウザUIへ動的に渡す前段として、build時にdemo queue向けの根拠候補manifestを生成し、ブラウザがそのmanifestを読み込んでAssistant handoffへ表示できるようにする。
このタスクでは外部AI APIやDBを追加せず、既存のMarkdown loader / keyword search / evidence bridgeをbuild時だけ使う。

## 位置づけ

Task 07 `evidence-bundle-ui-preview`の後続。
次の会話フロー接続または問い合わせ選択に応じた動的更新タスクの入力になる。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/08_evidence_manifest_build.md
```

## 必要な場合のみ読む

```text
README.md
package.json
tsconfig.json
tsconfig.test.json
index.html
src/app.ts
src/main.ts
src/evidence-bridge.ts
src/knowledge.ts
src/knowledge-search.ts
src/styles.css
tests/app.test.ts
tests/evidence-bridge.test.ts
scripts/**
docs/ai/tasks/README.md
docs/ai/tasks/_template.md
```

## やること

- コード変更は先に失敗するテストを追加してから行う。
- `demoState.activeQueue`から、各call idに対応する`EvidenceBundle` manifestをbuild時に生成する。
- 生成物は`dist/assets/`配下に置き、ブラウザからfetchできる形にする。
- `src/main.ts`はmanifestを読み込めた場合にAssistant handoffへ渡し、失敗した場合は既存の静的previewへ安全にfallbackする。
- ブラウザ実行時に`loadKnowledgeBase`などNode.jsのfs依存を直接呼ばない。
- 現在状態が変わる場合は`README.md`、`CURRENT.md`、`ACTIVE_TASK.md`を更新する。

## やらないこと

- 外部AI API、通話連携、認証、DBを追加しない。
- 検索ランキングやMarkdown chunkingの大幅な作り直しはしない。
- クリックしたキュー項目に応じた動的切り替えは次タスク以降に分ける。
- 完了済みタスク指示、アーカイブ、レポートを現在仕様として読まない。

## テスト

```bash
git diff --check
npm test
npm run build
```

可能ならChrome extensionでローカル画面を確認する。

## レビュー観点

- API / contract
- Frontend / fallback
- Security / escaping
- Test / TypeScript
- Context hygiene

## 完了条件

- buildでmanifestが生成される。
- manifestの内容が`EvidenceBundle`として検査されている。
- ブラウザ側はmanifest取得成功時に根拠候補を表示し、失敗時もfallback表示できる。
- `npm test`と`npm run build`が通る、または未実行/失敗理由が説明されている。
- `CURRENT.md`が現在状態に合っている。
- `ACTIVE_TASK.md`が次のタスク状態を指している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
