<script setup lang="ts">
import { computed } from 'vue';
import AlertWarningVisual from '@/components/common/AlertWarningVisual.vue';
import type { AlertWarningDefinition } from '@/types/alert-warning';
import type { RobotCaptureStatus } from '@/store/modules/video-monitor';

defineOptions({ name: 'AlertWarningDialog' });

const props = defineProps<{
  visible: boolean;
  alert: AlertWarningDefinition | null;
  captureStatus: RobotCaptureStatus;
  captureImageUrl: string | null;
  captureErrorMessage: string | null;
}>();

const emit = defineEmits<{
  close: [];
  view: [];
}>();

const dialogStyle = computed(() => ({
  '--alert-accent': props.alert?.accent ?? '#2E92FF',
  '--alert-surface': props.alert?.surface ?? '#0A243F',
}));

const hasDiagnosticVisual = computed(() => {
  const key = props.alert?.key;
  return key === 2 || key === 3 || key === 5;
});

function close(): void {
  emit('close');
}

function onOverlayClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) close();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="alert-warning-dialog">
      <section
        v-if="visible && alert"
        class="alert-warning-dialog"
        :style="dialogStyle"
        role="presentation"
        @click="onOverlayClick"
      >
        <div class="alert-warning-dialog__edge" aria-hidden="true"></div>
        <article
          class="alert-warning-dialog__panel"
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="`alert-warning-title-${alert.key}`"
          :aria-describedby="`alert-warning-description-${alert.key}`"
        >
          <header class="alert-warning-dialog__header">
            <div class="alert-warning-dialog__heading">
              <div class="alert-warning-dialog__mark" aria-hidden="true">
                <span class="alert-warning-dialog__mark-core"></span>
              </div>
              <div>
                <h2 :id="`alert-warning-title-${alert.key}`">{{ alert.title }}</h2>
                <p>{{ alert.subtitle }}</p>
              </div>
            </div>

            <div class="alert-warning-dialog__header-actions">
              <time>{{ new Date().toLocaleTimeString('zh-CN', { hour12: false }) }}</time>
              <span class="alert-warning-dialog__severity">{{ alert.severity }}</span>
              <button type="button" class="alert-warning-dialog__close" aria-label="关闭报警" @click="close">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <div class="alert-warning-dialog__content">
            <section class="alert-warning-dialog__camera" :aria-label="hasDiagnosticVisual ? '报警监测数据图示' : '报警画面'">
              <span v-if="!hasDiagnosticVisual" class="alert-warning-dialog__camera-label">{{ alert.sourceLabel }}</span>
              <img
                v-if="captureImageUrl"
                class="alert-warning-dialog__camera-image"
                :src="captureImageUrl"
                alt="机器人监控告警抓拍"
              />
              <AlertWarningVisual v-else-if="hasDiagnosticVisual" :alert="alert" />
              <div v-else class="alert-warning-dialog__camera-placeholder">
                <span class="alert-warning-dialog__camera-corner alert-warning-dialog__camera-corner--top-left"></span>
                <span class="alert-warning-dialog__camera-corner alert-warning-dialog__camera-corner--bottom-right"></span>
                <div>
                  <span class="alert-warning-dialog__camera-dot"></span>
                  <strong>{{ captureStatus === 'pending' ? '正在抓拍机器人监控画面' : captureStatus === 'error' ? '报警画面抓拍失败' : '报警画面待接入' }}</strong>
                  <p>{{ captureStatus === 'pending' ? '正在切换机器人监控并保存当前画面' : captureErrorMessage ?? '当前阶段仅展示告警信息' }}</p>
                </div>
              </div>
            </section>

            <section class="alert-warning-dialog__details" aria-label="报警详情">
              <div class="alert-warning-dialog__primary-metric">
                <span>{{ alert.primaryMetric.label }}</span>
                <strong>{{ alert.primaryMetric.value }}</strong>
              </div>
              <dl class="alert-warning-dialog__metrics">
                <div v-for="metric in alert.metrics" :key="metric.label" class="alert-warning-dialog__metric">
                  <dt>{{ metric.label }}</dt>
                  <dd :class="{ 'alert-warning-dialog__metric-value--emphasis': metric.emphasis }">{{ metric.value }}</dd>
                </div>
              </dl>
            </section>
          </div>

          <footer class="alert-warning-dialog__footer">
            <p :id="`alert-warning-description-${alert.key}`">
              <span class="alert-warning-dialog__notice-icon" aria-hidden="true"></span>
              <strong>告警说明：</strong>{{ alert.description }}
            </p>
            <div class="alert-warning-dialog__footer-actions">
              <button type="button" class="alert-warning-dialog__button alert-warning-dialog__button--secondary" @click="close">关闭</button>
              <button type="button" class="alert-warning-dialog__button alert-warning-dialog__button--primary" @click="emit('view')">前往查看</button>
            </div>
          </footer>
        </article>
      </section>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.alert-warning-dialog {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 42px;
  background: rgba(1, 9, 15, .48);
  backdrop-filter: blur(2px);
}

