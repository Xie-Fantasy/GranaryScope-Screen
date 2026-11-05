<script setup lang="ts">
import { computed, onActivated, onDeactivated, onMounted, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import {
  getRobotMonitorSourceUrl,
  getRobotMonitorWhepUrl,
  saveRobotMonitorCapture,
} from '@/api/modules/robotMonitor';
import {
  getDetectionSocketUrl,
  getWhepUrl,
  openDetectionSocket,
  openWhepSession,
  parseDetectionFrame,
  type WhepSession,
} from '@/api/modules/videoDetection';
import { useVideoMonitorStore } from '@/store/modules/video-monitor';
import type {
  DetectionFrame,
  NormalizedBoundingBox,
  VideoConnectionStatus,
  DetectionConnectionStatus,
} from '@/types/videoDetection';

defineOptions({ name: 'CameraDetectionStage' });

const DEBUG_LOG = import.meta.env.DEV;

/** 开发模式诊断日志；生产构建自动关闭。 */
function debug(...parts: unknown[]): void {
  if (DEBUG_LOG) {
    console.log('[CameraDetectionStage]', ...parts);
  }
}

function debugWarn(...parts: unknown[]): void {
  if (DEBUG_LOG) {
    console.warn('[CameraDetectionStage]', ...parts);
  }
}

const VIDEO_RETRY_BASE_MS = 1_000;
const VIDEO_RETRY_MAX_MS = 15_000;
const DETECTION_RETRY_BASE_MS = 1_000;
const DETECTION_RETRY_MAX_MS = 15_000;
const DETECTION_STALE_MS = 2_500;
/** 检测目标超过该时长未更新即移除，避免框滞留在已离开的目标上。 */
const TRACK_EXPIRE_MS = 600;
/** 显示框向最新检测位置收敛的插值系数（每 rAF 帧衰减比例）。 */
const TRACK_INTERP_FACTOR = 0.35;

/** 参与平滑插值的一个跟踪目标。 */
interface TrackedBox {
  label: string;
  confidence: number;
  target: NormalizedBoundingBox;
  display: NormalizedBoundingBox;
  updatedAtMs: number;
}

const stageElement = ref<HTMLElement | null>(null);
const videoElement = ref<HTMLVideoElement | null>(null);
const overlayCanvas = ref<HTMLCanvasElement | null>(null);
const robotFrameUrl = ref<string | null>(null);
const robotPlaybackMode = ref<'none' | 'whep' | 'iframe'>('none');

const videoStatus = ref<VideoConnectionStatus>('idle');
const detectionStatus = ref<DetectionConnectionStatus>('idle');
const videoMonitorStore = useVideoMonitorStore();
const { activeStream, captureRequestId, captureStatus } = storeToRefs(videoMonitorStore);
const isRobotStream = computed(() => activeStream.value === 'robot');
const streamLabel = computed(() => (isRobotStream.value ? '机器人监控' : '仓内监控'));

let isActive = false;
let hasStarted = false;
let devicePixelRatio = 1;
let resizeObserver: ResizeObserver | null = null;
let staleTimerId: number | null = null;
let animationFrameId: number | null = null;
let untrackedKeySeq = 0;

let whepSession: WhepSession | null = null;
let whepAbortController: AbortController | null = null;
let videoRetryTimerId: number | null = null;
let videoRetryDelayMs = VIDEO_RETRY_BASE_MS;
let directVideoLoading = false;
let directVideoSourceRequestId = 0;
let captureInFlightRequestId: number | null = null;

let detectionSocket: WebSocket | null = null;
let detectionRetryTimerId: number | null = null;
let detectionRetryDelayMs = DETECTION_RETRY_BASE_MS;

// 高频元数据不进入响应式系统，避免高频推送触发整页重渲染。
let latestFrame: DetectionFrame | null = null;
let latestFrameAtMs = 0;
// 按 trackId 索引的插值绘制状态；同一目标的框在 rAF 循环中平滑收敛。
const trackedBoxes = new Map<number, TrackedBox>();

const emptyTitle = computed(() => {
  if (videoStatus.value === 'connecting') {
    return isRobotStream.value ? '正在建立机器人监控连接' : '正在建立视频连接';
  }
  if (videoStatus.value === 'offline') {
    return isRobotStream.value ? '机器人监控连接不可用' : '视频连接不可用';
  }
  return isRobotStream.value ? '机器人监控待现场接入' : '视频待现场接入';
});

const emptyDescription = computed(() => {
  if (videoStatus.value === 'connecting') {
    return isRobotStream.value ? '正在加载机器人监控画面，请稍候。' : '正在与媒体服务协商 WebRTC 播放，请稍候。';
  }
  if (videoStatus.value === 'offline') {
    return '正在自动重试。真实摄像头需在局域网 B 完成现场验证。';
  }
  return isRobotStream.value
    ? '当前未建立机器人监控连接，请在局域网 B 完成后续现场验证。'
    : '当前未建立浏览器播放或检测连接，请在局域网 B 完成后续现场验证。';
});

function resizeOverlayCanvas(): void {
  const stage = stageElement.value;
  const canvas = overlayCanvas.value;

  if (!stage || !canvas) {
    return;
  }

  const { width, height } = stage.getBoundingClientRect();
  devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(width * devicePixelRatio));
  canvas.height = Math.max(1, Math.round(height * devicePixelRatio));
  drawTrackedBoxes();
}

