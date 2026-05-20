# Executive Demo Script

最終更新: 2026-05-20

この台本は、役員向けに現在の静的TypeScriptデモを短時間で説明するためのもの。Task 22ではCCNet株式会社の公開HPを確認し、会社に合う架空シナリオとして`docs/ai/demo/ccnet-executive-scenario.md`を使う。外部AI API、Realtime音声、実電話、DB保存、本番接続は使わない。

## 最初に伝えること

1. この画面はローカルで決定的に動くデモであり、外部送信も永続保存も行わない。
2. CCNet向けの設定は公開HPをもとにした架空シナリオであり、実在顧客情報は使っていない。
3. `Executive demo brief`で、今日見る順番を確認する。
4. 10G / Wi-Fiサポート、約款・重要事項説明からの契約確認観点、地域情報チャンネル、call summary、policy guard、no-send / no-save境界を同じcall idで追う。

## 画面説明の順番

1. `Live queue`: どの問い合わせを開いているかを確認する。
2. `Executive demo brief`: CCNet-fit scenario、架空顧客モック、根拠、policy、fallback、安全境界を先に確認する。
3. `Call summary`: 問い合わせ要約、根拠参照、policy判断、Operator note状態、次アクションを確認する。
4. `Fallback rehearsal`: 外部AI API、Realtime音声、通信が使えない場合でも進行できることを示す。
5. `Response draft` / `Conversation preview`: 返答案と会話文脈を見る。
6. `Operator note`: 入力はbrowser-onlyの候補であり、送信済みでも保存済みでもないことを示す。
7. `Policy guard`: scope、human review、customer-specific answerを確認する。
8. `Evidence candidates`: 回答や判断の根拠候補を確認する。

## 安全説明

- `External send blocked`は、顧客や外部providerへ送っていないことを意味する。
- `Persistent save blocked`は、DBや履歴へ保存していないことを意味する。
- `browser state only`は、この画面内の一時状態であり、保存済み記録ではない。
- `Call summary`はローカル決定的な要約であり、LLM生成済みの議事録や保存済み履歴ではない。
- policy guardが`blocked`や`human review required`を出した場合は、画面上のドラフトを最終回答として扱わない。
- 10G提供可否、契約変更日、料金、解約料、工事費残債、初期契約解除の適用可否、障害、補償は、本人確認と設備・契約確認なしに断定しない。

## 言わないこと

- 外部AI APIへ送信済み。
- 顧客へ回答送信済み。
- 会話履歴やOperator noteを保存済み。
- 本番の電話、認証、DB、監視と接続済み。
- policy guardに反して補償可否、返金額、契約状態、受付状態を断定できる。
