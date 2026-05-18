# Draft 12: realtime API connection

> 配置先想定: `docs/ai/inbox/pro-instructions/callcenter-demo-pr-plan/`
>
> このファイルは GPT Pro / 外部計画ツール由来のドラフトであり、直接実行する正本ではない。
> 実装前に `.agents/skills/active-task-instructions` に従い、1 PR サイズの実行可能タスクとして `docs/ai/tasks/` 配下へ変換すること。


## Proposed goal

OpenAI Realtime APIへの接続準備を行い、ブラウザマイク入力とAI音声応答の最小経路を作る。

## Suggested executable task name

`Task 12: realtime-api-connection`

## Position

Task 11 `browser-call-style-ui` の後。

## Scope

作成候補:

```text
app/api/realtime/session/route.ts
src/realtime/types.ts
src/realtime/realtimeClient.ts
components/VoiceControls.tsx
```

## Do

- API keyをブラウザへ直接出さない。
- サーバ側でephemeral sessionまたは安全なrelayを作る。
- ブラウザマイクの許可と接続状態をUIに表示する。
- 接続失敗時はテキストモードへfallbackする。
- Realtime API仕様は実装時点の公式ドキュメントで確認する。

## Do not

- 業務判断をRealtimeモデルだけに任せない。
- 電話番号連携へ進まない。
- tool callingは次Taskに分ける。

## Suggested tests

```bash
npm test
npm run typecheck
npm run lint
git diff --check
```

外部API依存部分はmockする。

## Suggested reviews

- Security / API key handling
- Realtime architecture
- Frontend fallback

## Done when

- 音声接続の最小経路がある。
- 接続失敗時にテキストモードへ戻れる。
- 秘密情報がクライアントへ露出しない。
