<script setup lang="ts">
import { computed } from 'vue';
import type { AlertWarningDefinition } from '@/types/alert-warning';

defineOptions({ name: 'AlertWarningVisual' });

const props = defineProps<{
  alert: AlertWarningDefinition;
}>();

const isOutsideTemperature = computed(() => props.alert.key === 2);
const isInsectWarning = computed(() => props.alert.key === 3);
const isTemperatureHumidity = computed(() => props.alert.key === 5);
</script>

<template>
  <figure class="alert-warning-visual" :class="`alert-warning-visual--${alert.key}`">
    <figcaption class="alert-warning-visual__caption">
      <span>{{ alert.sourceLabel }}</span>
      <small>实时数据</small>
    </figcaption>

    <template v-if="isOutsideTemperature">
      <div class="alert-warning-visual__weather" aria-label="仓外温度数据图示">
        <svg class="alert-warning-visual__thermometer" viewBox="0 0 92 168" fill="none" aria-hidden="true">
          <path d="M46 14a16 16 0 0 0-16 16v74.4a32 32 0 1 0 32 0V30a16 16 0 0 0-16-16Z" stroke="currentColor" stroke-width="4" />
          <path d="M46 46v78" stroke="currentColor" stroke-width="10" stroke-linecap="round" />
          <circle cx="46" cy="136" r="17" fill="currentColor" />
          <path d="M66 37h11M66 66h11M66 95h11" stroke="currentColor" stroke-width="2" opacity=".56" />
        </svg>
        <div class="alert-warning-visual__weather-reading">
          <strong>{{ alert.primaryMetric.value }}</strong>
          <span>{{ alert.metrics[0]?.value }} 较快升温</span>
          <div class="alert-warning-visual__threshold-line">
            <i></i>
            <span>{{ alert.metrics[2]?.label }} {{ alert.metrics[2]?.value }}</span>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="isInsectWarning">
      <div class="alert-warning-visual__insect" aria-label="虫情监测数据图示">
        <svg class="alert-warning-visual__bug" viewBox="0 0 124 124" fill="none" aria-hidden="true">
          <path d="M62 35c-17 0-27 14-27 34 0 15 10 28 27 28s27-13 27-28c0-20-10-34-27-34Z" stroke="currentColor" stroke-width="5" />
          <circle cx="62" cy="25" r="10" stroke="currentColor" stroke-width="5" />
          <path d="M44 50 25 39M43 68 20 68M45 85 25 97M80 50l19-11M81 68h23M79 85l20 12M55 42v47M69 42v47" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
        </svg>
        <div class="alert-warning-visual__insect-reading">
          <strong>{{ alert.primaryMetric.value }}</strong>
          <span>{{ alert.metrics[3]?.value }} 监测结果</span>
          <div class="alert-warning-visual__insect-scale" aria-hidden="true">
            <i v-for="index in 6" :key="index" :class="{ 'is-active': index <= 5 }"></i>
          </div>
          <small>{{ alert.metrics[0]?.label }} {{ alert.metrics[0]?.value }}</small>
          <small>{{ alert.metrics[1]?.value }} · {{ alert.metrics[2]?.label }}{{ alert.metrics[2]?.value }}</small>
        </div>
      </div>
    </template>

    <template v-else-if="isTemperatureHumidity">
      <div class="alert-warning-visual__temperature-humidity" aria-label="温湿度数据图示">
        <div class="alert-warning-visual__sensor-readout">
          <svg viewBox="0 0 74 104" fill="none" aria-hidden="true">
            <path d="M37 9a12 12 0 0 0-12 12v43.5a24 24 0 1 0 24 0V21A12 12 0 0 0 37 9Z" stroke="currentColor" stroke-width="4" />
            <path d="M37 34v43" stroke="currentColor" stroke-width="8" stroke-linecap="round" />
            <circle cx="37" cy="83" r="13" fill="currentColor" />
          </svg>
          <div><span>温度</span><strong>{{ alert.primaryMetric.value }}</strong></div>
        </div>
        <div class="alert-warning-visual__sensor-readout">
          <svg viewBox="0 0 84 104" fill="none" aria-hidden="true">
            <path d="M42 10C31 28 19 42 19 62a23 23 0 1 0 46 0C65 42 53 28 42 10Z" stroke="currentColor" stroke-width="4" />
            <path d="M31 67c3 8 10 12 18 12" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".7" />
          </svg>
          <div><span>湿度</span><strong>{{ alert.metrics[1]?.value }}</strong></div>
        </div>
      </div>
      <div class="alert-warning-visual__dual-status">
        <span>温度阈值 {{ alert.metrics[0]?.value }}</span>
        <span>湿度阈值 {{ alert.metrics[2]?.value }}</span>
      </div>
    </template>
  </figure>
