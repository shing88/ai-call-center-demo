import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAssistantConversationDraft,
  buildAssistantInputPreview,
  buildConversationThreadPreview,
  buildQueueSummary,
  demoState,
  escapeHtml,
  formatWaitTime,
  renderApp,
  type DemoState
} from "../src/app.js";
import { buildFallbackRehearsalPlan } from "../src/fallback-rehearsal.js";
import { buildRealtimeConnectionBoundary } from "../src/realtime-connection.js";
import { buildRealtimeCallControls } from "../src/realtime-call-controls.js";
import type { RealtimeCallHandoffRecord } from "../src/realtime-call-recording.js";

test("buildQueueSummary counts statuses and average wait time", () => {
  const summary = buildQueueSummary([
    {
      id: "1",
      callerName: "A",
      topic: "Status",
      status: "waiting",
      priority: "normal",
      waitSeconds: 30,
      excerpt: "First"
    },
    {
      id: "2",
      callerName: "B",
      topic: "Escalation",
      status: "human-review",
      priority: "high",
      waitSeconds: 90,
      excerpt: "Second"
    }
  ]);

  assert.deepEqual(summary, {
    waiting: 1,
    aiHandling: 0,
    humanReview: 1,
    highPriority: 1,
    averageWaitSeconds: 60
  });
});

test("formatWaitTime formats sub-minute and minute durations", () => {
  assert.equal(formatWaitTime(35), "35秒");
  assert.equal(formatWaitTime(125), "2分05秒");
});

test("renderApp escapes caller-provided text before rendering HTML", () => {
  const state: DemoState = {
    agentName: "Ops <Lead>",
    assistantSuggestion: "Never render <script>alert(1)</script>",
    assistantEvidence: {
      callId: "CALL-1",
      query: "Billing <issue>",
      resultCount: 1,
      results: [
        {
          sourcePath: "business_rules/<unsafe>.md",
          section: "Rule <script>alert(1)</script>",
          snippet: "Use <strong>safe</strong> evidence.",
          score: 12
        }
      ]
    },
    activeQueue: [
      {
        id: "CALL-1",
        callerName: "User <img>",
        topic: "Billing <issue>",
        status: "waiting",
        priority: "normal",
        waitSeconds: 5,
        excerpt: "Please call <script>alert(1)</script>"
      }
    ]
  };

  const html = renderApp(state);

  assert.match(html, /Billing &lt;issue&gt;/);
  assert.match(html, /Ops &lt;Lead&gt;/);
  assert.match(html, /Please call &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /business_rules\/&lt;unsafe&gt;\.md/);
  assert.match(html, /Rule &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /Use &lt;strong&gt;safe&lt;\/strong&gt; evidence\./);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.doesNotMatch(html, /<strong>safe<\/strong>/);
});

test("renderApp displays assistant evidence candidates", () => {
  const html = renderApp();

  assert.match(html, /根拠候補/);
  assert.match(html, /CALL-CC-03/);
  assert.match(html, /business_rules\/005_ccnet_public_service_guidance\.md/);
  assert.match(html, /CCNet光10G/);
});

test("buildAssistantConversationDraft uses the selected queue item and first evidence source", () => {
  const item = {
    id: "CALL-9",
    callerName: "User A",
    topic: "配送確認",
    status: "ai-handling" as const,
    priority: "normal" as const,
    waitSeconds: 12,
    excerpt: "注文の到着予定を知りたいです。"
  };
  const draft = buildAssistantConversationDraft(item, {
    callId: "CALL-9",
    query: "配送確認 注文の到着予定を知りたいです。",
    resultCount: 1,
    results: [
      {
        sourcePath: "business_rules/004_escalation_policy.md",
        section: "上席確認ルール > AIが行う引き継ぎ準備",
        snippet: "AIが行う引き継ぎ準備として、顧客が求めている解決内容をまとめます。",
        score: 9
      }
    ]
  });

  assert.equal(draft.callId, "CALL-9");
  assert.match(draft.response, /User Aさんには、配送確認について受付済みであることを伝える/);
  assert.match(draft.evidenceLine, /business_rules\/004_escalation_policy\.md/);
  assert.match(draft.evidenceLine, /上席確認ルール/);
  assert.match(draft.handoffNote, /注文の到着予定/);
});

