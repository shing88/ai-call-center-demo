import assert from "node:assert/strict";
import test from "node:test";
import {
  loadKnowledgeBase,
  parseMarkdownDocument,
  type KnowledgeDocument
} from "../src/knowledge.js";

test("loadKnowledgeBase reads the demo markdown documents into stable chunks", () => {
  const knowledgeBase = loadKnowledgeBase();

  assert.equal(knowledgeBase.documents.length, 11);
  assert.ok(knowledgeBase.chunks.length > knowledgeBase.documents.length);

  assert.deepEqual(
    knowledgeBase.documents.map((document) => document.id),
    [
      "business_rules/001_identity_verification",
      "business_rules/002_refund_policy",
      "business_rules/003_cancellation_policy",
      "business_rules/004_escalation_policy",
      "customer_contracts/customer_1001",
      "customer_contracts/customer_1002",
      "customer_contracts/customer_1003",
      "scenarios/scenario_01_refund_normal",
      "scenarios/scenario_02_refund_exception",
      "scenarios/scenario_03_identity_not_verified",
      "scenarios/scenario_04_complaint_escalation"
    ]
  );

  const identityChunk = knowledgeBase.chunks.find(
    (chunk) =>
      chunk.id ===
      "business_rules/001_identity_verification#03-本人確認前に案内してよいこと"
  );

  assert.ok(identityChunk);
  assert.equal(identityChunk.category, "business_rules");
  assert.deepEqual(identityChunk.headingPath, [
    "本人確認ルール",
    "本人確認前に案内してよいこと"
  ]);
  assert.match(identityChunk.content, /一般的な受付時間/);
});

test("parseMarkdownDocument keeps frontmatter and splits level-2 sections", () => {
  const document = parseMarkdownDocument({
    category: "scenarios",
    sourcePath: "scenarios/example.md",
    markdown: `---
doc_type: scenario
demo_data: fictional
---

# サンプルシナリオ

概要本文。

## 問い合わせ内容

返品したい。

## 期待結果

一般案内だけ返す。
`
  });

  assertDocumentShape(document);
  assert.deepEqual(document.frontmatter, {
    doc_type: "scenario",
    demo_data: "fictional"
  });
  assert.deepEqual(
    document.chunks.map((chunk) => chunk.id),
    [
      "scenarios/example#01-サンプルシナリオ",
      "scenarios/example#02-問い合わせ内容",
      "scenarios/example#03-期待結果"
    ]
  );
  assert.deepEqual(document.chunks[0]?.headingPath, ["サンプルシナリオ"]);
  assert.deepEqual(document.chunks[1]?.headingPath, ["サンプルシナリオ", "問い合わせ内容"]);
});

test("parseMarkdownDocument rejects markdown without a level-1 title", () => {
  assert.throws(
    () =>
      parseMarkdownDocument({
        category: "business_rules",
        sourcePath: "business_rules/missing-title.md",
        markdown: "## 目的\n\n本文だけ。"
      }),
    /level-1 heading/
  );
});

function assertDocumentShape(document: KnowledgeDocument): void {
  assert.equal(document.id, "scenarios/example");
  assert.equal(document.category, "scenarios");
  assert.equal(document.sourcePath, "scenarios/example.md");
  assert.equal(document.title, "サンプルシナリオ");
  assert.equal(document.chunks.length, 3);
}
