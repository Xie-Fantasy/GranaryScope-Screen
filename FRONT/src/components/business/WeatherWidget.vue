<script setup lang="ts">
import { computed, onActivated, onDeactivated, onMounted, onUnmounted, ref, useId } from 'vue';
import PanelHeading from '@/components/common/PanelHeading.vue';
import WeatherIllustration from '@/components/business/WeatherIllustration.vue';
import { getWeatherData } from '@/api/modules/warehouse';
import type { WeatherType } from '@/types';

defineOptions({ name: 'WeatherWidget' });

const widgetId = useId();
const weatherData = ref<WeatherType | null>(null);
const loading = ref(true);
const errorMsg = ref('');
const active = ref(false);
// Presentation-only demo modes; numerical observations still come from API + Mock.
const weatherModes = ['晴转多云', '多云', '下雨', '阴'] as const;
const previewCondition = ref<string | null>(null);
const displayedCondition = computed(() => previewCondition.value ?? weatherData.value?.condition ?? '--');

function handleWeatherKeydown(event: KeyboardEvent): void {
  if (
    !active.value || !weatherData.value || loading.value || errorMsg.value ||
    event.code !== 'Numpad0' || event.repeat || event.isComposing || event.defaultPrevented ||
    event.ctrlKey || event.altKey || event.metaKey || event.shiftKey
  ) return;
  const target = event.target;
  if (target instanceof Element && target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]')) return;
  if (document.querySelector('[role="dialog"], dialog[open]')) return;
  event.preventDefault();
  const currentIndex = weatherModes.findIndex(condition => condition === displayedCondition.value);
  previewCondition.value = weatherModes[(currentIndex + 1) % weatherModes.length] ?? weatherModes[0];
}

function activate(): void {
  active.value = true;
  window.addEventListener('keydown', handleWeatherKeydown);
}

function deactivate(): void {
  active.value = false;
  window.removeEventListener('keydown', handleWeatherKeydown);
}

onActivated(activate);
onDeactivated(deactivate);
onUnmounted(deactivate);

const adviceStates = {
  suitable: { label: '适宜', tone: 'success' },
  caution: { label: '需注意', tone: 'warning' },
  unsuitable: { label: '不适宜', tone: 'danger' },
};
const adviceState = computed(() => {
  const status = weatherData.value?.suggestionStatus;
  return status && Object.hasOwn(adviceStates, status)
    ? adviceStates[status]
    : { label: '待评估', tone: 'offline' };
});

function formatNumber(value: unknown, digits = 0): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : '--';
}

function formatCount(value: unknown): string {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? String(value) : '--';
}

async function fetchData(): Promise<void> {
  loading.value = true;
  errorMsg.value = '';
  try {
    weatherData.value = await getWeatherData() ?? null;
  } catch {
    errorMsg.value = '气象数据加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  activate();
  void fetchData();
});
</script>

