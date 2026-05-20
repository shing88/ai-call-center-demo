import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAssistantConversationDraft,
  buildAssistantInputPreview,
  buildConversationThreadPreview,
  demoState
} from "../src/app.js";
import { buildResponsePolicyGuard } from "../src/response-policy.js";
import {
  buildRealtimeOperatorSessionContext,
  buildRealtimeTokenRequestBody
} from "../src/realtime-session-context.js";

test("buildRealtimeOperatorSessionContext turns selected call evidence and policy into compact instructions", () => {
  const item = demoState.activeQueue[0];
  const evidence = demoState.assistantEvidence;
  const draft = buildAssistantConversationDraft(item, evidence);
  const conversation = buildConversationThreadPreview(item, draft);
  const operatorInput = buildAssistantInputPreview(item, draft);
  const policy = buildResponsePolicyGuard({
    item,
    evidence,
    conversation,
    operatorInput
  });

  const context = buildRealtimeOperatorSessionContext({
    item,
    evidence,
    conversation,
    operatorInput,
    policy
  });

  assert.equal(context.version, 1);
  assert.equal(context.callId, evidence.callId);
  assert.equal(context.policy.outcome, policy.outcome);
  assert.match(context.instructions, /# Role and Objective/);
  assert.match(context.instructions, /# Grounding Context/);
  assert.match(context.instructions, /# Policy Guard/);
  assert.match(context.instructions, /Use only the selected call context and evidence references/);
  assert.match(context.instructions, new RegExp(item.topic));
  assert.match(context.instructions, new RegExp(policy.allowedResponseScope));
  assert.ok(context.evidenceReferences.length > 0);
  assert.doesNotMatch(context.instructions, /sk-/i);
  assert.doesNotMatch(context.instructions, /Bearer/i);
});

test("buildRealtimeTokenRequestBody carries the grounded instructions without secret material", () => {
  const item = demoState.activeQueue[0];
  const evidence = demoState.assistantEvidence;
  const draft = buildAssistantConversationDraft(item, evidence);
  const conversation = buildConversationThreadPreview(item, draft);
  const operatorInput = buildAssistantInputPreview(item, draft);
  const policy = buildResponsePolicyGuard({
    item,
    evidence,
    conversation,
    operatorInput
  });
  const context = buildRealtimeOperatorSessionContext({
    item,
    evidence,
    conversation,
    operatorInput,
    policy
  });

  const body = buildRealtimeTokenRequestBody(context);
  const serialized = JSON.stringify(body);

  assert.equal(body.callId, context.callId);
  assert.equal(body.operatorSessionId, `operator-demo-${context.callId}`);
  assert.equal(body.reviewGateId, `policy-${policy.outcome}`);
  assert.equal(body.realtimeGrounding.version, 1);
  assert.equal(body.realtimeGrounding.instructions, context.instructions);
  assert.deepEqual(body.realtimeGrounding.policy.blockedResponseTypes, policy.blockedResponseTypes);
  assert.doesNotMatch(serialized, /server-standard-key/);
  assert.doesNotMatch(serialized, /ek_/);
  assert.doesNotMatch(serialized, /sk-/i);
});
