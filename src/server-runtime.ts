import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { basename, dirname, extname, resolve, sep } from "node:path";
import {
  buildDisabledRealtimeTokenEndpointAdapter,
  buildDisabledRealtimeTokenEndpointResult,
  OPENAI_REALTIME_CLIENT_SECRETS_REST_PATH,
  REALTIME_TOKEN_ENDPOINT_PATH
} from "./realtime-token-endpoint.js";
import {
  isRealtimeCallHandoffRecord,
  REALTIME_HANDOFFS_ENDPOINT_PATH,
  type RealtimeCallHandoffRecord
} from "./realtime-call-recording.js";
import {
  OPENAI_REALTIME_WEBRTC_CALLS_ENDPOINT,
  REALTIME_WEBRTC_CALLS_ENDPOINT_PATH
} from "./realtime-calls-endpoint.js";

export { REALTIME_TOKEN_ENDPOINT_PATH } from "./realtime-token-endpoint.js";

export interface DemoServerOptions {
  rootDir: string;
  host?: string;
  port?: number;
  openAiApiKey?: string;
  realtimeModel?: string;
  fetch?: typeof fetch;
  handoffStorePath?: string;
}

interface RuntimeConfig {
  openAiApiKey?: string;
  realtimeModel: string;
  fetch: typeof fetch;
  handoffStorePath: string;
}

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"]
]);

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const apiBaseUrl = "https://api.openai.com";
const clientSecretTtlSeconds = 600;
const defaultRealtimeModel = "gpt-realtime";
const serverOnlyStaticFiles = new Set(["server-runtime.js"]);
const maxStoredHandoffs = 100;

