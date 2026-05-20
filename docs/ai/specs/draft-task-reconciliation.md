# Draft / Task Reconciliation

最終更新: 2026-05-20

この仕様は、`docs/ai/inbox/pro-instructions/`のGPT Proドラフトと、`docs/ai/tasks/`で実際に完了した実行タスクの対応を示す。

GPT Proドラフトは計画素材であり、正本ではない。実装時は必ず`docs/ai/tasks/`配下の実行可能タスクへ変換する。

## 現在の結論

- 実行済みTaskはTask 26 `realtime-token-endpoint-contract`まで。
- Draft 02〜05は、おおむね同番号の実行Taskとして完了している。
- Draft 06以降は、ドラフトをそのまま順番に実装せず、現在のデモに合わせて根拠表示、会話プレビュー、AI response境界へ再分割した。
- Draft 09以降の大きな構想は一部だけ前倒し済みで、回答制御のpolicy guard、代表シナリオ回帰、fallback / rehearsal mode、CCNetのサービス詳細・約款・重要事項説明に合わせた役員デモ仕上げ、ローカル決定的な応対サマリー、役員に見せやすい通話風UI、Realtime未接続境界、server-only token endpoint contractはTask 26までに実装済み。Realtime音声とtool callingはまだ本番接続としては未実装。
- 次の実装はTask 27 `realtime-token-endpoint-disabled-adapter`で、実OpenAI API keyや実network呼び出しを入れず、未設定時のdisabled adapter / fallback responseを決定的に扱う。

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
| Draft 09 `response_policy_guard` | 回答可否、本人確認、上席確認制御 | Task 14〜16で送信/保存不可guardrailとhuman review要否を前倒しで型に追加し、Task 19で決定的なpolicy guardを実装 | 完了 |
| Draft 10 `call_summary_generation` | 応対履歴、要約、判断結果、次アクション | Task 23で`Call summary`、決定的helper、表示、テストを実装 | 完了 |
| Draft 11 `browser_call_style_ui` | 役員に見せる通話風UI | Task 24 `browser-call-style-ui`でCall workspaceとレスポンシブUIを実装 | 完了 |
| Draft 12 `realtime_api_connection` | Realtime API接続、マイク入力、AI音声応答 | Task 14〜16でAPI接続前のrequest/client/network境界だけ実装。Task 25で接続境界と未接続UIを実装。Task 26でtoken endpoint contractを実装。Task 27でdisabled adapterを扱う | 本番Realtime接続は未実装 |
| Draft 13 `realtime_tool_calling` | 音声AIからtool calling | search/evidence/network境界は準備済み | Realtime tool callingは未実装 |
| Draft 14 `demo_scenarios_regression_tests` | デモシナリオと回帰テスト固定 | Task 20で代表シナリオごとの根拠候補、Operator note、policy guard、request/client境界を固定 | 完了 |
| Draft 15 `fallback_rehearsal_mode` | 通信失敗時のfallback / rehearsal | Task 21で現在の静的TypeScriptデモに合わせたplan、表示、runbookを実装 | 完了 |
| Draft 16 `executive_demo_polish` | 役員デモ仕上げ | Task 22でExecutive demo brief、CCNet公開HP・サービス詳細・約款・重説ベースの架空シナリオと顧客モック、台本、安全説明を実装 | 完了 |

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
17. Task 17: roadmap reconciliation
18. Task 18: operator input submit/save design
19. Task 19: response policy guard
20. Task 20: demo scenario regression suite
21. Task 21: fallback rehearsal mode
22. Task 22: executive demo polish
23. Task 23: call summary generation
24. Task 24: browser call style UI
25. Task 25: realtime API connection boundary
26. Task 26: realtime token endpoint contract

## 次の大きめPR候補

### Task 27: realtime-token-endpoint-disabled-adapter

Task 26で定義したcontractを使い、実OpenAI API keyや実network呼び出しを入れずに、未設定時のserver-side adapter / fallback responseを決定的に扱う。

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
