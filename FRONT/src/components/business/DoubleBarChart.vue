<script setup lang="ts">
import PanelHeading from '@/components/common/PanelHeading.vue';
// ============================================
// DoubleBarChart - 异常报警监控双柱状图
// 功能：全库报警总数 + 当前选中仓房报警数，以中央棱线正对视角的 2.5D 双面柱呈现
// 联动：监听 warehouseStore.currentWarehouseId 变化，setOption(true) 平滑动画
// 横轴：动态显示最近 7/30 天，无数据补 0
// Green/Blue 主题切换实时同步颜色（不重新请求数据）
// ============================================

import { ref, onMounted, watch, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useWarehouseStore } from '@/store/modules/warehouse';
import { useThemeStore } from '@/store/modules/theme';
import { useECharts } from '@/composables/useECharts';
import { adjustColor, createVerticalGradient, getChartTheme } from '@/composables/chartTheme';
import { getBarChartData } from '@/api/modules/chart';
import ScrollList from '@/components/common/ScrollList.vue';
import type { BarChartDataPoint } from '@/types';
import type { CustomSeriesRenderItem, CustomSeriesRenderItemAPI, EChartsOption } from 'echarts';

defineOptions({ name: 'DoubleBarChart' });

const store = useWarehouseStore();
const { currentWarehouseId } = storeToRefs(store);
// 本面板独立维护日期范围，不干扰粮温、湿度趋势。
const dateRange = ref<7 | 30>(7);
const themeStore = useThemeStore();

// --------------------------------------------
// 响应式数据
// --------------------------------------------
const chartRef = ref<HTMLElement | null>(null);
const chartData = ref<BarChartDataPoint[]>([]);
const loading = ref(true);
const errorMsg = ref('');
let requestToken = 0;

const BAR_WIDTH_RATIO = 0.24;
const BAR_GROUP_GAP_RATIO = 0.08;

interface PrismBarLayout {
  color: string;
  depth: number;
  left: number;
  center: number;
  right: number;
  top: number;
  bottom: number;
}

const { initChart, setOption, getInstance } = useECharts(
  chartRef as Ref<HTMLElement | null>,
  { onThemeChange: () => renderChart() }
);

function getPrismBarLayout(api: CustomSeriesRenderItemAPI): PrismBarLayout | null {
  const categoryIndex = Number(api.value(0));
  const value = Number(api.value(1));
  const color = String(api.value(2));
  const slot = Number(api.value(3));
  if (!Number.isFinite(value) || value <= 0) return null;

  const [categoryCenter, top] = api.coord([categoryIndex, value]);
  const [, bottom] = api.coord([categoryIndex, 0]);
  const categorySize = api.size?.([1, 0]);
  const categoryWidth = Array.isArray(categorySize) ? categorySize[0] : categorySize;
  const width = Math.max(8, (categoryWidth ?? 0) * BAR_WIDTH_RATIO);
  const gap = Math.max(3, (categoryWidth ?? 0) * BAR_GROUP_GAP_RATIO);
  const center = categoryCenter + slot * (width + gap) / 2;

  return {
    color,
    depth: Math.min(6, width * 0.28),
    left: center - width / 2,
    center,
    right: center + width / 2,
    top,
    bottom,
  };
}

const renderPrismBar: CustomSeriesRenderItem = (_params, api) => {
  const bar = getPrismBarLayout(api);
  if (!bar) return;

  const halfWidth = bar.center - bar.left;
  const height = bar.bottom - bar.top;

  return {
    type: 'group',
    children: [
      {
        type: 'rect',
        shape: { x: bar.left, y: bar.top, width: halfWidth, height },
        style: { fill: createVerticalGradient(adjustColor(bar.color, 0.08), 0.98, 0.34) },
        transition: ['shape'],
        enterFrom: { shape: { x: bar.left, y: bar.bottom, width: halfWidth, height: 0 } },
      },
      {
        type: 'rect',
        shape: { x: bar.center, y: bar.top, width: halfWidth, height },
        style: { fill: createVerticalGradient(adjustColor(bar.color, -0.2), 0.92, 0.24) },
        transition: ['shape'],
        enterFrom: { shape: { x: bar.center, y: bar.bottom, width: halfWidth, height: 0 } },
      },
      {
        type: 'group',
        x: bar.left,
        y: bar.top,
        transition: ['x', 'y'],
        enterFrom: { x: bar.left, y: bar.bottom },
        children: [{
          type: 'polygon',
          shape: {
            points: [
              [0, 0],
              [halfWidth, -bar.depth],
              [halfWidth * 2, 0],
              [halfWidth, bar.depth],
            ],
          },
          style: { fill: adjustColor(bar.color, 0.28) },
        }],
      },
    ],
  };
};

/**
 * 获取双柱状图数据
 * @param warehouseId 仓房编号
 */