function themeColor(name: string, fallback: string): string {
  const stage = stageElement.value;
  if (!stage) {
    return fallback;
  }
  const value = getComputedStyle(stage).getPropertyValue(name).trim();
  return value || fallback;
}

/** 将一帧检测结果合入插值表：同 trackId 的目标更新目标位置，新目标从当前位置起步。 */
function ingestDetectionFrame(frame: DetectionFrame): void {
  const now = performance.now();
  for (const detection of frame.detections) {
    // 无 trackId 的框使用一次性负数键：不参与跨帧插值，短暂展示后过期。
    const key = detection.trackId ?? --untrackedKeySeq;
    const existing = trackedBoxes.get(key);
    if (existing) {
      existing.label = detection.label;
      existing.confidence = detection.confidence;
      existing.target = detection.bboxNorm;
      existing.updatedAtMs = now;
      continue;
    }
    trackedBoxes.set(key, {
      label: detection.label,
      confidence: detection.confidence,
      target: detection.bboxNorm,
      display: { ...detection.bboxNorm },
      updatedAtMs: now,
    });
  }
}

/** rAF 渲染循环：显示框向最新检测位置插值收敛，并移除过期目标。 */
function renderOverlay(nowMs: number): void {
  animationFrameId = window.requestAnimationFrame(renderOverlay);
  if (!isActive) {
    return;
  }

  for (const [key, box] of trackedBoxes) {
    if (nowMs - box.updatedAtMs > TRACK_EXPIRE_MS) {
      trackedBoxes.delete(key);
      continue;
    }
    const { display, target } = box;
    display.x += (target.x - display.x) * TRACK_INTERP_FACTOR;
    display.y += (target.y - display.y) * TRACK_INTERP_FACTOR;
    display.w += (target.w - display.w) * TRACK_INTERP_FACTOR;
    display.h += (target.h - display.h) * TRACK_INTERP_FACTOR;
  }
  drawTrackedBoxes();
}

/** 按 object-fit: contain 将归一化检测框映射到 Canvas 像素坐标。 */
function drawTrackedBoxes(): void {
  const canvas = overlayCanvas.value;
  const context = canvas?.getContext('2d');
  if (!canvas || !context) {
    return;
  }

  const cssWidth = canvas.width / devicePixelRatio;
  const cssHeight = canvas.height / devicePixelRatio;
  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  context.clearRect(0, 0, cssWidth, cssHeight);

  if (trackedBoxes.size === 0) {
    return;
  }

  const video = videoElement.value;
  const frame = latestFrame;
  const sourceWidth =
    video && video.videoWidth > 0
      ? video.videoWidth
      : frame?.sourceWidth ?? 0;
  const sourceHeight =
    video && video.videoHeight > 0
      ? video.videoHeight
      : frame?.sourceHeight ?? 0;
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    return;
  }

  const scale = Math.min(cssWidth / sourceWidth, cssHeight / sourceHeight);
  const displayedWidth = sourceWidth * scale;
  const displayedHeight = sourceHeight * scale;
  const offsetX = (cssWidth - displayedWidth) / 2;
  const offsetY = (cssHeight - displayedHeight) / 2;

  const accentColor = themeColor('--primary', '#4ea1ff');
  const textColor = themeColor('--text-primary', '#ffffff');
  context.font = '12px "Segoe UI", "Microsoft YaHei", sans-serif';
  context.textBaseline = 'middle';

  for (const box of trackedBoxes.values()) {
    const { display } = box;
    const x = offsetX + display.x * displayedWidth;
    const y = offsetY + display.y * displayedHeight;
    const width = display.w * displayedWidth;
    const height = display.h * displayedHeight;

    context.lineWidth = 2;
    context.strokeStyle = accentColor;
    context.strokeRect(x, y, width, height);

    const label = `${box.label} ${Math.round(box.confidence * 100)}%`;
    const textWidth = context.measureText(label).width;
    const chipHeight = 18;
    const chipY = y >= chipHeight + 2 ? y - chipHeight - 2 : y + 2;
    context.fillStyle = 'rgba(0, 0, 0, 0.62)';
    context.fillRect(x, chipY, textWidth + 12, chipHeight);
    context.fillStyle = textColor;
    context.fillText(label, x + 6, chipY + chipHeight / 2 + 1);
  }
}

