// ============================================
// API 模块 - 仓房相关接口
// ============================================
import request from '@/api/index';
/**
 * 获取仓房列表（Q01~Q95）
 * @returns 仓房列表
 */
export const getWarehouseList = () => {
    return request.get('/warehouse/list');
};
/**
 * 获取仓房作业总览
 * 包含：仓房总数、三日内已测温、温湿报警、气体报警、通风作业、熏蒸作业
 * @returns 仓房作业总览数据
 */
export const getWarehouseJob = () => {
    return request.get('/warehouse/job');
};
/**
 * 获取气象数据
 * @returns 气象数据
 */
export const getWeatherData = () => {
    return request.get('/warehouse/weather');
};
/**
 * 获取粮情检测页面指标卡数据
 * 包含：最高仓温、最高粮温、测温总点数、三日内报警点数
 * @returns 指标卡数据
 */
export const getMonitorIndicator = () => {
    return request.get('/warehouse/indicator');
};
/**
 * 获取仓房状态统计（粮情检测页面 3D 模型下方卡片）
 * 包含：粮情正常、温湿异常、今日未检测
 * @returns 仓房状态统计数据
 */
export const getWarehouseStatusStats = () => {
    return request.get('/warehouse/status-stats');
};
