import type { EvidenceBundle } from "./evidence-bridge.js";
import {
  buildResponsePolicyGuard,
  type ResponsePolicyAllowedScope,
  type ResponsePolicyGuard,
  type ResponsePolicyOutcome
} from "./response-policy.js";
import type {
  FallbackRehearsalPlan,
  FallbackRehearsalStep
} from "./fallback-rehearsal.js";
import { buildCallSummary, type CallSummary } from "./call-summary.js";

export type CallStatus = "waiting" | "ai-handling" | "human-review";

export interface AssistantEvidenceItem {
  sourcePath: EvidenceBundle["results"][number]["sourcePath"];
  section: EvidenceBundle["results"][number]["section"];
  snippet: EvidenceBundle["results"][number]["snippet"];
  score: EvidenceBundle["results"][number]["score"];
}

export interface AssistantEvidence {
  callId: EvidenceBundle["callId"];
  query: EvidenceBundle["query"];
  resultCount: EvidenceBundle["resultCount"];
  results: AssistantEvidenceItem[];
}

export interface QueueItem {
  id: string;
  callerName: string;
  topic: string;
  status: CallStatus;
  priority: "normal" | "high";
  waitSeconds: number;
  excerpt: string;
  customerId?: string;
  serviceArea?: string;
  servicePlan?: string;
  verificationStatus?: "unverified" | "verified";
}

export type OperatorNotesByCallId = Record<string, string>;

export interface ExecutiveDemoScenario {
  companyName: string;
  researchBasis: string;
  scenarioTitle: string;
  fictionalCustomerSituation: string;
  fitPoints: string[];
  guardrail: string;
}

export interface OperatorInputSubmitSaveCandidate {
  version: 1;
  kind: "operator-input-submit-save-candidate";
  callId: string;
  operatorInput: {
    label: string;
    value: string;
  };
  status: {
    unsent: true;
    unsaved: true;
    browserOnly: true;
  };
  guardrails: {
    externalSendAllowed: false;
    persistenceAllowed: false;
    candidateOnly: true;
  };
}

export interface DemoState {
  agentName: string;
  activeQueue: QueueItem[];
  assistantSuggestion: string;
  assistantEvidence: AssistantEvidence;
  operatorNotes?: OperatorNotesByCallId;
  fallbackRehearsal?: FallbackRehearsalPlan;
  executiveScenario?: ExecutiveDemoScenario;
}

export interface AssistantConversationDraft {
  callId: AssistantEvidence["callId"];
  response: string;
  evidenceLine: string;
  handoffNote: string;
}

export type ConversationThreadRole = "customer" | "assistant" | "internal";

export interface ConversationThreadMessage {
  role: ConversationThreadRole;
  label: string;
  body: string;
}

export interface ConversationThreadPreview {
  callId: AssistantEvidence["callId"];
  messages: ConversationThreadMessage[];
}

export interface AssistantInputPreview {
  callId: AssistantEvidence["callId"];
  label: string;
  value: string;
  unsent: true;
  unsaved: true;
  browserOnly: true;
  statusText: string;
  candidate: OperatorInputSubmitSaveCandidate;
}

export interface ExecutiveDemoBriefItem {
  label: string;
  status: string;
  detail: string;
}

export interface ExecutiveDemoBrief {
  callId: AssistantEvidence["callId"];
  safetySummary: string;
  items: ExecutiveDemoBriefItem[];
}

export interface BuildExecutiveDemoBriefInput {
  evidence: AssistantEvidence;
  item?: QueueItem;
  policy: ResponsePolicyGuard;
  fallbackRehearsal?: FallbackRehearsalPlan;
  inputPreview: AssistantInputPreview;
  scenario?: ExecutiveDemoScenario;
}

export interface BuildAssistantInputPreviewOptions {
  value?: string;
}

