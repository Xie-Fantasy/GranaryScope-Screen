// ============================================
// Mock 数据生成器 - 仓房相关数据
// ============================================
import { WAREHOUSE_TOTAL } from '../../constants/warehouse';
import { generateWarehouseIds, randomFloat, createRandom } from '../utils';
const warehouseRandom = createRandom('liangcang_warehouse_v1');
/**
 * 设备类型定义
 */
const DEVICE_TYPES = [
    { deviceType: 'all', deviceName: '全部' },
    { deviceType: 'grain', deviceName: '粮情' },
    { deviceType: 'gas', deviceName: '气体' },
    { deviceType: 'insect', deviceName: '虫情' },
    { deviceType: 'low_temp', deviceName: '低温' },
    { deviceType: 'window', deviceName: '自动仓窗' },
    { deviceType: 'fan', deviceName: '风机' },
    { deviceType: 'energy', deviceName: '能耗' },
    { deviceType: 'weather', deviceName: '气象' },
];
/**
 * 生成设备运行总览数据
 * @returns 设备运行总览数据
 */
export const generateDeviceOverview = () => {
    const list = DEVICE_TYPES.map((device) => ({
        ...device,
        total: Math.floor(warehouseRandom() * 8) + 1,
        abnormal: Math.floor(warehouseRandom() * 2),
        working: Math.floor(warehouseRandom() * 3),
    }));
    return {
        list,
        updateTime: '2026-08-16',
    };
};
/**
 * 生成仓房作业总览数据
 * @returns 仓房作业总览数据
 */
export const generateWarehouseJob = () => {
    const warehouseIds = generateWarehouseIds();
    const stats = {
        total: WAREHOUSE_TOTAL,
        testedIn3Days: 49,
        tempAlarm: 7,
        gasAlarm: 0,
        ventilation: 3,
        fumigation: 0,
    };
    const jobPatterns = [
        ['temperature'],
        ['temperature', 'ventilation'],
        ['temperature'],
        ['temperature', 'fumigation'],
    ];
    const statusPatterns = ['normal', 'normal', 'warning', 'normal', 'danger'];
    // 全量仓房用于右侧轮播列表，使用固定规律保证刷新后列表形态稳定。
    const workingWarehouses = warehouseIds.map((warehouseId, index) => ({
        warehouseId,
        jobs: jobPatterns[index % jobPatterns.length],
        status: statusPatterns[index % statusPatterns.length],
    }));
    return {
        stats,
        list: workingWarehouses,
        updateTime: '2026-08-16',
    };
};
/**
 * 生成仓房列表（Q01~Q95）
 * @returns 仓房列表
 */
export const generateWarehouseList = () => {
    const warehouseIds = generateWarehouseIds();
    return warehouseIds.map((id) => ({
        id,
        name: `${id} 号仓`,
        status: ['normal', 'normal', 'normal', 'warning', 'danger'][Math.floor(warehouseRandom() * 5)],
        currentTemp: randomFloat(18, 35, 1),
    }));
};
/**
 * 生成气象数据
 * @returns 气象数据
 */
export const generateWeatherData = () => {
    // 环境监测参考图的固定 Demo 数据；计划数量不代表真实调度任务。
    return {
        temperature: 22.7,
        humidity: 41,
        rainfall: 4.3,
        windSpeed: 6.7,
        windDirection: '西南风',
        windDirectionEn: 'SW',
        pressure: 1002,
        condition: '晴转多云',
        suggestion: '今日气象环境平和，适宜开展仓储作业',
        suggestionStatus: 'suitable',
        plannedInspections: { total: 0, today: 0 },
    };
};
/**
 * 生成粮情检测页面指标卡数据
 * @returns 指标卡数据
 */
export const generateMonitorIndicator = () => {
    const warehouseIds = generateWarehouseIds();
    return {
        maxWarehouseTemp: {
            warehouseId: warehouseIds[Math.floor(warehouseRandom() * 30)],
            value: randomFloat(28, 35, 1),
        },
        maxGrainTemp: {
            warehouseId: warehouseIds[Math.floor(warehouseRandom() * 30)],
            value: randomFloat(30, 40, 1),
        },
        totalPoints: 9969,
        alarmPoints3Days: 1311,
    };
};
/**
 * 生成仓房状态统计（粮情检测页面 3D 模型下方卡片）
 * @returns 仓房状态统计数据
 */
export const generateWarehouseStatusStats = () => ({
    normal: 42,
    tempAlarm: 7,
    notDetected: 23,
});
