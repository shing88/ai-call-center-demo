import type {
  AssistantEvidence,
  AssistantInputPreview,
  ConversationThreadPreview,
  QueueItem
} from "./app.js";
import type { ResponsePolicyGuard } from "./response-policy.js";

export interface RealtimeOperatorSessionContext {
  version: 1;
  callId: string;
  instructions: string;
  evidenceReferences: string[];
  policy: {
    outcome: ResponsePolicyGuard["outcome"];
    allowedResponseScope: ResponsePolicyGuard["allowedResponseScope"];
    customerSpecificAnswerAllowed: boolean;
    humanReviewRequired: boolean;
    blockedResponseTypes: string[];
  };
}

export interface BuildRealtimeOperatorSessionContextInput {
  item: QueueItem | undefined;
  evidence: AssistantEvidence;
  conversation: ConversationThreadPreview;
  operatorInput: AssistantInputPreview;
  policy: ResponsePolicyGuard;
}

export interface RealtimeTokenRequestBody {
  callId: string;
  operatorSessionId: string;
  reviewGateId: string;
  realtimeGrounding: RealtimeOperatorSessionContext;
}

const maxEvidenceReferences = 5;
const maxEvidenceSnippetLength = 220;

export function buildRealtimeOperatorSessionContext(
  input: BuildRealtimeOperatorSessionContextInput
): RealtimeOperatorSessionContext {
  const evidenceReferences = input.policy.evidenceReferences.slice(
    0,
    maxEvidenceReferences
  );
  const policy = {
    outcome: input.policy.outcome,
    allowedResponseScope: input.policy.allowedResponseScope,
    customerSpecificAnswerAllowed: input.policy.customerSpecificAnswerAllowed,
    humanReviewRequired: input.policy.humanReviewRequired,
    blockedResponseTypes: input.policy.blockedResponseTypes
  };

  return {
    version: 1,
    callId: input.evidence.callId,
    instructions: buildInstructions({
      ...input,
      policy,
      evidenceReferences
    }),
    evidenceReferences,
    policy
  };
}

export function buildRealtimeTokenRequestBody(
  context: RealtimeOperatorSessionContext
): RealtimeTokenRequestBody {
  return {
    callId: context.callId,
    operatorSessionId: `operator-demo-${context.callId}`,
    reviewGateId: `policy-${context.policy.outcome}`,
    realtimeGrounding: context
  };
}

function buildInstructions(input: {
  item: QueueItem | undefined;
  evidence: AssistantEvidence;
  conversation: ConversationThreadPreview;
  operatorInput: AssistantInputPreview;
  policy: RealtimeOperatorSessionContext["policy"];
  evidenceReferences: string[];
}): string {
  const item = input.item;
  const selectedCall = item
    ? [
        `Call ID: ${item.id}`,
        `Caller: ${item.callerName}`,
        `Topic: ${item.topic}`,
        `Service: ${item.serviceArea ?? "unknown"} / ${item.servicePlan ?? "unknown"}`,
        `Verification: ${item.verificationStatus ?? "unverified"}`,
        `Customer excerpt: ${item.excerpt}`
      ]
    : [`Call ID: ${input.evidence.callId}`, "No selected queue item is available."];
  const evidenceLines = input.evidence.results
    .slice(0, maxEvidenceReferences)
    .map(
      (result, index) =>
        `${index + 1}. ${result.sourcePath} / ${result.section}: ${trimText(
          result.snippet,
          maxEvidenceSnippetLength
        )}`
    );
  const blockedTypes =
    input.policy.blockedResponseTypes.length > 0
      ? input.policy.blockedResponseTypes.join("; ")
      : "None beyond normal no-send/no-save demo boundaries.";
  const conversationLines = input.conversation.messages
    .map((message) => `${message.label}: ${message.body}`)
    .join("\n");

  return [
    "# Role and Objective",
    "You are the AI operator in a local call-center demo. Use only the selected call context and evidence references below. Keep replies short, spoken, and suitable for a headset conversation.",
    "",
    "# Grounding Context",
    ...selectedCall,
    `Operator draft input: ${input.operatorInput.value}`,
    "",
    "# Evidence References",
    evidenceLines.length > 0 ? evidenceLines.join("\n") : "No evidence references are available.",
    "",
    "# Policy Guard",
    `Allowed response scope: ${input.policy.allowedResponseScope}`,
    `Policy outcome: ${input.policy.outcome}`,
    `Customer-specific answer allowed: ${input.policy.customerSpecificAnswerAllowed ? "yes" : "no"}`,
    `Human review required: ${input.policy.humanReviewRequired ? "yes" : "no"}`,
    `Blocked response types: ${blockedTypes}`,
    "",
    "# Conversation Preview",
    conversationLines,
    "",
    "# Guardrails",
    "- Do not invent facts outside the selected evidence references.",
    "- If the caller asks for customer-specific contract, billing, refund, or compensation details before verification, give general guidance and say a human review may be needed.",
    "- Do not claim that anything was sent, saved, changed, refunded, scheduled, or escalated unless a future tool explicitly confirms it.",
    "- Do not ask for or reveal API keys, client secrets, environment variables, real phone numbers, or real customer data."
  ].join("\n");
}

function trimText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3)}...`;
}
