# Browser Call Style UI Safety Audit

最終更新: 2026-05-20

## Scope

Task 24 `browser-call-style-ui`で追加した`Call workspace`表示と、通話風に見せるためのCSS調整を対象にする。対象は静的TypeScriptデモのレビュー画面であり、実電話、Realtime音声、外部AI送信、DB保存、認証、本番接続は追加しない。

## Data sources checked

- `QueueItem`: call id、topic、callerName、excerpt、customerId、serviceArea、servicePlan、verificationStatus。
- `CallSummary`: inquirySummary、policyDecision、operatorNoteStatus、nextAction、evidenceReferences。
- `ResponsePolicyGuard`: allowedResponseScope、outcome、humanReviewRequired、customerSpecificAnswerAllowed。
- すべて架空デモデータまたはローカルで決定的に作った表示用データで、実在顧客情報は追加しない。

## Frontend sinks checked

- `renderCallWorkspace()`はHTML文字列を組み立てるが、表示値は`escapeHtml()`を通して出力する。
- `data-call-workspace-call-id`、`data-phone-connection`、`data-external-send-allowed`、`data-persistence-allowed`は固定境界またはescaped call idのみを出す。
- raw HTML、Markdown preview、リンク自動展開、外部コンテンツ埋め込みは追加していない。

## XSS assessment

既存の`renderApp escapes caller-provided text before rendering HTML`と`renderApp escapes call summary fields before rendering`で、キュー由来文字列と要約由来文字列のescapeを継続確認している。Task 24では`renderApp frames the selected call as a review-only call workspace`を追加し、選択中callの新しい表示経路も`renderApp()`配下で固定した。

## N+1 baseline

DOM表示順とCSSのみの変更で、検索、manifest生成、network adapter、DBアクセスは追加していない。N+1リスクは該当なし。

## Permission / visibility policy

表示対象は既存の選択中`assistantEvidence.callId`に一致する架空キュー項目のみ。実在顧客、認証済み契約情報、サーバー側候補、権限つきデータは追加していない。本人確認前の顧客別回答ブロックは既存の`ResponsePolicyGuard`に従う。

## File preview policy

ファイルプレビュー、添付、HTML previewは追加していない。

## Tests added

- `npm.cmd test`: `renderApp frames the selected call as a review-only call workspace`を追加。
- 追加テストでは、`Call workspace`、`Review mode`、`Phone connection is not connected`、選択中call id、架空顧客ID、主要パネルの順序、送信済み/保存済み/外部AI生成済みを示す文言がないことを確認する。

## Unresolved risks

- 画面は通話風だが、実電話やRealtime音声には接続していない。デモ時は`Phone connection is not connected`と説明する。
- 現在の確認はDOM文字列とbuild後のrender check中心。実ブラウザの詳細なビジュアル回帰は将来のUI変更で追加余地がある。

## Follow-ups

- Realtime API接続に進む場合は、まず公式ドキュメントを確認し、API key、ephemeral token、マイク許可、録音、保存、外部送信の境界を別タスクで安全監査する。
