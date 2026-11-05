/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, toRef, watch } from 'vue';
import { getEnergyRankData } from '@/api/modules/chart';
defineOptions({ name: 'EnergyRank' });
const props = withDefaults(defineProps(), {
    active: false,
});
const isActive = toRef(props, 'active');
const rankList = ref([]);
const loading = ref(true);
const errorMsg = ref('');
const carouselIndex = ref(0);
const carouselTransitionEnabled = ref(true);
const carouselPaused = ref(false);
const carouselVisibleRows = 5;
const carouselInterval = 2200;
let carouselTimer = null;
const maxEnergy = computed(() => {
    if (rankList.value.length === 0)
        return 1;
    return Math.max(...rankList.value.map((item) => item.energy));
});
const carouselItems = computed(() => (rankList.value.length ? [...rankList.value, ...rankList.value] : []));
const carouselTransform = computed(() => `translateY(-${carouselIndex.value * 36}px)`);
function stopCarousel() {
    if (carouselTimer !== null) {
        clearInterval(carouselTimer);
        carouselTimer = null;
    }
}
function advanceCarousel() {
    if (rankList.value.length <= carouselVisibleRows)
        return;
    carouselTransitionEnabled.value = true;
    carouselIndex.value += 1;
}
function startCarousel() {
    stopCarousel();
    if (!isActive.value || carouselPaused.value || rankList.value.length <= carouselVisibleRows)
        return;
    carouselTimer = setInterval(advanceCarousel, carouselInterval);
}
function resetCarouselAfterLoop() {
    if (carouselIndex.value !== rankList.value.length)
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
        const data = await getEnergyRankData();
        if (data && Array.isArray(data)) {
            const sorted = [...data].sort((a, b) => b.energy - a.energy);
            rankList.value = sorted.map((item, index) => ({ ...item, rank: index + 1 }));
            carouselIndex.value = 0;
            carouselTransitionEnabled.value = false;
            await nextTick();
            carouselTransitionEnabled.value = true;
            startCarousel();
        }
        else {
            rankList.value = [];
        }
    }
    catch {
        errorMsg.value = '数据加载失败';
        rankList.value = [];
    }
    finally {
        loading.value = false;
    }
}
function getBarWidth(energy) {
    if (maxEnergy.value === 0)
        return 0;
    return Math.round((energy / maxEnergy.value) * 100);
}
function getRankColor(rank) {
    if (rank === 1)
        return 'gold';
    if (rank === 2)
        return 'silver';
    if (rank === 3)
        return 'bronze';
    return 'normal';
}
watch(isActive, (active) => {
    if (active)
        startCarousel();
    else
        stopCarousel();
});
onMounted(fetchData);
onActivated(startCarousel);
onDeactivated(stopCarousel);
onBeforeUnmount(stopCarousel);
const __VLS_defaults = {
    active: false,
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
/** @type {__VLS_StyleScopedClasses['energy-rank__header']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-rank__col--bar']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-rank__item']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-rank__rank']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-rank__id']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-rank__bar-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-rank__value']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "energy-rank" },
    'aria-label': "能耗排行榜",
});
/** @type {__VLS_StyleScopedClasses['energy-rank']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "energy-rank__header" },
    role: "row",
});
/** @type {__VLS_StyleScopedClasses['energy-rank__header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "energy-rank__col energy-rank__col--rank" },
});
/** @type {__VLS_StyleScopedClasses['energy-rank__col']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-rank__col--rank']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "energy-rank__col energy-rank__col--id" },
});
/** @type {__VLS_StyleScopedClasses['energy-rank__col']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-rank__col--id']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "energy-rank__col energy-rank__col--bar" },
});
/** @type {__VLS_StyleScopedClasses['energy-rank__col']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-rank__col--bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "energy-rank__col energy-rank__col--value" },
});
/** @type {__VLS_StyleScopedClasses['energy-rank__col']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-rank__col--value']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "energy-rank__body" },
});
/** @type {__VLS_StyleScopedClasses['energy-rank__body']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "energy-rank__state" },
        'aria-live': "polite",
    });
    /** @type {__VLS_StyleScopedClasses['energy-rank__state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "energy-rank__spinner" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['energy-rank__spinner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.errorMsg) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "energy-rank__state energy-rank__state--error" },
        role: "alert",
    });
    /** @type {__VLS_StyleScopedClasses['energy-rank__state']} */ ;
    /** @type {__VLS_StyleScopedClasses['energy-rank__state--error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.errorMsg);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.fetchData) },
        ...{ class: "energy-rank__retry" },
        type: "button",
    });
    /** @type {__VLS_StyleScopedClasses['energy-rank__retry']} */ ;
}
else if (__VLS_ctx.rankList.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onMouseenter: (__VLS_ctx.pauseCarousel) },
        ...{ onMouseleave: (__VLS_ctx.resumeCarousel) },
        ...{ class: "energy-rank__list" },
    });
    /** @type {__VLS_StyleScopedClasses['energy-rank__list']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onTransitionend: (__VLS_ctx.resetCarouselAfterLoop) },
        ...{ class: "energy-rank__list-track" },
        ...{ class: ({ 'energy-rank__list-track--animated': __VLS_ctx.carouselTransitionEnabled }) },
        ...{ style: ({ transform: __VLS_ctx.carouselTransform }) },
    });
    /** @type {__VLS_StyleScopedClasses['energy-rank__list-track']} */ ;
    /** @type {__VLS_StyleScopedClasses['energy-rank__list-track--animated']} */ ;
    for (const [item, index] of __VLS_vFor((__VLS_ctx.carouselItems))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (`${item.warehouseId}-${index}`),
            ...{ class: "energy-rank__item" },
            ...{ class: ({ 'energy-rank__item--active': index === __VLS_ctx.carouselIndex }) },
            'aria-current': (index === __VLS_ctx.carouselIndex ? 'true' : undefined),
            role: "row",
        });
        /** @type {__VLS_StyleScopedClasses['energy-rank__item']} */ ;
        /** @type {__VLS_StyleScopedClasses['energy-rank__item--active']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "energy-rank__rank" },
            ...{ class: (`energy-rank__rank--${__VLS_ctx.getRankColor(item.rank)}`) },
        });
        /** @type {__VLS_StyleScopedClasses['energy-rank__rank']} */ ;
        (item.rank);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "energy-rank__id" },
        });
        /** @type {__VLS_StyleScopedClasses['energy-rank__id']} */ ;
        (item.warehouseId);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "energy-rank__bar-wrapper" },
            'aria-label': (`${item.warehouseId} 能耗进度 ${__VLS_ctx.getBarWidth(item.energy)}%`),
        });
        /** @type {__VLS_StyleScopedClasses['energy-rank__bar-wrapper']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "energy-rank__bar" },
            ...{ style: ({ width: `${__VLS_ctx.getBarWidth(item.energy)}%` }) },
        });
        /** @type {__VLS_StyleScopedClasses['energy-rank__bar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "energy-rank__value" },
        });
        /** @type {__VLS_StyleScopedClasses['energy-rank__value']} */ ;
        (item.energy.toFixed(1));
        // @ts-ignore
        [loading, errorMsg, errorMsg, fetchData, rankList, pauseCarousel, resumeCarousel, resetCarouselAfterLoop, carouselTransitionEnabled, carouselTransform, carouselItems, carouselIndex, carouselIndex, getRankColor, getBarWidth, getBarWidth,];
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "energy-rank__state" },
    });
    /** @type {__VLS_StyleScopedClasses['energy-rank__state']} */ ;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
export default {};
