<script setup lang="ts">
import PanelHeading from '@/components/common/PanelHeading.vue';
import { computed, onMounted, ref } from 'vue';
import { getDeviceOverview } from '@/api/modules/device';
import type { DeviceOverviewItem, DeviceType } from '@/types';

defineOptions({ name: 'DeviceOverview' });

const deviceList = ref<DeviceOverviewItem[]>([]);
const selectedType = ref<DeviceType>('all');
const loading = ref(true);
const errorMsg = ref('');

const categoryTags = computed(() => [
  { key: 'all' as DeviceType, label: '全部' },
  ...deviceList.value.map((item) => ({
    key: item.deviceType,
    label: item.deviceName,
  })),
]);

const filteredDeviceList = computed(() => {
  if (selectedType.value === 'all') return deviceList.value;
  return deviceList.value.filter((item) => item.deviceType === selectedType.value);
});

async function fetchData(): Promise<void> {
  loading.value = true;
  errorMsg.value = '';

  try {
    const data = await getDeviceOverview();
    deviceList.value = data?.list?.filter((item) => item.deviceType !== 'all') ?? [];
  } catch {
    errorMsg.value = '数据加载失败';
    deviceList.value = [];
  } finally {
    loading.value = false;
  }
}

function showAllDevices(): void {
  selectedType.value = 'all';
}

onMounted(fetchData);
</script>

<template>
  <section class="device-overview" aria-label="设备运行总览">
    <header class="device-overview__header">
      <PanelHeading>设备运行总览</PanelHeading>
    </header>

    <div class="device-overview__body">
      <div v-if="loading" class="device-overview__state" aria-live="polite">
        <span class="device-overview__spinner" aria-hidden="true"></span>
        <span>正在加载设备数据</span>
      </div>

      <div v-else-if="errorMsg" class="device-overview__state device-overview__state--error" role="alert">
        <span>{{ errorMsg }}</span>
        <button class="device-overview__retry" type="button" @click="fetchData">重新加载</button>
      </div>

      <template v-else-if="deviceList.length">
        <div class="device-overview__filters" aria-label="设备分类筛选">
          <button
            v-for="tag in categoryTags"
            :key="tag.key"
            class="device-overview__filter"
            :class="{ 'is-active': selectedType === tag.key }"
            type="button"
            @click="selectedType = tag.key"
          >
            {{ tag.label }}
          </button>
        </div>

        <div class="device-overview__table-wrap">
          <table class="device-overview__table">
            <thead>
              <tr>
                <th scope="col">设备类型</th>
                <th scope="col">总数</th>
                <th scope="col">异常</th>
                <th scope="col">作业中</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredDeviceList" :key="item.deviceType">
                <th scope="row">{{ item.deviceName }}</th>
                <td>{{ item.total }}</td>
                <td :class="{ 'device-overview__number--danger': item.abnormal > 0 }">
                  {{ item.abnormal }}
                </td>
                <td :class="{ 'device-overview__number--success': item.working > 0 }">
                  {{ item.working }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="device-overview__footer">
          <span>共 {{ filteredDeviceList.length }} 类设备</span>
          <button class="device-overview__all" type="button" @click="showAllDevices">查看全部设备</button>
        </div>
      </template>

      <div v-else class="device-overview__state">暂无设备数据</div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/mixins.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.device-overview {
  @include shell.panel;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.device-overview__header {
  @include shell.panel-header;
}

.device-overview__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: $spacing-md $spacing-lg;
}

.device-overview__filters {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  padding-bottom: $spacing-md;
  border-bottom: 1px solid var(--border-default);
}

.device-overview__filter {
  @include shell.filter-control;
  cursor: pointer;
  font-family: inherit;
  font-size: $font-size-xs;
}

.device-overview__table-wrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  @include custom-scrollbar;
}

.device-overview__table {
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  color: var(--text-secondary);
  font-size: $font-size-sm;

  th,
  td {
    height: 42px;
    padding: 0 $spacing-sm;
    border-bottom: 1px solid var(--border-default);
    font-variant-numeric: tabular-nums;
  }

  thead th {
    height: 36px;
    color: var(--text-tertiary);
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    text-align: right;
  }

  thead th:first-child,
  tbody th {
    width: 44%;
    text-align: left;
  }

  tbody th {
    color: var(--text-primary);
    font-weight: $font-weight-regular;
  }

  td {
    text-align: right;
  }

  tbody tr {
    transition: background-color $transition-fast;

    &:nth-child(even) {
      background: color-mix(in srgb, var(--bg-panel-elevated) 54%, transparent);
    }

    &:hover {
      background: var(--bg-hover);
    }
  }
}

.device-overview__number--danger {
  color: var(--danger);
  font-weight: $font-weight-semibold;
}

.device-overview__number--success {
  color: var(--success);
  font-weight: $font-weight-semibold;
}

.device-overview__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-sm;
  min-height: 38px;
  color: var(--text-tertiary);
  font-size: $font-size-xs;
}

.device-overview__all,
.device-overview__retry {
  @include shell.filter-control;
  cursor: pointer;
  font-family: inherit;
  font-size: $font-size-xs;
}

.device-overview__state {
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

.device-overview__state--error {
  color: var(--danger);
}

.device-overview__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: device-overview-spin 800ms linear infinite;
}

@keyframes device-overview-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
