/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, onActivated, onDeactivated, onMounted, onUnmounted, ref, useId } from 'vue';
import PanelHeading from '@/components/common/PanelHeading.vue';
import WeatherIllustration from '@/components/business/WeatherIllustration.vue';
import { getWeatherData } from '@/api/modules/warehouse';
defineOptions({ name: 'WeatherWidget' });
const widgetId = useId();
const weatherData = ref(null);
const loading = ref(true);
const errorMsg = ref('');
const active = ref(false);
// Presentation-only demo modes; numerical observations still come from API + Mock.
const weatherModes = ['晴转多云', '多云', '下雨', '阴'];
const previewCondition = ref(null);
const displayedCondition = computed(() => previewCondition.value ?? weatherData.value?.condition ?? '--');
function handleWeatherKeydown(event) {
    if (!active.value || !weatherData.value || loading.value || errorMsg.value ||
        event.code !== 'Numpad0' || event.repeat || event.isComposing || event.defaultPrevented ||
        event.ctrlKey || event.altKey || event.metaKey || event.shiftKey)
        return;
    const target = event.target;
    if (target instanceof Element && target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'))
        return;
    if (document.querySelector('[role="dialog"], dialog[open]'))
        return;
    event.preventDefault();
    const currentIndex = weatherModes.findIndex(condition => condition === displayedCondition.value);
    previewCondition.value = weatherModes[(currentIndex + 1) % weatherModes.length] ?? weatherModes[0];
}
function activate() {
    active.value = true;
    window.addEventListener('keydown', handleWeatherKeydown);
}
function deactivate() {
    active.value = false;
    window.removeEventListener('keydown', handleWeatherKeydown);
}
onActivated(activate);
onDeactivated(deactivate);
onUnmounted(deactivate);
const adviceStates = {
    suitable: { label: '适宜', tone: 'success' },
    caution: { label: '需注意', tone: 'warning' },
    unsuitable: { label: '不适宜', tone: 'danger' },
};
const adviceState = computed(() => {
    const status = weatherData.value?.suggestionStatus;
    return status && Object.hasOwn(adviceStates, status)
        ? adviceStates[status]
        : { label: '待评估', tone: 'offline' };
});
function formatNumber(value, digits = 0) {
    return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : '--';
}
function formatCount(value) {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? String(value) : '--';
}
async function fetchData() {
    loading.value = true;
    errorMsg.value = '';
    try {
        weatherData.value = await getWeatherData() ?? null;
    }
    catch {
        errorMsg.value = '气象数据加载失败';
    }
    finally {
        loading.value = false;
    }
}
onMounted(() => {
    activate();
    void fetchData();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['weather-widget__plan']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "weather-widget" },
    'aria-labelledby': (__VLS_ctx.widgetId + '-title'),
    'aria-busy': (__VLS_ctx.loading),
});
/** @type {__VLS_StyleScopedClasses['weather-widget']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "weather-widget__header" },
});
/** @type {__VLS_StyleScopedClasses['weather-widget__header']} */ ;
const __VLS_0 = PanelHeading || PanelHeading;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    id: (__VLS_ctx.widgetId + '-title'),
}));
const __VLS_2 = __VLS_1({
    id: (__VLS_ctx.widgetId + '-title'),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
// @ts-ignore
[widgetId, widgetId, loading,];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "weather-widget__caption" },
});
/** @type {__VLS_StyleScopedClasses['weather-widget__caption']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "weather-widget__body" },
});
/** @type {__VLS_StyleScopedClasses['weather-widget__body']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__state" },
        role: "status",
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__state']} */ ;
}
else if (__VLS_ctx.errorMsg) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__state weather-widget__state--error" },
        role: "alert",
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__state']} */ ;
    /** @type {__VLS_StyleScopedClasses['weather-widget__state--error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.errorMsg);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.fetchData) },
        ...{ class: "weather-widget__retry" },
        type: "button",
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__retry']} */ ;
}
else if (!__VLS_ctx.weatherData) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__state" },
        role: "status",
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__state']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__content" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__overview" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__overview']} */ ;
    const __VLS_6 = WeatherIllustration;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        condition: (__VLS_ctx.displayedCondition),
        active: (__VLS_ctx.active),
    }));
    const __VLS_8 = __VLS_7({
        condition: (__VLS_ctx.displayedCondition),
        active: (__VLS_ctx.active),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__headline" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__headline']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "weather-widget__condition" },
        'aria-live': "polite",
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__condition']} */ ;
    (__VLS_ctx.displayedCondition);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__temperature" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__temperature']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.formatNumber(__VLS_ctx.weatherData.temperature, 1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "weather-widget__headline-label" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__headline-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dl, __VLS_intrinsics.dl)({
        ...{ class: "weather-widget__grid" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__metric" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__metric']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 32 32",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M16 3C12 9 6 15 6 21a10 10 0 0 0 20 0c0-6-6-12-10-18Z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M11 22c0 4 4 6 7 4",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    (__VLS_ctx.formatNumber(__VLS_ctx.weatherData.humidity));
    __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__metric" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__metric']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 32 32",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M8 23a6 6 0 0 1-1-12 8 8 0 0 1 16-2 7 7 0 0 1 1 14ZM9 27l-1 2m8-2-1 2m8-2-1 2",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    (__VLS_ctx.formatNumber(__VLS_ctx.weatherData.rainfall, 1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__metric" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__metric']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 32 32",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M3 11h15a4 4 0 1 0-4-5M2 17h24a4 4 0 1 0-3-7M4 23h15a4 4 0 1 1-3 7",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    (__VLS_ctx.formatNumber(__VLS_ctx.weatherData.windSpeed, 1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__metric weather-widget__metric--wide" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__metric']} */ ;
    /** @type {__VLS_StyleScopedClasses['weather-widget__metric--wide']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 32 32",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "16",
        cy: "16",
        r: "14",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "m21 9-3 11-9 4 4-11Z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    (__VLS_ctx.weatherData.windDirection || '--');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__metric weather-widget__metric--wide" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__metric']} */ ;
    /** @type {__VLS_StyleScopedClasses['weather-widget__metric--wide']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 32 32",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M6 27a14 14 0 1 1 20 0M16 5v2M8 8l2 2M4 16h2M24 8l-2 2M26 16h2M7 23l2-1M25 23l-2-1M18 17l5-6",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "16",
        cy: "20",
        r: "3",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    (__VLS_ctx.formatNumber(__VLS_ctx.weatherData.pressure));
    __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__advice" },
        ...{ class: ('weather-widget__advice--' + __VLS_ctx.adviceState.tone) },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__advice']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__advice-label" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__advice-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 40 40",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "20",
        cy: "20",
        r: "18",
    });
    if (__VLS_ctx.adviceState.tone === 'success') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "m11 20 6 6 13-13",
        });
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M20 10v12m0 6v1",
        });
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__advice-detail" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__advice-detail']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "weather-widget__advice-status" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__advice-status']} */ ;
    (__VLS_ctx.adviceState.label);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (__VLS_ctx.weatherData.suggestion || '暂无作业建议');
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "weather-widget__plans" },
        'aria-labelledby': (__VLS_ctx.widgetId + '-plans'),
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__plans']} */ ;
    const __VLS_11 = PanelHeading || PanelHeading;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        as: "h4",
        id: (__VLS_ctx.widgetId + '-plans'),
        ...{ class: "weather-widget__plans-title" },
    }));
    const __VLS_13 = __VLS_12({
        as: "h4",
        id: (__VLS_ctx.widgetId + '-plans'),
        ...{ class: "weather-widget__plans-title" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    /** @type {__VLS_StyleScopedClasses['weather-widget__plans-title']} */ ;
    const { default: __VLS_16 } = __VLS_14.slots;
    // @ts-ignore
    [widgetId, widgetId, loading, errorMsg, errorMsg, fetchData, weatherData, weatherData, weatherData, weatherData, weatherData, weatherData, weatherData, weatherData, displayedCondition, displayedCondition, active, formatNumber, formatNumber, formatNumber, formatNumber, formatNumber, adviceState, adviceState, adviceState,];
    var __VLS_14;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dl, __VLS_intrinsics.dl)({
        ...{ class: "weather-widget__plan-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__plan-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__plan" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__plan']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.formatCount(__VLS_ctx.weatherData.plannedInspections?.total));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-widget__plan" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-widget__plan']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.formatCount(__VLS_ctx.weatherData.plannedInspections?.today));
}
// @ts-ignore
[weatherData, weatherData, formatCount, formatCount,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
