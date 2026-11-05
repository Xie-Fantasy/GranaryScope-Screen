/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
defineOptions({ name: 'FlipNumber' });
const props = withDefaults(defineProps(), {
    tone: 'primary',
    variant: 'standard',
});
const currentValue = computed(() => String(props.value));
const previousValue = ref(currentValue.value);
const isFlipping = ref(false);
let animationTimer = null;
function clearAnimationTimer() {
    if (animationTimer !== null) {
        window.clearTimeout(animationTimer);
        animationTimer = null;
    }
}
function playFlip(previous) {
    previousValue.value = previous;
    isFlipping.value = false;
    clearAnimationTimer();
    requestAnimationFrame(() => {
        isFlipping.value = true;
        animationTimer = window.setTimeout(() => {
            isFlipping.value = false;
            animationTimer = null;
        }, 480);
    });
}
function previousDigitAt(index, digit) {
    const offset = currentValue.value.length - previousValue.value.length;
    return previousValue.value[index - offset] ?? digit;
}
function isDigit(value) {
    return /^\d$/.test(value);
}
function isDecimalSeparator(value) {
    return value === '.';
}
watch(currentValue, (_next, previous) => {
    playFlip(previous);
});
onMounted(() => {
    playFlip('0'.repeat(currentValue.value.length));
});
onBeforeUnmount(clearAnimationTimer);
const __VLS_defaults = {
    tone: 'primary',
    variant: 'standard',
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
/** @type {__VLS_StyleScopedClasses['flip-number__current']} */ ;
/** @type {__VLS_StyleScopedClasses['flip-number__previous']} */ ;
/** @type {__VLS_StyleScopedClasses['flip-number__previous']} */ ;
/** @type {__VLS_StyleScopedClasses['flip-number--neon']} */ ;
/** @type {__VLS_StyleScopedClasses['flip-number__digit']} */ ;
/** @type {__VLS_StyleScopedClasses['flip-number--neon']} */ ;
/** @type {__VLS_StyleScopedClasses['flip-number__current']} */ ;
/** @type {__VLS_StyleScopedClasses['flip-number--neon']} */ ;
/** @type {__VLS_StyleScopedClasses['flip-number__previous']} */ ;
/** @type {__VLS_StyleScopedClasses['flip-number__separator--decimal']} */ ;
/** @type {__VLS_StyleScopedClasses['flip-number__digit--flipping']} */ ;
/** @type {__VLS_StyleScopedClasses['flip-number__digit--changed']} */ ;
/** @type {__VLS_StyleScopedClasses['flip-number__previous']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "flip-number" },
    ...{ class: ([`flip-number--${__VLS_ctx.tone}`, `flip-number--${__VLS_ctx.variant}`]) },
    'aria-label': (__VLS_ctx.currentValue),
});
/** @type {__VLS_StyleScopedClasses['flip-number']} */ ;
for (const [digit, index] of __VLS_vFor((__VLS_ctx.currentValue))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.template)({
        key: (`${index}-${digit}`),
    });
    if (__VLS_ctx.isDigit(digit)) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flip-number__digit" },
            ...{ class: ({
                    'flip-number__digit--flipping': __VLS_ctx.isFlipping,
                    'flip-number__digit--changed': digit !== __VLS_ctx.previousDigitAt(index, digit),
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['flip-number__digit']} */ ;
        /** @type {__VLS_StyleScopedClasses['flip-number__digit--flipping']} */ ;
        /** @type {__VLS_StyleScopedClasses['flip-number__digit--changed']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flip-number__previous" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['flip-number__previous']} */ ;
        (__VLS_ctx.previousDigitAt(index, digit));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flip-number__current" },
        });
        /** @type {__VLS_StyleScopedClasses['flip-number__current']} */ ;
        (digit);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flip-number__separator" },
            ...{ class: ({
                    'flip-number__separator--decimal': __VLS_ctx.isDecimalSeparator(digit),
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['flip-number__separator']} */ ;
        /** @type {__VLS_StyleScopedClasses['flip-number__separator--decimal']} */ ;
        (digit);
    }
    // @ts-ignore
    [tone, variant, currentValue, currentValue, isDigit, isFlipping, previousDigitAt, previousDigitAt, isDecimalSeparator,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
export default {};
