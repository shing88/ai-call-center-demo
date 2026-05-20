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
    });
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

test("server runtime keeps static app serving and blocks path traversal", async () => {
  const fixture = await createServerFixture();

  try {
    await withRunningServer(fixture.rootDir, async (baseUrl) => {
      const indexResponse = await fetch(`${baseUrl}/`);
      const scriptResponse = await fetch(`${baseUrl}/assets/main.js`);
      const traversalStatus = await requestRawStatus(baseUrl, "/%2e%2e/package.json");

      assert.equal(indexResponse.status, 200);
      assert.match(await indexResponse.text(), /AI Call Center Demo/);
      assert.equal(scriptResponse.status, 200);
      assert.equal(scriptResponse.headers.get("content-type"), "text/javascript; charset=utf-8");
      assert.equal(await scriptResponse.text(), "export {};\n");
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
  run: (baseUrl: string) => Promise<void>
): Promise<void> {
  const server = createDemoServer({ rootDir, host: "127.0.0.1", port: 0 });

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
