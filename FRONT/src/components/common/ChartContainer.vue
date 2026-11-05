<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

defineOptions({ name: 'ChartContainer' });

const props = withDefaults(defineProps<{
  title?: string;
  showTitle?: boolean;
  width?: string;
  height?: string;
  bordered?: boolean;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
}>(), {
  title: '',
  showTitle: true,
  width: '100%',
  height: '100%',
  bordered: true,
  loading: false,
  empty: false,
  emptyText: '暂无数据',
});

const emit = defineEmits<{
  (event: 'ready', containerRef: Ref<HTMLElement | null>): void;
}>();

const containerRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (containerRef.value) emit('ready', containerRef);
});

onBeforeUnmount(() => {
  containerRef.value = null;
});
</script>

<template>
  <section
    class="chart-container"
    :class="{ 'chart-container--bordered': props.bordered }"
    :style="{ width: props.width, height: props.height }"
  >
    <header v-if="props.showTitle && props.title" class="chart-container__header">
      <h3 class="chart-container__title">{{ props.title }}</h3>
      <div v-if="$slots.actions" class="chart-container__actions"><slot name="actions"></slot></div>
    </header>

    <div class="chart-container__body">
      <div ref="containerRef" class="chart-container__chart"></div>

      <div v-if="props.loading" class="chart-container__state">
        <span class="chart-container__spinner" aria-hidden="true"></span>
        <span>加载中...</span>
      </div>

      <div v-else-if="props.empty" class="chart-container__state">
        <slot name="empty">
          <span class="chart-container__empty-text">{{ props.emptyText }}</span>
        </slot>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.chart-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-panel);
  border-radius: $radius-md;

  &--bordered { border: 1px solid var(--border-default); }
}

.chart-container__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.chart-container__title {
  @include shell.panel-title;
  flex: 1;
  margin: 0;
}

.chart-container__actions {
  position: absolute;
  right: $spacing-lg;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.chart-container__body {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: $spacing-sm;
}

.chart-container__chart { width: 100%; height: 100%; }

.chart-container__state {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  color: var(--text-tertiary);
  font-size: $font-size-sm;
  background: color-mix(in srgb, var(--bg-panel) 90%, transparent);
}

.chart-container__spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--primary-soft);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: chart-container-spin 800ms linear infinite;
}

.chart-container__empty-text { color: var(--text-tertiary); }

@keyframes chart-container-spin { to { transform: rotate(360deg); } }
</style>
