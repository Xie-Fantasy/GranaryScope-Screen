// ============================================
// ECharts 类目轴循环滚动
// 每次仅向图表提供固定数量的数据窗口，确保横轴不会渲染全量仓房。
// ============================================
import { onActivated, onBeforeUnmount, onDeactivated, watch } from 'vue';
/** 当前检测面板每次仅呈现 15 个仓房，逐项循环展示全库快照。 */
export const CATEGORY_WINDOW_SIZE = 15;
const CATEGORY_SCROLL_INTERVAL = 1000;
/**
 * 生成当前位置的固定窗口。末尾通过取模续接 Q01，实现 Q95 → Q01 的连续轮播。
 */
export function createLoopingCategorySeries(categories, series, startIndex) {
    if (categories.length === 0)
        return { categories: [], series: series.map(() => []) };
    const visibleCount = Math.min(CATEGORY_WINDOW_SIZE, categories.length);
    const normalizedStart = ((startIndex % categories.length) + categories.length) % categories.length;
    const offsets = Array.from({ length: visibleCount }, (_, offset) => ((normalizedStart + offset) % categories.length));
    return {
        categories: offsets.map(index => categories[index]),
        series: series.map(values => offsets.map(index => values[index])),
    };
}
/** 管理固定窗口的自动推进与 KeepAlive 生命周期。 */
export function useCategoryAutoScroll(isActive, onWindowChange) {
    let timer = null;
    let sourceCategoryCount = 0;
    let startIndex = 0;
    function stop() {
        if (timer !== null)
            clearInterval(timer);
        timer = null;
    }
    function applyWindow() {
        if (sourceCategoryCount > 0)
            onWindowChange(startIndex);
    }
    function start() {
        stop();
        if (!isActive.value || sourceCategoryCount <= CATEGORY_WINDOW_SIZE)
            return;
        timer = setInterval(() => {
            startIndex = (startIndex + 1) % sourceCategoryCount;
            applyWindow();
        }, CATEGORY_SCROLL_INTERVAL);
    }
    function configure(categoryCount) {
        sourceCategoryCount = categoryCount;
        startIndex = 0;
        applyWindow();
        start();
    }
    watch(isActive, (active) => {
        if (active)
            start();
        else
            stop();
    });
    onActivated(start);
    onDeactivated(stop);
    onBeforeUnmount(stop);
    return { configure, stop };
}
