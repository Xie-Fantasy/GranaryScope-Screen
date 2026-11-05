import type {
  DetectionFrame,
  NormalizedBoundingBox,
  VideoDetection,
} from '@/types/videoDetection';

const DEFAULT_WHEP_PORT = '8889';
const DEFAULT_DETECTION_PORT = '8000';
const DEFAULT_BACKEND_PORT = '8000';
const ICE_GATHERING_TIMEOUT_MS = 5_000;

export interface WhepSession {
  peerConnection: RTCPeerConnection;
  stream: MediaStream;
  close: () => void;
}

function getConfiguredUrl(
  envValue: string | undefined,
  protocol: 'http:' | 'https:' | 'ws:' | 'wss:',
  port: string,
  path: string,
): string {
  const configuredUrl = envValue?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }

  return `${protocol}//${window.location.hostname}:${port}${path}`;
}

/**
 * 读取 WHEP 播放地址。未配置时复用当前浏览器主机名，避免把媒体地址写死在源码中。
 */
export function getWhepUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  return getConfiguredUrl(import.meta.env.VITE_WHEP_URL, protocol, DEFAULT_WHEP_PORT, '/camera1/whep');
}

/**
 * 读取检测结果 WebSocket 地址。该连接仅传输元数据，不承载视频帧。
 */
export function getDetectionSocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return getConfiguredUrl(
    import.meta.env.VITE_DETECTION_WS_URL,
    protocol,
    DEFAULT_DETECTION_PORT,
    '/api/v1/ws/detections',
  );
}

/** 后端 HTTP API 基地址；仅用于视频源配置和抓拍保存，不经过业务 Mock。 */
export function getVideoBackendApiUrl(path: string): string {
  const configuredBase = import.meta.env.VITE_VIDEO_BACKEND_URL?.trim();
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const baseUrl = configuredBase || `${protocol}//${window.location.hostname}:${DEFAULT_BACKEND_PORT}`;
  return new URL(`/api/v1${path}`, baseUrl).toString();
}

function createSafeUrl(value: string, label: string): string {
  try {
    return new URL(value, window.location.href).toString();
  } catch {
    throw new Error(`${label}地址配置无效`);
  }
}

function waitForIceGatheringComplete(peerConnection: RTCPeerConnection): Promise<void> {
  if (peerConnection.iceGatheringState === 'complete') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const finish = (): void => {
      window.clearTimeout(timeoutId);
      peerConnection.removeEventListener('icegatheringstatechange', onStateChange);
      resolve();
    };
    const onStateChange = (): void => {
      if (peerConnection.iceGatheringState === 'complete') {
        finish();
      }
    };
    const timeoutId = window.setTimeout(finish, ICE_GATHERING_TIMEOUT_MS);

    peerConnection.addEventListener('icegatheringstatechange', onStateChange);
  });
}

function deleteWhepSession(sessionUrl: string): void {
  void fetch(sessionUrl, {
    method: 'DELETE',
    headers: { Accept: 'application/sdp' },
    keepalive: true,
  }).catch(() => undefined);
}

/**
 * 按 WHEP 协商浏览器只接收视频的 PeerConnection。
 * 调用方负责在不再展示时调用返回对象的 close，释放服务端 WHEP 会话。
 */
export async function openWhepSession(whepUrl: string, signal?: AbortSignal): Promise<WhepSession> {
  const endpoint = createSafeUrl(whepUrl, 'WHEP');
  const peerConnection = new RTCPeerConnection();
  const stream = new MediaStream();
  let sessionUrl: string | null = null;
  let closed = false;

  const close = (): void => {
    if (closed) {
      return;
    }
    closed = true;
    peerConnection.close();
    stream.getTracks().forEach((track) => track.stop());
    if (sessionUrl) {
      deleteWhepSession(sessionUrl);
      sessionUrl = null;
    }
  };

  try {
    peerConnection.addTransceiver('video', { direction: 'recvonly' });
    peerConnection.addEventListener('track', (event) => {
      if (!stream.getTracks().some((track) => track.id === event.track.id)) {
        stream.addTrack(event.track);
      }
    });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    await waitForIceGatheringComplete(peerConnection);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/sdp',
        'Content-Type': 'application/sdp',
      },
      body: peerConnection.localDescription?.sdp ?? '',
      signal,
    });

    if (response.status !== 201) {
      // 常见状态：404 = 路径不存在（MediaMTX 未运行或路径写错）；
      // 403 = 源不在 MediaMTX 的 CORS 白名单；503 = 路径存在但没有可用流。
      throw new Error(`WHEP 协商未成功（HTTP ${response.status}）`);
    }

    const answerSdp = await response.text();
    if (!answerSdp.trim()) {
      throw new Error('WHEP 未返回播放协商结果');
    }

    const location = response.headers.get('Location');
    if (!location) {
      throw new Error('WHEP 未返回会话地址');
    }
    sessionUrl = new URL(location, endpoint).toString();

    await peerConnection.setRemoteDescription({ type: 'answer', sdp: answerSdp });
    return { peerConnection, stream, close };
  } catch (error) {
    close();
    throw error;
  }
}