async function fetchData(warehouseId: string): Promise<void> {
  const token = ++requestToken;
  // 轮播切换时保留现有图表，不用全屏 loading 遮住可视化内容。
  loading.value = chartData.value.length === 0;
  errorMsg.value = '';
  try {
    const response = await getBarChartData(warehouseId, dateRange.value) as unknown;
    if (token !== requestToken) return;

    // 兼容 mock 直接返回数组与 AxiosResponse.data 数组两种形态。
    const responseData = response && typeof response === 'object'
      ? (response as { data?: unknown }).data
      : undefined;
    const nestedData = responseData && typeof responseData === 'object'
      ? (responseData as { data?: unknown }).data
      : undefined;
    const data = (Array.isArray(response) ? response :
      Array.isArray(responseData) ? responseData :
      Array.isArray(nestedData) ? nestedData : []) as BarChartDataPoint[];

    if (data.length > 0) {
      chartData.value = data;
      renderChart();
    } else if (chartData.value.length === 0) {
      chartData.value = [];
      errorMsg.value = '暂无报警数据';
    }
  } catch {
    if (token !== requestToken) return;
    // 切换仓房时保留上一版图表，避免短暂请求失败造成整块面板空白。
    // 已有数据时静默保留，避免轮播过程中闪出错误遮罩。
    errorMsg.value = chartData.value.length > 0 ? '' : '图表数据加载失败';
  } finally {
    if (token === requestToken) loading.value = false;
  }
}

/**
 * 构建图表配置
 */
function buildOption(): EChartsOption {
  const d = chartData.value;
  if (!d || d.length === 0) return {};

  const t = getChartTheme(themeStore.theme);
  const dates = d.map(item => item.date);
  const totalAlarmData = d.map(item => item.totalAlarm);
  const currentAlarmData = d.map(item => item.currentAlarm);
  const totalColor = t.palette.primary;
  const currentColor = t.palette.warning;
  const totalPrismData = totalAlarmData.map((value, index) => [index, value, totalColor, -1]);
  const currentPrismData = currentAlarmData.map((value, index) => [index, value, currentColor, 1]);

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 380,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 380,
    animationEasingUpdate: 'cubicOut',
    tooltip: {
      ...t.tooltip(),
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const items = params as Array<{ dataIndex?: number; name?: string }>;
        if (!items || items.length === 0) return '';
        const index = items[0].dataIndex ?? 0;
        const date = dates[index] ?? items[0].name ?? '';
        return `<div style="font-size:12px;color:${t.text.secondary};margin-bottom:4px;">${date}</div>
          <div style="display:flex;align-items:center;gap:6px;line-height:1.6;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${totalColor};"></span>
            <span style="color:${t.text.primary};">全库报警总数</span>
            <span style="color:${totalColor};font-weight:600;margin-left:8px;">${totalAlarmData[index] ?? 0}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;line-height:1.6;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${currentColor};"></span>
            <span style="color:${t.text.primary};">当前仓房报警数</span>
            <span style="color:${currentColor};font-weight:600;margin-left:8px;">${currentAlarmData[index] ?? 0}</span>
          </div>`;
      },
    },
    grid: {
      left: '3%',
      right: '5%',
      bottom: '3%',
      top: '8%',
      containLabel: true,
    },
    xAxis: t.categoryAxis(dates),
    yAxis: t.valueAxis(),
    series: [
      // 两组柱均为中央棱线正对视角的双立面柱，只显示受光顶面，不绘制底面。
      {
        name: '全库报警总数',
        type: 'custom',
        data: totalPrismData,
        encode: { x: 0, y: 1 },
        renderItem: renderPrismBar,
        z: 2,
      },
      {
        name: '当前仓房报警数',
        type: 'custom',
        data: currentPrismData,
        encode: { x: 0, y: 1 },
        renderItem: renderPrismBar,
        z: 3,
      },
    ],
  };
}

/**
 * 渲染图表
 * @param notMerge 是否完全替换配置（默认 true，实现平滑动画）
 */
function renderChart(notMerge = true): void {
  if (chartData.value.length === 0) return;
  const option = buildOption();
  if (getInstance()) {
    // 已有实例，使用 setOption 更新（notMerge=true 实现平滑动画）
    setOption(option, notMerge);
  } else {
    initChart(option);
  }
}

function setDateRange(range: 7 | 30): void {
  if (dateRange.value !== range) dateRange.value = range;
}

// 监听当前仓房 ID 变化，更新图表数据
watch([currentWarehouseId, dateRange], ([warehouseId]) => {
  if (warehouseId) {
    fetchData(warehouseId);
  }
});

onMounted(() => {
  fetchData(currentWarehouseId.value);
});
</script>

