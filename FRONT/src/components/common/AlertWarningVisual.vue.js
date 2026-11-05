/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
defineOptions({ name: 'AlertWarningVisual' });
const props = defineProps();
const isOutsideTemperature = computed(() => props.alert.key === 2);
const isInsectWarning = computed(() => props.alert.key === 3);
const isTemperatureHumidity = computed(() => props.alert.key === 5);
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__caption']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__weather-reading']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__insect-reading']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__weather-reading']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__insect-reading']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__threshold-line']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__insect-scale']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__insect-scale']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__insect-reading']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__temperature-humidity']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__sensor-readout']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__sensor-readout']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__sensor-readout']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__sensor-readout']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__sensor-readout']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__dual-status']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__thermometer']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__bug']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__sensor-readout']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.figure, __VLS_intrinsics.figure)({
    ...{ class: "alert-warning-visual" },
    ...{ class: (`alert-warning-visual--${__VLS_ctx.alert.key}`) },
});
/** @type {__VLS_StyleScopedClasses['alert-warning-visual']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.figcaption, __VLS_intrinsics.figcaption)({
    ...{ class: "alert-warning-visual__caption" },
});
/** @type {__VLS_StyleScopedClasses['alert-warning-visual__caption']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.alert.sourceLabel);
__VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
if (__VLS_ctx.isOutsideTemperature) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-visual__weather" },
        'aria-label': "仓外温度数据图示",
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-visual__weather']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ class: "alert-warning-visual__thermometer" },
        viewBox: "0 0 92 168",
        fill: "none",
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-visual__thermometer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M46 14a16 16 0 0 0-16 16v74.4a32 32 0 1 0 32 0V30a16 16 0 0 0-16-16Z",
        stroke: "currentColor",
        'stroke-width': "4",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M46 46v78",
        stroke: "currentColor",
        'stroke-width': "10",
        'stroke-linecap': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "46",
        cy: "136",
        r: "17",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M66 37h11M66 66h11M66 95h11",
        stroke: "currentColor",
        'stroke-width': "2",
        opacity: ".56",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-visual__weather-reading" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-visual__weather-reading']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.alert.primaryMetric.value);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.alert.metrics[0]?.value);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-visual__threshold-line" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-visual__threshold-line']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.alert.metrics[2]?.label);
    (__VLS_ctx.alert.metrics[2]?.value);
}
else if (__VLS_ctx.isInsectWarning) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-visual__insect" },
        'aria-label': "虫情监测数据图示",
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-visual__insect']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ class: "alert-warning-visual__bug" },
        viewBox: "0 0 124 124",
        fill: "none",
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-visual__bug']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M62 35c-17 0-27 14-27 34 0 15 10 28 27 28s27-13 27-28c0-20-10-34-27-34Z",
        stroke: "currentColor",
        'stroke-width': "5",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "62",
        cy: "25",
        r: "10",
        stroke: "currentColor",
        'stroke-width': "5",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M44 50 25 39M43 68 20 68M45 85 25 97M80 50l19-11M81 68h23M79 85l20 12M55 42v47M69 42v47",
        stroke: "currentColor",
        'stroke-width': "5",
        'stroke-linecap': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-visual__insect-reading" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-visual__insect-reading']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.alert.primaryMetric.value);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.alert.metrics[3]?.value);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-visual__insect-scale" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-visual__insect-scale']} */ ;
    for (const [index] of __VLS_vFor((6))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            key: (index),
            ...{ class: ({ 'is-active': index <= 5 }) },
        });
        /** @type {__VLS_StyleScopedClasses['is-active']} */ ;
        // @ts-ignore
        [alert, alert, alert, alert, alert, alert, alert, alert, isOutsideTemperature, isInsectWarning,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
    (__VLS_ctx.alert.metrics[0]?.label);
    (__VLS_ctx.alert.metrics[0]?.value);
    __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
    (__VLS_ctx.alert.metrics[1]?.value);
    (__VLS_ctx.alert.metrics[2]?.label);
    (__VLS_ctx.alert.metrics[2]?.value);
}
else if (__VLS_ctx.isTemperatureHumidity) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-visual__temperature-humidity" },
        'aria-label': "温湿度数据图示",
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-visual__temperature-humidity']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-visual__sensor-readout" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-visual__sensor-readout']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 74 104",
        fill: "none",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M37 9a12 12 0 0 0-12 12v43.5a24 24 0 1 0 24 0V21A12 12 0 0 0 37 9Z",
        stroke: "currentColor",
        'stroke-width': "4",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M37 34v43",
        stroke: "currentColor",
        'stroke-width': "8",
        'stroke-linecap': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "37",
        cy: "83",
        r: "13",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.alert.primaryMetric.value);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-visual__sensor-readout" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-visual__sensor-readout']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 84 104",
        fill: "none",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M42 10C31 28 19 42 19 62a23 23 0 1 0 46 0C65 42 53 28 42 10Z",
        stroke: "currentColor",
        'stroke-width': "4",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M31 67c3 8 10 12 18 12",
        stroke: "currentColor",
        'stroke-width': "4",
        'stroke-linecap': "round",
        opacity: ".7",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.alert.metrics[1]?.value);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-visual__dual-status" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-visual__dual-status']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.alert.metrics[0]?.value);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.alert.metrics[2]?.value);
}
// @ts-ignore
[alert, alert, alert, alert, alert, alert, alert, alert, alert, isTemperatureHumidity,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
