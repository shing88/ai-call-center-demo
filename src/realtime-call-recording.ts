import type { CallSummary } from "./call-summary.js";
import type {
  ResponsePolicyAllowedScope,
  ResponsePolicyGuard,
  ResponsePolicyOutcome
} from "./response-policy.js";

export type RealtimeTranscriptRole = "customer" | "assistant";

export interface RealtimeTranscriptEntry {
  role: RealtimeTranscriptRole;
  text: string;
  sourceEventType: string;
  final: boolean;
}

export type RealtimeCallHandoffStatus = "recorded" | "fallback-recorded";

export interface RealtimeCallHandoffPolicyDecision {
  outcome: ResponsePolicyOutcome;
  allowedResponseScope: ResponsePolicyAllowedScope;
  customerSpecificAnswerAllowed: boolean;
  humanReviewRequired: boolean;
  blockedResponseTypes: string[];
}

export interface RealtimeCallHandoffRecord {
  version: 1;
  callId: string;
  status: RealtimeCallHandoffStatus;
  transcript: RealtimeTranscriptEntry[];
  summary: string;
  evidenceReferences: string[];
  policyDecision: RealtimeCallHandoffPolicyDecision;
  nextAction: string;
  guardrails: {
    browserOnly: true;
    persistentSaveAllowed: false;
    externalSendAllowed: false;
    productionPhoneConnectionAllowed: false;
  };
}

export interface RealtimeTranscriptCollector {
  recordServerEvent: (event: unknown) => void;
  getTranscript: () => RealtimeTranscriptEntry[];
}

export interface BuildRealtimeCallHandoffRecordInput {
  status: RealtimeCallHandoffStatus;
  callSummary: CallSummary;
  policy: ResponsePolicyGuard;
  transcript: RealtimeTranscriptEntry[];
}

export function createRealtimeTranscriptCollector(): RealtimeTranscriptCollector {
  const finalEntries: RealtimeTranscriptEntry[] = [];
  const pending: Partial<Record<RealtimeTranscriptRole, RealtimeTranscriptEntry>> = {};

  function recordDelta(
    role: RealtimeTranscriptRole,
    sourceEventType: string,
    text: string
  ): void {
    const deltaText = normalizeTranscriptDelta(text);

    if (deltaText.trim().length === 0) {
      return;
    }

    const existing = pending[role];
    pending[role] = {
      role,
      text: existing ? `${existing.text}${deltaText}` : deltaText.trimStart(),
      sourceEventType,
      final: false
    };
  }

  function recordFinal(
    role: RealtimeTranscriptRole,
    sourceEventType: string,
    text: string | undefined
  ): void {
    const normalizedText = normalizeTranscriptText(text ?? pending[role]?.text ?? "");

    if (normalizedText.length === 0) {
      delete pending[role];
      return;
    }

    appendIfNew({
      role,
      text: normalizedText,
      sourceEventType,
      final: true
    });
    delete pending[role];
  }

  function appendIfNew(entry: RealtimeTranscriptEntry): void {
    const last = finalEntries.at(-1);

    if (
      last?.role === entry.role &&
      last.text === entry.text &&
      last.sourceEventType === entry.sourceEventType
    ) {
      return;
    }

    finalEntries.push(entry);
  }

  return {
    recordServerEvent(event: unknown): void {
      const sourceEventType = getEventType(event);

      if (!sourceEventType) {
        return;
      }

      switch (sourceEventType) {
        case "response.output_audio_transcript.delta":
        case "response.output_text.delta":
          recordDelta("assistant", sourceEventType, getStringProperty(event, "delta"));
          return;
        case "response.output_audio_transcript.done":
        case "response.output_text.done":
          recordFinal(
            "assistant",
            sourceEventType,
            getStringProperty(event, "transcript") || getStringProperty(event, "text")
          );
          return;
        case "input_audio_transcription.delta":
          recordDelta("customer", sourceEventType, getStringProperty(event, "delta"));
          return;
        case "input_audio_transcription.done":
        case "conversation.item.input_audio_transcription.completed":
          recordFinal(
            "customer",
            sourceEventType,
            getStringProperty(event, "transcript") || getStringProperty(event, "text")
          );
          return;
        case "response.done":
          for (const text of extractResponseDoneTexts(event)) {
            appendIfNew({
              role: "assistant",
              text,
              sourceEventType,
              final: true
            });
          }
          return;
      }
    },
    getTranscript(): RealtimeTranscriptEntry[] {
      return [
        ...finalEntries,
        ...(["customer", "assistant"] as const)
          .map((role) => pending[role])
          .filter((entry): entry is RealtimeTranscriptEntry => Boolean(entry))
      ].map((entry) => ({ ...entry }));
    }
  };
}

export function buildRealtimeCallHandoffRecord(
  input: BuildRealtimeCallHandoffRecordInput
): RealtimeCallHandoffRecord {
  return {
    version: 1,
    callId: input.callSummary.callId,
    status: input.status,
    transcript: input.transcript.map((entry) => ({ ...entry })),
    summary: input.callSummary.inquirySummary,
    evidenceReferences: [...input.callSummary.evidenceReferences],
    policyDecision: {
      outcome: input.policy.outcome,
      allowedResponseScope: input.policy.allowedResponseScope,
      customerSpecificAnswerAllowed: input.policy.customerSpecificAnswerAllowed,
      humanReviewRequired: input.policy.humanReviewRequired,
      blockedResponseTypes: [...input.policy.blockedResponseTypes]
    },
    nextAction: input.callSummary.nextAction,
    guardrails: {
      browserOnly: true,
      persistentSaveAllowed: false,
      externalSendAllowed: false,
      productionPhoneConnectionAllowed: false
    }
  };
}

function getEventType(event: unknown): string | undefined {
  return getStringProperty(event, "type");
}

function getStringProperty(value: unknown, property: string): string {
  if (!value || typeof value !== "object" || !(property in value)) {
    return "";
  }

  const record = value as Record<string, unknown>;
  return typeof record[property] === "string" ? record[property] : "";
}

function extractResponseDoneTexts(event: unknown): string[] {
  if (!event || typeof event !== "object" || !("response" in event)) {
    return [];
  }

  const response = (event as { response?: unknown }).response;
  if (!response || typeof response !== "object" || !("output" in response)) {
    return [];
  }

  const output = (response as { output?: unknown }).output;
  if (!Array.isArray(output)) {
    return [];
  }

  return output
    .flatMap((item) => extractContentTexts(item))
    .map(normalizeTranscriptText)
    .filter((text) => text.length > 0);
}

function extractContentTexts(item: unknown): string[] {
  if (!item || typeof item !== "object" || !("content" in item)) {
    return [];
  }

  const content = (item as { content?: unknown }).content;
  if (!Array.isArray(content)) {
    return [];
  }

  return content.flatMap((part) => [
    getStringProperty(part, "transcript"),
    getStringProperty(part, "text")
  ]);
}

function normalizeTranscriptText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeTranscriptDelta(value: string): string {
  return value.replace(/\s+/g, " ");
}
