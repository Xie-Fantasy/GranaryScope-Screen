/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/desktop/2026国赛/LiangCang/FRONT/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import AlertWarningVisual from '@/components/common/AlertWarningVisual.vue';
defineOptions({ name: 'AlertWarningDialog' });
const props = defineProps();
const emit = defineEmits();
const dialogStyle = computed(() => ({
    '--alert-accent': props.alert?.accent ?? '#2E92FF',
    '--alert-surface': props.alert?.surface ?? '#0A243F',
}));
const hasDiagnosticVisual = computed(() => {
    const key = props.alert?.key;
    return key === 2 || key === 3 || key === 5;
});
function close() {
    emit('close');
}
function onOverlayClick(event) {
    if (event.target === event.currentTarget)
        close();
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
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__header']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__heading']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__mark-core']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__heading']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__heading']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__close']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__close']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__close']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__camera-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__camera-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__primary-metric']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__primary-metric']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__metric']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__metric']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__metric']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__metric']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__metric']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__metric']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__footer']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__footer']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__footer']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__notice-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__footer-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__button']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__button']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__button--secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog-enter-active']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog-leave-active']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog-enter-from']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog-leave-to']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__content']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__camera']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__footer']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__edge']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-warning-dialog__camera-dot']} */ ;
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
    name: "alert-warning-dialog",
}));
const __VLS_8 = __VLS_7({
    name: "alert-warning-dialog",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
if (__VLS_ctx.visible && __VLS_ctx.alert) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ onClick: (__VLS_ctx.onOverlayClick) },
        ...{ class: "alert-warning-dialog" },
        ...{ style: (__VLS_ctx.dialogStyle) },
        role: "presentation",
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-dialog__edge" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__edge']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
        ...{ class: "alert-warning-dialog__panel" },
        role: "alertdialog",
        'aria-modal': "true",
        'aria-labelledby': (`alert-warning-title-${__VLS_ctx.alert.key}`),
        'aria-describedby': (`alert-warning-description-${__VLS_ctx.alert.key}`),
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__panel']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "alert-warning-dialog__header" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-dialog__heading" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__heading']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-dialog__mark" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__mark']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "alert-warning-dialog__mark-core" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__mark-core']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        id: (`alert-warning-title-${__VLS_ctx.alert.key}`),
    });
    (__VLS_ctx.alert.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (__VLS_ctx.alert.subtitle);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-dialog__header-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__header-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.time, __VLS_intrinsics.time)({});
    (new Date().toLocaleTimeString('zh-CN', { hour12: false }));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "alert-warning-dialog__severity" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__severity']} */ ;
    (__VLS_ctx.alert.severity);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.close) },
        type: "button",
        ...{ class: "alert-warning-dialog__close" },
        'aria-label': "关闭报警",
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M18 6 6 18M6 6l12 12",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-dialog__content" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "alert-warning-dialog__camera" },
        'aria-label': (__VLS_ctx.hasDiagnosticVisual ? '报警监测数据图示' : '报警画面'),
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__camera']} */ ;
    if (!__VLS_ctx.hasDiagnosticVisual) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "alert-warning-dialog__camera-label" },
        });
        /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__camera-label']} */ ;
        (__VLS_ctx.alert.sourceLabel);
    }
    if (__VLS_ctx.captureImageUrl) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "alert-warning-dialog__camera-image" },
            src: (__VLS_ctx.captureImageUrl),
            alt: "机器人监控告警抓拍",
        });
        /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__camera-image']} */ ;
    }
    else if (__VLS_ctx.hasDiagnosticVisual) {
        const __VLS_12 = AlertWarningVisual;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
            alert: (__VLS_ctx.alert),
        }));
        const __VLS_14 = __VLS_13({
            alert: (__VLS_ctx.alert),
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "alert-warning-dialog__camera-placeholder" },
        });
        /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__camera-placeholder']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "alert-warning-dialog__camera-corner alert-warning-dialog__camera-corner--top-left" },
        });
        /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__camera-corner']} */ ;
        /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__camera-corner--top-left']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "alert-warning-dialog__camera-corner alert-warning-dialog__camera-corner--bottom-right" },
        });
        /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__camera-corner']} */ ;
        /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__camera-corner--bottom-right']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "alert-warning-dialog__camera-dot" },
        });
        /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__camera-dot']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.captureStatus === 'pending' ? '正在抓拍机器人监控画面' : __VLS_ctx.captureStatus === 'error' ? '报警画面抓拍失败' : '报警画面待接入');
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (__VLS_ctx.captureStatus === 'pending' ? '正在切换机器人监控并保存当前画面' : __VLS_ctx.captureErrorMessage ?? '当前阶段仅展示告警信息');
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "alert-warning-dialog__details" },
        'aria-label': "报警详情",
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__details']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-dialog__primary-metric" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__primary-metric']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.alert.primaryMetric.label);
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.alert.primaryMetric.value);
    __VLS_asFunctionalElement1(__VLS_intrinsics.dl, __VLS_intrinsics.dl)({
        ...{ class: "alert-warning-dialog__metrics" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__metrics']} */ ;
    for (const [metric] of __VLS_vFor((__VLS_ctx.alert.metrics))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (metric.label),
            ...{ class: "alert-warning-dialog__metric" },
        });
        /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__metric']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
        (metric.label);
        __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({
            ...{ class: ({ 'alert-warning-dialog__metric-value--emphasis': metric.emphasis }) },
        });
        /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__metric-value--emphasis']} */ ;
        (metric.value);
        // @ts-ignore
        [visible, alert, alert, alert, alert, alert, alert, alert, alert, alert, alert, alert, alert, onOverlayClick, dialogStyle, close, hasDiagnosticVisual, hasDiagnosticVisual, hasDiagnosticVisual, captureImageUrl, captureImageUrl, captureStatus, captureStatus, captureStatus, captureErrorMessage,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
        ...{ class: "alert-warning-dialog__footer" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        id: (`alert-warning-description-${__VLS_ctx.alert.key}`),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "alert-warning-dialog__notice-icon" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__notice-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.alert.description);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-warning-dialog__footer-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__footer-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.close) },
        type: "button",
        ...{ class: "alert-warning-dialog__button alert-warning-dialog__button--secondary" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__button']} */ ;
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__button--secondary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.visible && __VLS_ctx.alert))
                    throw 0;
                return (__VLS_ctx.emit('view'));
                // @ts-ignore
                [alert, alert, close, emit,];
            } },
        type: "button",
        ...{ class: "alert-warning-dialog__button alert-warning-dialog__button--primary" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__button']} */ ;
    /** @type {__VLS_StyleScopedClasses['alert-warning-dialog__button--primary']} */ ;
}
// @ts-ignore
[];
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
