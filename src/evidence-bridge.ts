import type { QueueItem } from "./app.js";
import {
  loadKnowledgeBase,
  type KnowledgeBase,
  type KnowledgeCategory,
  type KnowledgeChunk
} from "./knowledge.js";
import { searchKnowledge, type KnowledgeSearchResult } from "./knowledge-search.js";

export interface EvidenceBundle {
  callId: string;
  query: string;
  resultCount: number;
  results: KnowledgeSearchResult[];
}

export interface BuildEvidenceBundleInput {
  item: QueueItem;
  chunks: readonly KnowledgeChunk[];
  categories?: readonly KnowledgeCategory[];
  customerId?: string;
  limit?: number;
}

export interface LoadEvidenceBundleInput {
  item: QueueItem;
  knowledgeBase?: KnowledgeBase;
  categories?: readonly KnowledgeCategory[];
  customerId?: string;
  limit?: number;
}

export function buildKnowledgeQuery(item: QueueItem): string {
  return compactWhitespace(
    [
      item.topic,
      item.excerpt,
      item.customerId,
      item.serviceArea,
      item.servicePlan
    ].join(" ")
  );
}

export function buildEvidenceBundle(input: BuildEvidenceBundleInput): EvidenceBundle {
  const query = buildKnowledgeQuery(input.item);
  const customerId = input.customerId ?? input.item.customerId;
  const results =
    query.length === 0
      ? []
      : searchKnowledge({
          chunks: input.chunks,
          query,
          categories: input.categories,
          customerId,
          limit: input.limit
        });

  return {
    callId: input.item.id,
    query,
    resultCount: results.length,
    results
  };
}

export function loadEvidenceBundle(input: LoadEvidenceBundleInput): EvidenceBundle {
  const knowledgeBase = input.knowledgeBase ?? loadKnowledgeBase();

  return buildEvidenceBundle({
    item: input.item,
    chunks: knowledgeBase.chunks,
    categories: input.categories,
    customerId: input.customerId,
    limit: input.limit
  });
}

function compactWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
