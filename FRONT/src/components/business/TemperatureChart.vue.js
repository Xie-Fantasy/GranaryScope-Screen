/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
// ============================================
// TemperatureChart - 温度检测折线图（Tab 内部组件）
// 功能：展示全部仓房的高温/均温/最高/最低温度折线图，并自动轮播可视窗口
// 数据来源：getTempDetectData() Mock 接口
// Green/Blue 主题切换实时同步颜色（不重新请求数据）
// 语义色（视觉规范 §17.4）：高温报警 danger / 平均温度 primary /
// 最高温度 danger(虚线) / 最低温度 success(虚线)
// ============================================
import { ref, onMounted, toRef } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { useECharts } from '@/composables/useECharts';
import { createLoopingCategorySeries, useCategoryAutoScroll } from '@/composables/useCategoryAutoScroll';
import { getChartTheme } from '@/composables/chartTheme';
import { getTempDetectData } from '@/api/modules/chart';
defineOptions({ name: 'TemperatureChart' });
const props = withDefaults(defineProps(), {
    active: false,
});
const isActive = toRef(props, 'active');
const themeStore = useThemeStore();
// 图表容器引用
const chartRef = ref(null);
// 数据
const chartData = ref(null);
const loading = ref(true);
const errorMsg = ref('');
const carouselStartIndex = ref(0);
// 使用 useECharts
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
        const data = await getTempDetectData();
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
    const loopedData = createLoopingCategorySeries(d.warehouseIds, [d.highTemp, d.avgTemp, d.maxTemp, d.minTemp], carouselStartIndex.value);
    const pointLine = {
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        smooth: true,
    };
    return {
        backgroundColor: 'transparent',
        animation: true,
        animationDurationUpdate: 360,
        animationEasingUpdate: 'cubicOut',
        tooltip: { ...t.tooltip(), axisPointer: { type: 'shadow' } },
        legend: t.legend(['高温报警', '平均温度', '最高温度', '最低温度']),
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true,
        },
        xAxis: t.categoryAxis(loopedData.categories, 0),
        yAxis: {
            ...t.valueAxis(),
            axisLabel: { color: t.text.tertiary, fontSize: 11, formatter: '{value}°C' },
        },
        series: [
            // 高温报警（danger 语义色）
            t.lineSeries({
                name: '高温报警',
                data: loopedData.series[0],
                ...pointLine,
                itemStyle: { color: t.palette.danger },
            }),
            // 平均温度（primary，主题色主系列）
            t.lineSeries({
                name: '平均温度',
                data: loopedData.series[1],
                ...pointLine,
                itemStyle: { color: t.palette.primary },
            }),
            // 最高温度（danger，虚线区分）
            t.lineSeries({
                name: '最高温度',
                data: loopedData.series[2],
                ...pointLine,
                smooth: false,
                lineStyle: { width: 2, type: 'dashed' },
                itemStyle: { color: t.palette.danger },
            }),
            // 最低温度（success，虚线区分）
            t.lineSeries({
                name: '最低温度',
                data: loopedData.series[3],
                ...pointLine,
                smooth: false,
                lineStyle: { width: 2, type: 'dashed' },
                itemStyle: { color: t.palette.success },
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
    // 如果实例已存在，setOption 更新；否则 initChart 初始化
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
    ...{ class: "temperature-chart" },
});
/** @type {__VLS_StyleScopedClasses['temperature-chart']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "chartRef",
    ...{ class: "temperature-chart__canvas" },
});
/** @type {__VLS_StyleScopedClasses['temperature-chart__canvas']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "temperature-chart__state" },
        'aria-live': "polite",
    });
    /** @type {__VLS_StyleScopedClasses['temperature-chart__state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "temperature-chart__spinner" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['temperature-chart__spinner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.errorMsg) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "temperature-chart__state temperature-chart__state--error" },
        role: "alert",
    });
    /** @type {__VLS_StyleScopedClasses['temperature-chart__state']} */ ;
    /** @type {__VLS_StyleScopedClasses['temperature-chart__state--error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.errorMsg);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.fetchData) },
        ...{ class: "temperature-chart__retry" },
        type: "button",
    });
    /** @type {__VLS_StyleScopedClasses['temperature-chart__retry']} */ ;
}
else if (!__VLS_ctx.chartData) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "temperature-chart__state" },
    });
    /** @type {__VLS_StyleScopedClasses['temperature-chart__state']} */ ;
}
// @ts-ignore
[loading, errorMsg, errorMsg, fetchData, chartData,];
const __VLS_export = (await import('vue')).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
export default {};
