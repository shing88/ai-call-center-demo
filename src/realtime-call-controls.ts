import { REALTIME_TOKEN_ENDPOINT_PATH } from "./realtime-token-endpoint.js";

export const OPENAI_REALTIME_WEBRTC_CALLS_ENDPOINT =
  "https://api.openai.com/v1/realtime/calls";

export type RealtimeCallStatus =
  | "idle"
  | "requesting-client-secret"
  | "requesting-microphone"
  | "connecting"
  | "connected"
  | "ended"
  | "fallback";

export type RealtimeCallMicrophonePermissionState =
  | "not-requested"
  | "prompting"
  | "granted"
  | "denied";

export type RealtimeCallFailureStage =
  | "client-secret"
  | "microphone"
  | "peer-connection"
  | "sdp-offer"
  | "realtime-calls"
  | "remote-description"
  | "unexpected";

export interface RealtimeCallFailureDiagnostics {
  stage: RealtimeCallFailureStage;
  message: string;
  httpStatus?: number;
  endpoint?: string;
}

export interface RealtimeCallControls {
  status: RealtimeCallStatus;
  statusText: string;
  detail: string;
  microphonePermissionState: RealtimeCallMicrophonePermissionState;
  startCallAvailable: boolean;
  endCallAvailable: boolean;
  tokenEndpointPath: typeof REALTIME_TOKEN_ENDPOINT_PATH;
  webRtcCallsEndpoint: typeof OPENAI_REALTIME_WEBRTC_CALLS_ENDPOINT;
  standardApiKeyAllowedInBrowser: false;
  ephemeralClientSecretRequired: true;
  fallbackRehearsalAvailable: boolean;
  lastFailure?: RealtimeCallFailureDiagnostics;
}

export interface BuildRealtimeCallControlsOptions {
  status?: RealtimeCallStatus;
  microphonePermissionState?: RealtimeCallMicrophonePermissionState;
  fallbackRehearsalAvailable?: boolean;
  lastFailure?: RealtimeCallFailureDiagnostics;
}

export interface RealtimeCallSession {
  peerConnection: RealtimePeerConnectionLike;
  dataChannel: RealtimeDataChannelLike;
  localStream: MediaStream;
}

export interface StartRealtimeCallSessionResult {
  controls: RealtimeCallControls;
  session?: RealtimeCallSession;
}

export interface RealtimePeerConnectionLike {
  addTrack(track: MediaStreamTrack, stream: MediaStream): unknown;
  createDataChannel(label: "oai-events"): RealtimeDataChannelLike;
  createOffer(): Promise<RTCSessionDescriptionInit>;
  setLocalDescription(description: RTCSessionDescriptionInit): Promise<void>;
  setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
  close(): void;
}

export interface RealtimeDataChannelLike {
  close(): void;
  addEventListener?(
    type: "message",
    listener: (event: { data: unknown }) => void
  ): void;
}

export interface StartRealtimeCallSessionDependencies {
  fetch: typeof fetch;
  getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
  createPeerConnection: () => RealtimePeerConnectionLike;
  tokenRequestBody?: unknown;
  onServerEvent?: (event: unknown) => void;
}

interface RealtimeClientSecretResponse {
  value: string;
}

interface RealtimeClientSecretRequestResult {
  value?: string;
  failure?: RealtimeCallFailureDiagnostics;
}

export function buildRealtimeCallControls(
  options: BuildRealtimeCallControlsOptions = {}
): RealtimeCallControls {
  const status = options.status ?? "idle";
  const microphonePermissionState =
    options.microphonePermissionState ?? selectDefaultMicrophoneState(status);

  return {
    status,
    statusText: selectStatusText(status),
    detail: selectStatusDetail(status),
    microphonePermissionState,
    startCallAvailable: status === "idle" || status === "ended" || status === "fallback",
    endCallAvailable:
      status === "requesting-client-secret" ||
      status === "requesting-microphone" ||
      status === "connecting" ||
      status === "connected",
    tokenEndpointPath: REALTIME_TOKEN_ENDPOINT_PATH,
    webRtcCallsEndpoint: OPENAI_REALTIME_WEBRTC_CALLS_ENDPOINT,
    standardApiKeyAllowedInBrowser: false,
    ephemeralClientSecretRequired: true,
    fallbackRehearsalAvailable: options.fallbackRehearsalAvailable ?? true,
    lastFailure: options.lastFailure
  };
}

