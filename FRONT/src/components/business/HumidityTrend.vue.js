/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import PanelHeading from '@/components/common/PanelHeading.vue';
// ============================================
// HumidityTrend - 湿度趋势组合图表
// 功能：柱状图（报警数）+ 折线图（仓内湿度/仓外湿度）
// 数据来源：getHumidityTrend(dateRange) Mock 接口
// 说明：
// - 支持 7日/30日切换，无感更新数据（setOption 不重建实例）
// - Green/Blue 主题切换实时同步颜色（不重新请求数据）
// 语义色（视觉规范 §17.4）：报警数 danger / 仓内湿度 primary / 仓外湿度 warning(虚线)
// ============================================
import { ref, onMounted, watch } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { useECharts } from '@/composables/useECharts';
import { adjustColor, createVerticalGradient, getChartTheme } from '@/composables/chartTheme';
import { getHumidityTrend } from '@/api/modules/chart';
defineOptions({ name: 'HumidityTrend' });
// 仅服务本图表，切换不影响异常报警或粮温趋势。
const dateRange = ref(7);
const themeStore = useThemeStore();
// --------------------------------------------
// 响应式数据
// --------------------------------------------
const chartRef = ref(null);
const chartData = ref(null);
const loading = ref(true);
const errorMsg = ref('');
const BAR_DEPTH = 6;
const BAR_WIDTH_RATIO = 0.46;
const { initChart, setOption, getInstance } = useECharts(chartRef, { onThemeChange: () => renderChart() });
function getBarLayout(api) {
    const categoryIndex = Number(api.value(0));
    const value = Number(api.value(1));
    const color = String(api.value(2));
    if (!Number.isFinite(value) || value <= 0)
        return null;
    const [centerX, top] = api.coord([categoryIndex, value]);
    const [, bottom] = api.coord([categoryIndex, 0]);
    const categorySize = api.size?.([1, 0]);
    const categoryWidth = Array.isArray(categorySize) ? categorySize[0] : categorySize;
    const width = Math.max(4, (categoryWidth ?? 0) * BAR_WIDTH_RATIO);
    return {
        color,
        frontLeft: centerX - width / 2,
        frontRight: centerX + width / 2,
        width,
        top,
        bottom,
    };
}
const renderBarSide = (_params, api) => {
    const bar = getBarLayout(api);
    if (!bar)
        return;
    return {
        type: 'rect',
        shape: { x: bar.frontRight, y: bar.top - BAR_DEPTH, width: BAR_DEPTH, height: bar.bottom - bar.top },
        style: {
            fill: createVerticalGradient(adjustColor(bar.color, -0.16), 0.94, 0.46),
            opacity: 0.9,
        },
        transition: ['shape'],
        enterFrom: { shape: { x: bar.frontRight, y: bar.bottom - BAR_DEPTH, width: BAR_DEPTH, height: 0 } },
    };
};
const renderBarBottom = (_params, api) => {
    const bar = getBarLayout(api);
    if (!bar)
        return;
    return {
        type: 'group',
        x: bar.frontLeft,
        y: bar.bottom,
        children: [{
                type: 'polygon',
                shape: {
                    points: [[0, 0], [bar.width, 0], [bar.width + BAR_DEPTH, -BAR_DEPTH], [BAR_DEPTH, -BAR_DEPTH]],
                },
                style: { fill: adjustColor(bar.color, -0.06), opacity: 0.78 },
                transition: ['style'],
                enterFrom: { shape: {}, style: { opacity: 0 } },
            }],
    };
};
const renderBarTop = (_params, api) => {
    const bar = getBarLayout(api);
    if (!bar)
        return;
    return {
        type: 'group',
        x: bar.frontLeft,
        y: bar.top,
        transition: ['x', 'y'],
        enterFrom: { x: bar.frontLeft, y: bar.bottom },
        children: [{
                type: 'polygon',
                shape: { points: [[0, 0], [bar.width, 0], [bar.width + BAR_DEPTH, -BAR_DEPTH], [BAR_DEPTH, -BAR_DEPTH]] },
                style: { fill: adjustColor(bar.color, 0.26) },
            }],
    };
};
/**
 * 获取数据
 */
async function fetchData() {
    loading.value = true;
    errorMsg.value = '';
    try {
        const data = await getHumidityTrend(dateRange.value);
        if (data) {
            chartData.value = data;
            renderChart();
        }
    }
    catch (err) {
        errorMsg.value = '数据加载失败';
    }
    finally {
        loading.value = false;
    }
}
/**
 * 构建图表配置
 */
