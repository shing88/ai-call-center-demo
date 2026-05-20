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
}

export interface BuildRealtimeCallControlsOptions {
  status?: RealtimeCallStatus;
  microphonePermissionState?: RealtimeCallMicrophonePermissionState;
  fallbackRehearsalAvailable?: boolean;
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
}

export interface StartRealtimeCallSessionDependencies {
  fetch: typeof fetch;
  getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
  createPeerConnection: () => RealtimePeerConnectionLike;
}

interface RealtimeClientSecretResponse {
  value: string;
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
    fallbackRehearsalAvailable: options.fallbackRehearsalAvailable ?? true
  };
}

export async function startRealtimeCallSession(
  dependencies: StartRealtimeCallSessionDependencies
): Promise<StartRealtimeCallSessionResult> {
  let localStream: MediaStream | undefined;
  let peerConnection: RealtimePeerConnectionLike | undefined;
  let dataChannel: RealtimeDataChannelLike | undefined;

  try {
    const clientSecret = await requestEphemeralClientSecret(dependencies.fetch);

    if (!clientSecret) {
      return {
        controls: buildRealtimeCallControls({
          status: "fallback",
          microphonePermissionState: "not-requested"
        })
      };
    }

    localStream = await dependencies.getUserMedia({ audio: true });
    peerConnection = dependencies.createPeerConnection();

    for (const track of localStream.getTracks()) {
      peerConnection.addTrack(track, localStream);
    }

    dataChannel = peerConnection.createDataChannel("oai-events");
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    const sdpResponse = await dependencies.fetch(OPENAI_REALTIME_WEBRTC_CALLS_ENDPOINT, {
      method: "POST",
      body: offer.sdp ?? "",
      headers: {
        Authorization: `Bearer ${clientSecret}`,
        "Content-Type": "application/sdp"
      }
    });

    if (!sdpResponse.ok) {
      closeSessionResources({ peerConnection, dataChannel, localStream });
      return {
        controls: buildRealtimeCallControls({
          status: "fallback",
          microphonePermissionState: "granted"
        })
      };
    }

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
        microphonePermissionState: localStream ? "granted" : "denied"
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
  fetchFn: typeof fetch
): Promise<string | undefined> {
  const response = await fetchFn(REALTIME_TOKEN_ENDPOINT_PATH, {
    method: "POST",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    return undefined;
  }

  const body: unknown = await response.json();

  if (!isRealtimeClientSecretResponse(body)) {
    return undefined;
  }

  return body.value;
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
