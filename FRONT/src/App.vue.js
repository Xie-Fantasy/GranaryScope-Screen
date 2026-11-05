/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
// ============================================
// App 根组件 - 大屏适配层
// 基于 1920x1080 设计稿进行 transform: scale 缩放
// 包含：全局背景图层 + 高斯模糊蒙版（由 theme store 控制）
// ============================================
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import AlertWarningDialog from '@/components/common/AlertWarningDialog.vue';
import { useThemeStore } from '@/store/modules/theme';
import { useVideoMonitorStore } from '@/store/modules/video-monitor';
import { ALERT_WARNING_DEFINITIONS } from '@/types/alert-warning';
// 设计稿基准尺寸
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
// 缩放比例
const scale = ref(1);
// 内容区样式（使用 computed 动态计算）
const contentStyle = computed(() => ({
    width: `${DESIGN_WIDTH}px`,
    height: `${DESIGN_HEIGHT}px`,
    transform: `translate(-50%, -50%) scale(${scale.value})`,
}));
// 主题 store
const themeStore = useThemeStore();
const { bgEnabled, bgMaskOpacity, theme } = storeToRefs(themeStore);
const videoMonitorStore = useVideoMonitorStore();
const { captureAlertKey, captureErrorMessage, captureImageUrl, captureStatus, } = storeToRefs(videoMonitorStore);
const router = useRouter();
const activeAlert = ref(null);
const alarmAudio = ref(null);
/** 背景图层样式：铺满视口，不受 scale 缩放影响 */
const bgStyle = computed(() => ({
    backgroundImage: bgEnabled.value
        ? `url(/image/background/${theme.value === 'blue' ? 'blue-Background.png' : 'green_background.png'})`
        : 'none',
}));
/** 蒙版层样式：使用高斯模糊 */
const maskStyle = computed(() => ({
    backdropFilter: bgEnabled.value ? `blur(${bgMaskOpacity.value}px)` : 'none',
    WebkitBackdropFilter: bgEnabled.value ? `blur(${bgMaskOpacity.value}px)` : 'none',
}));
/**
 * 计算缩放比例并应用
 */
const updateScale = () => {
    const clientWidth = window.innerWidth;
    const clientHeight = window.innerHeight;
    const scaleX = clientWidth / DESIGN_WIDTH;
    const scaleY = clientHeight / DESIGN_HEIGHT;
    // 取较小值确保完整显示不溢出
    scale.value = Math.min(scaleX, scaleY);
};
// 缩放防抖定时器
let resizeTimer = null;
/**
 * 窗口尺寸变化处理（防抖）
 */
const handleResize = () => {
    if (resizeTimer)
        clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        updateScale();
    }, 100);
};
function isAlertWarningKey(value) {
    return value === '1' || value === '2' || value === '3' || value === '4' || value === '5';
}
function playAlarmSound() {
    const audio = alarmAudio.value;
    if (!audio)
        return;
    audio.currentTime = 0;
    void audio.play().catch(() => {
        // Browsers may reject playback outside a user gesture; visual warning remains available.
    });
}
function stopAlarmSound() {
    const audio = alarmAudio.value;
    if (!audio)
        return;
    audio.pause();
    audio.currentTime = 0;
}
function openAlert(key) {
    activeAlert.value = ALERT_WARNING_DEFINITIONS[key];
    if (key === 1 || key === 4) {
        videoMonitorStore.requestRobotCapture(key);
    }
    else {
        videoMonitorStore.clearRobotCapture();
    }
    playAlarmSound();
}
function closeAlert() {
    activeAlert.value = null;
    stopAlarmSound();
}
function handleKeydown(event) {
    if (event.key === 'Escape' && activeAlert.value) {
        event.preventDefault();
        closeAlert();
        return;
    }
    if (!isAlertWarningKey(event.key))
        return;
    const target = event.target;
    if (target?.matches('input, textarea, select, [contenteditable="true"]'))
        return;
    event.preventDefault();
    openAlert(Number(event.key));
}
function viewAlertDetail() {
    closeAlert();
    if (router.currentRoute.value.path !== '/storage/monitor') {
        void router.replace('/storage/monitor');
    }
}
onMounted(() => {
    updateScale();
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeydown);
});
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('keydown', handleKeydown);
    stopAlarmSound();
    if (resizeTimer)
        clearTimeout(resizeTimer);
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['app-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "theme-bg" },
    ...{ style: (__VLS_ctx.bgStyle) },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['theme-bg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "theme-mask" },
    ...{ style: (__VLS_ctx.maskStyle) },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['theme-mask']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['app-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-content" },
    ...{ class: (`app-content--${__VLS_ctx.theme}`) },
    ...{ style: (__VLS_ctx.contentStyle) },
});
/** @type {__VLS_StyleScopedClasses['app-content']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.routerView | typeof __VLS_components.RouterView | typeof __VLS_components['router-view']} */
routerView;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.audio, __VLS_intrinsics.audio)({
    ref: "alarmAudio",
    loop: true,
    preload: "auto",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.source)({
    src: "/assets/alarm/警报器.mp3",
    type: "audio/mpeg",
});
const __VLS_5 = AlertWarningDialog;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ 'onClose': {} },
    ...{ 'onView': {} },
    visible: (__VLS_ctx.activeAlert !== null),
    alert: (__VLS_ctx.activeAlert),
    captureStatus: (__VLS_ctx.captureAlertKey === __VLS_ctx.activeAlert?.key ? __VLS_ctx.captureStatus : 'idle'),
    captureImageUrl: (__VLS_ctx.captureAlertKey === __VLS_ctx.activeAlert?.key ? __VLS_ctx.captureImageUrl : null),
    captureErrorMessage: (__VLS_ctx.captureAlertKey === __VLS_ctx.activeAlert?.key ? __VLS_ctx.captureErrorMessage : null),
}));
const __VLS_7 = __VLS_6({
    ...{ 'onClose': {} },
    ...{ 'onView': {} },
    visible: (__VLS_ctx.activeAlert !== null),
    alert: (__VLS_ctx.activeAlert),
    captureStatus: (__VLS_ctx.captureAlertKey === __VLS_ctx.activeAlert?.key ? __VLS_ctx.captureStatus : 'idle'),
    captureImageUrl: (__VLS_ctx.captureAlertKey === __VLS_ctx.activeAlert?.key ? __VLS_ctx.captureImageUrl : null),
    captureErrorMessage: (__VLS_ctx.captureAlertKey === __VLS_ctx.activeAlert?.key ? __VLS_ctx.captureErrorMessage : null),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
let __VLS_10;
const __VLS_11 = {
    /** @type {typeof __VLS_10.close} */
    onClose: (__VLS_ctx.closeAlert),
};
const __VLS_12 = {
    /** @type {typeof __VLS_10.view} */
    onView: (__VLS_ctx.viewAlertDetail),
};
var __VLS_8;
var __VLS_9;
// @ts-ignore
[bgStyle, maskStyle, theme, contentStyle, activeAlert, activeAlert, activeAlert, activeAlert, activeAlert, captureAlertKey, captureAlertKey, captureAlertKey, captureStatus, captureImageUrl, captureErrorMessage, closeAlert, viewAlertDetail,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
