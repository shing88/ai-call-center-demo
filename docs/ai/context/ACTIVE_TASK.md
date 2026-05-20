# アクティブタスクコンテキスト

## タスク

次のタスク: Task 28 `browser-realtime-voice-demo`

状態: Task 27 `realtime-token-endpoint-disabled-adapter`実装済み。Realtime boundaryは`Realtime not configured`を維持しつつ、contract-only token endpoint `POST /api/realtime/client-secret`、OpenAI側`/v1/realtime/client_secrets`のserver-only前提、disabled adapterの`not-configured` / local fallback、ブラウザAPI key拒否、マイク未要求、外部音声送信blocked、session start disabledを固定している。実OpenAI API keyや実network呼び出しはまだ入れていない。次はTask 28の計画に従い、ブラウザ音声デモを小さなPR列へ分割して進める。

別枠: `codex/two-angle-review`では通常の次Taskを進めず、Docker化、デモ担当者向けREADME更新、manifest validation堅牢化だけを実施した。

後続計画: Task 28 `browser-realtime-voice-demo`は、電話番号/SIP/Twilioは使わず、画面の`Start call`からヘッドセットでAIオペレータと会話し、業務ルールに基づく回答と通話記録を残す完成形へ段階的に進める。1PRで全部入れず、推奨PR分割の1段階だけを実装する。

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