test("buildAssistantConversationDraft stays useful while evidence is empty", () => {
  const draft = buildAssistantConversationDraft(undefined, {
    callId: "CALL-0",
    query: "",
    resultCount: 0,
    results: []
  });

  assert.equal(draft.callId, "CALL-0");
  assert.match(draft.response, /対象のデモシナリオを確認中/);
  assert.match(draft.evidenceLine, /根拠候補は確認中/);
});

test("renderApp displays a conversation draft for the selected queue item", () => {
  const html = renderApp();

  assert.match(html, /応答ドラフト/);
  assert.match(html, /山本 花さんには、CCNet光10G Wi-Fi 相談について受付済みであることを伝える/);
  assert.match(html, /根拠: business_rules\/005_ccnet_public_service_guidance\.md/);
});

test("renderApp switches the conversation draft with assistant evidence call id", () => {
  const html = renderApp({
    ...demoState,
    assistantEvidence: {
      callId: "CALL-CC-01",
      query: "安全・安心123チャンネル 大雨 道路 河川カメラ",
      resultCount: 1,
      results: [
        {
          sourcePath: "business_rules/004_escalation_policy.md",
          section: "上席確認ルール > AIが行う引き継ぎ準備",
          snippet: "AIが行う引き継ぎ準備として、顧客が求めている解決内容をまとめます。",
          score: 12
        }
      ]
    }
  });

  assert.match(html, /田中 美咲さんには、安全・安心123チャンネル確認について受付済みであることを伝える/);
  assert.match(html, /道路・河川カメラ/);
  assert.match(html, /business_rules\/004_escalation_policy\.md/);
});

test("buildConversationThreadPreview creates customer, assistant, and internal messages", () => {
  const item = {
    id: "CALL-9",
    callerName: "User A",
    topic: "配送確認",
    status: "ai-handling" as const,
    priority: "normal" as const,
    waitSeconds: 12,
    excerpt: "注文の到着予定を知りたいです。"
  };
  const draft = buildAssistantConversationDraft(item, {
    callId: "CALL-9",
    query: "配送確認 注文の到着予定を知りたいです。",
    resultCount: 1,
    results: [
      {
        sourcePath: "business_rules/004_escalation_policy.md",
        section: "上席確認ルール > AIが行う引き継ぎ準備",
        snippet: "AIが行う引き継ぎ準備として、顧客が求めている解決内容をまとめます。",
        score: 9
      }
    ]
  });
  const preview = buildConversationThreadPreview(item, draft);

  assert.equal(preview.callId, "CALL-9");
  assert.deepEqual(
    preview.messages.map((message) => message.role),
    ["customer", "assistant", "internal"]
  );
  assert.match(preview.messages[0]?.body ?? "", /User A/);
  assert.match(preview.messages[0]?.body ?? "", /注文の到着予定/);
  assert.match(preview.messages[1]?.body ?? "", /配送確認について受付済み/);
  assert.match(preview.messages[2]?.body ?? "", /business_rules\/004_escalation_policy\.md/);
});

test("buildConversationThreadPreview stays stable without a queue item", () => {
  const draft = buildAssistantConversationDraft(undefined, {
    callId: "CALL-0",
    query: "",
    resultCount: 0,
    results: []
  });
  const preview = buildConversationThreadPreview(undefined, draft);

  assert.equal(preview.callId, "CALL-0");
  assert.match(preview.messages[0]?.body ?? "", /デモシナリオを選択中/);
  assert.match(preview.messages[1]?.body ?? "", /対象のデモシナリオを確認中/);
  assert.match(preview.messages[2]?.body ?? "", /根拠候補は確認中/);
});

