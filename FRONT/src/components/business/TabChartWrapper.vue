<script setup lang="ts">
import { computed, ref } from 'vue';
import PanelHeading from '@/components/common/PanelHeading.vue';
import TemperatureChart from '@/components/business/TemperatureChart.vue';
import GasChart from '@/components/business/GasChart.vue';
import EnergyRank from '@/components/business/EnergyRank.vue';
import InsectChart from '@/components/business/InsectChart.vue';
import type { IntelligentTab } from '@/types';

defineOptions({ name: 'TabChartWrapper' });

const activeTab = ref(0);

const tabs = computed(() => [
  { key: 'temperature' as IntelligentTab, label: '温度检测', component: TemperatureChart },
  { key: 'gas' as IntelligentTab, label: '气体检测', component: GasChart },
  { key: 'energy' as IntelligentTab, label: '能耗排行', component: EnergyRank },
  { key: 'insect' as IntelligentTab, label: '虫情检测', component: InsectChart },
]);

function switchTab(index: number): void {
  activeTab.value = index;
}

</script>

<template>
  <section class="tab-chart-wrapper" aria-label="粮情检测数据">
    <header class="tab-chart-wrapper__header">
      <PanelHeading as="div" class="tab-chart-wrapper__heading">
        <div class="tab-chart-wrapper__tabs" role="tablist" aria-label="检测类型">
          <button
            v-for="(tab, index) in tabs"
            :id="`warehouse-tab-${tab.key}`"
            :key="tab.key"
            class="tab-chart-wrapper__tab"
            :class="{ 'is-active': activeTab === index }"
            :aria-controls="`warehouse-panel-${tab.key}`"
            :aria-selected="activeTab === index"
            role="tab"
            type="button"
            @click="switchTab(index)"
          >
            {{ tab.label }}
          </button>
        </div>
      </PanelHeading>
    </header>

    <div class="tab-chart-wrapper__body">
      <div
        v-for="(tab, index) in tabs"
        :id="`warehouse-panel-${tab.key}`"
        :key="tab.key"
        v-show="activeTab === index"
        class="tab-chart-wrapper__content"
        :aria-labelledby="`warehouse-tab-${tab.key}`"
        role="tabpanel"
      >
        <component :is="tab.component" :active="activeTab === index" />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/shared-shell.scss' as shell;

.tab-chart-wrapper {
  @include shell.panel;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

.tab-chart-wrapper__header {
  @include shell.panel-header;
}

.tab-chart-wrapper__heading {
  width: min(100%, 680px);
}

.tab-chart-wrapper__tabs {
  display: flex;
  gap: $spacing-xs;
  flex: 1;
  min-width: 0;
}

.tab-chart-wrapper__tab {
  @include shell.filter-control;
  cursor: pointer;
  font-family: inherit;
}

.tab-chart-wrapper__tab {
  flex: 1;
  min-width: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  white-space: nowrap;
}

.tab-chart-wrapper__body {
  position: relative;
  flex: 1;
  min-height: 0;
  background: transparent;
}

.tab-chart-wrapper__content {
  position: absolute;
  inset: 0;
}
</style>
