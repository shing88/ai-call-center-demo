import assert from "node:assert/strict";
import test from "node:test";
import { demoState } from "../src/app.js";
import {
  isEvidenceManifest,
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
    defaultCallId: "CALL-1026",
    limit: 3
  });

  assert.equal(manifest.version, 1);
  assert.equal(manifest.generatedAt, "2026-05-19T00:00:00.000Z");
  assert.equal(manifest.defaultCallId, "CALL-1026");
  assert.deepEqual(Object.keys(manifest.bundles).sort(), ["CALL-1024", "CALL-1025", "CALL-1026"]);
  assert.equal(manifest.bundles["CALL-1026"]?.callId, "CALL-1026");
  assert.match(manifest.bundles["CALL-1026"]?.query ?? "", /返品受付/);
  assert.ok((manifest.bundles["CALL-1026"]?.resultCount ?? 0) > 0);
});

test("selectAssistantEvidenceFromManifest uses the preferred bundle and converts display fields", () => {
  const manifest = buildEvidenceManifest({
    generatedAt: "2026-05-19T00:00:00.000Z",
    items: demoState.activeQueue,
    knowledgeBase: loadKnowledgeBase(),
    defaultCallId: "CALL-1026",
    limit: 1
  });
  const selected = selectAssistantEvidenceFromManifest(
    manifest,
    "CALL-1026",
    demoState.assistantEvidence
  );

  assert.equal(selected.callId, "CALL-1026");
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

test("toAssistantEvidence strips search-only fields from EvidenceBundle results", () => {
  const manifest = buildEvidenceManifest({
    generatedAt: "2026-05-19T00:00:00.000Z",
    items: demoState.activeQueue,
    knowledgeBase: loadKnowledgeBase(),
    defaultCallId: "CALL-1026",
    limit: 1
  });
  const bundle = manifest.bundles["CALL-1026"];

  assert.ok(bundle);

  const displayEvidence = toAssistantEvidence(bundle);

  assert.deepEqual(Object.keys(displayEvidence.results[0] ?? {}).sort(), [
    "score",
    "section",
    "snippet",
    "sourcePath"
  ]);
});
