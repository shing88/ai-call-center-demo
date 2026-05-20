import {
  buildDisabledRealtimeTokenEndpointResult,
  buildRealtimeTokenEndpointContract,
  OPENAI_REALTIME_CLIENT_SECRETS_REFERENCE_URL,
  OPENAI_REALTIME_WEBRTC_GUIDE_URL,
  type RealtimeTokenEndpointDisabledAdapterResult,
  type RealtimeTokenEndpointContract
} from "./realtime-token-endpoint.js";

export {
  OPENAI_REALTIME_CLIENT_SECRETS_REFERENCE_URL,
  OPENAI_REALTIME_WEBRTC_GUIDE_URL
} from "./realtime-token-endpoint.js";

export type RealtimeConnectionStatus =
  | "not-configured"
  | "setup-incomplete"
  | "review-gated";

export type RealtimeMicrophonePermissionState =
  | "not-requested"
  | "granted"
  | "denied";

export interface RealtimeConnectionGuardrails {
  browserApiKeyAllowed: false;
  microphoneCaptureAllowed: false;
  externalAudioSendAllowed: false;
  persistentSaveAllowed: false;
  productionPhoneConnectionAllowed: false;
  toolCallingAllowed: false;
}

export interface RealtimeConnectionRequirement {
  label: string;
  detail: string;
  satisfied: boolean;
}

export interface RealtimeConnectionBoundary {
  status: RealtimeConnectionStatus;
  statusText: string;
  operatorMessage: string;
  tokenEndpointContract: RealtimeTokenEndpointContract;
  tokenEndpointAdapter: RealtimeTokenEndpointDisabledAdapterResult;
  tokenEndpointConfigured: boolean;
  localFallbackAvailable: boolean;
  ephemeralClientSecretRequired: true;
  ephemeralClientSecretAvailable: boolean;
  standardApiKeyAllowedInBrowser: false;
  microphonePermissionState: RealtimeMicrophonePermissionState;
  sessionStartAllowed: false;
  guardrails: RealtimeConnectionGuardrails;
  blockedReasons: string[];
  requirements: RealtimeConnectionRequirement[];
  officialDocs: {
    verifiedOn: string;
    webRtcGuideUrl: string;
    clientSecretsReferenceUrl: string;
  };
}

export interface BuildRealtimeConnectionBoundaryOptions {
  tokenEndpointContract?: RealtimeTokenEndpointContract;
  tokenEndpointAdapter?: RealtimeTokenEndpointDisabledAdapterResult;
  tokenEndpointConfigured?: boolean;
  ephemeralClientSecretAvailable?: boolean;
  microphonePermissionState?: RealtimeMicrophonePermissionState;
}

const defaultGuardrails: RealtimeConnectionGuardrails = {
  browserApiKeyAllowed: false,
  microphoneCaptureAllowed: false,
  externalAudioSendAllowed: false,
  persistentSaveAllowed: false,
  productionPhoneConnectionAllowed: false,
  toolCallingAllowed: false
};

