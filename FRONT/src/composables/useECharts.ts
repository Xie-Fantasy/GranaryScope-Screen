// ============================================
// useECharts 组合式函数
// 统一管理 ECharts 实例的生命周期：
// - 主题切换实时同步（onThemeChange 回调，无需刷新页面/重新请求数据）
// - 隐藏容器（v-show Tab）零尺寸安全：延迟初始化，容器可见后自动 init
// - ResizeObserver 响应式（禁止 window.resize）
// ============================================

import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart, CustomChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsCoreOption, ECharts } from 'echarts/core';
import { useThemeStore } from '@/store/modules/theme';

// 按需注册 ECharts 组件
echarts.use([
  BarChart,
  CustomChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
]);

export interface UseEChartsOptions {
  /** 是否自动监听容器尺寸变化（默认 true） */
  autoResize?: boolean;
  /** resize 防抖延迟（ms，默认 100） */
  resizeDelay?: number;
  /**
   * Green/Blue 主题切换时的重建回调。
   * 视觉规范 §25：切换主题后可见图表必须立即同步颜色。
   * 回调内应使用缓存数据重建 option 并 setOption，禁止重新请求数据。
   */
  onThemeChange?: () => void;
}

/**
 * useECharts 组合式函数
 * @param containerRef 容器 DOM 引用
 * @param options 配置项
 */
export function useECharts(
  containerRef: Ref<HTMLElement | null>,
  options: UseEChartsOptions = {}
) {
  const { autoResize = true, resizeDelay = 100, onThemeChange } = options;

  let chartInstance: ECharts | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;
  /** 容器零尺寸（隐藏 Tab）时暂存的 option，容器可见后自动初始化 */
  let pendingOption: EChartsCoreOption | null = null;

  // Green/Blue 主题切换 → 实时重建 option（不销毁实例、不重新请求）
  const themeStore = useThemeStore();
  watch(
    () => themeStore.theme,
    () => {
      if (onThemeChange) {
        onThemeChange();
      }
    }
  );

  /**
   * 初始化图表
   * @param option ECharts 配置项
   */
  const initChart = (option: EChartsCoreOption) => {
    if (!containerRef.value) {
      console.warn('[useECharts] 容器 DOM 不存在，无法初始化');
      return;
    }

    const { clientWidth, clientHeight } = containerRef.value;
    if (clientWidth === 0 || clientHeight === 0) {
      // 隐藏容器（v-show Tab）：暂存 option，待容器可见后由 ResizeObserver 触发初始化
      pendingOption = option;
      if (autoResize) {
        startResizeObserver();
      }
      return;
    }

    _doInit(option);
  };

  /**
   * 执行初始化图表实例
   */
  const _doInit = (option: EChartsCoreOption) => {
    if (!containerRef.value) return;

    nextTick(() => {
      if (!containerRef.value) return;

      // 如果实例已存在，先销毁
      if (chartInstance) {
        chartInstance.dispose();
      }

      // 颜色全部由各组件 option 显式声明（chartTheme 提供），
      // 不使用 init 时固定的全局主题，保证主题切换后可实时重建。
      chartInstance = echarts.init(containerRef.value);

      if (option) {
        chartInstance.setOption(option);
      }

      // 启动 ResizeObserver 监听容器尺寸变化
      if (autoResize) {
        startResizeObserver();
      }
    });
  };

  /**
   * 设置/更新图表配置
   * @param option ECharts 配置项
   * @param notMerge 是否不合并（默认 true，完全替换）
   */
  const setOption = (option: EChartsCoreOption, notMerge = true) => {
    if (!chartInstance) {
      console.warn('[useECharts] 图表实例未初始化');
      return;
    }
    chartInstance.setOption(option, notMerge);
  };

  /**
   * 手动触发 resize
   */
  const resize = () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  };

  /**
   * 启动 ResizeObserver（同时承担"隐藏容器变为可见后初始化"的职责）
   */
  const startResizeObserver = () => {
    if (!containerRef.value || resizeObserver) return;

    resizeObserver = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // 隐藏 Tab 转为可见：完成延迟初始化
        if (
          !chartInstance &&
          pendingOption &&
          containerRef.value &&
          containerRef.value.clientWidth > 0 &&
          containerRef.value.clientHeight > 0
        ) {
          const option = pendingOption;
          pendingOption = null;
          _doInit(option);
          return;
        }
        resize();
      }, resizeDelay);
    });

    resizeObserver.observe(containerRef.value);
  };

  /**
   * 停止 ResizeObserver
   */
  const stopResizeObserver = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (resizeTimer) {
      clearTimeout(resizeTimer);
      resizeTimer = null;
    }
  };

  /**
   * 销毁图表实例
   */
  const dispose = () => {
    stopResizeObserver();
    pendingOption = null;
    if (chartInstance) {
      chartInstance.dispose();
      chartInstance = null;
    }
  };

  // 组件卸载时自动清理
  onBeforeUnmount(() => {
    dispose();
  });

  /**
   * 获取当前图表实例（高级用法）
   */
  const getInstance = () => chartInstance;

  return {
    initChart,
    setOption,
    resize,
    dispose,
    getInstance,
  };
}

/**
 * 空状态配置（图表无数据时显示）
 */
export const emptyChartOption: EChartsCoreOption = {
  title: {
    text: '暂无数据',
    left: 'center',
    top: 'center',
    textStyle: {
      color: '#7F9194',
      fontSize: 14,
    },
  },
  backgroundColor: 'transparent',
};

export default useECharts;
