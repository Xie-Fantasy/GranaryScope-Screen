/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
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
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['monitor__summary-panel__item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "monitor" },
});
/** @type {__VLS_StyleScopedClasses['monitor']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "monitor__top" },
});
/** @type {__VLS_StyleScopedClasses['monitor__top']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "monitor__side monitor__top-left" },
});
/** @type {__VLS_StyleScopedClasses['monitor__side']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor__top-left']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "monitor__summary-panel" },
});
/** @type {__VLS_StyleScopedClasses['monitor__summary-panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "monitor__summary-panel__item" },
});
/** @type {__VLS_StyleScopedClasses['monitor__summary-panel__item']} */ ;
const __VLS_0 = IndicatorCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "monitor__summary-panel__item" },
});
/** @type {__VLS_StyleScopedClasses['monitor__summary-panel__item']} */ ;
const __VLS_5 = AlarmCard;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({}));
const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "monitor__top-center" },
});
/** @type {__VLS_StyleScopedClasses['monitor__top-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "monitor__model-area" },
});
/** @type {__VLS_StyleScopedClasses['monitor__model-area']} */ ;
const __VLS_10 = CameraDetectionStage;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({}));
const __VLS_12 = __VLS_11({}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "monitor__side monitor__top-right" },
});
/** @type {__VLS_StyleScopedClasses['monitor__side']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor__top-right']} */ ;
const __VLS_15 = WeatherWidget;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({}));
const __VLS_17 = __VLS_16({}, ...__VLS_functionalComponentArgsRest(__VLS_16));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "monitor__bottom" },
});
/** @type {__VLS_StyleScopedClasses['monitor__bottom']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "monitor__chart monitor__chart--alarm" },
});
/** @type {__VLS_StyleScopedClasses['monitor__chart']} */ ;
/** @type {__VLS_StyleScopedClasses['monitor__chart--alarm']} */ ;
const __VLS_20 = DoubleBarChart;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "monitor__chart" },
});
/** @type {__VLS_StyleScopedClasses['monitor__chart']} */ ;
const __VLS_25 = GrainTempTrend;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "monitor__chart" },
});
/** @type {__VLS_StyleScopedClasses['monitor__chart']} */ ;
const __VLS_30 = HumidityTrend;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({}));
const __VLS_32 = __VLS_31({}, ...__VLS_functionalComponentArgsRest(__VLS_31));
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
