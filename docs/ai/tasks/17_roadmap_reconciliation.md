# タスク 17: roadmap-reconciliation

## ゴール

`docs/ai/inbox/pro-instructions/`のGPT Proドラフトと、実際に完了した`docs/ai/tasks/`の対応を整理し、次に実装すべきタスクを迷わず選べる状態にする。

このタスクではコード実装を追加せず、現行仕様としての対応表、次タスク指示、context handoffをまとめて更新する。今後はPR粒度をやや大きめにし、単発の小さな境界追加だけでなく、関連する設計・実装・テスト・handoffを1つのPRにまとめる方針へ寄せる。

## 位置づけ

Task 16 `ai-response-network-adapter`完了後のロードマップ整理タスク。

## 必ず読む

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/17_roadmap_reconciliation.md
```

## 必要な場合のみ読む

```text
docs/ai/tasks/README.md
docs/ai/tasks/_template.md
docs/ai/tasks/01_define_initial_application_scope.md
docs/ai/tasks/02_scaffold_minimal_demo_app.md
docs/ai/tasks/03_knowledge_markdown_baseline.md
docs/ai/tasks/04_markdown_loader_chunk_model.md
docs/ai/tasks/05_keyword_search_tools.md
docs/ai/tasks/06_evidence_bridge.md
docs/ai/tasks/07_evidence_bundle_ui_preview.md
docs/ai/tasks/08_evidence_manifest_build.md
docs/ai/tasks/09_queue_evidence_selection.md
docs/ai/tasks/10_conversation_draft_handoff.md
docs/ai/tasks/11_conversation_thread_preview.md
docs/ai/tasks/12_conversation_input_preview.md
docs/ai/tasks/13_search_ranking_tuning.md
docs/ai/tasks/14_ai_response_request_contract.md
docs/ai/tasks/15_ai_response_client_adapter.md
docs/ai/tasks/16_ai_response_network_adapter.md
docs/ai/inbox/pro-instructions/README.md
docs/ai/inbox/pro-instructions/00_conversion_guide.md
docs/ai/inbox/pro-instructions/02_project_skeleton.md
docs/ai/inbox/pro-instructions/03_knowledge_markdown_baseline.md
docs/ai/inbox/pro-instructions/04_knowledge_loader_chunk_model.md
docs/ai/inbox/pro-instructions/05_keyword_search_tools.md
docs/ai/inbox/pro-instructions/06_call_session_state.md
docs/ai/inbox/pro-instructions/07_text_chat_demo_flow.md
docs/ai/inbox/pro-instructions/08_evidence_panel_ui.md
docs/ai/inbox/pro-instructions/09_response_policy_guard.md
docs/ai/inbox/pro-instructions/10_call_summary_generation.md
docs/ai/inbox/pro-instructions/11_browser_call_style_ui.md
docs/ai/inbox/pro-instructions/12_realtime_api_connection.md
docs/ai/inbox/pro-instructions/13_realtime_tool_calling.md
docs/ai/inbox/pro-instructions/14_demo_scenarios_regression_tests.md
docs/ai/inbox/pro-instructions/15_fallback_rehearsal_mode.md
docs/ai/inbox/pro-instructions/16_executive_demo_polish.md
docs/ai/specs/README.md
```

## やること

- GPT Proドラフトと完了済みTask 01〜16の対応表を現行仕様として追加する。
- Draft 06以降で、ドラフトどおりではなく小タスクへ再分割した箇所を明示する。
- 未実装の残り作業を、次に実行しやすい大きめPR候補へ並べ替える。
- 次タスクとしてTask 18の実行可能指示を作成する。
- `CURRENT.md` / `ACTIVE_TASK.md`を、Task 17完了後の状態へ更新する。

## やらないこと

- アーカイブやレポートを現在仕様として読まない。
- GPT Proドラフトを直接実装対象にしない。
- コード実装、外部AI API接続、secret、DB、認証、UI送信フローを追加しない。

## テスト

```bash
git diff --check
npm test
npm run build
```

## レビュー観点

- Context hygiene
- Roadmap / task scope
- Source-of-truth ordering

## 完了条件

- inboxドラフトと実Taskの対応が現在仕様として確認できる。
- Task 18の実行可能タスク指示が作成されている。
- `ACTIVE_TASK.md`がTask 18を指している。
- `CURRENT.md`が長い履歴ログになっていない。
- PR本文に`Context usage` / `Tests` / `Reviews` / `Context handoff`が含まれている。
