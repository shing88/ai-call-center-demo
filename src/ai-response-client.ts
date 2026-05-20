import type { AiResponseRequest } from "./ai-response-request.js";

export interface AiResponseClient {
  readonly provider: string;
  readonly model: string;
  createDraft(request: AiResponseRequest): Promise<AiResponseClientResult>;
}

export interface AiResponseClientResult {
  version: 1;
  provider: string;
  model: string;
  createdAt: string;
  callId: string;
  status: "drafted";
  response: {
    text: string;
    handoffNote: string;
    evidenceReferences: string[];
  };
  guardrails: {
    externalSendAllowed: false;
    persistenceAllowed: false;
    humanReviewRequired: boolean;
    reviewReason: string | null;
  };
  diagnostics: {
    evidenceCount: number;
    promptCharacterCount: number;
    operatorInputIncluded: boolean;
  };
}

export interface DeterministicAiResponseClientOptions {
  provider?: string;
  model?: string;
  createdAt?: string;
}

const defaultProvider = "deterministic-demo";
const defaultModel = "demo-response-adapter-v1";

export function createDeterministicAiResponseClient(
  options: DeterministicAiResponseClientOptions = {}
): AiResponseClient {
  const provider = options.provider ?? defaultProvider;
  const model = options.model ?? defaultModel;

  return {
    provider,
    model,
    async createDraft(request) {
      return buildDeterministicAiResponseClientResult(request, {
        provider,
        model,
        createdAt: options.createdAt
      });
    }
  };
}

export function buildDeterministicAiResponseClientResult(
  request: AiResponseRequest,
  options: Required<Pick<DeterministicAiResponseClientOptions, "provider" | "model">> &
    Pick<DeterministicAiResponseClientOptions, "createdAt">
): AiResponseClientResult {
  const evidenceReferences = request.evidence.results.map(
    (result) => `${result.sourcePath} / ${result.section}`
  );
  const reviewReason = request.guardrails.humanReviewRequired
    ? "High priority or human-review queue item requires operator confirmation."
    : null;

  return {
    version: 1,
    provider: options.provider,
    model: options.model,
    createdAt: options.createdAt ?? new Date().toISOString(),
    callId: request.callId,
    status: "drafted",
    response: {
      text: request.draft.response,
      handoffNote: request.draft.handoffNote,
      evidenceReferences
    },
    guardrails: {
      externalSendAllowed: false,
      persistenceAllowed: false,
      humanReviewRequired: request.guardrails.humanReviewRequired,
      reviewReason
    },
    diagnostics: {
      evidenceCount: request.evidence.results.length,
      promptCharacterCount: countPromptCharacters(request),
      operatorInputIncluded: true
    }
  };
}

function countPromptCharacters(request: AiResponseRequest): number {
  const conversationCharacters = request.conversation.messages.reduce(
    (sum, message) => sum + message.body.length,
    0
  );

  return (
    request.queue.topic.length +
    request.queue.excerpt.length +
    request.evidence.query.length +
    request.operatorInput.value.length +
    conversationCharacters
  );
}
