<script setup lang="ts">
// ============================================
// InsectChart - 虫情检测 2.5D 柱状图（Tab 内部组件）
// 功能：展示全部仓房的虫情检测数量，并通过渐变正面、顶面、侧面和底面形成 2.5D 效果
// 数据来源：getInsectDetectData() Mock 接口
// Green/Blue 主题切换实时同步颜色（不重新请求数据）
// 等级语义色（视觉规范 §5，双主题一致）：
// 无 success / 轻微 info / 轻度 warning / 中度 danger / 严重 dangerStrong
// ============================================

import { ref, onMounted, toRef, type Ref } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { useECharts } from '@/composables/useECharts';
import { createLoopingCategorySeries, useCategoryAutoScroll } from '@/composables/useCategoryAutoScroll';
import {
  adjustColor,
  CHART_SEMANTIC,
  createVerticalGradient,
  getChartTheme,
} from '@/composables/chartTheme';
import { getInsectDetectData } from '@/api/modules/chart';
import type { InsectDetectType } from '@/types';
import type { CustomSeriesRenderItem, CustomSeriesRenderItemAPI, EChartsOption } from 'echarts';

defineOptions({ name: 'InsectChart' });

const props = withDefaults(defineProps<{
  active?: boolean;
}>(), {
  active: false,
});
const isActive = toRef(props, 'active');

const themeStore = useThemeStore();

const chartRef = ref<HTMLElement | null>(null);
const chartData = ref<InsectDetectType | null>(null);
const loading = ref(true);
const errorMsg = ref('');
const carouselStartIndex = ref(0);

const BAR_DEPTH = 6;
const BAR_WIDTH_RATIO = 0.52;

