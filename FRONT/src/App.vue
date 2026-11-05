<script setup lang="ts">
// ============================================
// App 根组件 - 大屏适配层
// 基于 1920x1080 设计稿进行 transform: scale 缩放
// 包含：全局背景图层 + 高斯模糊蒙版（由 theme store 控制）
// ============================================

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import AlertWarningDialog from '@/components/common/AlertWarningDialog.vue';
import { useThemeStore } from '@/store/modules/theme';
import { useVideoMonitorStore } from '@/store/modules/video-monitor';
import { ALERT_WARNING_DEFINITIONS, type AlertWarningDefinition, type AlertWarningKey } from '@/types/alert-warning';

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

// 缩放比例
const scale = ref(1);

// 内容区样式（使用 computed 动态计算）
const contentStyle = computed(() => ({
  width: `${DESIGN_WIDTH}px`,
  height: `${DESIGN_HEIGHT}px`,
  transform: `translate(-50%, -50%) scale(${scale.value})`,
}));

// 主题 store
const themeStore = useThemeStore();
const { bgEnabled, bgMaskOpacity, theme } = storeToRefs(themeStore);
const videoMonitorStore = useVideoMonitorStore();
const {
  captureAlertKey,
  captureErrorMessage,
  captureImageUrl,
  captureStatus,
} = storeToRefs(videoMonitorStore);
const router = useRouter();

const activeAlert = ref<AlertWarningDefinition | null>(null);
const alarmAudio = ref<HTMLAudioElement | null>(null);

/** 背景图层样式：铺满视口，不受 scale 缩放影响 */
const bgStyle = computed(() => ({
  backgroundImage: bgEnabled.value
    ? `url(/image/background/${theme.value === 'blue' ? 'blue-Background.png' : 'green_background.png'})`
    : 'none',
}));

/** 蒙版层样式：使用高斯模糊 */
const maskStyle = computed(() => ({
  backdropFilter: bgEnabled.value ? `blur(${bgMaskOpacity.value}px)` : 'none',
  WebkitBackdropFilter: bgEnabled.value ? `blur(${bgMaskOpacity.value}px)` : 'none',
}));

/**
 * 计算缩放比例并应用
 */
const updateScale = () => {
  const clientWidth = window.innerWidth;
  const clientHeight = window.innerHeight;

  const scaleX = clientWidth / DESIGN_WIDTH;
  const scaleY = clientHeight / DESIGN_HEIGHT;

  // 取较小值确保完整显示不溢出
  scale.value = Math.min(scaleX, scaleY);
};

// 缩放防抖定时器
let resizeTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 窗口尺寸变化处理（防抖）
 */
const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    updateScale();
  }, 100);
};

function isAlertWarningKey(value: string): value is `${AlertWarningKey}` {
  return value === '1' || value === '2' || value === '3' || value === '4' || value === '5';
}

function playAlarmSound(): void {
  const audio = alarmAudio.value;
  if (!audio) return;

  audio.currentTime = 0;
  void audio.play().catch(() => {
    // Browsers may reject playback outside a user gesture; visual warning remains available.
  });
}

function stopAlarmSound(): void {
  const audio = alarmAudio.value;
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
}

function openAlert(key: AlertWarningKey): void {
  activeAlert.value = ALERT_WARNING_DEFINITIONS[key];
  if (key === 1 || key === 4) {
    videoMonitorStore.requestRobotCapture(key);
  } else {
    videoMonitorStore.clearRobotCapture();
  }
  playAlarmSound();
}

function closeAlert(): void {
  activeAlert.value = null;
  stopAlarmSound();
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && activeAlert.value) {
    event.preventDefault();
    closeAlert();
    return;
  }

  if (!isAlertWarningKey(event.key)) return;

  const target = event.target as HTMLElement | null;
  if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;

  event.preventDefault();
  openAlert(Number(event.key) as AlertWarningKey);
}

function viewAlertDetail(): void {
  closeAlert();
  if (router.currentRoute.value.path !== '/storage/monitor') {
    void router.replace('/storage/monitor');
  }
}

onMounted(() => {
  updateScale();
  window.addEventListener('resize', handleResize);
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeydown);
  stopAlarmSound();
  if (resizeTimer) clearTimeout(resizeTimer);
});
</script>

