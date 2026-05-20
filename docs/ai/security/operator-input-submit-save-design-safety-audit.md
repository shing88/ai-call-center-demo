# Operator Input Submit/Save Design Safety Audit

最終更新: 2026-05-20

## Scope

Task 18では、Operator noteのブラウザ内編集状態、送信/保存候補payload、UI上の未送信/未保存表示を扱う。外部送信、永続保存、認証、DB、provider固有SDKは対象外。

## Data sources checked

- キュー項目: callerName、topic、excerpt、status、priority、waitSeconds
- 根拠候補: sourcePath、section、snippet、score
- Operator note: textareaで入力されるブラウザ内テキスト
- 会話プレビューと応答ドラフト: 現在のデモ状態から決定的に生成されるテキスト

## Frontend sinks checked

- `renderApp()`はHTML文字列を生成するため、表示値は`escapeHtml()`を通す。
- Operator noteの値はtextarea本文として描画する前に`escapeHtml()`を通す。
- ブラウザ実行時の編集値は`main.ts`内のメモリにcall id別で保持し、DOMへ再描画するときも`renderApp()`経由でescapeする。

## XSS assessment

Operator noteはraw textとしてpayloadへ保持し、UI表示時にescapeする。追加テストで`<script>`を含む編集済みOperator noteがHTMLとして実行可能な形で出力されないことを固定した。

## N+1 baseline

DBやサーバー問い合わせは追加していない。今回の変更はブラウザ内メモリ、HTML描画、TypeScriptのpayload生成だけで完結する。

## Permission / visibility policy

新しい権限境界や候補取得は追加していない。既存のデモ用キュー項目と生成済みmanifestの範囲だけを扱う。

## File preview policy

ファイルプレビューは追加していない。

## Tests added

- call id別のOperator note分離
- 編集済みOperator noteのHTML escape
- browser-only submit/save candidate payload
- `AiResponseRequest`への編集済みOperator noteとguardrail境界の反映

## Unresolved risks

- 状態はブラウザ内メモリだけで、リロードすると失われる。
- 本格的な保存や外部送信を追加する前に、認証、永続化、監査ログ、本人確認policyを別タスクで決める必要がある。

## Follow-ups

- Task 19で、本人確認前に回答できる範囲、上席確認条件、回答不可条件を決定的なpolicy guardとして固定する。
