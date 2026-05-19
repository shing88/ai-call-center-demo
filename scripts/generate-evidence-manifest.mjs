import { mkdir, writeFile } from "node:fs/promises";

const manifestUrl = new URL("../dist/assets/evidence-bundles.json", import.meta.url);
const { demoState } = await import("../dist/assets/app.js");
const { buildEvidenceManifest } = await import("../dist/assets/evidence-manifest-builder.js");

await mkdir(new URL("../dist/assets/", import.meta.url), { recursive: true });

const manifest = buildEvidenceManifest({
  items: demoState.activeQueue,
  defaultCallId: demoState.assistantEvidence.callId,
  limit: 3
});

await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