export async function startRealtimeCallSession(
  dependencies: StartRealtimeCallSessionDependencies
): Promise<StartRealtimeCallSessionResult> {
  let localStream: MediaStream | undefined;
  let peerConnection: RealtimePeerConnectionLike | undefined;
  let dataChannel: RealtimeDataChannelLike | undefined;
  let currentStage: RealtimeCallFailureStage = "client-secret";

  try {
    const clientSecretResult = await requestEphemeralClientSecret(
      dependencies.fetch,
      dependencies.tokenRequestBody
    );

    if (!clientSecretResult.value) {
      return {
        controls: buildRealtimeCallControls({
          status: "fallback",
          microphonePermissionState: "not-requested",
          lastFailure: clientSecretResult.failure
        })
      };
    }

    currentStage = "microphone";
    localStream = await dependencies.getUserMedia({ audio: true });
    currentStage = "peer-connection";
    peerConnection = dependencies.createPeerConnection();

    for (const track of localStream.getTracks()) {
      peerConnection.addTrack(track, localStream);
    }

    dataChannel = peerConnection.createDataChannel("oai-events");
    attachRealtimeServerEventListener(dataChannel, dependencies.onServerEvent);
    currentStage = "sdp-offer";
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    currentStage = "realtime-calls";
    const sdpResponse = await dependencies.fetch(OPENAI_REALTIME_WEBRTC_CALLS_ENDPOINT, {
      method: "POST",
      body: offer.sdp ?? "",
      headers: {
        Authorization: `Bearer ${clientSecretResult.value}`,
        "Content-Type": "application/sdp"
      }
    });

    if (!sdpResponse.ok) {
      closeSessionResources({ peerConnection, dataChannel, localStream });
      return {
        controls: buildRealtimeCallControls({
          status: "fallback",
          microphonePermissionState: "granted",
          lastFailure: {
            stage: "realtime-calls",
            message: `Realtime WebRTC calls request failed with HTTP ${sdpResponse.status}.`,
            httpStatus: sdpResponse.status,
            endpoint: OPENAI_REALTIME_WEBRTC_CALLS_ENDPOINT
          }
        })
      };
    }

    currentStage = "remote-description";
    await peerConnection.setRemoteDescription({
      type: "answer",
      sdp: await sdpResponse.text()
    });

    return {
      controls: buildRealtimeCallControls({
        status: "connected",
        microphonePermissionState: "granted"
      }),
      session: {
        peerConnection,
        dataChannel,
        localStream
      }
    };
  } catch (_error) {
    closeSessionResources({ peerConnection, dataChannel, localStream });
    return {
      controls: buildRealtimeCallControls({
        status: "fallback",
        microphonePermissionState: localStream ? "granted" : "denied",
        lastFailure: buildExceptionFailureDiagnostics(currentStage, _error)
      })
    };
  }
}

export function endRealtimeCallSession(session: RealtimeCallSession): RealtimeCallControls {
  closeSessionResources(session);

  return buildRealtimeCallControls({
    status: "ended",
    microphonePermissionState: "not-requested"
  });
}

async function requestEphemeralClientSecret(
  fetchFn: typeof fetch,
  tokenRequestBody?: unknown
): Promise<RealtimeClientSecretRequestResult> {
  const response = await fetchFn(REALTIME_TOKEN_ENDPOINT_PATH, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(tokenRequestBody === undefined
        ? {}
        : { "Content-Type": "application/json" })
    },
    body:
      tokenRequestBody === undefined ? undefined : JSON.stringify(tokenRequestBody)
  });

  if (!response.ok) {
    return {
      failure: {
        stage: "client-secret",
        message: `Client secret request failed with HTTP ${response.status}.`,
        httpStatus: response.status,
        endpoint: REALTIME_TOKEN_ENDPOINT_PATH
      }
    };
  }

  const body: unknown = await response.json();

  if (!isRealtimeClientSecretResponse(body)) {
    return {
      failure: {
        stage: "client-secret",
        message: "Client secret response did not include an ephemeral value.",
        endpoint: REALTIME_TOKEN_ENDPOINT_PATH
      }
    };
  }

  return { value: body.value };
}

