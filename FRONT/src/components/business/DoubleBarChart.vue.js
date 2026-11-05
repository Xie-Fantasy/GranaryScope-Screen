/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import PanelHeading from '@/components/common/PanelHeading.vue';
// ============================================
// DoubleBarChart - 异常报警监控双柱状图
// 功能：全库报警总数 + 当前选中仓房报警数，以中央棱线正对视角的 2.5D 双面柱呈现
// 联动：监听 warehouseStore.currentWarehouseId 变化，setOption(true) 平滑动画
// 横轴：动态显示最近 7/30 天，无数据补 0
// Green/Blue 主题切换实时同步颜色（不重新请求数据）
// ============================================
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useWarehouseStore } from '@/store/modules/warehouse';
import { useThemeStore } from '@/store/modules/theme';
import { useECharts } from '@/composables/useECharts';
import { adjustColor, createVerticalGradient, getChartTheme } from '@/composables/chartTheme';
import { getBarChartData } from '@/api/modules/chart';
import ScrollList from '@/components/common/ScrollList.vue';
defineOptions({ name: 'DoubleBarChart' });
const store = useWarehouseStore();
const { currentWarehouseId } = storeToRefs(store);
// 本面板独立维护日期范围，不干扰粮温、湿度趋势。
const dateRange = ref(7);
const themeStore = useThemeStore();
// --------------------------------------------
// 响应式数据
// --------------------------------------------
const chartRef = ref(null);
const chartData = ref([]);
const loading = ref(true);
const errorMsg = ref('');
let requestToken = 0;
const BAR_WIDTH_RATIO = 0.24;
const BAR_GROUP_GAP_RATIO = 0.08;
const { initChart, setOption, getInstance } = useECharts(chartRef, { onThemeChange: () => renderChart() });
function getPrismBarLayout(api) {
    const categoryIndex = Number(api.value(0));
    const value = Number(api.value(1));
    const color = String(api.value(2));
    const slot = Number(api.value(3));
    if (!Number.isFinite(value) || value <= 0)
        return null;
    const [categoryCenter, top] = api.coord([categoryIndex, value]);
    const [, bottom] = api.coord([categoryIndex, 0]);
    const categorySize = api.size?.([1, 0]);
    const categoryWidth = Array.isArray(categorySize) ? categorySize[0] : categorySize;
    const width = Math.max(8, (categoryWidth ?? 0) * BAR_WIDTH_RATIO);
    const gap = Math.max(3, (categoryWidth ?? 0) * BAR_GROUP_GAP_RATIO);
    const center = categoryCenter + slot * (width + gap) / 2;
    return {
        color,
        depth: Math.min(6, width * 0.28),
        left: center - width / 2,
        center,
        right: center + width / 2,
        top,
        bottom,
    };
}
const renderPrismBar = (_params, api) => {
    const bar = getPrismBarLayout(api);
    if (!bar)
        return;
    const halfWidth = bar.center - bar.left;
    const height = bar.bottom - bar.top;
    return {
        type: 'group',
        children: [
            {
                type: 'rect',
                shape: { x: bar.left, y: bar.top, width: halfWidth, height },
                style: { fill: createVerticalGradient(adjustColor(bar.color, 0.08), 0.98, 0.34) },
                transition: ['shape'],
                enterFrom: { shape: { x: bar.left, y: bar.bottom, width: halfWidth, height: 0 } },
            },
            {
                type: 'rect',
                shape: { x: bar.center, y: bar.top, width: halfWidth, height },
                style: { fill: createVerticalGradient(adjustColor(bar.color, -0.2), 0.92, 0.24) },
                transition: ['shape'],
                enterFrom: { shape: { x: bar.center, y: bar.bottom, width: halfWidth, height: 0 } },
            },
            {
                type: 'group',
                x: bar.left,
                y: bar.top,
                transition: ['x', 'y'],
                enterFrom: { x: bar.left, y: bar.bottom },
                children: [{
                        type: 'polygon',
                        shape: {
                            points: [
                                [0, 0],
                                [halfWidth, -bar.depth],
                                [halfWidth * 2, 0],
                                [halfWidth, bar.depth],
                            ],
                        },
                        style: { fill: adjustColor(bar.color, 0.28) },
                    }],
            },
        ],
    };
};
/**
 * 获取双柱状图数据
 * @param warehouseId 仓房编号
 */
