import type { QueueItem } from "./app.js";
import type { KnowledgeCategory } from "./knowledge.js";
import type {
  ResponsePolicyAllowedScope,
  ResponsePolicyIdentityVerification,
  ResponsePolicyOutcome
} from "./response-policy.js";

export interface DemoScenarioRegressionExpectation {
  evidenceSourcePaths: readonly string[];
  policyOutcome: ResponsePolicyOutcome;
  allowedResponseScope: ResponsePolicyAllowedScope;
  identityVerification: ResponsePolicyIdentityVerification;
  customerSpecificAnswerAllowed: boolean;
  humanReviewRequired: boolean;
  blockedResponseTypes: readonly string[];
}

export interface DemoScenarioRegressionCase {
  id: string;
  label: string;
  queueItem: QueueItem;
  operatorNoteValue: string;
  categories?: readonly KnowledgeCategory[];
  customerId?: string;
  evidenceLimit?: number;
  expected: DemoScenarioRegressionExpectation;
}

export const demoScenarioRegressionCases: readonly DemoScenarioRegressionCase[] = [
  {
    id: "identity-not-verified-cancellation-status",
    label: "本人確認前の解約受付状況",
    queueItem: {
      id: "CALL-SC-03",
      callerName: "大橋 里奈",
      topic: "解約受付状況の確認",
      status: "waiting",
      priority: "normal",
      waitSeconds: 58,
      excerpt:
        "解約済みのはずなのに状態がわからないため、今すぐ受付状況を教えてほしいです。"
    },
    operatorNoteValue: "本人確認はまだです。受付状況は断定しない。",
    categories: ["business_rules"],
    evidenceLimit: 3,
    expected: {
      evidenceSourcePaths: ["business_rules/003_cancellation_policy.md"],
      policyOutcome: "customer-specific-answer-blocked",
      allowedResponseScope: "general-information-only",
      identityVerification: "unverified",
      customerSpecificAnswerAllowed: false,
      humanReviewRequired: false,
      blockedResponseTypes: ["契約状態・受付状況の断定"]
    }
  },
  {
    id: "verified-refund-normal",
    label: "本人確認済みの通常返金相談",
    queueItem: {
      id: "CALL-SC-01",
      callerName: "秋山 真央",
      topic: "customer_1001 特約",
      status: "ai-handling",
      priority: "normal",
      waitSeconds: 44,
      excerpt: "初回の返品相談で返送手数料免除の可能性を確認します。"
    },
    operatorNoteValue: "本人確認済み。customer_1001の本人確認2点を照合済み。",
    categories: ["business_rules", "customer_contracts", "scenarios"],
    customerId: "customer_1001",
    evidenceLimit: 2,
    expected: {
      evidenceSourcePaths: [
        "customer_contracts/customer_1001.md",
        "scenarios/scenario_01_refund_normal.md"
      ],
      policyOutcome: "scoped-draft-allowed",
      allowedResponseScope: "verified-customer-context",
      identityVerification: "verified",
      customerSpecificAnswerAllowed: true,
      humanReviewRequired: false,
      blockedResponseTypes: []
    }
  },
  {
    id: "complaint-escalation-compensation",
    label: "苦情と補償要求の上席確認",
    queueItem: {
      id: "CALL-SC-04",
      callerName: "川村 翔",
      topic: "補償と上席対応の相談",
      status: "human-review",
      priority: "high",
      waitSeconds: 171,
      excerpt:
        "解約済みだと思っていたのに請求が続きました。補償してほしいので上席にもつないでください。"
    },
    operatorNoteValue: "本人確認済みです。解約後請求への苦情として上席確認へ回す。",
    categories: ["business_rules", "customer_contracts", "scenarios"],
    customerId: "customer_1003",
    evidenceLimit: 6,
    expected: {
      evidenceSourcePaths: [
        "business_rules/004_escalation_policy.md",
        "scenarios/scenario_04_complaint_escalation.md"
      ],
      policyOutcome: "human-review-required",
      allowedResponseScope: "handoff-only",
      identityVerification: "verified",
      customerSpecificAnswerAllowed: false,
      humanReviewRequired: true,
      blockedResponseTypes: ["補償可否の断定"]
    }
  }
];
