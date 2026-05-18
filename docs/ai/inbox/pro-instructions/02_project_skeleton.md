# Draft 02: project skeleton

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## Proposed goal

Next.js + Node.js/TypeScript の最小アプリケーション骨格を作り、1コンテナで起動できる状態にする。

既存の `AGENTS.md` と `docs/ai/context/*` は維持し、アプリケーション用の最小ファイルだけを追加する。

## Suggested executable task name

`Task 02: project-skeleton`

## Position

既存 Task 01 `define-initial-application-scope` の完了後に実施する。

## Scope

作成候補:

```text
package.json
package-lock.json
next.config.mjs
tsconfig.json
app/page.tsx
app/api/health/route.ts
src/
tests/
Dockerfile
docker-compose.yml
README.md
```

## Do

- TDDで最初に health endpoint または smoke test を追加する。
- `npm run typecheck`、`npm test`、`npm run lint` の最小コマンドを用意する。
- `docker compose up` で起動できるようにする。
- `README.md` に起動方法、環境変数、デモ用途であることを書く。
- `CURRENT.md` に現在のアプリ入口とテスト経路だけを短く追記する。
- `ACTIVE_TASK.md` を次タスクへ更新する。

## Do not

- まだAI応答やRealtime APIを実装しない。
- まだ業務ルールや顧客契約データを作り込まない。
- 複数コンテナ構成にしない。
- 本番認証を入れない。

## Suggested tests

```bash
npm install
npm run typecheck
npm test
npm run lint
docker compose config
git diff --check
```

## Suggested reviews

- Context hygiene
- TypeScript / test
- Docker / developer experience

## Done when

- `/` が表示できる。
- `/api/health` が200を返す。
- 1コンテナで起動できる。
- context pack が次タスクを指している。
