// ============================================
// 应用入口 - 粮仓可视化大屏
// ============================================
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './store';
import './styles/global.scss';
import { bootstrapTheme, useThemeStore } from './store/modules/theme';
// Apply the persisted/default data-theme before Vue renders its first view.
bootstrapTheme();
const app = createApp(App);
app.use(router);
app.use(pinia);
useThemeStore(pinia).hydrateTheme();
app.mount('#app');
