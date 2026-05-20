import type { AssistantEvidence } from "./app.js";
import type { EvidenceBundle } from "./evidence-bridge.js";

const manifestKnowledgeCategories = [
  "business_rules",
  "customer_contracts",
  "scenarios"
] as const;

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

  if (
    value.version !== 1 ||
    typeof value.generatedAt !== "string" ||
    typeof value.defaultCallId !== "string" ||
    !isRecord(value.bundles)
  ) {
    return false;
  }

  return Object.entries(value.bundles).every(([callId, bundle]) =>
    isEvidenceBundle(bundle, callId)
  );
}

function isEvidenceBundle(value: unknown, manifestCallId: string): value is EvidenceBundle {
  if (!isRecord(value)) {
    return false;
  }

  if (
    value.callId !== manifestCallId ||
    typeof value.query !== "string" ||
    typeof value.resultCount !== "number" ||
    !Number.isInteger(value.resultCount) ||
    value.resultCount < 0 ||
    !Array.isArray(value.results) ||
    value.resultCount !== value.results.length
  ) {
    return false;
  }

  return value.results.every(isKnowledgeSearchResult);
}

function isKnowledgeSearchResult(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.documentId === "string" &&
    typeof value.category === "string" &&
    (manifestKnowledgeCategories as readonly string[]).includes(value.category) &&
    typeof value.sourcePath === "string" &&
    typeof value.title === "string" &&
    typeof value.section === "string" &&
    Array.isArray(value.headingPath) &&
    value.headingPath.every((item) => typeof item === "string") &&
    typeof value.snippet === "string" &&
    typeof value.score === "number" &&
    Number.isFinite(value.score) &&
    Array.isArray(value.matchedTerms) &&
    value.matchedTerms.every((item) => typeof item === "string")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
