// ============================================
// Vue Router 配置
// ============================================

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/storage/monitor',
  },
  {
    path: '/storage',
    component: () => import('@/layouts/StorageLayout.vue'),
    redirect: '/storage/monitor',
    children: [
      {
        path: 'intelligent',
        name: 'Intelligent',
        component: () => import('@/views/storage/intelligent.vue'),
        meta: { title: '仓储智能化' },
      },
      {
        path: 'monitor',
        name: 'Monitor',
        component: () => import('@/views/storage/monitor.vue'),
        meta: { title: '粮情检测数据看板' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/storage/monitor',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 滚动行为
  scrollBehavior: () => ({
    top: 0,
  }),
});

// 路由守卫 - 页面标题
router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string;
  if (title) {
    document.title = `${title} - 谷仓视界 · GranaryScope`;
  }
  next();
});

export default router;
