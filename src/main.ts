import {
  demoState,
  renderApp,
  type AssistantEvidence,
  type OperatorNotesByCallId
} from "./app.js";
import {
  selectAssistantEvidenceByCallId,
  selectAssistantEvidenceFromManifest
} from "./evidence-manifest.js";
import { loadEvidenceManifest } from "./evidence-manifest-client.js";
import { buildFallbackRehearsalPlan } from "./fallback-rehearsal.js";

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
const operatorNotes: OperatorNotesByCallId = {};
const fallbackRehearsal = buildFallbackRehearsalPlan({
  reason: manifest ? "manual-demo" : "network-unavailable"
});

function renderCurrentState(): void {
  appRoot.innerHTML = renderApp({
    ...demoState,
    assistantEvidence: currentEvidence,
    operatorNotes: { ...operatorNotes },
    fallbackRehearsal
  });
}

function syncRenderedOperatorNote(): void {
  const textarea = appRoot.querySelector<HTMLTextAreaElement>("[data-input-call-id]");
  const callId = textarea?.dataset.inputCallId;

  if (!textarea || !callId) {
    return;
  }

  operatorNotes[callId] = textarea.value;
}

appRoot.addEventListener("input", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLTextAreaElement) || !target.matches("[data-input-call-id]")) {
    return;
  }

  const callId = target.dataset.inputCallId;

  if (!callId) {
    return;
  }

  operatorNotes[callId] = target.value;
});

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

  syncRenderedOperatorNote();
  currentEvidence = nextEvidence;
  renderCurrentState();
});

renderCurrentState();
