/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { onMounted, ref } from 'vue';
import { getThreeDayAlarm, getTodayAlarm, getTwoDayAlarm } from '@/api/modules/alarm';
defineOptions({ name: 'AlarmCard' });
const cardConfigs = [
    { days: 1, title: '当日报警', tone: 'warning', emptyText: '今日暂无报警' },
    { days: 2, title: '持续 2 日', tone: 'danger', emptyText: '暂无持续报警' },
    { days: 3, title: '持续 3 日', tone: 'danger-strong', emptyText: '暂无持续报警' },
];
const alarmDataMap = ref({ 1: null, 2: null, 3: null });
const loading = ref(true);
const errorMsg = ref('');
const apiMap = {
    1: getTodayAlarm,
    2: getTwoDayAlarm,
    3: getThreeDayAlarm,
};
async function fetchData() {
    loading.value = true;
    errorMsg.value = '';
    try {
        const [today, twoDay, threeDay] = await Promise.all([apiMap[1](), apiMap[2](), apiMap[3]()]);
        alarmDataMap.value[1] = today;
        alarmDataMap.value[2] = twoDay;
        alarmDataMap.value[3] = threeDay;
    }
    catch {
        errorMsg.value = '报警数据加载失败';
    }
    finally {
        loading.value = false;
    }
}
onMounted(() => {
    fetchData();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "alarm-card" },
    'aria-label': "报警监控",
    'aria-busy': (__VLS_ctx.loading),
});
/** @type {__VLS_StyleScopedClasses['alarm-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "alarm-card__body" },
});
/** @type {__VLS_StyleScopedClasses['alarm-card__body']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alarm-card__state" },
    });
    /** @type {__VLS_StyleScopedClasses['alarm-card__state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "alarm-card__state-mark" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['alarm-card__state-mark']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.errorMsg) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alarm-card__state alarm-card__state--error" },
        role: "alert",
    });
    /** @type {__VLS_StyleScopedClasses['alarm-card__state']} */ ;
    /** @type {__VLS_StyleScopedClasses['alarm-card__state--error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.errorMsg);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.fetchData) },
        ...{ class: "alarm-card__retry" },
        type: "button",
    });
    /** @type {__VLS_StyleScopedClasses['alarm-card__retry']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alarm-card__list" },
    });
    /** @type {__VLS_StyleScopedClasses['alarm-card__list']} */ ;
    for (const [config] of __VLS_vFor((__VLS_ctx.cardConfigs))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            key: (config.days),
            ...{ class: "alarm-card__group" },
            ...{ class: (`alarm-card__group--${config.tone}`) },
        });
        /** @type {__VLS_StyleScopedClasses['alarm-card__group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "alarm-card__group-header" },
        });
        /** @type {__VLS_StyleScopedClasses['alarm-card__group-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
            ...{ class: "alarm-card__group-title" },
        });
        /** @type {__VLS_StyleScopedClasses['alarm-card__group-title']} */ ;
        (config.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "alarm-card__count" },
        });
        /** @type {__VLS_StyleScopedClasses['alarm-card__count']} */ ;
        (__VLS_ctx.alarmDataMap[config.days]?.total ?? 0);
        __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "alarm-card__warehouse-list" },
        });
        /** @type {__VLS_StyleScopedClasses['alarm-card__warehouse-list']} */ ;
        if (__VLS_ctx.alarmDataMap[config.days]?.list.length) {
            for (const [item] of __VLS_vFor((__VLS_ctx.alarmDataMap[config.days].list))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    key: (item.warehouseId),
                    ...{ class: "alarm-card__warehouse" },
                });
                /** @type {__VLS_StyleScopedClasses['alarm-card__warehouse']} */ ;
                (item.warehouseId);
                // @ts-ignore
                [loading, loading, errorMsg, errorMsg, fetchData, cardConfigs, alarmDataMap, alarmDataMap, alarmDataMap,];
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "alarm-card__empty" },
            });
            /** @type {__VLS_StyleScopedClasses['alarm-card__empty']} */ ;
            (config.emptyText);
        }
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
