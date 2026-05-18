# callcenter_ai_demo Codex指示書

このフォルダは、Codexが1タスク / 1 PRで実装するための指示書群です。

## 実施順

| タスク | ファイル                                | 目的                             |
| -----: | --------------------------------------- | -------------------------------- |
|     01 | `01_project_skeleton.md`                | プロジェクトスケルトン           |
|     02 | `02_knowledge_markdown_baseline.md`     | ナレッジMarkdownのベースライン   |
|     03 | `03_knowledge_loader_chunk_model.md`    | ナレッジローダーとチャンクモデル |
|     04 | `04_keyword_search_tools.md`            | キーワード検索ツール             |
|     05 | `05_call_session_state.md`              | 通話セッション状態               |
|     06 | `06_text_chat_demo_flow.md`             | テキストチャットのデモフロー     |
|     07 | `07_evidence_panel_ui.md`               | 根拠パネルUI                     |
|     08 | `08_response_policy_guard.md`           | 応答ポリシーガード               |
|     09 | `09_call_summary_generation.md`         | 通話サマリー生成                 |
|     10 | `10_browser_call_style_ui.md`           | ブラウザ上の通話風UI             |
|     11 | `11_realtime_api_connection.md`         | Realtime API接続                 |
|     12 | `12_realtime_tool_calling.md`           | Realtimeのtool calling           |
|     13 | `13_demo_scenarios_regression_tests.md` | デモシナリオの回帰テスト         |
|     14 | `14_フォールバック_rehearsal_mode.md`         | フォールバックリハーサルモード         |
|     15 | `15_executive_demo_polish.md`           | 役員向けデモの仕上げ             |

## デモ可能地点

```text
タスク 01〜06: テキストで顧客対応、検索、根拠付き回答まで確認可能
タスク 01〜10: 音声なしでも役員に見せられる通話風UIデモ
タスク 01〜12: Realtime音声 + tool callingの未来感デモ
タスク 01〜15: 役員向け台本、フォールバック、安全説明まで含む安定版
```

## 非ゴール

```text
実電話番号連携
本物の顧客DB接続
SharePoint / M365 連携
本格ベクターDB
複数コンテナ構成
Python worker
本番認証・権限基盤
```
