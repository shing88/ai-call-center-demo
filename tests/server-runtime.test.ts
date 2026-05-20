import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  createDemoServer,
  REALTIME_TOKEN_ENDPOINT_PATH
} from "../src/server-runtime.js";

test("server runtime exposes a deterministic health endpoint", async () => {
  const fixture = await createServerFixture();

  try {
    await withRunningServer(fixture.rootDir, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/health`);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.ok, true);
      assert.equal(body.service, "ai-call-center-demo");
      assert.equal(body.runtime, "node-server");
      assert.equal(body.realtimeTokenEndpoint.path, REALTIME_TOKEN_ENDPOINT_PATH);
      assert.equal(body.realtimeTokenEndpoint.state, "disabled");
      assert.equal(body.realtimeTokenEndpoint.status, "not-configured");
      assert.equal(body.realtimeTokenEndpoint.model, "gpt-realtime");
    });
  } finally {
    await fixture.cleanup();
  }
});

test("server runtime reports the configured Realtime token adapter without exposing the key", async () => {
  const fixture = await createServerFixture();

  try {
    await withRunningServer(
      fixture.rootDir,
      async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/health`);
        const body = await response.json();
        const serialized = JSON.stringify(body);

        assert.equal(response.status, 200);
        assert.equal(body.realtimeTokenEndpoint.state, "configured");
        assert.equal(body.realtimeTokenEndpoint.status, "ready");
        assert.equal(body.realtimeTokenEndpoint.model, "gpt-realtime-2");
        assert.doesNotMatch(serialized, /server-standard-key/);
      },
      { openAiApiKey: "server-standard-key", realtimeModel: "gpt-realtime-2" }
    );
  } finally {
    await fixture.cleanup();
  }
});

