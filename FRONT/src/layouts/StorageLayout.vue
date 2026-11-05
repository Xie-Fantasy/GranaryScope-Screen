<script setup lang="ts">
// ============================================
// StorageLayout - 仓储父布局
// 结构：顶部 AppHeader + 主内容区（router-view + keep-alive）
// 说明：背景图层已迁移至 App.vue 根层级
// ============================================

import AppHeader from '@/components/common/AppHeader.vue';

defineOptions({ name: 'StorageLayout' });
</script>

<template>
  <div class="storage-layout">
    <!-- 顶部导航栏 -->
    <AppHeader />

    <!-- 主内容区 -->
    <main class="storage-layout__main">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.storage-layout {
  width: $design-width;
  height: $design-height;
  display: flex;
  flex-direction: column;
  background: transparent;
  position: relative;
  overflow: hidden;
}

.storage-layout__main {
  flex: 1;
  width: 100%;
  height: calc(100% - #{$header-height});
  overflow: hidden;
  position: relative;
}
</style>
