import {
  buildAssistantConversationDraft,
  buildAssistantInputPreview,
  buildConversationThreadPreview,
  type AssistantEvidence,
  type OperatorInputSubmitSaveCandidate,
  type QueueItem
} from "./app.js";
import {
  buildResponsePolicyGuard,
  type ResponsePolicyGuard
} from "./response-policy.js";

export interface AiResponseRequestEvidenceItem {
  sourcePath: string;
  section: string;
  snippet: string;
  score: number;
}

export interface AiResponseRequestMessage {
  role: "customer" | "assistant" | "internal";
  label: string;
  body: string;
}

export interface AiResponseRequest {
  version: 1;
  purpose: "draft-response";
  createdAt: string;
  callId: string;
  queue: {
    callerName: string;
    topic: string;
    status: QueueItem["status"];
    priority: QueueItem["priority"];
    waitSeconds: number;
    excerpt: string;
  };
  evidence: {
    query: string;
    resultCount: number;
    results: AiResponseRequestEvidenceItem[];
  };
  draft: {
    response: string;
    evidenceLine: string;
    handoffNote: string;
  };
  conversation: {
    messages: AiResponseRequestMessage[];
  };
  operatorInput: {
    label: string;
    value: string;
    unsent: true;
    unsaved: true;
    browserOnly: true;
    statusText: string;
    submitSaveCandidate: OperatorInputSubmitSaveCandidate;
  };
  policy: ResponsePolicyGuard;
  guardrails: {
    externalSendAllowed: false;
    persistenceAllowed: false;
    humanReviewRequired: boolean;
  };
}

export interface BuildAiResponseRequestInput {
  item: QueueItem;
  evidence: AssistantEvidence;
  operatorNoteValue?: string;
  createdAt?: string;
}

export function buildAiResponseRequest(input: BuildAiResponseRequestInput): AiResponseRequest {
  if (input.evidence.callId !== input.item.id) {
    throw new Error(
      `Cannot build AI response request for ${input.item.id} with evidence for ${input.evidence.callId}.`
    );
  }

  const draft = buildAssistantConversationDraft(input.item, input.evidence);
  const conversation = buildConversationThreadPreview(input.item, draft);
  const operatorInput = buildAssistantInputPreview(input.item, draft, {
    value: input.operatorNoteValue
  });
  const policy = buildResponsePolicyGuard({
    item: input.item,
    evidence: input.evidence,
    conversation,
    operatorInput
  });

  return {
    version: 1,
    purpose: "draft-response",
    createdAt: input.createdAt ?? new Date().toISOString(),
    callId: input.item.id,
    queue: {
      callerName: input.item.callerName,
      topic: input.item.topic,
      status: input.item.status,
      priority: input.item.priority,
      waitSeconds: input.item.waitSeconds,
      excerpt: input.item.excerpt
    },
    evidence: {
      query: input.evidence.query,
      resultCount: input.evidence.results.length,
      results: input.evidence.results.map((result) => ({
        sourcePath: result.sourcePath,
        section: result.section,
        snippet: result.snippet,
        score: result.score
      }))
    },
    draft: {
      response: draft.response,
      evidenceLine: draft.evidenceLine,
      handoffNote: draft.handoffNote
    },
    conversation: {
      messages: conversation.messages.map((message) => ({
        role: message.role,
        label: message.label,
        body: message.body
      }))
    },
    operatorInput: {
      label: operatorInput.label,
      value: operatorInput.value,
      unsent: true,
      unsaved: true,
      browserOnly: true,
      statusText: operatorInput.statusText,
      submitSaveCandidate: operatorInput.candidate
    },
    policy,
    guardrails: {
      externalSendAllowed: false,
      persistenceAllowed: false,
      humanReviewRequired:
        policy.humanReviewRequired ||
        input.item.priority === "high" ||
        input.item.status === "human-review"
    }
  };
}
