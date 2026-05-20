import assert from "node:assert/strict";
import test from "node:test";
import { demoState, renderApp } from "../src/app.js";
import { demoScenarioRegressionCases } from "../src/demo-scenario-regression.js";
import { buildFallbackRehearsalPlan } from "../src/fallback-rehearsal.js";

test("buildFallbackRehearsalPlan creates a local manual demo plan without external dependencies", () => {
  const plan = buildFallbackRehearsalPlan({
    reason: "network-unavailable",
    scenarios: demoScenarioRegressionCases
  });

  assert.equal(plan.version, 1);
  assert.equal(plan.mode, "fallback-rehearsal");
  assert.equal(plan.reason, "network-unavailable");
  assert.equal(plan.scenarioCount, demoScenarioRegressionCases.length);
  assert.deepEqual(plan.guardrails, {
    externalSendAllowed: false,
    persistenceAllowed: false,
    realtimeAudioRequired: false,
    providerSdkRequired: false,
    manualProgressionAllowed: true
  });

  assert.deepEqual(
    plan.steps.map((step) => step.scenarioId),
    demoScenarioRegressionCases.map((scenarioCase) => scenarioCase.id)
  );
  assert.ok(
    plan.steps.every(
      (step, index) =>
        step.callId === demoScenarioRegressionCases[index]?.queueItem.id &&
        step.operatorNoteValue === demoScenarioRegressionCases[index]?.operatorNoteValue &&
        step.expectedPolicyOutcome === demoScenarioRegressionCases[index]?.expected.policyOutcome
    )
  );
});

test("renderApp displays fallback rehearsal status without implying send, save, or live connection", () => {
  const html = renderApp({
    ...demoState,
    fallbackRehearsal: buildFallbackRehearsalPlan({
      reason: "external-ai-unavailable",
      scenarios: demoScenarioRegressionCases
    })
  });

  assert.match(html, /Fallback rehearsal/);
  assert.match(html, /Manual progression/);
  assert.match(html, /External send/);
  assert.match(html, /blocked/);
  assert.match(html, /Persistent save/);
  assert.match(html, /CALL-SC-03/);
  assert.doesNotMatch(html, /送信済み/);
  assert.doesNotMatch(html, /保存済み/);
  assert.doesNotMatch(html, /Live API connected/);
});
