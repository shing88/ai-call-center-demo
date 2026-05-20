import assert from "node:assert/strict";
import test from "node:test";
import { buildResponsePolicyGuard } from "../src/response-policy.js";
import {
  buildAssistantConversationDraft,
  buildAssistantInputPreview,
  buildConversationThreadPreview,
  type AssistantEvidence,
  type QueueItem
} from "../src/app.js";

function queueItem(overrides: Partial<QueueItem> = {}): QueueItem {
  return {
    id: "CALL-7001",
    callerName: "Demo User",
    topic: "返金相談",
    status: "ai-handling",
    priority: "normal",
    waitSeconds: 30,
    excerpt: "返品後の返金予定を確認したいです。",
    ...overrides
  };
}

function assistantEvidence(overrides: Partial<AssistantEvidence> = {}): AssistantEvidence {
  return {
    callId: "CALL-7001",
    query: "返金相談 返品後の返金予定を確認したいです。",
    resultCount: 2,
    results: [
      {
        sourcePath: "business_rules/001_identity_verification.md",
        section: "本人確認ルール > 本人確認前に案内してはいけないこと",
        snippet: "顧客別の契約状態、返金可否、返金予定、特約は本人確認前に案内しない。",
        score: 20
      },
      {
        sourcePath: "business_rules/002_refund_policy.md",
        section: "返金ルール > 本人確認前の回答",
        snippet: "本人確認前は、通常返金の一般条件だけを案内する。",
        score: 16
      }
    ],
    ...overrides
  };
}

function buildPolicyInput(
  item: QueueItem,
  evidence: AssistantEvidence,
  operatorNoteValue?: string
) {
  const draft = buildAssistantConversationDraft(item, evidence);
  const conversation = buildConversationThreadPreview(item, draft);
  const operatorInput = buildAssistantInputPreview(item, draft, {
    value: operatorNoteValue
  });

  return {
    item,
    evidence,
    conversation,
    operatorInput
  };
}

test("buildResponsePolicyGuard blocks customer-specific answers before identity verification", () => {
  const policy = buildResponsePolicyGuard(
    buildPolicyInput(queueItem(), assistantEvidence(), "本人確認はまだです。")
  );

  assert.equal(policy.version, 1);
  assert.equal(policy.outcome, "customer-specific-answer-blocked");
  assert.equal(policy.allowedResponseScope, "general-information-only");
  assert.equal(policy.customerSpecificAnswerAllowed, false);
  assert.equal(policy.humanReviewRequired, false);
  assert.equal(policy.identityVerification, "unverified");
  assert.ok(policy.allowedTopics.includes("本人確認が必要になる理由"));
  assert.ok(policy.blockedResponseTypes.includes("顧客別の返金可否・返金額・返金予定"));
  assert.ok(policy.reasons.some((reason) => reason.includes("本人確認前")));
  assert.deepEqual(policy.guardrails, {
    externalSendAllowed: false,
    persistenceAllowed: false,
    policyDecisionOnly: true
  });
});

test("buildResponsePolicyGuard requires human review for escalation signals", () => {
  const item = queueItem({
    status: "human-review",
    priority: "high",
    topic: "補償と上席対応の相談",
    excerpt: "請求が続いたので補償してほしい。上席にもつないでください。"
  });
  const evidence = assistantEvidence({
    results: [
      {
        sourcePath: "business_rules/004_escalation_policy.md",
        section: "上席確認ルール > すぐに上席確認する条件",
        snippet: "苦情、法的主張、SNS投稿予告、補償を含む場合は上席確認する。",
        score: 24
      }
    ]
  });
  const policy = buildResponsePolicyGuard(buildPolicyInput(item, evidence, "本人確認済みです。"));

  assert.equal(policy.outcome, "human-review-required");
  assert.equal(policy.allowedResponseScope, "handoff-only");
  assert.equal(policy.customerSpecificAnswerAllowed, false);
  assert.equal(policy.humanReviewRequired, true);
  assert.ok(policy.allowedTopics.includes("担当者へ引き継ぐ理由"));
  assert.ok(policy.blockedResponseTypes.includes("補償可否の断定"));
  assert.ok(policy.reasons.some((reason) => reason.includes("上席確認")));
});

test("buildResponsePolicyGuard allows a scoped draft after identity verification", () => {
  const policy = buildResponsePolicyGuard(
    buildPolicyInput(queueItem(), assistantEvidence(), "本人確認済み。返金予定の一般案内を確認。")
  );

  assert.equal(policy.outcome, "scoped-draft-allowed");
  assert.equal(policy.allowedResponseScope, "verified-customer-context");
  assert.equal(policy.customerSpecificAnswerAllowed, true);
  assert.equal(policy.humanReviewRequired, false);
  assert.equal(policy.identityVerification, "verified");
  assert.ok(policy.allowedTopics.includes("根拠候補に基づく回答ドラフト"));
  assert.equal(policy.blockedResponseTypes.length, 0);
});
