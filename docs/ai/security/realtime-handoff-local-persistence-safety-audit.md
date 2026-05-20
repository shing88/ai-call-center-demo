# Realtime Handoff Local Persistence Safety Audit

## Scope

Task 28のCall recording and handoff後続として、Realtime handoff recordをserver-side local JSONへ保存・取得する最小実装を対象にする。

対象は`/api/realtime/handoffs`、`src/realtime-call-recording.ts`のvalidation / save / load helper、`src/main.ts`のEnd call後saveと初期表示load、Docker Composeの`./data:/app/data` mount。

対象外は実電話接続、認証、本番DB、CRM保存、外部送信、実顧客データ、OpenAI API keyの保存。

## Data sources checked

- Realtime transcript text
- Call summary
- Evidence references
- Policy decision
- Next action
- Handoff record guardrails

これらはデモ用の架空データとブラウザで生成した通話handoff recordだけを扱う。標準API key、短命client secret、browser-supplied credentialは保存対象にしない。

## Frontend sinks checked

- `src/app.ts`はhandoff recordをHTML stringへ描画するが、transcript、summary、evidence references、policy decision、next actionは既存の`escapeHtml`を通す。
- `src/main.ts`は保存済みrecordを`renderApp`へ渡すだけで、DOMへ直接`innerHTML`を追加しない。

## XSS assessment

Transcriptはユーザー発話やAI発話を含むため、HTMLとして信頼しない。UIテストでhandoff transcriptのHTML escapeを固定済み。

`POST /api/realtime/handoffs`はrecord shapeを検証し、文字列長と配列数を制限する。保存済みJSONを返す場合もUI側でescapeする。

## N+1 baseline

DBクエリはない。local JSON fileを1回読み、保存時は最大100件へtrimして1回書く。`GET`は最大20件を返す。

## Permission / visibility policy

現時点では認証ユーザーや本番顧客データを扱わないローカルデモ。`callId`でfilterできるが、server-side visibility modelはまだない。実顧客データやmulti-user運用へ広げる前に、認証・tenant境界・閲覧権限を別PRで定義する。

## File preview policy

ファイルpreviewはない。JSON store pathはserver-side processからのみ使い、静的配信対象ではない。

## Tests added

- `tests/server-runtime.test.ts`: local JSONへ保存したhandoff recordをserver restart相当で再読み込みできること。
- `tests/server-runtime.test.ts`: credential-like valueを含むhandoff recordをrejectし、secret-like textをresponseへechoしないこと。

## Unresolved risks

- `./data/realtime-handoffs.json`はローカルデモ用で、暗号化や認証付きアクセス制御はない。
- Docker Composeのbind mountを使うため、host filesystem権限に依存する。
- 現時点の保存recordは架空データ前提。実顧客データを入れる運用にはしない。

## Follow-ups

- 実顧客データや複数ユーザーを扱う場合は、local JSONではなく認証済みserver-side storeとvisibility policyを定義する。
- 保存済みrecordの削除・retention UIが必要になったら、別PRで小さく追加する。
