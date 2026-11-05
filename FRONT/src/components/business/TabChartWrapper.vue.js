/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import PanelHeading from '@/components/common/PanelHeading.vue';
import TemperatureChart from '@/components/business/TemperatureChart.vue';
import GasChart from '@/components/business/GasChart.vue';
import EnergyRank from '@/components/business/EnergyRank.vue';
import InsectChart from '@/components/business/InsectChart.vue';
defineOptions({ name: 'TabChartWrapper' });
const activeTab = ref(0);
const tabs = computed(() => [
    { key: 'temperature', label: '温度检测', component: TemperatureChart },
    { key: 'gas', label: '气体检测', component: GasChart },
    { key: 'energy', label: '能耗排行', component: EnergyRank },
    { key: 'insect', label: '虫情检测', component: InsectChart },
]);
function switchTab(index) {
    activeTab.value = index;
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['tab-chart-wrapper__tab']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "tab-chart-wrapper" },
    'aria-label': "粮情检测数据",
});
/** @type {__VLS_StyleScopedClasses['tab-chart-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "tab-chart-wrapper__header" },
});
/** @type {__VLS_StyleScopedClasses['tab-chart-wrapper__header']} */ ;
const __VLS_0 = PanelHeading || PanelHeading;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    as: "div",
    ...{ class: "tab-chart-wrapper__heading" },
}));
const __VLS_2 = __VLS_1({
    as: "div",
    ...{ class: "tab-chart-wrapper__heading" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['tab-chart-wrapper__heading']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tab-chart-wrapper__tabs" },
    role: "tablist",
    'aria-label': "检测类型",
});
/** @type {__VLS_StyleScopedClasses['tab-chart-wrapper__tabs']} */ ;
for (const [tab, index] of __VLS_vFor((__VLS_ctx.tabs))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                return (__VLS_ctx.switchTab(index));
                // @ts-ignore
                [tabs, switchTab,];
            } },
        id: (`warehouse-tab-${tab.key}`),
        key: (tab.key),
        ...{ class: "tab-chart-wrapper__tab" },
        ...{ class: ({ 'is-active': __VLS_ctx.activeTab === index }) },
        'aria-controls': (`warehouse-panel-${tab.key}`),
        'aria-selected': (__VLS_ctx.activeTab === index),
        role: "tab",
        type: "button",
    });
    /** @type {__VLS_StyleScopedClasses['tab-chart-wrapper__tab']} */ ;
    /** @type {__VLS_StyleScopedClasses['is-active']} */ ;
    (tab.label);
    // @ts-ignore
    [activeTab, activeTab,];
}
// @ts-ignore
[];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tab-chart-wrapper__body" },
});
/** @type {__VLS_StyleScopedClasses['tab-chart-wrapper__body']} */ ;
for (const [tab, index] of __VLS_vFor((__VLS_ctx.tabs))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        id: (`warehouse-panel-${tab.key}`),
        key: (tab.key),
        ...{ class: "tab-chart-wrapper__content" },
        'aria-labelledby': (`warehouse-tab-${tab.key}`),
        role: "tabpanel",
    });
    __VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeTab === index), }, null, null);
    /** @type {__VLS_StyleScopedClasses['tab-chart-wrapper__content']} */ ;
    const __VLS_6 = (tab.component);
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        active: (__VLS_ctx.activeTab === index),
    }));
    const __VLS_8 = __VLS_7({
        active: (__VLS_ctx.activeTab === index),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    // @ts-ignore
    [tabs, activeTab, activeTab,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
