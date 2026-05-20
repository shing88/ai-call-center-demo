import type { BuildRealtimeConnectionBoundaryOptions } from "./realtime-connection.js";

export const RUNTIME_HEALTH_ENDPOINT_PATH = "/api/health";

export interface RealtimeRuntimeHealth {
  ok: true;
  service: "ai-call-center-demo";
  runtime: "node-server";
  realtimeTokenEndpoint: {
    path: "/api/realtime/client-secret";
    state: "configured" | "disabled";
    status: "ready" | "not-configured";
    model: string;
  };
}

export async function loadRealtimeRuntimeHealth(
  fetchFn: typeof fetch
): Promise<RealtimeRuntimeHealth | undefined> {
  const response = await fetchFn(RUNTIME_HEALTH_ENDPOINT_PATH, {
    method: "GET",
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    return undefined;
  }

  const body: unknown = await response.json();

  return isRealtimeRuntimeHealth(body) ? body : undefined;
}

export function buildRealtimeConnectionBoundaryOptionsFromRuntimeHealth(
  health: RealtimeRuntimeHealth | undefined
): BuildRealtimeConnectionBoundaryOptions {
  return {
    tokenEndpointConfigured:
      health?.realtimeTokenEndpoint.state === "configured" &&
      health.realtimeTokenEndpoint.status === "ready"
  };
}

function isRealtimeRuntimeHealth(value: unknown): value is RealtimeRuntimeHealth {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const tokenEndpoint = candidate.realtimeTokenEndpoint;

  if (
    candidate.ok !== true ||
    candidate.service !== "ai-call-center-demo" ||
    candidate.runtime !== "node-server" ||
    !tokenEndpoint ||
    typeof tokenEndpoint !== "object" ||
    Array.isArray(tokenEndpoint)
  ) {
    return false;
  }

  const endpoint = tokenEndpoint as Record<string, unknown>;

  return (
    endpoint.path === "/api/realtime/client-secret" &&
    (endpoint.state === "configured" || endpoint.state === "disabled") &&
    (endpoint.status === "ready" || endpoint.status === "not-configured") &&
    typeof endpoint.model === "string" &&
    endpoint.model.length > 0
  );
}
