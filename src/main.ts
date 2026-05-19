import { demoState, renderApp } from "./app.js";
import { loadAssistantEvidenceFromManifest } from "./evidence-manifest-client.js";

const root = document.querySelector<HTMLDivElement>("#app");

if (!root) {
  throw new Error("Application root #app was not found.");
}

const assistantEvidence = await loadAssistantEvidenceFromManifest({
  fallback: demoState.assistantEvidence,
  preferredCallId: demoState.assistantEvidence.callId
});

root.innerHTML = renderApp({
  ...demoState,
  assistantEvidence
});
