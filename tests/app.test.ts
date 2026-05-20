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

  assert.match(html, /Evidence candidates/);
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
  assert.match(draft.response, /対象のキュー項目を確認中/);
  assert.match(draft.evidenceLine, /根拠候補は確認中/);
});

test("renderApp displays a conversation draft for the selected queue item", () => {
  const html = renderApp();

  assert.match(html, /Response draft/);
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
  assert.match(preview.messages[0]?.body ?? "", /キュー項目を選択中/);
  assert.match(preview.messages[1]?.body ?? "", /対象のキュー項目を確認中/);
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

  assert.match(html, /Conversation preview/);
  assert.match(html, /Customer/);
  assert.match(html, /山本 花: 春日井市の自宅でテレワーク中にWi-Fiが不安定です。/);
  assert.match(html, /CCNet光10G へ変えられるか/);
  assert.match(html, /AI draft/);
  assert.match(html, /Internal note/);
});

test("renderApp displays an unsent operator input for the selected queue item", () => {
  const html = renderApp();

  assert.match(html, /Operator note/);
  assert.match(html, /data-input-call-id="CALL-CC-03"/);
  assert.match(html, /Unsent demo input/);
  assert.match(html, /not sent or saved/);
  assert.doesNotMatch(html, /type="submit"/);
  assert.doesNotMatch(html, />Send</);
});

test("renderApp displays a policy guard without implying send or save", () => {
  const html = renderApp();

  assert.match(html, /Policy guard/);
  assert.match(html, /Customer-specific answer blocked/);
  assert.match(html, /General information only/);
  assert.match(html, /External send/);
  assert.match(html, /blocked/);
  assert.match(html, /Persistent save/);
  assert.doesNotMatch(html, /送信済み/);
  assert.doesNotMatch(html, /保存済み/);
});

test("renderApp leads with an executive demo brief that connects evidence, policy, fallback, and no-send/no-save boundaries", () => {
  const html = renderApp({
    ...demoState,
    fallbackRehearsal: buildFallbackRehearsalPlan()
  });
  const briefIndex = html.indexOf('id="executive-brief-title"');
  const summaryIndex = html.indexOf('id="call-summary-title"');

  assert.ok(briefIndex >= 0);
  assert.ok(summaryIndex > briefIndex);
  assert.ok(summaryIndex < html.indexOf('id="fallback-title"'));
  assert.ok(briefIndex < html.indexOf('id="fallback-title"'));
  assert.ok(briefIndex < html.indexOf('id="policy-title"'));
  assert.ok(briefIndex < html.indexOf('id="evidence-title"'));
  assert.match(html, /Executive demo brief/);
  assert.match(html, /CCNet-fit scenario/);
  assert.match(html, /CCNet株式会社 \/ fictional/);
  assert.match(html, /CCNet光10G/);
  assert.match(html, /安全・安心123チャンネル/);
  assert.match(html, /Fictional customer mockup/);
  assert.match(html, /customer_ccnet_2001/);
  assert.match(html, /CCNet光1G おとく割/);
  assert.match(html, /本人確認前は契約状態を断定しない/);
  assert.match(html, /Use only fictional customer details/);
  assert.match(html, /Evidence candidates/);
  assert.match(html, /Policy guard/);
  assert.match(html, /Fallback rehearsal/);
  assert.match(html, /No-send \/ no-save boundary/);
  assert.match(html, /External send blocked/);
  assert.match(html, /Persistent save blocked/);
  assert.match(html, /no production connection/);
  assert.match(html, /Call summary/);
  assert.match(html, /山本 花さん/);
  assert.match(html, /Next action/);
  assert.match(html, /本人確認/);
  assert.match(html, /Summary only/);
  assert.doesNotMatch(html, /Live API connected/);
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

  assert.match(html, /Conversation preview/);
  assert.match(html, /田中 美咲: 大雨の前に、テレビで道路・河川カメラや地域情報を確認する方法を知りたいです。/);
  assert.match(html, /安全・安心123チャンネル確認について受付済み/);
  assert.match(html, /上席確認ルール &gt; AIが行う引き継ぎ準備/);
});

test("renderApp marks the selected queue item from assistant evidence", () => {
  const html = renderApp();

  assert.match(html, /data-queue-call-id="CALL-CC-03"/);
  assert.match(html, /data-queue-open="CALL-CC-03"/);
  assert.match(html, /customer_ccnet_2001/);
  assert.match(html, /春日井市 \/ 戸建て/);
  assert.match(html, /unverified/);
  assert.match(html, /queue-item--selected/);
  assert.match(html, /aria-current="true"/);
  assert.match(html, /aria-pressed="true"/);
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
  assert.ok(summaryIndex > workspaceTitleIndex);
  assert.ok(threadIndex > summaryIndex);
  assert.ok(inputIndex > threadIndex);
  assert.ok(policyIndex > inputIndex);
  assert.ok(evidenceIndex > policyIndex);
  assert.match(html, /data-call-workspace-call-id="CALL-CC-03"/);
  assert.match(html, /Call workspace/);
  assert.match(html, /Review mode/);
  assert.match(html, /Phone connection/);
  assert.match(html, /not connected/);
  assert.match(html, /CCNet光10G Wi-Fi/);
  assert.match(html, /customer_ccnet_2001/);
  assert.doesNotMatch(html, /Live call connected/i);
  assert.doesNotMatch(html, /external AI generated/i);
  assert.doesNotMatch(html, /sent successfully/i);
  assert.doesNotMatch(html, /saved successfully/i);
});

test("renderApp displays the Realtime connection boundary as not configured", () => {
  const html = renderApp();
  const realtimeIndex = html.indexOf('id="realtime-boundary-title"');
  const workspaceIndex = html.indexOf('id="call-workspace-title"');
  const summaryIndex = html.indexOf('id="call-summary-title"');

  assert.ok(realtimeIndex > workspaceIndex);
  assert.ok(summaryIndex > realtimeIndex);
  assert.match(html, /Realtime boundary/);
  assert.match(html, /Realtime not configured/);
  assert.match(html, /server-minted ephemeral client secret/);
  assert.match(html, /does not request microphone permission/);
  assert.match(html, /Token contract/);
  assert.match(html, /POST \/api\/realtime\/client-secret \/ server adapter/);
  assert.match(html, /Disabled adapter/);
  assert.match(html, /not-configured \/ local fallback/);
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
