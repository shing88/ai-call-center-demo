# Call Summary Generation Safety Audit

最終更新: 2026-05-20

## Scope

Task 23で、選択中問い合わせ、根拠候補、会話プレビュー、Operator note、policy guardから、ローカル決定的なCall summaryを作って画面に表示する。外部AI API、LLM生成、DB保存、実電話接続は追加しない。

## Data sources checked

- `QueueItem`: callerName、topic、excerpt、架空customerId、serviceArea、servicePlan、verificationStatus。
- `AssistantEvidence`: query、sourcePath、section、snippet、score。
- `ConversationThreadPreview`: customer / assistant / internal message。
- `AssistantInputPreview`: browser-onlyのOperator note candidate。
- `ResponsePolicyGuard`: outcome、allowed scope、human review、reasons、evidence references。

## Frontend sinks checked

- `renderCallSummary`はHTML文字列を組み立てるが、すべて`escapeHtml`を通して出力する。
- raw HTML、Markdown preview、リンク自動展開、外部コンテンツ埋め込みは追加していない。

## XSS assessment

Call summaryはユーザー由来に近い問い合わせ文、Operator note、根拠snippetを扱うため、`tests/app.test.ts`で危険文字列がHTMLとして挿入されないことを固定した。

## Permission / visibility policy

Call summaryは既に画面上で選択されているcall idと根拠候補だけを要約する。本人確認前はpolicy guardの判断を保持し、契約状態、料金、提供可否、補償可否を断定しない。

## File preview policy

ファイルプレビューや添付表示は追加していない。

## Tests added

- `tests/call-summary.test.ts`: 決定的な問い合わせ要約、根拠参照、policy判断、Operator note状態、次アクション、no-send/no-save guardrail。
- `tests/app.test.ts`: Assistant handoff内のCall summary表示順、主要表示、HTML escaping。

## Unresolved risks

将来、Call summaryを永続保存、外部AI API、通話履歴、CRM、顧客DBへ接続する場合は、認証、権限、PIIマスキング、監査ログ、保存期間を別タスクで設計する。
