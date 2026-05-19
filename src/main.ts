import { demoState, renderApp, type AssistantEvidence } from "./app.js";
import {
  selectAssistantEvidenceByCallId,
  selectAssistantEvidenceFromManifest
} from "./evidence-manifest.js";
import { loadEvidenceManifest } from "./evidence-manifest-client.js";

const root = document.querySelector<HTMLDivElement>("#app");

if (!root) {
  throw new Error("Application root #app was not found.");
}

const appRoot = root;
const manifest = await loadEvidenceManifest();
let currentEvidence: AssistantEvidence = manifest
  ? selectAssistantEvidenceFromManifest(
      manifest,
      demoState.assistantEvidence.callId,
      demoState.assistantEvidence
    )
  : demoState.assistantEvidence;

function renderCurrentState(): void {
  appRoot.innerHTML = renderApp({
    ...demoState,
    assistantEvidence: currentEvidence
  });
}

appRoot.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  const button = target.closest<HTMLButtonElement>("[data-queue-open]");

  if (!button || !appRoot.contains(button) || !manifest) {
    return;
  }

  const callId = button.dataset.queueOpen;

  if (!callId) {
    return;
  }

  const nextEvidence = selectAssistantEvidenceByCallId(
    manifest,
    callId,
    currentEvidence
  );

  if (nextEvidence === currentEvidence) {
    return;
  }

  currentEvidence = nextEvidence;
  renderCurrentState();
});

renderCurrentState();
