import type { AssistantEvidence } from "./app.js";
import {
  type EvidenceManifest,
  isEvidenceManifest,
  selectAssistantEvidenceFromManifest
} from "./evidence-manifest.js";

export interface EvidenceManifestResponse {
  ok: boolean;
  json(): Promise<unknown>;
}

export type EvidenceManifestFetcher = (url: string) => Promise<EvidenceManifestResponse>;

export interface LoadEvidenceManifestInput {
  url?: string;
  fetcher?: EvidenceManifestFetcher;
}

export interface LoadAssistantEvidenceFromManifestInput {
  fallback: AssistantEvidence;
  preferredCallId: string;
  url?: string;
  fetcher?: EvidenceManifestFetcher;
}

const defaultManifestUrl = "./assets/evidence-bundles.json";

export async function loadEvidenceManifest(
  input: LoadEvidenceManifestInput = {}
): Promise<EvidenceManifest | null> {
  try {
    const fetcher = input.fetcher ?? fetch;
    const response = await fetcher(input.url ?? defaultManifestUrl);

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();

    if (!isEvidenceManifest(payload)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function loadAssistantEvidenceFromManifest(
  input: LoadAssistantEvidenceFromManifestInput
): Promise<AssistantEvidence> {
  const manifest = await loadEvidenceManifest({
    url: input.url,
    fetcher: input.fetcher
  });

  if (!manifest) {
    return input.fallback;
  }

  return selectAssistantEvidenceFromManifest(manifest, input.preferredCallId, input.fallback);
}
