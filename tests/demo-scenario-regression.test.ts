import assert from "node:assert/strict";
import test from "node:test";
import {
  demoScenarioRegressionCases,
  runDemoScenarioRegressionCase
} from "../src/demo-scenario-regression.js";

test("demo scenario regression cases pin evidence, policy, request, and client outcomes", async () => {
  for (const scenarioCase of demoScenarioRegressionCases) {
    const result = await runDemoScenarioRegressionCase(scenarioCase, {
      createdAt: "2026-05-20T02:00:00.000Z"
    });

    assert.equal(result.scenarioId, scenarioCase.id);
    assert.equal(result.evidence.callId, scenarioCase.queueItem.id);
    assert.equal(result.request.callId, scenarioCase.queueItem.id);
    assert.equal(result.clientResult.callId, scenarioCase.queueItem.id);
    assert.equal(result.request.operatorInput.value, scenarioCase.operatorNoteValue);

    for (const sourcePath of scenarioCase.expected.evidenceSourcePaths) {
      assert.ok(
        result.evidence.results.some((candidate) => candidate.sourcePath === sourcePath),
        `${scenarioCase.id} should include evidence source ${sourcePath}`
      );
    }

    assert.equal(result.request.policy.outcome, scenarioCase.expected.policyOutcome);
    assert.equal(
      result.request.policy.allowedResponseScope,
      scenarioCase.expected.allowedResponseScope
    );
    assert.equal(
      result.request.policy.identityVerification,
      scenarioCase.expected.identityVerification
    );
    assert.equal(
      result.request.policy.customerSpecificAnswerAllowed,
      scenarioCase.expected.customerSpecificAnswerAllowed
    );
    assert.equal(
      result.request.policy.humanReviewRequired,
      scenarioCase.expected.humanReviewRequired
    );

    for (const blockedType of scenarioCase.expected.blockedResponseTypes) {
      assert.ok(
        result.request.policy.blockedResponseTypes.includes(blockedType),
        `${scenarioCase.id} should block ${blockedType}`
      );
    }

    assert.deepEqual(result.request.guardrails, {
      externalSendAllowed: false,
      persistenceAllowed: false,
      humanReviewRequired: scenarioCase.expected.humanReviewRequired
    });
    assert.deepEqual(result.clientResult.guardrails.externalSendAllowed, false);
    assert.deepEqual(result.clientResult.guardrails.persistenceAllowed, false);
    assert.equal(
      result.clientResult.guardrails.humanReviewRequired,
      scenarioCase.expected.humanReviewRequired
    );
    assert.equal(result.clientResult.policy.outcome, scenarioCase.expected.policyOutcome);
    assert.equal(result.clientResult.diagnostics.operatorInputIncluded, true);
    assert.equal(
      result.clientResult.diagnostics.evidenceCount,
      result.evidence.results.length
    );
  }
});