export interface QueueSummary {
  waiting: number;
  aiHandling: number;
  humanReview: number;
  highPriority: number;
  averageWaitSeconds: number;
}

export const demoState: DemoState = {
  agentName: "Support Ops",
  executiveScenario: {
    companyName: "CCNet株式会社",
    researchBasis: "Public CCNet website review on 2026-05-20",
    scenarioTitle: "10G/Wi-Fi support and local safety information handoff",
    fictionalCustomerSituation:
      "Fictional Kasugai-area subscriber has CCNet光1G おとく割 with mesh Wi-Fi and asks whether CCNet光10G, support service, and 安全・安心123チャンネル can help before heavy rain.",
    fitPoints: [
      "Regional cable, internet, and phone provider across Aichi, Gifu, and Mie.",
      "Cross-service support can reference internet, TV/community channel, fixed phone, My Page, contract terms, important explanations, and support windows.",
      "Demo should show public-service guidance first, then block customer-specific course changes, fees, cancellation penalties, or promises until identity and service eligibility are confirmed."
    ],
    guardrail:
      "Use only fictional customer details; do not imply real CCNet customer data, external AI send, persistent save, production connection, guaranteed 10G availability, confirmed fees, or completed contract changes."
  },
  assistantSuggestion:
    "公開情報で案内できる範囲を先に整理し、契約状態や提供可否は本人確認後に担当者へ引き継ぎます。",
  assistantEvidence: {
    callId: "CALL-CC-03",
    query:
      "CCNet光10G Wi-Fi 不安定 テレワーク 契約状態 安全・安心123チャンネル customer_ccnet_2001 CCNet光1G おとく割 メッシュWi-Fi",
    resultCount: 3,
    results: [
      {
        sourcePath: "business_rules/005_ccnet_public_service_guidance.md",
        section: "CCNet公開HPベース案内 > 10G・Wi-Fi・料金の一般案内",
        snippet:
          "公開HPベースでは10G、Wi-Fi標準提供、メッシュWi-Fi、料金目安を一般案内できるが、提供可否や契約状態は本人確認後に確認する。",
        score: 28
      },
      {
        sourcePath: "customer_contracts/customer_ccnet_2001.md",
        section: "顧客契約: customer_ccnet_2001 > 契約状態",
        snippet:
          "架空顧客 customer_ccnet_2001 はCCNet光1G おとく割、テレビ、ケーブルライン、メッシュWi-Fiのデモ契約として扱う。",
        score: 24
      },
      {
        sourcePath: "scenarios/scenario_05_ccnet_wifi_safety_handoff.md",
        section: "CCNet Wi-Fi・地域安全情報シナリオ > 根拠候補",
        snippet:
          "Wi-Fi不安定、10G相談、安全・安心123チャンネル確認を、送信・保存なしの架空デモとして扱う。",
        score: 18
      }
    ]
  },
  activeQueue: [
    {
      id: "CALL-CC-01",
      callerName: "田中 美咲",
      topic: "安全・安心123チャンネル確認",
      status: "ai-handling",
      priority: "normal",
      waitSeconds: 35,
      excerpt: "大雨の前に、テレビで道路・河川カメラや地域情報を確認する方法を知りたいです。",
      customerId: "customer_ccnet_2002",
      serviceArea: "小牧市 / 戸建て",
      servicePlan: "テレビ ファミリーA + 安全・安心123チャンネル",
      verificationStatus: "unverified"
    },
    {
      id: "CALL-CC-02",
      callerName: "佐藤 亮",
      topic: "障害と補償の相談",
      status: "human-review",
      priority: "high",
      waitSeconds: 142,
      excerpt: "ネットがつながりにくく仕事に影響したので、障害状況と補償可否を上席に確認してほしいです。",
      customerId: "customer_ccnet_2003",
      serviceArea: "各務原市 / 集合住宅",
      servicePlan: "CCNet Air LTE + 無線機器",
      verificationStatus: "unverified"
    },
    {
      id: "CALL-CC-03",
      callerName: "山本 花",
      topic: "CCNet光10G Wi-Fi 相談",
      status: "waiting",
      priority: "normal",
      waitSeconds: 78,
      excerpt:
        "春日井市の自宅でテレワーク中にWi-Fiが不安定です。契約状態を見て CCNet光10G へ変えられるか知りたいです。",
      customerId: "customer_ccnet_2001",
      serviceArea: "春日井市 / 戸建て",
      servicePlan: "CCNet光1G おとく割 + テレビ + ケーブルライン + メッシュWi-Fi",
      verificationStatus: "unverified"
    }
  ]
};

