import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRealtimeConnectionBoundaryOptionsFromRuntimeHealth,
  loadRealtimeRuntimeHealth
} from "../src/realtime-runtime-health.js";

test("loadRealtimeRuntimeHealth reads configured server health without secrets", async () => {
  const health = await loadRealtimeRuntimeHealth(async (url) => {
    assert.equal(url, "/api/health");

    return new Response(
      JSON.stringify({
        ok: true,
        service: "ai-call-center-demo",
        runtime: "node-server",
        realtimeTokenEndpoint: {
          path: "/api/realtime/client-secret",
          state: "configured",
          status: "ready",
          model: "gpt-realtime"
        }
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  });

  assert.equal(health?.realtimeTokenEndpoint.state, "configured");
  assert.equal(health?.realtimeTokenEndpoint.status, "ready");
  assert.doesNotMatch(JSON.stringify(health), /OPENAI_API_KEY|sk-/);
});

test("buildRealtimeConnectionBoundaryOptionsFromRuntimeHealth marks ready endpoints as configured", () => {
  const options = buildRealtimeConnectionBoundaryOptionsFromRuntimeHealth({
    ok: true,
    service: "ai-call-center-demo",
    runtime: "node-server",
    realtimeTokenEndpoint: {
      path: "/api/realtime/client-secret",
      state: "configured",
      status: "ready",
      model: "gpt-realtime"
    }
  });

  assert.equal(options.tokenEndpointConfigured, true);
});

test("loadRealtimeRuntimeHealth ignores malformed health responses", async () => {
  const health = await loadRealtimeRuntimeHealth(async () =>
    new Response(JSON.stringify({ ok: true, realtimeTokenEndpoint: {} }), {
      headers: { "Content-Type": "application/json" }
    })
  );

  assert.equal(health, undefined);
});
