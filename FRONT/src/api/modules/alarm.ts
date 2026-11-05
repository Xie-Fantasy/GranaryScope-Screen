// ============================================
// API 模块 - 报警相关接口
// ============================================

import request from '@/api/index';
import type { AlarmListType, AlarmDays } from '@/types';

/**
 * 获取报警仓房列表（连续 N 日）
 * @param days 连续报警天数（1/2/3）
 * @returns 报警列表数据
 */
export const getAlarmList = (days: AlarmDays) => {
  return request.get<AlarmListType>('/alarm/list', { params: { days } });
};

/**
 * 获取当日报警列表
 */
export const getTodayAlarm = () => getAlarmList(1);

/**
 * 获取持续 2 日报警列表
 */
export const getTwoDayAlarm = () => getAlarmList(2);

/**
 * 获取持续 3 日报警列表
 */
export const getThreeDayAlarm = () => getAlarmList(3);
