import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRealtimeCallHandoffRecord,
  createRealtimeTranscriptCollector,
  type RealtimeTranscriptEntry
} from "../src/realtime-call-recording.js";
import type { CallSummary } from "../src/call-summary.js";
import type { ResponsePolicyGuard } from "../src/response-policy.js";

test("Realtime transcript collector records assistant transcript deltas from server events", () => {
  const collector = createRealtimeTranscriptCollector();

  collector.recordServerEvent({
    type: "response.output_audio_transcript.delta",
    delta: "Please "
  });
  collector.recordServerEvent({
    type: "response.output_audio_transcript.delta",
    delta: "confirm your service area."
  });
  collector.recordServerEvent({
    type: "response.output_audio_transcript.done",
    transcript: "Please confirm your service area."
  });

  assert.deepEqual(collector.getTranscript(), [
    {
      role: "assistant",
      text: "Please confirm your service area.",
      sourceEventType: "response.output_audio_transcript.done",
      final: true
    }
  ]);
});

test("Realtime transcript collector extracts transcript text from response.done fallback", () => {
  const collector = createRealtimeTranscriptCollector();

  collector.recordServerEvent({
    type: "response.done",
    response: {
      output: [
        {
          content: [
            {
              transcript: "I can share general guidance before identity verification."
            }
          ]
        }
      ]
    }
  });

  assert.deepEqual(collector.getTranscript(), [
    {
      role: "assistant",
      text: "I can share general guidance before identity verification.",
      sourceEventType: "response.done",
      final: true
    }
  ]);
});

test("buildRealtimeCallHandoffRecord keeps transcript, policy, evidence, and next action browser-only", () => {
  const transcript: RealtimeTranscriptEntry[] = [
    {
      role: "customer",
      text: "Can I change my contract today?",
      sourceEventType: "input_audio_transcription.done",
      final: true
    },
    {
      role: "assistant",
      text: "Identity verification is needed before account-specific changes.",
      sourceEventType: "response.output_audio_transcript.done",
      final: true
    }
  ];
  const record = buildRealtimeCallHandoffRecord({
    status: "recorded",
    callSummary: sampleCallSummary,
    policy: samplePolicy,
    transcript
  });

  assert.equal(record.callId, "CALL-1");
  assert.equal(record.status, "recorded");
  assert.deepEqual(record.transcript, transcript);
  assert.equal(record.summary, sampleCallSummary.inquirySummary);
  assert.deepEqual(record.evidenceReferences, [
    "business_rules/demo.md / Demo section"
  ]);
  assert.deepEqual(record.policyDecision, {
    outcome: "customer-specific-answer-blocked",
    allowedResponseScope: "general-information-only",
    customerSpecificAnswerAllowed: false,
    humanReviewRequired: false,
    blockedResponseTypes: ["account-specific contract change"]
  });
  assert.equal(record.nextAction, sampleCallSummary.nextAction);
  assert.deepEqual(record.guardrails, {
    browserOnly: true,
    persistentSaveAllowed: false,
    externalSendAllowed: false,
    productionPhoneConnectionAllowed: false
  });
});

const sampleCallSummary: CallSummary = {
  version: 1,
  callId: "CALL-1",
  inquirySummary: "Customer asks about an account-specific contract change.",
  evidenceReferences: ["business_rules/demo.md / Demo section"],
  policyDecision: {
    outcome: "customer-specific-answer-blocked",
    allowedResponseScope: "general-information-only",
    summary:
      "Customer-specific answer blocked. Scope: general-information-only; human review not required."
  },
  operatorNoteStatus: {
    hasContent: true,
    summary: "Operator note candidate present; browser-only; not sent or saved."
  },
  nextAction: "Complete identity verification before account-specific guidance.",
  guardrails: {
    externalSendAllowed: false,
    persistenceAllowed: false,
    summaryOnly: true
  }
};

const samplePolicy: ResponsePolicyGuard = {
  version: 1,
  outcome: "customer-specific-answer-blocked",
  allowedResponseScope: "general-information-only",
  identityVerification: "unverified",
  customerSpecificAnswerAllowed: false,
  humanReviewRequired: false,
  allowedTopics: ["general guidance"],
  blockedResponseTypes: ["account-specific contract change"],
  reasons: ["Identity is not verified."],
  evidenceReferences: ["business_rules/demo.md / Demo section"],
  guardrails: {
    externalSendAllowed: false,
    persistenceAllowed: false,
    policyDecisionOnly: true
  }
};