function handleVideoStateChange(): void {
  const connection = whepSession?.peerConnection.connectionState;
  debug('PeerConnection 状态变化:', connection);
  if (connection === 'failed' || connection === 'disconnected' || connection === 'closed') {
    teardownVideoPlayback();
    if (isActive) {
      videoStatus.value = 'offline';
      debugWarn('视频连接断开，进入重连');
      scheduleVideoRetry();
    }
  }
}

function handleVideoPlaying(): void {
  videoRetryDelayMs = VIDEO_RETRY_BASE_MS;
  directVideoLoading = false;
  videoStatus.value = 'playing';
  const video = videoElement.value;
  // 分辨率是判断视频来源的关键：640x854 = 本地测试视频；摄像头分辨率 = 真实源。
  const stream = video?.srcObject;
  const trackCount =
    stream instanceof MediaStream ? stream.getTracks().length : 0;
  debug(
    '视频开始播放:',
    `${video?.videoWidth ?? '?'}x${video?.videoHeight ?? '?'}`,
    `srcObject tracks=${trackCount}`,
  );
  if (isRobotStream.value) {
    void processPendingRobotCapture();
    return;
  }
  drawTrackedBoxes();
}

function handleRobotFrameLoad(): void {
  directVideoLoading = false;
  if (!isActive || !isRobotStream.value) {
    return;
  }
  videoRetryDelayMs = VIDEO_RETRY_BASE_MS;
  videoStatus.value = 'playing';
  void processPendingRobotCapture();
}

function teardownVideoPlayback(): void {
  if (videoRetryTimerId !== null) {
    window.clearTimeout(videoRetryTimerId);
    videoRetryTimerId = null;
  }

  const video = videoElement.value;
  if (video) {
    video.removeEventListener('playing', handleVideoPlaying);
    video.pause();
    video.removeAttribute('src');
    video.srcObject = null;
    video.load();
  }

  const session = whepSession;
  whepSession = null;
  if (session) {
    session.peerConnection.removeEventListener('connectionstatechange', handleVideoStateChange);
    session.close();
  }

  whepAbortController?.abort();
  whepAbortController = null;
  directVideoLoading = false;
  directVideoSourceRequestId += 1;
  robotFrameUrl.value = null;
  robotPlaybackMode.value = 'none';
}

function scheduleVideoRetry(): void {
  if (!isActive || videoRetryTimerId !== null || whepSession || directVideoLoading) {
    return;
  }
  debug(`${streamLabel.value}将在 ${videoRetryDelayMs}ms 后重试`);
  videoRetryTimerId = window.setTimeout(() => {
    videoRetryTimerId = null;
    void startCurrentVideo();
  }, videoRetryDelayMs);
  videoRetryDelayMs = Math.min(videoRetryDelayMs * 2, VIDEO_RETRY_MAX_MS);
}

