import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const compiledRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../src"
);

test("browser entrypoint dependency graph does not import Node-only modules", () => {
  const visited = new Set<string>();
  const nodeImports: string[] = [];

  visitModule(resolve(compiledRoot, "main.js"), visited, nodeImports);

  assert.deepEqual(nodeImports, []);
});

test("browser entrypoint keeps fetch bound to window", () => {
  const source = readFileSync(resolve(compiledRoot, "main.js"), "utf8");

  assert.match(source, /window\.fetch\(input, init\)/);
  assert.doesNotMatch(source, /startRealtimeCallSession\(\{\s*[\s\S]*?\n\s*fetch,/);
  assert.doesNotMatch(source, /loadRealtimeRuntimeHealth\(fetch\)/);
  assert.doesNotMatch(source, /saveRealtimeCallHandoffRecord\(fetch,/);
  assert.doesNotMatch(source, /loadRealtimeCallHandoffRecords\(fetch,/);
});

function visitModule(
  modulePath: string,
  visited: Set<string>,
  nodeImports: string[]
): void {
  if (visited.has(modulePath)) {
    return;
  }

  visited.add(modulePath);
  const source = readFileSync(modulePath, "utf8");
  const importSources = findStaticImportSources(source);

  for (const importSource of importSources) {
    if (importSource.startsWith("node:")) {
      nodeImports.push(`${modulePath} -> ${importSource}`);
      continue;
    }

    if (importSource.startsWith("./") || importSource.startsWith("../")) {
      visitModule(resolve(dirname(modulePath), importSource), visited, nodeImports);
    }
  }
}

function findStaticImportSources(source: string): string[] {
  return Array.from(
    source.matchAll(/^\s*import\s+(?:[^"']+\s+from\s+)?["']([^"']+)["'];/gm),
    (match) => match[1] ?? ""
  ).filter((value) => value.length > 0);
}
