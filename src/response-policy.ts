import type {
  AssistantEvidence,
  AssistantInputPreview,
  ConversationThreadPreview,
  QueueItem
} from "./app.js";

export type ResponsePolicyOutcome =
  | "general-guidance-only"
  | "customer-specific-answer-blocked"
  | "human-review-required"
  | "scoped-draft-allowed";

export type ResponsePolicyAllowedScope =
  | "general-information-only"
  | "handoff-only"
  | "verified-customer-context";

export type ResponsePolicyIdentityVerification = "verified" | "unverified";

export interface ResponsePolicyGuard {
  version: 1;
  outcome: ResponsePolicyOutcome;
  allowedResponseScope: ResponsePolicyAllowedScope;
  identityVerification: ResponsePolicyIdentityVerification;
  customerSpecificAnswerAllowed: boolean;
  humanReviewRequired: boolean;
  allowedTopics: string[];
  blockedResponseTypes: string[];
  reasons: string[];
  evidenceReferences: string[];
  guardrails: {
    externalSendAllowed: false;
    persistenceAllowed: false;
    policyDecisionOnly: true;
  };
}

export interface BuildResponsePolicyGuardInput {
  item: QueueItem | undefined;
  evidence: AssistantEvidence;
  conversation: ConversationThreadPreview;
  operatorInput: AssistantInputPreview;
}

const identityVerifiedTerms = [
  "本人確認済み",
  "本人確認完了",
  "本人確認は完了",
  "identity verified",
  "verified identity"
];

const escalationTerms = [
  "上席",
  "補償",
  "苦情",
  "法的",
  "sns",
  "監督官庁",
  "クレーム"
];

const customerSpecificTerms = [
  "契約状態",
  "返金可否",
  "返金額",
  "返金予定",
  "特約",
  "登録済み連絡先",
  "支払い状況",
  "過去の問い合わせ",
  "受付状況",
  "請求状態"
];

export function buildResponsePolicyGuard(
  input: BuildResponsePolicyGuardInput
): ResponsePolicyGuard {
  const combinedText = normalizeText(collectPolicyText(input));
  const identityVerification = containsAny(combinedText, identityVerifiedTerms)
    ? "verified"
    : "unverified";
  const escalationDetected =
    input.item?.status === "human-review" ||
    input.item?.priority === "high" ||
    containsAny(combinedText, escalationTerms) ||
    input.evidence.results.some((result) =>
      result.sourcePath.includes("004_escalation_policy.md")
    );
  const customerSpecificDetected = containsAny(combinedText, customerSpecificTerms);

  if (escalationDetected) {
    return withGuardrails({
      outcome: "human-review-required",
      allowedResponseScope: "handoff-only",
      identityVerification,
      customerSpecificAnswerAllowed: false,
      humanReviewRequired: true,
      allowedTopics: [
        "不快な体験への謝意",
        "担当者へ引き継ぐ理由",
        "AIが確定回答していないこと"
      ],
      blockedResponseTypes: [
        "補償可否の断定",
        "顧客別の契約状態・請求状態の断定",
        "外部送信または永続保存の示唆"
      ],
      reasons: buildEscalationReasons(input, combinedText),
      evidenceReferences: evidenceReferences(input.evidence)
    });
  }

  if (identityVerification === "unverified" && customerSpecificDetected) {
    return withGuardrails({
      outcome: "customer-specific-answer-blocked",
      allowedResponseScope: "general-information-only",
      identityVerification,
      customerSpecificAnswerAllowed: false,
      humanReviewRequired: false,
      allowedTopics: [
        "一般的な受付時間・手続き",
        "本人確認が必要になる理由",
        "手元に用意してほしい情報の種類"
      ],
      blockedResponseTypes: [
        "顧客別の返金可否・返金額・返金予定",
        "契約状態・受付状況の断定",
        "顧客契約ファイルにある注意事項の具体内容"
      ],
      reasons: [
        "本人確認前のため、顧客別の契約状態や返金予定は回答しない。",
        "本人確認前は一般的な手続きと確認理由だけを案内する。"
      ],
      evidenceReferences: evidenceReferences(input.evidence)
    });
  }

  if (identityVerification === "verified") {
    return withGuardrails({
      outcome: "scoped-draft-allowed",
      allowedResponseScope: "verified-customer-context",
      identityVerification,
      customerSpecificAnswerAllowed: true,
      humanReviewRequired: false,
      allowedTopics: [
        "根拠候補に基づく回答ドラフト",
        "本人確認後に扱える顧客文脈",
        "担当者確認前の下書き"
      ],
      blockedResponseTypes: [],
      reasons: [
        "本人確認済みのoperator inputがあり、上席確認シグナルは検出されていない。"
      ],
      evidenceReferences: evidenceReferences(input.evidence)
    });
  }

  return withGuardrails({
    outcome: "general-guidance-only",
    allowedResponseScope: "general-information-only",
    identityVerification,
    customerSpecificAnswerAllowed: false,
    humanReviewRequired: false,
    allowedTopics: [
      "一般的な受付時間・手続き",
      "本人確認が必要になる理由",
      "手元に用意してほしい情報の種類"
    ],
    blockedResponseTypes: ["顧客別の契約状態・請求状態の断定"],
    reasons: [
      "本人確認済みのoperator inputがないため、一般情報だけに制限する。"
    ],
    evidenceReferences: evidenceReferences(input.evidence)
  });
}

function withGuardrails(
  policy: Omit<ResponsePolicyGuard, "version" | "guardrails">
): ResponsePolicyGuard {
  return {
    version: 1,
    ...policy,
    guardrails: {
      externalSendAllowed: false,
      persistenceAllowed: false,
      policyDecisionOnly: true
    }
  };
}

function buildEscalationReasons(
  input: BuildResponsePolicyGuardInput,
  combinedText: string
): string[] {
  const reasons: string[] = [];

  if (input.item?.status === "human-review" || input.item?.priority === "high") {
    reasons.push("キュー状態が人の確認またはhigh priorityのため、上席確認を優先する。");
  }

  if (
    containsAny(combinedText, escalationTerms) ||
    input.evidence.results.some((result) =>
      result.sourcePath.includes("004_escalation_policy.md")
    )
  ) {
    reasons.push("補償、苦情、法的主張、上席確認などの上席確認シグナルを検出した。");
  }

  if (reasons.length === 0) {
    reasons.push("上席確認ルールに該当する可能性があるため、AIだけで確定回答しない。");
  }

  return reasons;
}

function evidenceReferences(evidence: AssistantEvidence): string[] {
  const references = evidence.results.map(
    (result) => `${result.sourcePath} / ${result.section}`
  );

  return Array.from(new Set(references));
}

function collectPolicyText(input: BuildResponsePolicyGuardInput): string {
  const itemText = input.item
    ? [
        input.item.callerName,
        input.item.topic,
        input.item.status,
        input.item.priority,
        input.item.excerpt
      ].join(" ")
    : "";
  const evidenceText = [
    input.evidence.query,
    ...input.evidence.results.flatMap((result) => [
      result.sourcePath,
      result.section,
      result.snippet
    ])
  ].join(" ");
  const conversationText = input.conversation.messages
    .map((message) => `${message.label} ${message.body}`)
    .join(" ");

  return `${itemText} ${evidenceText} ${conversationText} ${input.operatorInput.value}`;
}

function containsAny(text: string, terms: readonly string[]): boolean {
  return terms.some((term) => text.includes(normalizeText(term)));
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim().normalize("NFKC").toLowerCase();
}
