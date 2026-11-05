// ============================================
// 全局 TypeScript 类型定义
// 与 API 类型联动
// ============================================

// --------------------------------------------
// 报警相关类型
// --------------------------------------------

/**
 * 报警天数类型
 */
export type AlarmDays = 1 | 2 | 3;

/**
 * 单个仓房报警信息
 */
export interface AlarmItem {
  warehouseId: string;
  alarmType: string;
  alarmTime: string;
  value?: number;
}

/**
 * 报警列表响应
 */
export interface AlarmListType {
  days: AlarmDays;
  list: AlarmItem[];
  total: number;
  updateTime: string;
}

// --------------------------------------------
// 图表相关类型
// --------------------------------------------

/**
 * 双柱状图数据点
 */
export interface BarChartDataPoint {
  date: string;
  totalAlarm: number;
  currentAlarm: number;
}

/**
 * 趋势图数据点
 */
export interface TrendDataPoint {
  date: string;
  value: number;
}

/**
 * 粮温趋势数据
 */
export interface GrainTempTrendType {
  dates: string[];
  outsideTemp: number[];
  maxTemp: number[];
  minTemp: number[];
  avgTemp: number[];
  alarmCount: number[];
}

/**
 * 湿度趋势数据
 */
export interface HumidityTrendType {
  dates: string[];
  insideHumidity: number[];
  outsideHumidity: number[];
  alarmCount: number[];
}

/**
 * 温度检测数据
 */
export interface TempDetectType {
  warehouseIds: string[];
  highTemp: number[];
  avgTemp: number[];
  maxTemp: number[];
  minTemp: number[];
}

/**
 * 气体检测数据
 */
export interface GasDetectType {
  warehouseIds: string[];
  co2: number[];
  o2: number[];
  ph3: number[];
}

/**
 * 能耗排行数据
 */
export interface EnergyRankType {
  warehouseId: string;
  energy: number;
  rank: number;
}

/**
 * 虫情检测数据
 */
export interface InsectDetectType {
  warehouseIds: string[];
  count: number[];
  level: string[];
}

// --------------------------------------------
// 设备相关类型
// --------------------------------------------

/**
 * 设备类型枚举
 */
export type DeviceType =
  | 'all'
  | 'grain'
  | 'gas'
  | 'insect'
  | 'low_temp'
  | 'window'
  | 'fan'
  | 'energy'
  | 'weather';

/**
 * 设备运行总览项
 */
export interface DeviceOverviewItem {
  deviceType: DeviceType;
  deviceName: string;
  total: number;
  abnormal: number;
  working: number;
}

/**
 * 设备运行总览响应
 */
export interface DeviceOverviewType {
  list: DeviceOverviewItem[];
  updateTime: string;
}

// --------------------------------------------
// 仓房相关类型
// --------------------------------------------

/**
 * 仓库作业类型
 */
export type JobType = 'temperature' | 'ventilation' | 'fumigation';

/**
 * 仓房作业信息
 */
export interface WarehouseJobItem {
  warehouseId: string;
  jobs: JobType[];
  status: 'normal' | 'warning' | 'danger';
}

/**
 * 仓房作业统计
 */
export interface WarehouseJobStats {
  total: number;
  testedIn3Days: number;
  tempAlarm: number;
  gasAlarm: number;
  ventilation: number;
  fumigation: number;
}

/**
 * 仓房作业总览响应
 */
export interface WarehouseJobType {
  stats: WarehouseJobStats;
  list: WarehouseJobItem[];
  updateTime: string;
}

/**
 * 仓房列表项
 */
export interface WarehouseItem {
  id: string;
  name: string;
  status: 'normal' | 'warning' | 'danger';
  currentTemp?: number;
}

// --------------------------------------------
// 气象相关类型
// --------------------------------------------

/**
 * 气象数据
 */
export interface WeatherType {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  windDirection: string;
  windDirectionEn?: string;
  pressure: number;
  condition: string;
  suggestion: string;
  suggestionStatus: 'suitable' | 'caution' | 'unsuitable';
  plannedInspections: {
    total: number;
    today: number;
  };
}

// --------------------------------------------
// UI 状态类型
// --------------------------------------------

/**
 * Tab 类型 - 仓储智能化页面
 */
export type IntelligentTab = 'temperature' | 'gas' | 'energy' | 'insect';

/**
 * 加载状态
 */
export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * 仓房状态统计（粮情检测页面）
 */
export interface WarehouseStatusStats {
  normal: number;
  tempAlarm: number;
  notDetected: number;
}

/**
 * 粮情检测页面指标卡数据
 */
export interface MonitorIndicatorType {
  maxWarehouseTemp: { warehouseId: string; value: number };
  maxGrainTemp: { warehouseId: string; value: number };
  totalPoints: number;
  alarmPoints3Days: number;
}