async function startWarehouseVideo(): Promise<void> {
  if (!isActive || whepSession) {
    return;
  }
  videoStatus.value = 'connecting';
  debug('WHEP 协商开始:', getWhepUrl());
  const abortController = new AbortController();
  whepAbortController = abortController;

  try {
    const session = await openWhepSession(getWhepUrl(), abortController.signal);
    if (!isActive || whepSession) {
      session.close();
      return;
    }

    const video = videoElement.value;
    if (!video) {
      session.close();
      return;
    }

    whepSession = session;
    session.peerConnection.addEventListener('connectionstatechange', handleVideoStateChange);
    video.addEventListener('playing', handleVideoPlaying);
    video.srcObject = session.stream;
    debug('WHEP 会话已建立，等待视频轨到达');
    await video.play().catch(() => debugWarn('video.play() 被浏览器推迟（等待交互或数据）'));
  } catch (error) {
    if (!isActive) {
      return;
    }
    debugWarn('WHEP 协商失败:', error);
    videoStatus.value = 'offline';
    scheduleVideoRetry();
  } finally {
    if (whepAbortController === abortController) {
      whepAbortController = null;
    }
  }
}

async function startRobotVideo(): Promise<void> {
  if (!isActive || directVideoLoading) {
    return;
  }

  videoStatus.value = 'connecting';
  directVideoLoading = true;
  const requestId = ++directVideoSourceRequestId;
  let playerUrl: string | null = null;
  try {
    playerUrl = await getRobotMonitorSourceUrl();
    if (!isActive || !isRobotStream.value || requestId !== directVideoSourceRequestId) {
      return;
    }

    const session = await openWhepSession(getRobotMonitorWhepUrl(playerUrl));
    if (!isActive || !isRobotStream.value || requestId !== directVideoSourceRequestId || whepSession) {
      session.close();
      return;
    }

    const video = videoElement.value;
    if (!video) {
      session.close();
      return;
    }

    whepSession = session;
    robotPlaybackMode.value = 'whep';
    session.peerConnection.addEventListener('connectionstatechange', handleVideoStateChange);
    video.addEventListener('playing', handleVideoPlaying);
    video.srcObject = session.stream;
    debug('机器人监控 WHEP 会话已建立，等待视频轨到达');
    await video.play();
  } catch (error) {
    if (!isActive || !isRobotStream.value || requestId !== directVideoSourceRequestId) {
      return;
    }

    const session = whepSession;
    whepSession = null;
    if (session) {
      session.peerConnection.removeEventListener('connectionstatechange', handleVideoStateChange);
      session.close();
    }
    const video = videoElement.value;
    if (video) {
      video.removeEventListener('playing', handleVideoPlaying);
      video.srcObject = null;
      video.load();
    }

    if (playerUrl) {
      // 非标准 WHEP 服务仍可使用浏览器播放页展示，但其像素不可供前端读取。
      debugWarn('机器人监控 WHEP 协商失败，回退至内嵌播放页:', error);
      robotPlaybackMode.value = 'iframe';
      robotFrameUrl.value = playerUrl;
      return;
    }

    directVideoLoading = false;
    videoStatus.value = 'offline';
    debugWarn('机器人监控连接失败:', error);
    scheduleVideoRetry();
  }
}

async function startCurrentVideo(): Promise<void> {
  if (isRobotStream.value) {
    await startRobotVideo();
    return;
  }
  await startWarehouseVideo();
}

async function processPendingRobotCapture(): Promise<void> {
  const requestId = captureRequestId.value;
  const alertKey = videoMonitorStore.captureAlertKey;
  if (
    !isActive
    || !isRobotStream.value
    || captureStatus.value !== 'pending'
    || !alertKey
    || captureInFlightRequestId === requestId
  ) {
    return;
  }

  captureInFlightRequestId = requestId;
  if (robotPlaybackMode.value !== 'whep') {
    videoMonitorStore.failRobotCapture(
      requestId,
      '机器人监控已回退为独立播放页面，当前无法读取画面进行抓拍',
    );
    captureInFlightRequestId = null;
    return;
  }

  const video = videoElement.value;
  if (!video) {
    captureInFlightRequestId = null;
    return;
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context || canvas.width <= 0 || canvas.height <= 0) {
      throw new Error('机器人监控画面尚未就绪');
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('机器人监控画面导出失败'));
        }
      }, 'image/jpeg', 0.92);
    });
    const capture = await saveRobotMonitorCapture(alertKey, image);
    videoMonitorStore.completeRobotCapture(requestId, capture.imageUrl);
  } catch (error) {
    videoMonitorStore.failRobotCapture(
      requestId,
      error instanceof Error ? error.message : '机器人监控抓拍失败',
    );
  } finally {
    if (captureInFlightRequestId === requestId) {
      captureInFlightRequestId = null;
    }
  }
}

