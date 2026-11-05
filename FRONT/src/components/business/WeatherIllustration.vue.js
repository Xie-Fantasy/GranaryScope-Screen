/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, useId } from 'vue';
const props = withDefaults(defineProps(), { active: true });
const illustrationId = useId();
const variant = computed(() => {
    if (props.condition.includes('雨'))
        return 'rain';
    if (props.condition.includes('阴'))
        return 'overcast';
    if (props.condition === '多云')
        return 'cloudy';
    return 'partly-cloudy';
});
const cloudPath = 'M55 111c-13 0-23-9-23-21 0-12 9-21 21-21h2c3-15 14-25 29-25 17 0 30 12 32 28 15-1 26 8 26 20s-10 19-23 19Z';
const __VLS_defaults = { active: true };
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['weather-illustration__orbit']} */ ;
/** @type {__VLS_StyleScopedClasses['weather-illustration__glow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    ...{ class: "weather-illustration" },
    ...{ class: ([`weather-illustration--${__VLS_ctx.variant}`, { 'weather-illustration--paused': !__VLS_ctx.active }]) },
    viewBox: "0 0 160 150",
    fill: "none",
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['weather-illustration']} */ ;
/** @type {__VLS_StyleScopedClasses['weather-illustration--paused']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.defs, __VLS_intrinsics.defs)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.linearGradient, __VLS_intrinsics.linearGradient)({
    id: (__VLS_ctx.illustrationId + '-sun'),
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "1",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: "0",
    'stop-color': "var(--text-primary)",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: ".38",
    'stop-color': "var(--theme-gold)",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: "1",
    'stop-color': "var(--warning)",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.linearGradient, __VLS_intrinsics.linearGradient)({
    id: (__VLS_ctx.illustrationId + '-cloud'),
    x1: "0",
    y1: "0",
    x2: ".6",
    y2: "1",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: "0",
    'stop-color': "var(--weather-cloud-light)",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: ".45",
    'stop-color': "var(--weather-cloud-mid)",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: "1",
    'stop-color': "var(--weather-cloud-base)",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.radialGradient, __VLS_intrinsics.radialGradient)({
    id: (__VLS_ctx.illustrationId + '-glow'),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: "0",
    'stop-color': "var(--primary)",
    'stop-opacity': ".5",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: ".45",
    'stop-color': "var(--primary)",
    'stop-opacity': ".16",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: "1",
    'stop-color': "var(--primary)",
    'stop-opacity': "0",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.radialGradient, __VLS_intrinsics.radialGradient)({
    id: (__VLS_ctx.illustrationId + '-fade'),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: "0",
    'stop-color': "white",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: ".6",
    'stop-color': "white",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: "1",
    'stop-color': "black",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.mask, __VLS_intrinsics.mask)({
    id: (__VLS_ctx.illustrationId + '-orbit-mask'),
    maskUnits: "userSpaceOnUse",
    x: "5",
    y: "113",
    width: "150",
    height: "34",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.ellipse)({
    cx: "80",
    cy: "130",
    rx: "75",
    ry: "17",
    fill: (`url(#${__VLS_ctx.illustrationId}-fade)`),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.ellipse)({
    ...{ class: "weather-illustration__glow" },
    cx: "80",
    cy: "130",
    rx: "66",
    ry: "14",
    fill: (`url(#${__VLS_ctx.illustrationId}-glow)`),
});
/** @type {__VLS_StyleScopedClasses['weather-illustration__glow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.g, __VLS_intrinsics.g)({
    ...{ class: "weather-illustration__orbits" },
    mask: (`url(#${__VLS_ctx.illustrationId}-orbit-mask)`),
});
/** @type {__VLS_StyleScopedClasses['weather-illustration__orbits']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.ellipse)({
    ...{ class: "weather-illustration__orbit" },
    cx: "80",
    cy: "130",
    rx: "70",
    ry: "15",
});
/** @type {__VLS_StyleScopedClasses['weather-illustration__orbit']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.ellipse)({
    ...{ class: "weather-illustration__orbit weather-illustration__orbit--delayed" },
    cx: "80",
    cy: "130",
    rx: "70",
    ry: "15",
});
/** @type {__VLS_StyleScopedClasses['weather-illustration__orbit']} */ ;
/** @type {__VLS_StyleScopedClasses['weather-illustration__orbit--delayed']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.ellipse)({
    ...{ class: "weather-illustration__core" },
    cx: "80",
    cy: "130",
    rx: "25",
    ry: "4",
});
/** @type {__VLS_StyleScopedClasses['weather-illustration__core']} */ ;
if (__VLS_ctx.variant === 'partly-cloudy') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.g, __VLS_intrinsics.g)({
        ...{ class: "weather-illustration__sun" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-illustration__sun']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M63 14V6M36 24l-6-6M25 50h-9M95 24l6-6M102 50h9M36 79l-6 6",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "63",
        cy: "51",
        r: "26",
        fill: (`url(#${__VLS_ctx.illustrationId}-sun)`),
    });
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        ...{ class: "weather-illustration__cloud weather-illustration__cloud--back" },
        d: (__VLS_ctx.cloudPath),
        transform: "translate(-12 -5) scale(.86)",
        fill: (`url(#${__VLS_ctx.illustrationId}-cloud)`),
    });
    /** @type {__VLS_StyleScopedClasses['weather-illustration__cloud']} */ ;
    /** @type {__VLS_StyleScopedClasses['weather-illustration__cloud--back']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    ...{ class: "weather-illustration__cloud" },
    d: (__VLS_ctx.cloudPath),
    transform: (__VLS_ctx.variant === 'rain' ? 'translate(0 -15)' : undefined),
    fill: (`url(#${__VLS_ctx.illustrationId}-cloud)`),
});
/** @type {__VLS_StyleScopedClasses['weather-illustration__cloud']} */ ;
if (__VLS_ctx.variant === 'rain') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.g, __VLS_intrinsics.g)({
        ...{ class: "weather-illustration__rain" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-illustration__rain']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "m55 104-4 8m30-8-4 8m30-8-4 8",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "m66 115-3 6m30-6-3 6",
        opacity: ".65",
    });
}
// @ts-ignore
[variant, variant, variant, variant, active, illustrationId, illustrationId, illustrationId, illustrationId, illustrationId, illustrationId, illustrationId, illustrationId, illustrationId, illustrationId, illustrationId, cloudPath, cloudPath,];
const __VLS_export = (await import('vue')).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
export default {};
