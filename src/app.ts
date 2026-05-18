export type CallStatus = "waiting" | "ai-handling" | "human-review";

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

export function renderApp(state: DemoState = demoState): string {
  const summary = buildQueueSummary(state.activeQueue);
  const queueItems = state.activeQueue.map(renderQueueItem).join("");

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
          </aside>
        </section>
      </section>
    </main>
  `;
}

function renderQueueItem(item: QueueItem): string {
  return `
    <article class="queue-item queue-item--${item.priority}">
      <div class="queue-main">
        <div class="queue-title-row">
          <h3>${escapeHtml(item.topic)}</h3>
          <span class="status-badge">${statusLabel(item.status)}</span>
        </div>
        <p>${escapeHtml(item.excerpt)}</p>
        <div class="queue-meta">
          <span>${escapeHtml(item.id)}</span>
          <span>${escapeHtml(item.callerName)}</span>
          <span>${formatWaitTime(item.waitSeconds)}</span>
        </div>
      </div>
      <button type="button" aria-label="${escapeHtml(item.topic)}を開く">開く</button>
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
