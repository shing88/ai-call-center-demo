# AI Call Center Demo PR Plan Drafts

このディレクトリは `shing88/ai-call-center-demo` 用の GPT Pro ドラフト置き場である。

## 重要

このリポジトリは `redmine_new_gantt` の運用をスキル化した構成になっているため、実行タスクの正本は `docs/ai/tasks/` に置く。

このディレクトリのファイルは、`AGENTS.md` のルールどおり、直接実行しない。

## 使い方

1. まず既存の `docs/ai/tasks/01_define_initial_application_scope.md` を実行する。
2. その後、このドラフト群から次に実装する1つを選ぶ。
3. `.agents/skills/active-task-instructions` に従い、`docs/ai/tasks/02_...md` のような実行可能タスクへ変換する。
4. `docs/ai/context/ACTIVE_TASK.md` がその実行タスクを指すように更新する。
5. 実装後は `.agents/skills/context-pack-handoff` と `.agents/skills/pr-body-with-context-usage` を使ってPR本文とcontext packを更新する。

## 対応する既存運用

- `AGENTS.md`
- `docs/ai/context/CURRENT.md`
- `docs/ai/context/ACTIVE_TASK.md`
- `docs/ai/context/SOURCE_OF_TRUTH.md`
- `.agents/skills/init-ai-assisted-project`
- `.agents/skills/active-task-instructions`
- `.agents/skills/context-pack-handoff`
- `.agents/skills/pr-body-with-context-usage`

## 推奨実施順

既存 Task 01 の後に、以下の順で進める。

| Draft | 実装タスク候補 | 目的 |
|---:|---|---|
| 02 | project-skeleton | Next.js / Docker / 最小テストの骨格 |
| 03 | knowledge-markdown-baseline | 架空の業務ルール・顧客契約Markdown |
| 04 | knowledge-loader-chunk-model | Markdown loader と chunk model |
| 05 | keyword-search-tools | キーワード検索と同義語検索 |
| 06 | call-session-state | 通話セッション状態 |
| 07 | text-chat-demo-flow | テキスト応対フロー |
| 08 | evidence-panel-ui | 根拠表示UI |
| 09 | response-policy-guard | 回答可否・上席確認制御 |
| 10 | call-summary-generation | 通話後サマリー |
| 11 | browser-call-style-ui | 通話風UI |
| 12 | realtime-api-connection | Realtime API 接続 |
| 13 | realtime-tool-calling | 音声AIからtool calling |
| 14 | demo-scenarios-regression-tests | デモシナリオ回帰テスト |
| 15 | fallback-rehearsal-mode | fallback / rehearsal mode |
| 16 | executive-demo-polish | 役員デモ仕上げ |

## 到達点

- Draft 02〜07: テキストで根拠付き応対ができる
- Draft 02〜11: 音声なしでも役員に見せられる通話風デモ
- Draft 02〜13: Realtime音声 + tool callingの未来感デモ
- Draft 02〜16: fallbackと役員説明込みの安定デモ

## 禁止事項

- このディレクトリを `ACTIVE_TASK.md` から直接指さない。
- アーカイブやレポートを現在仕様として読ませない。
- 1PRに複数の独立機能を混ぜない。
- 本物の個人情報や顧客データを入れない。
- 初回デモ前に実電話連携・本格ベクターDB・本番認証へ進まない。
