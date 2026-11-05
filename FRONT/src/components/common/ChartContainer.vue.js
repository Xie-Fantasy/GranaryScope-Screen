/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { onBeforeUnmount, onMounted, ref } from 'vue';
defineOptions({ name: 'ChartContainer' });
const props = withDefaults(defineProps(), {
    title: '',
    showTitle: true,
    width: '100%',
    height: '100%',
    bordered: true,
    loading: false,
    empty: false,
    emptyText: '暂无数据',
});
const emit = defineEmits();
const containerRef = ref(null);
onMounted(() => {
    if (containerRef.value)
        emit('ready', containerRef);
});
onBeforeUnmount(() => {
    containerRef.value = null;
});
const __VLS_defaults = {
    title: '',
    showTitle: true,
    width: '100%',
    height: '100%',
    bordered: true,
    loading: false,
    empty: false,
    emptyText: '暂无数据',
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
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "chart-container" },
    ...{ class: ({ 'chart-container--bordered': props.bordered }) },
    ...{ style: ({ width: props.width, height: props.height }) },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container--bordered']} */ ;
if (props.showTitle && props.title) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "chart-container__header" },
    });
    /** @type {__VLS_StyleScopedClasses['chart-container__header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "chart-container__title" },
    });
    /** @type {__VLS_StyleScopedClasses['chart-container__title']} */ ;
    (props.title);
    if (__VLS_ctx.$slots.actions) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "chart-container__actions" },
        });
        /** @type {__VLS_StyleScopedClasses['chart-container__actions']} */ ;
        var __VLS_0 = {};
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-container__body" },
});
/** @type {__VLS_StyleScopedClasses['chart-container__body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "containerRef",
    ...{ class: "chart-container__chart" },
});
/** @type {__VLS_StyleScopedClasses['chart-container__chart']} */ ;
if (props.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chart-container__state" },
    });
    /** @type {__VLS_StyleScopedClasses['chart-container__state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "chart-container__spinner" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['chart-container__spinner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (props.empty) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chart-container__state" },
    });
    /** @type {__VLS_StyleScopedClasses['chart-container__state']} */ ;
    var __VLS_2 = {};
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "chart-container__empty-text" },
    });
    /** @type {__VLS_StyleScopedClasses['chart-container__empty-text']} */ ;
    (props.emptyText);
}
// @ts-ignore
var __VLS_1 = __VLS_0, __VLS_3 = __VLS_2;
// @ts-ignore
[$slots,];
const __VLS_base = (await import('vue')).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
const __VLS_export = {};
export default {};
