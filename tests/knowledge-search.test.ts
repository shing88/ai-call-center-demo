import assert from "node:assert/strict";
import test from "node:test";
import { loadKnowledgeBase } from "../src/knowledge.js";
import { expandSearchTerms, searchKnowledge } from "../src/knowledge-search.js";

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
