<script setup lang="ts">
// ============================================
// TemperatureChart - 温度检测折线图（Tab 内部组件）
// 功能：展示全部仓房的高温/均温/最高/最低温度折线图，并自动轮播可视窗口
// 数据来源：getTempDetectData() Mock 接口
// Green/Blue 主题切换实时同步颜色（不重新请求数据）
// 语义色（视觉规范 §17.4）：高温报警 danger / 平均温度 primary /
// 最高温度 danger(虚线) / 最低温度 success(虚线)
// ============================================

import { ref, onMounted, toRef, type Ref } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { useECharts } from '@/composables/useECharts';
import { createLoopingCategorySeries, useCategoryAutoScroll } from '@/composables/useCategoryAutoScroll';
import { getChartTheme } from '@/composables/chartTheme';
import { getTempDetectData } from '@/api/modules/chart';
import type { TempDetectType } from '@/types';
import type { EChartsOption } from 'echarts';

defineOptions({ name: 'TemperatureChart' });

const props = withDefaults(defineProps<{
  active?: boolean;
}>(), {
  active: false,
});
const isActive = toRef(props, 'active');

const themeStore = useThemeStore();

// 图表容器引用
const chartRef = ref<HTMLElement | null>(null);

// 数据
const chartData = ref<TempDetectType | null>(null);
const loading = ref(true);
const errorMsg = ref('');
const carouselStartIndex = ref(0);

// 使用 useECharts
const { initChart, setOption, getInstance } = useECharts(
  chartRef as Ref<HTMLElement | null>,
  { onThemeChange: () => renderChart() }
);
const { configure: configureAutoScroll } = useCategoryAutoScroll(isActive, (startIndex) => {
  carouselStartIndex.value = startIndex;
  renderChart();
});

/**
 * 获取数据
 */
async function fetchData(): Promise<void> {
  loading.value = true;
  errorMsg.value = '';
  try {
    const data = await getTempDetectData();
    if (data) {
      chartData.value = data;
      configureAutoScroll(data.warehouseIds.length);
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
  const loopedData = createLoopingCategorySeries(
    d.warehouseIds,
    [d.highTemp, d.avgTemp, d.maxTemp, d.minTemp],
    carouselStartIndex.value,
  );
  const pointLine = {
    showSymbol: true,
    symbol: 'circle',
    symbolSize: 6,
    smooth: true,
  };
  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDurationUpdate: 360,
    animationEasingUpdate: 'cubicOut',
    tooltip: { ...t.tooltip(), axisPointer: { type: 'shadow' } },
    legend: t.legend(['高温报警', '平均温度', '最高温度', '最低温度']),
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: t.categoryAxis(loopedData.categories, 0),
    yAxis: {
      ...t.valueAxis(),
      axisLabel: { color: t.text.tertiary, fontSize: 11, formatter: '{value}°C' },
    },
    series: [
      // 高温报警（danger 语义色）
      t.lineSeries({
        name: '高温报警',
        data: loopedData.series[0],
        ...pointLine,
        itemStyle: { color: t.palette.danger },
      }),
      // 平均温度（primary，主题色主系列）
      t.lineSeries({
        name: '平均温度',
        data: loopedData.series[1],
        ...pointLine,
        itemStyle: { color: t.palette.primary },
      }),
      // 最高温度（danger，虚线区分）
      t.lineSeries({
        name: '最高温度',
        data: loopedData.series[2],
        ...pointLine,
        smooth: false,
        lineStyle: { width: 2, type: 'dashed' },
        itemStyle: { color: t.palette.danger },
      }),
      // 最低温度（success，虚线区分）
      t.lineSeries({
        name: '最低温度',
        data: loopedData.series[3],
        ...pointLine,
        smooth: false,
        lineStyle: { width: 2, type: 'dashed' },
        itemStyle: { color: t.palette.success },
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
  // 如果实例已存在，setOption 更新；否则 initChart 初始化
  if (getInstance()) {
    setOption(option, false);
  } else {
    initChart(option);
  }
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="temperature-chart">
    <div ref="chartRef" class="temperature-chart__canvas"></div>

    <!-- 加载状态 -->
    <div v-if="loading" class="temperature-chart__state" aria-live="polite">
      <span class="temperature-chart__spinner" aria-hidden="true"></span>
      <span>正在获取温度数据</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="errorMsg" class="temperature-chart__state temperature-chart__state--error" role="alert">
      <span>{{ errorMsg }}</span>
      <button class="temperature-chart__retry" type="button" @click="fetchData">重新加载</button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!chartData" class="temperature-chart__state">暂无数据</div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.temperature-chart {
  width: 100%;
  height: 100%;
  position: relative;
}

.temperature-chart__canvas {
  width: 100%;
  height: 100%;
}

// --------------------------------------------
// 加载/错误/空状态
// --------------------------------------------
.temperature-chart__state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  background: color-mix(in srgb, var(--bg-panel) 80%, transparent);
  color: var(--text-tertiary);
  font-size: $font-size-sm;
  z-index: 5;
}

.temperature-chart__state--error { color: var(--danger); }

.temperature-chart__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: temperature-chart-spin 800ms linear infinite;
}

.temperature-chart__retry {
  @include shell.filter-control;
  cursor: pointer;
  font-family: inherit;
  font-size: $font-size-xs;
}

@keyframes temperature-chart-spin {
  to { transform: rotate(360deg); }
}
</style>