export function buildRealtimeConnectionBoundary(
  options: BuildRealtimeConnectionBoundaryOptions = {}
): RealtimeConnectionBoundary {
  const tokenEndpointContract =
    options.tokenEndpointContract ?? buildRealtimeTokenEndpointContract();
  const tokenEndpointAdapter =
    options.tokenEndpointAdapter ??
    buildDisabledRealtimeTokenEndpointResult(tokenEndpointContract);
  const tokenEndpointConfigured = options.tokenEndpointConfigured ?? false;
  const ephemeralClientSecretAvailable = options.ephemeralClientSecretAvailable ?? false;
  const microphonePermissionState =
    options.microphonePermissionState ?? "not-requested";
  const status = selectRealtimeStatus({
    tokenEndpointConfigured,
    ephemeralClientSecretAvailable,
    microphonePermissionState
  });
  const blockedReasons = buildBlockedReasons({
    tokenEndpointConfigured,
    ephemeralClientSecretAvailable,
    microphonePermissionState
  });

  return {
    status,
    statusText:
      status === "not-configured"
        ? "Realtime not configured"
        : "Realtime setup captured, session start disabled",
    operatorMessage:
      "Realtime browser use requires a server-minted ephemeral client secret. The disabled adapter returns a local fallback and does not request microphone permission, start a session, send audio, save audio, or connect to a production phone line.",
    tokenEndpointContract,
    tokenEndpointAdapter,
    tokenEndpointConfigured,
    localFallbackAvailable: tokenEndpointAdapter.response.body.fallback.available,
    ephemeralClientSecretRequired: true,
    ephemeralClientSecretAvailable,
    standardApiKeyAllowedInBrowser: false,
    microphonePermissionState,
    sessionStartAllowed: false,
    guardrails: defaultGuardrails,
    blockedReasons,
    requirements: buildRequirements({
      tokenEndpointContract,
      tokenEndpointConfigured,
      ephemeralClientSecretAvailable,
      microphonePermissionState
    }),
    officialDocs: {
      verifiedOn: "2026-05-20",
      webRtcGuideUrl: OPENAI_REALTIME_WEBRTC_GUIDE_URL,
      clientSecretsReferenceUrl: OPENAI_REALTIME_CLIENT_SECRETS_REFERENCE_URL
    }
  };
}

function selectRealtimeStatus(input: {
  tokenEndpointConfigured: boolean;
  ephemeralClientSecretAvailable: boolean;
  microphonePermissionState: RealtimeMicrophonePermissionState;
}): RealtimeConnectionStatus {
  if (
    !input.tokenEndpointConfigured &&
    !input.ephemeralClientSecretAvailable &&
    input.microphonePermissionState === "not-requested"
  ) {
    return "not-configured";
  }

  if (
    input.tokenEndpointConfigured &&
    input.ephemeralClientSecretAvailable &&
    input.microphonePermissionState === "granted"
  ) {
    return "review-gated";
  }

  return "setup-incomplete";
}

function buildBlockedReasons(input: {
  tokenEndpointConfigured: boolean;
  ephemeralClientSecretAvailable: boolean;
  microphonePermissionState: RealtimeMicrophonePermissionState;
}): string[] {
  const reasons: string[] = [];

  if (!input.tokenEndpointConfigured) {
    reasons.push("Server token endpoint is not configured.");
  }

  reasons.push("Server token endpoint adapter is disabled.");

  if (!input.ephemeralClientSecretAvailable) {
    reasons.push("Ephemeral client secret is not available.");
  }

  if (input.microphonePermissionState === "not-requested") {
    reasons.push("Microphone permission has not been requested.");
  }

  if (input.microphonePermissionState === "denied") {
    reasons.push("Microphone permission is denied.");
  }

  reasons.push("Current demo mode keeps Realtime session start disabled.");

  return reasons;
}

function buildRequirements(input: {
  tokenEndpointContract: RealtimeTokenEndpointContract;
  tokenEndpointConfigured: boolean;
  ephemeralClientSecretAvailable: boolean;
  microphonePermissionState: RealtimeMicrophonePermissionState;
}): RealtimeConnectionRequirement[] {
  return [
    {
      label: "Token endpoint contract",
      detail: `${input.tokenEndpointContract.localEndpoint.method} ${input.tokenEndpointContract.localEndpoint.path} is documented as contract-only; implementation still disabled.`,
      satisfied: true
    },
    {
      label: "Server token endpoint implementation",
      detail:
        "Mint an ephemeral client secret server-side before browser setup without accepting a browser API key.",
      satisfied: input.tokenEndpointConfigured
    },
    {
      label: "Ephemeral client secret",
      detail: "Use a short-lived client secret for browser Realtime sessions.",
      satisfied: input.ephemeralClientSecretAvailable
    },
    {
      label: "Browser API key policy",
      detail: "Never embed standard API keys in the browser bundle.",
      satisfied: true
    },
    {
      label: "Microphone permission",
      detail: "Request microphone permission only after the review gate is opened.",
      satisfied: input.microphonePermissionState === "granted"
    },
    {
      label: "Local fallback",
      detail: "Keep deterministic fallback rehearsal available when Realtime is unavailable.",
      satisfied: true
    }
  ];
}