test("buildAssistantInputPreview links an unsent draft to the selected queue item", () => {
  const item = {
    id: "CALL-9",
    callerName: "User A",
    topic: "Delivery check",
    status: "ai-handling" as const,
    priority: "normal" as const,
    waitSeconds: 12,
    excerpt: "Customer wants the estimated arrival date."
  };
  const draft = buildAssistantConversationDraft(item, {
    callId: "CALL-9",
    query: "Delivery check Customer wants the estimated arrival date.",
    resultCount: 0,
    results: []
  });
  const inputPreview = buildAssistantInputPreview(item, draft);

  assert.equal(inputPreview.callId, "CALL-9");
  assert.match(inputPreview.value, /Delivery check/);
  assert.match(inputPreview.value, /estimated arrival date/);
  assert.match(inputPreview.statusText, /not sent or saved/);
});

test("buildAssistantInputPreview can prepare an edited browser-only submit/save candidate", () => {
  const item = {
    id: "CALL-9",
    callerName: "User A",
    topic: "Delivery check",
    status: "ai-handling" as const,
    priority: "normal" as const,
    waitSeconds: 12,
    excerpt: "Customer wants the estimated arrival date."
  };
  const draft = buildAssistantConversationDraft(item, {
    callId: "CALL-9",
    query: "Delivery check Customer wants the estimated arrival date.",
    resultCount: 0,
    results: []
  });
  const inputPreview = buildAssistantInputPreview(item, draft, {
    value: "Edited note for the next handoff."
  });

  assert.equal(inputPreview.value, "Edited note for the next handoff.");
  assert.equal(inputPreview.candidate.kind, "operator-input-submit-save-candidate");
  assert.equal(inputPreview.candidate.callId, "CALL-9");
  assert.equal(inputPreview.candidate.operatorInput.value, "Edited note for the next handoff.");
  assert.deepEqual(inputPreview.candidate.status, {
    unsent: true,
    unsaved: true,
    browserOnly: true
  });
  assert.deepEqual(inputPreview.candidate.guardrails, {
    externalSendAllowed: false,
    persistenceAllowed: false,
    candidateOnly: true
  });
});

test("buildAssistantInputPreview stays explicit without a selected queue item", () => {
  const draft = buildAssistantConversationDraft(undefined, {
    callId: "CALL-0",
    query: "",
    resultCount: 0,
    results: []
  });
  const inputPreview = buildAssistantInputPreview(undefined, draft);

  assert.equal(inputPreview.callId, "CALL-0");
  assert.match(inputPreview.value, /No queue item selected/);
  assert.match(inputPreview.statusText, /not sent or saved/);
});

test("renderApp displays a conversation preview for the selected queue item", () => {
  const html = renderApp();

  assert.match(html, /会話プレビュー/);
  assert.match(html, /お客様/);
  assert.match(html, /山本 花: 春日井市の自宅でテレワーク中にWi-Fiが不安定です。/);
  assert.match(html, /CCNet光10G へ変えられるか/);
  assert.match(html, /AIドラフト案/);
  assert.match(html, /内部メモ/);
});

test("renderApp displays an unsent operator input for the selected queue item", () => {
  const html = renderApp();

  assert.match(html, /オペレーターメモ/);
  assert.match(html, /data-input-call-id="CALL-CC-03"/);
  assert.match(html, /未送信のデモ入力/);
  assert.match(html, /外部送信・永続保存は行いません/);
  assert.doesNotMatch(html, /type="submit"/);
  assert.doesNotMatch(html, />Send</);
});

test("renderApp displays a policy guard without implying send or save", () => {
  const html = renderApp();

  assert.match(html, /ポリシー判定/);
  assert.match(html, /顧客個別回答は不可/);
  assert.match(html, /一般情報のみ/);
  assert.match(html, /外部送信/);
  assert.match(html, /ブロック/);
  assert.match(html, /永続保存/);
  assert.doesNotMatch(html, /送信済み/);
  assert.doesNotMatch(html, /保存済み/);
});

