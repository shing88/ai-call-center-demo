export const OPENAI_REALTIME_WEBRTC_GUIDE_URL =
  "https://platform.openai.com/docs/guides/realtime-webrtc";
export const OPENAI_REALTIME_CLIENT_SECRETS_REFERENCE_URL =
  "https://developers.openai.com/api/reference/resources/realtime/subresources/client_secrets/methods/create";
export const OPENAI_REALTIME_CLIENT_SECRETS_REST_PATH =
  "/v1/realtime/client_secrets";
export const REALTIME_TOKEN_ENDPOINT_PATH = "/api/realtime/client-secret";

export type RealtimeTokenEndpointMethod = "POST";
export type RealtimeTokenEndpointImplementationState = "contract-only";

export interface RealtimeTokenEndpointContract {
  version: 1;
  implementationState: RealtimeTokenEndpointImplementationState;
  localEndpoint: {
    method: RealtimeTokenEndpointMethod;
    path: string;
    requestContentType: "application/json";
    responseContentType: "application/json";
    operatorSessionRequired: true;
    acceptsStandardApiKeyFromBrowser: false;
  };
  upstreamClientSecretRequest: {
    method: RealtimeTokenEndpointMethod;
    path: string;
    authenticatedByServerOnlyStandardKey: true;
    browserMayCallDirectly: false;
    safetyIdentifierSource: "server-derived";
  };
  requestBody: {
    purpose: "mint-ephemeral-realtime-client-secret";
    requiredFields: readonly ["callId", "operatorSessionId", "reviewGateId"];
    session: {
      type: "realtime";
      model: "gpt-realtime";
      audioInput: "disabled-in-current-demo";
      audioOutput: "disabled-in-current-demo";
      toolCalling: "disabled-in-current-demo";
    };
  };
  responseBody: {
    secretValueField: "value";
    expiresAtField: "expires_at";
    sessionField: "session";
    returnsEphemeralSecretToBrowser: true;
    persistSecretAllowed: false;
    logSecretValueAllowed: false;
  };
  enablement: {
    tokenEndpointImplemented: false;
    realtimeSessionStartAllowed: false;
    microphonePermissionAllowed: false;
    externalAudioSendAllowed: false;
    persistentSaveAllowed: false;
    productionPhoneConnectionAllowed: false;
    toolCallingAllowed: false;
  };
  officialDocs: {
    verifiedOn: string;
    webRtcGuideUrl: string;
    clientSecretsReferenceUrl: string;
  };
}

export interface BuildRealtimeTokenEndpointContractOptions {
  localEndpointPath?: string;
}

export type RealtimeTokenEndpointDisabledAdapterState = "disabled";
export type RealtimeTokenEndpointDisabledAdapterStatus = "not-configured";
export type RealtimeTokenEndpointFallbackMode = "local-rehearsal";

export interface DisabledRealtimeTokenEndpointRequest {
  method?: string;
  path?: string;
  headers?: Record<string, string | undefined>;
  body?: unknown;
}

export interface RealtimeTokenEndpointDisabledAdapterResult {
  version: 1;
  status: RealtimeTokenEndpointDisabledAdapterStatus;
  contractVersion: RealtimeTokenEndpointContract["version"];
  localEndpointPath: string;
  upstreamPath: string;
  requestAccepted: false;
  sensitiveInputRejected: boolean;
  rejectedBrowserCredentialReasons: string[];
  upstreamRequestAttempted: false;
  networkRequestAllowed: false;
  response: {
    statusCode: 503;
    body: {
      error: {
        code: "realtime_token_endpoint_not_configured";
        message: string;
      };
      fallback: {
        mode: RealtimeTokenEndpointFallbackMode;
        available: true;
        message: string;
      };
      guardrails: {
        realtimeSessionStartAllowed: false;
        microphonePermissionAllowed: false;
        externalAudioSendAllowed: false;
        persistentSaveAllowed: false;
        toolCallingAllowed: false;
      };
    };
  };
  auditLog: {
    safeSummary: string;
    secretValueIncluded: false;
    headersLogged: false;
    requestBodyLogged: false;
  };
}

export interface RealtimeTokenEndpointDisabledAdapter {
  state: RealtimeTokenEndpointDisabledAdapterState;
  contract: RealtimeTokenEndpointContract;
  handle: (
    request?: DisabledRealtimeTokenEndpointRequest
  ) => RealtimeTokenEndpointDisabledAdapterResult;
}

