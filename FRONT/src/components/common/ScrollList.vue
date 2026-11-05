<script setup lang="ts">
// ============================================
// ScrollList - 无缝竖向滚动列表
// 功能：Q01~Q95 仓房编号自动轮播，中间项高亮
// 技术方案：requestAnimationFrame + transform: translateY
// 无缝原理：列表数据复制一份拼接，滚到第二份起始位置时瞬间重置到第一份
// ============================================

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { WAREHOUSE_TOTAL } from '@/constants/warehouse';
import { useWarehouseStore } from '@/store/modules/warehouse';

defineOptions({ name: 'ScrollList' });

const store = useWarehouseStore();
const { currentWarehouseId } = storeToRefs(store);

// --------------------------------------------
// 列表数据
// --------------------------------------------

/** 单个列表项类型 */
interface ScrollItem {
  id: string;
  name: string;
}

/** 列表项高度（px） */
const ITEM_HEIGHT = 48;
/** 可见区域最多显示项数（含上下半截） */
const VISIBLE_COUNT = 5;
/** 中间高亮项索引（在可见列表中的位置） */
const CENTER_INDEX = 2;
/** 每项滚动间隔（ms） */
const SCROLL_INTERVAL = 3000;

/** 原始列表数据 */
const rawList = ref<ScrollItem[]>([]);

/** 拼接后的无缝滚动列表（复制一份） */
const displayList = computed<ScrollItem[]>(() => {
  // 三份数据让当前项始终处于中间区域，首尾切换时不会露出空白。
  return [...rawList.value, ...rawList.value, ...rawList.value];
});

/** 当前滚动偏移量（px） */
const offset = ref(0);
/** 是否暂停自动滚动 */
const isPaused = ref(false);
/** 用户主动操作后保持暂停，避免巡视抢占当前选择 */
const isUserPaused = ref(false);
/** rAF 句柄 */
let rafId: number | null = null;
/** 上次时间戳 */
let lastTime = 0;
/** 累计时间（用于控制 3 秒间隔） */
let elapsed = 0;
/** 手动滚动定时器 */
let manualScrollTimer: ReturnType<typeof setTimeout> | null = null;
/** 组件是否已卸载 */
let isUnmounted = false;
/** 当前中心项在原始列表中的索引 */
const currentIndex = ref(0);

function setOffset(index: number): void {
  offset.value = (rawList.value.length + index) * ITEM_HEIGHT;
}

/**
 * 初始化仓房列表
 */
function initList(): void {
  const list: ScrollItem[] = [];
  for (let i = 1; i <= WAREHOUSE_TOTAL; i++) {
    const id = `Q${String(i).padStart(2, '0')}`;
    list.push({ id, name: `${id} 号仓` });
  }
  rawList.value = list;

  // 初始化为当前 store 中的仓房
  const storeIndex = list.findIndex(item => item.id === currentWarehouseId.value);
  currentIndex.value = storeIndex >= 0 ? storeIndex : 0;
  setOffset(currentIndex.value);
}

/**
 * 滚动到指定索引（平滑动画）
 * @param targetIndex 目标索引
 */
function scrollToIndex(targetIndex: number): void {
  const total = rawList.value.length;
  if (total === 0) return;

  if (manualScrollTimer !== null) {
    clearTimeout(manualScrollTimer);
    manualScrollTimer = null;
  }

  // 计算最短路径滚动方向
  const currentIdx = currentIndex.value;
  let diff = targetIndex - currentIdx;

  // 如果差值大于一半，则反向走更近
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;

  // 逐步滚动（每次移动一项）
  const direction = diff > 0 ? 1 : -1;
  const steps = Math.abs(diff);

  let stepCount = 0;
  const stepInterval = 50; // 每步间隔 ms（快于自动播放）

  const doStep = () => {
    if (stepCount >= steps || isUnmounted) return;

    currentIndex.value = ((currentIndex.value + direction) % total + total) % total;
    setOffset(currentIndex.value);

    stepCount++;
    const item = rawList.value[currentIndex.value];
    if (item) {
      store.setCurrentId(item.id);
    }

    if (stepCount < steps) {
      manualScrollTimer = setTimeout(doStep, stepInterval);
    }
  };

  doStep();
}

/**
 * requestAnimationFrame 动画循环
 * 每 3 秒移动一项
 */
function animate(timestamp: number): void {
  if (!lastTime) lastTime = timestamp;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  if (!isPaused.value) {
    elapsed += delta;

    if (elapsed >= SCROLL_INTERVAL) {
      elapsed = 0;
      moveNext();
    }
  }

  rafId = requestAnimationFrame(animate);
}

/**
 * 移动到下一项
 */
function moveNext(): void {
  const total = rawList.value.length;
  if (total === 0) return;

  const nextIndex = (currentIndex.value + 1) % total;
  currentIndex.value = nextIndex;
  setOffset(nextIndex);

  // 同步到 store
  const item = rawList.value[nextIndex];
  if (item) {
    store.setCurrentId(item.id);
  }
}

/**
 * 点击列表项
 * @param displayIndex 在 displayList 中的索引
 */
function handleClick(displayIndex: number): void {
  const total = rawList.value.length;
  if (total === 0) return;

  pauseAutoTour();
  const targetIndex = displayIndex % total;
  scrollToIndex(targetIndex);
}