test("renderApp leads with an executive demo brief that connects evidence, policy, fallback, and no-send/no-save boundaries", () => {
  const html = renderApp({
    ...demoState,
    fallbackRehearsal: buildFallbackRehearsalPlan()
  });
  const queueIndex = html.indexOf('id="queue-title"');
  const briefIndex = html.indexOf('id="executive-brief-title"');
  const realtimeIndex = html.indexOf('id="realtime-boundary-bar-title"');
  const summaryIndex = html.indexOf('id="call-summary-title"');
  const evidenceIndex = html.indexOf('id="evidence-title"');
  const policyIndex = html.indexOf('id="policy-title"');
  const fallbackIndex = html.indexOf('id="fallback-title"');

  assert.ok(queueIndex >= 0);
  assert.ok(briefIndex >= 0);
  assert.ok(briefIndex > queueIndex);
  assert.ok(realtimeIndex > briefIndex);
  assert.ok(summaryIndex > briefIndex);
  assert.ok(evidenceIndex > summaryIndex);
  assert.ok(policyIndex > evidenceIndex);
  assert.ok(fallbackIndex > policyIndex);
  assert.match(html, /経営向け要約/);
  assert.match(html, /CCNet適合シナリオ/);
  assert.match(html, /CCNet株式会社 \/ 架空/);
  assert.match(html, /CCNet光10G/);
  assert.match(html, /安全・安心123チャンネル/);
  assert.match(html, /架空お客様情報/);
  assert.match(html, /customer_ccnet_2001/);
  assert.match(html, /CCNet光1G おとく割/);
  assert.match(html, /本人確認前は契約状態を断定しない/);
  assert.match(html, /架空顧客情報のみを使用/);
  assert.match(html, /根拠候補/);
  assert.match(html, /ポリシー判定/);
  assert.match(html, /フォールバック演習/);
  assert.match(html, /送信・保存ブロック境界/);
  assert.match(html, /顧客情報・音声の外部送信ブロック/);
  assert.match(html, /本番DB保存ブロック/);
  assert.match(html, /本番接続なし/);
  assert.match(html, /通話サマリ/);
  assert.match(html, /山本 花さん/);
  assert.match(html, /次のアクション/);
  assert.match(html, /本人確認/);
  assert.match(html, /要約のみ/);
  assert.doesNotMatch(html, /Live API connected/);
});

test("renderApp shows selected scenario details in the center workspace", () => {
  const html = renderApp({
    ...demoState,
    assistantEvidence: {
      ...demoState.assistantEvidence,
      callId: "CALL-CC-04",
      query: "ケーブルプラス電話 追加 customer_ccnet_2004",
      resultCount: 1,
      results: [
        {
          sourcePath: "scenarios/scenario_06_ccnet_cableplus_existing_net_add.md",
          section: "応対ステップ",
          snippet: "契約者本人であることを確認する。",
          score: 12
        }
      ]
    }
  });
  const scenarioIndex = html.indexOf('id="scenario-spotlight-title"');
  const queueIndex = html.indexOf('id="queue-title"');
  const workspaceIndex = html.indexOf('id="call-workspace-title"');

  assert.ok(scenarioIndex >= 0);
  assert.ok(queueIndex >= 0);
  assert.ok(scenarioIndex > queueIndex);
  assert.ok(workspaceIndex > scenarioIndex);
  assert.match(html, /data-scenario-spotlight-call-id="CALL-CC-04"/);
  assert.match(html, /シナリオ詳細/);
  assert.match(html, /お客役が知っておく前提情報/);
  assert.match(html, /本人確認で答える情報/);
  assert.match(html, /デモ開始後に期待される話の流れ/);
  assert.match(html, /既存ネット加入者のケーブルプラス電話追加デモ/);
  assert.match(html, /森 彩乃役/);
  assert.match(html, /CCNet光1GとメッシュWi-Fi 2台を利用中/);
  assert.match(html, /契約者氏名: 森 彩乃（もり あやの）/);
  assert.match(
    html,
    /登録住所: 豊川市デモ町1丁目2番3号（とよかわし でもまち いっちょうめ にばん さんごう）/
  );
  assert.match(html, /登録電話番号: 0000-00-0000/);
  assert.match(html, /電話口の相手: 契約者本人/);
  assert.match(html, /サービス開始月 2025年4月/);
  assert.match(html, /デモ用合言葉カテゴリ 町内会/);
  assert.match(html, /契約者の氏名・登録住所・登録電話番号/);
  assert.match(html, /本人以外からの電話申し込みは受け付けない/);
  assert.match(html, /6ステップ/);
});

