import {
  buildAssistantConversationDraft,
  buildAssistantInputPreview,
  buildConversationThreadPreview,
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
import {
  buildRealtimeCallControls,
  endRealtimeCallSession,
  startRealtimeCallSession,
  type RealtimeCallControls,
  type RealtimeCallSession
} from "./realtime-call-controls.js";
import { buildCallSummary, type CallSummary } from "./call-summary.js";
import {
  buildRealtimeCallHandoffRecord,
  createRealtimeTranscriptCollector,
  type RealtimeCallHandoffRecord,
  type RealtimeTranscriptCollector
} from "./realtime-call-recording.js";
import {
  buildRealtimeOperatorSessionContext,
  buildRealtimeTokenRequestBody
} from "./realtime-session-context.js";
import {
  buildResponsePolicyGuard,
  type ResponsePolicyGuard
} from "./response-policy.js";

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
let realtimeCallControls: RealtimeCallControls = buildRealtimeCallControls();
let realtimeCallSession: RealtimeCallSession | undefined;
let realtimeTranscriptCollector: RealtimeTranscriptCollector | undefined;
let realtimeCallHandoff: RealtimeCallHandoffRecord | undefined;
let realtimeCallRequestId = 0;

function renderCurrentState(): void {
  appRoot.innerHTML = renderApp({
    ...demoState,
    assistantEvidence: currentEvidence,
    operatorNotes: { ...operatorNotes },
    fallbackRehearsal,
    realtimeCallControls,
    realtimeCallHandoff
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

  const startCallButton = target.closest<HTMLButtonElement>("[data-realtime-start-call]");
  const endCallButton = target.closest<HTMLButtonElement>("[data-realtime-end-call]");

  if (startCallButton && appRoot.contains(startCallButton)) {
    void handleStartRealtimeCall();
    return;
  }

  if (endCallButton && appRoot.contains(endCallButton)) {
    handleEndRealtimeCall();
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
  realtimeCallHandoff = undefined;
  renderCurrentState();
});

renderCurrentState();

async function handleStartRealtimeCall(): Promise<void> {
  if (!realtimeCallControls.startCallAvailable) {
    return;
  }

  const requestId = realtimeCallRequestId + 1;
  realtimeCallRequestId = requestId;
  syncRenderedOperatorNote();
  realtimeCallHandoff = undefined;
  realtimeTranscriptCollector = createRealtimeTranscriptCollector();
  realtimeCallControls = buildRealtimeCallControls({
    status: "requesting-client-secret"
  });
  renderCurrentState();

  const result = await startRealtimeCallSession({
    tokenRequestBody: buildRealtimeTokenRequestBody(
      buildCurrentCallReviewContext().realtimeContext
    ),
    fetch,
    getUserMedia: (constraints) => navigator.mediaDevices.getUserMedia(constraints),
    createPeerConnection: () => new RTCPeerConnection(),
    onServerEvent: (event) => realtimeTranscriptCollector?.recordServerEvent(event)
  });

  if (requestId !== realtimeCallRequestId) {
    if (result.session) {
      endRealtimeCallSession(result.session);
    }
    realtimeTranscriptCollector = undefined;
    return;
  }

  realtimeCallSession = result.session;
  realtimeCallControls = result.controls;
  renderCurrentState();
}

function handleEndRealtimeCall(): void {
  realtimeCallRequestId += 1;

  if (!realtimeCallSession) {
    realtimeCallHandoff = buildCurrentRealtimeCallHandoff("fallback-recorded");
    realtimeCallControls = buildRealtimeCallControls({ status: "ended" });
    renderCurrentState();
    return;
  }

  syncRenderedOperatorNote();
  realtimeCallHandoff = buildCurrentRealtimeCallHandoff("recorded");
  realtimeCallControls = endRealtimeCallSession(realtimeCallSession);
  realtimeCallSession = undefined;
  realtimeTranscriptCollector = undefined;
  renderCurrentState();
}

interface CurrentCallReviewContext {
  realtimeContext: ReturnType<typeof buildRealtimeOperatorSessionContext>;
  callSummary: CallSummary;
  policy: ResponsePolicyGuard;
}

function buildCurrentCallReviewContext(): CurrentCallReviewContext {
  const selectedQueueItem = demoState.activeQueue.find(
    (item) => item.id === currentEvidence.callId
  );
  const conversationDraft = buildAssistantConversationDraft(
    selectedQueueItem,
    currentEvidence
  );
  const conversation = buildConversationThreadPreview(
    selectedQueueItem,
    conversationDraft
  );
  const operatorNoteValue = operatorNotes[conversationDraft.callId];
  const operatorInput = buildAssistantInputPreview(
    selectedQueueItem,
    conversationDraft,
    {
      value: operatorNoteValue
    }
  );
  const policy = buildResponsePolicyGuard({
    item: selectedQueueItem,
    evidence: currentEvidence,
    conversation,
    operatorInput
  });
  const context = buildRealtimeOperatorSessionContext({
    item: selectedQueueItem,
    evidence: currentEvidence,
    conversation,
    operatorInput,
    policy
  });
  const callSummary = buildCallSummary({
    item: selectedQueueItem,
    evidence: currentEvidence,
    conversation,
    operatorInput,
    policy
  });

  return {
    realtimeContext: context,
    callSummary,
    policy
  };
}

function buildCurrentRealtimeCallHandoff(
  status: RealtimeCallHandoffRecord["status"]
): RealtimeCallHandoffRecord {
  const context = buildCurrentCallReviewContext();

  return buildRealtimeCallHandoffRecord({
    status,
    callSummary: context.callSummary,
    policy: context.policy,
    transcript: realtimeTranscriptCollector?.getTranscript() ?? []
  });
}
