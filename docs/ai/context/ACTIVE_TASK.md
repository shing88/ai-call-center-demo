# アクティブタスクコンテキスト

## タスク

次のタスク: CCNetシナリオ公開仕様整合修正

現在のPR段階: Scenario consistency follow-up

Task 27 `realtime-token-endpoint-disabled-adapter`、Task 28のServer runtime foundation、Realtime client secret implementation、Browser call controls、Business-rule grounded operator behavior、Call recording and handoff、Local JSON handoff persistenceは実装・merge済み。

この小PRでは、マージ済みCCNetデモシナリオを公開仕様に再照合し、次の不整合だけを修正する。

- `CALL-CC-02`のCCNet Air利用エリアを、公開ページで対応エリアとして確認できる小牧市へ寄せる。
- `customer_ccnet_2001`のメッシュWi-Fi 3台目以降料金を550円へ修正する。
- 戸建て向け現行料金ページで前面に出ていない300M/30Mを主選択肢から外し、担当者確認が必要な旧/一部条件コースとして扱う。

既存のセキュリティ境界、Realtime接続、サーバー実装、外部送信ブロック、本番DBブロックには手を入れない。

後続計画: 実装後は`npm.cmd test`、`npm.cmd run build`、`git diff --check`を確認する。

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
- 全デモシナリオは、本人確認を先に行い、本人確認後に用件を聞く流れへ統一する。
- 次に確認する場合: `npm.cmd test`、`npm.cmd run build`、`git diff --check`、`docker compose --env-file .env.local up --build -d`、ブラウザで`CALL-CC-04`カード選択。
- 仕様整合修正PR: `CALL-CC-02`を小牧市のCCNet Air設定へ変更し、メッシュWi-Fi 3台目以降550円、300M/30Mを主案内から外すテストを追加する。検証対象は`npm.cmd test`、`npm.cmd run build`、`git diff --check`。
