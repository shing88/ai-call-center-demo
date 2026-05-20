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
  assert.match(html, /CALL-1026/);
  assert.match(html, /business_rules\/002_refund_policy\.md/);
  assert.match(html, /返金/);
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
  assert.match(html, /山本 花さんには、返品受付について受付済みであることを伝える/);
  assert.match(html, /根拠: business_rules\/002_refund_policy\.md/);
});

test("renderApp switches the conversation draft with assistant evidence call id", () => {
  const html = renderApp({
    ...demoState,
    assistantEvidence: {
      callId: "CALL-1024",
      query: "配送予定日の確認 注文番号 A-2048 の到着予定を知りたいです。",
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

  assert.match(html, /田中 美咲さんには、配送予定日の確認について受付済みであることを伝える/);
  assert.match(html, /注文番号 A-2048/);
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
  assert.match(html, /山本 花: サイズが合わなかった商品の返送方法を確認したいです。/);
  assert.match(html, /AI draft/);
  assert.match(html, /Internal note/);
});

test("renderApp displays an unsent operator input for the selected queue item", () => {
  const html = renderApp();

  assert.match(html, /Operator note/);
  assert.match(html, /data-input-call-id="CALL-1026"/);
  assert.match(html, /Unsent demo input/);
  assert.match(html, /not sent or saved/);
  assert.doesNotMatch(html, /type="submit"/);
  assert.doesNotMatch(html, />Send</);
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
      "CALL-1026": "Please review <script>alert(1)</script> before handoff."
    }
  });

  assert.match(html, /Please review &lt;script&gt;alert\(1\)&lt;\/script&gt; before handoff\./);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
});

test("renderApp switches the conversation preview with assistant evidence call id", () => {
  const html = renderApp({
    ...demoState,
    assistantEvidence: {
      callId: "CALL-1024",
      query: "配送予定日の確認 注文番号 A-2048 の到着予定を知りたいです。",
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
  assert.match(html, /田中 美咲: 注文番号 A-2048 の到着予定を知りたいです。/);
  assert.match(html, /配送予定日の確認について受付済み/);
  assert.match(html, /上席確認ルール &gt; AIが行う引き継ぎ準備/);
});

test("renderApp marks the selected queue item from assistant evidence", () => {
  const html = renderApp();

  assert.match(html, /data-queue-call-id="CALL-1026"/);
  assert.match(html, /data-queue-open="CALL-1026"/);
  assert.match(html, /queue-item--selected/);
  assert.match(html, /aria-current="true"/);
  assert.match(html, /aria-pressed="true"/);
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
