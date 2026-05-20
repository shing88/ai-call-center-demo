import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildDisabledRealtimeTokenEndpointAdapter,
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

test("buildDisabledRealtimeTokenEndpointAdapter returns a deterministic not-configured fallback", () => {
  const contract = buildRealtimeTokenEndpointContract();
  const adapter = buildDisabledRealtimeTokenEndpointAdapter(contract);
  const result = adapter.handle({
    method: "POST",
    path: REALTIME_TOKEN_ENDPOINT_PATH,
    body: {
      callId: "CALL-1",
      operatorSessionId: "operator-session-1",
      reviewGateId: "review-gate-1"
    }
  });

  assert.equal(adapter.state, "disabled");
  assert.equal(result.status, "not-configured");
  assert.equal(result.contractVersion, 1);
  assert.equal(result.localEndpointPath, REALTIME_TOKEN_ENDPOINT_PATH);
  assert.equal(result.upstreamRequestAttempted, false);
  assert.equal(result.networkRequestAllowed, false);
  assert.equal(result.requestAccepted, false);
  assert.equal(result.response.statusCode, 503);
  assert.equal(result.response.body.error.code, "realtime_token_endpoint_not_configured");
  assert.equal(result.response.body.fallback.mode, "local-rehearsal");
  assert.equal(result.response.body.fallback.available, true);
  assert.equal(result.response.body.guardrails.realtimeSessionStartAllowed, false);
  assert.equal(result.response.body.guardrails.microphonePermissionAllowed, false);
  assert.equal(result.auditLog.secretValueIncluded, false);
  assert.equal(result.auditLog.headersLogged, false);
  assert.equal(result.auditLog.requestBodyLogged, false);
});

test("disabled adapter rejects browser-supplied credentials without forwarding a request", () => {
  const adapter = buildDisabledRealtimeTokenEndpointAdapter();
  const result = adapter.handle({
    method: "POST",
    path: REALTIME_TOKEN_ENDPOINT_PATH,
    headers: {
      authorization: "redacted browser credential",
      "x-openai-api-key": "redacted browser key"
    },
    body: {
      apiKey: "redacted standard key",
      clientSecret: "redacted ephemeral credential",
      env: {
        OPENAI_API_KEY: "redacted environment key"
      }
    }
  });

  assert.equal(result.status, "not-configured");
  assert.equal(result.sensitiveInputRejected, true);
  assert.equal(result.upstreamRequestAttempted, false);
  assert.equal(result.networkRequestAllowed, false);
  assert.match(result.rejectedBrowserCredentialReasons.join("\n"), /authorization header/i);
  assert.match(result.rejectedBrowserCredentialReasons.join("\n"), /browser API key/i);
  assert.match(result.rejectedBrowserCredentialReasons.join("\n"), /client secret/i);
  assert.match(result.rejectedBrowserCredentialReasons.join("\n"), /environment-sourced value/i);
  assert.doesNotMatch(JSON.stringify(result), /redacted browser credential/);
  assert.doesNotMatch(JSON.stringify(result), /redacted standard key/);
  assert.doesNotMatch(JSON.stringify(result), /redacted ephemeral credential/);
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