export function createDemoServer(options: DemoServerOptions) {
  const rootDir = resolve(options.rootDir);
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 4173;
  const runtime = buildRuntimeConfig(options);

  return createServer(async (request, response) => {
    if (containsPathTraversal(request.url ?? "/")) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const url = new URL(request.url ?? "/", `http://${host}:${port}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApiRequest(request, response, url, runtime);
      return;
    }

    await handleStaticRequest(request, response, rootDir, url);
  });
}

async function handleApiRequest(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
  runtime: RuntimeConfig
): Promise<void> {
  if (url.pathname === "/api/health") {
    if (request.method !== "GET" && request.method !== "HEAD") {
      writeJson(response, 405, { error: { code: "method_not_allowed" } });
      return;
    }

    writeJson(response, 200, {
      ok: true,
      service: "ai-call-center-demo",
      runtime: "node-server",
      realtimeTokenEndpoint: {
        path: REALTIME_TOKEN_ENDPOINT_PATH,
        state: runtime.openAiApiKey ? "configured" : "disabled",
        status: runtime.openAiApiKey ? "ready" : "not-configured",
        model: runtime.realtimeModel
      }
    });
    return;
  }

  if (url.pathname === REALTIME_TOKEN_ENDPOINT_PATH) {
    await handleRealtimeClientSecretRequest(request, response, url, runtime);
    return;
  }

  if (url.pathname === REALTIME_WEBRTC_CALLS_ENDPOINT_PATH) {
    await handleRealtimeCallsRequest(request, response, runtime);
    return;
  }

  if (url.pathname === REALTIME_HANDOFFS_ENDPOINT_PATH) {
    await handleRealtimeHandoffsRequest(request, response, url, runtime);
    return;
  }

  writeJson(response, 404, { error: { code: "api_route_not_found" } });
}

async function handleRealtimeCallsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  runtime: RuntimeConfig
): Promise<void> {
  if (request.method !== "POST") {
    writeJson(response, 405, {
      error: { code: "method_not_allowed" },
      fallback: { mode: "local-rehearsal", available: true }
    });
    return;
  }

  const parsedBody = await readJsonRequestBody(request);

  if (!parsedBody.ok) {
    writeJson(response, parsedBody.statusCode, parsedBody.body);
    return;
  }

  const callsRequest = parseRealtimeCallsRequest(parsedBody.body);

  if (!callsRequest) {
    writeJson(response, 400, {
      status: "rejected",
      requestAccepted: false,
      upstreamRequestAttempted: false,
      networkRequestAllowed: false,
      error: {
        code: "invalid_realtime_calls_request",
        message: "Realtime calls requests must include a non-empty SDP offer."
      },
      fallback: { mode: "local-rehearsal", available: true }
    });
    return;
  }

  if (!runtime.openAiApiKey) {
    writeJson(response, 503, {
      status: "not-configured",
      requestAccepted: false,
      upstreamRequestAttempted: false,
      networkRequestAllowed: false,
      error: {
        code: "realtime_calls_endpoint_not_configured",
        message:
          "Realtime calls endpoint adapter is disabled until server-side configuration is explicitly enabled."
      },
      fallback: { mode: "local-rehearsal", available: true }
    });
    return;
  }

  if (
    containsBrowserCredentialHeaders(request.headers) ||
    containsCredentialLikeValue(callsRequest.sessionContext)
  ) {
    writeJson(response, 400, {
      status: "rejected",
      requestAccepted: false,
      upstreamRequestAttempted: false,
      networkRequestAllowed: false,
      error: {
        code: "browser_credentials_rejected",
        message:
          "Browser-supplied OpenAI credentials are not accepted by the Realtime calls endpoint."
      },
      fallback: { mode: "local-rehearsal", available: true }
    });
    return;
  }

  const upstream = await createRealtimeCall(
    { ...runtime, openAiApiKey: runtime.openAiApiKey },
    callsRequest
  );

  if (!upstream.ok) {
    writeJson(response, upstream.statusCode, upstream.body);
    return;
  }

  response.writeHead(200, {
    "Content-Type": "application/sdp",
    "Cache-Control": "no-store"
  });
  response.end(upstream.sdp);
}

async function handleRealtimeHandoffsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
  runtime: RuntimeConfig
): Promise<void> {
  if (request.method === "GET" || request.method === "HEAD") {
    const records = filterHandoffsByCallId(
      await readHandoffRecords(runtime.handoffStorePath),
      url.searchParams.get("callId")
    );

    writeJson(response, 200, {
      status: "ready",
      storage: { mode: "local-json" },
      records: request.method === "HEAD" ? [] : records
    });
    return;
  }

  if (request.method !== "POST") {
    writeJson(response, 405, { error: { code: "method_not_allowed" } });
    return;
  }

  const parsedBody = await readJsonRequestBody(request);

  if (!parsedBody.ok) {
    writeJson(response, parsedBody.statusCode, parsedBody.body);
    return;
  }

  if (
    !isRealtimeCallHandoffRecord(parsedBody.body) ||
    containsCredentialLikeValue(parsedBody.body)
  ) {
    writeJson(response, 400, {
      status: "rejected",
      error: {
        code: "handoff_record_rejected",
        message:
          "Realtime handoff records must match the local persistence contract and must not contain credential-like values."
      }
    });
    return;
  }

  const records = await readHandoffRecords(runtime.handoffStorePath);
  const nextRecords = [...records, parsedBody.body].slice(-maxStoredHandoffs);
  await writeHandoffRecords(runtime.handoffStorePath, nextRecords);

  writeJson(response, 201, {
    status: "stored",
    storage: { mode: "local-json" },
    record: parsedBody.body
  });
}

async function handleRealtimeClientSecretRequest(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
  runtime: RuntimeConfig
): Promise<void> {
  if (request.method !== "POST") {
    writeJson(response, 405, {
      error: { code: "method_not_allowed" },
      fallback: { mode: "local-rehearsal", available: true }
    });
    return;
  }

  const parsedBody = await readJsonRequestBody(request);

  if (!parsedBody.ok) {
    writeJson(response, parsedBody.statusCode, parsedBody.body);
    return;
  }

  const adapter = buildDisabledRealtimeTokenEndpointAdapter();
  const redactedHeaders = redactHeaderValues(request.headers);

  if (!runtime.openAiApiKey) {
    const result = adapter.handle({
      method: request.method,
      path: url.pathname,
      headers: redactedHeaders,
      body: parsedBody.body
    });

    writeJson(response, result.response.statusCode, {
      status: result.status,
      contractVersion: result.contractVersion,
      endpoint: result.localEndpointPath,
      requestAccepted: result.requestAccepted,
      sensitiveInputRejected: result.sensitiveInputRejected,
      rejectedBrowserCredentialReasons: result.rejectedBrowserCredentialReasons,
      upstreamRequestAttempted: result.upstreamRequestAttempted,
      networkRequestAllowed: result.networkRequestAllowed,
      error: result.response.body.error,
      fallback: result.response.body.fallback,
      guardrails: result.response.body.guardrails
    });
    return;
  }

  const credentialCheck = buildDisabledRealtimeTokenEndpointResult(adapter.contract, {
    method: request.method,
    path: url.pathname,
    headers: redactedHeaders,
    body: parsedBody.body
  });

  if (credentialCheck.sensitiveInputRejected) {
    writeJson(response, 400, {
      status: "rejected",
      contractVersion: adapter.contract.version,
      endpoint: adapter.contract.localEndpoint.path,
      requestAccepted: false,
      sensitiveInputRejected: true,
      rejectedBrowserCredentialReasons: credentialCheck.rejectedBrowserCredentialReasons,
      upstreamRequestAttempted: false,
      networkRequestAllowed: false,
      error: {
        code: "browser_credentials_rejected",
        message:
          "Browser-supplied OpenAI credentials are not accepted by the Realtime token endpoint."
      },
      fallback: credentialCheck.response.body.fallback,
      guardrails: credentialCheck.response.body.guardrails
    });
    return;
  }

  const upstream = await createRealtimeClientSecret(
    { ...runtime, openAiApiKey: runtime.openAiApiKey },
    parsedBody.body
  );

  if (!upstream.ok) {
    writeJson(response, upstream.statusCode, upstream.body);
    return;
  }

  writeJson(response, 200, {
    status: "ready",
    contractVersion: adapter.contract.version,
    endpoint: adapter.contract.localEndpoint.path,
    requestAccepted: true,
    sensitiveInputRejected: false,
    rejectedBrowserCredentialReasons: [],
    upstreamRequestAttempted: true,
    networkRequestAllowed: true,
    value: upstream.body.value,
    expires_at: upstream.body.expires_at,
    session: upstream.body.session,
    guardrails: {
      realtimeSessionStartAllowed: false,
      microphonePermissionAllowed: false,
      externalAudioSendAllowed: false,
      persistentSaveAllowed: false,
      toolCallingAllowed: false
    }
  });
}

async function handleStaticRequest(
  request: IncomingMessage,
  response: ServerResponse,
  rootDir: string,
  url: URL
): Promise<void> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405);
    response.end("Method not allowed");
    return;
  }

  const relativePath =
    url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
  const filePath = resolve(rootDir, relativePath);

  if (serverOnlyStaticFiles.has(basename(filePath))) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  if (!isWithinRoot(rootDir, filePath)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);

    response.writeHead(200, {
      "Content-Type": contentTypes.get(extname(filePath)) ?? "application/octet-stream"
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

async function createRealtimeClientSecret(
  runtime: RuntimeConfig & { openAiApiKey: string },
  requestBody: unknown
): Promise<
  | {
      ok: true;
      body: {
        value: string;
        expires_at: number;
        session: Record<string, unknown>;
      };
    }
  | { ok: false; statusCode: number; body: Record<string, unknown> }
> {
  try {
    const upstreamResponse = await runtime.fetch(
      `${apiBaseUrl}${OPENAI_REALTIME_CLIENT_SECRETS_REST_PATH}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${runtime.openAiApiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Safety-Identifier": buildSafetyIdentifier(requestBody)
        },
        body: JSON.stringify({
          expires_after: {
            anchor: "created_at",
            seconds: clientSecretTtlSeconds
          },
          session: {
            type: "realtime",
            model: runtime.realtimeModel,
            ...buildRealtimeSessionGrounding(requestBody)
          }
        })
      }
    );

    if (!upstreamResponse.ok) {
      return buildUpstreamError(
        "upstream-error",
        "realtime_client_secret_upstream_error",
        `OpenAI Realtime client secret request failed with status ${upstreamResponse.status}.`
      );
    }

    const body = await upstreamResponse.json();

    if (!isRealtimeClientSecretResponse(body)) {
      return buildUpstreamError(
        "upstream-error",
        "invalid_upstream_realtime_client_secret",
        "OpenAI Realtime client secret response did not match the expected shape."
      );
    }

    return { ok: true, body };
  } catch {
    return buildUpstreamError(
      "network-error",
      "realtime_client_secret_network_error",
      "OpenAI Realtime client secret request could not be completed."
    );
  }
}

