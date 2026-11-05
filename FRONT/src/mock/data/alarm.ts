// ============================================
// Mock 数据生成器 - 报警列表
// ============================================

import type { AlarmListType, AlarmDays } from '@/types';
import { generateWarehouseIds, randomInt, createRandom } from '../utils';

// 为每个天数实例化独立的随机数生成器（保证数据一致性）
const alarmRandom = createRandom('liangcang_alarm_v1');

/**
 * 生成报警仓房列表
 * @param days 连续报警天数
 * @returns 报警列表数据
 */
export const generateAlarmList = (days: AlarmDays): AlarmListType => {
  const warehouseIds = generateWarehouseIds();

  // 根据天数调整报警数量
  const alarmCountMap: Record<AlarmDays, { min: number; max: number }> = {
    1: { min: 4, max: 8 },
    2: { min: 2, max: 5 },
    3: { min: 1, max: 4 },
  };

  const { min, max } = alarmCountMap[days];
  const count = Math.floor(alarmRandom() * (max - min + 1)) + min;

  // 随机选取报警仓房
  const selectedWarehouses = warehouseIds
    .sort(() => alarmRandom() - 0.5)
    .slice(0, count);

  const alarmTypes = ['高温报警', '高湿报警', '气体异常', '粮温异常'];
  const now = '2026-08-16';

  const list = selectedWarehouses.map((warehouseId) => ({
    warehouseId,
    alarmType: alarmTypes[Math.floor(alarmRandom() * alarmTypes.length)],
    alarmTime: `${now} ${String(randomInt(8, 18)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`,
    value: parseFloat((alarmRandom() * 10 + 25).toFixed(1)),
  }));

  return {
    days,
    list,
    total: count,
    updateTime: now,
  };
};
