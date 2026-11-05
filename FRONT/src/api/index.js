// ============================================
// Axios 请求封装
// ============================================
import axios from 'axios';
// 创建 axios 实例
const service = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});
// 请求拦截器
service.interceptors.request.use((config) => {
    // 可在此添加 token 等认证信息
    return config;
}, (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
});
// 响应拦截器
service.interceptors.response.use((response) => {
    const res = response.data;
    // Mock 数据直接返回，不做 code 校验
    if (res && typeof res.code === 'number') {
        if (res.code === 0 || res.code === 200) {
            return res.data;
        }
        else {
            console.warn('[API Response Warning]', res.message || '请求失败');
            return Promise.reject(new Error(res.message || '请求失败'));
        }
    }
    // 兼容非标准格式（如 mockjs 直接返回数据）
    return response.data;
}, (error) => {
    console.error('[API Response Error]', error.message || '网络错误');
    return Promise.reject(error);
});
export default service;
export { service };