function teardownDetectionSocket(): void {
  if (detectionRetryTimerId !== null) {
    window.clearTimeout(detectionRetryTimerId);
    detectionRetryTimerId = null;
  }

  const socket = detectionSocket;
  detectionSocket = null;
  if (socket) {
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    socket.close();
  }
}

function scheduleDetectionRetry(): void {
  if (!isActive || detectionRetryTimerId !== null || detectionSocket) {
    return;
  }
  debug(`检测 WebSocket 将在 ${detectionRetryDelayMs}ms 后重试`);
  detectionRetryTimerId = window.setTimeout(() => {
    detectionRetryTimerId = null;
    startDetection();
  }, detectionRetryDelayMs);
  detectionRetryDelayMs = Math.min(detectionRetryDelayMs * 2, DETECTION_RETRY_MAX_MS);
}

let receivedDetectionFrames = 0;

function handleDetectionMessage(event: MessageEvent): void {
  let payload: unknown;
  try {
    payload = JSON.parse(typeof event.data === 'string' ? event.data : '');
  } catch {
    debugWarn('检测消息不是合法 JSON，已丢弃');
    return;
  }

  const frame = parseDetectionFrame(payload);
  if (!frame) {
    debugWarn('检测消息未通过契约校验，已丢弃:', payload);
    return;
  }

  latestFrame = frame;
  latestFrameAtMs = Date.now();
  detectionStatus.value = 'ready';
  receivedDetectionFrames += 1;
  if (receivedDetectionFrames === 1 || receivedDetectionFrames % 50 === 0) {
    debug(
      `检测帧 #${frame.frameId}`,
      `目标数=${frame.detections.length}`,
      `源分辨率=${frame.sourceWidth}x${frame.sourceHeight}`,
      `模型=${frame.modelName}`,
      `(累计接收 ${receivedDetectionFrames} 帧)`,
    );
  }
  ingestDetectionFrame(frame);
}

function startDetection(): void {
  if (!isActive || detectionSocket) {
    return;
  }
  detectionStatus.value = 'connecting';
  const socketUrl = getDetectionSocketUrl();
  debug('检测 WebSocket 连接开始:', socketUrl);

  let socket: WebSocket;
  try {
    socket = openDetectionSocket(socketUrl);
  } catch (error) {
    debugWarn('检测 WebSocket 地址无效:', error);
    detectionStatus.value = 'idle';
    scheduleDetectionRetry();
    return;
  }
  detectionSocket = socket;

  socket.onopen = () => {
    if (detectionSocket !== socket) {
      return;
    }
    detectionRetryDelayMs = DETECTION_RETRY_BASE_MS;
    detectionStatus.value = 'waiting';
    debug('检测 WebSocket 已连接，等待推理数据');
  };
  socket.onmessage = handleDetectionMessage;
  socket.onclose = (event) => {
    if (detectionSocket !== socket) {
      return;
    }
    debugWarn(
      `检测 WebSocket 关闭: code=${event.code}`,
      `reason=${event.reason || '(无)'}`,
    );
    teardownDetectionSocket();
    if (isActive) {
      detectionStatus.value = 'idle';
      latestFrame = null;
      trackedBoxes.clear();
      drawTrackedBoxes();
      scheduleDetectionRetry();
    }
  };
  socket.onerror = () => {
    if (detectionSocket !== socket) {
      return;
    }
    debugWarn('检测 WebSocket 发生错误（常见原因：后端未启动、端口不对、或路径 404）');
    socket.close();
  };
}

function checkDetectionStaleness(): void {
  if (detectionStatus.value !== 'ready' || latestFrame === null) {
    return;
  }
  if (Date.now() - latestFrameAtMs > DETECTION_STALE_MS) {
    latestFrame = null;
    trackedBoxes.clear();
    detectionStatus.value = 'waiting';
    drawTrackedBoxes();
  }
}

function clearDetectionOverlay(): void {
  latestFrame = null;
  trackedBoxes.clear();
  drawTrackedBoxes();
}

