/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useThemeStore } from '@/store/modules/theme';
import SettingsDialog from '@/components/common/SettingsDialog.vue';
defineOptions({ name: 'AppHeader' });
const route = useRoute();
const router = useRouter();
const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);
const currentTime = ref(formatTime());
const currentDate = ref(formatDate());
const currentWeek = ref(formatWeek());
let timer = null;
const prefersReducedMotion = ref(false);
let motionQuery = null;
/** 设置弹窗显示状态 */
const showSettings = ref(false);
const modules = [
    { key: 'decision', label: '决策', iconPaths: ['M12 3a9 9 0 1 0 9 9', 'M12 3v9l6 3'] },
    { key: 'risk', label: '风险', iconPaths: ['M12 3 4 6v5c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z', 'm13 8-3 5h3l-2 4 4-6h-3l1-3Z'] },
    { key: 'trade', label: '购销', iconPaths: ['M9 5h6', 'M9 3h6v4H9z', 'M7 5H5v16h14V5h-2', 'M8 11h8M8 15h8'] },
    { key: 'warehouse', label: '仓储', active: true, iconPaths: ['M4 21V8l8-5 8 5v13', 'M8 21v-7h8v7', 'M8 10h.01M12 10h.01M16 10h.01'] },
    { key: 'safety', label: '安全', iconPaths: ['M12 3 4 6v5c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z', 'm8.5 12 2.2 2.2 4.8-5'] },
    { key: 'finance', label: '财税', iconPaths: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'm8 7 4 5 4-5M8.5 13h7M12 12v6'] },
    { key: 'business', label: '业务', iconPaths: ['M4 8h16v12H4z', 'M9 8V5h6v3', 'M4 12h16', 'M10 12v2h4v-2'] },
    { key: 'manage', label: '管理系统', href: 'http://127.0.0.1:18081', iconPaths: ['M4 5h16v11H4z', 'M9 20h6M12 16v4', 'M8 9h8M8 12h5'] },
    { key: 'digital-human', label: '数字人', href: 'http://127.0.0.1:8020', iconPaths: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M3 21v-2a6 6 0 0 1 12 0v2', 'm18 5 .7 1.3L20 7l-1.3.7L18 9l-.7-1.3L16 7l1.3-.7L18 5Z'] },
    { key: 'vision-inspection', label: '视觉检测', iconPaths: ['M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'] },
];
const subPages = [
    { name: 'Intelligent', path: '/storage/intelligent' },
    { name: 'Monitor', path: '/storage/monitor' },
];
const pageTitle = computed(() => route.meta.title ?? '粮情检测数据看板');
const currentSubPageIndex = computed(() => subPages.findIndex(page => page.path === route.path));
const nextPageLabel = computed(() => currentSubPageIndex.value === 0 ? '粮情检测看板' : '仓储智能化');
function formatTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}
function formatDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
function formatWeek() {
    return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][new Date().getDay()];
}
function toggleSubPage() {
    const currentIndex = currentSubPageIndex.value >= 0 ? currentSubPageIndex.value : 0;
    const nextIndex = (currentIndex + 1) % subPages.length;
    const nextPath = subPages[nextIndex].path;
    if (nextPath !== route.path) {
        void router.replace(nextPath);
    }
}
function openSettings() {
    showSettings.value = true;
}
function syncMotionPreference(event) {
    prefersReducedMotion.value = event?.matches ?? motionQuery?.matches ?? false;
}
onMounted(() => {
    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    syncMotionPreference();
    motionQuery.addEventListener('change', syncMotionPreference);
    timer = setInterval(() => {
        currentTime.value = formatTime();
        currentDate.value = formatDate();
        currentWeek.value = formatWeek();
    }, 1000);
});
onUnmounted(() => {
    if (timer)
        clearInterval(timer);
    timer = null;
    motionQuery?.removeEventListener('change', syncMotionPreference);
    motionQuery = null;
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['app-header--green']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header--green']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__time-group']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header--green']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__title']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header--green']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__title']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header--green']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__modules--left']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header--green']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__modules--right']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header--green']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__module']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header--green']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header--green']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__module--active']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header--green']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__module']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header--green']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__module']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__module-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header--green']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__module--active']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__module-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header--green']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__module-label']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__module']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__frame-flow']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header--green']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__module--active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "app-header" },
    ...{ class: ({ 'app-header--green': __VLS_ctx.theme === 'green' }) },
});
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header--green']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-header__bg" },
    ...{ class: ({ 'app-header__bg--green': __VLS_ctx.theme === 'green' }) },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['app-header__bg']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__bg--green']} */ ;