test("renderApp switches the scenario detail when another demo scenario is selected", () => {
  const html = renderApp({
    ...demoState,
    assistantEvidence: {
      ...demoState.assistantEvidence,
      callId: "CALL-CC-05",
      query: "ネット新規加入 ケーブルプラス電話 customer_ccnet_2005",
      resultCount: 1,
      results: [
        {
          sourcePath: "scenarios/scenario_07_ccnet_new_internet_cableplus_recommendation.md",
          section: "応対ステップ",
          snippet: "住居種別、提供エリア確認、利用目的を確認する。",
          score: 12
        }
      ]
    }
  });

  assert.match(html, /data-scenario-spotlight-call-id="CALL-CC-05"/);
  assert.match(html, /ネット新規加入時のケーブルプラス電話提案デモ/);
  assert.match(html, /西村 陽太役/);
  assert.match(html, /小牧市で新築戸建てに引っ越し予定/);
  assert.match(html, /家族にUQ mobile利用者/);
  assert.match(html, /住居種別、提供エリア、利用目的、Wi-Fi台数/);
  assert.match(html, /料金シミュレーション、提供エリア確認/);
  assert.doesNotMatch(html, /本人以外からの電話申し込みは受け付けない/);
});

test("renderApp switches the unsent operator input with assistant evidence call id", () => {
  const state: DemoState = {
    agentName: "Support Ops",
    assistantSuggestion: "Review before response.",
    assistantEvidence: {
      callId: "CALL-B",
      query: "Technical support password reset",
      resultCount: 1,
      results: [
        {
          sourcePath: "business_rules/reset.md",
          section: "Password reset",
          snippet: "Confirm identity before reset.",
          score: 7
        }
      ]
    },
    activeQueue: [
      {
        id: "CALL-A",
        callerName: "User A",
        topic: "Billing",
        status: "waiting",
        priority: "normal",
        waitSeconds: 15,
        excerpt: "Needs an invoice copy."
      },
      {
        id: "CALL-B",
        callerName: "User B",
        topic: "Technical support",
        status: "ai-handling",
        priority: "high",
        waitSeconds: 45,
        excerpt: "Needs a password reset."
      }
    ]
  };
  const html = renderApp(state);

  assert.match(html, /data-input-call-id="CALL-B"/);
  assert.match(html, /Technical support/);
  assert.match(html, /Needs a password reset/);
  assert.doesNotMatch(html, /data-input-call-id="CALL-A"/);
});

test("renderApp keeps edited operator notes separated by selected call id", () => {
  const state: DemoState = {
    agentName: "Support Ops",
    assistantSuggestion: "Review before response.",
    assistantEvidence: {
      callId: "CALL-B",
      query: "Technical support password reset",
      resultCount: 1,
      results: [
        {
          sourcePath: "business_rules/reset.md",
          section: "Password reset",
          snippet: "Confirm identity before reset.",
          score: 7
        }
      ]
    },
    activeQueue: [
      {
        id: "CALL-A",
        callerName: "User A",
        topic: "Billing",
        status: "waiting",
        priority: "normal",
        waitSeconds: 15,
        excerpt: "Needs an invoice copy."
      },
      {
        id: "CALL-B",
        callerName: "User B",
        topic: "Technical support",
        status: "ai-handling",
        priority: "high",
        waitSeconds: 45,
        excerpt: "Needs a password reset."
      }
    ],
    operatorNotes: {
      "CALL-A": "Edited note for invoice follow-up.",
      "CALL-B": "Edited note for password reset review."
    }
  };
  const html = renderApp(state);

  assert.match(html, /Edited note for password reset review\./);
  assert.match(html, /data-submit-save-candidate-call-id="CALL-B"/);
  assert.doesNotMatch(html, /Edited note for invoice follow-up\./);
});

test("renderApp escapes edited operator notes before rendering", () => {
  const html = renderApp({
    ...demoState,
    operatorNotes: {
      "CALL-CC-03": "Please review <script>alert(1)</script> before handoff."
    }
  });

  assert.match(html, /Please review &lt;script&gt;alert\(1\)&lt;\/script&gt; before handoff\./);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
});

