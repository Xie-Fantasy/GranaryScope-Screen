<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useThemeStore } from '@/store/modules/theme';
import SettingsDialog from '@/components/common/SettingsDialog.vue';

defineOptions({ name: 'AppHeader' });

interface HeaderModule {
  key: string;
  label: string;
  iconPaths: string[];
  active?: boolean;
  href?: string;
}

const route = useRoute();
const router = useRouter();
const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);

const currentTime = ref(formatTime());
const currentDate = ref(formatDate());
const currentWeek = ref(formatWeek());
let timer: ReturnType<typeof setInterval> | null = null;
const prefersReducedMotion = ref(false);
let motionQuery: MediaQueryList | null = null;

/** 设置弹窗显示状态 */
const showSettings = ref(false);

const modules: HeaderModule[] = [
  { key: 'decision', label: '决策', iconPaths: ['M12 3a9 9 0 1 0 9 9', 'M12 3v9l6 3'] },
  { key: 'risk', label: '风险', iconPaths: ['M12 3 4 6v5c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z', 'm13 8-3 5h3l-2 4 4-6h-3l1-3Z'] },
  { key: 'trade', label: '购销', iconPaths: ['M9 5h6', 'M9 3h6v4H9z', 'M7 5H5v16h14V5h-2', 'M8 11h8M8 15h8'] },
  { key: 'warehouse', label: '仓储', active: true, iconPaths: ['M4 21V8l8-5 8 5v13', 'M8 21v-7h8v7', 'M8 10h.01M12 10h.01M16 10h.01'] },
  { key: 'safety', label: '安全', iconPaths: ['M12 3 4 6v5c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z', 'm8.5 12 2.2 2.2 4.8-5'] },
  { key: 'finance', label: '财税', iconPaths: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'm8 7 4 5 4-5M8.5 13h7M12 12v6'] },
  { key: 'business', label: '业务', iconPaths: ['M4 8h16v12H4z', 'M9 8V5h6v3', 'M4 12h16', 'M10 12v2h4v-2'] },
  { key: 'manage', label: '管理系统', href: 'http://127.0.0.1:18081', iconPaths: ['M4 5h16v11H4z', 'M9 20h6M12 16v4', 'M8 9h8M8 12h5'] },
  { key: 'digital-human', label: '数字人', href: 'http://127.0.0.1:8020', iconPaths: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M3 21v-2a6 6 0 0 1 12 0v2', 'm18 5 .7 1.3L20 7l-1.3.7L18 9l-.7-1.3L16 7l1.3-.7L18 5Z'] },
  { key: 'vision-inspection', label: '视觉检测', iconPaths: ['M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'] },
];

const subPages = [
  { name: 'Intelligent', path: '/storage/intelligent' },
  { name: 'Monitor', path: '/storage/monitor' },
];

const pageTitle = computed(() => (route.meta.title as string | undefined) ?? '粮情检测数据看板');
const currentSubPageIndex = computed(() => subPages.findIndex(page => page.path === route.path));
const nextPageLabel = computed(() => currentSubPageIndex.value === 0 ? '粮情检测看板' : '仓储智能化');

function formatTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

function formatDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatWeek(): string {
  return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][new Date().getDay()];
}

function toggleSubPage(): void {
  const currentIndex = currentSubPageIndex.value >= 0 ? currentSubPageIndex.value : 0;
  const nextIndex = (currentIndex + 1) % subPages.length;
  const nextPath = subPages[nextIndex].path;
  if (nextPath !== route.path) {
    void router.replace(nextPath);
  }
}

function openSettings(): void {
  showSettings.value = true;
}