async function createRealtimeCall(
  runtime: RuntimeConfig & { openAiApiKey: string },
  requestBody: RealtimeCallsRequest
): Promise<
  | { ok: true; sdp: string }
  | { ok: false; statusCode: number; body: Record<string, unknown> }
> {
  const formData = new FormData();
  formData.set("sdp", requestBody.sdp);
  formData.set(
    "session",
    JSON.stringify({
      type: "realtime",
      model: runtime.realtimeModel,
      ...buildRealtimeSessionGrounding(requestBody.sessionContext)
    })
  );

  try {
    const upstreamResponse = await runtime.fetch(
      OPENAI_REALTIME_WEBRTC_CALLS_ENDPOINT,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${runtime.openAiApiKey}`,
          "OpenAI-Safety-Identifier": buildSafetyIdentifier(
            requestBody.sessionContext
          )
        },
        body: formData
      }
    );

    if (!upstreamResponse.ok) {
      return buildUpstreamError(
        "upstream-error",
        "realtime_calls_upstream_error",
        `OpenAI Realtime calls request failed with status ${upstreamResponse.status}.`
      );
    }

    const sdp = await upstreamResponse.text();

    if (sdp.trim().length === 0) {
      return buildUpstreamError(
        "upstream-error",
        "invalid_upstream_realtime_calls_sdp",
        "OpenAI Realtime calls response did not include an SDP answer."
      );
    }

    return { ok: true, sdp };
  } catch {
    return buildUpstreamError(
      "network-error",
      "realtime_calls_network_error",
      "OpenAI Realtime calls request could not be completed."
    );
  }
}

async function readJsonRequestBody(
  request: IncomingMessage
): Promise<
  | { ok: true; body: unknown }
  | { ok: false; statusCode: number; body: Record<string, unknown> }
> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();

  if (rawBody.length === 0) {
    return { ok: true, body: undefined };
  }

  try {
    return { ok: true, body: JSON.parse(rawBody) };
  } catch {
    return {
      ok: false,
      statusCode: 400,
      body: { error: { code: "invalid_json" } }
    };
  }
}

interface RealtimeCallsRequest {
  sdp: string;
  sessionContext?: unknown;
}

function parseRealtimeCallsRequest(value: unknown): RealtimeCallsRequest | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.sdp !== "string" || candidate.sdp.trim().length === 0) {
    return undefined;
  }

  return {
    sdp: candidate.sdp,
    sessionContext: candidate.sessionContext
  };
}

function buildRuntimeConfig(options: DemoServerOptions): RuntimeConfig {
  return {
    openAiApiKey: normalizeOptionalText(options.openAiApiKey),
    realtimeModel: normalizeOptionalText(options.realtimeModel) ?? defaultRealtimeModel,
    fetch: options.fetch ?? fetch,
    handoffStorePath:
      normalizeOptionalText(options.handoffStorePath) ??
      resolve(options.rootDir, "..", "data", "realtime-handoffs.json")
  };
}

async function readHandoffRecords(
  handoffStorePath: string
): Promise<RealtimeCallHandoffRecord[]> {
  try {
    const parsed: unknown = JSON.parse(await readFile(handoffStorePath, "utf8"));

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isRealtimeCallHandoffRecord);
  } catch {
    return [];
  }
}

async function writeHandoffRecords(
  handoffStorePath: string,
  records: RealtimeCallHandoffRecord[]
): Promise<void> {
  await mkdir(dirname(handoffStorePath), { recursive: true });
  await writeFile(handoffStorePath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function filterHandoffsByCallId(
  records: RealtimeCallHandoffRecord[],
  callId: string | null
): RealtimeCallHandoffRecord[] {
  const filtered =
    callId && callId.length > 0
      ? records.filter((record) => record.callId === callId)
      : records;

  return filtered.slice(-20).reverse();
}

function containsBrowserCredentialHeaders(
  headers: IncomingMessage["headers"]
): boolean {
  return Object.keys(headers).some((name) => {
    const normalized = name.toLowerCase();

    return (
      normalized === "authorization" ||
      normalized === "x-openai-api-key" ||
      normalized === "openai-api-key"
    );
  });
}

function containsCredentialLikeValue(value: unknown): boolean {
  if (value === undefined) {
    return false;
  }

  const serialized = JSON.stringify(value);

  return /(?:\bsk-[A-Za-z0-9_-]+|Bearer\s+\S+|OPENAI_API_KEY|ek_[A-Za-z0-9_-]+)/i.test(
    serialized
  );
}

function redactHeaderValues(
  headers: IncomingMessage["headers"]
): Record<string, string | undefined> {
  return Object.fromEntries(Object.keys(headers).map((name) => [name, undefined]));
}

function buildSafetyIdentifier(requestBody: unknown): string {
  const source = [
    readStringField(requestBody, "operatorSessionId"),
    readStringField(requestBody, "reviewGateId"),
    readStringField(requestBody, "callId")
  ]
    .filter(Boolean)
    .join(":");
  const stableInput = source.length > 0 ? source : "anonymous-demo-operator";

  return createHash("sha256").update(stableInput).digest("hex");
}

function buildRealtimeSessionGrounding(
  requestBody: unknown
): { instructions?: string } {
  const instructions = readNestedStringField(
    requestBody,
    "realtimeGrounding",
    "instructions"
  );

  return instructions ? { instructions } : {};
}

function readNestedStringField(
  value: unknown,
  parentKey: string,
  childKey: string
): string | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const parent = (value as Record<string, unknown>)[parentKey];

  if (!parent || typeof parent !== "object" || Array.isArray(parent)) {
    return undefined;
  }

  const child = (parent as Record<string, unknown>)[childKey];

  return typeof child === "string" && child.trim().length > 0 ? child : undefined;
}

function readStringField(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const field = (value as Record<string, unknown>)[key];

  return typeof field === "string" && field.trim().length > 0 ? field : undefined;
}

function isRealtimeClientSecretResponse(value: unknown): value is {
  value: string;
  expires_at: number;
  session: Record<string, unknown>;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.value === "string" &&
    candidate.value.length > 0 &&
    typeof candidate.expires_at === "number" &&
    candidate.session !== null &&
    typeof candidate.session === "object" &&
    !Array.isArray(candidate.session)
  );
}

function buildUpstreamError(
  status: string,
  code: string,
  message: string
): { ok: false; statusCode: 502; body: Record<string, unknown> } {
  return {
    ok: false,
    statusCode: 502,
    body: {
      status,
      requestAccepted: true,
      upstreamRequestAttempted: true,
      networkRequestAllowed: true,
      error: { code, message },
      fallback: {
        mode: "local-rehearsal",
        available: true
      }
    }
  };
}

function isWithinRoot(rootDir: string, filePath: string): boolean {
  return filePath === rootDir || filePath.startsWith(`${rootDir}${sep}`);
}

function containsPathTraversal(rawUrl: string): boolean {
  const rawPath = rawUrl.split("?")[0] ?? "/";

  try {
    return decodeURIComponent(rawPath).split("/").includes("..");
  } catch {
    return true;
  }
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function writeJson(
  response: ServerResponse,
  statusCode: number,
  body: Record<string, unknown>
): void {
  response.writeHead(statusCode, jsonHeaders);
  response.end(JSON.stringify(body));
}
