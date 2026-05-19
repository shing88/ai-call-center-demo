import type { KnowledgeCategory, KnowledgeChunk } from "./knowledge.js";

export interface SearchKnowledgeInput {
  chunks: readonly KnowledgeChunk[];
  query: string;
  categories?: readonly KnowledgeCategory[];
  customerId?: string;
  limit?: number;
}

export interface KnowledgeSearchResult {
  id: string;
  documentId: string;
  category: KnowledgeCategory;
  sourcePath: string;
  title: string;
  section: string;
  headingPath: string[];
  snippet: string;
  score: number;
  matchedTerms: string[];
}

const defaultLimit = 8;
const snippetRadius = 48;

const synonymGroups: Record<string, readonly string[]> = {
  "返金": ["返金", "返品", "払い戻し", "返金額", "返金予定"],
  "解約": ["解約", "退会", "契約解除", "請求停止", "サービスをやめたい", "やめたい"],
  "本人確認": ["本人確認", "身元確認", "認証", "照合", "合言葉", "デモ顧客ID"],
  "上席確認": ["上席確認", "上席", "担当者", "引き継ぎ", "補償", "苦情", "法的", "SNS"]
};

export function searchKnowledge(input: SearchKnowledgeInput): KnowledgeSearchResult[] {
  const normalizedQuery = normalizeText(input.query);

  if (normalizedQuery.length === 0) {
    return [];
  }

  const terms = expandSearchTerms(normalizedQuery);
  const queryTokens = tokenize(normalizedQuery);
  const limit = input.limit ?? defaultLimit;

  return input.chunks
    .filter((chunk) => matchesFilters(chunk, input))
    .map((chunk) => scoreChunk(chunk, terms, queryTokens))
    .filter((result): result is KnowledgeSearchResult => result !== null)
    .sort(compareResults)
    .slice(0, limit);
}

export function expandSearchTerms(query: string): string[] {
  const normalizedQuery = normalizeText(query);
  const terms = new Set<string>();

  for (const token of tokenize(normalizedQuery)) {
    terms.add(token);
  }

  for (const [canonical, synonyms] of Object.entries(synonymGroups)) {
    const normalizedCanonical = normalizeText(canonical);
    const normalizedSynonyms = synonyms.map((synonym) => normalizeText(synonym));

    if (
      normalizedQuery.includes(normalizedCanonical) ||
      normalizedSynonyms.some((synonym) => normalizedQuery.includes(synonym))
    ) {
      terms.add(normalizedCanonical);

      for (const synonym of normalizedSynonyms) {
        terms.add(synonym);
      }
    }
  }

  return Array.from(terms).filter((term) => term.length > 0);
}

function matchesFilters(chunk: KnowledgeChunk, input: SearchKnowledgeInput): boolean {
  if (input.categories && !input.categories.includes(chunk.category)) {
    return false;
  }

  if (input.customerId && chunk.category === "customer_contracts") {
    return chunk.documentId.endsWith(input.customerId);
  }

  return true;
}

function scoreChunk(
  chunk: KnowledgeChunk,
  terms: readonly string[],
  queryTokens: readonly string[]
): KnowledgeSearchResult | null {
  const title = normalizeText(chunk.title);
  const heading = normalizeText(chunk.heading);
  const content = normalizeText(chunk.content);
  const sourcePath = normalizeText(chunk.sourcePath);
  const searchableText = compactWhitespace(`${title} ${heading} ${content}`);
  const matchedTerms: string[] = [];
  let score = 0;

  for (const term of terms) {
    let termScore = 0;

    if (title.includes(term)) {
      termScore += 6;
    }

    if (heading.includes(term)) {
      termScore += 5;
    }

    if (content.includes(term)) {
      termScore += 3;
    }

    if (sourcePath.includes(term)) {
      termScore += 1;
    }

    if (termScore > 0) {
      matchedTerms.push(term);
      score += termScore;
    }
  }

  score += scoreQueryCoverage(searchableText, queryTokens);
  score += scoreTermProximity(searchableText, matchedTerms);

  if (score === 0) {
    return null;
  }

  return {
    id: chunk.id,
    documentId: chunk.documentId,
    category: chunk.category,
    sourcePath: chunk.sourcePath,
    title: chunk.title,
    section: chunk.headingPath.join(" > "),
    headingPath: chunk.headingPath,
    snippet: buildSnippet(chunk, matchedTerms),
    score,
    matchedTerms
  };
}

function compareResults(left: KnowledgeSearchResult, right: KnowledgeSearchResult): number {
  return (
    right.score - left.score ||
    left.sourcePath.localeCompare(right.sourcePath) ||
    left.section.localeCompare(right.section)
  );
}

function scoreQueryCoverage(text: string, queryTokens: readonly string[]): number {
  if (queryTokens.length < 2) {
    return 0;
  }

  const matchedTokenCount = queryTokens.filter((token) => text.includes(token)).length;

  if (matchedTokenCount < 2) {
    return 0;
  }

  return matchedTokenCount * 4 + (matchedTokenCount === queryTokens.length ? 4 : 0);
}

function scoreTermProximity(text: string, matchedTerms: readonly string[]): number {
  const positions = matchedTerms
    .map((term) => text.indexOf(term))
    .filter((position) => position >= 0)
    .sort((left, right) => left - right);

  if (positions.length < 2) {
    return 0;
  }

  let smallestSpan = Number.POSITIVE_INFINITY;

  for (let index = 1; index < positions.length; index += 1) {
    smallestSpan = Math.min(smallestSpan, positions[index] - positions[index - 1]);
  }

  if (smallestSpan <= 48) {
    return 6;
  }

  if (smallestSpan <= 120) {
    return 3;
  }

  return 0;
}

function buildSnippet(chunk: KnowledgeChunk, matchedTerms: readonly string[]): string {
  const text = compactWhitespace(`${chunk.heading}\n${chunk.content}`);
  const normalizedText = normalizeText(text);
  const firstMatch = matchedTerms
    .map((term) => normalizedText.indexOf(term))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right)[0];

  if (firstMatch === undefined) {
    return text.slice(0, snippetRadius * 2);
  }

  const start = Math.max(0, firstMatch - snippetRadius);
  const end = Math.min(text.length, firstMatch + snippetRadius);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";

  return `${prefix}${text.slice(start, end)}${suffix}`;
}

function tokenize(value: string): string[] {
  return value
    .split(/[^\p{Letter}\p{Number}_]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

function compactWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeText(value: string): string {
  return compactWhitespace(value).normalize("NFKC").toLowerCase();
}
