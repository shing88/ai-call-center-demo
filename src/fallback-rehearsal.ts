import {
  demoScenarioRegressionCases,
  type DemoScenarioRegressionCase
} from "./demo-scenario-cases.js";
import type { ResponsePolicyOutcome } from "./response-policy.js";

export type FallbackRehearsalReason =
  | "external-ai-unavailable"
  | "voice-unavailable"
  | "network-unavailable"
  | "manual-demo";

export interface FallbackRehearsalStep {
  scenarioId: string;
  label: string;
  callId: string;
  operatorNoteValue: string;
  manualAction: string;
  expectedPolicyOutcome: ResponsePolicyOutcome;
  humanReviewRequired: boolean;
}

export interface FallbackRehearsalPlan {
  version: 1;
  mode: "fallback-rehearsal";
  reason: FallbackRehearsalReason;
  statusText: string;
  operatorMessage: string;
  scenarioCount: number;
  steps: FallbackRehearsalStep[];
  guardrails: {
    externalSendAllowed: false;
    persistenceAllowed: false;
    realtimeAudioRequired: false;
    providerSdkRequired: false;
    manualProgressionAllowed: true;
  };
}

export interface BuildFallbackRehearsalPlanInput {
  reason?: FallbackRehearsalReason;
  scenarios?: readonly DemoScenarioRegressionCase[];
}

export function buildFallbackRehearsalPlan(
  input: BuildFallbackRehearsalPlanInput = {}
): FallbackRehearsalPlan {
  const reason = input.reason ?? "manual-demo";
  const scenarios = input.scenarios ?? demoScenarioRegressionCases;

  return {
    version: 1,
    mode: "fallback-rehearsal",
    reason,
    statusText: reasonStatusText(reason),
    operatorMessage:
      "外部送信と保存を止めたまま、固定済みシナリオを手動で進行できます。",
    scenarioCount: scenarios.length,
    steps: scenarios.map((scenarioCase, index) => ({
      scenarioId: scenarioCase.id,
      label: scenarioCase.label,
      callId: scenarioCase.queueItem.id,
      operatorNoteValue: scenarioCase.operatorNoteValue,
      manualAction: `${index + 1}. ${scenarioCase.label}を確認し、Operator noteを読み上げる。`,
      expectedPolicyOutcome: scenarioCase.expected.policyOutcome,
      humanReviewRequired: scenarioCase.expected.humanReviewRequired
    })),
    guardrails: {
      externalSendAllowed: false,
      persistenceAllowed: false,
      realtimeAudioRequired: false,
      providerSdkRequired: false,
      manualProgressionAllowed: true
    }
  };
}

function reasonStatusText(reason: FallbackRehearsalReason): string {
  const labels: Record<FallbackRehearsalReason, string> = {
    "external-ai-unavailable": "External AI unavailable",
    "voice-unavailable": "Voice unavailable",
    "network-unavailable": "Network unavailable",
    "manual-demo": "Manual rehearsal"
  };

  return labels[reason];
}
