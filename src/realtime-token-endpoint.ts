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
