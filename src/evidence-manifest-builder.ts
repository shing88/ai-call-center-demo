import type { QueueItem } from "./app.js";
import {
  buildEvidenceBundle,
  type BuildEvidenceBundleInput
} from "./evidence-bridge.js";
import { loadKnowledgeBase, type KnowledgeBase } from "./knowledge.js";
import type { EvidenceManifest } from "./evidence-manifest.js";

export interface BuildEvidenceManifestInput {
  items: readonly QueueItem[];
  knowledgeBase?: KnowledgeBase;
  defaultCallId?: string;
  generatedAt?: string;
  categories?: BuildEvidenceBundleInput["categories"];
  limit?: BuildEvidenceBundleInput["limit"];
}

export function buildEvidenceManifest(input: BuildEvidenceManifestInput): EvidenceManifest {
  const knowledgeBase = input.knowledgeBase ?? loadKnowledgeBase();
  const bundles = Object.fromEntries(
    input.items.map((item) => [
      item.id,
      buildEvidenceBundle({
        item,
        chunks: knowledgeBase.chunks,
        categories: input.categories,
        limit: input.limit
      })
    ])
  );

  return {
    version: 1,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    defaultCallId: input.defaultCallId ?? input.items.at(-1)?.id ?? "",
    bundles
  };
}
