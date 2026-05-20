# アクティブタスクコンテキスト

## タスク

次のタスク: Task 28 `browser-realtime-voice-demo`

現在のPR段階: Browser call controls

Task 27 `realtime-token-endpoint-disabled-adapter`、Task 28のServer runtime foundation、Realtime client secret implementationは実装済み。Realtime boundaryは`Realtime not configured`を維持しつつ、server-side token endpoint adapter `POST /api/realtime/client-secret`、OpenAI側`/v1/realtime/client_secrets`のserver-only前提、未設定時の`not-configured` / local fallback、ブラウザAPI key拒否を固定している。

このPRでは、Task 28の推奨PR分割のBrowser call controlsだけを扱う。`Start call` / `End call`、connection status、mic permission stateを追加し、`Start call`は短命client secret取得後にだけマイク権限とOpenAI Realtime WebRTC calls endpointへのSDP offerへ進める。未設定や接続失敗時はfallback rehearsalへ戻す。`.env.local`や実secretはcommitしない。業務ルール注入、記録DB、実電話接続はまだ入れない。

後続計画: Task 28の次PRは業務ルールgrounding。Realtime接続後に参照するルール注入を小さく追加し、transcript/summary記録はさらに後続PRへ分割する。

## タスク開始時に必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/28_browser_realtime_voice_demo.md
```

## 必要な場合のみ読む

```text
README.md
package.json
Dockerfile
docker-compose.yml
src/server-runtime.ts
src/app.ts
src/main.ts
src/realtime-connection.ts
src/realtime-call-controls.ts
src/realtime-token-endpoint.ts
src/evidence-bridge.ts
src/evidence-manifest.ts
src/response-policy.ts
src/call-summary.ts
src/fallback-rehearsal.ts
tests/**
docs/ai/security/realtime-api-connection-boundary-safety-audit.md
docs/ai/security/realtime-token-endpoint-contract-safety-audit.md
docs/ai/tests/automated-test-catalog.md
```

## 読まない

```text
docs/ai/archive/**
docs/ai/reports/**
docs/ai/inbox/pro-instructions/**
古い計画
完了済みのタスク指示
```

## 追加ファイルの利用

追加でファイルを読んだ場合は、PRの`Context usage`に記録する。
