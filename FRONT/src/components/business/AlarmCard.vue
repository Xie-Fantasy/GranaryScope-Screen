<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getThreeDayAlarm, getTodayAlarm, getTwoDayAlarm } from '@/api/modules/alarm';
import type { AlarmDays, AlarmListType } from '@/types';

defineOptions({ name: 'AlarmCard' });

interface AlarmCardConfig {
  days: AlarmDays;
  title: string;
  tone: 'warning' | 'danger' | 'danger-strong';
  emptyText: string;
}

const cardConfigs: AlarmCardConfig[] = [
  { days: 1, title: '当日报警', tone: 'warning', emptyText: '今日暂无报警' },
  { days: 2, title: '持续 2 日', tone: 'danger', emptyText: '暂无持续报警' },
  { days: 3, title: '持续 3 日', tone: 'danger-strong', emptyText: '暂无持续报警' },
];

const alarmDataMap = ref<Record<AlarmDays, AlarmListType | null>>({ 1: null, 2: null, 3: null });
const loading = ref(true);
const errorMsg = ref('');

const apiMap: Record<AlarmDays, () => Promise<AlarmListType>> = {
  1: getTodayAlarm,
  2: getTwoDayAlarm,
  3: getThreeDayAlarm,
};

async function fetchData(): Promise<void> {
  loading.value = true;
  errorMsg.value = '';

  try {
    const [today, twoDay, threeDay] = await Promise.all([apiMap[1](), apiMap[2](), apiMap[3]()]);
    alarmDataMap.value[1] = today;
    alarmDataMap.value[2] = twoDay;
    alarmDataMap.value[3] = threeDay;
  } catch {
    errorMsg.value = '报警数据加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <section class="alarm-card" aria-label="报警监控" :aria-busy="loading">
    <div class="alarm-card__body">
      <div v-if="loading" class="alarm-card__state">
        <span class="alarm-card__state-mark" aria-hidden="true"></span>
        <span>正在获取报警数据</span>
      </div>

      <div v-else-if="errorMsg" class="alarm-card__state alarm-card__state--error" role="alert">
        <span>{{ errorMsg }}</span>
        <button class="alarm-card__retry" type="button" @click="fetchData">重新获取</button>
      </div>

      <div v-else class="alarm-card__list">
        <article
          v-for="config in cardConfigs"
          :key="config.days"
          class="alarm-card__group"
          :class="`alarm-card__group--${config.tone}`"
        >
          <div class="alarm-card__group-header">
            <h4 class="alarm-card__group-title">{{ config.title }}</h4>
            <span class="alarm-card__count">{{ alarmDataMap[config.days]?.total ?? 0 }}<small>间</small></span>
          </div>

          <div class="alarm-card__warehouse-list">
            <template v-if="alarmDataMap[config.days]?.list.length">
              <span
                v-for="item in alarmDataMap[config.days]!.list"
                :key="item.warehouseId"
                class="alarm-card__warehouse"
              >{{ item.warehouseId }}</span>
            </template>
            <span v-else class="alarm-card__empty">{{ config.emptyText }}</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.alarm-card {
  @include shell.panel;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.alarm-card__body {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  padding: $spacing-md $spacing-lg $spacing-lg;
}

.alarm-card__list {
  display: grid;
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: $spacing-sm;
  width: 100%;
}

.alarm-card__group {
  --alarm-tone: var(--text-tertiary);
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: $spacing-sm $spacing-md;
  border: 1px solid var(--border-default);
  border-left: 2px solid var(--alarm-tone);
  border-radius: $radius-sm;
  background: var(--bg-card);
}

.alarm-card__group--warning { --alarm-tone: var(--warning); }
.alarm-card__group--danger { --alarm-tone: var(--danger); }
.alarm-card__group--danger-strong { --alarm-tone: var(--danger-strong); }

.alarm-card__group-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: $spacing-sm;
}

.alarm-card__group-title {
  margin: 0;
  color: var(--text-secondary);
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  line-height: 1.4;
}

.alarm-card__count {
  color: var(--alarm-tone);
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  font-variant-numeric: tabular-nums;
  line-height: 1;

  small {
    margin-left: 2px;
    color: var(--text-tertiary);
    font-size: $font-size-xs;
    font-weight: $font-weight-regular;
  }
}

.alarm-card__warehouse-list {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: $spacing-xs;
  min-height: 0;
  padding-top: $spacing-xs;
  overflow-y: auto;
}

.alarm-card__warehouse {
  align-self: flex-start;
  padding: 2px 6px;
  color: var(--text-secondary);
  background: var(--bg-panel-elevated);
  border: 1px solid var(--border-default);
  border-radius: 3px;
  font-size: $font-size-xs;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
}

.alarm-card__empty {
  align-self: center;
  margin: auto 0;
  color: var(--text-tertiary);
  font-size: $font-size-xs;
}

.alarm-card__state {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  color: var(--text-tertiary);
  font-size: $font-size-sm;
  text-align: center;
}

.alarm-card__state--error { color: var(--danger); }

.alarm-card__state-mark {
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
  animation: alarm-card-loading 1.2s ease-in-out infinite;
}

.alarm-card__retry {
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

@keyframes alarm-card-loading {
  50% { opacity: .4; }
}
</style>