function syncMotionPreference(event?: MediaQueryListEvent): void {
  prefersReducedMotion.value = event?.matches ?? motionQuery?.matches ?? false;
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  syncMotionPreference();
  motionQuery.addEventListener('change', syncMotionPreference);

  timer = setInterval(() => {
    currentTime.value = formatTime();
    currentDate.value = formatDate();
    currentWeek.value = formatWeek();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  timer = null;
  motionQuery?.removeEventListener('change', syncMotionPreference);
  motionQuery = null;
});
</script>

<template>
  <header class="app-header" :class="{ 'app-header--green': theme === 'green' }">
    <!-- Header 背景图层：绿色主题使用 demo1 同构的 SVG 动画边框 -->
    <div class="app-header__bg" :class="{ 'app-header__bg--green': theme === 'green' }" aria-hidden="true">
      <svg
        v-if="theme === 'green'"
        class="app-header__frame"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1920 90"
        preserveAspectRatio="none"
        role="presentation"
      >
        <defs>
          <radialGradient id="app-header-frame-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--primary)" stop-opacity="1" />
            <stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
          </radialGradient>
          <mask id="app-header-frame-left-mask">
            <circle r="92" cx="0" cy="0" fill="url(#app-header-frame-glow)">
              <animateMotion
                v-if="!prefersReducedMotion"
                class="app-header__frame-motion"
                begin="0s"
                dur="3.2s"
                path="M0,68 L620,68 L670,90 L960,90"
                rotate="auto"
                repeatCount="indefinite"
              />
            </circle>
          </mask>
          <mask id="app-header-frame-right-mask">
            <circle r="92" cx="0" cy="0" fill="url(#app-header-frame-glow)">
              <animateMotion
                v-if="!prefersReducedMotion"
                class="app-header__frame-motion"
                begin="0s"
                dur="3.2s"
                path="M1920,68 L1300,68 L1250,90 L960,90"
                rotate="auto"
                repeatCount="indefinite"
              />
            </circle>
          </mask>
        </defs>

        <path
          class="app-header__frame-fill"
          d="M0,0 H1920 V68 H1300 L1250,90 H670 L620,68 H0 Z"
        />
        <path
          class="app-header__frame-line"
          d="M0,68 H620 L670,90 H1250 L1300,68 H1920"
        />
        <path
          class="app-header__frame-flow"
          d="M0,68 H620 L670,90 H960"
          mask="url(#app-header-frame-left-mask)"
        />
        <path
          class="app-header__frame-flow"
          d="M1920,68 H1300 L1250,90 H960"
          mask="url(#app-header-frame-right-mask)"
        />
      </svg>
    </div>

    <div class="app-header__time-group" aria-label="当前时间">
      <time class="app-header__time">{{ currentTime }}</time>
      <span class="app-header__date">{{ currentDate }} {{ currentWeek }}</span>
    </div>

    <div class="app-header__heading">
      <div class="app-header__title-row">
        <h1 class="app-header__title">{{ pageTitle }}</h1>
        <button
          type="button"
          class="app-header__page-toggle"
          :aria-label="`切换至${nextPageLabel}`"
          :title="`切换至${nextPageLabel}`"
          @click.stop.prevent="toggleSubPage"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m8 8-4 4 4 4M16 8l4 4-4 4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 左侧模块导航：五项固定环绕中央标题 -->
    <nav class="app-header__modules app-header__modules--left" aria-label="系统模块（左侧）">
      <component
        :is="module.href ? 'a' : 'span'"
        v-for="module in modules.slice(0, 5)"
        :key="module.key"
        class="app-header__module"
        :class="{ 'app-header__module--active': module.active }"
        :href="module.href"
        :target="module.href ? '_blank' : undefined"
        :rel="module.href ? 'noopener noreferrer' : undefined"
        :aria-current="module.active ? 'page' : undefined"
        :aria-disabled="module.href || module.active ? undefined : 'true'"
      >
        <svg v-if="theme === 'green'" class="app-header__module-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path v-for="path in module.iconPaths" :key="path" :d="path" />
        </svg>
        <span class="app-header__module-label">{{ module.label }}</span>
      </component>
    </nav>

    <!-- 右侧模块导航：五项固定环绕中央标题 -->
    <nav class="app-header__modules app-header__modules--right" aria-label="系统模块（右侧）">
      <component
        :is="module.href ? 'a' : 'span'"
        v-for="module in modules.slice(5)"
        :key="module.key"
        class="app-header__module"
        :class="{ 'app-header__module--active': module.active }"
        :href="module.href"
        :target="module.href ? '_blank' : undefined"
        :rel="module.href ? 'noopener noreferrer' : undefined"
        :aria-current="module.active ? 'page' : undefined"
        :aria-disabled="module.href || module.active ? undefined : 'true'"
      >
        <svg v-if="theme === 'green'" class="app-header__module-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path v-for="path in module.iconPaths" :key="path" :d="path" />
        </svg>
        <span class="app-header__module-label">{{ module.label }}</span>
      </component>
    </nav>

    <div class="app-header__right">
      <!-- 设置按钮入口 -->
      <button
        type="button"
        class="app-header__settings-btn"
        aria-label="打开设置"
        title="设置"
        @click="openSettings"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
      </button>
    </div>

    <!-- 设置弹窗 -->
    <SettingsDialog v-model:visible="showSettings" />
  </header>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.app-header {
  position: relative;
  z-index: 10;
  display: flex;
  width: 100%;
  height: $header-height;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-2xl;
  border-bottom: 1px solid var(--border-default);
  overflow: hidden;
}

.app-header--green {
  background: linear-gradient(180deg, color-mix(in srgb, var(--bg-panel) 96%, var(--primary) 4%), var(--bg-panel));
}

.app-header--green::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 22px;
  content: '';
  pointer-events: none;
  background: linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg-panel) 34%, transparent) 58%, transparent 100%);
}