test("renderApp escapes call summary fields before rendering", () => {
  const html = renderApp({
    agentName: "Support Ops",
    assistantSuggestion: "Review safely.",
    assistantEvidence: {
      callId: "CALL-HTML",
      query: "Unsafe <query>",
      resultCount: 1,
      results: [
        {
          sourcePath: "business_rules/<unsafe>.md",
          section: "Section <script>alert(1)</script>",
          snippet: "Snippet <img src=x onerror=alert(1)>",
          score: 9
        }
      ]
    },
    activeQueue: [
      {
        id: "CALL-HTML",
        callerName: "User <script>",
        topic: "Topic <b>",
        status: "waiting",
        priority: "normal",
        waitSeconds: 5,
        excerpt: "Excerpt <img src=x>"
      }
    ]
  });

  assert.match(html, /User &lt;script&gt;さん/);
  assert.match(html, /Topic &lt;b&gt;/);
  assert.match(html, /business_rules\/&lt;unsafe&gt;\.md/);
  assert.doesNotMatch(html, /<img src=x>/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
});

test("renderApp switches the conversation preview with assistant evidence call id", () => {
  const html = renderApp({
    ...demoState,
    assistantEvidence: {
      callId: "CALL-CC-01",
      query: "安全・安心123チャンネル 大雨 道路 河川カメラ",
      resultCount: 1,
      results: [
        {
          sourcePath: "business_rules/004_escalation_policy.md",
          section: "上席確認ルール > AIが行う引き継ぎ準備",
          snippet: "AIが行う引き継ぎ準備として、顧客が求めている解決内容をまとめます。",
          score: 12
        }
      ]
    }
  });

  assert.match(html, /会話プレビュー/);
  assert.match(html, /田中 美咲: 大雨の前に、テレビで道路・河川カメラや地域情報を確認する方法を知りたいです。/);
  assert.match(html, /安全・安心123チャンネル確認について受付済み/);
  assert.match(html, /上席確認ルール &gt; AIが行う引き継ぎ準備/);
});

test("renderApp marks the selected queue item from assistant evidence", () => {
  const html = renderApp();

  assert.match(html, /data-queue-call-id="CALL-CC-03"/);
  assert.match(html, /data-queue-open="CALL-CC-03"/);
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /aria-label=".*を選択"/);
  assert.match(html, /customer_ccnet_2001/);
  assert.match(html, /春日井市 \/ 戸建て/);
  assert.match(html, /本人確認: 未完了/);
  assert.match(html, /queue-item--selected/);
  assert.match(html, /aria-current="true"/);
  assert.match(html, /aria-pressed="true"/);
  assert.doesNotMatch(html, />開く<\/button>/);
});

test("renderApp frames the selected call as a review-only call workspace", () => {
  const html = renderApp();
  const workspaceIndex = html.indexOf('class="call-workspace"');
  const workspaceTitleIndex = html.indexOf('id="call-workspace-title"');
  const summaryIndex = html.indexOf('id="call-summary-title"');
  const threadIndex = html.indexOf('id="thread-title"');
  const inputIndex = html.indexOf('id="input-title"');
  const policyIndex = html.indexOf('id="policy-title"');
  const evidenceIndex = html.indexOf('id="evidence-title"');

  assert.ok(workspaceIndex >= 0);
  assert.ok(workspaceTitleIndex >= 0);
  assert.ok(threadIndex > workspaceTitleIndex);
  assert.ok(inputIndex > threadIndex);
  assert.ok(summaryIndex > inputIndex);
  assert.ok(evidenceIndex > summaryIndex);
  assert.ok(policyIndex > evidenceIndex);
  assert.match(html, /data-call-workspace-call-id="CALL-CC-03"/);
  assert.match(html, /通話ワークスペース/);
  assert.match(html, /確認モード/);
  assert.match(html, /本番電話接続なし/);
  assert.match(html, /CCNet光10G Wi-Fi/);
  assert.match(html, /customer_ccnet_2001/);
  assert.doesNotMatch(html, /Live call connected/i);
  assert.doesNotMatch(html, /external AI generated/i);
  assert.doesNotMatch(html, /sent successfully/i);
  assert.doesNotMatch(html, /saved successfully/i);
});

