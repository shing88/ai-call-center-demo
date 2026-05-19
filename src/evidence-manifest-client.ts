import type { AssistantEvidence } from "./app.js";
import {
  isEvidenceManifest,
  selectAssistantEvidenceFromManifest
} from "./evidence-manifest.js";

export interface EvidenceManifestResponse {
  ok: boolean;
  json(): Promise<unknown>;
}

export type EvidenceManifestFetcher = (url: string) => Promise<EvidenceManifestResponse>;

export interface LoadAssistantEvidenceFromManifestInput {
  fallback: AssistantEvidence;
  preferredCallId: string;
  url?: string;
  fetcher?: EvidenceManifestFetcher;
}

const defaultManifestUrl = "./assets/evidence-bundles.json";

export async function loadAssistantEvidenceFromManifest(
  input: LoadAssistantEvidenceFromManifestInput
): Promise<AssistantEvidence> {
  const fetcher = input.fetcher ?? fetch;

  try {
    const response = await fetcher(input.url ?? defaultManifestUrl);

    if (!response.ok) {
      return input.fallback;
    }

    const payload = await response.json();

    if (!isEvidenceManifest(payload)) {
      return input.fallback;
    }

    return selectAssistantEvidenceFromManifest(payload, input.preferredCallId, input.fallback);
  } catch {
    return input.fallback;
  }
}
