/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
// Shared, low-chrome KPI primitive used by both storage views.
defineOptions({ name: 'KpiStrip' });
const __VLS_props = withDefaults(defineProps(), {
    items: () => [],
});
const __VLS_defaults = {
    items: () => [],
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['kpi-strip__item']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi-strip__label']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi-strip__value']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi-strip__value']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi-strip__value']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi-strip__value']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi-strip__value']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi-strip__value']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "kpi-strip" },
    ...{ style: ({ '--kpi-count': __VLS_ctx.items.length }) },
    'aria-label': "关键指标",
});
/** @type {__VLS_StyleScopedClasses['kpi-strip']} */ ;
for (const [item, index] of __VLS_vFor((__VLS_ctx.items))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (`${item.label}-${index}`),
        ...{ class: "kpi-strip__item" },
        ...{ class: (`kpi-strip__item--${item.tone ?? 'neutral'}`) },
    });
    /** @type {__VLS_StyleScopedClasses['kpi-strip__item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "kpi-strip__value-row" },
    });
    /** @type {__VLS_StyleScopedClasses['kpi-strip__value-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "kpi-strip__value" },
    });
    /** @type {__VLS_StyleScopedClasses['kpi-strip__value']} */ ;
    (item.value);
    if (item.unit) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "kpi-strip__unit" },
        });
        /** @type {__VLS_StyleScopedClasses['kpi-strip__unit']} */ ;
        (item.unit);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "kpi-strip__label" },
    });
    /** @type {__VLS_StyleScopedClasses['kpi-strip__label']} */ ;
    (item.label);
    // @ts-ignore
    [items, items,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
export default {};
