import assert from "node:assert/strict";
import test from "node:test";
import { demoState } from "../src/app.js";
import {
  isEvidenceManifest,
  selectAssistantEvidenceByCallId,
  selectAssistantEvidenceFromManifest,
  toAssistantEvidence
} from "../src/evidence-manifest.js";
import { buildEvidenceManifest } from "../src/evidence-manifest-builder.js";
import { loadKnowledgeBase } from "../src/knowledge.js";

test("buildEvidenceManifest creates a bundle for each demo queue item", () => {
  const manifest = buildEvidenceManifest({
    generatedAt: "2026-05-19T00:00:00.000Z",
    items: demoState.activeQueue,
    knowledgeBase: loadKnowledgeBase(),
    defaultCallId: "CALL-CC-03",
    limit: 3
  });

  assert.equal(manifest.version, 1);
  assert.equal(manifest.generatedAt, "2026-05-19T00:00:00.000Z");
  assert.equal(manifest.defaultCallId, "CALL-CC-03");
  assert.deepEqual(Object.keys(manifest.bundles).sort(), [
    "CALL-CC-01",
    "CALL-CC-02",
    "CALL-CC-03"
  ]);
  assert.equal(manifest.bundles["CALL-CC-03"]?.callId, "CALL-CC-03");
  assert.match(manifest.bundles["CALL-CC-03"]?.query ?? "", /CCNet光10G/);
  assert.match(manifest.bundles["CALL-CC-03"]?.query ?? "", /customer_ccnet_2001/);
  assert.ok((manifest.bundles["CALL-CC-03"]?.resultCount ?? 0) > 0);
});

test("buildEvidenceManifest keeps CCNet customer contract evidence scoped to the selected fictional customer", () => {
  const manifest = buildEvidenceManifest({
    generatedAt: "2026-05-19T00:00:00.000Z",
    items: demoState.activeQueue,
    knowledgeBase: loadKnowledgeBase(),
    defaultCallId: "CALL-CC-03",
    categories: ["customer_contracts"],
    limit: 3
  });

  const sourcePaths = manifest.bundles["CALL-CC-03"]?.results.map((result) => result.sourcePath);

  assert.deepEqual(Array.from(new Set(sourcePaths)), [
    "customer_contracts/customer_ccnet_2001.md"
  ]);
});

test("selectAssistantEvidenceFromManifest uses the preferred bundle and converts display fields", () => {
  const manifest = buildEvidenceManifest({
    generatedAt: "2026-05-19T00:00:00.000Z",
    items: demoState.activeQueue,
    knowledgeBase: loadKnowledgeBase(),
    defaultCallId: "CALL-CC-03",
    limit: 1
  });
  const selected = selectAssistantEvidenceFromManifest(
    manifest,
    "CALL-CC-03",
    demoState.assistantEvidence
  );

  assert.equal(selected.callId, "CALL-CC-03");
  assert.equal(selected.resultCount, 1);
  assert.equal(selected.results.length, 1);
  assert.equal(typeof selected.results[0]?.sourcePath, "string");
  assert.equal(typeof selected.results[0]?.section, "string");
  assert.equal(typeof selected.results[0]?.snippet, "string");
  assert.equal(typeof selected.results[0]?.score, "number");
});

test("manifest helpers safely fall back when the payload is invalid or missing a bundle", () => {
  assert.equal(isEvidenceManifest({ bundles: [] }), false);

  const fallback = demoState.assistantEvidence;
  const manifest = buildEvidenceManifest({
    generatedAt: "2026-05-19T00:00:00.000Z",
    items: [],
    defaultCallId: "CALL-404"
  });

  assert.equal(selectAssistantEvidenceFromManifest(manifest, "CALL-404", fallback), fallback);
});

test("selectAssistantEvidenceByCallId keeps the current evidence when a bundle is missing", () => {
  const manifest = buildEvidenceManifest({
    generatedAt: "2026-05-19T00:00:00.000Z",
    items: demoState.activeQueue,
    knowledgeBase: loadKnowledgeBase(),
    defaultCallId: "CALL-CC-03",
    limit: 1
  });
  const selected = selectAssistantEvidenceByCallId(
    manifest,
    "CALL-CC-02",
    demoState.assistantEvidence
  );
  const missing = selectAssistantEvidenceByCallId(
    manifest,
    "CALL-404",
    demoState.assistantEvidence
  );

  assert.equal(selected.callId, "CALL-CC-02");
  assert.notEqual(selected, demoState.assistantEvidence);
  assert.equal(selected.resultCount, selected.results.length);
  assert.equal(missing, demoState.assistantEvidence);
});

test("toAssistantEvidence strips search-only fields from EvidenceBundle results", () => {
  const manifest = buildEvidenceManifest({
    generatedAt: "2026-05-19T00:00:00.000Z",
    items: demoState.activeQueue,
    knowledgeBase: loadKnowledgeBase(),
    defaultCallId: "CALL-CC-03",
    limit: 1
  });
  const bundle = manifest.bundles["CALL-CC-03"];

  assert.ok(bundle);

  const displayEvidence = toAssistantEvidence(bundle);

  assert.deepEqual(Object.keys(displayEvidence.results[0] ?? {}).sort(), [
    "score",
    "section",
    "snippet",
    "sourcePath"
  ]);
});
