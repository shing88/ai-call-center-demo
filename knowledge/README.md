# Demo Knowledge Base

このディレクトリはAI call center demo用の架空knowledge baselineです。実在の顧客、住所、電話番号、契約番号、注文番号、通話記録は含めない。

## ディレクトリ

```text
knowledge/business_rules/
knowledge/customer_contracts/
knowledge/scenarios/
```

## 利用方針

- すべてのMarkdownはデモ用データとして扱う。実在企業の公開HPに合わせる文書は、公開サービス情報だけを使い、実在顧客データは含めない。
- 見出し単位で後続のloaderがchunk化できるように、`#`と`##`を安定して使う。
- 本人確認前に案内してよい情報と、本人確認後または上席確認後に限定する情報を分ける。
- この段階では検索、embedding、AI応答生成、UI接続は行わない。

## 安全ルール

- 実在する個人名、住所、電話番号、契約番号、注文番号を追加しない。
- 顧客契約は`customer_1001`のようなデモIDだけで識別する。
- 返金額、契約状態、特約などの個別情報は、本人確認後にのみ扱う前提で記述する。