<template>
  <div class="double-bar-chart">
    <!-- 标题栏 -->
    <header class="double-bar-chart__header">
      <PanelHeading class="double-bar-chart__title">异常报警监控</PanelHeading>
      <div class="double-bar-chart__header-actions">
        <div class="double-bar-chart__date-toggle" aria-label="数据范围">
          <button
            class="double-bar-chart__date"
            :class="{ 'is-active': dateRange === 7 }"
            type="button"
            @click="setDateRange(7)"
          >
            7日
          </button>
          <button
            class="double-bar-chart__date"
            :class="{ 'is-active': dateRange === 30 }"
            type="button"
            @click="setDateRange(30)"
          >
            30日
          </button>
        </div>
      </div>
    </header>

    <!-- 下层：左侧仓房索引 + 右侧主图表 -->
    <div class="double-bar-chart__content">
      <div class="double-bar-chart__toolbar">
        <div class="double-bar-chart__legend" aria-label="图例">
          <span class="double-bar-chart__legend-item">
            <i class="double-bar-chart__legend-swatch double-bar-chart__legend-swatch--total" aria-hidden="true"></i>
            全库报警总数
          </span>
          <span class="double-bar-chart__legend-item">
            <i class="double-bar-chart__legend-swatch double-bar-chart__legend-swatch--current" aria-hidden="true"></i>
            当前仓房报警数
          </span>
        </div>
        <div class="double-bar-chart__subtitle">
          当前仓房：<span class="double-bar-chart__current-id">{{ currentWarehouseId }}</span>
        </div>
      </div>
      <aside class="double-bar-chart__sidebar" aria-label="仓房切换">
        <ScrollList />
      </aside>

      <div class="double-bar-chart__body">
        <div ref="chartRef" class="double-bar-chart__canvas"></div>

        <!-- 加载状态 -->
        <div v-if="loading" class="double-bar-chart__state" aria-live="polite">
          <span class="double-bar-chart__spinner" aria-hidden="true"></span>
          <span>正在获取报警数据</span>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="errorMsg" class="double-bar-chart__state double-bar-chart__state--error" role="alert">
          <span>{{ errorMsg }}</span>
          <button class="double-bar-chart__retry" type="button" @click="fetchData(currentWarehouseId)">重新加载</button>
        </div>

        <!-- 空状态 -->
        <div v-else-if="chartData.length === 0" class="double-bar-chart__state">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.double-bar-chart {
  @include shell.panel;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

// --------------------------------------------
// 标题栏
// --------------------------------------------
.double-bar-chart__header {
  @include shell.chart-header;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
}

.double-bar-chart__title {
  grid-column: 2;
  justify-self: center;
}

.double-bar-chart__subtitle {
  font-size: $font-size-xs;
  color: var(--text-secondary);
}

.double-bar-chart__header-actions {
  display: flex;
  grid-column: 3;
  align-items: center;
  justify-self: end;
  gap: $spacing-sm;
}

.double-bar-chart__date-toggle {
  display: flex;
  gap: $spacing-xs;
}

.double-bar-chart__date {
  @include shell.filter-control;
  min-width: 36px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
}

.double-bar-chart__legend {
  display: flex;
  gap: $spacing-md;
  color: var(--text-secondary);
  font-size: $font-size-xs;
  white-space: nowrap;
}

.double-bar-chart__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.double-bar-chart__legend-swatch {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 2px;

  &--total { background: var(--primary); }
  &--current { background: var(--warning); }
}

.double-bar-chart__current-id {
  color: var(--primary);
  font-weight: $font-weight-semibold;
  font-variant-numeric: tabular-nums;
}

// --------------------------------------------
// 图表区域
// --------------------------------------------
.double-bar-chart__body {
  position: relative;
  flex: 1;
  min-height: 0;
  background: transparent;
}

.double-bar-chart__content {
  display: grid;
  grid-template-columns: minmax(140px, 18%) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  flex: 1;
  gap: $spacing-md;
  min-height: 0;
  padding: $spacing-md;
  background: transparent;
}

.double-bar-chart__toolbar {
  display: flex;
  grid-column: 1 / -1;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-sm;
  min-width: 0;
}

.double-bar-chart__sidebar {
  min-width: 0;
  min-height: 0;
}

.double-bar-chart__sidebar :deep(.scroll-list) {
  width: 100%;
  height: 100%;
}

.double-bar-chart__canvas {
  width: 100%;
  height: 100%;
}

// --------------------------------------------
// 加载/错误/空状态
// --------------------------------------------
.double-bar-chart__state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  background: color-mix(in srgb, var(--bg-page) 76%, transparent);
  color: var(--text-tertiary);
  font-size: $font-size-sm;
  z-index: 5;
}

.double-bar-chart__state--error { color: var(--danger); }

.double-bar-chart__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: double-bar-chart-spin 800ms linear infinite;
}

.double-bar-chart__retry {
  @include shell.filter-control;
  cursor: pointer;
  font-family: inherit;
  font-size: $font-size-xs;
}

@keyframes double-bar-chart-spin {
  to { transform: rotate(360deg); }
}
</style>