test("server runtime returns the disabled Realtime client-secret fallback", async () => {
  const fixture = await createServerFixture();

  try {
    await withRunningServer(fixture.rootDir, async (baseUrl) => {
      const response = await fetch(`${baseUrl}${REALTIME_TOKEN_ENDPOINT_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer browser-credential",
          "x-openai-api-key": "sk-browser-credential"
        },
        body: JSON.stringify({
          callId: "CALL-1",
          operatorSessionId: "operator-session-1",
          reviewGateId: "review-gate-1",
          clientSecret: "ek_browser_secret"
        })
      });
      const body = await response.json();
      const serialized = JSON.stringify(body);

      assert.equal(response.status, 503);
      assert.equal(body.status, "not-configured");
      assert.equal(body.requestAccepted, false);
      assert.equal(body.upstreamRequestAttempted, false);
      assert.equal(body.networkRequestAllowed, false);
      assert.equal(body.sensitiveInputRejected, true);
      assert.equal(body.error.code, "realtime_token_endpoint_not_configured");
      assert.equal(body.fallback.mode, "local-rehearsal");
      assert.equal(body.fallback.available, true);
      assert.equal(body.guardrails.realtimeSessionStartAllowed, false);
      assert.match(body.rejectedBrowserCredentialReasons.join("\n"), /authorization header/i);
      assert.match(body.rejectedBrowserCredentialReasons.join("\n"), /browser API key/i);
      assert.match(body.rejectedBrowserCredentialReasons.join("\n"), /client secret/i);
      assert.doesNotMatch(serialized, /browser-credential/);
      assert.doesNotMatch(serialized, /sk-browser-credential/);
      assert.doesNotMatch(serialized, /ek_browser_secret/);
    });
  } finally {
    await fixture.cleanup();
  }
});

test("server runtime mints a Realtime client secret through a server-side request", async () => {
  const fixture = await createServerFixture();
  const upstreamRequests: Array<{
    url: string;
    init: RequestInit;
    body: Record<string, unknown>;
  }> = [];

  try {
    await withRunningServer(
      fixture.rootDir,
      async (baseUrl) => {
        const response = await fetch(`${baseUrl}${REALTIME_TOKEN_ENDPOINT_PATH}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            callId: "CALL-1",
            operatorSessionId: "operator-session-1",
            reviewGateId: "review-gate-1",
            realtimeGrounding: {
              version: 1,
              instructions:
                "# Role and Objective\nUse the selected call evidence and policy guard.",
              evidenceReferences: ["knowledge/business_rules/demo.md / Demo"],
              policy: {
                outcome: "general-guidance-only",
                allowedResponseScope: "general-information-only",
                customerSpecificAnswerAllowed: false,
                humanReviewRequired: false,
                blockedResponseTypes: ["顧客別の契約状態・請求状態の断定"]
              }
            }
          })
        });
        const body = await response.json();
        const serialized = JSON.stringify(body);

        assert.equal(response.status, 200);
        assert.equal(body.status, "ready");
        assert.equal(body.requestAccepted, true);
        assert.equal(body.upstreamRequestAttempted, true);
        assert.equal(body.networkRequestAllowed, true);
        assert.equal(body.value, "ek_test_ephemeral_value");
        assert.equal(body.expires_at, 1234567890);
        assert.equal(body.session.type, "realtime");
        assert.equal(body.session.model, "gpt-realtime-2");
        assert.equal(body.guardrails.realtimeSessionStartAllowed, false);
        assert.doesNotMatch(serialized, /server-standard-key/);
      },
      {
        openAiApiKey: "server-standard-key",
        realtimeModel: "gpt-realtime-2",
        fetch: async (url, init = {}) => {
          const bodyText = String(init.body ?? "");
          const body = JSON.parse(bodyText) as Record<string, unknown>;

          upstreamRequests.push({ url: String(url), init, body });

          return new Response(
            JSON.stringify({
              value: "ek_test_ephemeral_value",
              expires_at: 1234567890,
              session: {
                type: "realtime",
                model: "gpt-realtime-2"
              }
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" }
            }
          );
        }
      }
    );

    assert.equal(upstreamRequests.length, 1);
    assert.equal(
      upstreamRequests[0]?.url,
      "https://api.openai.com/v1/realtime/client_secrets"
    );
    assert.equal(upstreamRequests[0]?.init.method, "POST");
    assert.equal(
      getHeader(upstreamRequests[0]?.init.headers, "Authorization"),
      "Bearer server-standard-key"
    );
    assert.equal(getHeader(upstreamRequests[0]?.init.headers, "Content-Type"), "application/json");
    assert.match(
      getHeader(upstreamRequests[0]?.init.headers, "OpenAI-Safety-Identifier") ?? "",
      /^sha256:[a-f0-9]{64}$/
    );
    assert.deepEqual(upstreamRequests[0]?.body, {
      expires_after: {
        anchor: "created_at",
        seconds: 600
      },
      session: {
        type: "realtime",
        model: "gpt-realtime-2",
        instructions:
          "# Role and Objective\nUse the selected call evidence and policy guard."
      }
    });
  } finally {
    await fixture.cleanup();
  }
});

