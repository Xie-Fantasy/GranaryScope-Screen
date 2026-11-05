<script setup lang="ts">
// ============================================
// 仓储智能化页面（intelligent.vue）
// 布局：
// - 上层（约 65%）：左 DeviceOverview / 中 视频检测区 / 右 WarehouseJob
// - 下层（约 35%）：左 GrainTempTrend / 右 TabChartWrapper
// 说明：左右面板等宽，3D 模型区域与 monitor 页面保持一致
// ============================================

import DeviceOverview from '@/components/business/DeviceOverview.vue';
import WarehouseJob from '@/components/business/WarehouseJob.vue';
import GrainTempTrend from '@/components/business/GrainTempTrend.vue';
import TabChartWrapper from '@/components/business/TabChartWrapper.vue';
import CameraDetectionStage from '@/components/common/CameraDetectionStage.vue';

defineOptions({ name: 'Intelligent' });
</script>

<template>
  <div class="intelligent">
    <!-- 上层区域：65% 三栏对称 -->
    <div class="intelligent__top">
      <!-- 左：设备运行总览 -->
      <div class="intelligent__top-left">
        <DeviceOverview />
      </div>

      <!-- 中：视频检测区 -->
      <div class="intelligent__top-center">
        <div class="intelligent__model-area">
          <CameraDetectionStage />
        </div>
      </div>

      <!-- 右：仓房作业总览 -->
      <div class="intelligent__top-right">
        <WarehouseJob />
      </div>
    </div>

    <!-- 下层区域：35% 两栏等宽 -->
    <div class="intelligent__bottom">
      <!-- 左：粮温趋势组合图表 -->
      <div class="intelligent__bottom-left">
        <GrainTempTrend />
      </div>

      <!-- 右：4-Tab 图表 -->
      <div class="intelligent__bottom-right">
        <TabChartWrapper />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/mixins.scss' as *;

.intelligent {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  padding: $spacing-xl;
  box-sizing: border-box;
  overflow: hidden;

}

// --------------------------------------------
// 上层区域：约 65%，三栏对称
// --------------------------------------------
.intelligent__top {
  display: flex;
  flex: 1 1 65%;
  gap: $spacing-lg;
  min-height: 0;
}

.intelligent__top-left {
  width: 25%;
  min-width: 0;
}

.intelligent__top-center {
  flex: 1;
  min-width: 0;
  position: relative;
}

.intelligent__top-right {
  width: 25%;
  min-width: 0;
}

// --------------------------------------------
// 视频检测区域
// --------------------------------------------
.intelligent__model-area {
  position: absolute;
  inset: 0;
}

// --------------------------------------------
// 下层区域：约 35%，两栏等宽
// --------------------------------------------
.intelligent__bottom {
  display: flex;
  flex: 1 1 35%;
  gap: $spacing-lg;
  min-height: 0;
}

.intelligent__bottom-left {
  flex: 1;
  min-width: 0;
}

.intelligent__bottom-right {
  flex: 1;
  min-width: 0;
}
</style>