/** 蓝色主题保留现有背景图；绿色主题由内联 SVG 绘制同框动画 */
.app-header__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image: url('/image/header/header-bg-blue.png');
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 100% 100%;
  pointer-events: none;
}

.app-header__bg--green {
  background: var(--bg-panel);
}

.app-header__frame {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.app-header__frame-fill {
  fill: var(--bg-panel);
}

.app-header__frame-line {
  fill: none;
  stroke: var(--border-strong);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.app-header__frame-flow {
  fill: none;
  stroke: var(--primary);
  stroke-width: 2.5;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
  opacity: 0.86;
  animation: app-header-frame-pulse 2.4s ease-in-out infinite;
}

@keyframes app-header-frame-pulse {
  0%,
  100% {
    opacity: 0.62;
  }

  50% {
    opacity: 1;
  }
}

.app-header__time-group {
  display: flex;
  flex-direction: column;
  min-width: 190px;
  position: relative;
  z-index: 1;
}

/* 蓝色主题的时间区只承载两行时间信息，收窄后为左侧导航留出独立轨道。 */
.app-header:not(.app-header--green) .app-header__time-group {
  min-width: 120px;
}

.app-header__time {
  color: var(--text-primary);
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
  line-height: 1.25;
}

.app-header__date {
  margin-top: 2px;
  color: var(--text-tertiary);
  font-size: $font-size-xs;
  line-height: 1.4;
}

.app-header__heading {
  position: absolute;
  z-index: 2;
  left: 50%;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  transform: translateX(-50%);
}

.app-header__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 28px;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.12em;
  line-height: 1.2;
  white-space: nowrap;
}

.app-header:not(.app-header--green) .app-header__title {
  color: color-mix(in srgb, var(--text-primary) 74%, var(--primary) 26%);
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.14em;
  -webkit-text-stroke: 0.2px color-mix(in srgb, var(--primary) 32%, transparent);
  text-shadow:
    0 0 5px color-mix(in srgb, var(--primary) 36%, transparent),
    0 0 14px color-mix(in srgb, var(--primary) 18%, transparent);
}

.app-header__title-row {
  position: relative;
  display: flex;
  align-items: center;
}

.app-header--green .app-header__title {
  color: color-mix(in srgb, var(--text-primary) 78%, var(--primary) 22%);
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: 0.2em;
  line-height: 1.1;
  -webkit-text-stroke: 0.2px color-mix(in srgb, var(--primary) 28%, transparent);
  text-shadow:
    0 0 5px color-mix(in srgb, var(--primary) 28%, transparent),
    0 0 14px color-mix(in srgb, var(--primary) 14%, transparent);
}

.app-header__page-toggle {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: calc(100% + #{$spacing-sm});
  display: inline-flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  border: 1px solid transparent;
  border-radius: $radius-sm;
  transform: translateY(-50%);
  cursor: pointer;
  text-decoration: none;
  pointer-events: auto;
  transition: background-color $transition-fast, border-color $transition-fast, color $transition-fast;

  &:hover,
  &:focus-visible {
    color: var(--primary);
    background: var(--primary-soft);
    border-color: var(--primary-line);
  }

  svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.75;
  }
}

.app-header__right {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  position: relative;
  z-index: 1;
}

/* ---- 模块导航 ---- */
.app-header__modules {
  display: flex;
  position: absolute;
  z-index: 1;
  top: 50%;
  width: 500px;
  align-items: center;
  gap: 4px;
  transform: translateY(-50%);
}

.app-header__modules--left {
  right: calc(50% + 184px);
  justify-content: flex-end;
}

.app-header__modules--right {
  left: calc(50% + 184px);
  justify-content: flex-start;
}

/* 蓝色标题的中轴装饰更宽：导航组向外让出标题安全区，避免压住光带。 */
.app-header:not(.app-header--green) .app-header__modules--left {
  right: calc(50% + 380px);
}

.app-header:not(.app-header--green) .app-header__modules--right {
  left: calc(50% + 380px);
}

/** 蓝色主题保留原有图片按钮；绿色主题使用克制工业 Tab */
.app-header__module {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  height: 36px;
  padding: 0 $spacing-lg;
  color: rgba(255, 255, 255, 0.6);
  font-size: $font-size-sm;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  background: var(--btn-module-default) no-repeat center / 100% 100%;
  border: none;
  position: relative;
  isolation: isolate;
  transition: color $transition-fast, filter $transition-fast;

  &:hover {
    color: rgba(255, 255, 255, 0.9);
    filter: brightness(1.15);
  }

  &--active {
    color: #fff;
    background-image: var(--btn-module-active);
    filter: brightness(1.1);

    /** 选中时的底部高亮指示线 */
    &::after {
      display: none;
    }
  }
}

/* 蓝色图片按钮采用固定轨道，避免长标签撑宽后破坏两侧对称关系。 */
.app-header:not(.app-header--green) .app-header__module {
  flex: 0 0 80px;
  min-width: 80px;
  height: 32px;
  padding: 0 7px;
}

/* 蓝色激活态沿用 houde-orbit 的后置光层结构，但收窄亮度与扩散幅度。 */
.app-header:not(.app-header--green) .app-header__module--active {
  filter: brightness(1.04);
}

.app-header:not(.app-header--green) .app-header__module--active::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  content: '';
  pointer-events: none;
  background: color-mix(in srgb, var(--primary) 34%, transparent);
  border-radius: 32px;
  animation: app-header-menu-active-scale 1.65s ease-out infinite;
}