function buildExceptionFailureDiagnostics(
  stage: RealtimeCallFailureStage,
  error: unknown
): RealtimeCallFailureDiagnostics {
  return {
    stage,
    message: buildSafeExceptionMessage(stage, error),
    endpoint:
      stage === "client-secret"
        ? REALTIME_TOKEN_ENDPOINT_PATH
        : stage === "realtime-calls"
          ? OPENAI_REALTIME_WEBRTC_CALLS_ENDPOINT
          : undefined
  };
}

function buildSafeExceptionMessage(
  stage: RealtimeCallFailureStage,
  error: unknown
): string {
  const stageLabel = selectFailureStageLabel(stage);

  if (error instanceof DOMException) {
    return `${stageLabel} failed: ${error.name}.`;
  }

  if (error instanceof Error && error.name.length > 0) {
    return `${stageLabel} failed: ${error.name}.`;
  }

  return `${stageLabel} failed.`;
}

function selectFailureStageLabel(stage: RealtimeCallFailureStage): string {
  switch (stage) {
    case "client-secret":
      return "Client secret request";
    case "microphone":
      return "Microphone permission";
    case "peer-connection":
      return "Peer connection setup";
    case "sdp-offer":
      return "SDP offer setup";
    case "realtime-calls":
      return "Realtime WebRTC calls request";
    case "remote-description":
      return "Remote SDP answer setup";
    case "unexpected":
      return "Realtime call setup";
  }
}

function isRealtimeClientSecretResponse(
  value: unknown
): value is RealtimeClientSecretResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "value" in value &&
    typeof value.value === "string" &&
    value.value.length > 0
  );
}

function closeSessionResources(input: {
  peerConnection?: RealtimePeerConnectionLike;
  dataChannel?: RealtimeDataChannelLike;
  localStream?: MediaStream;
}): void {
  input.dataChannel?.close();

  for (const track of input.localStream?.getTracks() ?? []) {
    track.stop();
  }

  input.peerConnection?.close();
}

function attachRealtimeServerEventListener(
  dataChannel: RealtimeDataChannelLike,
  onServerEvent: ((event: unknown) => void) | undefined
): void {
  if (!onServerEvent || !dataChannel.addEventListener) {
    return;
  }

  dataChannel.addEventListener("message", (event) => {
    if (typeof event.data !== "string") {
      return;
    }

    try {
      onServerEvent(JSON.parse(event.data) as unknown);
    } catch (_error) {
      return;
    }
  });
}

function selectDefaultMicrophoneState(
  status: RealtimeCallStatus
): RealtimeCallMicrophonePermissionState {
  if (status === "requesting-microphone") {
    return "prompting";
  }

  if (status === "connected") {
    return "granted";
  }

  return "not-requested";
}

function selectStatusText(status: RealtimeCallStatus): string {
  switch (status) {
    case "idle":
      return "Ready for local Realtime setup";
    case "requesting-client-secret":
      return "Requesting client secret";
    case "requesting-microphone":
      return "Requesting microphone permission";
    case "connecting":
      return "Connecting Realtime call";
    case "connected":
      return "Realtime call connected";
    case "ended":
      return "Realtime call ended";
    case "fallback":
      return "Realtime unavailable, using fallback rehearsal";
  }
}

function selectStatusDetail(status: RealtimeCallStatus): string {
  switch (status) {
    case "idle":
      return "Start requests a server-minted ephemeral client secret before microphone or WebRTC setup.";
    case "requesting-client-secret":
      return "Waiting for the server token endpoint; standard API keys stay server-side.";
    case "requesting-microphone":
      return "The browser is asking for microphone access after receiving a client secret.";
    case "connecting":
      return "Posting the SDP offer to the OpenAI Realtime WebRTC calls endpoint.";
    case "connected":
      return "WebRTC audio is connected through the short-lived client secret.";
    case "ended":
      return "Local tracks and peer connection have been closed.";
    case "fallback":
      return "Local rehearsal remains available because Realtime setup did not complete.";
  }
}
