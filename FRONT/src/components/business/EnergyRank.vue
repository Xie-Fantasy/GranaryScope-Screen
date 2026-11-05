<script setup lang="ts">
import { computed, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, toRef, watch } from 'vue';
import { getEnergyRankData } from '@/api/modules/chart';
import type { EnergyRankType } from '@/types';

defineOptions({ name: 'EnergyRank' });

const props = withDefaults(defineProps<{
  active?: boolean;
}>(), {
  active: false,
});
const isActive = toRef(props, 'active');

const rankList = ref<EnergyRankType[]>([]);
const loading = ref(true);
const errorMsg = ref('');
const carouselIndex = ref(0);
const carouselTransitionEnabled = ref(true);
const carouselPaused = ref(false);

const carouselVisibleRows = 5;
const carouselInterval = 2200;
let carouselTimer: ReturnType<typeof setInterval> | null = null;

const maxEnergy = computed(() => {
  if (rankList.value.length === 0) return 1;
  return Math.max(...rankList.value.map((item) => item.energy));
});

const carouselItems = computed(() => (
  rankList.value.length ? [...rankList.value, ...rankList.value] : []
));

const carouselTransform = computed(() => `translateY(-${carouselIndex.value * 36}px)`);

function stopCarousel(): void {
  if (carouselTimer !== null) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
}

function advanceCarousel(): void {
  if (rankList.value.length <= carouselVisibleRows) return;
  carouselTransitionEnabled.value = true;
  carouselIndex.value += 1;
}

function startCarousel(): void {
  stopCarousel();
  if (!isActive.value || carouselPaused.value || rankList.value.length <= carouselVisibleRows) return;
  carouselTimer = setInterval(advanceCarousel, carouselInterval);
}

function resetCarouselAfterLoop(): void {
  if (carouselIndex.value !== rankList.value.length) return;
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
    const data = await getEnergyRankData();
    if (data && Array.isArray(data)) {
      const sorted = [...data].sort((a, b) => b.energy - a.energy);
      rankList.value = sorted.map((item, index) => ({ ...item, rank: index + 1 }));
      carouselIndex.value = 0;
      carouselTransitionEnabled.value = false;
      await nextTick();
      carouselTransitionEnabled.value = true;
      startCarousel();
    } else {
      rankList.value = [];
    }
  } catch {
    errorMsg.value = '数据加载失败';
    rankList.value = [];
  } finally {
    loading.value = false;
  }
}

function getBarWidth(energy: number): number {
  if (maxEnergy.value === 0) return 0;
  return Math.round((energy / maxEnergy.value) * 100);
}

function getRankColor(rank: number): string {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return 'normal';
}

watch(isActive, (active) => {
  if (active) startCarousel();
  else stopCarousel();
});

onMounted(fetchData);
onActivated(startCarousel);
onDeactivated(stopCarousel);
onBeforeUnmount(stopCarousel);
</script>

<template>
  <div class="energy-rank" aria-label="能耗排行榜">
    <div class="energy-rank__header" role="row">
      <span class="energy-rank__col energy-rank__col--rank">排名</span>
      <span class="energy-rank__col energy-rank__col--id">仓房编号</span>
      <span class="energy-rank__col energy-rank__col--bar">能耗进度</span>
      <span class="energy-rank__col energy-rank__col--value">能耗值</span>
    </div>

    <div class="energy-rank__body">
      <div v-if="loading" class="energy-rank__state" aria-live="polite">
        <span class="energy-rank__spinner" aria-hidden="true"></span>
        <span>正在加载能耗数据</span>
      </div>

      <div v-else-if="errorMsg" class="energy-rank__state energy-rank__state--error" role="alert">
        <span>{{ errorMsg }}</span>
        <button class="energy-rank__retry" type="button" @click="fetchData">重新加载</button>
      </div>

      <div
        v-else-if="rankList.length"
        class="energy-rank__list"
        @mouseenter="pauseCarousel"
        @mouseleave="resumeCarousel"
      >
        <div
          class="energy-rank__list-track"
          :class="{ 'energy-rank__list-track--animated': carouselTransitionEnabled }"
          :style="{ transform: carouselTransform }"
          @transitionend="resetCarouselAfterLoop"
        >
          <div
            v-for="(item, index) in carouselItems"
            :key="`${item.warehouseId}-${index}`"
            class="energy-rank__item"
            :class="{ 'energy-rank__item--active': index === carouselIndex }"
            :aria-current="index === carouselIndex ? 'true' : undefined"
            role="row"
          >
          <span
            class="energy-rank__rank"
            :class="`energy-rank__rank--${getRankColor(item.rank)}`"
          >
            {{ item.rank }}
          </span>
          <span class="energy-rank__id">{{ item.warehouseId }}</span>
          <div class="energy-rank__bar-wrapper" :aria-label="`${item.warehouseId} 能耗进度 ${getBarWidth(item.energy)}%`">
            <div class="energy-rank__bar" :style="{ width: `${getBarWidth(item.energy)}%` }"></div>
          </div>
          <span class="energy-rank__value">{{ item.energy.toFixed(1) }}</span>
          </div>
        </div>
      </div>

      <div v-else class="energy-rank__state">暂无能耗数据</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.energy-rank {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.energy-rank__header,
.energy-rank__item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: 0 $spacing-md;
}