function buildOption() {
    if (!chartData.value)
        return {};
    const t = getChartTheme(themeStore.theme);
    const d = chartData.value;
    const barColor = t.palette.primary;
    const barFaceData = d.alarmCount.map((value, index) => [index, value, barColor]);
    return {
        backgroundColor: 'transparent',
        animation: true,
        animationDuration: 360,
        animationEasing: 'cubicOut',
        animationDurationUpdate: 360,
        animationEasingUpdate: 'cubicOut',
        tooltip: { ...t.tooltip(), axisPointer: { type: 'cross' } },
        legend: t.legend(['报警数', '仓内湿度', '仓外湿度']),
        grid: {
            left: '3%',
            right: '5%',
            bottom: '3%',
            top: '15%',
            containLabel: true,
        },
        xAxis: t.categoryAxis(d.dates),
        yAxis: [
            { ...t.valueAxis('报警数'), position: 'left' },
            { ...t.valueAxis('湿度(%)'), position: 'right', splitLine: { show: false } },
        ],
        series: [
            // 2.5D 柱体：正面渐变、受光顶面与侧面均随数据动画同步生长。
            {
                name: '报警数底面',
                type: 'custom',
                data: barFaceData,
                renderItem: renderBarBottom,
                silent: true,
                tooltip: { show: false },
                z: 0,
            },
            {
                name: '报警数侧面',
                type: 'custom',
                data: barFaceData,
                renderItem: renderBarSide,
                silent: true,
                tooltip: { show: false },
                z: 1,
            },
            {
                name: '报警数',
                type: 'bar',
                data: d.alarmCount,
                barWidth: `${BAR_WIDTH_RATIO * 100}%`,
                itemStyle: {
                    color: createVerticalGradient(barColor, 0.98, 0.32),
                    borderRadius: [1, 1, 0, 0],
                },
                z: 2,
            },
            {
                name: '报警数顶面',
                type: 'custom',
                data: barFaceData,
                renderItem: renderBarTop,
                silent: true,
                tooltip: { show: false },
                z: 3,
            },
            // 折线图：显示实心节点，并以局部荧光突出湿度变化位置。
            t.lineSeries({
                name: '仓内湿度',
                yAxisIndex: 1,
                data: d.insideHumidity,
                showSymbol: true,
                symbolSize: 7,
                lineStyle: { color: t.palette.primary, width: 2.6, shadowBlur: 10, shadowColor: t.palette.primary },
                itemStyle: {
                    color: t.palette.primary,
                    borderColor: t.palette.primary,
                    borderWidth: 0,
                    shadowBlur: 12,
                    shadowColor: t.palette.primary,
                },
            }),
            t.lineSeries({
                name: '仓外湿度',
                yAxisIndex: 1,
                data: d.outsideHumidity,
                showSymbol: true,
                symbolSize: 7,
                lineStyle: { color: t.palette.warning, width: 2.6, shadowBlur: 10, shadowColor: t.palette.warning },
                itemStyle: {
                    color: t.palette.warning,
                    borderColor: t.palette.warning,
                    borderWidth: 0,
                    shadowBlur: 12,
                    shadowColor: t.palette.warning,
                },
            }),
        ],
    };
}
/**
 * 渲染图表
 */
function renderChart() {
    if (!chartData.value)
        return;
    const option = buildOption();
    if (getInstance()) {
        setOption(option);
    }
    else {
        initChart(option);
    }
}
function setDateRange(range) {
    if (dateRange.value !== range)
        dateRange.value = range;
}
// 监听 dateRange 变化，无感更新数据
watch(dateRange, () => {
    fetchData();
});
onMounted(() => {
    fetchData();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "humidity-trend" },
});
/** @type {__VLS_StyleScopedClasses['humidity-trend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "humidity-trend__header" },
});
/** @type {__VLS_StyleScopedClasses['humidity-trend__header']} */ ;
const __VLS_0 = PanelHeading || PanelHeading;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "humidity-trend__title" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "humidity-trend__title" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['humidity-trend__title']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "humidity-trend__date-toggle" },
    'aria-label': "数据范围",
});
/** @type {__VLS_StyleScopedClasses['humidity-trend__date-toggle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setDateRange(7));
            // @ts-ignore
            [setDateRange,];
        } },
    ...{ class: "humidity-trend__date-btn" },
    ...{ class: ({ 'is-active': __VLS_ctx.dateRange === 7 }) },
    type: "button",
});
/** @type {__VLS_StyleScopedClasses['humidity-trend__date-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setDateRange(30));
            // @ts-ignore
            [setDateRange, dateRange,];
        } },
    ...{ class: "humidity-trend__date-btn" },
    ...{ class: ({ 'is-active': __VLS_ctx.dateRange === 30 }) },
    type: "button",
});
/** @type {__VLS_StyleScopedClasses['humidity-trend__date-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "humidity-trend__body" },
});
/** @type {__VLS_StyleScopedClasses['humidity-trend__body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "chartRef",
    ...{ class: "humidity-trend__canvas" },
});
/** @type {__VLS_StyleScopedClasses['humidity-trend__canvas']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "humidity-trend__state" },
        'aria-live': "polite",
    });
    /** @type {__VLS_StyleScopedClasses['humidity-trend__state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "humidity-trend__spinner" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['humidity-trend__spinner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.errorMsg) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "humidity-trend__state humidity-trend__state--error" },
        role: "alert",
    });
    /** @type {__VLS_StyleScopedClasses['humidity-trend__state']} */ ;
    /** @type {__VLS_StyleScopedClasses['humidity-trend__state--error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.errorMsg);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.fetchData) },
        ...{ class: "humidity-trend__retry" },
        type: "button",
    });
    /** @type {__VLS_StyleScopedClasses['humidity-trend__retry']} */ ;
}
else if (!__VLS_ctx.chartData) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "humidity-trend__state" },
    });
    /** @type {__VLS_StyleScopedClasses['humidity-trend__state']} */ ;
}
// @ts-ignore
[dateRange, loading, errorMsg, errorMsg, fetchData, chartData,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
