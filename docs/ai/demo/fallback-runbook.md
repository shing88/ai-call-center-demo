# Fallback / Rehearsal Runbook

最終更新: 2026-05-20

このrunbookは、役員デモ中に外部AI API、音声、通信が使えない場合でも、現在のローカル決定的境界だけでデモを続けるための手順を示す。

## 前提

- 画面上の`Fallback rehearsal`は、外部AI API接続、Realtime音声、永続保存を使わない。
- `External send`と`Persistent save`は常に`blocked`として扱う。
- 代表シナリオは`src/demo-scenario-regression.ts`の固定済みシナリオを使う。
- Operator noteはブラウザ内の未送信入力として扱い、保存済みとは説明しない。
- 役員デモ全体の説明順は`docs/ai/demo/executive-demo-script.md`を先に見る。

## 進行手順

1. `Executive demo brief`で、fallback / rehearsalがno-send / no-save境界の一部として表示されていることを確認する。
2. `Fallback rehearsal`のstatusを確認する。
3. `Run order`に表示されたcall idとシナリオ名に沿って説明する。
4. 対象シナリオのOperator noteを読み上げる。
5. `Policy guard`のscope、human review、customer-specific answerを確認する。
6. `External send`と`Persistent save`が`blocked`であることを明示する。

## 失敗時の説明

- 外部AI APIが使えない場合: 「本番AI接続は使わず、固定済みシナリオで安全境界を確認します。」
- 音声が使えない場合: 「音声入力は止め、同じシナリオをテキストのOperator noteで進めます。」
- 通信が不安定な場合: 「ローカルに固定した根拠候補とpolicy guardで、送信・保存なしのデモに切り替えます。」

## 禁止事項

- 外部AI APIに送信済みと説明しない。
- 顧客への送信済み、履歴保存済み、DB保存済みと説明しない。
- 補償可否、契約状態、受付状況をpolicy guardに反して断定しない。
