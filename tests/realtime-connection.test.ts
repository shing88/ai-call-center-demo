import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRealtimeConnectionBoundary,
  OPENAI_REALTIME_CLIENT_SECRETS_REFERENCE_URL,
  OPENAI_REALTIME_WEBRTC_GUIDE_URL
} from "../src/realtime-connection.js";
import { REALTIME_TOKEN_ENDPOINT_PATH } from "../src/realtime-token-endpoint.js";

test("buildRealtimeConnectionBoundary defaults to a not-configured browser-safe state", () => {
  const boundary = buildRealtimeConnectionBoundary();

  assert.equal(boundary.status, "not-configured");
  assert.equal(boundary.statusText, "Realtime not configured");
  assert.equal(boundary.sessionStartAllowed, false);
  assert.equal(boundary.standardApiKeyAllowedInBrowser, false);
  assert.equal(boundary.ephemeralClientSecretRequired, true);
  assert.equal(boundary.tokenEndpointContract.implementationState, "server-adapter");
  assert.equal(boundary.tokenEndpointContract.localEndpoint.path, REALTIME_TOKEN_ENDPOINT_PATH);
  assert.equal(boundary.tokenEndpointContract.localEndpoint.acceptsStandardApiKeyFromBrowser, false);
  assert.equal(boundary.tokenEndpointConfigured, false);
  assert.equal(boundary.tokenEndpointAdapter.status, "not-configured");
  assert.equal(boundary.tokenEndpointAdapter.response.body.fallback.available, true);
  assert.equal(boundary.localFallbackAvailable, true);
  assert.equal(boundary.microphonePermissionState, "not-requested");
  assert.deepEqual(boundary.guardrails, {
    browserApiKeyAllowed: false,
    microphoneCaptureAllowed: false,
    externalAudioSendAllowed: false,
    persistentSaveAllowed: false,
    productionPhoneConnectionAllowed: false,
    toolCallingAllowed: false
  });
  assert.match(boundary.operatorMessage, /server-minted ephemeral client secret/);
  assert.match(boundary.operatorMessage, /does not request microphone permission/);
  assert.ok(boundary.blockedReasons.includes("Server token endpoint is not configured."));
  assert.ok(boundary.blockedReasons.includes("Microphone permission has not been requested."));
  assert.equal(boundary.requirements[0]?.label, "Token endpoint contract");
  assert.equal(boundary.requirements[0]?.satisfied, true);
  assert.equal(boundary.requirements[1]?.label, "Server token endpoint implementation");
  assert.equal(boundary.requirements[1]?.satisfied, true);
  assert.equal(boundary.requirements[2]?.label, "Server token endpoint configuration");
  assert.equal(boundary.requirements[2]?.satisfied, false);
  assert.equal(boundary.officialDocs.webRtcGuideUrl, OPENAI_REALTIME_WEBRTC_GUIDE_URL);
  assert.equal(
    boundary.officialDocs.clientSecretsReferenceUrl,
    OPENAI_REALTIME_CLIENT_SECRETS_REFERENCE_URL
  );
});

test("buildRealtimeConnectionBoundary keeps the review gate closed even when setup inputs are present", () => {
  const boundary = buildRealtimeConnectionBoundary({
    tokenEndpointConfigured: true,
    ephemeralClientSecretAvailable: true,
    microphonePermissionState: "granted"
  });

  assert.equal(boundary.status, "review-gated");
  assert.equal(boundary.sessionStartAllowed, false);
  assert.equal(boundary.tokenEndpointConfigured, true);
  assert.equal(boundary.tokenEndpointAdapter.status, "not-configured");
  assert.equal(boundary.ephemeralClientSecretAvailable, true);
  assert.equal(boundary.microphonePermissionState, "granted");
  assert.ok(boundary.blockedReasons.includes("Current demo mode keeps Realtime session start disabled."));
  assert.equal(boundary.guardrails.externalAudioSendAllowed, false);
  assert.equal(boundary.guardrails.productionPhoneConnectionAllowed, false);
});