async function fetchData(warehouseId) {
    const token = ++requestToken;
    // 轮播切换时保留现有图表，不用全屏 loading 遮住可视化内容。
    loading.value = chartData.value.length === 0;
    errorMsg.value = '';
    try {
        const response = await getBarChartData(warehouseId, dateRange.value);
        if (token !== requestToken)
            return;
        // 兼容 mock 直接返回数组与 AxiosResponse.data 数组两种形态。
        const responseData = response && typeof response === 'object'
            ? response.data
            : undefined;
        const nestedData = responseData && typeof responseData === 'object'
            ? responseData.data
            : undefined;
        const data = (Array.isArray(response) ? response :
            Array.isArray(responseData) ? responseData :
                Array.isArray(nestedData) ? nestedData : []);
        if (data.length > 0) {
            chartData.value = data;
            renderChart();
        }
        else if (chartData.value.length === 0) {
            chartData.value = [];
            errorMsg.value = '暂无报警数据';
        }
    }
    catch {
        if (token !== requestToken)
            return;
        // 切换仓房时保留上一版图表，避免短暂请求失败造成整块面板空白。
        // 已有数据时静默保留，避免轮播过程中闪出错误遮罩。
        errorMsg.value = chartData.value.length > 0 ? '' : '图表数据加载失败';
    }
    finally {
        if (token === requestToken)
            loading.value = false;
    }
}
/**
 * 构建图表配置
 */
function buildOption() {
    const d = chartData.value;
    if (!d || d.length === 0)
        return {};
    const t = getChartTheme(themeStore.theme);
    const dates = d.map(item => item.date);
    const totalAlarmData = d.map(item => item.totalAlarm);
    const currentAlarmData = d.map(item => item.currentAlarm);
    const totalColor = t.palette.primary;
    const currentColor = t.palette.warning;
    const totalPrismData = totalAlarmData.map((value, index) => [index, value, totalColor, -1]);
    const currentPrismData = currentAlarmData.map((value, index) => [index, value, currentColor, 1]);
    return {
        backgroundColor: 'transparent',
        animation: true,
        animationDuration: 380,
        animationEasing: 'cubicOut',
        animationDurationUpdate: 380,
        animationEasingUpdate: 'cubicOut',
        tooltip: {
            ...t.tooltip(),
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                const items = params;
                if (!items || items.length === 0)
                    return '';
                const index = items[0].dataIndex ?? 0;
                const date = dates[index] ?? items[0].name ?? '';
                return `<div style="font-size:12px;color:${t.text.secondary};margin-bottom:4px;">${date}</div>
          <div style="display:flex;align-items:center;gap:6px;line-height:1.6;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${totalColor};"></span>
            <span style="color:${t.text.primary};">全库报警总数</span>
            <span style="color:${totalColor};font-weight:600;margin-left:8px;">${totalAlarmData[index] ?? 0}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;line-height:1.6;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${currentColor};"></span>
            <span style="color:${t.text.primary};">当前仓房报警数</span>
            <span style="color:${currentColor};font-weight:600;margin-left:8px;">${currentAlarmData[index] ?? 0}</span>
          </div>`;
            },
        },
        grid: {
            left: '3%',
            right: '5%',
            bottom: '3%',
            top: '8%',
            containLabel: true,
        },
        xAxis: t.categoryAxis(dates),
        yAxis: t.valueAxis(),
        series: [
            // 两组柱均为中央棱线正对视角的双立面柱，只显示受光顶面，不绘制底面。
            {
                name: '全库报警总数',
                type: 'custom',
                data: totalPrismData,
                encode: { x: 0, y: 1 },
                renderItem: renderPrismBar,
                z: 2,
            },
            {
                name: '当前仓房报警数',
                type: 'custom',
                data: currentPrismData,
                encode: { x: 0, y: 1 },
                renderItem: renderPrismBar,
                z: 3,
            },
        ],
    };
}
/**
 * 渲染图表
 * @param notMerge 是否完全替换配置（默认 true，实现平滑动画）
 */
