import type {
  AssistantEvidence,
  AssistantInputPreview,
  ConversationThreadPreview,
  QueueItem
} from "./app.js";
import type {
  ResponsePolicyAllowedScope,
  ResponsePolicyGuard,
  ResponsePolicyOutcome
} from "./response-policy.js";

export interface CallSummaryPolicyDecision {
  outcome: ResponsePolicyOutcome;
  allowedResponseScope: ResponsePolicyAllowedScope;
  summary: string;
}

export interface CallSummaryOperatorNoteStatus {
  hasContent: boolean;
  summary: string;
}

export interface CallSummary {
  version: 1;
  callId: AssistantEvidence["callId"];
  inquirySummary: string;
  evidenceReferences: string[];
  policyDecision: CallSummaryPolicyDecision;
  operatorNoteStatus: CallSummaryOperatorNoteStatus;
  nextAction: string;
  guardrails: {
    externalSendAllowed: false;
    persistenceAllowed: false;
    summaryOnly: true;
  };
}

export interface BuildCallSummaryInput {
  item: QueueItem | undefined;
  evidence: AssistantEvidence;
  conversation: ConversationThreadPreview;
  operatorInput: AssistantInputPreview;
  policy: ResponsePolicyGuard;
}

export function buildCallSummary(input: BuildCallSummaryInput): CallSummary {
  return {
    version: 1,
    callId: input.evidence.callId,
    inquirySummary: buildInquirySummary(input),
    evidenceReferences: buildEvidenceReferences(input.evidence),
    policyDecision: buildPolicyDecision(input.policy),
    operatorNoteStatus: buildOperatorNoteStatus(input.operatorInput),
    nextAction: buildNextAction(input.item, input.policy),
    guardrails: {
      externalSendAllowed: false,
      persistenceAllowed: false,
      summaryOnly: true
    }
  };
}

function buildInquirySummary(input: BuildCallSummaryInput): string {
  const customerMessage = input.conversation.messages.find(
    (message) => message.role === "customer"
  );

  if (!input.item) {
    return customerMessage?.body ?? "キュー項目を選択中です。";
  }

  const context = [
    input.item.customerId,
    input.item.serviceArea,
    input.item.servicePlan,
    `verification ${input.item.verificationStatus ?? "unverified"}`
  ]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join(" / ");

  const contextText = context.length > 0 ? ` ${context}。` : "";

  return `${input.item.callerName}さんは${input.item.topic}について「${input.item.excerpt}」と相談している。${contextText}`;
}

function buildEvidenceReferences(evidence: AssistantEvidence): string[] {
  const references = evidence.results.map(
    (result) => `${result.sourcePath} / ${result.section}`
  );

  return Array.from(new Set(references));
}

function buildPolicyDecision(policy: ResponsePolicyGuard): CallSummaryPolicyDecision {
  return {
    outcome: policy.outcome,
    allowedResponseScope: policy.allowedResponseScope,
    summary: `${policyOutcomeSummary(policy)} Scope: ${policy.allowedResponseScope}; human review ${
      policy.humanReviewRequired ? "required" : "not required"
    }; customer-specific answer ${
      policy.customerSpecificAnswerAllowed ? "allowed" : "blocked"
    }.`
  };
}

function policyOutcomeSummary(policy: ResponsePolicyGuard): string {
  const reason = policy.reasons[0] ?? "Policy decision is ready.";

  switch (policy.outcome) {
    case "human-review-required":
      return `人の確認が必要です。${reason}`;
    case "customer-specific-answer-blocked":
      return `本人確認前のため顧客別回答を止めています。${reason}`;
    case "scoped-draft-allowed":
      return `本人確認済みの範囲で下書き可能です。${reason}`;
    case "general-guidance-only":
      return `一般案内だけに制限しています。${reason}`;
  }
}

function buildOperatorNoteStatus(
  operatorInput: AssistantInputPreview
): CallSummaryOperatorNoteStatus {
  const hasContent = operatorInput.value.trim().length > 0;
  const contentStatus = hasContent
    ? "Operator note candidate present"
    : "Operator note candidate empty";

  return {
    hasContent,
    summary: `${contentStatus}; browser-only; not sent or saved; call ${operatorInput.callId}.`
  };
}

function buildNextAction(
  item: QueueItem | undefined,
  policy: ResponsePolicyGuard
): string {
  if (!item) {
    return "キュー項目を選択してから、問い合わせ要約と次アクションを確認する。";
  }

  if (policy.humanReviewRequired) {
    return "人の担当者へ要点と根拠候補を渡し、補償可否を断定しないまま確認する。";
  }

  if (policy.outcome === "customer-specific-answer-blocked") {
    return "本人確認を完了してから契約状態、料金、提供可否を確認し、必要なら担当者へ引き継ぐ。";
  }

  if (policy.outcome === "scoped-draft-allowed") {
    return "担当者が根拠候補を確認し、本人確認済みの範囲だけで応答下書きを扱う。";
  }

  return "公開情報の一般案内に留め、顧客別の契約判断に進む前に本人確認へ進める。";
}