/** 创建检测元数据通道；重连策略由展示组件依据其生命周期控制。 */
export function openDetectionSocket(socketUrl: string): WebSocket {
  return new WebSocket(createSafeUrl(socketUrl, '检测 WebSocket'));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && isFiniteNumber(value) && value >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return isNonNegativeInteger(value) && value > 0;
}

function isUnitNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0 && value <= 1;
}

function parseBoundingBox(value: unknown): NormalizedBoundingBox | null {
  if (!isRecord(value)) {
    return null;
  }

  const { x, y, w, h } = value;
  if (!isUnitNumber(x) || !isUnitNumber(y) || !isUnitNumber(w) || !isUnitNumber(h) || x + w > 1 || y + h > 1) {
    return null;
  }

  return { x, y, w, h };
}

function parseDetection(value: unknown): VideoDetection | null {
  if (!isRecord(value)) {
    return null;
  }

  const { classId, label, confidence, bboxNorm, trackId } = value;
  const boundingBox = parseBoundingBox(bboxNorm);
  if (
    !isNonNegativeInteger(classId) ||
    typeof label !== 'string' ||
    !label.trim() ||
    !isUnitNumber(confidence) ||
    !boundingBox
  ) {
    return null;
  }
  if (trackId !== undefined && !isNonNegativeInteger(trackId)) {
    return null;
  }

  return {
    classId,
    label: label.trim(),
    confidence,
    bboxNorm: boundingBox,
    ...(trackId === undefined ? {} : { trackId }),
  };
}

/**
 * 校验后端推送的最小检测元数据契约。非法数据只会被丢弃，不会中断视频播放。
 */
export function parseDetectionFrame(value: unknown): DetectionFrame | null {
  if (!isRecord(value)) {
    return null;
  }

  const {
    cameraId,
    frameId,
    capturedAtMs,
    sourceTimestamp,
    inferenceStartedAtMs,
    inferenceFinishedAtMs,
    sourceWidth,
    sourceHeight,
    modelName,
    detections,
  } = value;

  if (
    typeof cameraId !== 'string' ||
    !cameraId.trim() ||
    !isNonNegativeInteger(frameId) ||
    (capturedAtMs !== undefined && !isNonNegativeInteger(capturedAtMs)) ||
    (sourceTimestamp !== undefined && (!isFiniteNumber(sourceTimestamp) || sourceTimestamp < 0)) ||
    !isNonNegativeInteger(inferenceStartedAtMs) ||
    !isNonNegativeInteger(inferenceFinishedAtMs) ||
    inferenceFinishedAtMs < inferenceStartedAtMs ||
    !isPositiveInteger(sourceWidth) ||
    !isPositiveInteger(sourceHeight) ||
    typeof modelName !== 'string' ||
    !modelName.trim() ||
    !Array.isArray(detections)
  ) {
    return null;
  }

  const parsedDetections: VideoDetection[] = [];
  for (const detection of detections) {
    const parsed = parseDetection(detection);
    if (parsed === null) {
      return null;
    }
    parsedDetections.push(parsed);
  }

  return {
    cameraId: cameraId.trim(),
    frameId,
    ...(capturedAtMs === undefined ? {} : { capturedAtMs }),
    ...(sourceTimestamp === undefined ? {} : { sourceTimestamp }),
    inferenceStartedAtMs,
    inferenceFinishedAtMs,
    sourceWidth,
    sourceHeight,
    modelName: modelName.trim(),
    detections: parsedDetections,
  };
}