/** 上下箭头控制，按下即进入用户暂停状态 */
function handleControl(direction: -1 | 1): void {
  pauseAutoTour();
  scrollToIndex(currentIndex.value + direction);
}

function pauseAutoTour(): void {
  isUserPaused.value = true;
  isPaused.value = true;
  elapsed = 0;
}

/**
 * 鼠标悬浮暂停
 */
function handleMouseEnter(): void {
  isPaused.value = true;
}

/**
 * 鼠标离开恢复
 */
function handleMouseLeave(): void {
  if (!isUserPaused.value) {
    isPaused.value = false;
    elapsed = 0;
  }
}

/**
 * 容器可见区高度
 */
const viewportHeight = computed(() => VISIBLE_COUNT * ITEM_HEIGHT);

/**
 * 列表整体偏移样式
 * 始终将 currentIndex 对应的项居中显示
 */
const listStyle = computed(() => ({
  transform: `translateY(${-offset.value + CENTER_INDEX * ITEM_HEIGHT}px)`,
  transition: 'transform 0.5s ease',
}));

// 监听外部 store 变化（如通过其他方式切换仓房）
watch(currentWarehouseId, (newId) => {
  const index = rawList.value.findIndex(item => item.id === newId);
  if (index >= 0 && index !== currentIndex.value) {
    currentIndex.value = index;
    setOffset(index);
  }
});

// --------------------------------------------
// 生命周期
// --------------------------------------------
onMounted(async () => {
  initList();
  await nextTick();
  rafId = requestAnimationFrame(animate);
});

onUnmounted(() => {
  isUnmounted = true;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (manualScrollTimer !== null) {
    clearTimeout(manualScrollTimer);
    manualScrollTimer = null;
  }
});
</script>

<template>
  <div
    class="scroll-list"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @wheel="pauseAutoTour"
  >
    <button
      class="scroll-list__control scroll-list__control--up"
      type="button"
      aria-label="上一仓房"
      @click="handleControl(-1)"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 14 6-6 6 6" /></svg>
    </button>

    <!-- 滚动区域 -->
    <div
      class="scroll-list__viewport"
      :style="{ height: `${viewportHeight}px` }"
    >
      <div class="scroll-list__track" :style="listStyle">
        <div
          v-for="(item, displayIndex) in displayList"
          :key="`${item.id}-${displayIndex}`"
          class="scroll-list__item"
          :class="{
            'scroll-list__item--active': displayIndex >= rawList.length
              && displayIndex < rawList.length * 2
              && (displayIndex - rawList.length) === currentIndex,
          }"
          @click="handleClick(displayIndex)"
        >
          <span class="scroll-list__item-id">{{ item.id }}</span>
          <span class="scroll-list__item-name">{{ item.name }}</span>
        </div>
      </div>
    </div>

    <button
      class="scroll-list__control scroll-list__control--down"
      type="button"
      aria-label="下一仓房"
      @click="handleControl(1)"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 10 6 6 6-6" /></svg>
    </button>

  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.scroll-list {
  width: 160px;
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  border: 1px solid var(--border-default);
  border-radius: $radius-sm;
  box-shadow: none;
  padding: 0;
  overflow: hidden;
}

.scroll-list__control {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 28px;
  padding: 0;
  color: var(--primary);
  background: color-mix(in srgb, var(--bg-panel-elevated) 58%, transparent);
  border: 0;
  border-bottom: 1px solid var(--border-default);
  cursor: pointer;
  transition: background-color $transition-fast, color $transition-fast;

  &:hover,
  &:focus-visible {
    color: var(--text-primary);
    background: var(--primary-soft);
    outline: none;
  }

  &--down {
    border-top: 1px solid var(--border-default);
    border-bottom: 0;
  }

  svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

// --------------------------------------------
// 可视区域
// --------------------------------------------
.scroll-list__viewport {
  width: 100%;
  flex: 1 1 auto;
  height: auto !important;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

// --------------------------------------------
// 滚动轨道
// --------------------------------------------
.scroll-list__track {
  width: 100%;
  position: relative;
}

// --------------------------------------------
// 列表项
// --------------------------------------------
.scroll-list__item {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-md;
  cursor: pointer;
  transition: background-color $transition-fast, color $transition-fast;
  border-left: 2px solid transparent;
  box-sizing: border-box;

  &:hover {
    background: var(--bg-hover);
  }

  // 高亮项：主题色左边线 + soft 背景 + 克制 Glow（视觉规范 §10.2）
  &--active {
    position: relative;
    border-left-color: transparent;
    background: var(--primary-soft);
    box-shadow: inset 0 0 14px color-mix(in srgb, var(--primary) 10%, transparent);

    &::before {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 2px;
      content: '';
      background: var(--primary);
    }

    .scroll-list__item-id {
      color: var(--text-primary);
      font-weight: $font-weight-semibold;
    }

    .scroll-list__item-name {
      color: var(--text-secondary);
    }
  }
}

.scroll-list__item-id {
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
  transition: color $transition-fast;
}

.scroll-list__item-name {
  font-size: $font-size-xs;
  color: var(--text-tertiary);
  transition: color $transition-fast;
}

</style>
