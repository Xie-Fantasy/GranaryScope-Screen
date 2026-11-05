// ============================================
// Mock 工具函数
// 固定 seed 保证每次刷新数据一致
// ============================================

import seedrandom from 'seedrandom';
import { WAREHOUSE_TOTAL } from '../../constants/warehouse';

// 固定种子 - 确保刷新后数据不变
const MOCK_SEED = 'liangcang_2026_design_v1';

/**
 * 创建带种子的伪随机数生成器
 * @param seed 可选自定义种子
 * @returns 伪随机数生成函数
 */
export const createRandom = (seed: string = MOCK_SEED) => {
  return seedrandom(seed);
};

// 实例化随机数生成器
const seededRandom = createRandom(MOCK_SEED);

/**
 * 获取随机整数 [min, max]
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
};

/**
 * 获取随机浮点数 [min, max)，保留指定位数小数
 */
export const randomFloat = (min: number, max: number, decimals: number = 1): number => {
  const value = seededRandom() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
};

/**
 * 从数组中随机选取 N 个元素（不重复）
 */
export const randomPick = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => seededRandom() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
};

/**
 * 获取最近 N 天的日期数组（含今天）
 * @param days 天数（默认 7）
 * @returns 日期字符串数组（格式：MM-DD）
 */
export const getRecentDates = (days: number = 7): string[] => {
  const dates: string[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dates.push(`${month}-${day}`);
  }

  return dates;
};

/**
 * 生成仓房编号列表 Q01~全库仓房数量
 */
export const generateWarehouseIds = (): string[] => {
  const ids: string[] = [];
  for (let i = 1; i <= WAREHOUSE_TOTAL; i++) {
    ids.push(`Q${String(i).padStart(2, '0')}`);
  }
  return ids;
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0;
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      func.apply(this, args);
      lastTime = now;
    }
  };
};
