# アクティブタスクコンテキスト

## タスク

次のタスク: CCNetケーブルプラス電話シナリオ追加

現在のPR段階: Cable Plus scenario expansion

Task 27 `realtime-token-endpoint-disabled-adapter`、Task 28のServer runtime foundation、Realtime client secret implementation、Browser call controls、Business-rule grounded operator behavior、Call recording and handoff、Local JSON handoff persistenceは実装・merge済み。

この小PRでは、CCNet公開情報に合わせて次の2つの架空デモシナリオを追加する。

- 既存ネット加入者がケーブルプラス電話を追加するケース。
- 新規ネット加入希望者へ、ネット利用目的と携帯キャリアを確認したうえでケーブルプラス電話を提案するケース。

各シナリオでは、挨拶、本人確認または提供エリア確認、電話番号・電話機継続希望、携帯キャリア、通話量、商品選択肢、公開料金目安、断定禁止、担当者確認または料金シミュレーションへの次アクションを固定する。

後続計画: 実装後は`npm.cmd test`、`npm.cmd run build`、`git diff --check`を確認する。余力があればDockerで再ビルドして、`http://localhost:4173/`に`CALL-CC-04` / `CALL-CC-05`が表示されることを確認する。

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