function switchActiveStream(): void {
  if (!isActive) {
    return;
  }

  teardownVideoPlayback();
  clearDetectionOverlay();
  if (isRobotStream.value) {
    teardownDetectionSocket();
    detectionStatus.value = 'idle';
  } else {
    startDetection();
  }
  void startCurrentVideo();
}

function activateStage(): void {
  if (isActive) {
    return;
  }
  isActive = true;
  debug('组件激活，建立连接:', { WHEP: getWhepUrl(), 检测WS: getDetectionSocketUrl() });
  resizeOverlayCanvas();

  if (stageElement.value && typeof ResizeObserver !== 'undefined' && !resizeObserver) {
    resizeObserver = new ResizeObserver(resizeOverlayCanvas);
    resizeObserver.observe(stageElement.value);
  }
  if (staleTimerId === null) {
    staleTimerId = window.setInterval(checkDetectionStaleness, 1_000);
  }
  if (animationFrameId === null) {
    animationFrameId = window.requestAnimationFrame(renderOverlay);
  }

  void startCurrentVideo();
  if (!isRobotStream.value) {
    startDetection();
  }
}

function releaseStageResources(): void {
  if (!isActive) {
    return;
  }
  debug('组件停用，释放视频连接、检测 WebSocket 与定时器');
  isActive = false;
  hasStarted = false;

  if (videoRetryTimerId !== null) {
    window.clearTimeout(videoRetryTimerId);
    videoRetryTimerId = null;
  }
  if (detectionRetryTimerId !== null) {
    window.clearTimeout(detectionRetryTimerId);
    detectionRetryTimerId = null;
  }
  if (staleTimerId !== null) {
    window.clearInterval(staleTimerId);
    staleTimerId = null;
  }
  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  resizeObserver?.disconnect();
  resizeObserver = null;

  teardownVideoPlayback();
  teardownDetectionSocket();

  const video = videoElement.value;
  if (video) {
    video.pause();
  }

  const canvas = overlayCanvas.value;
  const context = canvas?.getContext('2d');
  if (canvas && context) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  latestFrame = null;
  trackedBoxes.clear();
  untrackedKeySeq = 0;
  videoStatus.value = 'idle';
  detectionStatus.value = 'idle';
  videoRetryDelayMs = VIDEO_RETRY_BASE_MS;
  detectionRetryDelayMs = DETECTION_RETRY_BASE_MS;
}

watch(activeStream, switchActiveStream);
watch(captureRequestId, () => {
  if (isActive && isRobotStream.value && videoStatus.value === 'playing') {
    void processPendingRobotCapture();
  }
});

onMounted(() => {
  if (!hasStarted) {
    hasStarted = true;
    activateStage();
  }
});
onActivated(() => {
  if (!hasStarted) {
    hasStarted = true;
  }
  activateStage();
});
onDeactivated(releaseStageResources);
onUnmounted(releaseStageResources);
</script>

