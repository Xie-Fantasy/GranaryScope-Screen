<script setup lang="ts">
import PanelHeading from '@/components/common/PanelHeading.vue';
// ============================================
// HumidityTrend - 湿度趋势组合图表
// 功能：柱状图（报警数）+ 折线图（仓内湿度/仓外湿度）
// 数据来源：getHumidityTrend(dateRange) Mock 接口
// 说明：
// - 支持 7日/30日切换，无感更新数据（setOption 不重建实例）
// - Green/Blue 主题切换实时同步颜色（不重新请求数据）
// 语义色（视觉规范 §17.4）：报警数 danger / 仓内湿度 primary / 仓外湿度 warning(虚线)
// ============================================

import { ref, onMounted, watch, type Ref } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { useECharts } from '@/composables/useECharts';
import { adjustColor, createVerticalGradient, getChartTheme } from '@/composables/chartTheme';
import { getHumidityTrend } from '@/api/modules/chart';
import type { HumidityTrendType } from '@/types';
import type { CustomSeriesRenderItem, CustomSeriesRenderItemAPI, EChartsOption } from 'echarts';

defineOptions({ name: 'HumidityTrend' });

// 仅服务本图表，切换不影响异常报警或粮温趋势。
const dateRange = ref<7 | 30>(7);
const themeStore = useThemeStore();

// --------------------------------------------
// 响应式数据
// --------------------------------------------
const chartRef = ref<HTMLElement | null>(null);
const chartData = ref<HumidityTrendType | null>(null);
const loading = ref(true);
const errorMsg = ref('');

const BAR_DEPTH = 6;
const BAR_WIDTH_RATIO = 0.46;

interface HumidityBarLayout {
  color: string;
  frontLeft: number;
  frontRight: number;
  width: number;
  top: number;
  bottom: number;
}

const { initChart, setOption, getInstance } = useECharts(
  chartRef as Ref<HTMLElement | null>,
  { onThemeChange: () => renderChart() }
);

function getBarLayout(api: CustomSeriesRenderItemAPI): HumidityBarLayout | null {
  const categoryIndex = Number(api.value(0));
  const value = Number(api.value(1));
  const color = String(api.value(2));
  if (!Number.isFinite(value) || value <= 0) return null;

  const [centerX, top] = api.coord([categoryIndex, value]);
  const [, bottom] = api.coord([categoryIndex, 0]);
  const categorySize = api.size?.([1, 0]);
  const categoryWidth = Array.isArray(categorySize) ? categorySize[0] : categorySize;
  const width = Math.max(4, (categoryWidth ?? 0) * BAR_WIDTH_RATIO);

  return {
    color,
    frontLeft: centerX - width / 2,
    frontRight: centerX + width / 2,
    width,
    top,
    bottom,
  };
}

const renderBarSide: CustomSeriesRenderItem = (_params, api) => {
  const bar = getBarLayout(api);
  if (!bar) return;

  return {
    type: 'rect',
    shape: { x: bar.frontRight, y: bar.top - BAR_DEPTH, width: BAR_DEPTH, height: bar.bottom - bar.top },
    style: {
      fill: createVerticalGradient(adjustColor(bar.color, -0.16), 0.94, 0.46),
      opacity: 0.9,
    },
    transition: ['shape'],
    enterFrom: { shape: { x: bar.frontRight, y: bar.bottom - BAR_DEPTH, width: BAR_DEPTH, height: 0 } },
  };
};

const renderBarBottom: CustomSeriesRenderItem = (_params, api) => {
  const bar = getBarLayout(api);
  if (!bar) return;

  return {
    type: 'group',
    x: bar.frontLeft,
    y: bar.bottom,
    children: [{
      type: 'polygon',
      shape: {
        points: [[0, 0], [bar.width, 0], [bar.width + BAR_DEPTH, -BAR_DEPTH], [BAR_DEPTH, -BAR_DEPTH]],
      },
      style: { fill: adjustColor(bar.color, -0.06), opacity: 0.78 },
      transition: ['style'],
      enterFrom: { shape: {}, style: { opacity: 0 } },
    }],
  };
};

const renderBarTop: CustomSeriesRenderItem = (_params, api) => {
  const bar = getBarLayout(api);
  if (!bar) return;

  return {
    type: 'group',
    x: bar.frontLeft,
    y: bar.top,
    transition: ['x', 'y'],
    enterFrom: { x: bar.frontLeft, y: bar.bottom },
    children: [{
      type: 'polygon',
      shape: { points: [[0, 0], [bar.width, 0], [bar.width + BAR_DEPTH, -BAR_DEPTH], [BAR_DEPTH, -BAR_DEPTH]] },
      style: { fill: adjustColor(bar.color, 0.26) },
    }],
  };
};

/**
 * 获取数据
 */
async function fetchData(): Promise<void> {
  loading.value = true;
  errorMsg.value = '';
  try {
    const data = await getHumidityTrend(dateRange.value);
    if (data) {
      chartData.value = data;
      renderChart();
    }
  } catch (err) {
    errorMsg.value = '数据加载失败';
  } finally {
    loading.value = false;
  }
}

/**
 * 构建图表配置
 */
