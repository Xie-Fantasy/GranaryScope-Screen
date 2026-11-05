/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/store/modules/theme';
defineOptions({ name: 'SettingsDialog' });
const props = defineProps();
const emit = defineEmits();
const themeStore = useThemeStore();
const { theme, bgEnabled, bgMaskOpacity } = storeToRefs(themeStore);
function close() {
    emit('update:visible', false);
}
function setTheme(nextTheme) {
    themeStore.setTheme(nextTheme);
}
function toggleBg() {
    themeStore.setBgEnabled(!bgEnabled.value);
}
function onMaskChange(event) {
    const target = event.target;
    themeStore.setBgMaskOpacity(parseInt(target.value, 10));
}
/** 点击遮罩层关闭 */
function onOverlayClick(event) {
    if (event.target.classList.contains('settings-dialog__overlay')) {
        close();
    }
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['dialog-fade-enter-active']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-dialog__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-fade-leave-active']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-dialog__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-fade-enter-from']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-dialog__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-fade-leave-to']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-dialog__panel']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    to: "body",
}));
const __VLS_2 = __VLS_1({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    name: "dialog-fade",
}));
const __VLS_8 = __VLS_7({
    name: "dialog-fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
if (__VLS_ctx.visible) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.onOverlayClick) },
        ...{ class: "settings-dialog__overlay" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__overlay']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-dialog__panel" },
        role: "dialog",
        'aria-modal': "true",
        'aria-label': "系统设置",
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__panel']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-dialog__header" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "settings-dialog__title" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.close) },
        type: "button",
        ...{ class: "settings-dialog__close" },
        'aria-label': "关闭设置",
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M18 6 6 18M6 6l12 12",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-dialog__body" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-dialog__item" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "settings-dialog__label" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-dialog__theme-switch" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__theme-switch']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.visible))
                    throw 0;
                return (__VLS_ctx.setTheme('blue'));
                // @ts-ignore
                [visible, onOverlayClick, close, setTheme,];
            } },
        type: "button",
        ...{ class: "settings-dialog__theme-btn" },
        ...{ class: ({ 'settings-dialog__theme-btn--active': __VLS_ctx.theme === 'blue' }) },
        'aria-label': "蓝色主题",
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__theme-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['settings-dialog__theme-btn--active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "settings-dialog__theme-dot settings-dialog__theme-dot--blue" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__theme-dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['settings-dialog__theme-dot--blue']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.visible))
                    throw 0;
                return (__VLS_ctx.setTheme('green'));
                // @ts-ignore
                [setTheme, theme,];
            } },
        type: "button",
        ...{ class: "settings-dialog__theme-btn" },
        ...{ class: ({ 'settings-dialog__theme-btn--active': __VLS_ctx.theme === 'green' }) },
        'aria-label': "绿色主题",
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__theme-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['settings-dialog__theme-btn--active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "settings-dialog__theme-dot settings-dialog__theme-dot--green" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__theme-dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['settings-dialog__theme-dot--green']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-dialog__item" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "settings-dialog__label" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.toggleBg) },
        type: "button",
        ...{ class: "settings-dialog__toggle" },
        ...{ class: ({ 'settings-dialog__toggle--on': __VLS_ctx.bgEnabled }) },
        role: "switch",
        'aria-checked': (__VLS_ctx.bgEnabled),
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['settings-dialog__toggle--on']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "settings-dialog__toggle-thumb" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__toggle-thumb']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-dialog__item" },
        ...{ class: ({ 'settings-dialog__item--disabled': !__VLS_ctx.bgEnabled }) },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__item']} */ ;
    /** @type {__VLS_StyleScopedClasses['settings-dialog__item--disabled']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "settings-dialog__label" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({
        ...{ class: "settings-dialog__hint" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__hint']} */ ;
    (__VLS_ctx.bgMaskOpacity);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-dialog__slider-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__slider-wrapper']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ class: "settings-dialog__slider-icon" },
        viewBox: "0 0 24 24",
        fill: "none",
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__slider-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "12",
        cy: "12",
        r: "5",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onInput: (__VLS_ctx.onMaskChange) },
        type: "range",
        ...{ class: "settings-dialog__slider" },
        min: "0",
        max: "20",
        step: "1",
        value: (__VLS_ctx.bgMaskOpacity),
        disabled: (!__VLS_ctx.bgEnabled),
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__slider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ class: "settings-dialog__slider-icon settings-dialog__slider-icon--dim" },
        viewBox: "0 0 24 24",
        fill: "none",
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['settings-dialog__slider-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['settings-dialog__slider-icon--dim']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
    });
}
// @ts-ignore
[theme, toggleBg, bgEnabled, bgEnabled, bgEnabled, bgEnabled, bgMaskOpacity, bgMaskOpacity, onMaskChange,];
var __VLS_9;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