test("configured Realtime client-secret endpoint rejects browser credentials before upstream fetch", async () => {
  const fixture = await createServerFixture();
  let fetchCalled = false;

  try {
    await withRunningServer(
      fixture.rootDir,
      async (baseUrl) => {
        const response = await fetch(`${baseUrl}${REALTIME_TOKEN_ENDPOINT_PATH}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer browser-credential"
          },
          body: JSON.stringify({
            callId: "CALL-1",
            operatorSessionId: "operator-session-1",
            reviewGateId: "review-gate-1",
            apiKey: "browser-standard-key"
          })
        });
        const body = await response.json();
        const serialized = JSON.stringify(body);

        assert.equal(response.status, 400);
        assert.equal(body.status, "rejected");
        assert.equal(body.requestAccepted, false);
        assert.equal(body.upstreamRequestAttempted, false);
        assert.equal(body.networkRequestAllowed, false);
        assert.equal(body.error.code, "browser_credentials_rejected");
        assert.match(body.rejectedBrowserCredentialReasons.join("\n"), /authorization header/i);
        assert.match(body.rejectedBrowserCredentialReasons.join("\n"), /browser API key/i);
        assert.doesNotMatch(serialized, /browser-credential/);
        assert.doesNotMatch(serialized, /browser-standard-key/);
      },
      {
        openAiApiKey: "server-standard-key",
        fetch: async () => {
          fetchCalled = true;
          return new Response("{}", { status: 200 });
        }
      }
    );

    assert.equal(fetchCalled, false);
  } finally {
    await fixture.cleanup();
  }
});

test("server runtime stores and reloads Realtime handoff records from local JSON", async () => {
  const fixture = await createServerFixture();
  const handoffStorePath = join(fixture.rootDir, "data", "realtime-handoffs.json");

  try {
    await withRunningServer(
      fixture.rootDir,
      async (baseUrl) => {
        const saveResponse = await fetch(`${baseUrl}/api/realtime/handoffs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sampleRealtimeHandoffRecord("CALL-LOCAL-1"))
        });
        const saveBody = await saveResponse.json();

        assert.equal(saveResponse.status, 201);
        assert.equal(saveBody.status, "stored");
        assert.equal(saveBody.storage.mode, "local-json");
        assert.equal(saveBody.record.callId, "CALL-LOCAL-1");
        assert.equal(saveBody.record.transcript[0].text, "Please verify identity first.");
        assert.equal(saveBody.record.guardrails.externalSendAllowed, false);
      },
      { handoffStorePath }
    );

    await withRunningServer(
      fixture.rootDir,
      async (baseUrl) => {
        const loadResponse = await fetch(
          `${baseUrl}/api/realtime/handoffs?callId=CALL-LOCAL-1`
        );
        const loadBody = await loadResponse.json();

        assert.equal(loadResponse.status, 200);
        assert.equal(loadBody.status, "ready");
        assert.equal(loadBody.storage.mode, "local-json");
        assert.equal(loadBody.records.length, 1);
        assert.equal(loadBody.records[0].callId, "CALL-LOCAL-1");
        assert.equal(loadBody.records[0].nextAction, "Verify identity before account-specific guidance.");
        assert.doesNotMatch(JSON.stringify(loadBody), /server-standard-key|sk-|Bearer/);
      },
      { handoffStorePath }
    );
  } finally {
    await fixture.cleanup();
  }
});

test("server runtime rejects Realtime handoff records that contain credential-like values", async () => {
  const fixture = await createServerFixture();

  try {
    await withRunningServer(fixture.rootDir, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/realtime/handoffs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sampleRealtimeHandoffRecord("CALL-SECRET"),
          transcript: [
            {
              role: "assistant",
              text: "Use sk-browser-secret in the next request.",
              sourceEventType: "response.output_audio_transcript.done",
              final: true
            }
          ]
        })
      });
      const body = await response.json();
      const serialized = JSON.stringify(body);

      assert.equal(response.status, 400);
      assert.equal(body.status, "rejected");
      assert.equal(body.error.code, "handoff_record_rejected");
      assert.doesNotMatch(serialized, /sk-browser-secret/);
    });
  } finally {
    await fixture.cleanup();
  }
});

