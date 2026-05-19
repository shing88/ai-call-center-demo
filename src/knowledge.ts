import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

export const knowledgeCategories = [
  "business_rules",
  "customer_contracts",
  "scenarios"
] as const;

export type KnowledgeCategory = (typeof knowledgeCategories)[number];

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  category: KnowledgeCategory;
  sourcePath: string;
  title: string;
  heading: string;
  headingPath: string[];
  ordinal: number;
  content: string;
}

export interface KnowledgeDocument {
  id: string;
  category: KnowledgeCategory;
  sourcePath: string;
  title: string;
  frontmatter: Record<string, string>;
  content: string;
  chunks: KnowledgeChunk[];
}

export interface KnowledgeBase {
  rootDir: string;
  documents: KnowledgeDocument[];
  chunks: KnowledgeChunk[];
}

export interface LoadKnowledgeBaseOptions {
  rootDir?: string;
  categories?: readonly KnowledgeCategory[];
}

export interface ParseMarkdownDocumentInput {
  category: KnowledgeCategory;
  sourcePath: string;
  markdown: string;
}

interface ParsedFrontmatter {
  frontmatter: Record<string, string>;
  body: string;
}

const levelOneHeadingPattern = /^#\s+(.+?)\s*$/m;
const levelTwoHeadingPattern = /^##\s+(.+?)\s*$/gm;

export function loadKnowledgeBase(options: LoadKnowledgeBaseOptions = {}): KnowledgeBase {
  const rootDir = resolve(options.rootDir ?? join(process.cwd(), "knowledge"));
  const categories = options.categories ?? knowledgeCategories;
  const documents = categories.flatMap((category) => loadKnowledgeCategory(rootDir, category));

  return {
    rootDir,
    documents,
    chunks: documents.flatMap((document) => document.chunks)
  };
}

export function parseMarkdownDocument(input: ParseMarkdownDocumentInput): KnowledgeDocument {
  const sourcePath = normalizeKnowledgePath(input.sourcePath);
  const documentId = sourcePath.replace(/\.md$/i, "");
  const parsed = parseFrontmatter(normalizeLineEndings(input.markdown));
  const titleMatch = levelOneHeadingPattern.exec(parsed.body);

  if (!titleMatch) {
    throw new Error(`Knowledge document ${sourcePath} must include a level-1 heading.`);
  }

  const title = titleMatch[1]?.trim() ?? "";
  const content = parsed.body.trim();
  const chunks = buildChunks({
    body: parsed.body,
    category: input.category,
    documentId,
    sourcePath,
    title,
    titleLineEnd: titleMatch.index + titleMatch[0].length
  });

  if (chunks.length === 0) {
    throw new Error(`Knowledge document ${sourcePath} must include chunkable content.`);
  }

  return {
    id: documentId,
    category: input.category,
    sourcePath,
    title,
    frontmatter: parsed.frontmatter,
    content,
    chunks
  };
}

function loadKnowledgeCategory(rootDir: string, category: KnowledgeCategory): KnowledgeDocument[] {
  const categoryDir = join(rootDir, category);

  return listMarkdownFiles(categoryDir).map((filePath) => {
    const sourcePath = normalizeKnowledgePath(relative(rootDir, filePath));

    return parseMarkdownDocument({
      category,
      sourcePath,
      markdown: readFileSync(filePath, "utf8")
    });
  });
}

function listMarkdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        return listMarkdownFiles(entryPath);
      }

      return extname(entry.name).toLowerCase() === ".md" ? [entryPath] : [];
    })
    .sort((left, right) => left.localeCompare(right));
}

function buildChunks(input: {
  body: string;
  category: KnowledgeCategory;
  documentId: string;
  sourcePath: string;
  title: string;
  titleLineEnd: number;
}): KnowledgeChunk[] {
  const levelTwoHeadings = Array.from(input.body.matchAll(levelTwoHeadingPattern));
  const chunks: KnowledgeChunk[] = [];
  const introEnd = levelTwoHeadings[0]?.index ?? input.body.length;
  const introContent = trimMarkdownSection(input.body.slice(input.titleLineEnd, introEnd));

  if (introContent.length > 0) {
    chunks.push(
      createChunk({
        ...input,
        heading: input.title,
        headingPath: [input.title],
        ordinal: chunks.length + 1,
        content: introContent
      })
    );
  }

  for (const [index, headingMatch] of levelTwoHeadings.entries()) {
    const heading = headingMatch[1]?.trim() ?? "";
    const contentStart = headingMatch.index + headingMatch[0].length;
    const contentEnd = levelTwoHeadings[index + 1]?.index ?? input.body.length;
    const content = trimMarkdownSection(input.body.slice(contentStart, contentEnd));

    if (content.length === 0) {
      continue;
    }

    chunks.push(
      createChunk({
        ...input,
        heading,
        headingPath: [input.title, heading],
        ordinal: chunks.length + 1,
        content
      })
    );
  }

  return chunks;
}

function createChunk(input: {
  category: KnowledgeCategory;
  documentId: string;
  sourcePath: string;
  title: string;
  heading: string;
  headingPath: string[];
  ordinal: number;
  content: string;
}): KnowledgeChunk {
  return {
    id: `${input.documentId}#${String(input.ordinal).padStart(2, "0")}-${slugify(input.heading)}`,
    documentId: input.documentId,
    category: input.category,
    sourcePath: input.sourcePath,
    title: input.title,
    heading: input.heading,
    headingPath: input.headingPath,
    ordinal: input.ordinal,
    content: input.content
  };
}

function parseFrontmatter(markdown: string): ParsedFrontmatter {
  const frontmatterMatch = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(markdown);

  if (!frontmatterMatch) {
    return {
      frontmatter: {},
      body: markdown
    };
  }

  return {
    frontmatter: parseFrontmatterLines(frontmatterMatch[1] ?? ""),
    body: markdown.slice(frontmatterMatch[0].length)
  };
}

function parseFrontmatterLines(frontmatter: string): Record<string, string> {
  const entries: Record<string, string> = {};

  for (const line of frontmatter.split("\n")) {
    const colonIndex = line.indexOf(":");

    if (colonIndex === -1) {
      continue;
    }

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (key.length > 0) {
      entries[key] = value;
    }
  }

  return entries;
}

function normalizeLineEndings(value: string): string {
  return value.replaceAll("\r\n", "\n");
}

function normalizeKnowledgePath(value: string): string {
  return value.replaceAll("\\", "/");
}

function trimMarkdownSection(value: string): string {
  return value.trim();
}

function slugify(value: string): string {
  const slug = value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return slug.length > 0 ? slug : "section";
}
