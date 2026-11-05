// ============================================
// Axios 请求封装
// ============================================

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiResponse } from './types';

// 响应拦截器会直接解包业务数据，因此将 get 的返回值声明为业务类型，
// 避免组件误把 AxiosResponse 当成接口数据使用。
type ApiInstance = Omit<AxiosInstance, 'get'> & {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
};

// 创建 axios 实例
const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}) as unknown as ApiInstance;

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 可在此添加 token 等认证信息
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;

    // Mock 数据直接返回，不做 code 校验
    if (res && typeof res.code === 'number') {
      if (res.code === 0 || res.code === 200) {
        return res.data as any;
      } else {
        console.warn('[API Response Warning]', res.message || '请求失败');
        return Promise.reject(new Error(res.message || '请求失败'));
      }
    }

    // 兼容非标准格式（如 mockjs 直接返回数据）
    return response.data as any;
  },
  (error) => {
    console.error('[API Response Error]', error.message || '网络错误');
    return Promise.reject(error);
  }
);

export default service;
export { service };