.app-header__module-label {
  position: relative;
  z-index: 1;
  line-height: 1;
}

.app-header--green .app-header__module {
  flex: 0 0 64px;
  flex-direction: column;
  min-width: 64px;
  height: 56px;
  gap: 3px;
  padding: 4px $spacing-sm 3px;
  color: color-mix(in srgb, var(--text-secondary) 58%, transparent);
  font-size: $font-size-xs;
  font-weight: $font-weight-regular;
  background: transparent;
  border: 1px solid transparent;
  border-radius: $radius-sm;
  transition: color $transition-fast, background-color $transition-fast, border-color $transition-fast;

  &:hover {
    color: color-mix(in srgb, var(--text-primary) 88%, transparent);
    background: color-mix(in srgb, var(--primary) 5%, transparent);
    border-color: color-mix(in srgb, var(--primary) 12%, transparent);
    filter: none;
  }

  &--active {
    color: color-mix(in srgb, var(--text-primary) 94%, var(--primary) 6%);
    background: linear-gradient(180deg, color-mix(in srgb, var(--primary) 16%, transparent), color-mix(in srgb, var(--primary) 4%, transparent));
    border-color: color-mix(in srgb, var(--primary) 30%, transparent);
    box-shadow: inset 0 1px color-mix(in srgb, var(--text-primary) 8%, transparent), 0 0 12px color-mix(in srgb, var(--primary) 8%, transparent);

    &::after {
      position: absolute;
      right: 10px;
      bottom: -5px;
      left: 10px;
      height: 1px;
      content: '';
      background: var(--primary);
      opacity: 0.72;
    }
  }
}

.app-header__module-icon {
  position: relative;
  z-index: 1;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  color: var(--primary);
  opacity: 0.78;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--primary) 26%, transparent));
  transition: opacity $transition-fast, filter $transition-fast;
}

.app-header--green .app-header__module:hover .app-header__module-icon,
.app-header--green .app-header__module--active .app-header__module-icon {
  opacity: 1;
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--primary) 42%, transparent));
}

.app-header--green .app-header__module-label {
  font-size: 11px;
  letter-spacing: 0.04em;
}

@keyframes app-header-menu-active-scale {
  0% {
    opacity: 0.56;
    transform: scale(1);
  }

  48% {
    opacity: 0.32;
    transform: scale(1.03, 1.07);
  }

  100% {
    opacity: 0;
    transform: scale(1.07, 1.12);
  }
}

/* 禁用（非当前模块）按钮的不可点击提示 */
.app-header__module[aria-disabled='true'] {
  cursor: default;
}

/** 设置按钮样式 */
.app-header__settings-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: $spacing-sm;
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
  border-radius: $radius-sm;
  transition: background-color $transition-fast, border-color $transition-fast, color $transition-fast;

  &:hover,
  &:focus-visible {
    color: var(--primary);
    background: var(--primary-soft);
    border-color: var(--primary-line);
  }

  svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.6;
    fill: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-header__frame-flow,
  .app-header:not(.app-header--green) .app-header__module--active::before {
    animation: none;
  }
}
</style>
