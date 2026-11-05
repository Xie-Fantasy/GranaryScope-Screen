/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
// ============================================
// StorageLayout - 仓储父布局
// 结构：顶部 AppHeader + 主内容区（router-view + keep-alive）
// 说明：背景图层已迁移至 App.vue 根层级
// ============================================
import AppHeader from '@/components/common/AppHeader.vue';
defineOptions({ name: 'StorageLayout' });
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "storage-layout" },
});
/** @type {__VLS_StyleScopedClasses['storage-layout']} */ ;
const __VLS_0 = AppHeader;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "storage-layout__main" },
});
/** @type {__VLS_StyleScopedClasses['storage-layout__main']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.routerView | typeof __VLS_components.RouterView | typeof __VLS_components['router-view'] | typeof __VLS_components.routerView | typeof __VLS_components.RouterView | typeof __VLS_components['router-view']} */
routerView;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({}));
const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
{
    const { default: __VLS_10 } = __VLS_8.slots;
    const [{ Component }] = __VLS_vSlot(__VLS_10);
    let __VLS_11;
    /** @ts-ignore @type { | typeof __VLS_components.keepAlive | typeof __VLS_components.KeepAlive | typeof __VLS_components['keep-alive'] | typeof __VLS_components.keepAlive | typeof __VLS_components.KeepAlive | typeof __VLS_components['keep-alive']} */
    keepAlive;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({}));
    const __VLS_13 = __VLS_12({}, ...__VLS_functionalComponentArgsRest(__VLS_12));
    const { default: __VLS_16 } = __VLS_14.slots;
    const __VLS_17 = (Component);
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({}));
    const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
    var __VLS_14;
    __VLS_8.slots['' /* empty slot name completion */];
}
var __VLS_8;
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
