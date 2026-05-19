# Task 09: queue-evidence-selection

## ゴール

キュー項目を選択したときに、Assistant handoffの根拠候補をbuild済みmanifest内の該当call idへ切り替える。

このタスクでは、ブラウザ実行時に外部AI APIやDBへ接続せず、Task 08で生成した`dist/assets/evidence-bundles.json`を使う。

## 位置づけ

Task 08 `evidence-manifest-build`の直後のタスク。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/09_queue_evidence_selection.md
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

- コード変更前に、キュー選択状態とmanifest選択のテストを追加または更新する。
- キュー項目の「開く」操作で選択call idが分かるDOM属性を持たせる。
- 選択中のキュー項目がUI上で分かる状態にする。
- `src/main.ts`でmanifestを読み込み、キュー選択時に該当bundleをAssistant handoffへ反映する。
- manifest取得失敗または該当bundleなしの場合は既存fallbackを維持する。
- 変更後の現状を`CURRENT.md`と`ACTIVE_TASK.md`へ反映する。

## やらないこと

- 会話フロー、AI応答生成、外部AI API連携は実装しない。
- 認証、DB、通話連携は追加しない。
- ランキングロジックやknowledge本文そのものを大きく変更しない。
- archive / reports / 完了済みタスク指示を現在仕様として読まない。

## テスト

```bash
git diff --check
npm test
npm run build
```

可能なら、build後にローカル配信してブラウザで次を確認する。

- 初期表示でmanifest由来の根拠候補が表示される
- 別のキュー項目を開くとcall idと根拠候補が切り替わる
- 選択中のキュー項目が視覚的に分かる

## レビュー観点

- Frontend
- Test / TypeScript
- Context hygiene

## 完了条件

- キュー項目選択でAssistant handoffのmanifest根拠候補が切り替わる。
- 失敗時fallbackが維持される。
- 必要なテストが通る、または未実行理由が説明されている。
- `CURRENT.md`が現在状態だけに更新されている。
- `ACTIVE_TASK.md`が次のタスクを指している。
- PR本文に`Context usage` / `Summary` / `Tests` / `Reviews` / `Known limitations` / `Context handoff`が含まれている。