<template>
  <section class="weather-widget" :aria-labelledby="widgetId + '-title'" :aria-busy="loading">
    <header class="weather-widget__header">
      <PanelHeading :id="widgetId + '-title'">环境监测</PanelHeading>
      <span class="weather-widget__caption">站点气象数据</span>
    </header>

    <div class="weather-widget__body">
      <div v-if="loading" class="weather-widget__state" role="status">正在获取环境数据</div>
      <div v-else-if="errorMsg" class="weather-widget__state weather-widget__state--error" role="alert">
        <span>{{ errorMsg }}</span>
        <button class="weather-widget__retry" type="button" @click="fetchData">重新获取</button>
      </div>
      <div v-else-if="!weatherData" class="weather-widget__state" role="status">暂无环境数据</div>

      <div v-else class="weather-widget__content">
        <div class="weather-widget__overview">
          <WeatherIllustration :condition="displayedCondition" :active="active" />
          <div class="weather-widget__headline">
            <span class="weather-widget__condition" aria-live="polite">{{ displayedCondition }}</span>
            <div class="weather-widget__temperature">
              <strong>{{ formatNumber(weatherData.temperature, 1) }}</strong><small>°C</small>
            </div>
            <span class="weather-widget__headline-label">室外温度</span>
          </div>
        </div>

        <dl class="weather-widget__grid">
          <div class="weather-widget__metric">
            <dt>
              <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C12 9 6 15 6 21a10 10 0 0 0 20 0c0-6-6-12-10-18Z" /><path d="M11 22c0 4 4 6 7 4" /></svg>
              相对湿度
            </dt>
            <dd>{{ formatNumber(weatherData.humidity) }}<small>%</small></dd>
          </div>
          <div class="weather-widget__metric">
            <dt>
              <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 23a6 6 0 0 1-1-12 8 8 0 0 1 16-2 7 7 0 0 1 1 14ZM9 27l-1 2m8-2-1 2m8-2-1 2" /></svg>
              降雨量
            </dt>
            <dd>{{ formatNumber(weatherData.rainfall, 1) }}<small>mm</small></dd>
          </div>
          <div class="weather-widget__metric">
            <dt>
              <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 11h15a4 4 0 1 0-4-5M2 17h24a4 4 0 1 0-3-7M4 23h15a4 4 0 1 1-3 7" /></svg>
              风速
            </dt>
            <dd>{{ formatNumber(weatherData.windSpeed, 1) }}<small>m/s</small></dd>
          </div>
          <div class="weather-widget__metric weather-widget__metric--wide">
            <dt>
              <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" /><path d="m21 9-3 11-9 4 4-11Z" /></svg>
              风向
            </dt>
            <dd>{{ weatherData.windDirection || '--' }}</dd>
          </div>
          <div class="weather-widget__metric weather-widget__metric--wide">
            <dt>
              <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 27a14 14 0 1 1 20 0M16 5v2M8 8l2 2M4 16h2M24 8l-2 2M26 16h2M7 23l2-1M25 23l-2-1M18 17l5-6" /><circle cx="16" cy="20" r="3" /></svg>
              气压
            </dt>
            <dd>{{ formatNumber(weatherData.pressure) }}<small>hPa</small></dd>
          </div>
        </dl>

        <div class="weather-widget__advice" :class="'weather-widget__advice--' + adviceState.tone">
          <div class="weather-widget__advice-label">
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r="18" />
              <path v-if="adviceState.tone === 'success'" d="m11 20 6 6 13-13" />
              <path v-else d="M20 10v12m0 6v1" />
            </svg>
            <span>作业建议</span>
          </div>
          <div class="weather-widget__advice-detail">
            <strong class="weather-widget__advice-status">{{ adviceState.label }}</strong>
            <p>{{ weatherData.suggestion || '暂无作业建议' }}</p>
          </div>
        </div>

        <section class="weather-widget__plans" :aria-labelledby="widgetId + '-plans'">
          <PanelHeading as="h4" :id="widgetId + '-plans'" class="weather-widget__plans-title">
            计划性检测
          </PanelHeading>
          <dl class="weather-widget__plan-grid">
            <div class="weather-widget__plan">
              <dt>计划总数</dt>
              <dd>共 <strong>{{ formatCount(weatherData.plannedInspections?.total) }}</strong> 个</dd>
            </div>
            <div class="weather-widget__plan">
              <dt>今日执行</dt>
              <dd>今日执行 <strong>{{ formatCount(weatherData.plannedInspections?.today) }}</strong> 个</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.weather-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--primary-line);
  border-radius: $radius-md;
  background:
    radial-gradient(ellipse at 0 0, var(--primary-soft), transparent 52%),
    linear-gradient(135deg, var(--bg-page), color-mix(in srgb, var(--bg-page) 85%, var(--bg-panel)));
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--primary) 5%, transparent);
}

.weather-widget__header {
  @include shell.panel-header;
}

.weather-widget__caption {
  position: absolute;
  right: 2px;
  color: var(--text-tertiary);
  font-size: 11px;
}

.weather-widget__body {
  display: flex;
  flex: 1;
  min-height: 0;
  padding: 10px 12px 12px;
}

.weather-widget__content {
  display: grid;
  flex: 1;
  min-width: 0;
  min-height: 0;
  grid-template-rows: minmax(0, 1.7fr) minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 1.15fr);
  gap: 10px;
}