if (__VLS_ctx.theme === 'green') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ class: "app-header__frame" },
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1920 90",
        preserveAspectRatio: "none",
        role: "presentation",
    });
    /** @type {__VLS_StyleScopedClasses['app-header__frame']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.defs, __VLS_intrinsics.defs)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.radialGradient, __VLS_intrinsics.radialGradient)({
        id: "app-header-frame-glow",
        cx: "50%",
        cy: "50%",
        r: "50%",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
        offset: "0%",
        'stop-color': "var(--primary)",
        'stop-opacity': "1",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
        offset: "100%",
        'stop-color': "var(--primary)",
        'stop-opacity': "0",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.mask, __VLS_intrinsics.mask)({
        id: "app-header-frame-left-mask",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle, __VLS_intrinsics.circle)({
        r: "92",
        cx: "0",
        cy: "0",
        fill: "url(#app-header-frame-glow)",
    });
    if (!__VLS_ctx.prefersReducedMotion) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.animateMotion)({
            ...{ class: "app-header__frame-motion" },
            begin: "0s",
            dur: "3.2s",
            path: "M0,68 L620,68 L670,90 L960,90",
            rotate: "auto",
            repeatCount: "indefinite",
        });
        /** @type {__VLS_StyleScopedClasses['app-header__frame-motion']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.mask, __VLS_intrinsics.mask)({
        id: "app-header-frame-right-mask",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle, __VLS_intrinsics.circle)({
        r: "92",
        cx: "0",
        cy: "0",
        fill: "url(#app-header-frame-glow)",
    });
    if (!__VLS_ctx.prefersReducedMotion) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.animateMotion)({
            ...{ class: "app-header__frame-motion" },
            begin: "0s",
            dur: "3.2s",
            path: "M1920,68 L1300,68 L1250,90 L960,90",
            rotate: "auto",
            repeatCount: "indefinite",
        });
        /** @type {__VLS_StyleScopedClasses['app-header__frame-motion']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        ...{ class: "app-header__frame-fill" },
        d: "M0,0 H1920 V68 H1300 L1250,90 H670 L620,68 H0 Z",
    });
    /** @type {__VLS_StyleScopedClasses['app-header__frame-fill']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        ...{ class: "app-header__frame-line" },
        d: "M0,68 H620 L670,90 H1250 L1300,68 H1920",
    });
    /** @type {__VLS_StyleScopedClasses['app-header__frame-line']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        ...{ class: "app-header__frame-flow" },
        d: "M0,68 H620 L670,90 H960",
        mask: "url(#app-header-frame-left-mask)",
    });
    /** @type {__VLS_StyleScopedClasses['app-header__frame-flow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        ...{ class: "app-header__frame-flow" },
        d: "M1920,68 H1300 L1250,90 H960",
        mask: "url(#app-header-frame-right-mask)",
    });
    /** @type {__VLS_StyleScopedClasses['app-header__frame-flow']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-header__time-group" },
    'aria-label': "当前时间",
});
/** @type {__VLS_StyleScopedClasses['app-header__time-group']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.time, __VLS_intrinsics.time)({
    ...{ class: "app-header__time" },
});
/** @type {__VLS_StyleScopedClasses['app-header__time']} */ ;
(__VLS_ctx.currentTime);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "app-header__date" },
});
/** @type {__VLS_StyleScopedClasses['app-header__date']} */ ;
(__VLS_ctx.currentDate);
(__VLS_ctx.currentWeek);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-header__heading" },
});
/** @type {__VLS_StyleScopedClasses['app-header__heading']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-header__title-row" },
});
/** @type {__VLS_StyleScopedClasses['app-header__title-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "app-header__title" },
});
/** @type {__VLS_StyleScopedClasses['app-header__title']} */ ;
(__VLS_ctx.pageTitle);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.toggleSubPage) },
    type: "button",
    ...{ class: "app-header__page-toggle" },
    'aria-label': (`切换至${__VLS_ctx.nextPageLabel}`),
    title: (`切换至${__VLS_ctx.nextPageLabel}`),
});
/** @type {__VLS_StyleScopedClasses['app-header__page-toggle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    'aria-hidden': "true",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "m8 8-4 4 4 4M16 8l4 4-4 4",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "app-header__modules app-header__modules--left" },
    'aria-label': "系统模块（左侧）",
});
/** @type {__VLS_StyleScopedClasses['app-header__modules']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__modules--left']} */ ;
for (const [module] of __VLS_vFor((__VLS_ctx.modules.slice(0, 5)))) {
    const __VLS_0 = (module.href ? 'a' : 'span');
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        key: (module.key),
        ...{ class: "app-header__module" },
        ...{ class: ({ 'app-header__module--active': module.active }) },
        href: (module.href),
        target: (module.href ? '_blank' : undefined),
        rel: (module.href ? 'noopener noreferrer' : undefined),
        'aria-current': (module.active ? 'page' : undefined),
        'aria-disabled': (module.href || module.active ? undefined : 'true'),
    }));
    const __VLS_2 = __VLS_1({
        key: (module.key),
        ...{ class: "app-header__module" },
        ...{ class: ({ 'app-header__module--active': module.active }) },
        href: (module.href),
        target: (module.href ? '_blank' : undefined),
        rel: (module.href ? 'noopener noreferrer' : undefined),
        'aria-current': (module.active ? 'page' : undefined),
        'aria-disabled': (module.href || module.active ? undefined : 'true'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['app-header__module']} */ ;
    /** @type {__VLS_StyleScopedClasses['app-header__module--active']} */ ;
    const { default: __VLS_5 } = __VLS_3.slots;
    if (__VLS_ctx.theme === 'green') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            ...{ class: "app-header__module-icon" },
            viewBox: "0 0 24 24",
            fill: "none",
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['app-header__module-icon']} */ ;
        for (const [path] of __VLS_vFor((module.iconPaths))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                key: (path),
                d: (path),
            });
            // @ts-ignore
            [theme, theme, theme, theme, prefersReducedMotion, prefersReducedMotion, currentTime, currentDate, currentWeek, pageTitle, toggleSubPage, nextPageLabel, nextPageLabel, modules,];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "app-header__module-label" },
    });
    /** @type {__VLS_StyleScopedClasses['app-header__module-label']} */ ;
    (module.label);
    // @ts-ignore
    [];
    var __VLS_3;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "app-header__modules app-header__modules--right" },
    'aria-label': "系统模块（右侧）",
});
/** @type {__VLS_StyleScopedClasses['app-header__modules']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header__modules--right']} */ ;
for (const [module] of __VLS_vFor((__VLS_ctx.modules.slice(5)))) {
    const __VLS_6 = (module.href ? 'a' : 'span');
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        key: (module.key),
        ...{ class: "app-header__module" },
        ...{ class: ({ 'app-header__module--active': module.active }) },
        href: (module.href),
        target: (module.href ? '_blank' : undefined),
        rel: (module.href ? 'noopener noreferrer' : undefined),
        'aria-current': (module.active ? 'page' : undefined),
        'aria-disabled': (module.href || module.active ? undefined : 'true'),
    }));
    const __VLS_8 = __VLS_7({
        key: (module.key),
        ...{ class: "app-header__module" },
        ...{ class: ({ 'app-header__module--active': module.active }) },
        href: (module.href),
        target: (module.href ? '_blank' : undefined),
        rel: (module.href ? 'noopener noreferrer' : undefined),
        'aria-current': (module.active ? 'page' : undefined),
        'aria-disabled': (module.href || module.active ? undefined : 'true'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    /** @type {__VLS_StyleScopedClasses['app-header__module']} */ ;
    /** @type {__VLS_StyleScopedClasses['app-header__module--active']} */ ;
    const { default: __VLS_11 } = __VLS_9.slots;
    if (__VLS_ctx.theme === 'green') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            ...{ class: "app-header__module-icon" },
            viewBox: "0 0 24 24",
            fill: "none",
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['app-header__module-icon']} */ ;
        for (const [path] of __VLS_vFor((module.iconPaths))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                key: (path),
                d: (path),
            });
            // @ts-ignore
            [theme, modules,];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "app-header__module-label" },
    });
    /** @type {__VLS_StyleScopedClasses['app-header__module-label']} */ ;
    (module.label);
    // @ts-ignore
    [];
    var __VLS_9;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-header__right" },
});
/** @type {__VLS_StyleScopedClasses['app-header__right']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.openSettings) },
    type: "button",
    ...{ class: "app-header__settings-btn" },
    'aria-label': "打开设置",
    title: "设置",
});
/** @type {__VLS_StyleScopedClasses['app-header__settings-btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    'aria-hidden': "true",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z",
});
const __VLS_12 = SettingsDialog;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    visible: (__VLS_ctx.showSettings),
}));
const __VLS_14 = __VLS_13({
    visible: (__VLS_ctx.showSettings),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
// @ts-ignore
[openSettings, showSettings,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
