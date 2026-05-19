# AIエージェントガイド

## 会話ルール

- ユーザーとの会話、進捗報告、最終回答はすべて日本語で行う。
- コード、コマンド、ファイル名、外部API名など、原文のまま扱う必要があるものは英語表記を維持してよい。

## タスク開始時

最初に読むファイルは次のものだけにする。

1. `AGENTS.md`
2. `docs/ai/context/CURRENT.md`
3. `docs/ai/context/ACTIVE_TASK.md`
4. `docs/ai/context/SOURCE_OF_TRUTH.md`
5. 現在のアクティブなタスク指示

アクティブなタスク指示に明記されていない限り、アーカイブ、レポート、古い計画、無関係なドキュメントは読まない。

## 作業ルール

- 作業前に現在のブランチと差分を確認する。
- `main`で直接作業しない。
- 最新の`main`からタスク用ブランチを作成する。
- ユーザーの変更を上書きしない。
- タスクの範囲を小さく保つ。
- コードを変更した場合は、実用的な範囲でテストを追加または更新する。
- 追加で読んだファイルはPRの`Context usage`に記録する。

## PRルール

## PR作成ルール

タスク指示またはユーザー指示で明示的に禁止されていない限り、実装・テスト・ハンドオフ更新が完了したら、作業ブランチをpushし、Draft PRを作成する。

PR作成までを通常のタスク完了範囲に含める。

PR本文には次の項目を含める。

- Context usage
- Summary
- Tests
- Reviews
- Known limitations
- Context handoff

## GPT Proドラフト

GPT Proやその他の外部計画ツールで作成された計画ドラフトは、次の場所に保存してよい。

`docs/ai/inbox/pro-instructions/`

これらのファイルはドラフトであり、source of truthではない。直接実行しない。実装前に`docs/ai/tasks/`配下の実行可能なタスク指示へ変換する。

## ハンドオフ

タスク完了時には次を更新する。

- `CURRENT.md`
- `ACTIVE_TASK.md`
- 優先順位が変わった場合は`SOURCE_OF_TRUTH.md`
- マージ後の後片付けが残っている場合のみ`POST_MERGE_QUEUE.md`