.energy-rank__header {
  min-height: 36px;
  color: var(--text-tertiary);
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  border-bottom: 1px solid var(--border-default);
}

.energy-rank__col--rank,
.energy-rank__rank {
  width: 32px;
  text-align: center;
}

.energy-rank__col--id,
.energy-rank__id {
  width: 58px;
  text-align: center;
}

.energy-rank__col--bar,
.energy-rank__bar-wrapper {
  flex: 1;
}

.energy-rank__col--bar {
  text-align: left;
}

.energy-rank__col--value,
.energy-rank__value {
  width: 66px;
  text-align: right;
}

.energy-rank__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.energy-rank__list {
  height: 100%;
  overflow: hidden;
}

.energy-rank__list-track {
  will-change: transform;

  &--animated {
    transition: transform 360ms cubic-bezier(.2, .8, .2, 1);
  }
}

.energy-rank__item {
  height: 36px;
  color: var(--text-secondary);
  font-size: $font-size-sm;
  border-bottom: 1px solid var(--border-default);
  transition: background-color $transition-fast;

  &:nth-child(even) {
    background: color-mix(in srgb, var(--bg-panel-elevated) 54%, transparent);
  }

  &:hover {
    background: var(--bg-hover);
  }

  &--active {
    color: var(--text-primary);
    background: var(--primary-soft);
    box-shadow: inset 2px 0 0 var(--primary);
  }
}

.energy-rank__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  border: 1px solid var(--border-default);
  border-radius: $radius-sm;
  color: var(--text-tertiary);
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  font-variant-numeric: tabular-nums;

  &--gold {
    color: var(--warning);
    border-color: color-mix(in srgb, var(--warning) 32%, var(--border-default));
    background: color-mix(in srgb, var(--warning) 12%, transparent);
  }

  &--silver {
    color: var(--text-secondary);
    background: color-mix(in srgb, var(--text-secondary) 8%, transparent);
  }

  &--bronze {
    color: var(--text-tertiary);
    background: color-mix(in srgb, var(--text-tertiary) 8%, transparent);
  }
}

.energy-rank__id {
  color: var(--text-primary);
  font-weight: $font-weight-semibold;
  font-variant-numeric: tabular-nums;
}

.energy-rank__bar-wrapper {
  height: 8px;
  overflow: hidden;
  background: var(--bg-panel-elevated);
  border: 1px solid var(--border-default);
  border-radius: 2px;
}

.energy-rank__bar {
  height: 100%;
  background: var(--primary);
  opacity: 0.76;
  transition: width $transition-normal;
}

.energy-rank__value {
  color: var(--text-primary);
  font-weight: $font-weight-semibold;
  font-variant-numeric: tabular-nums;
}

.energy-rank__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  min-height: 160px;
  height: 100%;
  color: var(--text-tertiary);
  font-size: $font-size-sm;
}

.energy-rank__state--error { color: var(--danger); }

.energy-rank__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: energy-rank-spin 800ms linear infinite;
}

.energy-rank__retry {
  @include shell.filter-control;
  cursor: pointer;
  font-family: inherit;
  font-size: $font-size-xs;
}

@keyframes energy-rank-spin {
  to { transform: rotate(360deg); }
}
</style>
