<script setup lang="ts">
import PanelHeading from '@/components/common/PanelHeading.vue';
import { onMounted, ref } from 'vue';
import { getMonitorIndicator } from '@/api/modules/warehouse';
import FlipNumber from '@/components/common/FlipNumber.vue';
import type { MonitorIndicatorType } from '@/types';

defineOptions({ name: 'IndicatorCard' });

const indicatorData = ref<MonitorIndicatorType | null>(null);
const loading = ref(true);
const errorMsg = ref('');

async function fetchData(): Promise<void> {
  loading.value = true;
  errorMsg.value = '';

  try {
    const data = await getMonitorIndicator();
    indicatorData.value = data ?? null;
  } catch {
    errorMsg.value = '指标数据加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <section class="indicator-card" aria-labelledby="indicator-card-title" :aria-busy="loading">
    <header class="indicator-card__header">
      <PanelHeading id="indicator-card-title">粮情指标</PanelHeading>
      <span class="indicator-card__caption">全库监测概览</span>
    </header>

    <div class="indicator-card__body">
      <div v-if="loading" class="indicator-card__state">
        <span class="indicator-card__state-mark" aria-hidden="true"></span>
        <span>正在获取指标数据</span>
      </div>

      <div v-else-if="errorMsg" class="indicator-card__state indicator-card__state--error" role="alert">
        <span>{{ errorMsg }}</span>
        <button class="indicator-card__retry" type="button" @click="fetchData">重新获取</button>
      </div>

      <div v-else-if="!indicatorData" class="indicator-card__state">暂无粮情指标数据</div>

      <dl v-else class="indicator-card__grid">
        <div class="indicator-card__metric indicator-card__metric--warning">
          <dt class="indicator-card__label">最高仓温</dt>
          <dd class="indicator-card__value">
            <FlipNumber :value="indicatorData.maxWarehouseTemp.value.toFixed(1)" variant="neon" /><span class="indicator-card__unit">°C</span>
          </dd>
          <span class="indicator-card__meta">{{ indicatorData.maxWarehouseTemp.warehouseId }}</span>
        </div>

        <div class="indicator-card__metric indicator-card__metric--danger">
          <dt class="indicator-card__label">最高粮温</dt>
          <dd class="indicator-card__value">
            <FlipNumber :value="indicatorData.maxGrainTemp.value.toFixed(1)" variant="neon" /><span class="indicator-card__unit">°C</span>
          </dd>
          <span class="indicator-card__meta">{{ indicatorData.maxGrainTemp.warehouseId }}</span>
        </div>

        <div class="indicator-card__metric indicator-card__metric--info">
          <dt class="indicator-card__label">测温总点数</dt>
          <dd class="indicator-card__value"><FlipNumber :value="indicatorData.totalPoints.toLocaleString()" variant="neon" /></dd>
          <span class="indicator-card__meta">全库覆盖</span>
        </div>

        <div class="indicator-card__metric indicator-card__metric--danger">
          <dt class="indicator-card__label">三日报警点数</dt>
          <dd class="indicator-card__value"><FlipNumber :value="indicatorData.alarmPoints3Days.toLocaleString()" variant="neon" /></dd>
          <span class="indicator-card__meta">近三日累计</span>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.indicator-card {
  @include shell.panel;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.indicator-card__header {
  @include shell.panel-header;
}

.indicator-card__caption,
.indicator-card__meta {
  color: var(--text-tertiary);
  font-size: $font-size-xs;
  line-height: 1.4;
}

.indicator-card__caption {
  position: absolute;
  right: 2px;
  font-size: 11px;
}

.indicator-card__body {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  padding: $spacing-md $spacing-lg $spacing-lg;
}

.indicator-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  margin: 0;
}

.indicator-card__metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: $spacing-md;
  border-bottom: 1px solid var(--border-default);

  &:nth-child(odd) { border-right: 1px solid var(--border-default); }
  &:nth-last-child(-n + 2) { border-bottom: 0; }
}

.indicator-card__label {
  order: 2;
  margin-top: $spacing-xs;
  color: var(--text-secondary);
  font-size: $font-size-sm;
  line-height: 1.4;
}

.indicator-card__value {
  display: flex;
  align-items: flex-end;
  gap: $spacing-xs;
  min-width: 0;
  margin: 0;
  color: var(--text-primary);
  font-size: $font-size-2xl;
  font-weight: $font-weight-semibold;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.indicator-card__unit {
  color: var(--text-tertiary);
  font-size: $font-size-xs;
  font-weight: $font-weight-regular;
}

.indicator-card__meta {
  order: 3;
  margin-top: $spacing-xs;
}

.indicator-card__metric--warning .indicator-card__value { color: var(--warning); }
.indicator-card__metric--danger .indicator-card__value { color: var(--danger); }
.indicator-card__metric--info .indicator-card__value { color: var(--info); }

.indicator-card__state {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  color: var(--text-tertiary);
  font-size: $font-size-sm;
  text-align: center;
}

.indicator-card__state--error { color: var(--danger); }

.indicator-card__state-mark {
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
  animation: indicator-card-loading 1.2s ease-in-out infinite;
}

.indicator-card__retry {
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

@keyframes indicator-card-loading {
  50% { opacity: .4; }
}
</style>
