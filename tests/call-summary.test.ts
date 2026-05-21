import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAssistantConversationDraft,
  buildAssistantInputPreview,
  buildConversationThreadPreview,
  demoState,
  type AssistantEvidence,
  type QueueItem
} from "../src/app.js";
import { buildCallSummary } from "../src/call-summary.js";
import { buildResponsePolicyGuard } from "../src/response-policy.js";

function queueItem(overrides: Partial<QueueItem> = {}): QueueItem {
  return {
    id: "CALL-8001",
    callerName: "Demo User",
    topic: "CCNet光10G Wi-Fi 相談",
    status: "waiting",
    priority: "normal",
    waitSeconds: 30,
    excerpt: "Wi-Fiが不安定で10Gへ変更できるか確認したいです。",
    customerId: "customer_ccnet_2001",
    serviceArea: "春日井市 / 戸建て",
    servicePlan: "CCNet光1G おとく割 + メッシュWi-Fi",
    verificationStatus: "unverified",
    ...overrides
  };
}

function assistantEvidence(overrides: Partial<AssistantEvidence> = {}): AssistantEvidence {
  return {
    callId: "CALL-8001",
    query: "CCNet光10G Wi-Fi customer_ccnet_2001",
    resultCount: 2,
    results: [
      {
        sourcePath: "business_rules/005_ccnet_public_service_guidance.md",
        section: "CCNet公開HPベース案内 > 10G・Wi-Fi・料金の一般案内",
        snippet: "10G、メッシュWi-Fi、料金目安は一般案内できる。",
        score: 24
      },
      {
        sourcePath: "customer_contracts/customer_ccnet_2001.md",
        section: "顧客契約: customer_ccnet_2001 > 契約状態",
        snippet: "本人確認前は契約状態を断定しない。",
        score: 18
      }
    ],
    ...overrides
  };
}

function buildSummaryFixture(
  item: QueueItem = queueItem(),
  evidence: AssistantEvidence = assistantEvidence(),
  operatorNoteValue?: string
) {
  const draft = buildAssistantConversationDraft(item, evidence);
  const conversation = buildConversationThreadPreview(item, draft);
  const operatorInput = buildAssistantInputPreview(item, draft, {
    value: operatorNoteValue
  });
  const policy = buildResponsePolicyGuard({
    item,
    evidence,
    conversation,
    operatorInput
  });

  return buildCallSummary({
    item,
    evidence,
    conversation,
    operatorInput,
    policy
  });
}

test("buildCallSummary creates a deterministic customer-safe summary and next action", () => {
  const summary = buildSummaryFixture();

  assert.equal(summary.version, 1);
  assert.equal(summary.callId, "CALL-8001");
  assert.match(summary.inquirySummary, /Demo Userさん/);
  assert.match(summary.inquirySummary, /CCNet光10G Wi-Fi 相談/);
  assert.match(summary.inquirySummary, /春日井市 \/ 戸建て/);
  assert.equal(summary.evidenceReferences.length, 2);
  assert.equal(
    summary.evidenceReferences[0],
    "business_rules/005_ccnet_public_service_guidance.md / CCNet公開HPベース案内 > 10G・Wi-Fi・料金の一般案内"
  );
  assert.equal(summary.policyDecision.outcome, "customer-specific-answer-blocked");
  assert.match(summary.policyDecision.summary, /本人確認前/);
  assert.match(summary.operatorNoteStatus.summary, /browser-only/);
  assert.match(summary.operatorNoteStatus.summary, /not sent or saved/);
  assert.match(summary.nextAction, /本人確認/);
  assert.deepEqual(summary.guardrails, {
    externalSendAllowed: false,
    persistenceAllowed: false,
    summaryOnly: true
  });
});

test("buildCallSummary switches next action when human review is required", () => {
  const item = queueItem({
    topic: "障害と補償の相談",
    status: "human-review",
    priority: "high",
    excerpt: "障害状況と補償可否を上席に確認してほしいです。"
  });
  const evidence = assistantEvidence({
    results: [
      {
        sourcePath: "business_rules/004_escalation_policy.md",
        section: "上席確認ルール > すぐに上席確認する条件",
        snippet: "補償を含む場合は上席確認する。",
        score: 30
      }
    ]
  });
  const summary = buildSummaryFixture(item, evidence, "補償相談。本人確認はまだです。");

  assert.equal(summary.policyDecision.outcome, "human-review-required");
  assert.match(summary.policyDecision.summary, /人の確認/);
  assert.match(summary.nextAction, /人の担当者/);
  assert.match(summary.nextAction, /補償可否を断定しない/);
});

test("buildCallSummary records edited operator notes without implying save or send", () => {
  const summary = buildSummaryFixture(
    queueItem(),
    assistantEvidence(),
    "本人確認済み。10G提供可否は担当者確認へ回す。"
  );

  assert.equal(summary.operatorNoteStatus.hasContent, true);
  assert.match(summary.operatorNoteStatus.summary, /Operator note candidate present/);
  assert.match(summary.operatorNoteStatus.summary, /browser-only/);
  assert.doesNotMatch(summary.operatorNoteStatus.summary, /送信済み|保存済み|sent\.|saved\./);
  assert.match(summary.operatorNoteStatus.summary, /not sent or saved/);
});

test("buildCallSummary stays stable when no queue item is selected", () => {
  const draft = buildAssistantConversationDraft(undefined, {
    callId: "CALL-0",
    query: "",
    resultCount: 0,
    results: []
  });
  const conversation = buildConversationThreadPreview(undefined, draft);
  const operatorInput = buildAssistantInputPreview(undefined, draft);
  const policy = buildResponsePolicyGuard({
    item: undefined,
    evidence: {
      callId: "CALL-0",
      query: "",
      resultCount: 0,
      results: []
    },
    conversation,
    operatorInput
  });
  const summary = buildCallSummary({
    item: undefined,
    evidence: {
      callId: "CALL-0",
      query: "",
      resultCount: 0,
      results: []
    },
    conversation,
    operatorInput,
    policy
  });

  assert.equal(summary.callId, "CALL-0");
  assert.match(summary.inquirySummary, /デモシナリオを選択中/);
  assert.match(summary.nextAction, /キュー項目を選択/);
});

test("default demo summary follows the CCNet selected call", () => {
  const selectedItem = demoState.activeQueue.find(
    (item) => item.id === demoState.assistantEvidence.callId
  );

  assert.ok(selectedItem);

  const summary = buildSummaryFixture(selectedItem, demoState.assistantEvidence);

  assert.equal(summary.callId, "CALL-CC-03");
  assert.match(summary.inquirySummary, /山本 花さん/);
  assert.match(summary.policyDecision.summary, /本人確認前/);
  assert.match(summary.nextAction, /本人確認/);
});
