<script setup lang="ts">
import PanelHeading from '@/components/common/PanelHeading.vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { getWarehouseJob } from '@/api/modules/warehouse';
import FlipNumber from '@/components/common/FlipNumber.vue';
import { useWarehouseStore } from '@/store/modules/warehouse';
import type { JobType, WarehouseJobType } from '@/types';

defineOptions({ name: 'WarehouseJob' });

const jobData = ref<WarehouseJobType | null>(null);
const loading = ref(true);
const errorMsg = ref('');
const carouselIndex = ref(0);
const carouselTransitionEnabled = ref(true);
const carouselPaused = ref(false);
const warehouseStore = useWarehouseStore();
const { totalWarehouse } = storeToRefs(warehouseStore);

const carouselVisibleRows = 5;
const carouselInterval = 2200;
let carouselFrame: number | null = null;
let carouselLastTick = 0;

const statItems = computed(() => {
  if (!jobData.value) return [];
  const stats = jobData.value.stats;
  return [
    { label: '仓房总数', value: totalWarehouse.value, tone: 'primary' },
    { label: '三日内已测温', value: stats.testedIn3Days, tone: 'success' },
    { label: '温湿报警', value: stats.tempAlarm, tone: 'danger' },
    { label: '气体报警', value: stats.gasAlarm, tone: 'neutral' },
    { label: '通风作业', value: stats.ventilation, tone: 'success' },
    { label: '熏蒸作业', value: stats.fumigation, tone: 'warning' },
  ] as const;
});

const jobTypeMap: Record<JobType, string> = {
  temperature: '测温',
  ventilation: '通风',
  fumigation: '熏蒸',
};

const statusMap = {
  normal: { label: '正常', tone: 'success' },
  warning: { label: '预警', tone: 'warning' },
  danger: { label: '报警', tone: 'danger' },
} as const;

const carouselItems = computed(() => {
  const list = jobData.value?.list ?? [];
  return list.length ? [...list, ...list] : [];
});

const carouselTransform = computed(() => `translateY(-${carouselIndex.value * 36}px)`);

function stopCarousel(): void {
  if (carouselFrame !== null) {
    cancelAnimationFrame(carouselFrame);
    carouselFrame = null;
  }

  carouselLastTick = 0;
}

function advanceCarousel(): void {
  const listLength = jobData.value?.list.length ?? 0;
  if (listLength <= carouselVisibleRows) return;

  carouselTransitionEnabled.value = true;
  carouselIndex.value += 1;
}

function runCarousel(timestamp: number): void {
  if (!carouselLastTick) carouselLastTick = timestamp;

  if (timestamp - carouselLastTick >= carouselInterval) {
    advanceCarousel();
    carouselLastTick = timestamp;
  }

  carouselFrame = requestAnimationFrame(runCarousel);
}

function startCarousel(): void {
  stopCarousel();

  if (carouselPaused.value || (jobData.value?.list.length ?? 0) <= carouselVisibleRows) return;
  carouselFrame = requestAnimationFrame(runCarousel);
}

function resetCarouselAfterLoop(): void {
  const listLength = jobData.value?.list.length ?? 0;
  if (carouselIndex.value !== listLength) return;

  carouselTransitionEnabled.value = false;
  carouselIndex.value = 0;
}

function pauseCarousel(): void {
  carouselPaused.value = true;
  stopCarousel();
}

function resumeCarousel(): void {
  carouselPaused.value = false;
  startCarousel();
}

async function fetchData(): Promise<void> {
  stopCarousel();
  loading.value = true;
  errorMsg.value = '';

  try {
    jobData.value = await getWarehouseJob();
    carouselIndex.value = 0;
    carouselTransitionEnabled.value = false;
    await nextTick();
    carouselTransitionEnabled.value = true;
    startCarousel();
  } catch {
    stopCarousel();
    errorMsg.value = '数据加载失败';
    jobData.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void fetchData();
});

onBeforeUnmount(stopCarousel);
</script>

