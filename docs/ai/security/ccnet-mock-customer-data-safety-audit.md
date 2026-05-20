# CCNet Mock Customer Data Safety Audit

最終更新: 2026-05-20

## Scope

Task 22の追加依頼として、CCNet株式会社の公開HP、サービス詳細、契約約款、重要事項説明を確認し、業務ルールと架空顧客契約モックを現実寄りにした。対象は`knowledge/business_rules/005_ccnet_public_service_guidance.md`、`knowledge/customer_contracts/customer_ccnet_*.md`、`src/app.ts`のデモ表示。

## Data sources checked

- CCNet公開HPのサービス案内、10G案内、料金、地域情報チャンネル、約款一覧、インターネット契約約款、戸建て向け注意事項・重要事項、初期契約解除制度。
- 実在顧客の氏名、住所、電話番号、契約番号、問い合わせ履歴、請求履歴は使わない。

## Frontend sinks checked

- `src/app.ts`のキュー表示、Executive demo brief、根拠候補、会話プレビュー、Operator noteは`escapeHtml`経由でHTMLへ出力する。
- 新規の顧客メタデータは`customerId`、市区町村レベルの`serviceArea`、公開サービス名ベースの`servicePlan`、`verificationStatus`だけ。

## XSS assessment

顧客モック文字列はデモデータだが、既存のescapeテストに加えてExecutive demo briefとキュー表示のテストで表示内容を固定した。raw HTMLやMarkdown previewは追加していない。

## Permission / visibility policy

本人確認前は契約状態、コース変更、料金、解約料、初期契約解除の適用可否、障害認定、補償可否を断定しない。顧客契約検索は`customerId`で対象顧客に絞る。

## Tests added

- `tests/app.test.ts`: Executive demo briefとキューに架空顧客モックが表示されること。
- `tests/evidence-bridge.test.ts`: キューの顧客メタデータが検索クエリに入り、`customerId`で契約モックへ絞れること。
- `tests/evidence-manifest.test.ts`: manifest生成時もCCNet顧客契約候補が対象顧客に絞られること。
- `tests/knowledge.test.ts`: 約款・重説由来の業務ルールと、実在識別子を含まないCCNet顧客モック。

## Unresolved risks

この段階では本番顧客DB、認証、請求、障害情報、通話履歴とは接続していない。実運用接続を追加する場合は、認証・権限・監査ログ・PIIマスキングを別タスクで設計する。
