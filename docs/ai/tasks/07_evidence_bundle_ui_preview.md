# タスク 07: evidence-bundle-ui-preview

## ゴール

Task 06で作った`EvidenceBundle`の結果を、デモ画面のAssistant handoffに表示できるようにする。
このタスクではブラウザUIに静的な根拠候補を渡す表示契約を追加し、Node.js側のMarkdown loader / searchをブラウザ実行時へ直接持ち込まない。

## 位置づけ

Task 06 `evidence-bridge`の後続。
次の会話フロー接続または検索結果の動的更新タスクの入力になる。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/07_evidence_bundle_ui_preview.md
```

## 必要な場合のみ読む

```text
README.md
package.json
src/app.ts
src/main.ts
src/styles.css
src/evidence-bridge.ts
src/knowledge-search.ts
tests/app.test.ts
tests/evidence-bridge.test.ts
docs/ai/tasks/README.md
docs/ai/tasks/_template.md
```

## やること

- コード変更は先に失敗するテストを追加してから行う。
- `DemoState`に、Assistant handoffで表示する根拠候補の小さな表示用データを追加する。
- `renderApp`で根拠候補の件数、出典、section、snippetを安全にescapeして表示する。
- 根拠候補が空の状態でも画面が崩れない表示にする。
- CSSは既存の業務画面トーンに合わせ、カードの入れ子や大きな装飾を避ける。
- 現在状態が変わる場合は`README.md`、`CURRENT.md`、`ACTIVE_TASK.md`を更新する。

## やらないこと

- 外部AI API、通話連携、認証、DBを追加しない。
- ブラウザ実行時に`loadKnowledgeBase`などNode.jsのfs依存を呼ばない。
- 検索ランキングや`EvidenceBundle`生成ロジックを作り直さない。
- 完了済みタスク指示、アーカイブ、レポートを現在仕様として読まない。

## テスト

```bash
git diff --check
npm test
npm run build
```

可能ならローカル表示もブラウザで確認する。

## レビュー観点

- Frontend / accessibility
- Security / escaping
- API / contract
- Test / TypeScript
- Context hygiene

## 完了条件

- Assistant handoffに根拠候補が表示される。
- 表示文字列がHTML escapeされることをテストで確認している。
- 根拠候補なしの状態もテストで確認している。
- `npm test`と`npm run build`が通る、または未実行/失敗理由が説明されている。
- `CURRENT.md`が現在状態に合っている。
- `ACTIVE_TASK.md`が次のタスク状態を指している。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
