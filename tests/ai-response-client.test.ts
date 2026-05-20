import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDeterministicAiResponseClientResult,
  createDeterministicAiResponseClient
} from "../src/ai-response-client.js";
import type { AiResponseRequest } from "../src/ai-response-request.js";

function aiResponseRequest(overrides: Partial<AiResponseRequest> = {}): AiResponseRequest {
  return {
    version: 1,
    purpose: "draft-response",
    createdAt: "2026-05-20T00:00:00.000Z",
    callId: "CALL-4001",
    queue: {
      callerName: "Demo User",
      topic: "返金相談",
      status: "ai-handling",
      priority: "normal",
      waitSeconds: 30,
      excerpt: "返品後の返金予定を確認したいです。"
    },
    evidence: {
      query: "返金相談 返品後の返金予定を確認したいです。",
      resultCount: 1,
      results: [
        {
          sourcePath: "business_rules/002_refund_policy.md",
          section: "返金ポリシー > 通常返金",
          snippet: "返品受付後、本人確認と購入履歴を確認してから返金予定を案内します。",
          score: 18
        }
      ]
    },
    draft: {
      response: "Demo Userさんには、返金相談について受付済みであることを伝える。",
      evidenceLine: "根拠: business_rules/002_refund_policy.md / 返金ポリシー > 通常返金",
      handoffNote: "要点: 返品後の返金予定を確認したいです。"
    },
    conversation: {
      messages: [
        {
          role: "customer",
          label: "Customer",
          body: "Demo User: 返品後の返金予定を確認したいです。"
        },
        {
          role: "assistant",
          label: "AI draft",
          body: "Demo Userさんには、返金相談について受付済みであることを伝える。"
        }
      ]
    },
    operatorInput: {
      label: "Draft input",
      value: "Review 返金相談: 返品後の返金予定を確認したいです。",
      unsent: true,
      unsaved: true,
      browserOnly: true,
      statusText: "Unsent demo input. Browser-only submit/save candidate; not sent or saved.",
      submitSaveCandidate: {
        version: 1,
        kind: "operator-input-submit-save-candidate",
        callId: "CALL-4001",
        operatorInput: {
          label: "Draft input",
          value: "Review 返金相談: 返品後の返金予定を確認したいです。"
        },
        status: {
          unsent: true,
          unsaved: true,
          browserOnly: true
        },
        guardrails: {
          externalSendAllowed: false,
          persistenceAllowed: false,
          candidateOnly: true
        }
      }
    },
    policy: {
      version: 1,
      outcome: "customer-specific-answer-blocked",
      allowedResponseScope: "general-information-only",
      identityVerification: "unverified",
      customerSpecificAnswerAllowed: false,
      humanReviewRequired: false,
      allowedTopics: ["一般的な受付時間・手続き", "本人確認が必要になる理由"],
      blockedResponseTypes: ["顧客別の返金可否・返金額・返金予定"],
      reasons: ["本人確認前のため、顧客別の返金予定は回答しない。"],
      evidenceReferences: ["business_rules/001_identity_verification.md / 本人確認ルール"],
      guardrails: {
        externalSendAllowed: false,
        persistenceAllowed: false,
        policyDecisionOnly: true
      }
    },
    guardrails: {
      externalSendAllowed: false,
      persistenceAllowed: false,
      humanReviewRequired: false
    },
    ...overrides
  };
}

test("createDeterministicAiResponseClient returns a provider-neutral draft result", async () => {
  const client = createDeterministicAiResponseClient({
    createdAt: "2026-05-20T01:00:00.000Z"
  });
  const result = await client.createDraft(aiResponseRequest());

  assert.equal(client.provider, "deterministic-demo");
  assert.equal(client.model, "demo-response-adapter-v1");
  assert.equal(result.version, 1);
  assert.equal(result.provider, "deterministic-demo");
  assert.equal(result.model, "demo-response-adapter-v1");
  assert.equal(result.createdAt, "2026-05-20T01:00:00.000Z");
  assert.equal(result.callId, "CALL-4001");
  assert.equal(result.status, "drafted");
  assert.match(result.response.text, /返金相談について受付済み/);
  assert.deepEqual(result.response.evidenceReferences, [
    "business_rules/002_refund_policy.md / 返金ポリシー > 通常返金"
  ]);
  assert.equal(result.policy.outcome, "customer-specific-answer-blocked");
  assert.equal(result.policy.customerSpecificAnswerAllowed, false);
});

test("deterministic client keeps external send and persistence disabled", async () => {
  const client = createDeterministicAiResponseClient({
    provider: "local-test",
    model: "test-model",
    createdAt: "2026-05-20T01:00:00.000Z"
  });
  const result = await client.createDraft(
    aiResponseRequest({
      guardrails: {
        externalSendAllowed: false,
        persistenceAllowed: false,
        humanReviewRequired: true
      }
    })
  );

  assert.deepEqual(result.guardrails, {
    externalSendAllowed: false,
    persistenceAllowed: false,
    humanReviewRequired: true,
    reviewReason: "High priority or human-review queue item requires operator confirmation."
  });
});

test("buildDeterministicAiResponseClientResult exposes diagnostics without sending data", () => {
  const request = aiResponseRequest();
  const result = buildDeterministicAiResponseClientResult(request, {
    provider: "local-test",
    model: "test-model",
    createdAt: "2026-05-20T01:00:00.000Z"
  });

  assert.equal(result.provider, "local-test");
  assert.equal(result.model, "test-model");
  assert.equal(result.diagnostics.evidenceCount, 1);
  assert.equal(result.diagnostics.operatorInputIncluded, true);
  assert.ok(result.diagnostics.promptCharacterCount > request.operatorInput.value.length);
  assert.equal(result.guardrails.externalSendAllowed, false);
  assert.equal(result.guardrails.persistenceAllowed, false);
});
