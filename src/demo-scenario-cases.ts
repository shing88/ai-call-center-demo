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
  },
  {
    id: "ccnet-existing-net-add-cableplus",
    label: "ネット加入者のケーブルプラス電話追加",
    queueItem: {
      id: "CALL-SC-06",
      callerName: "森 彩乃",
      topic: "ケーブルプラス電話 追加",
      status: "waiting",
      priority: "normal",
      waitSeconds: 96,
      excerpt:
        "今のCCNet光1Gに固定電話を追加したいです。家の電話番号と電話機を使い続けられるか、auスマホとのセットも知りたいです。",
      customerId: "customer_ccnet_2004",
      serviceArea: "豊川市 / 戸建て",
      servicePlan: "CCNet光1G + メッシュWi-Fi / 固定電話未加入",
      verificationStatus: "unverified"
    },
    operatorNoteValue:
      "挨拶済み。既契約者の電話申込は契約者本人のみ。氏名、住所、登録電話番号、本人からの架電を確認するまで追加可否、番号継続、割引適用、最終料金は断定しない。ケーブルプラス電話とケーブルラインの選択肢を整理する。",
    categories: ["business_rules", "customer_contracts", "scenarios"],
    customerId: "customer_ccnet_2004",
    evidenceLimit: 5,
    expected: {
      evidenceSourcePaths: [
        "business_rules/005_ccnet_public_service_guidance.md",
        "customer_contracts/customer_ccnet_2004.md",
        "scenarios/scenario_06_ccnet_cableplus_existing_net_add.md"
      ],
      policyOutcome: "customer-specific-answer-blocked",
      allowedResponseScope: "general-information-only",
      identityVerification: "unverified",
      customerSpecificAnswerAllowed: false,
      humanReviewRequired: false,
      blockedResponseTypes: ["契約状態・受付状況の断定"]
    }
  },
  {
    id: "ccnet-new-internet-cableplus-recommendation",
    label: "ネット新規加入時のケーブルプラス電話提案",
    queueItem: {
      id: "CALL-SC-07",
      callerName: "西村 陽太",
      topic: "ネット新規加入 ケーブルプラス電話",
      status: "ai-handling",
      priority: "normal",
      waitSeconds: 52,
      excerpt:
        "新築戸建てでネットを新規契約したいです。UQ mobileを使っていて、固定電話もまとめた方がよいか相談したいです。",
      customerId: "customer_ccnet_2005",
      serviceArea: "小牧市 / 新築戸建て予定",
      servicePlan: "CCNet未加入 / ネット新規検討 + 固定電話検討",
      verificationStatus: "unverified"
    },
    operatorNoteValue:
      "挨拶済み。新規加入検討として住居種別、提供エリア、利用目的、携帯キャリア、固定電話の必要性を確認する。申込可否、工事費、番号継続、キャンペーン適用、最終月額は断定しない。",
    categories: ["business_rules", "customer_contracts", "scenarios"],
    customerId: "customer_ccnet_2005",
    evidenceLimit: 5,
    expected: {
      evidenceSourcePaths: [
        "business_rules/005_ccnet_public_service_guidance.md",
        "customer_contracts/customer_ccnet_2005.md",
        "scenarios/scenario_07_ccnet_new_internet_cableplus_recommendation.md"
      ],
      policyOutcome: "customer-specific-answer-blocked",
      allowedResponseScope: "general-information-only",
      identityVerification: "unverified",
      customerSpecificAnswerAllowed: false,
      humanReviewRequired: false,
      blockedResponseTypes: ["契約状態・受付状況の断定"]
    }
  }
];
