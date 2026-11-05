import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { AlertWarningKey } from '@/types/alert-warning';

export type VideoMonitorStream = 'warehouse' | 'robot';
export type RobotCaptureStatus = 'idle' | 'pending' | 'ready' | 'error';

export const useVideoMonitorStore = defineStore('videoMonitor', () => {
  const activeStream = ref<VideoMonitorStream>('warehouse');
  const captureRequestId = ref(0);
  const captureAlertKey = ref<AlertWarningKey | null>(null);
  const captureStatus = ref<RobotCaptureStatus>('idle');
  const captureImageUrl = ref<string | null>(null);
  const captureErrorMessage = ref<string | null>(null);

  function selectStream(stream: VideoMonitorStream): void {
    activeStream.value = stream;
  }

  function requestRobotCapture(alertKey: AlertWarningKey): number {
    activeStream.value = 'robot';
    captureAlertKey.value = alertKey;
    captureStatus.value = 'pending';
    captureImageUrl.value = null;
    captureErrorMessage.value = null;
    captureRequestId.value += 1;
    return captureRequestId.value;
  }

  function completeRobotCapture(requestId: number, imageUrl: string): void {
    if (requestId !== captureRequestId.value) return;
    captureImageUrl.value = imageUrl;
    captureErrorMessage.value = null;
    captureStatus.value = 'ready';
  }

  function failRobotCapture(requestId: number, message: string): void {
    if (requestId !== captureRequestId.value) return;
    captureImageUrl.value = null;
    captureErrorMessage.value = message;
    captureStatus.value = 'error';
  }

  function clearRobotCapture(): void {
    captureAlertKey.value = null;
    captureStatus.value = 'idle';
    captureImageUrl.value = null;
    captureErrorMessage.value = null;
  }

  return {
    activeStream,
    captureRequestId,
    captureAlertKey,
    captureStatus,
    captureImageUrl,
    captureErrorMessage,
    selectStream,
    requestRobotCapture,
    completeRobotCapture,
    failRobotCapture,
    clearRobotCapture,
  };
});