interface InsectBarLayout {
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
    const data = await getInsectDetectData();
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

function getBarLayout(api: CustomSeriesRenderItemAPI): InsectBarLayout | null {
  const categoryIndex = Number(api.value(0));
  const value = Number(api.value(1));
  const color = String(api.value(2));
  if (!Number.isFinite(value) || value <= 0) return null;

  const [centerX, top] = api.coord([categoryIndex, value]);
  const [, bottom] = api.coord([categoryIndex, 0]);
  const categorySize = api.size?.([1, 0]);
  const categoryWidth = Array.isArray(categorySize) ? categorySize[0] : categorySize;
  const barWidth = Math.max(4, (categoryWidth ?? 0) * BAR_WIDTH_RATIO);

  return {
    color,
    frontLeft: centerX - barWidth / 2,
    frontRight: centerX + barWidth / 2,
    width: barWidth,
    top,
    bottom,
  };
}

const renderSideFace: CustomSeriesRenderItem = (_params, api) => {
  const bar = getBarLayout(api);
  if (!bar) return;

  return {
    // 矩形的 y / height 是可插值数值：与正面柱体从基线同步生长或收缩。
    type: 'rect',
    shape: {
      x: bar.frontRight,
      y: bar.top - BAR_DEPTH,
      width: BAR_DEPTH,
      height: bar.bottom - bar.top,
    },
    style: { fill: adjustColor(bar.color, -0.38) },
    transition: ['shape'],
    enterFrom: {
      shape: {
        x: bar.frontRight,
        y: bar.bottom - BAR_DEPTH,
        width: BAR_DEPTH,
        height: 0,
      },
    },
  };
};

const renderTopFace: CustomSeriesRenderItem = (_params, api) => {
  const bar = getBarLayout(api);
  if (!bar) return;

  return {
    // 顶面只随柱高移动；用 group 的数值 y 过渡，避免 polygon points 数组跳帧。
    type: 'group',
    x: bar.frontLeft,
    y: bar.top,
    transition: ['x', 'y'],
    enterFrom: { x: bar.frontLeft, y: bar.bottom },
    children: [
      {
        type: 'polygon',
        shape: {
          points: [
            [0, 0],
            [bar.width, 0],
            [bar.width + BAR_DEPTH, -BAR_DEPTH],
            [BAR_DEPTH, -BAR_DEPTH],
          ],
        },
        style: { fill: adjustColor(bar.color, 0.28) },
      },
    ],
  };
};

const renderBottomFace: CustomSeriesRenderItem = (_params, api) => {
  const bar = getBarLayout(api);
  if (!bar) return;

  return {
    // 底面固定锚定基线：它是接地面，不应横向扫入而与柱体升降脱节。
    type: 'group',
    x: bar.frontLeft,
    y: bar.bottom,
    children: [
      {
        type: 'polygon',
        shape: {
          points: [
            [0, 0],
            [bar.width, 0],
            [bar.width + BAR_DEPTH, -BAR_DEPTH],
            [BAR_DEPTH, -BAR_DEPTH],
          ],
        },
        style: {
          fill: adjustColor(bar.color, -0.06),
          opacity: 0.92,
          transition: ['opacity'],
        },
        enterFrom: { shape: {}, style: { opacity: 0 } },
      },
    ],
  };
};

/**
 * 构建图表配置
 */
function buildOption(): EChartsOption {
  if (!chartData.value) return {};

  const t = getChartTheme(themeStore.theme);
  const d = chartData.value;

  // 根据虫情等级设置语义色（跨主题一致）
  const barColors = d.level.map((level) => {
    switch (level) {
      case '无': return CHART_SEMANTIC.success;
      case '轻微': return CHART_SEMANTIC.info;
      case '轻度': return CHART_SEMANTIC.warning;
      case '中度': return CHART_SEMANTIC.danger;
      case '严重': return CHART_SEMANTIC.dangerStrong;
      default: return CHART_SEMANTIC.info;
    }
  });
  const loopedData = createLoopingCategorySeries(
    d.warehouseIds,
    [d.count, d.level, barColors],
    carouselStartIndex.value,
  );
  const faceData = loopedData.series[0].map((value, index) => [
    index,
    Number(value),
    String(loopedData.series[2][index]),
  ]);

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 360,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 360,
    animationEasingUpdate: 'cubicOut',
    tooltip: {
      ...t.tooltip(),
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const p = Array.isArray(params) ? params[0] : params;
        const idx = (p as { dataIndex?: number }).dataIndex ?? 0;
        if (!loopedData.categories[idx]) return '';
        const level = String(loopedData.series[1][idx] || '无');
        const count = Number(loopedData.series[0][idx] || 0);
        return `${loopedData.categories[idx]}<br/>虫情数量：${count}<br/>等级：${level}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: t.categoryAxis(loopedData.categories, 0),
    yAxis: t.valueAxis('数量'),
    series: [
      // 底面在正面下层，以基线收口，保持右下方的纵深。
      {
        name: '虫情数量底面',
        type: 'custom',
        data: faceData,
        renderItem: renderBottomFace,
        silent: true,
        tooltip: { show: false },
        z: 0,
      },
      // 侧面置于正面下层，使用同一数据和坐标轴，随轮播同步更新。
      {
        name: '虫情数量侧面',
        type: 'custom',
        data: faceData,
        renderItem: renderSideFace,
        silent: true,
        tooltip: { show: false },
        z: 1,
      },
      {
        name: '虫情数量',
        type: 'bar',
        data: loopedData.series[0].map((val, idx) => ({
          value: Number(val),
          itemStyle: {
            color: createVerticalGradient(String(loopedData.series[2][idx]), 0.98, 0.38),
          },
        })),
        barWidth: `${BAR_WIDTH_RATIO * 100}%`,
        itemStyle: {
          borderRadius: [1, 1, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          distance: BAR_DEPTH + 3,
          color: t.text.tertiary,
          fontSize: 10,
        },
        z: 2,
      },
      // 顶面覆盖于正面，补出受光面，不引入 3D/WebGL 依赖。
      {
        name: '虫情数量顶面',
        type: 'custom',
        data: faceData,
        renderItem: renderTopFace,
        silent: true,
        tooltip: { show: false },
        z: 3,
      },
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
  <div class="insect-chart">
    <div ref="chartRef" class="insect-chart__canvas"></div>

    <div v-if="loading" class="insect-chart__state" aria-live="polite">
      <span class="insect-chart__spinner" aria-hidden="true"></span>
      <span>正在获取虫情数据</span>
    </div>

    <div v-else-if="errorMsg" class="insect-chart__state insect-chart__state--error" role="alert">
      <span>{{ errorMsg }}</span>
      <button class="insect-chart__retry" type="button" @click="fetchData">重新加载</button>
    </div>

    <div v-else-if="!chartData" class="insect-chart__state">暂无数据</div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.insect-chart {
  width: 100%;
  height: 100%;
  position: relative;
}

.insect-chart__canvas {
  width: 100%;
  height: 100%;
}

.insect-chart__state {
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

.insect-chart__state--error { color: var(--danger); }

.insect-chart__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: insect-chart-spin 800ms linear infinite;
}

.insect-chart__retry {
  @include shell.filter-control;
  cursor: pointer;
  font-family: inherit;
  font-size: $font-size-xs;
}

@keyframes insect-chart-spin {
  to { transform: rotate(360deg); }
}
</style>
