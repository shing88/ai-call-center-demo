import type { EvidenceBundle } from "./evidence-bridge.js";

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
}

export interface DemoState {
  agentName: string;
  activeQueue: QueueItem[];
  assistantSuggestion: string;
  assistantEvidence: AssistantEvidence;
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

export interface QueueSummary {
  waiting: number;
  aiHandling: number;
  humanReview: number;
  highPriority: number;
  averageWaitSeconds: number;
}

export const demoState: DemoState = {
  agentName: "Support Ops",
  assistantSuggestion:
    "配送状況の確認後、住所変更の可否を案内し、必要なら人の担当者へ引き継ぎます。",
  assistantEvidence: {
    callId: "CALL-1026",
    query: "返品受付 サイズが合わなかった商品の返送方法を確認したいです。",
    resultCount: 2,
    results: [
      {
        sourcePath: "business_rules/002_refund_policy.md",
        section: "返金ポリシー > 通常返金",
        snippet: "返品受付後、本人確認と購入履歴を確認してから返金予定を案内します。",
        score: 18
      },
      {
        sourcePath: "scenarios/scenario_01_refund_normal.md",
        section: "通常返金シナリオ > 根拠候補",
        snippet: "返送方法、受付期限、返金予定は業務ルールと顧客契約を照合して回答します。",
        score: 11
      }
    ]
  },
  activeQueue: [
    {
      id: "CALL-1024",
      callerName: "田中 美咲",
      topic: "配送予定日の確認",
      status: "ai-handling",
      priority: "normal",
      waitSeconds: 35,
      excerpt: "注文番号 A-2048 の到着予定を知りたいです。"
    },
    {
      id: "CALL-1025",
      callerName: "佐藤 亮",
      topic: "住所変更の相談",
      status: "human-review",
      priority: "high",
      waitSeconds: 142,
      excerpt: "転居したので、配送先を今日中に変えられますか。"
    },
    {
      id: "CALL-1026",
      callerName: "山本 花",
      topic: "返品受付",
      status: "waiting",
      priority: "normal",
      waitSeconds: 78,
      excerpt: "サイズが合わなかった商品の返送方法を確認したいです。"
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
            ${renderConversationDraft(conversationDraft)}
            ${renderConversationThreadPreview(threadPreview)}
            ${renderAssistantEvidence(state.assistantEvidence)}
          </aside>
        </section>
      </section>
    </main>
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
          <span>${escapedId}</span>
          <span>${escapeHtml(item.callerName)}</span>
          <span>${formatWaitTime(item.waitSeconds)}</span>
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
