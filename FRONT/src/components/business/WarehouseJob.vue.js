/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import PanelHeading from '@/components/common/PanelHeading.vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { getWarehouseJob } from '@/api/modules/warehouse';
import FlipNumber from '@/components/common/FlipNumber.vue';
import { useWarehouseStore } from '@/store/modules/warehouse';
defineOptions({ name: 'WarehouseJob' });
const jobData = ref(null);
const loading = ref(true);
const errorMsg = ref('');
const carouselIndex = ref(0);
const carouselTransitionEnabled = ref(true);
const carouselPaused = ref(false);
const warehouseStore = useWarehouseStore();
const { totalWarehouse } = storeToRefs(warehouseStore);
const carouselVisibleRows = 5;
const carouselInterval = 2200;
let carouselFrame = null;
let carouselLastTick = 0;
const statItems = computed(() => {
    if (!jobData.value)
        return [];
    const stats = jobData.value.stats;
    return [
        { label: '仓房总数', value: totalWarehouse.value, tone: 'primary' },
        { label: '三日内已测温', value: stats.testedIn3Days, tone: 'success' },
        { label: '温湿报警', value: stats.tempAlarm, tone: 'danger' },
        { label: '气体报警', value: stats.gasAlarm, tone: 'neutral' },
        { label: '通风作业', value: stats.ventilation, tone: 'success' },
        { label: '熏蒸作业', value: stats.fumigation, tone: 'warning' },
    ];
});
const jobTypeMap = {
    temperature: '测温',
    ventilation: '通风',
    fumigation: '熏蒸',
};
const statusMap = {
    normal: { label: '正常', tone: 'success' },
    warning: { label: '预警', tone: 'warning' },
    danger: { label: '报警', tone: 'danger' },
};
const carouselItems = computed(() => {
    const list = jobData.value?.list ?? [];
    return list.length ? [...list, ...list] : [];
});
const carouselTransform = computed(() => `translateY(-${carouselIndex.value * 36}px)`);
function stopCarousel() {
    if (carouselFrame !== null) {
        cancelAnimationFrame(carouselFrame);
        carouselFrame = null;
    }
    carouselLastTick = 0;
}
function advanceCarousel() {
    const listLength = jobData.value?.list.length ?? 0;
    if (listLength <= carouselVisibleRows)
        return;
    carouselTransitionEnabled.value = true;
    carouselIndex.value += 1;
}
function runCarousel(timestamp) {
    if (!carouselLastTick)
        carouselLastTick = timestamp;
    if (timestamp - carouselLastTick >= carouselInterval) {
        advanceCarousel();
        carouselLastTick = timestamp;
    }
    carouselFrame = requestAnimationFrame(runCarousel);
}
function startCarousel() {
    stopCarousel();
    if (carouselPaused.value || (jobData.value?.list.length ?? 0) <= carouselVisibleRows)
        return;
    carouselFrame = requestAnimationFrame(runCarousel);
}
function resetCarouselAfterLoop() {
    const listLength = jobData.value?.list.length ?? 0;
    if (carouselIndex.value !== listLength)
        return;
    carouselTransitionEnabled.value = false;
    carouselIndex.value = 0;
}
function pauseCarousel() {
    carouselPaused.value = true;
    stopCarousel();
}
function resumeCarousel() {
    carouselPaused.value = false;
    startCarousel();
}
async function fetchData() {
    stopCarousel();
    loading.value = true;
    errorMsg.value = '';
    try {
        jobData.value = await getWarehouseJob();
        carouselIndex.value = 0;
        carouselTransitionEnabled.value = false;
        await nextTick();
        carouselTransitionEnabled.value = true;
        startCarousel();
    }
    catch {
        stopCarousel();
        errorMsg.value = '数据加载失败';
        jobData.value = null;
    }
    finally {
        loading.value = false;
    }
}
onMounted(() => {
    void fetchData();
});
onBeforeUnmount(stopCarousel);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['warehouse-job__stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['warehouse-job__list-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['warehouse-job__empty-list']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "warehouse-job" },
    'aria-label': "仓房作业总览",
});
/** @type {__VLS_StyleScopedClasses['warehouse-job']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "warehouse-job__header" },
});
/** @type {__VLS_StyleScopedClasses['warehouse-job__header']} */ ;
const __VLS_0 = PanelHeading || PanelHeading;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "warehouse-job__body" },
});
/** @type {__VLS_StyleScopedClasses['warehouse-job__body']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "warehouse-job__state" },
        'aria-live': "polite",
    });
    /** @type {__VLS_StyleScopedClasses['warehouse-job__state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "warehouse-job__spinner" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['warehouse-job__spinner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.errorMsg) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "warehouse-job__state warehouse-job__state--error" },
        role: "alert",
    });
    /** @type {__VLS_StyleScopedClasses['warehouse-job__state']} */ ;
    /** @type {__VLS_StyleScopedClasses['warehouse-job__state--error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.errorMsg);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.fetchData) },
        ...{ class: "warehouse-job__retry" },
        type: "button",
    });
    /** @type {__VLS_StyleScopedClasses['warehouse-job__retry']} */ ;
}
else if (__VLS_ctx.jobData) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "warehouse-job__stats" },
        'aria-label': "作业关键指标",
    });
    /** @type {__VLS_StyleScopedClasses['warehouse-job__stats']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.statItems))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (item.label),
            ...{ class: "warehouse-job__stat" },
        });
        /** @type {__VLS_StyleScopedClasses['warehouse-job__stat']} */ ;
        const __VLS_6 = FlipNumber;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
            ...{ class: "warehouse-job__stat-value" },
            value: (item.value),
            tone: (item.tone),
        }));
        const __VLS_8 = __VLS_7({
            ...{ class: "warehouse-job__stat-value" },
            value: (item.value),
            tone: (item.tone),
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        /** @type {__VLS_StyleScopedClasses['warehouse-job__stat-value']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "warehouse-job__stat-label" },
        });
        /** @type {__VLS_StyleScopedClasses['warehouse-job__stat-label']} */ ;
        (item.label);
        // @ts-ignore
        [loading, errorMsg, errorMsg, fetchData, jobData, statItems,];
    }
    if (__VLS_ctx.jobData.list.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "warehouse-job__list-section" },
            'aria-label': "作业仓房列表",
        });
        /** @type {__VLS_StyleScopedClasses['warehouse-job__list-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "warehouse-job__list-heading" },
        });
        /** @type {__VLS_StyleScopedClasses['warehouse-job__list-heading']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.jobData.list.length);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onMouseenter: (__VLS_ctx.pauseCarousel) },
            ...{ onMouseleave: (__VLS_ctx.resumeCarousel) },
            ...{ class: "warehouse-job__list" },
        });
        /** @type {__VLS_StyleScopedClasses['warehouse-job__list']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onTransitionend: (__VLS_ctx.resetCarouselAfterLoop) },
            ...{ class: "warehouse-job__list-track" },
            ...{ class: ({ 'warehouse-job__list-track--animated': __VLS_ctx.carouselTransitionEnabled }) },
            ...{ style: ({ transform: __VLS_ctx.carouselTransform }) },
        });
        /** @type {__VLS_StyleScopedClasses['warehouse-job__list-track']} */ ;
        /** @type {__VLS_StyleScopedClasses['warehouse-job__list-track--animated']} */ ;
        for (const [item, index] of __VLS_vFor((__VLS_ctx.carouselItems))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (`${item.warehouseId}-${index}`),
                ...{ class: "warehouse-job__list-item" },
                ...{ class: ({ 'warehouse-job__list-item--active': index === __VLS_ctx.carouselIndex }) },
                'aria-current': (index === __VLS_ctx.carouselIndex ? 'true' : undefined),
            });
            /** @type {__VLS_StyleScopedClasses['warehouse-job__list-item']} */ ;
            /** @type {__VLS_StyleScopedClasses['warehouse-job__list-item--active']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "warehouse-job__warehouse-id" },
            });
            /** @type {__VLS_StyleScopedClasses['warehouse-job__warehouse-id']} */ ;
            (item.warehouseId);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "warehouse-job__job-tags" },
            });
            /** @type {__VLS_StyleScopedClasses['warehouse-job__job-tags']} */ ;
            for (const [job] of __VLS_vFor((item.jobs))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    key: (job),
                    ...{ class: "warehouse-job__job-tag" },
                    ...{ class: (`warehouse-job__job-tag--${job}`) },
                });
                /** @type {__VLS_StyleScopedClasses['warehouse-job__job-tag']} */ ;
                (__VLS_ctx.jobTypeMap[job]);
                // @ts-ignore
                [jobData, jobData, pauseCarousel, resumeCarousel, resetCarouselAfterLoop, carouselTransitionEnabled, carouselTransform, carouselItems, carouselIndex, carouselIndex, jobTypeMap,];
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "warehouse-job__status" },
                ...{ class: (`warehouse-job__status--${__VLS_ctx.statusMap[item.status].tone}`) },
            });
            /** @type {__VLS_StyleScopedClasses['warehouse-job__status']} */ ;
            (__VLS_ctx.statusMap[item.status].label);
            // @ts-ignore
            [statusMap, statusMap,];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "warehouse-job__empty-list" },
        });
        /** @type {__VLS_StyleScopedClasses['warehouse-job__empty-list']} */ ;
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "warehouse-job__state" },
    });
    /** @type {__VLS_StyleScopedClasses['warehouse-job__state']} */ ;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
