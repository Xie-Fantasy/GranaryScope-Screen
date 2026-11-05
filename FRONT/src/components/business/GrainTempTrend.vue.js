/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import PanelHeading from '@/components/common/PanelHeading.vue';
// ============================================
// GrainTempTrend - 粮温趋势组合图表
// 功能：柱状图（报警数）+ 折线图（外温/粮温均值/最高粮温/最低粮温）
// 数据来源：getGrainTempTrend(dateRange) Mock 接口
// 说明：
// - 支持 7日/30日切换，无感更新数据（setOption 不重建实例）
// - Green/Blue 主题切换实时同步颜色（不重新请求数据）
// 视觉色：报警数使用主题色渐变（本轮视觉要求）/ 外温 warning /
// 粮温均值 primary / 最高粮温 danger(虚线) / 最低粮温 success(虚线)
// ============================================
import { ref, onMounted, watch } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { useECharts } from '@/composables/useECharts';
import { createVerticalGradient, getChartTheme } from '@/composables/chartTheme';
import { getGrainTempTrend } from '@/api/modules/chart';
defineOptions({ name: 'GrainTempTrend' });
// 仅服务本图表，切换不影响异常报警或湿度趋势。
const dateRange = ref(7);
const themeStore = useThemeStore();
// 图表容器
const chartRef = ref(null);
// 数据
const chartData = ref(null);
// 加载状态
const loading = ref(true);
// 错误信息
const errorMsg = ref('');
const { initChart, setOption, getInstance } = useECharts(chartRef, { onThemeChange: () => renderChart() });
/**
 * 获取数据
 */
async function fetchData() {
    loading.value = true;
    errorMsg.value = '';
    try {
        const data = await getGrainTempTrend(dateRange.value);
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
    return {
        backgroundColor: 'transparent',
        tooltip: { ...t.tooltip(), axisPointer: { type: 'cross' } },
        legend: t.legend(['报警数', '外温', '粮温均值', '最高粮温', '最低粮温']),
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
            { ...t.valueAxis('温度(°C)'), position: 'right', splitLine: { show: false } },
        ],
        series: [
            // 柱状图：以主题青色渐变呈现，亮顶到透明底与趋势线保持清晰分层。
            {
                name: '报警数',
                type: 'bar',
                data: d.alarmCount,
                barWidth: '40%',
                itemStyle: {
                    color: createVerticalGradient(t.palette.primary, 0.98, 0.12),
                    borderRadius: [2, 2, 0, 0],
                },
            },
            // 折线图：外温（warning）
            t.lineSeries({
                name: '外温',
                yAxisIndex: 1,
                data: d.outsideTemp,
                smooth: true,
                showSymbol: true,
                symbolSize: 6,
                lineStyle: { color: t.palette.warning, width: 2.3, shadowBlur: 9, shadowColor: t.palette.warning },
                itemStyle: { color: t.palette.warning, borderColor: t.palette.warning, borderWidth: 0, shadowBlur: 10, shadowColor: t.palette.warning },
            }),
            // 折线图：粮温均值（primary，主题色）
            t.lineSeries({
                name: '粮温均值',
                yAxisIndex: 1,
                data: d.avgTemp,
                smooth: true,
                showSymbol: true,
                symbolSize: 6,
                lineStyle: { color: t.palette.primary, width: 2.3, shadowBlur: 9, shadowColor: t.palette.primary },
                itemStyle: { color: t.palette.primary, borderColor: t.palette.primary, borderWidth: 0, shadowBlur: 10, shadowColor: t.palette.primary },
            }),
            // 折线图：最高粮温（danger，虚线区分）
            t.lineSeries({
                name: '最高粮温',
                yAxisIndex: 1,
                data: d.maxTemp,
                smooth: false,
                showSymbol: true,
                symbolSize: 6,
                lineStyle: { color: t.palette.danger, width: 2.3, shadowBlur: 9, shadowColor: t.palette.danger },
                itemStyle: { color: t.palette.danger, borderColor: t.palette.danger, borderWidth: 0, shadowBlur: 10, shadowColor: t.palette.danger },
            }),
            // 折线图：最低粮温（success，虚线区分）
            t.lineSeries({
                name: '最低粮温',
                yAxisIndex: 1,
                data: d.minTemp,
                smooth: false,
                showSymbol: true,
                symbolSize: 6,
                lineStyle: { color: t.palette.success, width: 2.3, shadowBlur: 9, shadowColor: t.palette.success },
                itemStyle: { color: t.palette.success, borderColor: t.palette.success, borderWidth: 0, shadowBlur: 10, shadowColor: t.palette.success },
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
    ...{ class: "grain-temp-trend" },
});
/** @type {__VLS_StyleScopedClasses['grain-temp-trend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "grain-temp-trend__header" },
});
/** @type {__VLS_StyleScopedClasses['grain-temp-trend__header']} */ ;
const __VLS_0 = PanelHeading || PanelHeading;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "grain-temp-trend__title" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "grain-temp-trend__title" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['grain-temp-trend__title']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grain-temp-trend__date-toggle" },
    'aria-label': "数据范围",
});
/** @type {__VLS_StyleScopedClasses['grain-temp-trend__date-toggle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setDateRange(7));
            // @ts-ignore
            [setDateRange,];
        } },
    ...{ class: "grain-temp-trend__date-btn" },
    ...{ class: ({ 'is-active': __VLS_ctx.dateRange === 7 }) },
    type: "button",
});
/** @type {__VLS_StyleScopedClasses['grain-temp-trend__date-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setDateRange(30));
            // @ts-ignore
            [setDateRange, dateRange,];
        } },
    ...{ class: "grain-temp-trend__date-btn" },
    ...{ class: ({ 'is-active': __VLS_ctx.dateRange === 30 }) },
    type: "button",
});
/** @type {__VLS_StyleScopedClasses['grain-temp-trend__date-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grain-temp-trend__body" },
});
/** @type {__VLS_StyleScopedClasses['grain-temp-trend__body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "chartRef",
    ...{ class: "grain-temp-trend__canvas" },
});
/** @type {__VLS_StyleScopedClasses['grain-temp-trend__canvas']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grain-temp-trend__state" },
        'aria-live': "polite",
    });
    /** @type {__VLS_StyleScopedClasses['grain-temp-trend__state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "grain-temp-trend__spinner" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['grain-temp-trend__spinner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.errorMsg) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grain-temp-trend__state grain-temp-trend__state--error" },
        role: "alert",
    });
    /** @type {__VLS_StyleScopedClasses['grain-temp-trend__state']} */ ;
    /** @type {__VLS_StyleScopedClasses['grain-temp-trend__state--error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.errorMsg);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.fetchData) },
        ...{ class: "grain-temp-trend__retry" },
        type: "button",
    });
    /** @type {__VLS_StyleScopedClasses['grain-temp-trend__retry']} */ ;
}
else if (!__VLS_ctx.chartData) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grain-temp-trend__state" },
    });
    /** @type {__VLS_StyleScopedClasses['grain-temp-trend__state']} */ ;
}
// @ts-ignore
[dateRange, loading, errorMsg, errorMsg, fetchData, chartData,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
