/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import PanelHeading from '@/components/common/PanelHeading.vue';
import { computed, onMounted, ref } from 'vue';
import { getDeviceOverview } from '@/api/modules/device';
defineOptions({ name: 'DeviceOverview' });
const deviceList = ref([]);
const selectedType = ref('all');
const loading = ref(true);
const errorMsg = ref('');
const categoryTags = computed(() => [
    { key: 'all', label: '全部' },
    ...deviceList.value.map((item) => ({
        key: item.deviceType,
        label: item.deviceName,
    })),
]);
const filteredDeviceList = computed(() => {
    if (selectedType.value === 'all')
        return deviceList.value;
    return deviceList.value.filter((item) => item.deviceType === selectedType.value);
});
async function fetchData() {
    loading.value = true;
    errorMsg.value = '';
    try {
        const data = await getDeviceOverview();
        deviceList.value = data?.list?.filter((item) => item.deviceType !== 'all') ?? [];
    }
    catch {
        errorMsg.value = '数据加载失败';
        deviceList.value = [];
    }
    finally {
        loading.value = false;
    }
}
function showAllDevices() {
    selectedType.value = 'all';
}
onMounted(fetchData);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "device-overview" },
    'aria-label': "设备运行总览",
});
/** @type {__VLS_StyleScopedClasses['device-overview']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "device-overview__header" },
});
/** @type {__VLS_StyleScopedClasses['device-overview__header']} */ ;
const __VLS_0 = PanelHeading || PanelHeading;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "device-overview__body" },
});
/** @type {__VLS_StyleScopedClasses['device-overview__body']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "device-overview__state" },
        'aria-live': "polite",
    });
    /** @type {__VLS_StyleScopedClasses['device-overview__state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "device-overview__spinner" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['device-overview__spinner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.errorMsg) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "device-overview__state device-overview__state--error" },
        role: "alert",
    });
    /** @type {__VLS_StyleScopedClasses['device-overview__state']} */ ;
    /** @type {__VLS_StyleScopedClasses['device-overview__state--error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.errorMsg);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.fetchData) },
        ...{ class: "device-overview__retry" },
        type: "button",
    });
    /** @type {__VLS_StyleScopedClasses['device-overview__retry']} */ ;
}
else if (__VLS_ctx.deviceList.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "device-overview__filters" },
        'aria-label': "设备分类筛选",
    });
    /** @type {__VLS_StyleScopedClasses['device-overview__filters']} */ ;
    for (const [tag] of __VLS_vFor((__VLS_ctx.categoryTags))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        throw 0;
                    if (!!(__VLS_ctx.errorMsg))
                        throw 0;
                    if (!(__VLS_ctx.deviceList.length))
                        throw 0;
                    return (__VLS_ctx.selectedType = tag.key);
                    // @ts-ignore
                    [loading, errorMsg, errorMsg, fetchData, deviceList, categoryTags, selectedType,];
                } },
            key: (tag.key),
            ...{ class: "device-overview__filter" },
            ...{ class: ({ 'is-active': __VLS_ctx.selectedType === tag.key }) },
            type: "button",
        });
        /** @type {__VLS_StyleScopedClasses['device-overview__filter']} */ ;
        /** @type {__VLS_StyleScopedClasses['is-active']} */ ;
        (tag.label);
        // @ts-ignore
        [selectedType,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "device-overview__table-wrap" },
    });
    /** @type {__VLS_StyleScopedClasses['device-overview__table-wrap']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
        ...{ class: "device-overview__table" },
    });
    /** @type {__VLS_StyleScopedClasses['device-overview__table']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        scope: "col",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        scope: "col",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        scope: "col",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        scope: "col",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
    for (const [item] of __VLS_vFor((__VLS_ctx.filteredDeviceList))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
            key: (item.deviceType),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
            scope: "row",
        });
        (item.deviceName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        (item.total);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: ({ 'device-overview__number--danger': item.abnormal > 0 }) },
        });
        /** @type {__VLS_StyleScopedClasses['device-overview__number--danger']} */ ;
        (item.abnormal);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: ({ 'device-overview__number--success': item.working > 0 }) },
        });
        /** @type {__VLS_StyleScopedClasses['device-overview__number--success']} */ ;
        (item.working);
        // @ts-ignore
        [filteredDeviceList,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "device-overview__footer" },
    });
    /** @type {__VLS_StyleScopedClasses['device-overview__footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.filteredDeviceList.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.showAllDevices) },
        ...{ class: "device-overview__all" },
        type: "button",
    });
    /** @type {__VLS_StyleScopedClasses['device-overview__all']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "device-overview__state" },
    });
    /** @type {__VLS_StyleScopedClasses['device-overview__state']} */ ;
}
// @ts-ignore
[filteredDeviceList, showAllDevices,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