<template>
  <section class="warehouse-job" aria-label="仓房作业总览">
    <header class="warehouse-job__header">
      <PanelHeading>仓房作业总览</PanelHeading>
    </header>

    <div class="warehouse-job__body">
      <div v-if="loading" class="warehouse-job__state" aria-live="polite">
        <span class="warehouse-job__spinner" aria-hidden="true"></span>
        <span>正在加载作业数据</span>
      </div>

      <div v-else-if="errorMsg" class="warehouse-job__state warehouse-job__state--error" role="alert">
        <span>{{ errorMsg }}</span>
        <button class="warehouse-job__retry" type="button" @click="fetchData">重新加载</button>
      </div>

      <template v-else-if="jobData">
        <div class="warehouse-job__stats" aria-label="作业关键指标">
          <div v-for="item in statItems" :key="item.label" class="warehouse-job__stat">
            <FlipNumber class="warehouse-job__stat-value" :value="item.value" :tone="item.tone" />
            <span class="warehouse-job__stat-label">{{ item.label }}</span>
          </div>
        </div>

        <section v-if="jobData.list.length" class="warehouse-job__list-section" aria-label="作业仓房列表">
          <div class="warehouse-job__list-heading">
            <span>作业仓房</span>
            <span>{{ jobData.list.length }} 间</span>
          </div>
          <div
            class="warehouse-job__list"
            @mouseenter="pauseCarousel"
            @mouseleave="resumeCarousel"
          >
            <div
              class="warehouse-job__list-track"
              :class="{ 'warehouse-job__list-track--animated': carouselTransitionEnabled }"
              :style="{ transform: carouselTransform }"
              @transitionend="resetCarouselAfterLoop"
            >
              <div
                v-for="(item, index) in carouselItems"
                :key="`${item.warehouseId}-${index}`"
                class="warehouse-job__list-item"
                :class="{ 'warehouse-job__list-item--active': index === carouselIndex }"
                :aria-current="index === carouselIndex ? 'true' : undefined"
              >
                <span class="warehouse-job__warehouse-id">{{ item.warehouseId }}</span>
                <div class="warehouse-job__job-tags">
                  <span
                    v-for="job in item.jobs"
                    :key="job"
                    class="warehouse-job__job-tag"
                    :class="`warehouse-job__job-tag--${job}`"
                  >
                    {{ jobTypeMap[job] }}
                  </span>
                </div>
                <span
                  class="warehouse-job__status"
                  :class="`warehouse-job__status--${statusMap[item.status].tone}`"
                >
                  {{ statusMap[item.status].label }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div v-else class="warehouse-job__empty-list">当前无作业仓房</div>
      </template>

      <div v-else class="warehouse-job__state">暂无作业数据</div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/mixins.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.warehouse-job {
  @include shell.panel;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.warehouse-job__header {
  @include shell.panel-header;
}

.warehouse-job__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: $spacing-md $spacing-lg;
}

.warehouse-job__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: $radius-sm;
}

.warehouse-job__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 58px;
  padding: $spacing-sm;
  text-align: center;

  &:nth-child(3n + 2),
  &:nth-child(3n + 3) {
    border-left: 1px solid var(--border-default);
  }

  &:nth-child(n + 4) {
    border-top: 1px solid var(--border-default);
  }
}

.warehouse-job__stat-value {
  min-height: 26px;
}

.warehouse-job__stat-label,
.warehouse-job__list-heading,
.warehouse-job__empty-list {
  color: var(--text-tertiary);
  font-size: $font-size-xs;
}

.warehouse-job__stat-label {
  margin-top: $spacing-xs;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.warehouse-job__list-section {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  margin-top: $spacing-md;
  border-top: 1px solid var(--border-default);
}

.warehouse-job__list-heading {
  display: flex;
  justify-content: space-between;
  padding: $spacing-sm 0;
}

.warehouse-job__list {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.warehouse-job__list-track {
  will-change: transform;

  &--animated {
    transition: transform 360ms cubic-bezier(.2, .8, .2, 1);
  }
}

.warehouse-job__list-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  height: 36px;
  padding: 0 $spacing-sm;
  border-bottom: 1px solid var(--border-default);
  transition: background-color $transition-fast, color $transition-fast;

  &:hover {
    background: var(--bg-hover);
  }
}

.warehouse-job__list-item--active {
  color: var(--text-primary);
  background: var(--primary-soft);
  box-shadow: inset 2px 0 0 var(--primary);
}

.warehouse-job__warehouse-id {
  min-width: 38px;
  color: var(--text-primary);
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  font-variant-numeric: tabular-nums;
}

.warehouse-job__job-tags {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.warehouse-job__job-tag,
.warehouse-job__status {
  @include shell.status-tag;
}

.warehouse-job__job-tag--temperature { @include shell.status-tag(info); }
.warehouse-job__job-tag--ventilation { @include shell.status-tag(success); }
.warehouse-job__job-tag--fumigation { @include shell.status-tag(warning); }
.warehouse-job__status--success { @include shell.status-tag(success); }
.warehouse-job__status--warning { @include shell.status-tag(warning); }
.warehouse-job__status--danger { @include shell.status-tag(danger); }

.warehouse-job__state {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  min-height: 160px;
  color: var(--text-tertiary);
  font-size: $font-size-sm;
}

.warehouse-job__state--error { color: var(--danger); }

.warehouse-job__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: warehouse-job-spin 800ms linear infinite;
}

.warehouse-job__retry {
  @include shell.filter-control;
  cursor: pointer;
  font-family: inherit;
  font-size: $font-size-xs;
}

.warehouse-job__empty-list {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  border-top: 1px solid var(--border-default);
}

@keyframes warehouse-job-spin {
  to { transform: rotate(360deg); }
}
</style>
