import assert from "node:assert/strict";
import test from "node:test";
import { buildAiResponseRequest } from "../src/ai-response-request.js";
import type { AssistantEvidence, QueueItem } from "../src/app.js";

function queueItem(overrides: Partial<QueueItem> = {}): QueueItem {
  return {
    id: "CALL-3001",
    callerName: "Demo User",
    topic: "返金相談",
    status: "ai-handling",
    priority: "normal",
    waitSeconds: 42,
    excerpt: "返品後の返金予定を確認したいです。",
    ...overrides
  };
}

function assistantEvidence(overrides: Partial<AssistantEvidence> = {}): AssistantEvidence {
  return {
    callId: "CALL-3001",
    query: "返金相談 返品後の返金予定を確認したいです。",
    resultCount: 1,
    results: [
      {
        sourcePath: "business_rules/002_refund_policy.md",
        section: "返金ポリシー > 通常返金",
        snippet: "返品受付後、本人確認と購入履歴を確認してから返金予定を案内します。",
        score: 18
      }
    ],
    ...overrides
  };
}

test("buildAiResponseRequest creates a provider-neutral draft payload", () => {
  const request = buildAiResponseRequest({
    item: queueItem(),
    evidence: assistantEvidence(),
    createdAt: "2026-05-20T00:00:00.000Z"
  });

  assert.equal(request.version, 1);
  assert.equal(request.purpose, "draft-response");
  assert.equal(request.createdAt, "2026-05-20T00:00:00.000Z");
  assert.equal(request.callId, "CALL-3001");
  assert.equal(request.queue.topic, "返金相談");
  assert.equal(request.evidence.resultCount, 1);
  assert.equal(request.evidence.results[0]?.sourcePath, "business_rules/002_refund_policy.md");
  assert.match(request.draft.response, /Demo Userさんには、返金相談について受付済み/);
  assert.deepEqual(
    request.conversation.messages.map((message) => message.role),
    ["customer", "assistant", "internal"]
  );
  assert.match(request.operatorInput.value, /Review 返金相談/);
  assert.equal(request.operatorInput.unsent, true);
});

test("buildAiResponseRequest carries edited operator input into the submit/save candidate", () => {
  const request = buildAiResponseRequest({
    item: queueItem(),
    evidence: assistantEvidence(),
    operatorNoteValue: "Edited operator note before human review.",
    createdAt: "2026-05-20T00:00:00.000Z"
  });

  assert.equal(request.operatorInput.value, "Edited operator note before human review.");
  assert.equal(request.operatorInput.unsent, true);
  assert.equal(request.operatorInput.unsaved, true);
  assert.equal(request.operatorInput.browserOnly, true);
  assert.equal(
    request.operatorInput.submitSaveCandidate.kind,
    "operator-input-submit-save-candidate"
  );
  assert.equal(
    request.operatorInput.submitSaveCandidate.operatorInput.value,
    "Edited operator note before human review."
  );
  assert.deepEqual(request.operatorInput.submitSaveCandidate.guardrails, {
    externalSendAllowed: false,
    persistenceAllowed: false,
    candidateOnly: true
  });
});

test("buildAiResponseRequest keeps send and persistence disabled by default", () => {
  const request = buildAiResponseRequest({
    item: queueItem({ priority: "high" }),
    evidence: assistantEvidence(),
    createdAt: "2026-05-20T00:00:00.000Z"
  });

  assert.deepEqual(request.guardrails, {
    externalSendAllowed: false,
    persistenceAllowed: false,
    humanReviewRequired: true
  });
});

test("buildAiResponseRequest rejects mismatched queue and evidence call ids", () => {
  assert.throws(
    () =>
      buildAiResponseRequest({
        item: queueItem({ id: "CALL-3001" }),
        evidence: assistantEvidence({ callId: "CALL-404" }),
        createdAt: "2026-05-20T00:00:00.000Z"
      }),
    /Cannot build AI response request/
  );
});

test("buildAiResponseRequest preserves raw user text for downstream escaping", () => {
  const request = buildAiResponseRequest({
    item: queueItem({
      callerName: "User <script>",
      topic: "住所変更 <urgent>",
      excerpt: "Please change <b>today</b>."
    }),
    evidence: assistantEvidence({
      query: "住所変更 <urgent>",
      results: [
        {
          sourcePath: "business_rules/004_escalation_policy.md",
          section: "上席確認 <review>",
          snippet: "HTML-like <tokens> remain data, not rendered markup.",
          score: 7
        }
      ]
    }),
    createdAt: "2026-05-20T00:00:00.000Z"
  });

  assert.equal(request.queue.callerName, "User <script>");
  assert.equal(request.queue.topic, "住所変更 <urgent>");
  assert.equal(request.queue.excerpt, "Please change <b>today</b>.");
  assert.equal(request.evidence.results[0]?.section, "上席確認 <review>");
  assert.match(request.conversation.messages[0]?.body ?? "", /<b>today<\/b>/);
});
