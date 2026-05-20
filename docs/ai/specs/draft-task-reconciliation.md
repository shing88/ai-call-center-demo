# Draft / Task Reconciliation

最終更新: 2026-05-20

この仕様は、`docs/ai/inbox/pro-instructions/`のGPT Proドラフトと、`docs/ai/tasks/`で実際に完了した実行タスクの対応を示す。

GPT Proドラフトは計画素材であり、正本ではない。実装時は必ず`docs/ai/tasks/`配下の実行可能タスクへ変換する。

## 現在の結論

- 実行済みTaskはTask 16 `ai-response-network-adapter`まで。
- Draft 02〜05は、おおむね同番号の実行Taskとして完了している。
- Draft 06以降は、ドラフトをそのまま順番に実装せず、現在のデモに合わせて根拠表示、会話プレビュー、AI response境界へ再分割した。
- Draft 09以降の大きな構想は一部だけ前倒し済みで、回答制御、サマリー、通話風UI、Realtime音声、fallback、役員デモ仕上げはまだ明示的な実装Taskとして残っている。
- 次の実装はTask 18 `operator-input-submit-save-design`で、現在の未送信Operator noteを「送信/保存設計」の境界へ進める。

## 対応表

| GPT Pro draft | 元の目的 | 実行Taskでの扱い | 現在状態 |
|---|---|---|---|
| Draft 02 `project_skeleton` | 最小プロジェクト骨格 | Task 02 `scaffold-minimal-demo-app` | 完了 |
| Draft 03 `knowledge_markdown_baseline` | 架空knowledge baseline | Task 03 `knowledge-markdown-baseline` | 完了 |
| Draft 04 `knowledge_loader_chunk_model` | Markdown loader / chunk model | Task 04 `markdown-loader-chunk-model` | 完了 |
| Draft 05 `keyword_search_tools` | keyword search tools | Task 05 `keyword-search-tools` | 完了 |
| Draft 06 `call_session_state` | 通話セッション状態 | Task 06 `evidence-bridge`へ方向転換し、キューとknowledge検索結果の接続を先に実装 | 一部未実装。明示的なcall session stateはまだない |
| Draft 07 `text_chat_demo_flow` | テキスト応対フロー | Task 10〜12で応答ドラフト、会話プレビュー、未送信入力欄を実装 | 一部完了。入力送信/保存はTask 18候補 |
| Draft 08 `evidence_panel_ui` | 根拠表示UI | Task 06〜09でevidence bridge、UI表示、manifest、キュー選択連動を実装 | 実質完了 |
| Draft 09 `response_policy_guard` | 回答可否、本人確認、上席確認制御 | Task 14〜16で送信/保存不可guardrailとhuman review要否を前倒しで型に追加 | 一部完了。業務判断policyは未実装 |
| Draft 10 `call_summary_generation` | 応対履歴、要約、判断結果、次アクション | まだ直接の実行Taskなし | 未実装 |
| Draft 11 `browser_call_style_ui` | 役員に見せる通話風UI | まだ直接の実行Taskなし | 未実装 |
| Draft 12 `realtime_api_connection` | Realtime API接続、マイク入力、AI音声応答 | Task 14〜16でAPI接続前のrequest/client/network境界だけ実装 | 本番Realtime接続は未実装 |
| Draft 13 `realtime_tool_calling` | 音声AIからtool calling | search/evidence/network境界は準備済み | Realtime tool callingは未実装 |
| Draft 14 `demo_scenarios_regression_tests` | デモシナリオと回帰テスト固定 | knowledge/scenario/searchテストは既にある | end-to-endデモシナリオ回帰は未実装 |
| Draft 15 `fallback_rehearsal_mode` | 通信失敗時のfallback / rehearsal | 決定的stubはある | UI/運用としてのrehearsal modeは未実装 |
| Draft 16 `executive_demo_polish` | 役員デモ仕上げ | まだ直接の実行Taskなし | 未実装 |

## 完了済みTaskの流れ

1. Task 01: initial application scope
2. Task 02: minimal demo app
3. Task 03: knowledge Markdown baseline
4. Task 04: Markdown loader / chunk model
5. Task 05: keyword search tools
6. Task 06: evidence bridge
7. Task 07: evidence bundle UI preview
8. Task 08: evidence manifest build
9. Task 09: queue evidence selection
10. Task 10: conversation draft handoff
11. Task 11: conversation thread preview
12. Task 12: conversation input preview
13. Task 13: search ranking tuning
14. Task 14: AI response request contract
15. Task 15: AI response client adapter
16. Task 16: AI response network adapter

## 次の大きめPR候補

### Task 18: operator-input-submit-save-design

現在の未送信Operator noteを、キュー選択ごとに編集・送信準備・保存境界へ進める。外部AI APIやDBはまだ使わず、ブラウザ内の状態、送信候補payload、保存不可/未永続の明示、テストをまとめる。

このTaskはDraft 06 `call-session-state`、Draft 07 `text-chat-demo-flow`、Draft 09 `response-policy-guard`の残りを少しずつ回収する。

### Task 19候補: response-policy-guard

本人確認前に回答できる範囲、上席確認が必要な条件、回答不可条件を、knowledge検索結果とqueue状態から決定的に判定する。

### Task 20候補: demo-scenario-regression-suite

代表シナリオごとに、根拠候補、応答ドラフト、guardrail、operator input、network client境界の期待結果を固定する。

### Task 21候補: fallback-rehearsal-mode

外部通信なしでもデモ進行できるrehearsal modeをUI/状態として明示する。

### Task 22候補: executive-demo-polish

役員向けの画面密度、説明順、デモ台本、安全説明を整える。

### 後回し候補: Realtime audio / tool calling

Realtime API接続、音声入出力、Realtime tool callingは、テキスト/保存/回帰/fallbackが固まった後に進める。現時点ではprovider固有SDKやsecretを入れる段階ではない。

## 今後のPR粒度

今後は、関連する設計、実装、テスト、context handoffを1つのPRにまとめる。

避けること:

- 型だけ、関数だけ、文言だけの極小PRを連続させる。
- GPT Proドラフトを直接`ACTIVE_TASK.md`から参照する。
- provider固有SDK、secret、DB、認証を、デモ境界が固まる前に混ぜる。

優先すること:

- 1つのユーザー体験が前に進む単位でPRを切る。
- コード変更がある場合は、実用的なテストを同じPRで追加する。
- `CURRENT.md`は短く保ち、対応表やロードマップはこの仕様へ逃がす。