</template>

<style scoped lang="scss">
.alert-warning-visual {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0;
  padding: 48px 52px 30px;
  color: var(--alert-accent);
  background-image: linear-gradient(color-mix(in srgb, var(--alert-accent) 7%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--alert-accent) 7%, transparent) 1px, transparent 1px);
  background-size: 30px 30px;
}

.alert-warning-visual::before {
  position: absolute;
  inset: 22px;
  content: '';
  pointer-events: none;
  border: 1px solid color-mix(in srgb, var(--alert-accent) 24%, transparent);
}

.alert-warning-visual__caption {
  position: absolute;
  top: 20px;
  left: 24px;
  display: flex;
  gap: 10px;
  align-items: center;
  color: var(--alert-accent);
  font-size: 14px;
  font-weight: 600;
}

.alert-warning-visual__caption small {
  padding-left: 10px;
  color: rgba(225, 233, 237, .58);
  font-size: 12px;
  font-weight: 400;
  border-left: 1px solid color-mix(in srgb, var(--alert-accent) 40%, transparent);
}

.alert-warning-visual__weather,
.alert-warning-visual__insect,
.alert-warning-visual__temperature-humidity {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 34px;
}

.alert-warning-visual__thermometer { width: 94px; height: 168px; filter: drop-shadow(0 0 8px color-mix(in srgb, currentColor 32%, transparent)); }
.alert-warning-visual__weather-reading,
.alert-warning-visual__insect-reading { display: flex; flex-direction: column; gap: 7px; }
.alert-warning-visual__weather-reading strong,
.alert-warning-visual__insect-reading strong { font-size: 39px; font-weight: 600; font-variant-numeric: tabular-nums; line-height: 1; }
.alert-warning-visual__weather-reading > span,
.alert-warning-visual__insect-reading > span { color: rgba(232, 238, 241, .74); font-size: 15px; }
.alert-warning-visual__threshold-line { display: flex; gap: 9px; align-items: center; margin-top: 9px; color: rgba(232, 238, 241, .57); font-size: 13px; }
.alert-warning-visual__threshold-line i { display: block; width: 52px; height: 2px; background: currentColor; box-shadow: 0 0 7px currentColor; }

.alert-warning-visual__bug { width: 128px; height: 128px; filter: drop-shadow(0 0 9px color-mix(in srgb, currentColor 28%, transparent)); }
.alert-warning-visual__insect-scale { display: flex; gap: 4px; margin-top: 8px; }
.alert-warning-visual__insect-scale i { width: 21px; height: 6px; background: color-mix(in srgb, currentColor 18%, transparent); border: 1px solid color-mix(in srgb, currentColor 36%, transparent); }
.alert-warning-visual__insect-scale i.is-active { background: currentColor; box-shadow: 0 0 6px color-mix(in srgb, currentColor 42%, transparent); }
.alert-warning-visual__insect-reading small { color: rgba(232, 238, 241, .58); font-size: 13px; }

.alert-warning-visual__temperature-humidity { gap: 26px; }
.alert-warning-visual__sensor-readout { display: flex; gap: 12px; align-items: center; min-width: 150px; }
.alert-warning-visual__sensor-readout svg { width: 62px; height: 86px; filter: drop-shadow(0 0 7px color-mix(in srgb, currentColor 25%, transparent)); }
.alert-warning-visual__sensor-readout:nth-child(2) { color: color-mix(in srgb, var(--alert-accent) 68%, #67d8ff); }
.alert-warning-visual__sensor-readout div { display: flex; flex-direction: column; gap: 6px; }
.alert-warning-visual__sensor-readout span { color: rgba(232, 238, 241, .68); font-size: 14px; }
.alert-warning-visual__sensor-readout strong { color: currentColor; font-size: 29px; font-weight: 600; font-variant-numeric: tabular-nums; line-height: 1; }
.alert-warning-visual__dual-status { position: relative; z-index: 1; display: flex; justify-content: center; gap: 24px; margin-top: 24px; color: rgba(232, 238, 241, .62); font-size: 13px; }
.alert-warning-visual__dual-status span { padding: 5px 10px; background: color-mix(in srgb, var(--alert-accent) 7%, transparent); border: 1px solid color-mix(in srgb, var(--alert-accent) 23%, transparent); }

@media (prefers-reduced-motion: reduce) {
  .alert-warning-visual__thermometer,
  .alert-warning-visual__bug,
  .alert-warning-visual__sensor-readout svg { filter: none; }
}
</style>
