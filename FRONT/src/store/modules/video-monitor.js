import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useVideoMonitorStore = defineStore('videoMonitor', () => {
    const activeStream = ref('warehouse');
    const captureRequestId = ref(0);
    const captureAlertKey = ref(null);
    const captureStatus = ref('idle');
    const captureImageUrl = ref(null);
    const captureErrorMessage = ref(null);
    function selectStream(stream) {
        activeStream.value = stream;
    }
    function requestRobotCapture(alertKey) {
        activeStream.value = 'robot';
        captureAlertKey.value = alertKey;
        captureStatus.value = 'pending';
        captureImageUrl.value = null;
        captureErrorMessage.value = null;
        captureRequestId.value += 1;
        return captureRequestId.value;
    }
    function completeRobotCapture(requestId, imageUrl) {
        if (requestId !== captureRequestId.value)
            return;
        captureImageUrl.value = imageUrl;
        captureErrorMessage.value = null;
        captureStatus.value = 'ready';
    }
    function failRobotCapture(requestId, message) {
        if (requestId !== captureRequestId.value)
            return;
        captureImageUrl.value = null;
        captureErrorMessage.value = message;
        captureStatus.value = 'error';
    }
    function clearRobotCapture() {
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
