# アクティブタスクコンテキスト

## タスク

次のタスク: Task 28 `browser-realtime-voice-demo`

現在のPR段階: Server runtime foundation

Task 27 `realtime-token-endpoint-disabled-adapter`は実装済み。Realtime boundaryは`Realtime not configured`を維持しつつ、contract-only token endpoint `POST /api/realtime/client-secret`、OpenAI側`/v1/realtime/client_secrets`のserver-only前提、disabled adapterの`not-configured` / local fallback、ブラウザAPI key拒否、マイク未要求、外部音声送信blocked、session start disabledを固定している。

このPRでは、Task 28の推奨PR分割の1段階目だけを扱う。静的配信を維持しつつNode server runtimeを追加し、`GET /api/health`と`POST /api/realtime/client-secret`のdisabled/fallback responseをDocker起動パスでも提供する。実OpenAI API key、実network呼び出し、WebRTC接続、マイク権限、Start call UIはまだ入れない。

後続計画: Task 28の次PRはRealtime client secret implementation。`OPENAI_API_KEY`未設定時はdeterministicな`not-configured` responseを維持し、設定時だけserver-sideからOpenAIの`/v1/realtime/client_secrets`へrequestしてbrowserへephemeral client secretを返す。

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
