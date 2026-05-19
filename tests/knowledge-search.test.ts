import assert from "node:assert/strict";
import test from "node:test";
import { loadKnowledgeBase, type KnowledgeChunk } from "../src/knowledge.js";
import { expandSearchTerms, searchKnowledge } from "../src/knowledge-search.js";

function chunk(overrides: Partial<KnowledgeChunk>): KnowledgeChunk {
  return {
    id: "business_rules/demo#01",
    documentId: "business_rules/demo",
    category: "business_rules",
    sourcePath: "business_rules/demo.md",
    title: "デモルール",
    heading: "デモ見出し",
    headingPath: ["デモルール", "デモ見出し"],
    ordinal: 1,
    content: "デモ本文",
    ...overrides
  };
}

test("searchKnowledge returns refund rule evidence for refund queries", () => {
  const knowledgeBase = loadKnowledgeBase();
  const results = searchKnowledge({
    chunks: knowledgeBase.chunks,
    query: "返金",
    categories: ["business_rules"]
  });

  assert.ok(results.length > 0);
  assert.equal(results[0]?.sourcePath, "business_rules/002_refund_policy.md");
  assert.match(results[0]?.section ?? "", /返金/);
  assert.match(results[0]?.snippet ?? "", /返金/);
  assert.equal(typeof results[0]?.score, "number");
  assert.ok((results[0]?.score ?? 0) > 0);
});

test("searchKnowledge expands cancellation intent into cancellation rule matches", () => {
  const knowledgeBase = loadKnowledgeBase();
  const results = searchKnowledge({
    chunks: knowledgeBase.chunks,
    query: "サービスをやめたい",
    categories: ["business_rules"]
  });

  assert.ok(results.length > 0);
  assert.equal(results[0]?.sourcePath, "business_rules/003_cancellation_policy.md");
  assert.match(results[0]?.section ?? "", /解約/);
  assert.ok(results[0]?.matchedTerms.includes("解約"));
});

test("searchKnowledge finds identity verification and escalation evidence", () => {
  const knowledgeBase = loadKnowledgeBase();
  const identityResults = searchKnowledge({
    chunks: knowledgeBase.chunks,
    query: "本人確認前に案内できること",
    categories: ["business_rules"]
  });
  const escalationResults = searchKnowledge({
    chunks: knowledgeBase.chunks,
    query: "補償も求めていて上席確認したい",
    categories: ["business_rules"]
  });

  assert.equal(identityResults[0]?.sourcePath, "business_rules/001_identity_verification.md");
  assert.match(identityResults[0]?.section ?? "", /本人確認/);
  assert.equal(escalationResults[0]?.sourcePath, "business_rules/004_escalation_policy.md");
  assert.match(escalationResults[0]?.section ?? "", /上席確認/);
});

test("searchKnowledge can restrict customer contract results by customerId", () => {
  const knowledgeBase = loadKnowledgeBase();
  const results = searchKnowledge({
    chunks: knowledgeBase.chunks,
    query: "年額契約の返金と解約",
    categories: ["customer_contracts"],
    customerId: "customer_1002"
  });

  assert.ok(results.length > 0);
  assert.ok(results.every((result) => result.sourcePath === "customer_contracts/customer_1002.md"));
  assert.match(results[0]?.snippet ?? "", /年額契約|返金|解約/);
});

test("searchKnowledge ranks compact multi-term matches above single-topic matches", () => {
  const results = searchKnowledge({
    chunks: [
      chunk({
        id: "business_rules/refund-only#01",
        documentId: "business_rules/refund-only",
        sourcePath: "business_rules/refund-only.md",
        title: "返金ルール",
        heading: "返金",
        headingPath: ["返金ルール", "返金"],
        content: "返金の基本だけを説明します。"
      }),
      chunk({
        id: "business_rules/refund-schedule#01",
        documentId: "business_rules/refund-schedule",
        sourcePath: "business_rules/refund-schedule.md",
        title: "受付後の確認",
        heading: "案内タイミング",
        headingPath: ["受付後の確認", "案内タイミング"],
        content: "返金予定は本人確認後に案内し、予定日は断定しない。"
      })
    ],
    query: "返金 予定",
    categories: ["business_rules"]
  });

  assert.equal(results[0]?.sourcePath, "business_rules/refund-schedule.md");
  assert.ok((results[0]?.score ?? 0) > (results[1]?.score ?? 0));
  assert.ok(results[0]?.matchedTerms.includes("返金"));
  assert.ok(results[0]?.matchedTerms.includes("予定"));
});

test("searchKnowledge returns no evidence for empty queries", () => {
  const knowledgeBase = loadKnowledgeBase();

  assert.deepEqual(searchKnowledge({ chunks: knowledgeBase.chunks, query: "   " }), []);
});

test("expandSearchTerms keeps query terms and synonym terms", () => {
  assert.deepEqual(
    expandSearchTerms("サービスをやめたい").filter((term) => ["サービスをやめたい", "解約"].includes(term)),
    ["サービスをやめたい", "解約"]
  );
});
