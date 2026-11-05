<script setup lang="ts">
// ============================================
// 粮情检测看板页面（monitor.vue）
// 布局：
// - 上层（约 65%）：左 IndicatorCard + AlarmCard / 中 视频检测区 / 右 WeatherWidget
// - 下层（约 35%）：异常报警监控 / 粮温趋势 / 湿度趋势三图并排
// 说明：左右面板等宽，3D 模型区域与 intelligent 页面保持一致
// ============================================

import IndicatorCard from '@/components/business/IndicatorCard.vue';
import AlarmCard from '@/components/business/AlarmCard.vue';
import DoubleBarChart from '@/components/business/DoubleBarChart.vue';
import WeatherWidget from '@/components/business/WeatherWidget.vue';
import HumidityTrend from '@/components/business/HumidityTrend.vue';
import GrainTempTrend from '@/components/business/GrainTempTrend.vue';
import CameraDetectionStage from '@/components/common/CameraDetectionStage.vue';

defineOptions({ name: 'Monitor' });
</script>

<template>
  <main class="monitor">
    <!-- ========================================== -->
    <!-- 上层区域：65% 三栏对称 -->
    <!-- ========================================== -->
    <div class="monitor__top">
      <!-- 左：指标卡 + 报警列表，合并为左侧一整块面板 -->
      <div class="monitor__side monitor__top-left">
        <div class="monitor__summary-panel">
          <div class="monitor__summary-panel__item">
            <IndicatorCard />
          </div>
          <div class="monitor__summary-panel__item">
            <AlarmCard />
          </div>
        </div>
      </div>

      <!-- 中：视频检测区 -->
      <div class="monitor__top-center">
        <div class="monitor__model-area">
          <CameraDetectionStage />
        </div>
      </div>

      <!-- 右：气象助手 -->
      <div class="monitor__side monitor__top-right">
        <WeatherWidget />
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 下层区域：35% 三图并排 -->
    <!-- ========================================== -->
    <div class="monitor__bottom">
      <!-- 左：异常报警监控（模块内部采用上下两层、左右分栏） -->
      <div class="monitor__chart monitor__chart--alarm">
        <DoubleBarChart />
      </div>

      <!-- 中：粮温趋势 -->
      <div class="monitor__chart">
        <GrainTempTrend />
      </div>

      <!-- 右：湿度趋势 -->
      <div class="monitor__chart">
        <HumidityTrend />
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/mixins.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.monitor {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: minmax(0, 65fr) minmax(0, 35fr);
  gap: $spacing-lg;
  padding: $spacing-xl;
  box-sizing: border-box;
  overflow: hidden;
}

// --------------------------------------------
// 上层区域：约 65%，三栏对称
// --------------------------------------------
.monitor__top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  gap: $spacing-lg;
  min-height: 0;
}

.monitor__side {
  min-width: 0;
  min-height: 0;
}

.monitor__top-left {
  display: flex;
}

.monitor__top-center {
  flex: 1;
  position: relative;
  min-width: 0;
  min-height: 0;
}

.monitor__top-right {
  min-width: 0;
}

.monitor__summary-panel {
  @include shell.panel;
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  overflow: hidden;
}

.monitor__summary-panel__item {
  flex: 1;
  min-height: 0;

  + .monitor__summary-panel__item {
    border-top: 1px solid var(--border-default);
  }

  :deep(.indicator-card),
  :deep(.alarm-card) {
    height: 100%;
    min-height: 0;
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
}

// --------------------------------------------
// 视频检测区域
// --------------------------------------------
.monitor__model-area {
  position: absolute;
  inset: 0;
}

// --------------------------------------------
// 下层区域：约 35%，三图并排
// --------------------------------------------
.monitor__bottom {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: minmax(0, 1fr);
  gap: $spacing-lg;
  min-height: 0;
}

.monitor__chart {
  min-width: 0;
  min-height: 0;
  position: relative;
}

// --------------------------------------------
// 异常报警监控由组件内部完成上下两层结构
// --------------------------------------------
.monitor__chart--alarm {
  min-width: 0;
  min-height: 0;
}
</style>
