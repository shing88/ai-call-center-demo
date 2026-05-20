import assert from "node:assert/strict";
import test from "node:test";
import {
  AiResponseNetworkClientError,
  createAiResponseNetworkClient,
  type AiResponseNetworkFetcher,
  type AiResponseNetworkFetchInit
} from "../src/ai-response-network-client.js";
import type { AiResponseClientResult } from "../src/ai-response-client.js";
import type { AiResponseRequest } from "../src/ai-response-request.js";

function aiResponseRequest(overrides: Partial<AiResponseRequest> = {}): AiResponseRequest {
  return {
    version: 1,
    purpose: "draft-response",
    createdAt: "2026-05-20T00:00:00.000Z",
    callId: "CALL-5001",
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
        callId: "CALL-5001",
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

function aiResponseClientResult(
  overrides: Partial<AiResponseClientResult> = {}
): AiResponseClientResult {
  return {
    version: 1,
    provider: "provider-proxy",
    model: "demo-model",
    createdAt: "2026-05-20T01:00:00.000Z",
    callId: "CALL-5001",
    status: "drafted",
    response: {
      text: "受付済みであることを伝える。",
      handoffNote: "要点: 返金予定確認",
      evidenceReferences: ["business_rules/002_refund_policy.md / 返金ポリシー > 通常返金"]
    },
    guardrails: {
      externalSendAllowed: false,
      persistenceAllowed: false,
      humanReviewRequired: false,
      reviewReason: null
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
    diagnostics: {
      evidenceCount: 1,
      promptCharacterCount: 120,
      operatorInputIncluded: true
    },
    ...overrides
  };
}

test("createAiResponseNetworkClient posts the request through the injected fetcher", async () => {
  const calls: Array<{ url: string; init: AiResponseNetworkFetchInit }> = [];
  const fetcher: AiResponseNetworkFetcher = async (url, init) => {
    calls.push({ url, init });

    return {
      ok: true,
      status: 200,
      json: async () => aiResponseClientResult()
    };
  };
  const client = createAiResponseNetworkClient({
    endpointUrl: "https://provider.example.test/draft",
    provider: "provider-proxy",
    model: "demo-model",
    fetcher
  });
  const result = await client.createDraft(aiResponseRequest());

  assert.equal(client.provider, "provider-proxy");
  assert.equal(client.model, "demo-model");
  assert.equal(result.callId, "CALL-5001");
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.url, "https://provider.example.test/draft");
  assert.equal(calls[0]?.init.method, "POST");
  assert.equal(calls[0]?.init.headers["content-type"], "application/json");
  assert.equal(calls[0]?.init.headers.accept, "application/json");

  const body = JSON.parse(calls[0]?.init.body ?? "{}") as {
    request?: AiResponseRequest;
    provider?: string;
    model?: string;
  };

  assert.equal(body.provider, "provider-proxy");
  assert.equal(body.model, "demo-model");
  assert.equal(body.request?.callId, "CALL-5001");
  assert.equal(body.request?.policy.outcome, "customer-specific-answer-blocked");
  assert.equal(body.request?.guardrails.externalSendAllowed, false);
  assert.equal(body.request?.guardrails.persistenceAllowed, false);
});

test("createAiResponseNetworkClient merges custom headers without adding secrets by default", async () => {
  const calls: AiResponseNetworkFetchInit[] = [];
  const fetcher: AiResponseNetworkFetcher = async (_url, init) => {
    calls.push(init);

    return {
      ok: true,
      status: 200,
      json: async () => aiResponseClientResult()
    };
  };
  const client = createAiResponseNetworkClient({
    endpointUrl: "https://provider.example.test/draft",
    provider: "provider-proxy",
    model: "demo-model",
    headers: {
      "x-demo-tenant": "tenant-1"
    },
    fetcher
  });

  await client.createDraft(aiResponseRequest());

  assert.equal(calls[0]?.headers["x-demo-tenant"], "tenant-1");
  assert.equal(calls[0]?.headers.authorization, undefined);
});

test("createAiResponseNetworkClient rejects HTTP errors", async () => {
  const client = createAiResponseNetworkClient({
    endpointUrl: "https://provider.example.test/draft",
    provider: "provider-proxy",
    model: "demo-model",
    fetcher: async () => ({
      ok: false,
      status: 503,
      json: async () => ({})
    })
  });

  await assert.rejects(
    () => client.createDraft(aiResponseRequest()),
    (error) =>
      error instanceof AiResponseNetworkClientError && error.code === "http_error"
  );
});

test("createAiResponseNetworkClient rejects invalid payloads", async () => {
  const client = createAiResponseNetworkClient({
    endpointUrl: "https://provider.example.test/draft",
    provider: "provider-proxy",
    model: "demo-model",
    fetcher: async () => ({
      ok: true,
      status: 200,
      json: async () => ({ callId: "CALL-5001", status: "drafted" })
    })
  });

  await assert.rejects(
    () => client.createDraft(aiResponseRequest()),
    (error) =>
      error instanceof AiResponseNetworkClientError && error.code === "invalid_payload"
  );
});

test("createAiResponseNetworkClient rejects call id mismatches", async () => {
  const client = createAiResponseNetworkClient({
    endpointUrl: "https://provider.example.test/draft",
    provider: "provider-proxy",
    model: "demo-model",
    fetcher: async () => ({
      ok: true,
      status: 200,
      json: async () => aiResponseClientResult({ callId: "CALL-404" })
    })
  });

  await assert.rejects(
    () => client.createDraft(aiResponseRequest()),
    (error) =>
      error instanceof AiResponseNetworkClientError && error.code === "call_id_mismatch"
  );
});
