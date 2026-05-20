import { readFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, resolve, sep } from "node:path";
import {
  buildDisabledRealtimeTokenEndpointAdapter,
  REALTIME_TOKEN_ENDPOINT_PATH
} from "./realtime-token-endpoint.js";

export { REALTIME_TOKEN_ENDPOINT_PATH } from "./realtime-token-endpoint.js";

export interface DemoServerOptions {
  rootDir: string;
  host?: string;
  port?: number;
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

export function createDemoServer(options: DemoServerOptions) {
  const rootDir = resolve(options.rootDir);
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 4173;

  return createServer(async (request, response) => {
    if (containsPathTraversal(request.url ?? "/")) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const url = new URL(request.url ?? "/", `http://${host}:${port}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApiRequest(request, response, url);
      return;
    }

    await handleStaticRequest(request, response, rootDir, url);
  });
}

async function handleApiRequest(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL
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
        state: "disabled",
        status: "not-configured"
      }
    });
    return;
  }

  if (url.pathname === REALTIME_TOKEN_ENDPOINT_PATH) {
    await handleRealtimeClientSecretRequest(request, response, url);
    return;
  }

  writeJson(response, 404, { error: { code: "api_route_not_found" } });
}

async function handleRealtimeClientSecretRequest(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL
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
  const result = adapter.handle({
    method: request.method,
    path: url.pathname,
    headers: redactHeaderValues(request.headers),
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

function redactHeaderValues(
  headers: IncomingMessage["headers"]
): Record<string, string | undefined> {
  return Object.fromEntries(Object.keys(headers).map((name) => [name, undefined]));
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

function writeJson(
  response: ServerResponse,
  statusCode: number,
  body: Record<string, unknown>
): void {
  response.writeHead(statusCode, jsonHeaders);
  response.end(JSON.stringify(body));
}