export function buildRealtimeTokenEndpointContract(
  options: BuildRealtimeTokenEndpointContractOptions = {}
): RealtimeTokenEndpointContract {
  return {
    version: 1,
    implementationState: "contract-only",
    localEndpoint: {
      method: "POST",
      path: options.localEndpointPath ?? REALTIME_TOKEN_ENDPOINT_PATH,
      requestContentType: "application/json",
      responseContentType: "application/json",
      operatorSessionRequired: true,
      acceptsStandardApiKeyFromBrowser: false
    },
    upstreamClientSecretRequest: {
      method: "POST",
      path: OPENAI_REALTIME_CLIENT_SECRETS_REST_PATH,
      authenticatedByServerOnlyStandardKey: true,
      browserMayCallDirectly: false,
      safetyIdentifierSource: "server-derived"
    },
    requestBody: {
      purpose: "mint-ephemeral-realtime-client-secret",
      requiredFields: ["callId", "operatorSessionId", "reviewGateId"],
      session: {
        type: "realtime",
        model: "gpt-realtime",
        audioInput: "disabled-in-current-demo",
        audioOutput: "disabled-in-current-demo",
        toolCalling: "disabled-in-current-demo"
      }
    },
    responseBody: {
      secretValueField: "value",
      expiresAtField: "expires_at",
      sessionField: "session",
      returnsEphemeralSecretToBrowser: true,
      persistSecretAllowed: false,
      logSecretValueAllowed: false
    },
    enablement: {
      tokenEndpointImplemented: false,
      realtimeSessionStartAllowed: false,
      microphonePermissionAllowed: false,
      externalAudioSendAllowed: false,
      persistentSaveAllowed: false,
      productionPhoneConnectionAllowed: false,
      toolCallingAllowed: false
    },
    officialDocs: {
      verifiedOn: "2026-05-20",
      webRtcGuideUrl: OPENAI_REALTIME_WEBRTC_GUIDE_URL,
      clientSecretsReferenceUrl: OPENAI_REALTIME_CLIENT_SECRETS_REFERENCE_URL
    }
  };
}

export function buildDisabledRealtimeTokenEndpointAdapter(
  contract: RealtimeTokenEndpointContract = buildRealtimeTokenEndpointContract()
): RealtimeTokenEndpointDisabledAdapter {
  return {
    state: "disabled",
    contract,
    handle: (request = {}) =>
      buildDisabledRealtimeTokenEndpointResult(contract, request)
  };
}

export function buildDisabledRealtimeTokenEndpointResult(
  contract: RealtimeTokenEndpointContract = buildRealtimeTokenEndpointContract(),
  request: DisabledRealtimeTokenEndpointRequest = {}
): RealtimeTokenEndpointDisabledAdapterResult {
  const rejectedBrowserCredentialReasons =
    collectRejectedBrowserCredentialReasons(request);

  return {
    version: 1,
    status: "not-configured",
    contractVersion: contract.version,
    localEndpointPath: contract.localEndpoint.path,
    upstreamPath: contract.upstreamClientSecretRequest.path,
    requestAccepted: false,
    sensitiveInputRejected: rejectedBrowserCredentialReasons.length > 0,
    rejectedBrowserCredentialReasons,
    upstreamRequestAttempted: false,
    networkRequestAllowed: false,
    response: {
      statusCode: 503,
      body: {
        error: {
          code: "realtime_token_endpoint_not_configured",
          message:
            "Realtime token endpoint adapter is disabled until server-side configuration is explicitly enabled."
        },
        fallback: {
          mode: "local-rehearsal",
          available: true,
          message:
            "Use the deterministic local rehearsal instead of starting a Realtime session."
        },
        guardrails: {
          realtimeSessionStartAllowed: false,
          microphonePermissionAllowed: false,
          externalAudioSendAllowed: false,
          persistentSaveAllowed: false,
          toolCallingAllowed: false
        }
      }
    },
    auditLog: {
      safeSummary:
        "disabled Realtime token adapter returned a local fallback without forwarding credentials or request details",
      secretValueIncluded: false,
      headersLogged: false,
      requestBodyLogged: false
    }
  };
}

function collectRejectedBrowserCredentialReasons(
  request: DisabledRealtimeTokenEndpointRequest
): string[] {
  return uniqueStrings([
    ...collectRejectedHeaderReasons(request.headers),
    ...collectRejectedBodyReasons(request.body)
  ]);
}

function collectRejectedHeaderReasons(
  headers: DisabledRealtimeTokenEndpointRequest["headers"]
): string[] {
  if (!headers) {
    return [];
  }

  return Object.keys(headers).flatMap((headerName) => {
    const normalized = normalizeCredentialKey(headerName);

    if (normalized === "authorization") {
      return ["authorization header rejected."];
    }

    if (normalized.includes("openai") && normalized.includes("apikey")) {
      return ["browser API key header rejected."];
    }

    if (normalized.includes("bearer")) {
      return ["browser bearer credential header rejected."];
    }

    return [];
  });
}

function collectRejectedBodyReasons(value: unknown): string[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectRejectedBodyReasons(item));
  }

  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, nestedValue]) => {
      const normalized = normalizeCredentialKey(key);
      const reasons: string[] = [];

      if (normalized === "authorization") {
        reasons.push("authorization field rejected.");
      }

      if (normalized.includes("apikey")) {
        reasons.push("browser API key field rejected.");
      }

      if (normalized.includes("clientsecret")) {
        reasons.push("client secret field rejected.");
      }

      if (
        normalized === "env" ||
        normalized.includes("environment") ||
        normalized.includes("openaiapikey")
      ) {
        reasons.push("environment-sourced value rejected.");
      }

      if (normalized.includes("bearer")) {
        reasons.push("browser bearer credential field rejected.");
      }

      return [...reasons, ...collectRejectedBodyReasons(nestedValue)];
    }
  );
}

function normalizeCredentialKey(value: string): string {
  return value.replaceAll(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}
