/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
// ============================================
// 仓储智能化页面（intelligent.vue）
// 布局：
// - 上层（约 65%）：左 DeviceOverview / 中 视频检测区 / 右 WarehouseJob
// - 下层（约 35%）：左 GrainTempTrend / 右 TabChartWrapper
// 说明：左右面板等宽，3D 模型区域与 monitor 页面保持一致
// ============================================
import DeviceOverview from '@/components/business/DeviceOverview.vue';
import WarehouseJob from '@/components/business/WarehouseJob.vue';
import GrainTempTrend from '@/components/business/GrainTempTrend.vue';
import TabChartWrapper from '@/components/business/TabChartWrapper.vue';
import CameraDetectionStage from '@/components/common/CameraDetectionStage.vue';
defineOptions({ name: 'Intelligent' });
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "intelligent" },
});
/** @type {__VLS_StyleScopedClasses['intelligent']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "intelligent__top" },
});
/** @type {__VLS_StyleScopedClasses['intelligent__top']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "intelligent__top-left" },
});
/** @type {__VLS_StyleScopedClasses['intelligent__top-left']} */ ;
const __VLS_0 = DeviceOverview;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "intelligent__top-center" },
});
/** @type {__VLS_StyleScopedClasses['intelligent__top-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "intelligent__model-area" },
});
/** @type {__VLS_StyleScopedClasses['intelligent__model-area']} */ ;
const __VLS_5 = CameraDetectionStage;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({}));
const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "intelligent__top-right" },
});
/** @type {__VLS_StyleScopedClasses['intelligent__top-right']} */ ;
const __VLS_10 = WarehouseJob;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({}));
const __VLS_12 = __VLS_11({}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "intelligent__bottom" },
});
/** @type {__VLS_StyleScopedClasses['intelligent__bottom']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "intelligent__bottom-left" },
});
/** @type {__VLS_StyleScopedClasses['intelligent__bottom-left']} */ ;
const __VLS_15 = GrainTempTrend;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({}));
const __VLS_17 = __VLS_16({}, ...__VLS_functionalComponentArgsRest(__VLS_16));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "intelligent__bottom-right" },
});
/** @type {__VLS_StyleScopedClasses['intelligent__bottom-right']} */ ;
const __VLS_20 = TabChartWrapper;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
