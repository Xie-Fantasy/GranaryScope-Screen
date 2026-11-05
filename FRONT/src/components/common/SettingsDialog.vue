<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useThemeStore, type ThemeMode } from '@/store/modules/theme';

defineOptions({ name: 'SettingsDialog' });

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const themeStore = useThemeStore();
const { theme, bgEnabled, bgMaskOpacity } = storeToRefs(themeStore);

function close(): void {
  emit('update:visible', false);
}

function setTheme(nextTheme: ThemeMode): void {
  themeStore.setTheme(nextTheme);
}

function toggleBg(): void {
  themeStore.setBgEnabled(!bgEnabled.value);
}

function onMaskChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  themeStore.setBgMaskOpacity(parseInt(target.value, 10));
}

/** 点击遮罩层关闭 */
function onOverlayClick(event: MouseEvent): void {
  if ((event.target as HTMLElement).classList.contains('settings-dialog__overlay')) {
    close();
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="visible"
        class="settings-dialog__overlay"
        @click="onOverlayClick"
      >
        <div
          class="settings-dialog__panel"
          role="dialog"
          aria-modal="true"
          aria-label="系统设置"
        >
          <!-- 弹窗头部 -->
          <div class="settings-dialog__header">
            <h2 class="settings-dialog__title">系统设置</h2>
            <button
              type="button"
              class="settings-dialog__close"
              aria-label="关闭设置"
              @click="close"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 弹窗内容 -->
          <div class="settings-dialog__body">
            <!-- 主题切换 -->
            <div class="settings-dialog__item">
              <span class="settings-dialog__label">界面主题</span>
              <div class="settings-dialog__theme-switch">
                <button
                  type="button"
                  class="settings-dialog__theme-btn"
                  :class="{ 'settings-dialog__theme-btn--active': theme === 'blue' }"
                  aria-label="蓝色主题"
                  @click="setTheme('blue')"
                >
                  <span class="settings-dialog__theme-dot settings-dialog__theme-dot--blue"></span>
                  蓝色
                </button>
                <button
                  type="button"
                  class="settings-dialog__theme-btn"
                  :class="{ 'settings-dialog__theme-btn--active': theme === 'green' }"
                  aria-label="绿色主题"
                  @click="setTheme('green')"
                >
                  <span class="settings-dialog__theme-dot settings-dialog__theme-dot--green"></span>
                  绿色
                </button>
              </div>
            </div>

            <!-- 背景开关 -->
            <div class="settings-dialog__item">
              <span class="settings-dialog__label">显示背景图</span>
              <button
                type="button"
                class="settings-dialog__toggle"
                :class="{ 'settings-dialog__toggle--on': bgEnabled }"
                role="switch"
                :aria-checked="bgEnabled"
                @click="toggleBg"
              >
                <span class="settings-dialog__toggle-thumb"></span>
              </button>
            </div>

            <!-- 背景蒙版调节（仅在开启背景时可用） -->
            <div
              class="settings-dialog__item"
              :class="{ 'settings-dialog__item--disabled': !bgEnabled }"
            >
              <span class="settings-dialog__label">
                模糊强度
                <small class="settings-dialog__hint">{{ bgMaskOpacity }}px</small>
              </span>
              <div class="settings-dialog__slider-wrapper">
                <svg class="settings-dialog__slider-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
                <input
                  type="range"
                  class="settings-dialog__slider"
                  min="0"
                  max="20"
                  step="1"
                  :value="bgMaskOpacity"
                  :disabled="!bgEnabled"
                  @input="onMaskChange"
                />
                <svg class="settings-dialog__slider-icon settings-dialog__slider-icon--dim" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.settings-dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
}

.settings-dialog__panel {
  display: flex;
  flex-direction: column;
  width: 420px;
  min-height: 280px;
  background: var(--bg-panel-elevated);
  border: 1px solid var(--border-strong);
  border-radius: $radius-lg;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.settings-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-lg $spacing-xl;
  border-bottom: 1px solid var(--border-default);
}

.settings-dialog__title {
  margin: 0;
  color: var(--text-primary);
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.04em;
}

.settings-dialog__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--text-tertiary);
  border-radius: $radius-sm;
  transition: background-color $transition-fast, color $transition-fast;

  &:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }

  svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
    fill: none;
  }
}

.settings-dialog__body {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
  padding: $spacing-xl;
}

.settings-dialog__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-lg;
  transition: opacity $transition-fast;

  &--disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

.settings-dialog__label {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex-shrink: 0;
  color: var(--text-primary);
  font-size: $font-size-sm;
  font-weight: 500;
  min-width: 90px;
}

.settings-dialog__hint {
  color: var(--text-tertiary);
  font-size: $font-size-xs;
  font-weight: 400;
}

/* ---- 主题切换按钮组 ---- */
.settings-dialog__theme-switch {
  display: flex;
  gap: $spacing-sm;
}

.settings-dialog__theme-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  color: var(--text-secondary);
  font-size: $font-size-sm;
  font-family: inherit;
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: $radius-sm;
  cursor: pointer;
  transition: border-color $transition-fast, color $transition-fast, background-color $transition-fast;

  &:hover {
    color: var(--text-primary);
    border-color: var(--primary-line);
  }

  &--active {
    color: var(--primary);
    background: var(--primary-soft);
    border-color: var(--primary-line);
  }
}

.settings-dialog__theme-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;

  &--blue { background: #35BCE3; }
  &--green { background: #35D6AE; }
}

/* ---- 开关按钮 ---- */
.settings-dialog__toggle {
  position: relative;
  width: 44px;
  height: 24px;
  padding: 0;
  background: var(--text-disabled);
  border-radius: 12px;
  cursor: pointer;
  flex-shrink: 0;
  border: none;
  transition: background-color $transition-normal;

  &--on {
    background: var(--primary);
  }
}

.settings-dialog__toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  transition: transform $transition-normal;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);

  .settings-dialog__toggle--on & {
    transform: translateX(20px);
  }
}

/* ---- 滑块 ---- */
.settings-dialog__slider-wrapper {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex: 1;
  max-width: 200px;
}

.settings-dialog__slider-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  stroke: var(--text-tertiary);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
  fill: none;

  &--dim {
    opacity: 0.5;
  }
}

.settings-dialog__slider {
  flex: 1;
  height: 4px;
  background: var(--border-default);
  border-radius: 2px;
  appearance: none;
  cursor: pointer;
  outline: none;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: var(--primary);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    transition: transform $transition-fast;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: var(--primary);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  }
}

/* ---- 过渡动画 ---- */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity $transition-normal;
}

.dialog-fade-enter-active .settings-dialog__panel,
.dialog-fade-leave-active .settings-dialog__panel {
  transition: transform $transition-normal, opacity $transition-normal;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .settings-dialog__panel {
  transform: scale(0.92) translateY(12px);
  opacity: 0;
}

.dialog-fade-leave-to .settings-dialog__panel {
  transform: scale(0.96);
  opacity: 0;
}
</style>
