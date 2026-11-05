/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
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
/** 列表项高度（px） */
const ITEM_HEIGHT = 48;
/** 可见区域最多显示项数（含上下半截） */
const VISIBLE_COUNT = 5;
/** 中间高亮项索引（在可见列表中的位置） */
const CENTER_INDEX = 2;
/** 每项滚动间隔（ms） */
const SCROLL_INTERVAL = 3000;
/** 原始列表数据 */
const rawList = ref([]);
/** 拼接后的无缝滚动列表（复制一份） */
const displayList = computed(() => {
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
let rafId = null;
/** 上次时间戳 */
let lastTime = 0;
/** 累计时间（用于控制 3 秒间隔） */
let elapsed = 0;
/** 手动滚动定时器 */
let manualScrollTimer = null;
/** 组件是否已卸载 */
let isUnmounted = false;
/** 当前中心项在原始列表中的索引 */
const currentIndex = ref(0);
function setOffset(index) {
    offset.value = (rawList.value.length + index) * ITEM_HEIGHT;
}
/**
 * 初始化仓房列表
 */
function initList() {
    const list = [];
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
function scrollToIndex(targetIndex) {
    const total = rawList.value.length;
    if (total === 0)
        return;
    if (manualScrollTimer !== null) {
        clearTimeout(manualScrollTimer);
        manualScrollTimer = null;
    }
    // 计算最短路径滚动方向
    const currentIdx = currentIndex.value;
    let diff = targetIndex - currentIdx;
    // 如果差值大于一半，则反向走更近
    if (diff > total / 2)
        diff -= total;
    if (diff < -total / 2)
        diff += total;
    // 逐步滚动（每次移动一项）
    const direction = diff > 0 ? 1 : -1;
    const steps = Math.abs(diff);
    let stepCount = 0;
    const stepInterval = 50; // 每步间隔 ms（快于自动播放）
    const doStep = () => {
        if (stepCount >= steps || isUnmounted)
            return;
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
function animate(timestamp) {
    if (!lastTime)
        lastTime = timestamp;
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
function moveNext() {
    const total = rawList.value.length;
    if (total === 0)
        return;
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
function handleClick(displayIndex) {
    const total = rawList.value.length;
    if (total === 0)
        return;
    pauseAutoTour();
    const targetIndex = displayIndex % total;
    scrollToIndex(targetIndex);
}
/** 上下箭头控制，按下即进入用户暂停状态 */
function handleControl(direction) {
    pauseAutoTour();
    scrollToIndex(currentIndex.value + direction);
}
function pauseAutoTour() {
    isUserPaused.value = true;
    isPaused.value = true;
    elapsed = 0;
}
/**
 * 鼠标悬浮暂停
 */
function handleMouseEnter() {
    isPaused.value = true;
}
/**
 * 鼠标离开恢复
 */
function handleMouseLeave() {
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
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['scroll-list__item-id']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-list__item-name']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onMouseenter: (__VLS_ctx.handleMouseEnter) },
    ...{ onMouseleave: (__VLS_ctx.handleMouseLeave) },
    ...{ onWheel: (__VLS_ctx.pauseAutoTour) },
    ...{ class: "scroll-list" },
});
/** @type {__VLS_StyleScopedClasses['scroll-list']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.handleControl(-1));
            // @ts-ignore
            [handleMouseEnter, handleMouseLeave, pauseAutoTour, handleControl,];
        } },
    ...{ class: "scroll-list__control scroll-list__control--up" },
    type: "button",
    'aria-label': "上一仓房",
});
/** @type {__VLS_StyleScopedClasses['scroll-list__control']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-list__control--up']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    viewBox: "0 0 24 24",
    'aria-hidden': "true",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "m6 14 6-6 6 6",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "scroll-list__viewport" },
    ...{ style: ({ height: `${__VLS_ctx.viewportHeight}px` }) },
});
/** @type {__VLS_StyleScopedClasses['scroll-list__viewport']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "scroll-list__track" },
    ...{ style: (__VLS_ctx.listStyle) },
});
/** @type {__VLS_StyleScopedClasses['scroll-list__track']} */ ;
for (const [item, displayIndex] of __VLS_vFor((__VLS_ctx.displayList))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                return (__VLS_ctx.handleClick(displayIndex));
                // @ts-ignore
                [viewportHeight, listStyle, displayList, handleClick,];
            } },
        key: (`${item.id}-${displayIndex}`),
        ...{ class: "scroll-list__item" },
        ...{ class: ({
                'scroll-list__item--active': displayIndex >= __VLS_ctx.rawList.length
                    && displayIndex < __VLS_ctx.rawList.length * 2
                    && (displayIndex - __VLS_ctx.rawList.length) === __VLS_ctx.currentIndex,
            }) },
    });
    /** @type {__VLS_StyleScopedClasses['scroll-list__item']} */ ;
    /** @type {__VLS_StyleScopedClasses['scroll-list__item--active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "scroll-list__item-id" },
    });
    /** @type {__VLS_StyleScopedClasses['scroll-list__item-id']} */ ;
    (item.id);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "scroll-list__item-name" },
    });
    /** @type {__VLS_StyleScopedClasses['scroll-list__item-name']} */ ;
    (item.name);
    // @ts-ignore
    [rawList, rawList, rawList, currentIndex,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.handleControl(1));
            // @ts-ignore
            [handleControl,];
        } },
    ...{ class: "scroll-list__control scroll-list__control--down" },
    type: "button",
    'aria-label': "下一仓房",
});
/** @type {__VLS_StyleScopedClasses['scroll-list__control']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-list__control--down']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    viewBox: "0 0 24 24",
    'aria-hidden': "true",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "m6 10 6 6 6-6",
});
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
