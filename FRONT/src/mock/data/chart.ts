// ============================================
// Mock 数据生成器 - 图表数据
// ============================================

import type {
  BarChartDataPoint,
  GrainTempTrendType,
  HumidityTrendType,
  TempDetectType,
  GasDetectType,
  EnergyRankType,
  InsectDetectType,
} from '@/types';
import { generateWarehouseIds, randomInt, randomFloat, createRandom, getRecentDates } from '../utils';

const chartRandom = createRandom('liangcang_chart_v1');

/**
 * 生成双柱状图数据（全库总数 + 当前仓房单日报警数）
 * @param warehouseId 当前选中仓房编号
 * @param days 天数范围（7/30）
 * @returns 双柱状图数据点数组
 */
export const generateBarChartData = (
  _warehouseId: string,
  days: 7 | 30 = 7
): BarChartDataPoint[] => {
  const dates = getRecentDates(days);

  return dates.map((date, index) => {
    // 固定柱：全库报警总数（灰色）
    const totalAlarm = Math.floor(chartRandom() * 20) + 5;

    // 变化柱：当前仓房单日报警数（主色）
    const currentAlarm = index === days - 1
      ? Math.floor(chartRandom() * 5) // 当日
      : Math.floor(chartRandom() * 8);

    return {
      date,
      totalAlarm,
      currentAlarm: index === dates.length - 1 ? 0 : currentAlarm, // 当日暂未结束，显示 0
    };
  });
};

/**
 * 生成粮温趋势数据（柱状图 + 折线图组合）
 * @param days 天数范围（7/30）
 * @returns 粮温趋势数据
 */
export const generateGrainTempTrend = (days: 7 | 30 = 7): GrainTempTrendType => {
  const dates = getRecentDates(days);

  const outsideTemp = dates.map(() => randomFloat(15, 35, 1));
  const maxTemp = dates.map(() => randomFloat(28, 40, 1));
  const minTemp = dates.map(() => randomFloat(15, 25, 1));
  const avgTemp = dates.map((_, i) => parseFloat(((maxTemp[i] + minTemp[i]) / 2).toFixed(1)));
  const alarmCount = dates.map(() => Math.floor(chartRandom() * 15));

  return {
    dates,
    outsideTemp,
    maxTemp,
    minTemp,
    avgTemp,
    alarmCount,
  };
};

/**
 * 生成湿度趋势数据
 * @param days 天数范围（7/30）
 * @returns 湿度趋势数据
 */
export const generateHumidityTrend = (days: 7 | 30 = 7): HumidityTrendType => {
  const dates = getRecentDates(days);

  const insideHumidity = dates.map(() => randomFloat(40, 70, 1));
  const outsideHumidity = dates.map(() => randomFloat(30, 85, 1));
  const alarmCount = dates.map(() => Math.floor(chartRandom() * 10));

  return {
    dates,
    insideHumidity,
    outsideHumidity,
    alarmCount,
  };
};

/**
 * 生成温度检测数据
 * @returns 温度检测数据（全库仓房）
 */
export const generateTempDetectData = (): TempDetectType => {
  const warehouseIds = generateWarehouseIds();
  const targetWarehouses = warehouseIds;

  return {
    warehouseIds: targetWarehouses,
    highTemp: targetWarehouses.map(() => randomFloat(28, 38, 1)),
    avgTemp: targetWarehouses.map(() => randomFloat(18, 28, 1)),
    maxTemp: targetWarehouses.map(() => randomFloat(35, 42, 1)),
    minTemp: targetWarehouses.map(() => randomFloat(12, 20, 1)),
  };
};

/**
 * 生成气体检测数据
 * @returns 气体检测数据（全库仓房）
 */
export const generateGasDetectData = (): GasDetectType => {
  const warehouseIds = generateWarehouseIds();
  const targetWarehouses = warehouseIds;

  return {
    warehouseIds: targetWarehouses,
    co2: targetWarehouses.map(() => randomFloat(0, 2000, 0)),
    o2: targetWarehouses.map(() => randomFloat(18, 21, 1)),
    ph3: targetWarehouses.map(() => randomFloat(0, 0.3, 2)),
  };
};

/**
 * 生成能耗排行数据
 * @returns 能耗排行数据（前 15 个仓房）
 */
export const generateEnergyRankData = (): EnergyRankType[] => {
  const warehouseIds = generateWarehouseIds();
  const targetWarehouses = warehouseIds.slice(0, 15);

  return targetWarehouses.map((warehouseId, index) => ({
    warehouseId,
    energy: randomFloat(100, 500, 1),
    rank: index + 1,
  }));
};

/**
 * 生成虫情检测数据
 * @returns 虫情检测数据（全库仓房）
 */
export const generateInsectDetectData = (): InsectDetectType => {
  const warehouseIds = generateWarehouseIds();
  const targetWarehouses = warehouseIds;

  return {
    warehouseIds: targetWarehouses,
    count: targetWarehouses.map(() => randomInt(0, 50)),
    level: targetWarehouses.map(() => {
      const rand = chartRandom();
      if (rand < 0.5) return '无';
      if (rand < 0.7) return '轻微';
      if (rand < 0.85) return '轻度';
      if (rand < 0.95) return '中度';
      return '严重';
    }),
  };
};
