# Realtime API Connection Boundary Safety Audit

最終更新: 2026-05-20

## Scope

Task 25 `realtime-api-connection-boundary`で追加したRealtime未接続境界を対象にする。対象は静的TypeScriptデモ上の状態表示、型、テスト、安全説明であり、実Realtime session、マイク取得、外部音声送信、tool calling、実電話、DB保存、認証、本番接続は追加しない。

## Official docs checked

- OpenAI Realtime WebRTC guide: https://platform.openai.com/docs/guides/realtime-webrtc
- OpenAI Realtime session / client secret reference: https://platform.openai.com/docs/api-reference/realtime-sessions/create

確認日: 2026-05-20。

確認した設計前提:

- ブラウザでRealtimeを使う場合はWebRTCを使い、サーバー側で発行した短命のephemeral client secretを使う。
- 標準API keyはブラウザbundleへ入れない。
- client secret、マイク許可、音声送信、tool calling、本番接続は、それぞれ明示的な境界とテストが固まるまで有効化しない。

## Data sources checked

- `RealtimeConnectionBoundary`: status、statusText、operatorMessage、tokenEndpointConfigured、ephemeralClientSecretAvailable、microphonePermissionState、guardrails、blockedReasons、requirements、officialDocs。
- `DemoState.realtimeConnection`: UIへ注入可能な境界状態。
- 実API key、実token、音声データ、会話録音、実顧客情報はデータ源として追加していない。

## Frontend sinks checked

- `renderRealtimeConnectionBoundary()`はHTML文字列を組み立てるが、可変文字列は`escapeHtml()`を通す。
- `data-*`属性は固定false値、status、日付のみ。標準API keyやclient secretを出力しない。
- raw HTML、Markdown preview、外部コンテンツ埋め込みは追加していない。

## XSS assessment

Realtime境界は固定のローカル状態が中心で、ユーザー生成HTMLを増やしていない。既存の`renderApp` escapeテストに加え、Realtime境界の表示テストでAPI keyらしき文字列、connected表現、送信/保存有効化が出ないことを固定した。

## N+1 baseline

状態モデルと静的UIのみの変更。DB、fetch、manifest取得、検索回数は増やしていないため、N+1リスクは該当なし。

## Permission / visibility policy

マイク権限は`not-requested`が初期値。Task 25ではブラウザに権限要求を出さず、実音声送信も行わない。将来マイク許可を扱う場合は、ephemeral client secret取得、明示的なユーザー操作、保存なし、送信境界を別タスクで固定する。

## File preview policy

ファイルプレビュー、添付、HTML previewは追加していない。

## Tests added

- `tests/realtime-connection.test.ts`
  - defaultが`Realtime not configured`で、標準API key、マイク取得、外部音声送信、保存、実電話、tool callingを許可しないこと。
  - token endpoint、ephemeral client secret、microphone permissionが揃った入力でも、現在のデモではsession startを閉じたままにすること。
- `tests/app.test.ts`
  - `Realtime boundary`がCall workspaceの後、Call summaryの前に表示されること。
  - `Realtime not configured`、server-minted ephemeral client secret、mic未要求、data guardrailが表示されること。
  - `OPENAI_API_KEY`、`sk-`形式、`Realtime connected`が出ないこと。

## Unresolved risks

- 実Realtime接続は未実装。client secret発行エンドポイント、CORS、認証、rate limit、ログ、マイク許可、WebRTC session開始はまだ設計対象外。
- 公式Docsは変わり得るため、次のRealtime実装タスクでも実装前に最新Docsを再確認する。

## Follow-ups

- Task 26で、標準API keyをサーバー側に閉じ込めるephemeral token endpoint contractを作る。
- その後、明示的なユーザー操作を入口にしたWebRTC session開始、マイク許可、接続失敗fallbackを別PRで扱う。
