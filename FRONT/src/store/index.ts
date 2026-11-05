// ============================================
// Pinia Store 入口
// ============================================

import { createPinia } from 'pinia';

const pinia = createPinia();

export default pinia;
export * from './modules/warehouse';
export * from './modules/theme';
