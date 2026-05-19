import assert from "node:assert/strict";
import test from "node:test";
import {
  buildQueueSummary,
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
