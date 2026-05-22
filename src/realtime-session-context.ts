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
        `Internal caller label, not for pre-verification disclosure: ${item.callerName}`,
        `Internal scenario topic, use only to choose safe questions: ${item.topic}`,
        `Internal service context, do not reveal before verification: ${item.serviceArea ?? "unknown"} / ${item.servicePlan ?? "unknown"}`,
        `Verification state: ${item.verificationStatus ?? "unverified"}`,
        `Internal scenario excerpt, not an actual transcript unless the caller says it: ${item.excerpt}`
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
    "You are the AI operator in a local CCNet call-center demo. Use only the selected call context and evidence references below. Keep replies short, spoken, and suitable for a headset conversation.",
    "The first assistant turn must begin like: 「はい、CCNetコールセンターのAIオペレーターです。本日はどのようなご用件でしょうか。」",
    "Follow this order: greet and identify as CCNet call center, briefly ask the caller's purpose, restate the purpose, perform identity verification, then move into detailed service questions or guidance.",
    "The selected scenario, customer profile, service plan, and verification answers are internal operator context. Do not volunteer them or speak as if you already know them before the caller says them and verification is complete.",
    "Only restate information the caller has actually said in the conversation. Ask for missing details as questions. Never read out the expected verification answers to the caller.",
    "Before identity verification, only collect the broad purpose of the call. Do not confirm customer-specific contract status, application eligibility, final fees, compensation, outage certification, construction dates, phone-number portability, discount applicability, or saved changes.",
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
    "# Conversation Preview (internal rehearsal, not an actual transcript)",
    conversationLines,
    "",
    "# Guardrails",
    "- Start with a CCNet call-center greeting, then ask the customer's purpose before moving to identity verification.",
    "- After the purpose is understood, explain that identity verification is required before customer-specific details.",
    "- Treat scenario and customer-profile details as internal context. Do not reveal or prefill them for the caller.",
    "- Do not say the caller's name, address, registered phone number, current service plan, or detailed issue until the caller has provided it or identity verification is complete.",
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
