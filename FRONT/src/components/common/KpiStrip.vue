<script setup lang="ts">
// Shared, low-chrome KPI primitive used by both storage views.

defineOptions({ name: 'KpiStrip' });

export type KpiTone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'offline' | 'neutral';

export interface KpiItem {
  label: string;
  value: string | number;
  unit?: string;
  tone?: KpiTone;
}

withDefaults(defineProps<{
  items: KpiItem[];
}>(), {
  items: () => [],
});
</script>

<template>
  <div class="kpi-strip" :style="{ '--kpi-count': items.length }" aria-label="关键指标">
    <div
      v-for="(item, index) in items"
      :key="`${item.label}-${index}`"
      class="kpi-strip__item"
      :class="`kpi-strip__item--${item.tone ?? 'neutral'}`"
    >
      <div class="kpi-strip__value-row">
        <span class="kpi-strip__value">{{ item.value }}</span>
        <span v-if="item.unit" class="kpi-strip__unit">{{ item.unit }}</span>
      </div>
      <span class="kpi-strip__label">{{ item.label }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.kpi-strip {
  display: grid;
  grid-template-columns: repeat(var(--kpi-count, 4), minmax(0, 1fr));
  min-height: 78px;
  overflow: hidden;
  background: var(--bg-panel-elevated);
  border: 1px solid var(--border-default);
  border-radius: $radius-md;
}

.kpi-strip__item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: $spacing-sm $spacing-md;

  + .kpi-strip__item {
    border-left: 1px solid var(--border-default);
  }
}

.kpi-strip__value-row {
  display: flex;
  align-items: baseline;
  gap: $spacing-xs;
}

.kpi-strip__value {
  color: var(--text-primary);
  font-size: $font-size-3xl;
  font-weight: $font-weight-semibold;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.kpi-strip__unit,
.kpi-strip__label {
  color: var(--text-tertiary);
  font-size: $font-size-xs;
  line-height: 1.4;
}

.kpi-strip__label {
  margin-top: $spacing-xs;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kpi-strip__item--primary .kpi-strip__value { color: var(--primary); }
.kpi-strip__item--success .kpi-strip__value { color: var(--success); }
.kpi-strip__item--warning .kpi-strip__value { color: var(--warning); }
.kpi-strip__item--danger .kpi-strip__value { color: var(--danger); }
.kpi-strip__item--info .kpi-strip__value { color: var(--info); }
.kpi-strip__item--offline .kpi-strip__value { color: var(--offline); }
</style>
