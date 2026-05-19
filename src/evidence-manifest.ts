import type { AssistantEvidence } from "./app.js";
import type { EvidenceBundle } from "./evidence-bridge.js";

export interface EvidenceManifest {
  version: 1;
  generatedAt: string;
  defaultCallId: string;
  bundles: Record<string, EvidenceBundle>;
}

export function toAssistantEvidence(bundle: EvidenceBundle): AssistantEvidence {
  return {
    callId: bundle.callId,
    query: bundle.query,
    resultCount: bundle.results.length,
    results: bundle.results.map((result) => ({
      sourcePath: result.sourcePath,
      section: result.section,
      snippet: result.snippet,
      score: result.score
    }))
  };
}

export function selectAssistantEvidenceByCallId(
  manifest: EvidenceManifest,
  callId: string,
  fallback: AssistantEvidence
): AssistantEvidence {
  const bundle = manifest.bundles[callId];

  return bundle ? toAssistantEvidence(bundle) : fallback;
}

export function selectAssistantEvidenceFromManifest(
  manifest: EvidenceManifest,
  preferredCallId: string,
  fallback: AssistantEvidence
): AssistantEvidence {
  const defaultEvidence = selectAssistantEvidenceByCallId(
    manifest,
    manifest.defaultCallId,
    fallback
  );

  return selectAssistantEvidenceByCallId(manifest, preferredCallId, defaultEvidence);
}

export function isEvidenceManifest(value: unknown): value is EvidenceManifest {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.version === 1 &&
    typeof value.generatedAt === "string" &&
    typeof value.defaultCallId === "string" &&
    isRecord(value.bundles)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
