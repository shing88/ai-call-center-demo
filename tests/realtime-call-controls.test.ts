import assert from "node:assert/strict";
import test from "node:test";
import {
  OPENAI_REALTIME_WEBRTC_CALLS_ENDPOINT,
  buildRealtimeCallControls,
  endRealtimeCallSession,
  startRealtimeCallSession,
  type RealtimePeerConnectionLike
} from "../src/realtime-call-controls.js";
import { REALTIME_TOKEN_ENDPOINT_PATH } from "../src/realtime-token-endpoint.js";

test("buildRealtimeCallControls defaults to an idle browser control surface", () => {
  const controls = buildRealtimeCallControls();

  assert.equal(controls.status, "idle");
  assert.equal(controls.statusText, "Ready for local Realtime setup");
  assert.equal(controls.microphonePermissionState, "not-requested");
  assert.equal(controls.startCallAvailable, true);
  assert.equal(controls.endCallAvailable, false);
  assert.equal(controls.tokenEndpointPath, REALTIME_TOKEN_ENDPOINT_PATH);
  assert.equal(controls.webRtcCallsEndpoint, OPENAI_REALTIME_WEBRTC_CALLS_ENDPOINT);
  assert.equal(controls.standardApiKeyAllowedInBrowser, false);
  assert.equal(controls.ephemeralClientSecretRequired, true);
  assert.equal(controls.fallbackRehearsalAvailable, true);
});

test("startRealtimeCallSession falls back without microphone or WebRTC when the token endpoint is not configured", async () => {
  const calls: string[] = [];
  const result = await startRealtimeCallSession({
    fetch: async (url) => {
      calls.push(String(url));
      return jsonResponse(
        {
          status: "not-configured",
          fallback: {
            available: true,
            mode: "local-rehearsal"
          }
        },
        503
      );
    },
    getUserMedia: async () => {
      throw new Error("microphone should not be requested without a token");
    },
    createPeerConnection: () => {
      throw new Error("peer connection should not be created without a token");
    }
  });

  assert.deepEqual(calls, [REALTIME_TOKEN_ENDPOINT_PATH]);
  assert.equal(result.controls.status, "fallback");
  assert.equal(result.controls.microphonePermissionState, "not-requested");
  assert.equal(result.controls.startCallAvailable, true);
  assert.equal(result.controls.endCallAvailable, false);
  assert.equal(result.controls.fallbackRehearsalAvailable, true);
  assert.equal(result.session, undefined);
});

test("startRealtimeCallSession connects with an ephemeral client secret and SDP offer", async () => {
  const peer = new FakeRealtimePeerConnection();
  const audioTrack = new FakeMediaTrack();
  const stream = new FakeMediaStream([audioTrack]);
  const serverEvents: unknown[] = [];
  const requests: Array<{
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: BodyInit | null;
  }> = [];

  const result = await startRealtimeCallSession({
    tokenRequestBody: {
      callId: "CALL-1",
      operatorSessionId: "operator-demo-CALL-1",
      reviewGateId: "policy-general-guidance-only",
      realtimeGrounding: {
        version: 1,
        instructions: "# Role and Objective\nUse the selected call evidence.",
        evidenceReferences: ["knowledge/business_rules/demo.md / Demo"],
        policy: {
          outcome: "general-guidance-only",
          allowedResponseScope: "general-information-only",
          customerSpecificAnswerAllowed: false,
          humanReviewRequired: false,
          blockedResponseTypes: ["顧客別の契約状態・請求状態の断定"]
        }
      }
    },
    fetch: async (url, init) => {
      const headers = normalizeHeaders(init?.headers);
      requests.push({
        url: String(url),
        method: init?.method,
        headers,
        body: init?.body ?? null
      });

      if (String(url) === REALTIME_TOKEN_ENDPOINT_PATH) {
        return jsonResponse({
          value: "ek_test_ephemeral_client_secret",
          expires_at: 1_800_000_000,
          session: { type: "realtime", model: "gpt-realtime" }
        });
      }

      assert.equal(String(url), OPENAI_REALTIME_WEBRTC_CALLS_ENDPOINT);
      assert.equal(headers.Authorization, "Bearer ek_test_ephemeral_client_secret");
      assert.equal(headers["Content-Type"], "application/sdp");
      assert.equal(init?.body, "local-offer-sdp");

      return textResponse("remote-answer-sdp");
    },
    getUserMedia: async (constraints) => {
      assert.deepEqual(constraints, { audio: true });
      return stream as unknown as MediaStream;
    },
    createPeerConnection: () => peer,
    onServerEvent: (event) => {
      serverEvents.push(event);
    }
  });

  assert.equal(result.controls.status, "connected");
  assert.equal(result.controls.statusText, "Realtime call connected");
  assert.equal(result.controls.microphonePermissionState, "granted");
  assert.equal(result.controls.startCallAvailable, false);
  assert.equal(result.controls.endCallAvailable, true);
  assert.equal(result.session?.peerConnection, peer);
  assert.equal(peer.addedTracks[0]?.track, audioTrack);
  assert.equal(peer.createdDataChannelLabel, "oai-events");
  assert.deepEqual(peer.remoteDescription, {
    type: "answer",
    sdp: "remote-answer-sdp"
  });
  assert.equal(requests.length, 2);
  assert.equal(requests[0]?.url, REALTIME_TOKEN_ENDPOINT_PATH);
  assert.equal(requests[0]?.method, "POST");
  assert.equal(
    normalizeHeaders(requests[0]?.headers)["Content-Type"],
    "application/json"
  );
  assert.deepEqual(JSON.parse(String(requests[0]?.body)), {
    callId: "CALL-1",
    operatorSessionId: "operator-demo-CALL-1",
    reviewGateId: "policy-general-guidance-only",
    realtimeGrounding: {
      version: 1,
      instructions: "# Role and Objective\nUse the selected call evidence.",
      evidenceReferences: ["knowledge/business_rules/demo.md / Demo"],
      policy: {
        outcome: "general-guidance-only",
        allowedResponseScope: "general-information-only",
        customerSpecificAnswerAllowed: false,
        humanReviewRequired: false,
        blockedResponseTypes: ["顧客別の契約状態・請求状態の断定"]
      }
    }
  });
  assert.equal(requests[1]?.url, OPENAI_REALTIME_WEBRTC_CALLS_ENDPOINT);
  peer.dataChannel.dispatchMessage(
    JSON.stringify({
      type: "response.output_audio_transcript.done",
      transcript: "Realtime handoff transcript."
    })
  );
  assert.deepEqual(serverEvents, [
    {
      type: "response.output_audio_transcript.done",
      transcript: "Realtime handoff transcript."
    }
  ]);
});

