<script setup lang="ts">
import PanelHeading from '@/components/common/PanelHeading.vue';
// ============================================
// GrainTempTrend - 粮温趋势组合图表
// 功能：柱状图（报警数）+ 折线图（外温/粮温均值/最高粮温/最低粮温）
// 数据来源：getGrainTempTrend(dateRange) Mock 接口
// 说明：
// - 支持 7日/30日切换，无感更新数据（setOption 不重建实例）
// - Green/Blue 主题切换实时同步颜色（不重新请求数据）
// 视觉色：报警数使用主题色渐变（本轮视觉要求）/ 外温 warning /
// 粮温均值 primary / 最高粮温 danger(虚线) / 最低粮温 success(虚线)
// ============================================

import { ref, onMounted, watch, type Ref } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { useECharts } from '@/composables/useECharts';
import { createVerticalGradient, getChartTheme } from '@/composables/chartTheme';
import { getGrainTempTrend } from '@/api/modules/chart';
import type { GrainTempTrendType } from '@/types';
import type { EChartsOption } from 'echarts';

defineOptions({ name: 'GrainTempTrend' });

// 仅服务本图表，切换不影响异常报警或湿度趋势。
const dateRange = ref<7 | 30>(7);
const themeStore = useThemeStore();

// 图表容器
const chartRef = ref<HTMLElement | null>(null);
// 数据
const chartData = ref<GrainTempTrendType | null>(null);
// 加载状态
const loading = ref(true);
// 错误信息
const errorMsg = ref('');

const { initChart, setOption, getInstance } = useECharts(
  chartRef as Ref<HTMLElement | null>,
  { onThemeChange: () => renderChart() }
);

/**
 * 获取数据
 */
async function fetchData(): Promise<void> {
  loading.value = true;
  errorMsg.value = '';
  try {
    const data = await getGrainTempTrend(dateRange.value);
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
  return {
    backgroundColor: 'transparent',
    tooltip: { ...t.tooltip(), axisPointer: { type: 'cross' } },
    legend: t.legend(['报警数', '外温', '粮温均值', '最高粮温', '最低粮温']),
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
      { ...t.valueAxis('温度(°C)'), position: 'right', splitLine: { show: false } },
    ],
    series: [
      // 柱状图：以主题青色渐变呈现，亮顶到透明底与趋势线保持清晰分层。
      {
        name: '报警数',
        type: 'bar',
        data: d.alarmCount,
        barWidth: '40%',
        itemStyle: {
          color: createVerticalGradient(t.palette.primary, 0.98, 0.12),
          borderRadius: [2, 2, 0, 0],
        },
      },
      // 折线图：外温（warning）
      t.lineSeries({
        name: '外温',
        yAxisIndex: 1,
        data: d.outsideTemp,
        smooth: true,
        showSymbol: true,
        symbolSize: 6,
        lineStyle: { color: t.palette.warning, width: 2.3, shadowBlur: 9, shadowColor: t.palette.warning },
        itemStyle: { color: t.palette.warning, borderColor: t.palette.warning, borderWidth: 0, shadowBlur: 10, shadowColor: t.palette.warning },
      }),
      // 折线图：粮温均值（primary，主题色）
      t.lineSeries({
        name: '粮温均值',
        yAxisIndex: 1,
        data: d.avgTemp,
        smooth: true,
        showSymbol: true,
        symbolSize: 6,
        lineStyle: { color: t.palette.primary, width: 2.3, shadowBlur: 9, shadowColor: t.palette.primary },
        itemStyle: { color: t.palette.primary, borderColor: t.palette.primary, borderWidth: 0, shadowBlur: 10, shadowColor: t.palette.primary },
      }),
      // 折线图：最高粮温（danger，虚线区分）
      t.lineSeries({
        name: '最高粮温',
        yAxisIndex: 1,
        data: d.maxTemp,
        smooth: false,
        showSymbol: true,
        symbolSize: 6,
        lineStyle: { color: t.palette.danger, width: 2.3, shadowBlur: 9, shadowColor: t.palette.danger },
        itemStyle: { color: t.palette.danger, borderColor: t.palette.danger, borderWidth: 0, shadowBlur: 10, shadowColor: t.palette.danger },
      }),
      // 折线图：最低粮温（success，虚线区分）
      t.lineSeries({
        name: '最低粮温',
        yAxisIndex: 1,
        data: d.minTemp,
        smooth: false,
        showSymbol: true,
        symbolSize: 6,
        lineStyle: { color: t.palette.success, width: 2.3, shadowBlur: 9, shadowColor: t.palette.success },
        itemStyle: { color: t.palette.success, borderColor: t.palette.success, borderWidth: 0, shadowBlur: 10, shadowColor: t.palette.success },
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
  <div class="grain-temp-trend">
    <!-- 标题栏 + 日期切换 -->
    <header class="grain-temp-trend__header">
      <PanelHeading class="grain-temp-trend__title">粮温趋势</PanelHeading>
      <div class="grain-temp-trend__date-toggle" aria-label="数据范围">
        <button
          class="grain-temp-trend__date-btn"
          :class="{ 'is-active': dateRange === 7 }"
          type="button"
          @click="setDateRange(7)"
        >
          7日
        </button>
        <button
          class="grain-temp-trend__date-btn"
          :class="{ 'is-active': dateRange === 30 }"
          type="button"
          @click="setDateRange(30)"
        >
          30日
        </button>
      </div>
    </header>

    <!-- 图表区域 -->
    <div class="grain-temp-trend__body">
      <div ref="chartRef" class="grain-temp-trend__canvas"></div>

      <div v-if="loading" class="grain-temp-trend__state" aria-live="polite">
        <span class="grain-temp-trend__spinner" aria-hidden="true"></span>
        <span>正在获取粮温数据</span>
      </div>

      <div v-else-if="errorMsg" class="grain-temp-trend__state grain-temp-trend__state--error" role="alert">
        <span>{{ errorMsg }}</span>
        <button class="grain-temp-trend__retry" type="button" @click="fetchData">重新加载</button>
      </div>

      <div v-else-if="!chartData" class="grain-temp-trend__state">暂无数据</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.grain-temp-trend {
  @include shell.panel;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

.grain-temp-trend__header {
  @include shell.chart-header;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
}

.grain-temp-trend__title {
  grid-column: 2;
  justify-self: center;
}

.grain-temp-trend__date-toggle {
  display: flex;
  grid-column: 3;
  justify-self: end;
  flex-shrink: 0;
  gap: $spacing-xs;
}

.grain-temp-trend__date-btn {
  @include shell.filter-control;
  min-width: 40px;
  cursor: pointer;
  font-family: inherit;
}

.grain-temp-trend__body {
  position: relative;
  flex: 1;
  min-height: 0;
  background: transparent;
}

.grain-temp-trend__canvas {
  width: 100%;
  height: 100%;
}

.grain-temp-trend__state {
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

.grain-temp-trend__state--error { color: var(--danger); }

.grain-temp-trend__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: grain-temp-trend-spin 800ms linear infinite;
}

.grain-temp-trend__retry {
  @include shell.filter-control;
  cursor: pointer;
  font-family: inherit;
  font-size: $font-size-xs;
}

@keyframes grain-temp-trend-spin {
  to { transform: rotate(360deg); }
}
</style>
