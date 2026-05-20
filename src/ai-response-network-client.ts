import type { AiResponseClient, AiResponseClientResult } from "./ai-response-client.js";

export interface AiResponseNetworkFetchInit {
  method: "POST";
  headers: Record<string, string>;
  body: string;
}

export interface AiResponseNetworkResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type AiResponseNetworkFetcher = (
  url: string,
  init: AiResponseNetworkFetchInit
) => Promise<AiResponseNetworkResponse>;

export interface AiResponseNetworkClientOptions {
  endpointUrl: string;
  provider: string;
  model: string;
  fetcher?: AiResponseNetworkFetcher;
  headers?: Record<string, string>;
}

export class AiResponseNetworkClientError extends Error {
  constructor(
    message: string,
    readonly code: "http_error" | "invalid_payload" | "call_id_mismatch"
  ) {
    super(message);
    this.name = "AiResponseNetworkClientError";
  }
}

export function createAiResponseNetworkClient(
  options: AiResponseNetworkClientOptions
): AiResponseClient {
  const fetcher = options.fetcher ?? defaultFetcher;

  return {
    provider: options.provider,
    model: options.model,
    async createDraft(request) {
      const response = await fetcher(options.endpointUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          ...options.headers
        },
        body: JSON.stringify({
          request,
          provider: options.provider,
          model: options.model
        })
      });

      if (!response.ok) {
        throw new AiResponseNetworkClientError(
          `AI response network client failed with HTTP ${response.status}.`,
          "http_error"
        );
      }

      const payload = await response.json();

      if (!isAiResponseClientResult(payload)) {
        throw new AiResponseNetworkClientError(
          "AI response network client received an invalid payload.",
          "invalid_payload"
        );
      }

      if (payload.callId !== request.callId) {
        throw new AiResponseNetworkClientError(
          `AI response network client received ${payload.callId} for ${request.callId}.`,
          "call_id_mismatch"
        );
      }

      return payload;
    }
  };
}

function isAiResponseClientResult(value: unknown): value is AiResponseClientResult {
  if (!isRecord(value) || value.version !== 1 || value.status !== "drafted") {
    return false;
  }

  if (
    typeof value.provider !== "string" ||
    typeof value.model !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.callId !== "string"
  ) {
    return false;
  }

  if (!isRecord(value.response) || !isRecord(value.guardrails) || !isRecord(value.diagnostics)) {
    return false;
  }

  return (
    typeof value.response.text === "string" &&
    typeof value.response.handoffNote === "string" &&
    Array.isArray(value.response.evidenceReferences) &&
    value.response.evidenceReferences.every((item) => typeof item === "string") &&
    value.guardrails.externalSendAllowed === false &&
    value.guardrails.persistenceAllowed === false &&
    typeof value.guardrails.humanReviewRequired === "boolean" &&
    (typeof value.guardrails.reviewReason === "string" ||
      value.guardrails.reviewReason === null) &&
    typeof value.diagnostics.evidenceCount === "number" &&
    typeof value.diagnostics.promptCharacterCount === "number" &&
    typeof value.diagnostics.operatorInputIncluded === "boolean"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const defaultFetcher: AiResponseNetworkFetcher = async (url, init) => {
  const response = await fetch(url, init);

  return {
    ok: response.ok,
    status: response.status,
    json: () => response.json()
  };
};
