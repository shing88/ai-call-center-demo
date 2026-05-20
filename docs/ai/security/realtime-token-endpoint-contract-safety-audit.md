# Realtime Token Endpoint Contract Safety Audit

最終更新: 2026-05-20

## Scope

Task 26 `realtime-token-endpoint-contract`で追加したRealtime token endpoint contractを対象にする。対象は静的TypeScriptデモ上の契約モデル、未接続UIへの表示、テスト、安全説明であり、実OpenAI API key、実client secret、実network呼び出し、DB、認証、本番電話接続、マイク取得、Realtime session開始、tool callingは追加しない。

## Official docs checked

- OpenAI Realtime WebRTC guide: https://platform.openai.com/docs/guides/realtime-webrtc
- OpenAI Realtime client secrets API reference: https://developers.openai.com/api/reference/resources/realtime/subresources/client_secrets/methods/create

確認日: 2026-05-20。

確認した設計前提:

- ブラウザからRealtimeへ進む場合でも、標準API keyは開発者側サーバーに閉じ込める。
- ephemeral client secretは開発者側サーバーがOpenAI REST APIへserver-side requestして発行する。
- current API referenceのclient secret responseは`value`、`expires_at`、`session`を返す。
- サーバー側requestでは`OpenAI-Safety-Identifier`をtrusted backend側で付与できる。ブラウザから直接標準API keyやsafety identifierを送らせない。

## Data sources checked

- `RealtimeTokenEndpointContract`: localEndpoint、upstreamClientSecretRequest、requestBody、responseBody、enablement、officialDocs。
- `RealtimeConnectionBoundary.tokenEndpointContract`: Realtime未接続境界へ表示するcontract-only情報。
- 実API key、実token、`.env`値、音声データ、録音、実顧客情報はデータ源として追加していない。

## Frontend sinks checked

- `renderRealtimeConnectionBoundary()`はcontract pathを`escapeHtml()`してHTMLと`data-token-endpoint-contract-path`へ出す。
- 表示するのは`POST /api/realtime/client-secret / contract only`だけで、標準API key、実client secret、Bearer header、`.env`参照は出力しない。
- raw HTML、Markdown preview、外部コンテンツ埋め込みは追加していない。

## XSS assessment

contractは固定のローカル設定で、ユーザー生成HTMLを増やしていない。表示値はescape済み。`tests/app.test.ts`でcontract path表示と、`OPENAI_API_KEY`、`sk-`、`ek_`形式の非表示を固定した。

## N+1 baseline

状態モデルと静的UIのみの変更。DB、fetch、manifest取得、検索回数は増やしていないため、N+1リスクは該当なし。

## Permission / visibility policy

Task 26では認証を実装しない。contractでは`operatorSessionRequired: true`を定義するが、実operator session検証、CORS、rate limit、ログ、server secret storeは次以降の実装対象として閉じたままにする。

## File preview policy

ファイルプレビュー、添付、HTML previewは追加していない。

## Tests added

- `tests/realtime-token-endpoint.test.ts`
  - token endpoint contractがserver-only client secret発行の前提、`POST /api/realtime/client-secret`、OpenAI側`/v1/realtime/client_secrets`、response fields `value` / `expires_at` / `session`を定義すること。
  - Realtime session start、マイク許可、外部音声送信、保存、実電話、tool callingを全てdisabledのままにすること。
  - compiled browser-facing moduleに`OPENAI_API_KEY`、`process.env`、`import.meta.env`、`.env`、`sk-`、`ek_`、Bearer secretらしき値が入らないこと。
- `tests/realtime-connection.test.ts`
  - Realtime未接続境界がcontract-only token endpointを持つが、server implementationは未設定のままであること。
- `tests/app.test.ts`
  - UIにcontract-only pathが出る一方、実secretらしき値やconnected表現が出ないこと。

## Unresolved risks

- 実server endpointは未実装。operator session検証、CSRF/CORS、rate limit、secret store、ログマスキング、OpenAI request、失敗時fallbackはまだ実装しない。
- 実Realtime session、マイク取得、音声送信、tool calling、本番電話接続は未実装。
- 公式Docsは変わり得るため、次のRealtime実装タスクでも実装前に最新Docsを再確認する。

## Follow-ups

- Task 27で、contractを使うdisabled adapterを追加し、未設定時のserver-side validationとfallback responseを実装する。
- 実OpenAI requestを入れる場合は、別PRでserver-only secret loading、ログマスキング、CORS、rate limit、operator session検証を先に固定する。