export function buildQueueSummary(items: QueueItem[]): QueueSummary {
  const totalWaitSeconds = items.reduce((sum, item) => sum + item.waitSeconds, 0);

  return {
    waiting: items.filter((item) => item.status === "waiting").length,
    aiHandling: items.filter((item) => item.status === "ai-handling").length,
    humanReview: items.filter((item) => item.status === "human-review").length,
    highPriority: items.filter((item) => item.priority === "high").length,
    averageWaitSeconds: items.length === 0 ? 0 : Math.round(totalWaitSeconds / items.length)
  };
}

export function formatWaitTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}秒`;
  }

  return `${minutes}分${seconds.toString().padStart(2, "0")}秒`;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildAssistantConversationDraft(
  item: QueueItem | undefined,
  evidence: AssistantEvidence
): AssistantConversationDraft {
  const firstEvidence = evidence.results[0];
  const evidenceLine = firstEvidence
    ? `根拠: ${firstEvidence.sourcePath} / ${firstEvidence.section}`
    : "根拠候補は確認中です。";

  if (!item) {
    return {
      callId: evidence.callId,
      response: "対象のキュー項目を確認中です。キューを開くと応答ドラフトを準備します。",
      evidenceLine,
      handoffNote: evidence.query.length > 0 ? `確認メモ: ${evidence.query}` : "確認メモ: キュー未選択"
    };
  }

  return {
    callId: item.id,
    response: `${item.callerName}さんには、${item.topic}について受付済みであることを伝える。回答は根拠候補を確認してから確定する。`,
    evidenceLine,
    handoffNote: `要点: ${item.excerpt}`
  };
}

export function buildConversationThreadPreview(
  item: QueueItem | undefined,
  draft: AssistantConversationDraft
): ConversationThreadPreview {
  return {
    callId: draft.callId,
    messages: [
      {
        role: "customer",
        label: "Customer",
        body: item ? `${item.callerName}: ${item.excerpt}` : "キュー項目を選択中です。"
      },
      {
        role: "assistant",
        label: "AI draft",
        body: draft.response
      },
      {
        role: "internal",
        label: "Internal note",
        body: `${draft.evidenceLine} / ${draft.handoffNote}`
      }
    ]
  };
}

export function buildAssistantInputPreview(
  item: QueueItem | undefined,
  draft: AssistantConversationDraft,
  options: BuildAssistantInputPreviewOptions = {}
): AssistantInputPreview {
  const label = "Draft input";

  if (!item) {
    const value =
      options.value ?? "No queue item selected. Review the queue before sending any reply.";

    return {
      callId: draft.callId,
      label,
      value,
      unsent: true,
      unsaved: true,
      browserOnly: true,
      statusText:
        "Unsent demo input. Browser-only submit/save candidate; not sent or saved.",
      candidate: buildOperatorInputSubmitSaveCandidate(draft.callId, label, value)
    };
  }

  const value = options.value ?? `Review ${item.topic}: ${item.excerpt}`;

  return {
    callId: item.id,
    label,
    value,
    unsent: true,
    unsaved: true,
    browserOnly: true,
    statusText:
      "Unsent demo input. Browser-only submit/save candidate; not sent or saved.",
    candidate: buildOperatorInputSubmitSaveCandidate(item.id, label, value)
  };
}

export function buildOperatorInputSubmitSaveCandidate(
  callId: string,
  label: string,
  value: string
): OperatorInputSubmitSaveCandidate {
  return {
    version: 1,
    kind: "operator-input-submit-save-candidate",
    callId,
    operatorInput: {
      label,
      value
    },
    status: {
      unsent: true,
      unsaved: true,
      browserOnly: true
    },
    guardrails: {
      externalSendAllowed: false,
      persistenceAllowed: false,
      candidateOnly: true
    }
  };
}

export function buildExecutiveDemoBrief(
  input: BuildExecutiveDemoBriefInput
): ExecutiveDemoBrief {
  const fallbackStatus = input.fallbackRehearsal
    ? `${input.fallbackRehearsal.scenarioCount} local scenarios`
    : "local plan not loaded";
  const fallbackDetail = input.fallbackRehearsal
    ? "Manual rehearsal can proceed without external AI API, Realtime audio, provider SDK, send, or save."
    : "The app can inject the local fallback plan when the demo runs.";
  const scenarioItems = input.scenario
    ? [
        {
          label: "CCNet-fit scenario",
          status: `${input.scenario.companyName} / fictional`,
          detail: `${input.scenario.scenarioTitle}. ${input.scenario.fictionalCustomerSituation} ${input.scenario.guardrail}`
        }
      ]
    : [];
  const customerItems = input.item
    ? [
        {
          label: "Fictional customer mockup",
          status: input.item.customerId ?? input.item.id,
          detail: `${input.item.callerName} / ${input.item.serviceArea ?? "area unlisted"} / ${
            input.item.servicePlan ?? "service plan unlisted"
          } / verification ${input.item.verificationStatus ?? "unverified"}. 本人確認前は契約状態を断定しない。`
        }
      ]
    : [];

  return {
    callId: input.evidence.callId,
    safetySummary:
      "Local deterministic demo only; External send blocked; Persistent save blocked; no production connection.",
    items: [
      ...scenarioItems,
      ...customerItems,
      {
        label: "Evidence candidates",
        status: `${input.evidence.resultCount} sources`,
        detail: "Review source candidates before reading the response draft."
      },
      {
        label: "Policy guard",
        status: policyOutcomeLabel(input.policy.outcome),
        detail: `Scope: ${policyScopeLabel(input.policy.allowedResponseScope)}; customer-specific answer ${
          input.policy.customerSpecificAnswerAllowed ? "allowed" : "blocked"
        }; human review ${input.policy.humanReviewRequired ? "required" : "not required"}.`
      },
      {
        label: "Fallback rehearsal",
        status: fallbackStatus,
        detail: fallbackDetail
      },
      {
        label: "No-send / no-save boundary",
        status: "External send blocked; Persistent save blocked",
        detail: `${input.inputPreview.label} for ${input.inputPreview.callId} is browser-only and is not sent or saved.`
      }
    ]
  };
}

export function renderApp(state: DemoState = demoState): string {
  const summary = buildQueueSummary(state.activeQueue);
  const selectedCallId = state.assistantEvidence.callId;
  const selectedQueueItem = state.activeQueue.find((item) => item.id === selectedCallId);
  const conversationDraft = buildAssistantConversationDraft(
    selectedQueueItem,
    state.assistantEvidence
  );
  const threadPreview = buildConversationThreadPreview(
    selectedQueueItem,
    conversationDraft
  );
  const operatorNoteValue = selectOperatorNoteValue(
    state.operatorNotes,
    conversationDraft.callId
  );
  const inputPreview = buildAssistantInputPreview(
    selectedQueueItem,
    conversationDraft,
    {
      value: operatorNoteValue
    }
  );
  const policyGuard = buildResponsePolicyGuard({
    item: selectedQueueItem,
    evidence: state.assistantEvidence,
    conversation: threadPreview,
    operatorInput: inputPreview
  });
  const executiveDemoBrief = buildExecutiveDemoBrief({
    evidence: state.assistantEvidence,
    item: selectedQueueItem,
    policy: policyGuard,
    fallbackRehearsal: state.fallbackRehearsal,
    inputPreview,
    scenario: state.executiveScenario
  });
  const callSummary = buildCallSummary({
    item: selectedQueueItem,
    evidence: state.assistantEvidence,
    conversation: threadPreview,
    operatorInput: inputPreview,
    policy: policyGuard
  });
  const queueItems = state.activeQueue
    .map((item) => renderQueueItem(item, selectedCallId))
    .join("");

  return `
    <main class="app-shell">
      <section class="workspace" aria-labelledby="app-title">
        <header class="topbar">
          <div>
            <p class="eyebrow">Live operations</p>
            <h1 id="app-title">AI Call Center Demo</h1>
          </div>
          <div class="agent-pill" aria-label="現在の担当チーム">
            <span class="status-dot"></span>
            ${escapeHtml(state.agentName)}
          </div>
        </header>

        <section class="metric-grid" aria-label="現在の受付状況">
          <article class="metric">
            <span>待機中</span>
            <strong>${summary.waiting}</strong>
          </article>
          <article class="metric">
            <span>AI対応中</span>
            <strong>${summary.aiHandling}</strong>
          </article>
          <article class="metric">
            <span>人の確認</span>
            <strong>${summary.humanReview}</strong>
          </article>
          <article class="metric">
            <span>平均待ち時間</span>
            <strong>${formatWaitTime(summary.averageWaitSeconds)}</strong>
          </article>
        </section>

        <section class="operations-layout">
          <div class="queue-panel" aria-labelledby="queue-title">
            <div class="panel-heading">
              <h2 id="queue-title">Live queue</h2>
              <span>${summary.highPriority} high priority</span>
            </div>
            <div class="queue-list">
              ${queueItems}
            </div>
          </div>

          <aside class="assistant-panel" aria-labelledby="assistant-title">
            <h2 id="assistant-title">Assistant handoff</h2>
            <p>${escapeHtml(state.assistantSuggestion)}</p>
            <div class="handoff-card">
              <span>Next best action</span>
              <strong>状況確認を完了してから担当者へ要点を渡す</strong>
            </div>
            ${renderExecutiveDemoBrief(executiveDemoBrief)}
            ${renderCallSummary(callSummary)}
            ${
              state.fallbackRehearsal
                ? renderFallbackRehearsalPlan(state.fallbackRehearsal)
                : ""
            }
            ${renderConversationDraft(conversationDraft)}
            ${renderConversationThreadPreview(threadPreview)}
            ${renderAssistantInputPreview(inputPreview)}
            ${renderResponsePolicyGuard(policyGuard)}
            ${renderAssistantEvidence(state.assistantEvidence)}
          </aside>
        </section>
      </section>
    </main>
  `;
}

function renderCallSummary(summary: CallSummary): string {
  const evidenceItems = summary.evidenceReferences
    .map((reference) => `<li>${escapeHtml(reference)}</li>`)
    .join("");

  return `
    <section
      class="summary-panel"
      aria-labelledby="call-summary-title"
      data-call-summary-call-id="${escapeHtml(summary.callId)}"
      data-external-send-allowed="false"
      data-persistence-allowed="false"
    >
      <div class="summary-heading">
        <h3 id="call-summary-title">Call summary</h3>
        <span>${escapeHtml(summary.callId)}</span>
      </div>
      <p class="summary-main">${escapeHtml(summary.inquirySummary)}</p>
      <dl>
        <div>
          <dt>Policy decision</dt>
          <dd>${escapeHtml(summary.policyDecision.summary)}</dd>
        </div>
        <div>
          <dt>Operator note</dt>
          <dd>${escapeHtml(summary.operatorNoteStatus.summary)}</dd>
        </div>
        <div>
          <dt>Next action</dt>
          <dd>${escapeHtml(summary.nextAction)}</dd>
        </div>
        <div>
          <dt>Summary only</dt>
          <dd>External send blocked; Persistent save blocked</dd>
        </div>
      </dl>
      ${
        summary.evidenceReferences.length > 0
          ? `<div class="summary-evidence"><span>Evidence references</span><ul>${evidenceItems}</ul></div>`
          : `<p class="summary-empty">根拠参照はまだありません。</p>`
      }
    </section>
  `;
}

function renderExecutiveDemoBrief(brief: ExecutiveDemoBrief): string {
  const items = brief.items.map(renderExecutiveDemoBriefItem).join("");

  return `
    <section
      class="executive-brief"
      aria-labelledby="executive-brief-title"
      data-executive-demo-call-id="${escapeHtml(brief.callId)}"
      data-external-send-allowed="false"
      data-persistence-allowed="false"
    >
      <div class="executive-brief__heading">
        <h3 id="executive-brief-title">Executive demo brief</h3>
        <span>${escapeHtml(brief.callId)}</span>
      </div>
      <p>${escapeHtml(brief.safetySummary)}</p>
      <div class="executive-brief__items">
        ${items}
      </div>
    </section>
  `;
}

function renderExecutiveDemoBriefItem(item: ExecutiveDemoBriefItem): string {
  return `
    <article class="executive-brief__item">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.status)}</strong>
      <p>${escapeHtml(item.detail)}</p>
    </article>
  `;
}

function renderFallbackRehearsalPlan(plan: FallbackRehearsalPlan): string {
  const steps = plan.steps.map(renderFallbackRehearsalStep).join("");

  return `
    <section
      class="policy-panel"
      aria-labelledby="fallback-title"
      data-fallback-mode="${escapeHtml(plan.mode)}"
      data-external-send-allowed="false"
      data-persistence-allowed="false"
    >
      <div class="policy-heading">
        <h3 id="fallback-title">Fallback rehearsal</h3>
        <span>${escapeHtml(plan.statusText)}</span>
      </div>
      <p>${escapeHtml(plan.operatorMessage)}</p>
      <dl>
        <div>
          <dt>Scenario count</dt>
          <dd>${plan.scenarioCount}</dd>
        </div>
        <div>
          <dt>Manual progression</dt>
          <dd>${plan.guardrails.manualProgressionAllowed ? "ready" : "blocked"}</dd>
        </div>
        <div>
          <dt>External send</dt>
          <dd>blocked</dd>
        </div>
        <div>
          <dt>Persistent save</dt>
          <dd>blocked</dd>
        </div>
      </dl>
      <div class="policy-lists">
        <div>
          <span>Run order</span>
          <ul>${steps}</ul>
        </div>
      </div>
    </section>
  `;
}

function renderFallbackRehearsalStep(step: FallbackRehearsalStep): string {
  const reviewLabel = step.humanReviewRequired ? "human review" : "local draft";

  return `
    <li>
      ${escapeHtml(step.callId)}: ${escapeHtml(step.label)}
      (${escapeHtml(step.expectedPolicyOutcome)}, ${reviewLabel})
    </li>
  `;
}

function renderConversationThreadPreview(preview: ConversationThreadPreview): string {
  const messages = preview.messages.map(renderConversationThreadMessage).join("");

  return `
    <section class="thread-panel" aria-labelledby="thread-title">
      <div class="thread-heading">
        <h3 id="thread-title">Conversation preview</h3>
        <span>${escapeHtml(preview.callId)}</span>
      </div>
      <div class="thread-list">
        ${messages}
      </div>
    </section>
  `;
}

function renderConversationThreadMessage(message: ConversationThreadMessage): string {
  return `
    <article class="thread-message thread-message--${message.role}">
      <span>${escapeHtml(message.label)}</span>
      <p>${escapeHtml(message.body)}</p>
    </article>
  `;
}

function renderAssistantInputPreview(preview: AssistantInputPreview): string {
  const escapedCallId = escapeHtml(preview.callId);

  return `
    <section class="input-panel" aria-labelledby="input-title" data-input-preview-call-id="${escapedCallId}">
      <div class="input-heading">
        <h3 id="input-title">Operator note</h3>
        <span>${escapedCallId}</span>
      </div>
      <label for="operator-note">${escapeHtml(preview.label)}</label>
      <textarea
        id="operator-note"
        data-input-call-id="${escapedCallId}"
        rows="4"
        aria-describedby="operator-note-status"
      >${escapeHtml(preview.value)}</textarea>
      <p id="operator-note-status">${escapeHtml(preview.statusText)}</p>
      <div
        class="input-boundary"
        data-submit-save-candidate-call-id="${escapedCallId}"
        data-external-send-allowed="false"
        data-persistence-allowed="false"
      >
        <span>Submit/save candidate</span>
        <dl>
          <div>
            <dt>Call</dt>
            <dd>${escapedCallId}</dd>
          </div>
          <div>
            <dt>External send</dt>
            <dd>blocked</dd>
          </div>
          <div>
            <dt>Persistent save</dt>
            <dd>blocked</dd>
          </div>
          <div>
            <dt>Storage</dt>
            <dd>browser state only</dd>
          </div>
        </dl>
      </div>
    </section>
  `;
}

function selectOperatorNoteValue(
  operatorNotes: OperatorNotesByCallId | undefined,
  callId: string
): string | undefined {
  if (!operatorNotes || !Object.hasOwn(operatorNotes, callId)) {
    return undefined;
  }

  return operatorNotes[callId];
}

function renderResponsePolicyGuard(policy: ResponsePolicyGuard): string {
  const allowedTopics = policy.allowedTopics
    .map((topic) => `<li>${escapeHtml(topic)}</li>`)
    .join("");
  const blockedResponseTypes = policy.blockedResponseTypes
    .map((blockedType) => `<li>${escapeHtml(blockedType)}</li>`)
    .join("");

  return `
    <section class="policy-panel" aria-labelledby="policy-title">
      <div class="policy-heading">
        <h3 id="policy-title">Policy guard</h3>
        <span>${escapeHtml(policyOutcomeLabel(policy.outcome))}</span>
      </div>
      <p>${escapeHtml(policy.reasons[0] ?? "Policy decision is ready for review.")}</p>
      <dl>
        <div>
          <dt>Scope</dt>
          <dd>${escapeHtml(policyScopeLabel(policy.allowedResponseScope))}</dd>
        </div>
        <div>
          <dt>Human review</dt>
          <dd>${policy.humanReviewRequired ? "required" : "not required"}</dd>
        </div>
        <div>
          <dt>Customer-specific answer</dt>
          <dd>${policy.customerSpecificAnswerAllowed ? "allowed" : "blocked"}</dd>
        </div>
        <div>
          <dt>External send</dt>
          <dd>blocked</dd>
        </div>
        <div>
          <dt>Persistent save</dt>
          <dd>blocked</dd>
        </div>
      </dl>
      <div class="policy-lists">
        <div>
          <span>Allowed</span>
          <ul>${allowedTopics}</ul>
        </div>
        ${
          policy.blockedResponseTypes.length > 0
            ? `<div><span>Blocked</span><ul>${blockedResponseTypes}</ul></div>`
            : ""
        }
      </div>
    </section>
  `;
}

function policyOutcomeLabel(outcome: ResponsePolicyOutcome): string {
  const labels: Record<ResponsePolicyOutcome, string> = {
    "general-guidance-only": "General guidance only",
    "customer-specific-answer-blocked": "Customer-specific answer blocked",
    "human-review-required": "Human review required",
    "scoped-draft-allowed": "Scoped draft allowed"
  };

  return labels[outcome];
}

function policyScopeLabel(scope: ResponsePolicyAllowedScope): string {
  const labels: Record<ResponsePolicyAllowedScope, string> = {
    "general-information-only": "General information only",
    "handoff-only": "Handoff only",
    "verified-customer-context": "Verified customer context"
  };

  return labels[scope];
}

function renderConversationDraft(draft: AssistantConversationDraft): string {
  return `
    <section class="draft-panel" aria-labelledby="draft-title">
      <div class="draft-heading">
        <h3 id="draft-title">Response draft</h3>
        <span>${escapeHtml(draft.callId)}</span>
      </div>
      <p class="draft-response">${escapeHtml(draft.response)}</p>
      <p class="draft-evidence">${escapeHtml(draft.evidenceLine)}</p>
      <p class="draft-note">${escapeHtml(draft.handoffNote)}</p>
    </section>
  `;
}

function renderAssistantEvidence(evidence: AssistantEvidence): string {
  const items = evidence.results.map(renderAssistantEvidenceItem).join("");

  return `
    <section class="evidence-panel" aria-labelledby="evidence-title">
      <div class="evidence-heading">
        <h3 id="evidence-title">Evidence candidates</h3>
        <span>${evidence.resultCount} sources</span>
      </div>
      ${renderEvidenceQuery(evidence)}
      ${
        evidence.results.length > 0
          ? `<div class="evidence-list">${items}</div>`
          : `<p class="evidence-empty">根拠候補はまだありません。</p>`
      }
    </section>
  `;
}

function renderEvidenceQuery(evidence: AssistantEvidence): string {
  if (evidence.query.length === 0) {
    return "";
  }

  return `
    <p class="evidence-query">
      <span>${escapeHtml(evidence.callId)}</span>
      ${escapeHtml(evidence.query)}
    </p>
  `;
}

function renderAssistantEvidenceItem(item: AssistantEvidenceItem): string {
  return `
    <article class="evidence-item">
      <div class="evidence-source">
        <span>${escapeHtml(item.sourcePath)}</span>
        <strong>${escapeHtml(item.section)}</strong>
      </div>
      <p>${escapeHtml(item.snippet)}</p>
      <span class="evidence-score">score ${item.score}</span>
    </article>
  `;
}

function renderQueueItem(item: QueueItem, selectedCallId: string): string {
  const isSelected = item.id === selectedCallId;
  const escapedId = escapeHtml(item.id);
  const escapedTopic = escapeHtml(item.topic);
  const metaItems = [
    item.id,
    item.customerId,
    item.serviceArea,
    item.servicePlan,
    item.verificationStatus,
    item.callerName,
    formatWaitTime(item.waitSeconds)
  ].filter((value): value is string => typeof value === "string" && value.length > 0);

  return `
    <article class="queue-item queue-item--${item.priority}${
      isSelected ? " queue-item--selected" : ""
    }" data-queue-call-id="${escapedId}"${isSelected ? ' aria-current="true"' : ""}>
      <div class="queue-main">
        <div class="queue-title-row">
          <h3>${escapedTopic}</h3>
          <span class="status-badge">${statusLabel(item.status)}</span>
        </div>
        <p>${escapeHtml(item.excerpt)}</p>
        <div class="queue-meta">
          ${metaItems.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}
        </div>
      </div>
      <button
        type="button"
        data-queue-open="${escapedId}"
        aria-label="${escapedTopic}を開く"
        aria-pressed="${isSelected ? "true" : "false"}"
      >
        開く
      </button>
    </article>
  `;
}

function statusLabel(status: CallStatus): string {
  const labels: Record<CallStatus, string> = {
    waiting: "待機中",
    "ai-handling": "AI対応中",
    "human-review": "人の確認"
  };

  return labels[status];
}