test("renderApp displays the Realtime connection boundary as not configured", () => {
  const html = renderApp();
  const realtimeIndex = html.indexOf('id="realtime-boundary-bar-title"');
  const workspaceIndex = html.indexOf('id="call-workspace-title"');
  const summaryIndex = html.indexOf('id="call-summary-title"');

  assert.ok(realtimeIndex >= 0);
  assert.ok(workspaceIndex > realtimeIndex);
  assert.ok(summaryIndex > workspaceIndex);
  assert.match(html, /リアルタイム接続境界/);
  assert.match(html, /リアルタイム未設定/);
  assert.match(html, /短命クライアントシークレット/);
  assert.match(html, /マイク権限/);
  assert.match(html, /トークン契約/);
  assert.match(html, /POST \/api\/realtime\/client-secret \/ サーバーアダプター/);
  assert.match(html, /無効化アダプター/);
  assert.match(html, /未設定 \/ ローカル代替あり/);
  assert.match(html, /data-realtime-status="not-configured"/);
  assert.match(html, /data-token-endpoint-adapter-status="not-configured"/);
  assert.match(html, /data-token-endpoint-contract-path="\/api\/realtime\/client-secret"/);
  assert.match(html, /data-browser-api-key-allowed="false"/);
  assert.match(html, /data-microphone-capture-allowed="false"/);
  assert.match(html, /data-external-audio-send-allowed="false"/);
  assert.match(html, /data-production-phone-connection-allowed="false"/);
  assert.doesNotMatch(html, /OPENAI_API_KEY/);
  assert.doesNotMatch(html, /sk-[A-Za-z0-9]/);
  assert.doesNotMatch(html, /ek_[A-Za-z0-9]/);
  assert.doesNotMatch(html, /Realtime connected/i);
});

test("renderApp displays browser Realtime call controls without exposing secrets", () => {
  const html = renderApp({
    ...demoState,
    realtimeCallControls: buildRealtimeCallControls({
      status: "connected",
      microphonePermissionState: "granted"
    })
  });

  assert.match(html, /リアルタイム通話操作/);
  assert.match(html, /通話を開始/);
  assert.match(html, /終了/);
  assert.match(html, /リアルタイム通話に接続済み/);
  assert.match(html, /data-realtime-call-status="connected"/);
  assert.match(html, /data-microphone-permission-state="granted"/);
  assert.match(html, /data-realtime-start-call/);
  assert.match(html, /data-realtime-end-call/);
  assert.doesNotMatch(html, /ek_test_ephemeral_client_secret/);
  assert.doesNotMatch(html, /server-standard-key/);
});

test("renderApp can reflect configured Realtime runtime health in the boundary", () => {
  const html = renderApp({
    ...demoState,
    realtimeConnection: buildRealtimeConnectionBoundary({
      tokenEndpointConfigured: true
    })
  });

  assert.match(html, /data-realtime-status="setup-incomplete"/);
  assert.match(html, /<dt>トークン取得先<\/dt>\s*<dd>設定済<\/dd>/);
  assert.match(html, /サーバートークン取得設定 \(準備完了\)/);
  assert.doesNotMatch(html, /サーバートークン取得先が未設定です。/);
});

test("renderApp displays Realtime failure diagnostics without exposing secrets", () => {
  const html = renderApp({
    ...demoState,
    realtimeCallControls: buildRealtimeCallControls({
      status: "fallback",
      microphonePermissionState: "granted",
      lastFailure: {
        stage: "realtime-calls",
        message: "OpenAI Realtime calls request failed with status 400.",
        httpStatus: 502,
        endpoint: "/api/realtime/calls",
        errorCode: "realtime_calls_upstream_error"
      }
    })
  });

  assert.match(html, /リアルタイム接続 診断/);
  assert.match(html, /realtime-calls/);
  assert.match(html, /HTTPステータス/);
  assert.match(html, /502/);
  assert.match(html, /エラーコード/);
  assert.match(html, /realtime_calls_upstream_error/);
  assert.match(html, /マイク/);
  assert.match(html, /許可済み/);
  assert.match(html, /data-realtime-failure-stage="realtime-calls"/);
  assert.match(html, /data-realtime-failure-http-status="502"/);
  assert.match(html, /data-realtime-failure-error-code="realtime_calls_upstream_error"/);
  assert.doesNotMatch(html, /ek_test_ephemeral_client_secret/);
  assert.doesNotMatch(html, /server-standard-key/);
});

