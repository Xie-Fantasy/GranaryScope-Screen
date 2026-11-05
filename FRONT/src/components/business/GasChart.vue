<script setup lang="ts">
// ============================================
// GasChart - 气体检测折线图（Tab 内部组件）
// 功能：展示全部仓房的 CO2 / O2 / PH3 气体浓度折线图，并自动轮播可视窗口
// 数据来源：getGasDetectData() Mock 接口
// Green/Blue 主题切换实时同步颜色（不重新请求数据）
// 语义色（视觉规范 §17.4）：CO2 info（主监测气体，区别 O2）/
// O2 success（正常氧气）/ PH3 danger（危险熏蒸气体）
// ============================================

import { ref, onMounted, toRef, type Ref } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { useECharts } from '@/composables/useECharts';
import { createLoopingCategorySeries, useCategoryAutoScroll } from '@/composables/useCategoryAutoScroll';
import { CHART_SEMANTIC, createVerticalGradient, getChartTheme } from '@/composables/chartTheme';
import { getGasDetectData } from '@/api/modules/chart';
import type { GasDetectType } from '@/types';
import type { EChartsOption } from 'echarts';

defineOptions({ name: 'GasChart' });

const props = withDefaults(defineProps<{
  active?: boolean;
}>(), {
  active: false,
});
const isActive = toRef(props, 'active');

const themeStore = useThemeStore();

const chartRef = ref<HTMLElement | null>(null);
const chartData = ref<GasDetectType | null>(null);
const loading = ref(true);
const errorMsg = ref('');
const carouselStartIndex = ref(0);

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
    const data = await getGasDetectData();
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
    [d.co2, d.o2, d.ph3],
    carouselStartIndex.value,
  );
  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDurationUpdate: 360,
    animationEasingUpdate: 'cubicOut',
    tooltip: { ...t.tooltip(), axisPointer: { type: 'shadow' } },
    legend: t.legend(['CO2', 'O2', 'PH3']),
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: t.categoryAxis(loopedData.categories, 0),
    yAxis: [
      { ...t.valueAxis('CO2(ppm)'), position: 'left' },
      { ...t.valueAxis('O2/PH3(%)'), position: 'right', splitLine: { show: false } },
    ],
    series: [
      // 三条曲线均采用各自颜色的低透明面积渐变。
      t.lineSeries({
        name: 'CO2',
        data: loopedData.series[0],
        itemStyle: { color: CHART_SEMANTIC.info },
        areaStyle: {
          color: createVerticalGradient(CHART_SEMANTIC.info, 0.24, 0.02),
        },
      }),
      // O2（success，正常氧气语义）
      t.lineSeries({
        name: 'O2',
        yAxisIndex: 1,
        data: loopedData.series[1],
        itemStyle: { color: t.palette.success },
        areaStyle: {
          color: createVerticalGradient(t.palette.success, 0.22, 0.02),
        },
      }),
      // PH3（danger，危险熏蒸气体语义）
      t.lineSeries({
        name: 'PH3',
        yAxisIndex: 1,
        data: loopedData.series[2],
        itemStyle: { color: t.palette.danger },
        areaStyle: {
          color: createVerticalGradient(t.palette.danger, 0.18, 0.01),
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
  <div class="gas-chart">
    <div ref="chartRef" class="gas-chart__canvas"></div>

    <div v-if="loading" class="gas-chart__state" aria-live="polite">
      <span class="gas-chart__spinner" aria-hidden="true"></span>
      <span>正在获取气体数据</span>
    </div>

    <div v-else-if="errorMsg" class="gas-chart__state gas-chart__state--error" role="alert">
      <span>{{ errorMsg }}</span>
      <button class="gas-chart__retry" type="button" @click="fetchData">重新加载</button>
    </div>

    <div v-else-if="!chartData" class="gas-chart__state">暂无数据</div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.gas-chart {
  width: 100%;
  height: 100%;
  position: relative;
}

.gas-chart__canvas {
  width: 100%;
  height: 100%;
}

.gas-chart__state {
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

.gas-chart__state--error { color: var(--danger); }

.gas-chart__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: gas-chart-spin 800ms linear infinite;
}

.gas-chart__retry {
  @include shell.filter-control;
  cursor: pointer;
  font-family: inherit;
  font-size: $font-size-xs;
}

@keyframes gas-chart-spin {
  to { transform: rotate(360deg); }
}
</style>
