/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
// ============================================
// GasChart - 气体检测折线图（Tab 内部组件）
// 功能：展示全部仓房的 CO2 / O2 / PH3 气体浓度折线图，并自动轮播可视窗口
// 数据来源：getGasDetectData() Mock 接口
// Green/Blue 主题切换实时同步颜色（不重新请求数据）
// 语义色（视觉规范 §17.4）：CO2 info（主监测气体，区别 O2）/
// O2 success（正常氧气）/ PH3 danger（危险熏蒸气体）
// ============================================
import { ref, onMounted, toRef } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { useECharts } from '@/composables/useECharts';
import { createLoopingCategorySeries, useCategoryAutoScroll } from '@/composables/useCategoryAutoScroll';
import { CHART_SEMANTIC, createVerticalGradient, getChartTheme } from '@/composables/chartTheme';
import { getGasDetectData } from '@/api/modules/chart';
defineOptions({ name: 'GasChart' });
const props = withDefaults(defineProps(), {
    active: false,
});
const isActive = toRef(props, 'active');
const themeStore = useThemeStore();
const chartRef = ref(null);
const chartData = ref(null);
const loading = ref(true);
const errorMsg = ref('');
const carouselStartIndex = ref(0);
const { initChart, setOption, getInstance } = useECharts(chartRef, { onThemeChange: () => renderChart() });
const { configure: configureAutoScroll } = useCategoryAutoScroll(isActive, (startIndex) => {
    carouselStartIndex.value = startIndex;
    renderChart();
});
/**
 * 获取数据
 */
async function fetchData() {
    loading.value = true;
    errorMsg.value = '';
    try {
        const data = await getGasDetectData();
        if (data) {
            chartData.value = data;
            configureAutoScroll(data.warehouseIds.length);
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
    const loopedData = createLoopingCategorySeries(d.warehouseIds, [d.co2, d.o2, d.ph3], carouselStartIndex.value);
    return {
        backgroundColor: 'transparent',
        animation: true,
        animationDurationUpdate: 360,
        animationEasingUpdate: 'cubicOut',
        tooltip: { ...t.tooltip(), axisPointer: { type: 'shadow' } },
        legend: t.legend(['CO2', 'O2', 'PH3']),
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true,
        },
        xAxis: t.categoryAxis(loopedData.categories, 0),
        yAxis: [
            { ...t.valueAxis('CO2(ppm)'), position: 'left' },
            { ...t.valueAxis('O2/PH3(%)'), position: 'right', splitLine: { show: false } },
        ],
        series: [
            // 三条曲线均采用各自颜色的低透明面积渐变。
            t.lineSeries({
                name: 'CO2',
                data: loopedData.series[0],
                itemStyle: { color: CHART_SEMANTIC.info },
                areaStyle: {
                    color: createVerticalGradient(CHART_SEMANTIC.info, 0.24, 0.02),
                },
            }),
            // O2（success，正常氧气语义）
            t.lineSeries({
                name: 'O2',
                yAxisIndex: 1,
                data: loopedData.series[1],
                itemStyle: { color: t.palette.success },
                areaStyle: {
                    color: createVerticalGradient(t.palette.success, 0.22, 0.02),
                },
            }),
            // PH3（danger，危险熏蒸气体语义）
            t.lineSeries({
                name: 'PH3',
                yAxisIndex: 1,
                data: loopedData.series[2],
                itemStyle: { color: t.palette.danger },
                areaStyle: {
                    color: createVerticalGradient(t.palette.danger, 0.18, 0.01),
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
        setOption(option, false);
    }
    else {
        initChart(option);
    }
}
onMounted(() => {
    fetchData();
});
const __VLS_defaults = {
    active: false,
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "gas-chart" },
});
/** @type {__VLS_StyleScopedClasses['gas-chart']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "chartRef",
    ...{ class: "gas-chart__canvas" },
});
/** @type {__VLS_StyleScopedClasses['gas-chart__canvas']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "gas-chart__state" },
        'aria-live': "polite",
    });
    /** @type {__VLS_StyleScopedClasses['gas-chart__state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "gas-chart__spinner" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['gas-chart__spinner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.errorMsg) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "gas-chart__state gas-chart__state--error" },
        role: "alert",
    });
    /** @type {__VLS_StyleScopedClasses['gas-chart__state']} */ ;
    /** @type {__VLS_StyleScopedClasses['gas-chart__state--error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.errorMsg);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.fetchData) },
        ...{ class: "gas-chart__retry" },
        type: "button",
    });
    /** @type {__VLS_StyleScopedClasses['gas-chart__retry']} */ ;
}
else if (!__VLS_ctx.chartData) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "gas-chart__state" },
    });
    /** @type {__VLS_StyleScopedClasses['gas-chart__state']} */ ;
}
// @ts-ignore
[loading, errorMsg, errorMsg, fetchData, chartData,];
const __VLS_export = (await import('vue')).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
export default {};