test("renderApp displays the Realtime call handoff record after End call without implying save or send", () => {
  const html = renderApp({
    ...demoState,
    realtimeCallHandoff: sampleRealtimeCallHandoff
  });
  const handoffIndex = html.indexOf('id="realtime-handoff-title"');
  const controlsIndex = html.indexOf("data-realtime-start-call");
  const summaryIndex = html.indexOf('id="call-summary-title"');

  assert.ok(handoffIndex > controlsIndex);
  assert.ok(handoffIndex > summaryIndex);
  assert.match(html, /リアルタイム通話 引き継ぎ記録/);
  assert.match(html, /data-realtime-handoff-status="recorded"/);
  assert.match(html, /data-realtime-handoff-call-id="CALL-CC-03"/);
  assert.match(html, /data-persistent-save-allowed="false"/);
  assert.match(html, /data-external-send-allowed="false"/);
  assert.match(html, /Identity verification is needed/);
  assert.match(html, /business_rules\/demo\.md \/ Demo section/);
  assert.match(html, /顧客個別回答は不可/);
  assert.match(html, /次のアクション/);
  assert.match(html, /契約に踏み込む案内の前に本人確認を完了します。/);
  assert.match(html, /ブラウザ状態 \+ デモ用サーバーローカルJSON/);
  assert.match(html, /本番DB\/外部永続保存なし/);
  assert.match(html, /契約内容の個別変更/);
  assert.doesNotMatch(html, /saved successfully/i);
  assert.doesNotMatch(html, /sent successfully/i);
});

test("renderApp escapes Realtime handoff transcript text", () => {
  const html = renderApp({
    ...demoState,
    realtimeCallHandoff: {
      ...sampleRealtimeCallHandoff,
      transcript: [
        {
          role: "assistant",
          text: "Review <script>alert(1)</script> before handoff.",
          sourceEventType: "response.output_audio_transcript.done",
          final: true
        }
      ]
    }
  });

  assert.match(html, /Review &lt;script&gt;alert\(1\)&lt;\/script&gt; before handoff\./);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
});

test("renderApp keeps the assistant panel stable without evidence candidates", () => {
  const state: DemoState = {
    agentName: "Support Ops",
    assistantSuggestion: "確認中です。",
    assistantEvidence: {
      callId: "CALL-0",
      query: "",
      resultCount: 0,
      results: []
    },
    activeQueue: []
  };
  const html = renderApp(state);

  assert.match(html, /根拠候補はまだありません。/);
  assert.doesNotMatch(html, /evidence-item/);
});

test("escapeHtml escapes the HTML-sensitive characters", () => {
  assert.equal(escapeHtml(`"<tag>&'`), "&quot;&lt;tag&gt;&amp;&#39;");
});

const sampleRealtimeCallHandoff: RealtimeCallHandoffRecord = {
  version: 1,
  callId: "CALL-CC-03",
  status: "recorded",
  transcript: [
    {
      role: "assistant",
      text: "Identity verification is needed before account-specific changes.",
      sourceEventType: "response.output_audio_transcript.done",
      final: true
    }
  ],
  summary: "Customer asks about an account-specific contract change.",
  evidenceReferences: ["business_rules/demo.md / Demo section"],
  policyDecision: {
    outcome: "customer-specific-answer-blocked",
    allowedResponseScope: "general-information-only",
    customerSpecificAnswerAllowed: false,
    humanReviewRequired: false,
    blockedResponseTypes: ["account-specific contract change"]
  },
  nextAction: "Complete identity verification before account-specific guidance.",
  guardrails: {
    browserOnly: true,
    persistentSaveAllowed: false,
    externalSendAllowed: false,
    productionPhoneConnectionAllowed: false
  }
};
