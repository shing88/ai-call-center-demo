import assert from "node:assert/strict";
import test from "node:test";
import type { QueueItem } from "../src/app.js";
import { loadKnowledgeBase } from "../src/knowledge.js";
import {
  buildEvidenceBundle,
  buildKnowledgeQuery,
  loadEvidenceBundle
} from "../src/evidence-bridge.js";

function queueItem(overrides: Partial<QueueItem> = {}): QueueItem {
  return {
    id: "CALL-2001",
    callerName: "Demo User",
    topic: "返金相談",
    status: "ai-handling",
    priority: "normal",
    waitSeconds: 12,
    excerpt: "返品後の返金予定を確認したいです。",
    ...overrides
  };
}

test("buildKnowledgeQuery combines queue topic and excerpt into a compact query", () => {
  assert.equal(
    buildKnowledgeQuery(queueItem({ topic: "  返金相談  ", excerpt: "  返品したいです。  " })),
    "返金相談 返品したいです。"
  );
});

test("buildEvidenceBundle returns evidence candidates for a queue item", () => {
  const knowledgeBase = loadKnowledgeBase();
  const bundle = buildEvidenceBundle({
    item: queueItem(),
    chunks: knowledgeBase.chunks,
    categories: ["business_rules"],
    limit: 2
  });

  assert.equal(bundle.callId, "CALL-2001");
  assert.equal(bundle.query, "返金相談 返品後の返金予定を確認したいです。");
  assert.equal(bundle.resultCount, bundle.results.length);
  assert.ok(bundle.results.length > 0);
  assert.equal(bundle.results[0]?.sourcePath, "business_rules/002_refund_policy.md");
  assert.match(bundle.results[0]?.snippet ?? "", /返金|返品/);
});

test("buildEvidenceBundle safely returns empty results for empty queue text", () => {
  const knowledgeBase = loadKnowledgeBase();
  const bundle = buildEvidenceBundle({
    item: queueItem({ topic: "   ", excerpt: "   " }),
    chunks: knowledgeBase.chunks
  });

  assert.deepEqual(bundle, {
    callId: "CALL-2001",
    query: "",
    resultCount: 0,
    results: []
  });
});

test("loadEvidenceBundle can load the current knowledge base and apply customer filters", () => {
  const bundle = loadEvidenceBundle({
    item: queueItem({
      topic: "年額契約の返金と解約",
      excerpt: "顧客 customer_1002 の契約条件を確認したいです。"
    }),
    categories: ["customer_contracts"],
    customerId: "customer_1002",
    limit: 3
  });

  assert.ok(bundle.results.length > 0);
  assert.ok(
    bundle.results.every((result) => result.sourcePath === "customer_contracts/customer_1002.md")
  );
});
