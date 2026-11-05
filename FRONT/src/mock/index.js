// ============================================
// Mock 数据入口 - vite-plugin-mock 配置
// 使用默认导出 (v3+ 格式)
// ============================================
import { generateAlarmList } from './data/alarm';
import { generateBarChartData, generateGrainTempTrend, generateHumidityTrend, generateTempDetectData, generateGasDetectData, generateEnergyRankData, generateInsectDetectData } from './data/chart';
import { generateDeviceOverview } from './data/warehouse';
import { generateWarehouseList, generateWarehouseJob, generateWeatherData, generateMonitorIndicator, generateWarehouseStatusStats } from './data/warehouse';
/**
 * 生成标准响应格式
 */
const createResponse = (data) => ({
    code: 0,
    data,
    message: 'success',
});
/**
 * Mock API 配置列表 (vite-plugin-mock v3 默认导出格式)
 */
export default [
    // ----------------------------------------
    // 报警相关接口
    // ----------------------------------------
    {
        url: '/api/alarm/list',
        method: 'get',
        response: ({ query }) => {
            const days = parseInt(query.days, 10);
            return createResponse(generateAlarmList(days));
        },
    },
    // ----------------------------------------
    // 图表相关接口
    // ----------------------------------------
    {
        url: '/api/chart/bar',
        method: 'get',
        response: ({ query }) => {
            const warehouseId = query.warehouseId || 'Q01';
            const days = (parseInt(query.days, 10) || 7);
            return createResponse(generateBarChartData(warehouseId, days));
        },
    },
    {
        url: '/api/chart/grain-temp-trend',
        method: 'get',
        response: ({ query }) => {
            const days = (parseInt(query.days, 10) || 7);
            return createResponse(generateGrainTempTrend(days));
        },
    },
    {
        url: '/api/chart/humidity-trend',
        method: 'get',
        response: ({ query }) => {
            const days = (parseInt(query.days, 10) || 7);
            return createResponse(generateHumidityTrend(days));
        },
    },
    {
        url: '/api/chart/temp-detect',
        method: 'get',
        response: () => createResponse(generateTempDetectData()),
    },
    {
        url: '/api/chart/gas-detect',
        method: 'get',
        response: () => createResponse(generateGasDetectData()),
    },
    {
        url: '/api/chart/energy-rank',
        method: 'get',
        response: () => createResponse(generateEnergyRankData()),
    },
    {
        url: '/api/chart/insect-detect',
        method: 'get',
        response: () => createResponse(generateInsectDetectData()),
    },
    // ----------------------------------------
    // 设备相关接口
    // ----------------------------------------
    {
        url: '/api/device/overview',
        method: 'get',
        response: () => createResponse(generateDeviceOverview()),
    },
    // ----------------------------------------
    // 仓房相关接口
    // ----------------------------------------
    {
        url: '/api/warehouse/list',
        method: 'get',
        response: () => createResponse(generateWarehouseList()),
    },
    {
        url: '/api/warehouse/job',
        method: 'get',
        response: () => createResponse(generateWarehouseJob()),
    },
    {
        url: '/api/warehouse/weather',
        method: 'get',
        response: () => createResponse(generateWeatherData()),
    },
    {
        url: '/api/warehouse/indicator',
        method: 'get',
        response: () => createResponse(generateMonitorIndicator()),
    },
    {
        url: '/api/warehouse/status-stats',
        method: 'get',
        response: () => createResponse(generateWarehouseStatusStats()),
    },
];
