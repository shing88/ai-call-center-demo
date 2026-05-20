import {
  buildAiResponseRequest,
  type AiResponseRequest
} from "./ai-response-request.js";
import {
  createDeterministicAiResponseClient,
  type AiResponseClient,
  type AiResponseClientResult
} from "./ai-response-client.js";
import type { AssistantEvidence } from "./app.js";
import { loadEvidenceBundle } from "./evidence-bridge.js";
import {
  demoScenarioRegressionCases,
  type DemoScenarioRegressionCase
} from "./demo-scenario-cases.js";

export { demoScenarioRegressionCases, type DemoScenarioRegressionCase };

export interface RunDemoScenarioRegressionOptions {
  createdAt?: string;
  client?: AiResponseClient;
}

export interface DemoScenarioRegressionResult {
  scenarioId: string;
  label: string;
  evidence: AssistantEvidence;
  request: AiResponseRequest;
  clientResult: AiResponseClientResult;
}

export async function runDemoScenarioRegressionCase(
  scenarioCase: DemoScenarioRegressionCase,
  options: RunDemoScenarioRegressionOptions = {}
): Promise<DemoScenarioRegressionResult> {
  const evidence = buildScenarioEvidence(scenarioCase);
  const request = buildAiResponseRequest({
    item: scenarioCase.queueItem,
    evidence,
    operatorNoteValue: scenarioCase.operatorNoteValue,
    createdAt: options.createdAt
  });
  const client =
    options.client ??
    createDeterministicAiResponseClient({
      createdAt: options.createdAt
    });
  const clientResult = await client.createDraft(request);

  return {
    scenarioId: scenarioCase.id,
    label: scenarioCase.label,
    evidence,
    request,
    clientResult
  };
}

function buildScenarioEvidence(
  scenarioCase: DemoScenarioRegressionCase
): AssistantEvidence {
  const bundle = loadEvidenceBundle({
    item: scenarioCase.queueItem,
    categories: scenarioCase.categories,
    customerId: scenarioCase.customerId,
    limit: scenarioCase.evidenceLimit
  });

  return {
    callId: bundle.callId,
    query: bundle.query,
    resultCount: bundle.resultCount,
    results: bundle.results.map((candidate) => ({
      sourcePath: candidate.sourcePath,
      section: candidate.section,
      snippet: candidate.snippet,
      score: candidate.score
    }))
  };
}
