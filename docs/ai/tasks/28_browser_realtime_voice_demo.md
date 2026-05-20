# Task 28: browser-realtime-voice-demo

## ゴール

電話番号・SIP・Twilioを使わず、ヘッドセットを付けた人が画面上の`Start call`を押すとAIオペレータと音声会話できるデモ完成形へ進む。AIオペレータは`knowledge/`の業務ルール、架空顧客モック、デモシナリオに基づいて回答し、`End call`後にtranscript、summary、根拠、次アクションを記録として画面に残す。

このTaskは完成形を1PRで全部入れる指示ではない。Task 27のdisabled adapter完了後に、ブラウザ音声デモを小さなPR列へ分割して進めるための実行可能な計画を保存する。

## 位置づけ

Task 27 `realtime-token-endpoint-disabled-adapter`の後続。Task 27で未設定時のserver-side adapter / fallback responseを決定的に扱えるようにした後、Task 28以降で実OpenAI Realtime接続、ブラウザ通話UI、業務ルール注入、記録を段階的に追加する。

## 必ず読む

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

## 完成形

- Dockerで起動できる。
- `OPENAI_API_KEY`がない場合でも、現在の静的/fallbackデモとして壊れない。
- `OPENAI_API_KEY`がserver-side環境変数として設定されている場合だけ、`Start call`が実Realtime音声デモを開始できる。
- ブラウザは標準API keyを持たず、server-side token endpointから短命client secretだけを受け取る。
- ヘッドセットのマイク/スピーカーで、AIオペレータと音声会話できる。
- AIオペレータは選択中callの業務ルール、架空顧客モック、根拠候補、policy guardに基づいて回答する。
- 本人確認前、上席確認、契約状態・料金・補償などの顧客別断定が必要な内容は、AIだけで確定回答しない。
- `End call`後にtranscript、summary、evidence references、policy decision、next actionが画面に残る。

## 推奨PR分割

1. Server runtime foundation
   - 静的配信を維持しつつ、Node server runtimeを追加する。
   - `/api/health`と`/api/realtime/client-secret`のdisabled/fallback responseを提供する。
   - Dockerはこのserver runtimeを起動する。

2. Realtime client secret implementation
   - `OPENAI_API_KEY`をserver-side環境変数として読む。
   - `OPENAI_API_KEY`未設定時はdeterministicなnot-configured responseを返す。
   - 設定時だけOpenAIの`/v1/realtime/client_secrets`へserver-side requestし、browserへephemeral client secretを返す。
   - `.env.local`や実secretはcommitしない。

3. Browser call controls
   - `Start call` / `End call` / connection status / mic permission stateを追加する。
   - Realtime WebRTC接続を開始・終了できるようにする。
   - 接続失敗時はfallback rehearsalへ戻せる表示にする。

4. Business-rule grounded operator behavior
   - 選択中callのevidence candidates、業務ルール、架空顧客モック、policy guardをAIオペレータのinstructions/session contextへ渡す。
   - 根拠外の断定を避け、本人確認前は一般案内または人への引き継ぎに留める。
   - 代表シナリオで回答方針をテストする。

5. Call recording and handoff
   - transcript、summary、evidence references、policy decision、next actionを記録する。
   - 最初はbrowser stateまたはlocal JSON/SQLiteの最小実装でよい。
   - Docker再起動後も残す必要がある場合だけSQLite永続化を追加する。

## API key / secret方針

- 標準OpenAI API keyをbrowser bundle、HTML、manifest、localStorage、sessionStorage、ログ、Git管理ファイルに入れない。
- `OPENAI_API_KEY`はserver-side processの環境変数だけで扱う。
- Docker起動では`.env.local`などのGit管理外ファイルを使う。

```bash
docker compose --env-file .env.local up --build
```

```env
OPENAI_API_KEY=...
REALTIME_MODEL=gpt-realtime-2
```

- `.env.local`はcommitしない。
- デモ用OpenAI Project / API keyを分け、デモ後にrotateできる運用にする。
- Realtime browser接続では、server-side token endpointが短命client secretを発行し、browserはその短命secretだけを使う。

## やること

- 実装前にOpenAI Realtime / client secretの公式Docsを再確認し、PR本文の`Context usage`に記録する。
- 1PRにつき、上記の推奨PR分割のうち1段階だけを実装する。
- コード変更時は、先に失敗するテストまたは契約テストを追加する。
- Docker起動、API key未設定fallback、API key設定時の挙動をREADMEへ反映する。
- behaviorが変わる場合は`CURRENT.md` / `ACTIVE_TASK.md` / test catalogを更新する。

## やらないこと

- 電話番号、SIP、Twilio、Amazon Connectなどの実電話接続を追加しない。
- API keyをbrowserへ渡さない。
- 実顧客データ、実契約データ、実電話番号を使わない。
- 業務ルール検索、Realtime接続、記録DB、UI全面改修を1PRに混ぜない。
- Task 27のdisabled adapterが未完了のまま、実Realtime接続へ飛ばない。

## テスト

```bash
npm test
npm run build
docker compose up --build
git diff --check
```

Windows PowerShellでは`npm.cmd test` / `npm.cmd run build`を使ってよい。

Realtime実接続を入れたPRでは、追加で次を確認する。

```text
OPENAI_API_KEYなし: Realtime not configured / fallback表示になる
OPENAI_API_KEYあり: Start callで接続でき、End callで記録が残る
browser bundle: OPENAI_API_KEY、sk-、Bearer secret、.env値が含まれない
```

## レビュー観点

- Demo UX / operator flow
- OpenAI Realtime docs freshness
- API key / browser exposure
- Realtime connection lifecycle
- Knowledge grounding / policy guard
- Transcript / summary / record correctness
- Docker / README usability
- Test / TypeScript
- Context hygiene

## 完了条件

- このTaskを実装する各PRが、推奨PR分割の1段階だけを完了している。
- Dockerで起動できる状態を維持している。
- API key未設定時にデモが壊れない。
- API keyや短命client secretがbrowser bundleやGit管理ファイルに露出しない。
- `npm test`、`npm run build`、`git diff --check`が通っている。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Known limitations` / `Context handoff`が含まれている。
