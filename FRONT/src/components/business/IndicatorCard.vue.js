/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import PanelHeading from '@/components/common/PanelHeading.vue';
import { onMounted, ref } from 'vue';
import { getMonitorIndicator } from '@/api/modules/warehouse';
import FlipNumber from '@/components/common/FlipNumber.vue';
defineOptions({ name: 'IndicatorCard' });
const indicatorData = ref(null);
const loading = ref(true);
const errorMsg = ref('');
async function fetchData() {
    loading.value = true;
    errorMsg.value = '';
    try {
        const data = await getMonitorIndicator();
        indicatorData.value = data ?? null;
    }
    catch {
        errorMsg.value = '指标数据加载失败';
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
/** @type {__VLS_StyleScopedClasses['indicator-card__caption']} */ ;
/** @type {__VLS_StyleScopedClasses['indicator-card__meta']} */ ;
/** @type {__VLS_StyleScopedClasses['indicator-card__value']} */ ;
/** @type {__VLS_StyleScopedClasses['indicator-card__value']} */ ;
/** @type {__VLS_StyleScopedClasses['indicator-card__value']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "indicator-card" },
    'aria-labelledby': "indicator-card-title",
    'aria-busy': (__VLS_ctx.loading),
});
/** @type {__VLS_StyleScopedClasses['indicator-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "indicator-card__header" },
});
/** @type {__VLS_StyleScopedClasses['indicator-card__header']} */ ;
const __VLS_0 = PanelHeading || PanelHeading;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    id: "indicator-card-title",
}));
const __VLS_2 = __VLS_1({
    id: "indicator-card-title",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
// @ts-ignore
[loading,];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "indicator-card__caption" },
});
/** @type {__VLS_StyleScopedClasses['indicator-card__caption']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "indicator-card__body" },
});
/** @type {__VLS_StyleScopedClasses['indicator-card__body']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "indicator-card__state" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "indicator-card__state-mark" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__state-mark']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.errorMsg) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "indicator-card__state indicator-card__state--error" },
        role: "alert",
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__state']} */ ;
    /** @type {__VLS_StyleScopedClasses['indicator-card__state--error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.errorMsg);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.fetchData) },
        ...{ class: "indicator-card__retry" },
        type: "button",
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__retry']} */ ;
}
else if (!__VLS_ctx.indicatorData) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "indicator-card__state" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__state']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.dl, __VLS_intrinsics.dl)({
        ...{ class: "indicator-card__grid" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "indicator-card__metric indicator-card__metric--warning" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__metric']} */ ;
    /** @type {__VLS_StyleScopedClasses['indicator-card__metric--warning']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({
        ...{ class: "indicator-card__label" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({
        ...{ class: "indicator-card__value" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__value']} */ ;
    const __VLS_6 = FlipNumber;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        value: (__VLS_ctx.indicatorData.maxWarehouseTemp.value.toFixed(1)),
        variant: "neon",
    }));
    const __VLS_8 = __VLS_7({
        value: (__VLS_ctx.indicatorData.maxWarehouseTemp.value.toFixed(1)),
        variant: "neon",
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "indicator-card__unit" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__unit']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "indicator-card__meta" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__meta']} */ ;
    (__VLS_ctx.indicatorData.maxWarehouseTemp.warehouseId);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "indicator-card__metric indicator-card__metric--danger" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__metric']} */ ;
    /** @type {__VLS_StyleScopedClasses['indicator-card__metric--danger']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({
        ...{ class: "indicator-card__label" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({
        ...{ class: "indicator-card__value" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__value']} */ ;
    const __VLS_11 = FlipNumber;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        value: (__VLS_ctx.indicatorData.maxGrainTemp.value.toFixed(1)),
        variant: "neon",
    }));
    const __VLS_13 = __VLS_12({
        value: (__VLS_ctx.indicatorData.maxGrainTemp.value.toFixed(1)),
        variant: "neon",
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "indicator-card__unit" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__unit']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "indicator-card__meta" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__meta']} */ ;
    (__VLS_ctx.indicatorData.maxGrainTemp.warehouseId);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "indicator-card__metric indicator-card__metric--info" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__metric']} */ ;
    /** @type {__VLS_StyleScopedClasses['indicator-card__metric--info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({
        ...{ class: "indicator-card__label" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({
        ...{ class: "indicator-card__value" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__value']} */ ;
    const __VLS_16 = FlipNumber;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        value: (__VLS_ctx.indicatorData.totalPoints.toLocaleString()),
        variant: "neon",
    }));
    const __VLS_18 = __VLS_17({
        value: (__VLS_ctx.indicatorData.totalPoints.toLocaleString()),
        variant: "neon",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "indicator-card__meta" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__meta']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "indicator-card__metric indicator-card__metric--danger" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__metric']} */ ;
    /** @type {__VLS_StyleScopedClasses['indicator-card__metric--danger']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({
        ...{ class: "indicator-card__label" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({
        ...{ class: "indicator-card__value" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__value']} */ ;
    const __VLS_21 = FlipNumber;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        value: (__VLS_ctx.indicatorData.alarmPoints3Days.toLocaleString()),
        variant: "neon",
    }));
    const __VLS_23 = __VLS_22({
        value: (__VLS_ctx.indicatorData.alarmPoints3Days.toLocaleString()),
        variant: "neon",
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "indicator-card__meta" },
    });
    /** @type {__VLS_StyleScopedClasses['indicator-card__meta']} */ ;
}
// @ts-ignore
[loading, errorMsg, errorMsg, fetchData, indicatorData, indicatorData, indicatorData, indicatorData, indicatorData, indicatorData, indicatorData,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