function renderChart(notMerge = true) {
    if (chartData.value.length === 0)
        return;
    const option = buildOption();
    if (getInstance()) {
        // 已有实例，使用 setOption 更新（notMerge=true 实现平滑动画）
        setOption(option, notMerge);
    }
    else {
        initChart(option);
    }
}
function setDateRange(range) {
    if (dateRange.value !== range)
        dateRange.value = range;
}
// 监听当前仓房 ID 变化，更新图表数据
watch([currentWarehouseId, dateRange], ([warehouseId]) => {
    if (warehouseId) {
        fetchData(warehouseId);
    }
});
onMounted(() => {
    fetchData(currentWarehouseId.value);
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['double-bar-chart__sidebar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "double-bar-chart" },
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "double-bar-chart__header" },
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__header']} */ ;
const __VLS_0 = PanelHeading || PanelHeading;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "double-bar-chart__title" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "double-bar-chart__title" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['double-bar-chart__title']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "double-bar-chart__header-actions" },
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__header-actions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "double-bar-chart__date-toggle" },
    'aria-label': "数据范围",
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__date-toggle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setDateRange(7));
            // @ts-ignore
            [setDateRange,];
        } },
    ...{ class: "double-bar-chart__date" },
    ...{ class: ({ 'is-active': __VLS_ctx.dateRange === 7 }) },
    type: "button",
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__date']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setDateRange(30));
            // @ts-ignore
            [setDateRange, dateRange,];
        } },
    ...{ class: "double-bar-chart__date" },
    ...{ class: ({ 'is-active': __VLS_ctx.dateRange === 30 }) },
    type: "button",
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__date']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "double-bar-chart__content" },
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "double-bar-chart__toolbar" },
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__toolbar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "double-bar-chart__legend" },
    'aria-label': "图例",
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__legend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "double-bar-chart__legend-item" },
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__legend-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "double-bar-chart__legend-swatch double-bar-chart__legend-swatch--total" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__legend-swatch']} */ ;
/** @type {__VLS_StyleScopedClasses['double-bar-chart__legend-swatch--total']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "double-bar-chart__legend-item" },
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__legend-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "double-bar-chart__legend-swatch double-bar-chart__legend-swatch--current" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__legend-swatch']} */ ;
/** @type {__VLS_StyleScopedClasses['double-bar-chart__legend-swatch--current']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "double-bar-chart__subtitle" },
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__subtitle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "double-bar-chart__current-id" },
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__current-id']} */ ;
(__VLS_ctx.currentWarehouseId);
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
    ...{ class: "double-bar-chart__sidebar" },
    'aria-label': "仓房切换",
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__sidebar']} */ ;
const __VLS_6 = ScrollList;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "double-bar-chart__body" },
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "chartRef",
    ...{ class: "double-bar-chart__canvas" },
});
/** @type {__VLS_StyleScopedClasses['double-bar-chart__canvas']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "double-bar-chart__state" },
        'aria-live': "polite",
    });
    /** @type {__VLS_StyleScopedClasses['double-bar-chart__state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "double-bar-chart__spinner" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['double-bar-chart__spinner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.errorMsg) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "double-bar-chart__state double-bar-chart__state--error" },
        role: "alert",
    });
    /** @type {__VLS_StyleScopedClasses['double-bar-chart__state']} */ ;
    /** @type {__VLS_StyleScopedClasses['double-bar-chart__state--error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.errorMsg);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    throw 0;
                if (!(__VLS_ctx.errorMsg))
                    throw 0;
                return (__VLS_ctx.fetchData(__VLS_ctx.currentWarehouseId));
                // @ts-ignore
                [dateRange, currentWarehouseId, currentWarehouseId, loading, errorMsg, errorMsg, fetchData,];
            } },
        ...{ class: "double-bar-chart__retry" },
        type: "button",
    });
    /** @type {__VLS_StyleScopedClasses['double-bar-chart__retry']} */ ;
}
else if (__VLS_ctx.chartData.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "double-bar-chart__state" },
    });
    /** @type {__VLS_StyleScopedClasses['double-bar-chart__state']} */ ;
}
// @ts-ignore
[chartData,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
