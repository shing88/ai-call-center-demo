import assert from "node:assert/strict";
import test from "node:test";
import { demoState } from "../src/app.js";
import { buildEvidenceManifest } from "../src/evidence-manifest-builder.js";
import {
  loadAssistantEvidenceFromManifest,
  loadEvidenceManifest
} from "../src/evidence-manifest-client.js";
import { loadKnowledgeBase } from "../src/knowledge.js";

test("loadEvidenceManifest reads a valid manifest response", async () => {
  const manifest = buildEvidenceManifest({
    generatedAt: "2026-05-19T00:00:00.000Z",
    items: demoState.activeQueue,
    knowledgeBase: loadKnowledgeBase(),
    defaultCallId: "CALL-CC-03",
    limit: 1
  });
  const loaded = await loadEvidenceManifest({
    fetcher: async () => ({
      ok: true,
      json: async () => manifest
    })
  });

  assert.equal(loaded?.defaultCallId, "CALL-CC-03");
  assert.equal(Object.keys(loaded?.bundles ?? {}).length, 3);
});

test("loadAssistantEvidenceFromManifest reads a valid manifest response", async () => {
  const manifest = buildEvidenceManifest({
    generatedAt: "2026-05-19T00:00:00.000Z",
    items: demoState.activeQueue,
    knowledgeBase: loadKnowledgeBase(),
    defaultCallId: "CALL-CC-03",
    limit: 1
  });
  const evidence = await loadAssistantEvidenceFromManifest({
    fallback: demoState.assistantEvidence,
    preferredCallId: "CALL-CC-03",
    fetcher: async () => ({
      ok: true,
      json: async () => manifest
    })
  });

  assert.equal(evidence.callId, "CALL-CC-03");
  assert.equal(evidence.resultCount, 1);
  assert.match(evidence.query, /CCNet光10G/);
});

test("loadAssistantEvidenceFromManifest falls back on fetch errors and invalid payloads", async () => {
  const fallback = demoState.assistantEvidence;
  const failed = await loadAssistantEvidenceFromManifest({
    fallback,
    preferredCallId: "CALL-CC-03",
    fetcher: async () => {
      throw new Error("network down");
    }
  });
  const invalid = await loadAssistantEvidenceFromManifest({
    fallback,
    preferredCallId: "CALL-CC-03",
    fetcher: async () => ({
      ok: true,
      json: async () => ({ bundles: [] })
    })
  });
  const notFound = await loadAssistantEvidenceFromManifest({
    fallback,
    preferredCallId: "CALL-CC-03",
    fetcher: async () => ({
      ok: false,
      json: async () => ({})
    })
  });

  assert.equal(failed, fallback);
  assert.equal(invalid, fallback);
  assert.equal(notFound, fallback);
});

test("loadEvidenceManifest returns null on fetch errors and invalid payloads", async () => {
  const failed = await loadEvidenceManifest({
    fetcher: async () => {
      throw new Error("network down");
    }
  });
  const invalid = await loadEvidenceManifest({
    fetcher: async () => ({
      ok: true,
      json: async () => ({ bundles: [] })
    })
  });
  const notFound = await loadEvidenceManifest({
    fetcher: async () => ({
      ok: false,
      json: async () => ({})
    })
  });

  assert.equal(failed, null);
  assert.equal(invalid, null);
  assert.equal(notFound, null);
});
