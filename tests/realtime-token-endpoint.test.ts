import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildRealtimeTokenEndpointContract,
  OPENAI_REALTIME_CLIENT_SECRETS_REFERENCE_URL,
  OPENAI_REALTIME_CLIENT_SECRETS_REST_PATH,
  OPENAI_REALTIME_WEBRTC_GUIDE_URL,
  REALTIME_TOKEN_ENDPOINT_PATH
} from "../src/realtime-token-endpoint.js";

test("buildRealtimeTokenEndpointContract defines a server-only client secret contract", () => {
  const contract = buildRealtimeTokenEndpointContract();

  assert.equal(contract.version, 1);
  assert.equal(contract.implementationState, "contract-only");
  assert.equal(contract.localEndpoint.method, "POST");
  assert.equal(contract.localEndpoint.path, REALTIME_TOKEN_ENDPOINT_PATH);
  assert.equal(contract.localEndpoint.acceptsStandardApiKeyFromBrowser, false);
  assert.equal(contract.localEndpoint.operatorSessionRequired, true);
  assert.equal(contract.upstreamClientSecretRequest.path, OPENAI_REALTIME_CLIENT_SECRETS_REST_PATH);
  assert.equal(contract.upstreamClientSecretRequest.authenticatedByServerOnlyStandardKey, true);
  assert.equal(contract.upstreamClientSecretRequest.browserMayCallDirectly, false);
  assert.equal(contract.upstreamClientSecretRequest.safetyIdentifierSource, "server-derived");
  assert.deepEqual(contract.requestBody.requiredFields, [
    "callId",
    "operatorSessionId",
    "reviewGateId"
  ]);
  assert.equal(contract.requestBody.session.type, "realtime");
  assert.equal(contract.requestBody.session.model, "gpt-realtime");
  assert.equal(contract.responseBody.secretValueField, "value");
  assert.equal(contract.responseBody.expiresAtField, "expires_at");
  assert.equal(contract.responseBody.persistSecretAllowed, false);
  assert.equal(contract.responseBody.logSecretValueAllowed, false);
  assert.equal(contract.officialDocs.webRtcGuideUrl, OPENAI_REALTIME_WEBRTC_GUIDE_URL);
  assert.equal(
    contract.officialDocs.clientSecretsReferenceUrl,
    OPENAI_REALTIME_CLIENT_SECRETS_REFERENCE_URL
  );
});

test("buildRealtimeTokenEndpointContract keeps every Realtime enablement gate disabled", () => {
  const contract = buildRealtimeTokenEndpointContract();

  assert.deepEqual(contract.enablement, {
    tokenEndpointImplemented: false,
    realtimeSessionStartAllowed: false,
    microphonePermissionAllowed: false,
    externalAudioSendAllowed: false,
    persistentSaveAllowed: false,
    productionPhoneConnectionAllowed: false,
    toolCallingAllowed: false
  });
});

test("compiled browser-facing Realtime token contract contains no concrete secrets", () => {
  const moduleText = readFileSync(
    new URL("../src/realtime-token-endpoint.js", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(moduleText, /OPENAI_API_KEY/);
  assert.doesNotMatch(moduleText, /process\.env/);
  assert.doesNotMatch(moduleText, /import\.meta\.env/);
  assert.doesNotMatch(moduleText, /\.env/);
  assert.doesNotMatch(moduleText, /sk-(proj-)?[A-Za-z0-9_-]{8,}/);
  assert.doesNotMatch(moduleText, /ek_[A-Za-z0-9_-]{8,}/);
  assert.doesNotMatch(moduleText, /Bearer\s+[A-Za-z0-9_-]/);
});