test("server runtime keeps static app serving and blocks path traversal", async () => {
  const fixture = await createServerFixture();

  try {
    await withRunningServer(fixture.rootDir, async (baseUrl) => {
      const indexResponse = await fetch(`${baseUrl}/`);
      const scriptResponse = await fetch(`${baseUrl}/assets/main.js`);
      const serverRuntimeResponse = await fetch(`${baseUrl}/assets/server-runtime.js`);
      const traversalStatus = await requestRawStatus(baseUrl, "/%2e%2e/package.json");

      assert.equal(indexResponse.status, 200);
      assert.match(await indexResponse.text(), /AI Call Center Demo/);
      assert.equal(scriptResponse.status, 200);
      assert.equal(scriptResponse.headers.get("content-type"), "text/javascript; charset=utf-8");
      assert.equal(await scriptResponse.text(), "export {};\n");
      assert.equal(serverRuntimeResponse.status, 404);
      assert.equal(traversalStatus, 403);
    });
  } finally {
    await fixture.cleanup();
  }
});

async function createServerFixture(): Promise<{
  rootDir: string;
  cleanup: () => Promise<void>;
}> {
  const rootDir = await mkdtemp(join(tmpdir(), "ai-call-center-demo-server-"));

  await writeFile(
    join(rootDir, "index.html"),
    "<!doctype html><title>AI Call Center Demo</title>",
    "utf8"
  );
  await writeFile(join(rootDir, "styles.css"), "body { margin: 0; }\n", "utf8");
  await writeFile(join(rootDir, "assets-main-placeholder"), "", "utf8");
  await writeFile(join(rootDir, "package.json"), "{\"private\":true}\n", "utf8");
  await mkdir(join(rootDir, "assets"), { recursive: true });
  await writeFile(join(rootDir, "assets", "main.js"), "export {};\n", "utf8");
  await writeFile(join(rootDir, "assets", "server-runtime.js"), "export {};\n", "utf8");

  return {
    rootDir,
    cleanup: () => rm(rootDir, { recursive: true, force: true })
  };
}

async function requestRawStatus(baseUrl: string, path: string): Promise<number> {
  const url = new URL(baseUrl);

  return await new Promise((resolve, reject) => {
    const request = httpRequest(
      {
        hostname: url.hostname,
        port: url.port,
        path,
        method: "GET"
      },
      (response) => {
        response.resume();
        response.on("end", () => resolve(response.statusCode ?? 0));
      }
    );

    request.on("error", reject);
    request.end();
  });
}

async function withRunningServer(
  rootDir: string,
  run: (baseUrl: string) => Promise<void>,
  options: {
    openAiApiKey?: string;
    realtimeModel?: string;
    fetch?: typeof fetch;
    handoffStorePath?: string;
  } = {}
): Promise<void> {
  const server = createDemoServer({
    rootDir,
    host: "127.0.0.1",
    port: 0,
    openAiApiKey: options.openAiApiKey,
    realtimeModel: options.realtimeModel,
    fetch: options.fetch,
    handoffStorePath: options.handoffStorePath
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

  const address = server.address();
  assert.notEqual(address, null);
  assert.notEqual(typeof address, "string");

  if (address === null || typeof address === "string") {
    throw new Error("Expected TCP server address.");
  }

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function sampleRealtimeHandoffRecord(callId: string): Record<string, unknown> {
  return {
    version: 1,
    callId,
    status: "recorded",
    transcript: [
      {
        role: "assistant",
        text: "Please verify identity first.",
        sourceEventType: "response.output_audio_transcript.done",
        final: true
      }
    ],
    summary: "Customer asks for account-specific guidance.",
    evidenceReferences: ["business_rules/demo.md / Demo"],
    policyDecision: {
      outcome: "customer-specific-answer-blocked",
      allowedResponseScope: "general-information-only",
      customerSpecificAnswerAllowed: false,
      humanReviewRequired: false,
      blockedResponseTypes: ["account-specific contract change"]
    },
    nextAction: "Verify identity before account-specific guidance.",
    guardrails: {
      browserOnly: true,
      persistentSaveAllowed: false,
      externalSendAllowed: false,
      productionPhoneConnectionAllowed: false
    }
  };
}

function getHeader(headers: RequestInit["headers"], name: string): string | null {
  if (!headers) {
    return null;
  }

  return new Headers(headers).get(name);
}
