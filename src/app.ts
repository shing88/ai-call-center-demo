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
import {
  buildRealtimeConnectionBoundary,
  type RealtimeConnectionBoundary,
  type RealtimeConnectionRequirement
} from "./realtime-connection.js";
import {
  buildRealtimeCallControls,
  type RealtimeCallControls
} from "./realtime-call-controls.js";
import type {
  RealtimeCallHandoffRecord,
  RealtimeTranscriptEntry
} from "./realtime-call-recording.js";

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
  realtimeConnection?: RealtimeConnectionBoundary;
  realtimeCallControls?: RealtimeCallControls;
  realtimeCallHandoff?: RealtimeCallHandoffRecord;
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
  agentName: "サポートOps",
  executiveScenario: {
    companyName: "CCNet株式会社",
    researchBasis: "2026-05-20 時点の公開CCNetサイト確認",
    scenarioTitle: "10G/Wi-Fiサポートと地域安全情報の引き継ぎ",
    fictionalCustomerSituation:
      "春日井エリアの架空加入者がCCNet光1G おとく割とメッシュWi-Fiを利用中。大雨前にCCNet光10G、サポートサービス、安全・安心123チャンネルが役立つか相談している。",
    fitPoints: [
      "愛知・岐阜・三重でケーブル、インターネット、電話を提供する地域事業者。",
      "インターネット、テレビ/コミュニティチャンネル、固定電話、マイページ、約款、重要事項説明、サポート窓口を横断して案内できる。",
      "公開情報の一般案内を先に提示し、本人確認と提供可否確認前のコース変更、料金、解約金、確約はブロックする。"
    ],
    guardrail:
      "架空顧客情報のみを使用し、実顧客データ、外部AI送信、永続保存、本番接続、10G提供可否の確約、確定料金、契約変更済みを示唆しない。"
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
    },
    {
      id: "CALL-CC-04",
      callerName: "森 彩乃",
      topic: "ネット契約へケーブルプラス電話追加",
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
    {
      id: "CALL-CC-05",
      callerName: "西村 陽太",
      topic: "ネット新規加入とケーブルプラス提案",
      status: "ai-handling",
      priority: "normal",
      waitSeconds: 52,
      excerpt:
        "新築戸建てでネットを新規契約したいです。UQ mobileを使っていて、固定電話もまとめた方がよいか相談したいです。",
      customerId: "customer_ccnet_2005",
      serviceArea: "小牧市 / 新築戸建て予定",
      servicePlan: "CCNet未加入 / ネット新規検討 + 固定電話検討",
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

function statusTone(status: CallStatus): "info" | "ok" | "warn" {
  const tones: Record<CallStatus, "info" | "ok" | "warn"> = {
    waiting: "info",
    "ai-handling": "ok",
    "human-review": "warn"
  };

  return tones[status];
}

function verificationLabel(status: QueueItem["verificationStatus"]): string {
  return status === "verified" ? "本人確認: 完了" : "本人確認: 未完了";
}

function conversationRoleLabel(label: string): string {
  const labels: Record<string, string> = {
    Customer: "お客様",
    "AI draft": "AIドラフト案",
    "Internal note": "内部メモ"
  };

  return labels[label] ?? label;
}

function inputLabel(label: string): string {
  return label === "Draft input" ? "下書き入力" : label;
}

function inputStatusText(statusText: string): string {
  return statusText ===
    "Unsent demo input. Browser-only submit/save candidate; not sent or saved."
    ? "未送信のデモ入力。ブラウザ内のみの送信・保存候補で、外部送信・永続保存は行いません。"
    : statusText;
}

function operatorInputValue(value: string): string {
  const match = /^Review (.*?): (.*)$/.exec(value);

  if (match) {
    return `${match[1]}を確認: ${match[2]}`;
  }

  if (value === "No queue item selected. Review the queue before sending any reply.") {
    return "デモシナリオが未選択です。返信前にデモシナリオを確認してください。";
  }

  return value;
}

function realtimeCallStatusLabel(status: RealtimeCallControls["status"]): string {
  const labels: Record<RealtimeCallControls["status"], string> = {
    idle: "通話: 停止中",
    "requesting-client-secret": "通話: 接続準備中",
    "requesting-microphone": "通話: マイク確認中",
    connecting: "通話: 接続中",
    connected: "通話: 接続中",
    ended: "通話: 終了済み",
    fallback: "通話: 代替モード"
  };

  return labels[status];
}

function realtimeCallHeadline(status: RealtimeCallControls["status"]): string {
  const labels: Record<RealtimeCallControls["status"], string> = {
    idle: "リアルタイム通話の準備ができています",
    "requesting-client-secret": "クライアントシークレットを取得中",
    "requesting-microphone": "マイク権限を確認中",
    connecting: "リアルタイム通話へ接続中",
    connected: "リアルタイム通話に接続済み",
    ended: "リアルタイム通話は終了しました",
    fallback: "代替リハーサルで進行中"
  };

  return labels[status];
}

function realtimeCallDetail(status: RealtimeCallControls["status"]): string {
  const labels: Record<RealtimeCallControls["status"], string> = {
    idle: "開始時にサーバー発行の短命シークレットを確認してから、マイクとWebRTC接続へ進みます。",
    "requesting-client-secret": "標準APIキーはサーバー側だけで扱い、ブラウザには渡しません。",
    "requesting-microphone": "短命シークレット取得後に、ブラウザのマイク権限を確認しています。",
    connecting: "同一originのサーバーアダプターへSDP offerを送信しています。",
    connected: "WebRTC音声はローカルサーバー経由のRealtime calls adapterで接続されています。",
    ended: "ローカルトラックとpeer connectionは閉じられています。",
    fallback: "Realtime接続が完了しなかったため、ローカルの代替リハーサルで続行できます。"
  };

  return labels[status];
}

function microphoneLabel(
  state: RealtimeCallControls["microphonePermissionState"] | RealtimeConnectionBoundary["microphonePermissionState"]
): string {
  const labels: Record<string, string> = {
    "not-requested": "未要求",
    prompting: "確認中",
    granted: "許可済み",
    denied: "拒否"
  };

  return labels[state] ?? state;
}

function technicalStatusLabel(value: string): string {
  const labels: Record<string, string> = {
    "not-configured": "未設定",
    configured: "設定済",
    ready: "準備完了",
    pending: "準備中",
    disabled: "無効",
    blocked: "ブロック",
    available: "利用可能",
    unavailable: "利用不可",
    "local-rehearsal": "ローカル代替",
    "setup-incomplete": "設定確認中"
  };

  return labels[value] ?? value;
}

function boundaryStatusLabel(boundary: RealtimeConnectionBoundary): string {
  if (boundary.tokenEndpointConfigured) {
    return "リアルタイム設定取得済み / セッション開始は保留";
  }

  return "リアルタイム未設定 / 代替リハーサル";
}

function boundaryMessage(boundary: RealtimeConnectionBoundary): string {
  if (boundary.tokenEndpointConfigured) {
    return "サーバー側のトークン取得先は設定済みです。標準APIキーはブラウザへ出さず、短命クライアントシークレットで接続します。";
  }

  return "ブラウザの標準APIキー利用は禁止です。サーバー側設定が揃うまで、マイク権限や外部音声送信は開始しません。";
}

function requirementLabel(label: string): string {
  const labels: Record<string, string> = {
    "Token endpoint contract": "トークン取得契約",
    "Server token endpoint implementation": "サーバートークン取得実装",
    "Server token endpoint configuration": "サーバートークン取得設定",
    "Ephemeral client secret": "短命クライアントシークレット",
    "Browser API key policy": "ブラウザAPIキー禁止",
    "Microphone permission": "マイク権限",
    "Local fallback": "ローカル代替"
  };

  return labels[label] ?? label;
}

function safeJapaneseDetail(detail: string): string {
  return detail
    .replace(
      "POST /api/realtime/client-secret is implemented as a server-side client secret adapter.",
      "POST /api/realtime/client-secret はサーバー側のクライアントシークレット取得口として実装済みです。"
    )
    .replace(
      "Mint an ephemeral client secret server-side before browser setup without accepting a browser API key.",
      "ブラウザAPIキーを受け付けず、ブラウザ接続前にサーバー側で短命シークレットを発行します。"
    )
    .replace(
      "Set a server-side OpenAI API key only in the runtime environment before requesting a client secret.",
      "クライアントシークレット取得前に、サーバー実行環境だけへOpenAI APIキーを設定します。"
    )
    .replace(
      "Use a short-lived client secret for browser Realtime sessions.",
      "ブラウザのRealtimeセッションには短命クライアントシークレットだけを使います。"
    )
    .replace(
      "Never embed standard API keys in the browser bundle.",
      "標準APIキーはブラウザbundleへ埋め込みません。"
    )
    .replace(
      "Request microphone permission only after the review gate is opened.",
      "レビューゲートが開いた後にだけマイク権限を要求します。"
    )
    .replace(
      "Keep deterministic fallback rehearsal available when Realtime is unavailable.",
      "Realtimeが使えない場合も、決定的な代替リハーサルを利用できます。"
    )
    .replace(
      "Server token endpoint is not configured.",
      "サーバートークン取得先が未設定です。"
    )
    .replace(
      "Ephemeral client secret is not available.",
      "短命クライアントシークレットが未取得です。"
    )
    .replace(
      "Microphone permission has not been requested.",
      "マイク権限はまだ要求していません。"
    )
    .replace(
      "Current demo mode keeps Realtime session start disabled.",
      "現在のデモモードではRealtimeセッション開始を保留しています。"
    )
    .replace(
      "Operator note candidate present; browser-only; not sent or saved.",
      "オペレーターメモ候補あり。ブラウザ内のみで、外部送信・永続保存は行いません。"
    )
    .replace(
      "Operator note candidate present; browser-only; not sent or saved; call",
      "オペレーターメモ候補あり。ブラウザ内のみで、外部送信・永続保存は行いません。対象"
    )
    .replace(
      "No operator note candidate; browser-only; not sent or saved.",
      "オペレーターメモ候補なし。ブラウザ内のみで、外部送信・永続保存は行いません。"
    )
    .replace(
      "Customer-specific answer blocked. Scope: general-information-only; human review not required.",
      "顧客個別回答は不可。範囲: 一般情報のみ。人の確認は不要。"
    )
    .replace(
      "Scope: general-information-only; human review not required; customer-specific answer blocked.",
      "範囲: 一般情報のみ。人の確認は不要。顧客個別回答は不可。"
    )
    .replace(
      "Human review required. Scope: handoff-only; human review required.",
      "人の確認が必要。範囲: 引き継ぎのみ。"
    )
    .replace(
      "Scoped draft allowed. Scope: verified-customer-context; human review not required.",
      "範囲を絞った下書き可。範囲: 本人確認済みコンテキスト。人の確認は不要。"
    )
    .replace("Use only fictional customer details", "架空顧客情報のみを使用")
    .replace("External AI unavailable", "外部AI利用不可")
    .replace("Voice unavailable", "音声利用不可")
    .replace("Network unavailable", "ネットワーク利用不可")
    .replace("Manual rehearsal", "手動リハーサル")
    .replace("account-specific contract change", "契約内容の個別変更")
    .replace(
      "Customer asks about an account-specific contract change.",
      "お客様は契約内容の個別変更について確認しています。"
    )
    .replace(
      "Complete identity verification before account-specific guidance.",
      "契約に踏み込む案内の前に本人確認を完了します。"
    )
    .replace(
      "キュー項目を選択してから、問い合わせ要約と次アクションを確認する。",
      "デモシナリオを選択してから、問い合わせ要約と次アクションを確認する。"
    )
    .replace("verification unverified", "本人確認未完了");
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
      response: "対象のデモシナリオを確認中です。シナリオを開くと応答ドラフトを準備します。",
      evidenceLine,
      handoffNote: evidence.query.length > 0 ? `確認メモ: ${evidence.query}` : "確認メモ: デモシナリオ未選択"
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
        body: item ? `${item.callerName}: ${item.excerpt}` : "デモシナリオを選択中です。"
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
    ? `${input.fallbackRehearsal.scenarioCount}件のローカルシナリオ`
    : "ローカル計画は未読み込み";
  const fallbackDetail = input.fallbackRehearsal
    ? "外部AI API、Realtime音声、provider SDK、送信、保存を使わずに手動リハーサルを進行できます。"
    : "デモ実行時にローカルの代替進行計画を注入できます。";
  const scenarioItems = input.scenario
    ? [
        {
          label: "CCNet適合シナリオ",
          status: `${input.scenario.companyName} / 架空`,
          detail: `${input.scenario.scenarioTitle}. ${input.scenario.fictionalCustomerSituation} ${input.scenario.guardrail}`
        }
      ]
    : [];
  const customerItems = input.item
    ? [
        {
          label: "架空お客様情報",
          status: input.item.customerId ?? input.item.id,
          detail: `${input.item.callerName} / ${input.item.serviceArea ?? "エリア未設定"} / ${
            input.item.servicePlan ?? "サービス未設定"
          } / ${verificationLabel(input.item.verificationStatus)}。本人確認前は契約状態を断定しない。`
        }
      ]
    : [];

  return {
    callId: input.evidence.callId,
    safetySummary:
      "ローカル決定的デモのみ。顧客情報・音声の外部送信ブロック、本番DB保存ブロック、本番接続なし。",
    items: [
      ...scenarioItems,
      ...customerItems,
      {
        label: "根拠候補",
        status: `${input.evidence.resultCount}件のソース`,
        detail: "応答ドラフトを読む前に、候補ソースを確認します。"
      },
      {
        label: "ポリシー判定",
        status: policyOutcomeLabel(input.policy.outcome),
        detail: `範囲: ${policyScopeLabel(input.policy.allowedResponseScope)}。顧客個別回答は${
          input.policy.customerSpecificAnswerAllowed ? "可" : "不可"
        }。人の確認は${input.policy.humanReviewRequired ? "必要" : "不要"}。`
      },
      {
        label: "フォールバック演習",
        status: fallbackStatus,
        detail: fallbackDetail
      },
      {
        label: "送信・保存ブロック境界",
        status: "顧客情報・音声の外部送信ブロック / 本番DB保存ブロック",
        detail: `${input.inputPreview.callId} の${inputLabel(
          input.inputPreview.label
        )}はブラウザ内のみで、顧客情報・音声の外部送信と本番DB保存は行いません。`
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
  const realtimeConnection =
    state.realtimeConnection ?? buildRealtimeConnectionBoundary();
  const realtimeCallControls =
    state.realtimeCallControls ?? buildRealtimeCallControls();
  const queueItems = state.activeQueue
    .map((item) => renderQueueItem(item, selectedCallId))
    .join("");
  const fallbackPanel = state.fallbackRehearsal
    ? renderFallbackRehearsalPlan(state.fallbackRehearsal)
    : `<p class="summary-empty">フォールバック演習はまだ読み込まれていません。</p>`;
  const handoffPanel = state.realtimeCallHandoff
    ? renderRealtimeCallHandoffRecord(state.realtimeCallHandoff)
    : `<p class="summary-empty">通話終了後の引き継ぎ記録はまだありません。</p>`;

  return `
    <main class="app-shell">
      <header class="topbar" aria-labelledby="app-title">
        <div class="brand">
          <div class="logo" aria-hidden="true">AI</div>
          <div>
            <h1 id="app-title">AIコールセンター デモ</h1>
            <p>応対支援 / 根拠提示 / ポリシーガード</p>
          </div>
        </div>
        <div class="agent-pill" aria-label="現在の担当チーム">
          <span class="status-dot"></span>
          担当: ${escapeHtml(state.agentName)}
        </div>
        ${renderHeaderRealtimeCallControls(realtimeCallControls)}
      </header>

      <section class="metric-grid" aria-label="現在の受付状況">
        <article class="metric metric--waiting">
          <span>待機中</span>
          <strong>${summary.waiting}</strong>
          <small>対応待ちの案件</small>
        </article>
        <article class="metric metric--ai">
          <span>AI対応中</span>
          <strong>${summary.aiHandling}</strong>
          <small>下書き・根拠提示中</small>
        </article>
        <article class="metric metric--review">
          <span>人の確認</span>
          <strong>${summary.humanReview}</strong>
          <small>上席判断を含む案件</small>
        </article>
        <article class="metric metric--high">
          <span>高優先</span>
          <strong>${summary.highPriority}</strong>
          <small>障害・補償など</small>
        </article>
        <article class="metric metric--time">
          <span>平均待ち時間</span>
          <strong>${formatWaitTime(summary.averageWaitSeconds)}</strong>
          <small>現在のデモシナリオ平均</small>
        </article>
      </section>

      <section class="operations-layout" aria-label="AIコールセンター デモ ワークスペース">
        <aside class="column column--left">
          <section class="queue-panel panel" aria-labelledby="queue-title">
            <div class="panel-heading">
              <h2 id="queue-title">デモシナリオ</h2>
              <span>${state.activeQueue.length}件 / 高優先 ${summary.highPriority}</span>
            </div>
            <div class="queue-list">
              ${queueItems}
            </div>
          </section>

          <details class="accordion">
            <summary>経営向け要約</summary>
            <div class="accordion-body">
              ${renderExecutiveDemoBrief(executiveDemoBrief)}
            </div>
          </details>
        </aside>

        <section class="column column--center" aria-labelledby="assistant-title">
          ${renderRealtimeStatusBar(realtimeConnection, realtimeCallControls)}
          ${renderCallWorkspace(selectedQueueItem, callSummary, policyGuard)}
          ${renderConversationThreadPreview(threadPreview)}
          <section class="composer-panel panel" aria-labelledby="assistant-title">
            <div class="panel-heading">
              <h2 id="assistant-title">AIサポート / 引き継ぎ</h2>
              <span>${escapeHtml(conversationDraft.callId)}</span>
            </div>
            <p class="assistant-suggestion">${escapeHtml(state.assistantSuggestion)}</p>
            <div class="handoff-card">
              <span>次に取るべきアクション</span>
              <strong>状況確認を完了してから担当者へ要点を渡す</strong>
            </div>
            ${renderConversationDraft(conversationDraft)}
            ${renderAssistantInputPreview(inputPreview)}
            ${renderCallSummary(callSummary)}
          </section>

          <details class="accordion">
            <summary>通話終了後の引き継ぎ記録</summary>
            <div class="accordion-body">
              ${handoffPanel}
            </div>
          </details>
        </section>

        <aside class="column column--right">
          ${renderAssistantEvidence(state.assistantEvidence)}
          ${renderResponsePolicyGuard(policyGuard)}
          <details class="accordion">
            <summary>リアルタイム接続の詳細</summary>
            <div class="accordion-body">
              ${renderRealtimeConnectionBoundary(realtimeConnection, realtimeCallControls)}
            </div>
          </details>
          <details class="accordion">
            <summary>フォールバック演習</summary>
            <div class="accordion-body">
              ${fallbackPanel}
            </div>
          </details>
        </aside>
      </section>
    </main>
  `;
}

function renderHeaderRealtimeCallControls(controls: RealtimeCallControls): string {
  return `
    <div class="call-ctl" data-status="${escapeHtml(controls.status)}">
      <span class="state">${escapeHtml(realtimeCallStatusLabel(controls.status))}</span>
      <button
        class="btn btn-primary"
        type="button"
        data-realtime-start-call
        aria-label="通話を開始"
        ${controls.startCallAvailable ? "" : "disabled"}
      >通話を開始</button>
      <button
        class="btn btn-ghost"
        type="button"
        data-realtime-end-call
        aria-label="通話を終了"
        ${controls.endCallAvailable ? "" : "disabled"}
      >終了</button>
    </div>
  `;
}

function renderRealtimeStatusBar(
  boundary: RealtimeConnectionBoundary,
  controls: RealtimeCallControls
): string {
  const tone =
    controls.status === "connected"
      ? "ok"
      : boundary.tokenEndpointConfigured
        ? "warn"
        : "danger";

  return `
    <section
      class="rt-bar"
      role="status"
      aria-live="polite"
      aria-labelledby="realtime-boundary-bar-title"
    >
      <h2 id="realtime-boundary-bar-title" class="sr-only">リアルタイム接続境界</h2>
      <span class="lamp ${tone}"><span class="dot"></span>${escapeHtml(boundaryStatusLabel(boundary))}</span>
      <p>${escapeHtml(boundaryMessage(boundary))}</p>
      <span class="badge ${controls.status === "connected" ? "ok" : "warn"}">${escapeHtml(
        realtimeCallStatusLabel(controls.status)
      )}</span>
    </section>
  `;
}

function renderRealtimeConnectionBoundary(
  boundary: RealtimeConnectionBoundary,
  callControls: RealtimeCallControls
): string {
  const tokenEndpointContractLabel = `${boundary.tokenEndpointContract.localEndpoint.method} ${boundary.tokenEndpointContract.localEndpoint.path}`;
  const requirements = boundary.requirements
    .map(renderRealtimeConnectionRequirement)
    .join("");
  const blockedReasons = boundary.blockedReasons
    .map((reason) => `<li>${escapeHtml(safeJapaneseDetail(reason))}</li>`)
    .join("");

  return `
    <section
      class="realtime-panel"
      aria-labelledby="realtime-boundary-title"
      data-realtime-status="${escapeHtml(boundary.status)}"
      data-session-start-allowed="false"
      data-browser-api-key-allowed="false"
      data-microphone-capture-allowed="false"
      data-external-audio-send-allowed="false"
      data-persistent-save-allowed="false"
      data-production-phone-connection-allowed="false"
      data-tool-calling-allowed="false"
      data-token-endpoint-adapter-status="${escapeHtml(boundary.tokenEndpointAdapter.status)}"
      data-token-endpoint-contract-path="${escapeHtml(boundary.tokenEndpointContract.localEndpoint.path)}"
    >
      <div class="realtime-heading">
        <div>
          <p class="eyebrow">リアルタイム接続境界</p>
          <h3 id="realtime-boundary-title">${escapeHtml(boundaryStatusLabel(boundary))}</h3>
        </div>
        <span>${escapeHtml(boundary.officialDocs.verifiedOn)}</span>
      </div>
      <p>${escapeHtml(boundaryMessage(boundary))}</p>
      ${renderRealtimeCallControls(callControls)}
      <dl>
        <div>
          <dt>ブラウザAPIキー</dt>
          <dd>ブロック</dd>
        </div>
        <div>
          <dt>クライアントシークレット</dt>
          <dd>${boundary.ephemeralClientSecretAvailable ? "利用可能" : "サーバー要"}</dd>
        </div>
        <div>
          <dt>トークン取得先</dt>
          <dd>${boundary.tokenEndpointConfigured ? "設定済" : "未設定"}</dd>
        </div>
        <div>
          <dt>トークン契約</dt>
          <dd>${escapeHtml(tokenEndpointContractLabel)} / サーバーアダプター</dd>
        </div>
        <div>
          <dt>無効化アダプター</dt>
          <dd>${escapeHtml(technicalStatusLabel(boundary.tokenEndpointAdapter.status))} / ${
            boundary.localFallbackAvailable ? "ローカル代替あり" : "代替なし"
          }</dd>
        </div>
        <div>
          <dt>マイク</dt>
          <dd>${escapeHtml(microphoneLabel(boundary.microphonePermissionState))}</dd>
        </div>
        <div>
          <dt>外部音声送信</dt>
          <dd>ブロック</dd>
        </div>
        <div>
          <dt>セッション開始</dt>
          <dd>無効</dd>
        </div>
      </dl>
      <div class="realtime-lists">
        <div>
          <span>有効化に必要な条件</span>
          <ul>${requirements}</ul>
        </div>
        <div>
          <span>現在ブロック中</span>
          <ul>${blockedReasons}</ul>
        </div>
      </div>
    </section>
  `;
}

function renderRealtimeCallControls(controls: RealtimeCallControls): string {
  const failure = controls.lastFailure;

  return `
    <div
      class="realtime-call-controls"
      data-realtime-call-status="${escapeHtml(controls.status)}"
      data-microphone-permission-state="${escapeHtml(controls.microphonePermissionState)}"
      data-realtime-token-endpoint="${escapeHtml(controls.tokenEndpointPath)}"
      data-realtime-webrtc-endpoint="${escapeHtml(controls.webRtcCallsEndpoint)}"
      data-realtime-browser-api-key-allowed="false"
      ${
        failure
          ? `data-realtime-failure-stage="${escapeHtml(failure.stage)}" data-realtime-failure-http-status="${escapeHtml(
              failure.httpStatus?.toString() ?? ""
            )}" data-realtime-failure-error-code="${escapeHtml(failure.errorCode ?? "")}"`
          : ""
      }
    >
      <div>
        <span>リアルタイム通話操作</span>
        <strong>${escapeHtml(realtimeCallHeadline(controls.status))}</strong>
        <p>${escapeHtml(realtimeCallDetail(controls.status))}</p>
        ${failure ? renderRealtimeFailureDiagnostics(controls) : ""}
      </div>
      <div class="realtime-control-actions">
        <button
          type="button"
          data-realtime-start-call
          ${controls.startCallAvailable ? "" : "disabled"}
        >通話を開始</button>
        <button
          type="button"
          data-realtime-end-call
          ${controls.endCallAvailable ? "" : "disabled"}
        >終了</button>
      </div>
    </div>
  `;
}

function renderRealtimeFailureDiagnostics(
  controls: RealtimeCallControls
): string {
  const failure = controls.lastFailure;

  if (!failure) {
    return "";
  }

  return `
    <div class="realtime-failure-diagnostics" aria-label="リアルタイム接続 診断">
      <span>リアルタイム接続 診断</span>
      <dl>
        <div>
          <dt>段階</dt>
          <dd>${escapeHtml(failure.stage)}</dd>
        </div>
        <div>
          <dt>メッセージ</dt>
          <dd>${escapeHtml(safeJapaneseDetail(failure.message))}</dd>
        </div>
        ${
          failure.httpStatus
            ? `<div><dt>HTTPステータス</dt><dd>${escapeHtml(failure.httpStatus.toString())}</dd></div>`
            : ""
        }
        ${
          failure.errorCode
            ? `<div><dt>エラーコード</dt><dd>${escapeHtml(failure.errorCode)}</dd></div>`
            : ""
        }
        <div>
          <dt>マイク</dt>
          <dd>${escapeHtml(microphoneLabel(controls.microphonePermissionState))}</dd>
        </div>
        ${
          failure.endpoint
            ? `<div><dt>エンドポイント</dt><dd>${escapeHtml(failure.endpoint)}</dd></div>`
            : ""
        }
      </dl>
    </div>
  `;
}

function renderRealtimeCallHandoffRecord(
  record: RealtimeCallHandoffRecord
): string {
  const evidenceItems = record.evidenceReferences
    .map((reference) => `<li>${escapeHtml(reference)}</li>`)
    .join("");
  const transcriptItems = record.transcript
    .map(renderRealtimeTranscriptEntry)
    .join("");
  const blockedItems = record.policyDecision.blockedResponseTypes
    .map((blockedType) => `<li>${escapeHtml(safeJapaneseDetail(blockedType))}</li>`)
    .join("");

  return `
    <section
      class="realtime-handoff"
      aria-labelledby="realtime-handoff-title"
      data-realtime-handoff-status="${escapeHtml(record.status)}"
      data-realtime-handoff-call-id="${escapeHtml(record.callId)}"
      data-browser-only="true"
      data-persistent-save-allowed="false"
      data-external-send-allowed="false"
      data-production-phone-connection-allowed="false"
    >
      <div class="summary-heading">
        <h3 id="realtime-handoff-title">リアルタイム通話 引き継ぎ記録</h3>
        <span>${escapeHtml(record.callId)}</span>
      </div>
      <p class="summary-main">${escapeHtml(safeJapaneseDetail(record.summary))}</p>
      <dl>
        <div>
          <dt>ステータス</dt>
          <dd>${record.status === "recorded" ? "ブラウザ状態に記録済み" : "フォールバック記録（ブラウザ）"}</dd>
        </div>
        <div>
          <dt>ポリシー判定</dt>
          <dd>${escapeHtml(policyOutcomeLabel(record.policyDecision.outcome))}</dd>
        </div>
        <div>
          <dt>ポリシー判定レーン</dt>
          <dd>${escapeHtml(policyScopeLabel(record.policyDecision.allowedResponseScope))}</dd>
        </div>
        <div>
          <dt>顧客個別回答</dt>
          <dd>${record.policyDecision.customerSpecificAnswerAllowed ? "可" : "不可"}</dd>
        </div>
        <div>
          <dt>人の確認</dt>
          <dd>${record.policyDecision.humanReviewRequired ? "必要" : "不要"}</dd>
        </div>
        <div>
          <dt>次のアクション</dt>
          <dd>${escapeHtml(safeJapaneseDetail(record.nextAction))}</dd>
        </div>
        <div>
          <dt>保存先</dt>
          <dd>ブラウザ状態 + デモ用サーバーローカルJSON（本番DB/外部永続保存なし）</dd>
        </div>
      </dl>
      <div class="summary-evidence">
        <span>通話文字起こし</span>
        ${
          record.transcript.length > 0
            ? `<ul>${transcriptItems}</ul>`
            : `<p class="summary-empty">引き継ぎ前に通話文字起こしイベントは取得されませんでした。</p>`
        }
      </div>
      ${
        record.evidenceReferences.length > 0
          ? `<div class="summary-evidence"><span>根拠参照</span><ul>${evidenceItems}</ul></div>`
          : ""
      }
      ${
        record.policyDecision.blockedResponseTypes.length > 0
          ? `<div class="summary-evidence"><span>ブロックされた回答種別</span><ul>${blockedItems}</ul></div>`
          : ""
      }
    </section>
  `;
}

function renderRealtimeTranscriptEntry(entry: RealtimeTranscriptEntry): string {
  return `
    <li>
      <strong>${entry.role === "customer" ? "お客様" : "AI"}</strong>
      ${escapeHtml(entry.text)}
      <span>${entry.final ? "確定" : "途中"} / ${escapeHtml(entry.sourceEventType)}</span>
    </li>
  `;
}

function renderRealtimeConnectionRequirement(
  requirement: RealtimeConnectionRequirement
): string {
  const status = requirement.satisfied ? "ready" : "pending";

  return `
    <li>
      <strong>${escapeHtml(requirementLabel(requirement.label))} (${escapeHtml(
        technicalStatusLabel(status)
      )})</strong>
      ${escapeHtml(safeJapaneseDetail(requirement.detail))}
    </li>
  `;
}

function renderCallWorkspace(
  item: QueueItem | undefined,
  summary: CallSummary,
  policy: ResponsePolicyGuard
): string {
  const escapedCallId = escapeHtml(summary.callId);
  const customerLine = item
    ? `${item.callerName} / ${item.customerId ?? item.id}`
    : "デモシナリオ未選択";
  const serviceLine = item
    ? `${item.serviceArea ?? "エリア確認中"} / ${item.servicePlan ?? "サービス確認中"}`
    : "ご契約状況を確認中";
  const statusText = item ? statusLabel(item.status) : "デモシナリオ未一致";
  const topicText = item?.topic ?? "デモシナリオ未選択";

  return `
    <section
      class="call-workspace"
      aria-labelledby="call-workspace-title"
      data-call-workspace-call-id="${escapedCallId}"
      data-phone-connection="not-connected"
      data-external-send-allowed="false"
      data-persistence-allowed="false"
    >
      <div class="call-workspace__header">
        <div>
          <p class="eyebrow">通話ワークスペース</p>
          <h3 id="call-workspace-title">確認モード</h3>
        </div>
        <span>${escapedCallId}</span>
      </div>
      <p class="call-workspace__boundary">
        本番電話接続なし。ブラウザ内レビューのみで、顧客情報・音声の外部送信と本番DB保存はブロックしたままです。
      </p>
      <dl class="call-workspace__details">
        <div>
          <dt>選択中の案件</dt>
          <dd>${escapeHtml(topicText)}</dd>
        </div>
        <div>
          <dt>ステータス</dt>
          <dd>${escapeHtml(statusText)}</dd>
        </div>
        <div>
          <dt>お客様情報（架空）</dt>
          <dd>${escapeHtml(customerLine)}</dd>
        </div>
        <div>
          <dt>ご契約状況</dt>
          <dd>${escapeHtml(serviceLine)}</dd>
        </div>
        <div>
          <dt>ポリシー判定レーン</dt>
          <dd>${escapeHtml(policyScopeLabel(policy.allowedResponseScope))}</dd>
        </div>
        <div>
          <dt>次のアクション</dt>
          <dd>${escapeHtml(summary.nextAction)}</dd>
        </div>
      </dl>
    </section>
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
        <h3 id="call-summary-title">通話サマリ</h3>
        <span>${escapeHtml(summary.callId)}</span>
      </div>
      <p class="summary-main">${escapeHtml(safeJapaneseDetail(summary.inquirySummary))}</p>
      <dl>
        <div>
          <dt>ポリシー判定</dt>
          <dd>${escapeHtml(safeJapaneseDetail(summary.policyDecision.summary))}</dd>
        </div>
        <div>
          <dt>オペレーターメモ</dt>
          <dd>${escapeHtml(safeJapaneseDetail(summary.operatorNoteStatus.summary))}</dd>
        </div>
        <div>
          <dt>次のアクション</dt>
          <dd>${escapeHtml(safeJapaneseDetail(summary.nextAction))}</dd>
        </div>
        <div>
          <dt>要約のみ</dt>
          <dd>顧客情報・音声の外部送信ブロック / 本番DB保存ブロック</dd>
        </div>
      </dl>
      ${
        summary.evidenceReferences.length > 0
          ? `<div class="summary-evidence"><span>根拠参照</span><ul>${evidenceItems}</ul></div>`
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
        <h3 id="executive-brief-title">経営向け要約</h3>
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
      <p>${escapeHtml(safeJapaneseDetail(item.detail))}</p>
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
        <h3 id="fallback-title">フォールバック演習</h3>
        <span>${escapeHtml(safeJapaneseDetail(plan.statusText))}</span>
      </div>
      <p>${escapeHtml(safeJapaneseDetail(plan.operatorMessage))}</p>
      <dl>
        <div>
          <dt>シナリオ数</dt>
          <dd>${plan.scenarioCount}</dd>
        </div>
        <div>
          <dt>手動進行</dt>
          <dd>${plan.guardrails.manualProgressionAllowed ? "準備完了" : "ブロック"}</dd>
        </div>
        <div>
          <dt>外部送信</dt>
          <dd>ブロック</dd>
        </div>
        <div>
          <dt>永続保存</dt>
          <dd>ブロック</dd>
        </div>
      </dl>
      <div class="policy-lists">
        <div>
          <span>進行順</span>
          <ul>${steps}</ul>
        </div>
      </div>
    </section>
  `;
}

function renderFallbackRehearsalStep(step: FallbackRehearsalStep): string {
  const reviewLabel = step.humanReviewRequired ? "人の確認" : "ローカル下書き";

  return `
    <li>
      ${escapeHtml(step.callId)}: ${escapeHtml(step.label)}
      (${escapeHtml(policyOutcomeLabel(step.expectedPolicyOutcome))}, ${reviewLabel})
    </li>
  `;
}

function renderConversationThreadPreview(preview: ConversationThreadPreview): string {
  const messages = preview.messages.map(renderConversationThreadMessage).join("");

  return `
    <section class="thread-panel" aria-labelledby="thread-title">
      <div class="thread-heading">
        <h3 id="thread-title">会話プレビュー</h3>
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
      <span>${escapeHtml(conversationRoleLabel(message.label))}</span>
      <p>${escapeHtml(message.body)}</p>
    </article>
  `;
}

function renderAssistantInputPreview(preview: AssistantInputPreview): string {
  const escapedCallId = escapeHtml(preview.callId);

  return `
    <section class="input-panel" aria-labelledby="input-title" data-input-preview-call-id="${escapedCallId}">
      <div class="input-heading">
        <h3 id="input-title">オペレーターメモ</h3>
        <span>${escapedCallId}</span>
      </div>
      <label for="operator-note">${escapeHtml(inputLabel(preview.label))}</label>
      <textarea
        id="operator-note"
        data-input-call-id="${escapedCallId}"
        rows="4"
        aria-describedby="operator-note-status"
      >${escapeHtml(operatorInputValue(preview.value))}</textarea>
      <p id="operator-note-status">${escapeHtml(inputStatusText(preview.statusText))}</p>
      <div
        class="input-boundary"
        data-submit-save-candidate-call-id="${escapedCallId}"
        data-external-send-allowed="false"
        data-persistence-allowed="false"
      >
        <span>送信・保存の候補（未確定）</span>
        <dl>
          <div>
            <dt>案件</dt>
            <dd>${escapedCallId}</dd>
          </div>
          <div>
            <dt>外部送信</dt>
            <dd>ブロック</dd>
          </div>
          <div>
            <dt>永続保存</dt>
            <dd>ブロック</dd>
          </div>
          <div>
            <dt>保存先</dt>
            <dd>ブラウザ状態のみ</dd>
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
    <section class="policy-panel policy-card" aria-labelledby="policy-title">
      <div class="policy-heading">
        <h3 id="policy-title">ポリシー判定</h3>
        <span>${escapeHtml(policyOutcomeLabel(policy.outcome))}</span>
      </div>
      <p>${escapeHtml(policy.reasons[0] ?? "ポリシー判定は確認可能です。")}</p>
      <dl>
        <div>
          <dt>判定レーン</dt>
          <dd>${escapeHtml(policyScopeLabel(policy.allowedResponseScope))}</dd>
        </div>
        <div>
          <dt>人の確認</dt>
          <dd>${policy.humanReviewRequired ? "必要" : "不要"}</dd>
        </div>
        <div>
          <dt>顧客個別回答</dt>
          <dd>${policy.customerSpecificAnswerAllowed ? "可" : "不可"}</dd>
        </div>
        <div>
          <dt>外部送信</dt>
          <dd>ブロック</dd>
        </div>
        <div>
          <dt>永続保存</dt>
          <dd>ブロック</dd>
        </div>
      </dl>
      <div class="policy-lists">
        <div>
          <span>許可されている回答</span>
          <ul class="allow-list">${allowedTopics}</ul>
        </div>
        ${
          policy.blockedResponseTypes.length > 0
            ? `<div><span>ブロックされた回答種別</span><ul class="block-list">${blockedResponseTypes}</ul></div>`
            : ""
        }
      </div>
    </section>
  `;
}

function policyOutcomeLabel(outcome: ResponsePolicyOutcome): string {
  const labels: Record<ResponsePolicyOutcome, string> = {
    "general-guidance-only": "一般案内のみ可",
    "customer-specific-answer-blocked": "顧客個別回答は不可",
    "human-review-required": "人の確認が必要",
    "scoped-draft-allowed": "範囲を絞った下書き可"
  };

  return labels[outcome];
}

function policyScopeLabel(scope: ResponsePolicyAllowedScope): string {
  const labels: Record<ResponsePolicyAllowedScope, string> = {
    "general-information-only": "一般情報のみ",
    "handoff-only": "引き継ぎのみ",
    "verified-customer-context": "本人確認済みコンテキスト"
  };

  return labels[scope];
}

function renderConversationDraft(draft: AssistantConversationDraft): string {
  return `
    <section class="draft-panel" aria-labelledby="draft-title">
      <div class="draft-heading">
        <h3 id="draft-title">応答ドラフト</h3>
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
        <h3 id="evidence-title">根拠候補</h3>
        <span>${evidence.resultCount}件のソース</span>
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
      <span class="evidence-score">スコア ${item.score}</span>
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
    verificationLabel(item.verificationStatus),
    item.callerName,
    formatWaitTime(item.waitSeconds)
  ].filter((value): value is string => typeof value === "string" && value.length > 0);

  return `
    <article class="queue-item queue-item--${item.priority}${
      isSelected ? " queue-item--selected is-selected" : ""
    }" data-status="${escapeHtml(item.status)}" data-priority="${escapeHtml(
      item.priority
    )}" data-queue-call-id="${escapedId}"${isSelected ? ' aria-current="true"' : ""}>
      <div class="queue-main">
        <div class="queue-title-row">
          <h3>${escapedTopic}</h3>
          <span class="status-badge badge ${statusTone(item.status)}"><span class="dot"></span>${statusLabel(
            item.status
          )}</span>
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