test("endRealtimeCallSession closes the data channel, tracks, and peer connection", () => {
  const peer = new FakeRealtimePeerConnection();
  const track = new FakeMediaTrack();
  const stream = new FakeMediaStream([track]);
  const dataChannel = peer.createDataChannel("oai-events");

  const controls = endRealtimeCallSession({
    peerConnection: peer,
    dataChannel,
    localStream: stream as unknown as MediaStream
  });

  assert.equal(controls.status, "ended");
  assert.equal(controls.microphonePermissionState, "not-requested");
  assert.equal(track.stopped, true);
  assert.equal(dataChannel.closed, true);
  assert.equal(peer.closed, true);
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function textResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "Content-Type": "application/sdp" }
  });
}

function normalizeHeaders(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) {
    return {};
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return headers;
}

class FakeRealtimePeerConnection implements RealtimePeerConnectionLike {
  public addedTracks: Array<{ track: MediaStreamTrack; stream: MediaStream }> = [];
  public createdDataChannelLabel = "";
  public dataChannel = new FakeDataChannel("oai-events");
  public remoteDescription: RTCSessionDescriptionInit | undefined;
  public closed = false;

  public addTrack(track: MediaStreamTrack, stream: MediaStream): void {
    this.addedTracks.push({ track, stream });
  }

  public createDataChannel(label: string): FakeDataChannel {
    this.createdDataChannelLabel = label;
    this.dataChannel = new FakeDataChannel(label);
    return this.dataChannel;
  }

  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    return { type: "offer", sdp: "local-offer-sdp" };
  }

  public async setLocalDescription(_description: RTCSessionDescriptionInit): Promise<void> {
    return;
  }

  public async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    this.remoteDescription = description;
  }

  public close(): void {
    this.closed = true;
  }
}

class FakeDataChannel {
  public closed = false;
  private readonly messageListeners: Array<(event: { data: string }) => void> = [];

  public constructor(public readonly label: string) {}

  public close(): void {
    this.closed = true;
  }

  public addEventListener(
    type: "message",
    listener: (event: { data: string }) => void
  ): void {
    if (type === "message") {
      this.messageListeners.push(listener);
    }
  }

  public dispatchMessage(data: string): void {
    for (const listener of this.messageListeners) {
      listener({ data });
    }
  }
}

class FakeMediaTrack {
  public stopped = false;

  public stop(): void {
    this.stopped = true;
  }
}

class FakeMediaStream {
  public constructor(private readonly tracks: FakeMediaTrack[]) {}

  public getTracks(): MediaStreamTrack[] {
    return this.tracks as unknown as MediaStreamTrack[];
  }
}