.alert-warning-dialog__edge {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border: 3px solid color-mix(in srgb, var(--alert-accent) 46%, transparent);
  box-shadow: inset 0 0 42px color-mix(in srgb, var(--alert-accent) 38%, transparent), 0 0 54px color-mix(in srgb, var(--alert-accent) 28%, transparent);
  animation: alert-warning-edge-pulse .72s cubic-bezier(.2, .8, .2, 1) infinite alternate;
}

.alert-warning-dialog__panel {
  position: relative;
  width: min(1080px, 100%);
  padding: 26px 28px 22px;
  overflow: hidden;
  color: #f2f5f7;
  background: linear-gradient(135deg, color-mix(in srgb, var(--alert-surface) 70%, #07121b) 0%, #071018 57%, color-mix(in srgb, var(--alert-surface) 42%, #071018) 100%);
  border: 1px solid color-mix(in srgb, var(--alert-accent) 86%, #ffffff 14%);
  border-radius: 20px;
  box-shadow: 0 18px 54px rgba(0, 0, 0, .54), 0 0 30px color-mix(in srgb, var(--alert-accent) 18%, transparent), inset 0 1px color-mix(in srgb, #fff 16%, transparent);
}

.alert-warning-dialog__panel::before {
  position: absolute;
  top: 0;
  left: 50%;
  width: 170px;
  height: 3px;
  content: '';
  background: var(--alert-accent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--alert-accent) 70%, transparent);
  transform: translateX(-50%);
}

.alert-warning-dialog__header,
.alert-warning-dialog__footer,
.alert-warning-dialog__heading,
.alert-warning-dialog__header-actions,
.alert-warning-dialog__footer-actions {
  display: flex;
  align-items: center;
}

.alert-warning-dialog__header { justify-content: space-between; gap: 20px; margin-bottom: 18px; }
.alert-warning-dialog__heading { gap: 18px; min-width: 0; }

.alert-warning-dialog__mark {
  display: grid;
  width: 68px;
  height: 68px;
  flex: 0 0 auto;
  place-items: center;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  transform: none;
}

.alert-warning-dialog__mark-core,
.alert-warning-dialog__notice-icon {
  display: block;
  background: var(--alert-accent);
  mask: url('/assets/alarm/triangle-alert.svg') center / contain no-repeat;
}

.alert-warning-dialog__mark-core { width: 42px; height: 42px; }
.alert-warning-dialog__heading h2 { margin: 0; font-size: 27px; font-weight: 600; letter-spacing: .03em; }
.alert-warning-dialog__heading p { margin: 6px 0 0; color: rgba(230, 236, 240, .7); font-size: 16px; }

.alert-warning-dialog__header-actions { gap: 16px; color: rgba(230, 236, 240, .68); font-size: 18px; font-variant-numeric: tabular-nums; }
.alert-warning-dialog__severity { padding: 7px 13px; color: var(--alert-accent); font-size: 20px; font-weight: 600; background: color-mix(in srgb, var(--alert-accent) 12%, transparent); border: 1px solid color-mix(in srgb, var(--alert-accent) 74%, transparent); border-radius: 6px; }

.alert-warning-dialog__close { display: grid; width: 42px; height: 42px; place-items: center; color: #f7f9fa; border: 1px solid transparent; border-radius: 4px; transition: color $transition-fast, background-color $transition-fast; }
.alert-warning-dialog__close:hover, .alert-warning-dialog__close:focus-visible { color: var(--alert-accent); background: color-mix(in srgb, var(--alert-accent) 12%, transparent); }
.alert-warning-dialog__close svg { width: 32px; height: 32px; stroke: currentColor; stroke-linecap: round; stroke-width: 1.6; }

.alert-warning-dialog__content { display: grid; grid-template-columns: minmax(0, 1.12fr) minmax(345px, .88fr); min-height: 300px; overflow: hidden; border: 1px solid rgba(205, 220, 228, .2); border-radius: 12px; }
.alert-warning-dialog__camera { position: relative; min-height: 300px; padding: 22px; background: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--alert-accent) 14%, transparent), transparent 58%), linear-gradient(135deg, #0b1821, #060b10); border-right: 1px solid rgba(205, 220, 228, .16); }
.alert-warning-dialog__camera-label { position: relative; z-index: 1; display: inline-flex; padding: 7px 12px; color: var(--alert-accent); font-size: 16px; font-weight: 600; background: color-mix(in srgb, var(--alert-accent) 12%, transparent); border: 1px solid color-mix(in srgb, var(--alert-accent) 40%, transparent); border-radius: 4px; }
.alert-warning-dialog__camera-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: #05090d; }
.alert-warning-dialog__camera-placeholder { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; background-image: linear-gradient(color-mix(in srgb, var(--alert-accent) 8%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--alert-accent) 8%, transparent) 1px, transparent 1px); background-size: 32px 32px; }
.alert-warning-dialog__camera-placeholder strong { display: block; color: rgba(245, 248, 249, .86); font-size: 19px; font-weight: 500; }
.alert-warning-dialog__camera-placeholder p { margin: 9px 0 0; color: rgba(205, 219, 226, .56); font-size: 14px; }
.alert-warning-dialog__camera-dot { display: block; width: 11px; height: 11px; margin: 0 auto 15px; background: var(--alert-accent); border-radius: 50%; box-shadow: 0 0 14px var(--alert-accent); animation: alert-warning-dot-pulse 1.2s ease-in-out infinite; }
.alert-warning-dialog__camera-corner { position: absolute; width: 46px; height: 46px; border-color: var(--alert-accent); border-style: solid; opacity: .8; }
.alert-warning-dialog__camera-corner--top-left { top: 29%; left: 32%; border-width: 2px 0 0 2px; }
.alert-warning-dialog__camera-corner--bottom-right { right: 32%; bottom: 29%; border-width: 0 2px 2px 0; }

.alert-warning-dialog__details { padding: 21px 25px; }
.alert-warning-dialog__primary-metric { display: flex; align-items: flex-end; justify-content: space-between; padding-bottom: 18px; border-bottom: 1px dashed rgba(205, 220, 228, .2); }
.alert-warning-dialog__primary-metric span, .alert-warning-dialog__metric dt { color: rgba(225, 233, 237, .68); font-size: 16px; }
.alert-warning-dialog__primary-metric strong { color: var(--alert-accent); font-size: 35px; font-weight: 600; font-variant-numeric: tabular-nums; }
.alert-warning-dialog__metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 0; }
.alert-warning-dialog__metric { min-height: 82px; padding: 14px 16px 11px 0; border-bottom: 1px dashed rgba(205, 220, 228, .2); }
.alert-warning-dialog__metric:nth-child(odd) { border-right: 1px solid rgba(205, 220, 228, .12); }
.alert-warning-dialog__metric:nth-child(even) { padding-left: 20px; }
.alert-warning-dialog__metric:nth-child(n + 3) { border-bottom: 0; }
.alert-warning-dialog__metric dt { margin-bottom: 8px; }
.alert-warning-dialog__metric dd { margin: 0; color: #f2f5f7; font-size: 19px; font-weight: 500; line-height: 1.2; word-break: break-all; }
.alert-warning-dialog__metric-value--emphasis { color: var(--alert-accent) !important; }

.alert-warning-dialog__footer { justify-content: space-between; gap: 20px; margin-top: 14px; }
.alert-warning-dialog__footer p { display: flex; max-width: 650px; align-items: flex-start; gap: 9px; margin: 0; padding: 12px 15px; color: rgba(232, 237, 240, .8); font-size: 15px; line-height: 1.6; background: color-mix(in srgb, var(--alert-surface) 46%, transparent); border: 1px solid color-mix(in srgb, var(--alert-accent) 26%, transparent); border-radius: 10px; }
.alert-warning-dialog__footer p strong { flex: 0 0 auto; color: var(--alert-accent); }
.alert-warning-dialog__notice-icon { width: 24px; height: 24px; flex: 0 0 auto; margin-top: 1px; }
.alert-warning-dialog__footer-actions { gap: 16px; flex: 0 0 auto; }
.alert-warning-dialog__button { min-width: 142px; padding: 12px 22px; color: #f5f7f8; font-size: 19px; font-weight: 500; border: 1px solid rgba(225, 233, 237, .54); border-radius: 7px; transition: background-color $transition-fast, border-color $transition-fast, color $transition-fast, transform $transition-fast; }
.alert-warning-dialog__button:hover, .alert-warning-dialog__button:focus-visible { transform: translateY(-1px); }
.alert-warning-dialog__button--primary { color: #101316; background: var(--alert-accent); border-color: var(--alert-accent); box-shadow: 0 0 18px color-mix(in srgb, var(--alert-accent) 34%, transparent); }
.alert-warning-dialog__button--secondary:hover, .alert-warning-dialog__button--secondary:focus-visible { color: var(--alert-accent); border-color: var(--alert-accent); background: color-mix(in srgb, var(--alert-accent) 8%, transparent); }

.alert-warning-dialog-enter-active, .alert-warning-dialog-leave-active { transition: opacity 180ms ease; }
.alert-warning-dialog-enter-active .alert-warning-dialog__panel, .alert-warning-dialog-leave-active .alert-warning-dialog__panel { transition: opacity 180ms ease, transform 220ms cubic-bezier(.2, .8, .2, 1); }
.alert-warning-dialog-enter-from, .alert-warning-dialog-leave-to { opacity: 0; }
.alert-warning-dialog-enter-from .alert-warning-dialog__panel, .alert-warning-dialog-leave-to .alert-warning-dialog__panel { opacity: 0; transform: translateY(10px) scale(.985); }

@keyframes alert-warning-edge-pulse { from { opacity: .42; } to { opacity: 1; } }
@keyframes alert-warning-dot-pulse { 0%, 100% { opacity: .45; transform: scale(.8); } 50% { opacity: 1; transform: scale(1.18); } }

@media (max-width: 1040px) {
  .alert-warning-dialog { padding: 24px; }
  .alert-warning-dialog__panel { padding: 22px; }
  .alert-warning-dialog__content { grid-template-columns: 1fr; }
  .alert-warning-dialog__camera { min-height: 180px; border-right: 0; border-bottom: 1px solid rgba(205, 220, 228, .16); }
  .alert-warning-dialog__footer { align-items: flex-end; }
}

@media (prefers-reduced-motion: reduce) {
  .alert-warning-dialog__edge, .alert-warning-dialog__camera-dot { animation: none; }
}
</style>
