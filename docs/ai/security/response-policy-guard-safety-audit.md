# Response Policy Guard Safety Audit

最終更新: 2026-05-20

## Scope

Task 19では、キュー項目、根拠候補、会話プレビュー、Operator noteから、回答範囲、上席確認要否、回答不可の種類を決定的に判定するpolicy guardを追加した。外部送信、永続保存、認証、DB、provider固有SDKは対象外。

## Data sources checked

- キュー項目: callerName、topic、excerpt、status、priority、waitSeconds
- 根拠候補: sourcePath、section、snippet、score
- Conversation preview: customer / assistant / internal message
- Operator note: textareaで入力されるブラウザ内テキスト
- Policy result: outcome、allowedTopics、blockedResponseTypes、reasons、evidenceReferences

## Frontend sinks checked

- `renderApp()`はHTML文字列を生成するため、policy表示値は`escapeHtml()`を通す。
- Policy判定はraw textを分類に使うだけで、HTMLとして解釈しない。
- `AiResponseRequest`と`AiResponseClientResult`はpolicy resultを構造化データとして保持し、送信済み/保存済みとは表現しない。

## XSS assessment

Policy guardは顧客入力やOperator noteを直接HTMLへ挿入しない。UI表示ではpolicyの理由、許可トピック、ブロック対象、根拠参照をescapeする。既存のOperator note escape regressionと、policy panelの送信/保存誤表示防止テストで現在の境界を固定している。

## N+1 baseline

DBやサーバー問い合わせは追加していない。今回の変更はブラウザ内の状態、生成済みmanifest、TypeScriptの決定的判定だけで完結する。

## Permission / visibility policy

新しい候補取得や権限判定は追加していない。policy guardは既存のデモ用キュー項目、生成済み根拠候補、Operator noteだけを入力にする。顧客別回答は本人確認済みのoperator inputがない限り許可しない。

## File preview policy

ファイルプレビューは追加していない。

## Tests added

- 本人確認前の顧客別回答ブロック
- 上席確認シグナルによるhuman review必須化
- 本人確認済みoperator inputでのscoped draft許可
- `AiResponseRequest` / deterministic client / network clientへのpolicy result伝播
- UI上のpolicy guard表示と送信済み/保存済み誤表示防止

## Unresolved risks

- 本人確認済み判定は現時点ではOperator note内の決定的なデモ用テキストシグナルに基づく。
- 本格運用では認証、監査ログ、会話履歴、権限管理、本人確認状態の機械可読なsource of truthが必要。

## Follow-ups

- Task 20で代表シナリオごとに、根拠候補、operator input、policy guard、request/client境界の期待結果を固定する。
