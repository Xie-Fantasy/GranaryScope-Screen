// ============================================
// API 模块 - 设备相关接口
// ============================================

import request from '@/api/index';
import type { DeviceOverviewType } from '@/types';

/**
 * 获取设备运行总览
 * 包含：全部/粮情/气体/虫情/低温/自动仓窗/风机/能耗/气象 的设备统计
 * @returns 设备运行总览数据
 */
export const getDeviceOverview = () => {
  return request.get<DeviceOverviewType>('/device/overview');
};
