export const OPENAI_REALTIME_WEBRTC_GUIDE_URL =
  "https://platform.openai.com/docs/guides/realtime-webrtc";
export const OPENAI_REALTIME_CLIENT_SECRETS_REFERENCE_URL =
  "https://platform.openai.com/docs/api-reference/realtime-sessions/create";

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
  tokenEndpointConfigured: boolean;
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
      "Realtime browser use requires a server-minted ephemeral client secret. This demo does not request microphone permission, start a session, send audio, save audio, or connect to a production phone line.",
    tokenEndpointConfigured,
    ephemeralClientSecretRequired: true,
    ephemeralClientSecretAvailable,
    standardApiKeyAllowedInBrowser: false,
    microphonePermissionState,
    sessionStartAllowed: false,
    guardrails: defaultGuardrails,
    blockedReasons,
    requirements: buildRequirements({
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
  tokenEndpointConfigured: boolean;
  ephemeralClientSecretAvailable: boolean;
  microphonePermissionState: RealtimeMicrophonePermissionState;
}): RealtimeConnectionRequirement[] {
  return [
    {
      label: "Server token endpoint",
      detail: "Mint an ephemeral client secret server-side before browser setup.",
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
