# アクティブタスクコンテキスト

## タスク

次のタスク: Task 28 `browser-realtime-voice-demo`

現在のPR段階: Realtime client secret implementation

Task 27 `realtime-token-endpoint-disabled-adapter`と、Task 28の1段階目Server runtime foundationは実装済み。Realtime boundaryは`Realtime not configured`を維持しつつ、server-side token endpoint adapter `POST /api/realtime/client-secret`、OpenAI側`/v1/realtime/client_secrets`のserver-only前提、未設定時の`not-configured` / local fallback、ブラウザAPI key拒否、マイク未要求、外部音声送信blocked、session start disabledを固定している。

このPRでは、Task 28の推奨PR分割の2段階目だけを扱う。`OPENAI_API_KEY`をserver-side環境変数として読み、未設定時はdeterministicな`not-configured` fallbackを維持し、設定時だけserver-sideからOpenAIの`/v1/realtime/client_secrets`へrequestしてbrowserへephemeral client secretを返す。`.env.local`や実secretはcommitしない。WebRTC接続、マイク権限、Start call UI、業務ルール注入、記録DBはまだ入れない。

後続計画: Task 28の次PRはBrowser call controls。`Start call` / `End call` / connection status / mic permission stateを追加し、Realtime WebRTC接続の開始・終了へ進める。接続失敗時はfallback rehearsalへ戻せる表示にする。

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