.weather-widget__overview {
  display: grid;
  grid-template-columns: 37% minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 0 12px 8px;
  border-bottom: 1px solid var(--border-strong);
}


.weather-widget__headline { min-width: 0; }
.weather-widget__condition { color: var(--text-primary); font-size: 16px; }
.weather-widget__headline-label { color: var(--text-tertiary); font-size: 14px; }

.weather-widget__temperature {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 4px 0;
  color: var(--text-primary);
  white-space: nowrap;

  strong {
    font-size: 72px;
    line-height: 1.05;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    letter-spacing: -.035em;
  }

  small { color: var(--text-tertiary); font-size: 22px; }
}

.weather-widget__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 8px;
  min-height: 0;
  margin: 0;
}

.weather-widget__metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  grid-column: span 2;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--border-strong);
  border-radius: $radius-md;
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 4%, transparent), transparent);

  dt {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 13px;
    white-space: nowrap;
  }

  svg {
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
    fill: none;
    stroke: var(--primary);
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  dd {
    margin: 3px 0 0 32px;
    color: var(--text-primary);
    font-size: 26px;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  small {
    margin-left: 5px;
    color: var(--primary);
    font-size: 12px;
    font-weight: 400;
  }

  &--wide { grid-column: span 3; }
}

.weather-widget__advice {
  --advice-tone: var(--success);
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  min-height: 0;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--advice-tone) 32%, transparent);
  border-radius: $radius-md;
  background: linear-gradient(135deg, color-mix(in srgb, var(--advice-tone) 15%, transparent), transparent);
  box-shadow: inset 1px 1px 0 color-mix(in srgb, var(--advice-tone) 52%, transparent);

  &--warning { --advice-tone: var(--warning); }
  &--danger { --advice-tone: var(--danger); }
  &--offline { --advice-tone: var(--offline); }
}

.weather-widget__advice-label {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding-right: 12px;
  border-right: 1px solid color-mix(in srgb, var(--advice-tone) 22%, transparent);
  color: var(--advice-tone);
  font-size: 14px;
  font-weight: 600;

  svg { width: 34px; height: 34px; flex-shrink: 0; }
  circle { fill: var(--advice-tone); }
  path { fill: none; stroke: var(--text-inverse); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
}

.weather-widget__advice-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--advice-tone);
  font-size: 16px;
  font-weight: 600;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }
}

.weather-widget__advice-detail p {
  margin: 6px 0 0;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.weather-widget__plans {
  display: flex;
  min-height: 0;
  flex-direction: column;
  border: 1px solid var(--border-strong);
  border-radius: $radius-md;
  background: linear-gradient(145deg, transparent, color-mix(in srgb, var(--primary) 4%, transparent));
}

.weather-widget__plans-title {
  --panel-heading-size: 16px;
  --panel-heading-wing-width: 44px;
  --panel-heading-wing-height: 10px;
  flex: 0 0 34px;
  border-bottom: 1px solid var(--border-default);
  letter-spacing: .08em;
}

.weather-widget__plan-grid {
  display: grid;
  flex: 1;
  align-items: center;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-height: 0;
  margin: 4px 0;
}

.weather-widget__plan {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  + .weather-widget__plan { border-left: 1px solid var(--border-strong); }
  dt { order: 1; color: var(--text-tertiary); font-size: 12px; }
  dd { display: flex; align-items: baseline; margin: 0; color: var(--text-primary); font-size: 15px; line-height: 1.4; white-space: nowrap; }
  strong { margin: 0 4px; color: var(--primary); font-size: 30px; line-height: 1.4; font-weight: 600; }
}

.weather-widget__state {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  color: var(--text-tertiary);
  font-size: $font-size-sm;
  text-align: center;
}

.weather-widget__state--error { color: var(--danger); }

.weather-widget__retry {
  padding: 3px $spacing-sm;
  color: var(--primary);
  background: transparent;
  border: 1px solid var(--primary-line);
  border-radius: $radius-sm;
  cursor: pointer;
  font: inherit;

  &:hover,
  &:focus-visible { background: var(--primary-soft); }
}
</style>