function buildOption(): EChartsOption {
  if (!chartData.value) return {};

  const t = getChartTheme(themeStore.theme);
  const d = chartData.value;
  const barColor = t.palette.primary;
  const barFaceData = d.alarmCount.map((value, index) => [index, value, barColor]);
  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 360,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 360,
    animationEasingUpdate: 'cubicOut',
    tooltip: { ...t.tooltip(), axisPointer: { type: 'cross' } },
    legend: t.legend(['报警数', '仓内湿度', '仓外湿度']),
    grid: {
      left: '3%',
      right: '5%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: t.categoryAxis(d.dates),
    yAxis: [
      { ...t.valueAxis('报警数'), position: 'left' },
      { ...t.valueAxis('湿度(%)'), position: 'right', splitLine: { show: false } },
    ],
    series: [
      // 2.5D 柱体：正面渐变、受光顶面与侧面均随数据动画同步生长。
      {
        name: '报警数底面',
        type: 'custom',
        data: barFaceData,
        renderItem: renderBarBottom,
        silent: true,
        tooltip: { show: false },
        z: 0,
      },
      {
        name: '报警数侧面',
        type: 'custom',
        data: barFaceData,
        renderItem: renderBarSide,
        silent: true,
        tooltip: { show: false },
        z: 1,
      },
      {
        name: '报警数',
        type: 'bar',
        data: d.alarmCount,
        barWidth: `${BAR_WIDTH_RATIO * 100}%`,
        itemStyle: {
          color: createVerticalGradient(barColor, 0.98, 0.32),
          borderRadius: [1, 1, 0, 0],
        },
        z: 2,
      },
      {
        name: '报警数顶面',
        type: 'custom',
        data: barFaceData,
        renderItem: renderBarTop,
        silent: true,
        tooltip: { show: false },
        z: 3,
      },
      // 折线图：显示实心节点，并以局部荧光突出湿度变化位置。
      t.lineSeries({
        name: '仓内湿度',
        yAxisIndex: 1,
        data: d.insideHumidity,
        showSymbol: true,
        symbolSize: 7,
        lineStyle: { color: t.palette.primary, width: 2.6, shadowBlur: 10, shadowColor: t.palette.primary },
        itemStyle: {
          color: t.palette.primary,
          borderColor: t.palette.primary,
          borderWidth: 0,
          shadowBlur: 12,
          shadowColor: t.palette.primary,
        },
      }),
      t.lineSeries({
        name: '仓外湿度',
        yAxisIndex: 1,
        data: d.outsideHumidity,
        showSymbol: true,
        symbolSize: 7,
        lineStyle: { color: t.palette.warning, width: 2.6, shadowBlur: 10, shadowColor: t.palette.warning },
        itemStyle: {
          color: t.palette.warning,
          borderColor: t.palette.warning,
          borderWidth: 0,
          shadowBlur: 12,
          shadowColor: t.palette.warning,
        },
      }),
    ],
  };
}

/**
 * 渲染图表
 */
function renderChart(): void {
  if (!chartData.value) return;
  const option = buildOption();
  if (getInstance()) {
    setOption(option);
  } else {
    initChart(option);
  }
}

function setDateRange(range: 7 | 30): void {
  if (dateRange.value !== range) dateRange.value = range;
}

// 监听 dateRange 变化，无感更新数据
watch(dateRange, () => {
  fetchData();
});

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="humidity-trend">
    <!-- 标题栏 + 日期切换 -->
    <header class="humidity-trend__header">
      <PanelHeading class="humidity-trend__title">湿度趋势</PanelHeading>
      <div class="humidity-trend__date-toggle" aria-label="数据范围">
        <button
          class="humidity-trend__date-btn"
          :class="{ 'is-active': dateRange === 7 }"
          type="button"
          @click="setDateRange(7)"
        >
          7日
        </button>
        <button
          class="humidity-trend__date-btn"
          :class="{ 'is-active': dateRange === 30 }"
          type="button"
          @click="setDateRange(30)"
        >
          30日
        </button>
      </div>
    </header>

    <!-- 图表区域 -->
    <div class="humidity-trend__body">
      <div ref="chartRef" class="humidity-trend__canvas"></div>

      <div v-if="loading" class="humidity-trend__state" aria-live="polite">
        <span class="humidity-trend__spinner" aria-hidden="true"></span>
        <span>正在获取湿度数据</span>
      </div>

      <div v-else-if="errorMsg" class="humidity-trend__state humidity-trend__state--error" role="alert">
        <span>{{ errorMsg }}</span>
        <button class="humidity-trend__retry" type="button" @click="fetchData">重新加载</button>
      </div>

      <div v-else-if="!chartData" class="humidity-trend__state">暂无数据</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.humidity-trend {
  @include shell.panel;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

.humidity-trend__header {
  @include shell.chart-header;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
}

.humidity-trend__title {
  grid-column: 2;
  justify-self: center;
}

.humidity-trend__date-toggle {
  display: flex;
  grid-column: 3;
  justify-self: end;
  flex-shrink: 0;
  gap: $spacing-xs;
}

.humidity-trend__date-btn {
  @include shell.filter-control;
  min-width: 40px;
  cursor: pointer;
  font-family: inherit;
}

.humidity-trend__body {
  position: relative;
  flex: 1;
  min-height: 0;
  background: transparent;
}

.humidity-trend__canvas {
  width: 100%;
  height: 100%;
}

.humidity-trend__state {
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

.humidity-trend__state--error { color: var(--danger); }

.humidity-trend__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: humidity-trend-spin 800ms linear infinite;
}

.humidity-trend__retry {
  @include shell.filter-control;
  cursor: pointer;
  font-family: inherit;
  font-size: $font-size-xs;
}

@keyframes humidity-trend-spin {
  to { transform: rotate(360deg); }
}
</style>