<template>
  <!-- 主题背景图层：绝对定位铺满视口，不受缩放影响 -->
  <div class="theme-bg" :style="bgStyle" aria-hidden="true"></div>

  <!-- 高斯模糊蒙版层：覆盖在背景上，内容之下 -->
  <div class="theme-mask" :style="maskStyle" aria-hidden="true"></div>

  <!-- 大屏适配内容层 -->
  <div class="app-wrapper">
    <div
      class="app-content"
      :class="`app-content--${theme}`"
      :style="contentStyle"
    >
      <router-view />
      <audio ref="alarmAudio" loop preload="auto">
        <source src="/assets/alarm/警报器.mp3" type="audio/mpeg" />
      </audio>
    </div>
  </div>

  <AlertWarningDialog
    :visible="activeAlert !== null"
    :alert="activeAlert"
    :capture-status="captureAlertKey === activeAlert?.key ? captureStatus : 'idle'"
    :capture-image-url="captureAlertKey === activeAlert?.key ? captureImageUrl : null"
    :capture-error-message="captureAlertKey === activeAlert?.key ? captureErrorMessage : null"
    @close="closeAlert"
    @view="viewAlertDetail"
  />
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

/* 主题背景：固定定位避开 scale 变换的影响 */
.theme-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-color: $bg-page;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  pointer-events: none;
}

/* 高斯模糊蒙版：通过 backdrop-filter 作用于其下方的背景 */
.theme-mask {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse at center,
      transparent 54%,
      color-mix(in srgb, var(--bg-page) 22%, transparent) 76%,
      color-mix(in srgb, var(--bg-page) 46%, transparent) 100%
    );
}

/* 大屏适配内容层 */
.app-wrapper {
  position: relative;
  z-index: 2;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}

.app-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center center;
  pointer-events: auto;
  /* 背景只从模块间隙与中央舞台透出，实体卡片继续承担信息可读性。 */
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--bg-page) var(--stage-edge-opacity), transparent) 0%,
      transparent 20%,
      transparent 80%,
      color-mix(in srgb, var(--bg-page) var(--stage-edge-opacity), transparent) 100%
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--bg-page) var(--stage-top-opacity), transparent) 0%,
      color-mix(in srgb, var(--bg-page) var(--stage-mid-opacity), transparent) 32%,
      color-mix(in srgb, var(--bg-page-2) var(--stage-mid-opacity), transparent) 72%,
      color-mix(in srgb, var(--bg-page-2) var(--stage-bottom-opacity), transparent) 100%
    );
  // 仅在主画布自身增加边界，不改变 1920×1080 的外部尺寸（全局 box-sizing 为 border-box）。
  border: 1px solid color-mix(in srgb, var(--primary) 20%, var(--border-default));
  border-radius: 2px;
  box-shadow:
    0 0 24px color-mix(in srgb, var(--primary) 6%, transparent),
    inset 0 0 14px color-mix(in srgb, var(--primary) 3%, transparent);
  animation: app-content-edge-breathe 10s ease-in-out infinite alternate;
}

.app-content--blue {
  --stage-top-opacity: 72%;
  --stage-mid-opacity: 24%;
  --stage-bottom-opacity: 42%;
  --stage-edge-opacity: 38%;
}

.app-content--green {
  --stage-top-opacity: 80%;
  --stage-mid-opacity: 42%;
  --stage-bottom-opacity: 58%;
  --stage-edge-opacity: 52%;
}

@keyframes app-content-edge-breathe {
  0% {
    border-color: color-mix(in srgb, var(--primary) 16%, var(--border-default));
    box-shadow:
      0 0 20px color-mix(in srgb, var(--primary) 4%, transparent),
      inset 0 0 12px color-mix(in srgb, var(--primary) 2%, transparent);
  }

  100% {
    border-color: color-mix(in srgb, var(--primary) 26%, var(--border-default));
    box-shadow:
      0 0 28px color-mix(in srgb, var(--primary) 8%, transparent),
      inset 0 0 18px color-mix(in srgb, var(--primary) 4%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-content {
    animation: none;
  }
}
</style>
