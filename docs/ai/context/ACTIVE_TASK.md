# アクティブタスクコンテキスト

## タスク

次のタスク: Task 28 `browser-realtime-voice-demo`

現在のPR段階: Local JSON handoff persistence

Task 27 `realtime-token-endpoint-disabled-adapter`、Task 28のServer runtime foundation、Realtime client secret implementation、Browser call controlsは実装済み。Realtime boundaryは`Realtime not configured`を維持しつつ、server-side token endpoint adapter `POST /api/realtime/client-secret`、OpenAI側`/v1/realtime/client_secrets`のserver-only前提、未設定時の`not-configured` / local fallback、ブラウザAPI key拒否を固定している。

Task 28のBusiness-rule grounded operator behaviorも実装済み。選択中callのevidence candidates、業務ルール、架空顧客モック、policy guard、会話プレビュー、Operator noteを短いRealtime instructionsへまとめ、server-side client secret session configへ渡す。

Task 28のCall recording and handoffも実装済み。`End call`後にtranscript、summary、evidence references、policy decision、next actionをhandoff recordとして画面に残す。

このPRでは、Task 28の後続としてLocal JSON handoff persistenceだけを扱う。`/api/realtime/handoffs`でhandoff recordをserver-side local JSONへ保存・取得し、Docker Composeでは`./data:/app/data`に保存する。`.env.local`や実secretはcommitしない。実電話接続、認証、本番DB、外部送信はまだ入れない。

後続計画: `OPENAI_API_KEY`をGit管理外で用意できる場合だけ、実Realtime音声ブラウザ確認を別PR/別検証で扱う。

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
src/realtime-call-recording.ts
src/realtime-session-context.ts
src/realtime-token-endpoint.ts
scripts/serve-static.mjs
docker-compose.yml
src/evidence-bridge.ts
src/evidence-manifest.ts
src/response-policy.ts
src/call-summary.ts
src/fallback-rehearsal.ts
tests/**
docs/ai/security/realtime-api-connection-boundary-safety-audit.md
docs/ai/security/realtime-token-endpoint-contract-safety-audit.md
docs/ai/security/realtime-handoff-local-persistence-safety-audit.md
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