<template>
  <section
    ref="stageElement"
    class="camera-detection-stage"
    :class="{ 'camera-detection-stage--robot': isRobotStream }"
    :aria-label="`${streamLabel}展示区`"
  >
    <!-- 仓内与机器人监控优先经 WHEP 协商；机器人服务不支持时才回退至其播放页。 -->
    <video
      v-show="!isRobotStream || robotPlaybackMode === 'whep'"
      ref="videoElement"
      class="camera-detection-stage__video"
      muted
      playsinline
      preload="none"
    ></video>
    <iframe
      v-if="isRobotStream && robotPlaybackMode === 'iframe' && robotFrameUrl"
      class="camera-detection-stage__robot-frame"
      :src="robotFrameUrl"
      title="机器人监控"
      allow="autoplay; fullscreen"
      referrerpolicy="no-referrer"
      @load="handleRobotFrameLoad"
    ></iframe>
    <!-- Canvas 与 video 共用同一容器，仅绘制后端确认过的归一化检测元数据。 -->
    <canvas v-show="!isRobotStream" ref="overlayCanvas" class="camera-detection-stage__overlay" aria-hidden="true"></canvas>

    <div v-show="!isRobotStream" class="camera-detection-stage__grid" aria-hidden="true"></div>

    <div class="camera-detection-stage__stream-switch" role="group" aria-label="切换监控视频流">
      <button
        type="button"
        class="camera-detection-stage__stream-button"
        :class="{ 'camera-detection-stage__stream-button--active': activeStream === 'warehouse' }"
        :aria-pressed="activeStream === 'warehouse'"
        @click="videoMonitorStore.selectStream('warehouse')"
      >仓内监控</button>
      <button
        type="button"
        class="camera-detection-stage__stream-button"
        :class="{ 'camera-detection-stage__stream-button--active': activeStream === 'robot' }"
        :aria-pressed="activeStream === 'robot'"
        @click="videoMonitorStore.selectStream('robot')"
      >机器人监控</button>
    </div>

    <div v-show="videoStatus !== 'playing'" class="camera-detection-stage__empty-state" role="status" aria-live="polite">
      <svg class="camera-detection-stage__icon" viewBox="0 0 56 48" fill="none" aria-hidden="true">
        <rect x="4" y="8" width="34" height="28" rx="3" />
        <path d="m38 18 14-7v22l-14-7" />
        <path d="M14 40h14M21 36v4" />
      </svg>
      <p class="camera-detection-stage__eyebrow">{{ isRobotStream ? '机器人监控 / 实时画面' : '仓内监控 / YOLO 检测' }}</p>
      <p class="camera-detection-stage__title">{{ emptyTitle }}</p>
      <p class="camera-detection-stage__description">{{ emptyDescription }}</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.camera-detection-stage {
  @include shell.panel;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: color-mix(in srgb, var(--bg-panel) 82%, transparent);
}

.camera-detection-stage__video,
.camera-detection-stage__overlay,
.camera-detection-stage__grid,
.camera-detection-stage__robot-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.camera-detection-stage__video {
  z-index: 0;
  display: block;
  object-fit: contain;
  background: var(--bg-page);
}

.camera-detection-stage__overlay {
  z-index: 1;
  pointer-events: none;
}

.camera-detection-stage__grid {
  z-index: 2;
  pointer-events: none;
  background-image:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.46;
}

.camera-detection-stage__stream-switch {
  position: absolute;
  z-index: 3;
  top: $spacing-sm;
  right: $spacing-sm;
  display: flex;
  padding: 3px;
  gap: 3px;
  background: color-mix(in srgb, var(--bg-panel) 78%, transparent);
  border: 1px solid var(--border-default);
  border-radius: 4px;
}

.camera-detection-stage__stream-button {
  min-width: 76px;
  padding: 4px 9px;
  color: var(--text-tertiary);
  font-size: $font-size-xs;
  line-height: 1.45;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 3px;
  transition: color $transition-fast, background-color $transition-fast, border-color $transition-fast;
}

.camera-detection-stage__stream-button:hover,
.camera-detection-stage__stream-button:focus-visible {
  color: var(--primary);
  background: var(--primary-soft);
}

.camera-detection-stage__stream-button--active {
  color: var(--primary);
  background: var(--primary-soft);
  border-color: var(--primary-line);
}

.camera-detection-stage--robot .camera-detection-stage__video {
  // 保持机器人源的原始 1:1 比例；两侧留白属于画布，不进行拉伸或裁切。
  object-fit: contain;
  background: #05090d;
}

.camera-detection-stage__robot-frame {
  z-index: 0;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  background: #05090d;
  border: 0;
}

.camera-detection-stage__empty-state {
  position: absolute;
  z-index: 3;
  top: 45%;
  left: 50%;
  display: flex;
  width: min(420px, calc(100% - #{$spacing-2xl}));
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  transform: translate(-50%, -50%);
  text-align: center;
}

.camera-detection-stage__icon {
  width: 48px;
  height: 42px;
  margin-bottom: $spacing-xs;
  color: var(--primary-muted);

  rect,
  path {
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.5;
  }
}

.camera-detection-stage__eyebrow,
.camera-detection-stage__title,
.camera-detection-stage__description {
  margin: 0;
  line-height: 1.5;
}

.camera-detection-stage__eyebrow {
  color: var(--primary);
  font-size: $font-size-xs;
  letter-spacing: 0.08em;
}

.camera-detection-stage__title {
  color: var(--text-secondary);
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.04em;
}

.camera-detection-stage__description {
  max-width: 340px;
  color: var(--text-tertiary);
  font-size: $font-size-xs;
}
</style>
