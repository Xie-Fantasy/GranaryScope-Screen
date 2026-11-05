// ============================================
// API 模块 - 图表数据接口
// ============================================
import request from '@/api/index';
/**
 * 获取双柱状图数据（异常报警监控）
 * @param warehouseId 仓房编号（Q01~Q95）
 * @param dateRange 时间范围（7/30）
 * @returns 双柱状图数据
 */
export const getBarChartData = (warehouseId, dateRange = 7) => {
    return request.get('/chart/bar', {
        params: { warehouseId, days: dateRange },
    });
};
/**
 * 获取粮温趋势数据（柱状图+折线图组合）
 * @param dateRange 时间范围（7/30）
 * @returns 粮温趋势数据
 */
export const getGrainTempTrend = (dateRange = 7) => {
    return request.get('/chart/grain-temp-trend', {
        params: { days: dateRange },
    });
};
/**
 * 获取湿度趋势数据
 * @param dateRange 时间范围（7/30）
 * @returns 湿度趋势数据
 */
export const getHumidityTrend = (dateRange = 7) => {
    return request.get('/chart/humidity-trend', {
        params: { days: dateRange },
    });
};
/**
 * 获取温度检测数据（Tab 图表）
 * @returns 温度检测数据
 */
export const getTempDetectData = () => {
    return request.get('/chart/temp-detect');
};
/**
 * 获取气体检测数据（Tab 图表）
 * @returns 气体检测数据
 */
export const getGasDetectData = () => {
    return request.get('/chart/gas-detect');
};
/**
 * 获取能耗排行数据（Tab 图表）
 * @returns 能耗排行数据
 */
export const getEnergyRankData = () => {
    return request.get('/chart/energy-rank');
};
/**
 * 获取虫情检测数据（Tab 图表）
 * @returns 虫情检测数据
 */
export const getInsectDetectData = () => {
    return request.get('/chart/insect-detect');
};
