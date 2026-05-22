# アクティブタスクコンテキスト

## タスク

次のタスク: CCNetコールセンター応対ロール追加

現在のPR段階: Call-center operator role follow-up

Task 27 `realtime-token-endpoint-disabled-adapter`、Task 28のServer runtime foundation、Realtime client secret implementation、Browser call controls、Business-rule grounded operator behavior、Call recording and handoff、Local JSON handoff persistenceは実装・merge済み。

この小PRでは、マージ済みCCNetデモシナリオに共通するコールセンター応対ロールを追加し、次の会話順序を固定する。

- AIは「CCNetコールセンターのAIオペレーターです」と名乗る。
- まず本日の用件を短く聞く。
- 聞いた用件だけを一文で復唱し、個別確認の前に本人確認が必要であることを説明する。
- 既契約者または申込相談者として本人確認・提供エリア確認へ進む。
- 本人確認後に詳細な利用状況、商品選択肢、料金目安、担当者確認事項へ進む。
- シナリオ、架空顧客プロファイル、本人確認用の照合値は内部コンテキストであり、AIが事前に知っているかのように話してはいけない。
- 本人確認の答えはAIから先に読み上げず、足りない情報は質問として聞く。

既存のセキュリティ境界、Realtime接続、サーバー実装、外部送信ブロック、本番DBブロックには手を入れない。

検証済み: `npm.cmd test` 133件成功、`npm.cmd run build`成功、`git diff --check`成功。

この段階では`.env.local`や実secretはcommitしない。実電話接続、認証、本番DB、外部送信はまだ入れない。

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
# 更新メモ (2026-05-22)

- 現在のPR段階: Scenario spotlight and caller verification follow-up。
- 追加対応: シナリオ詳細を中央ペインへ移動し、左のデモシナリオ一覧はカード全体で選択できるUIへ変更した。
- `CALL-CC-04`では、お客役が本人確認で答える契約者氏名、登録住所、登録電話番号、契約者本人からの架電、照合補助を独立表示する。
- 契約者氏名と登録住所はふりがな付きで表示する。
- 全デモシナリオは、挨拶後に用件の大枠を聞き、聞いた内容だけを復唱してから本人確認へ進む流れへ更新した。本人確認用の架空照合値はAIから先に読み上げない。
- 次に確認する場合: `npm.cmd test`、`npm.cmd run build`、`git diff --check`、`docker compose --env-file .env.local up --build -d`、ブラウザで`CALL-CC-04`カード選択。
- 仕様整合修正PR: `CALL-CC-02`を小牧市のCCNet Air設定へ変更し、メッシュWi-Fi 3台目以降550円、300M/30Mを主案内から外すテストを追加する。検証対象は`npm.cmd test`、`npm.cmd run build`、`git diff --check`。
- 応対ロール追加PR: `006_ccnet_call_center_operator_role.md`を追加し、Realtime instructionsとシナリオ画面の期待フローを「名乗り、用件聞き取り、用件復唱、本人確認、詳細確認」へ変更した。AIがシナリオ内部情報を事前に知っているように話すことを禁止するテストを追加した。検証済み: `npm.cmd test` 133件成功、`npm.cmd run build`成功、`git diff --check`成功。
