// ============================================
// chartTheme - ECharts 图表设计系统层
// 唯一来源：视觉规范 v2.0 §17 / §25
// 原则：
// - 主题色（Green/Blue）只负责主系列与交互；
// - 语义色（success/warning/danger/...）双主题一致，承载业务含义；
// - 图表是"分析工具"，不是"灯光秀"：无全局 Glow、默认 showSymbol:false、
//   线宽 1.5-2px、网格极弱、图例安静。
// ============================================
/** 跨主题语义色（视觉规范 §5，语义色不随主题变化） */
export const CHART_SEMANTIC = {
    success: '#38C98B',
    warning: '#E8B33F',
    danger: '#EF5A5A',
    dangerStrong: '#FF4747',
    info: '#46BFD8',
    offline: '#73818A',
};
const GREEN_PALETTE = {
    primary: '#35D6AE',
    warning: '#E8B33F',
    danger: '#EF5A5A',
    secondary: '#59C7B7',
    muted: '#79A99E',
    success: '#38C98B',
};
const BLUE_PALETTE = {
    primary: '#35BCE3',
    warning: '#E8B33F',
    danger: '#EF5A5A',
    secondary: '#53D4DA',
    muted: '#6E91AC',
    success: '#38C98B',
};
/** 中性文本体系（双主题统一，视觉规范 §6） */
export const CHART_TEXT = {
    primary: '#F1F5F4',
    secondary: '#B3C0C1',
    tertiary: '#7F9194',
};
/** Tooltip 背景（视觉规范 §18） */
export const CHART_TOOLTIP_BG = 'rgba(8, 20, 24, 0.96)';
/**
 * 由系列色生成自上而下淡出的纵向渐变。
 * 用于柱体和面积图的轻量层次，不附加阴影或发光效果。
 */
export function createVerticalGradient(color, topOpacity, bottomOpacity) {
    const hex = color.replace('#', '');
    const red = Number.parseInt(hex.slice(0, 2), 16);
    const green = Number.parseInt(hex.slice(2, 4), 16);
    const blue = Number.parseInt(hex.slice(4, 6), 16);
    const rgba = (opacity) => `rgba(${red}, ${green}, ${blue}, ${opacity})`;
    return {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
            { offset: 0, color: rgba(topOpacity) },
            { offset: 1, color: rgba(bottomOpacity) },
        ],
        global: false,
    };
}
/** 将十六进制色向白色或黑色偏移，用于 2.5D 柱体的顶面与侧面。 */
export function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const channel = (offset) => {
        const value = Number.parseInt(hex.slice(offset, offset + 2), 16);
        const adjusted = amount >= 0
            ? value + (255 - value) * amount
            : value * (1 + amount);
        return Math.round(adjusted).toString(16).padStart(2, '0');
    };
    return `#${channel(0)}${channel(2)}${channel(4)}`;
}
/**
 * 获取指定主题的图表主题对象（含通用 option 构建器）。
 * 组件在 buildOption 内调用，主题切换时由 useECharts 触发重建。
 */
export function getChartTheme(theme) {
    const palette = theme === 'green' ? GREEN_PALETTE : BLUE_PALETTE;
    const gridLine = theme === 'green' ? 'rgba(164, 211, 201, 0.07)' : 'rgba(178, 203, 223, 0.07)';
    const borderStrong = theme === 'green' ? 'rgba(122, 215, 191, 0.26)' : 'rgba(91, 182, 222, 0.25)';
    return {
        palette,
        text: CHART_TEXT,
        /** 克制的 Tooltip（视觉规范 §18） */
        tooltip() {
            return {
                trigger: 'axis',
                backgroundColor: CHART_TOOLTIP_BG,
                borderColor: borderStrong,
                borderWidth: 1,
                padding: [6, 10],
                textStyle: { color: CHART_TEXT.primary, fontSize: 12 },
            };
        },
        /** 安静的图例：小圆点、次文本色 */
        legend(data) {
            return {
                data,
                textStyle: { color: CHART_TEXT.secondary, fontSize: 12 },
                icon: 'circle',
                itemWidth: 8,
                itemHeight: 8,
                itemGap: 14,
                top: 0,
            };
        },
        /** 极弱的类目轴 */
        categoryAxis(data, rotate = 0) {
            return {
                type: 'category',
                data,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: CHART_TEXT.tertiary,
                    fontSize: 11,
                    ...(rotate ? { rotate } : {}),
                },
            };
        },
        /** 极弱的数值轴（网格线为低透明虚线） */
        valueAxis(name) {
            return {
                type: 'value',
                ...(name ? { name } : {}),
                nameTextStyle: { color: CHART_TEXT.tertiary, fontSize: 11 },
                splitLine: { lineStyle: { color: gridLine, type: 'dashed' } },
                axisLabel: { color: CHART_TEXT.tertiary, fontSize: 11 },
                axisLine: { show: false },
            };
        },
        /** 专业折线系列的公共形态：默认隐藏 symbol、Hover 显示、1.5-2px 线宽 */
        lineSeries(extra = {}) {
            return {
                type: 'line',
                smooth: true,
                showSymbol: false,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2 },
                ...extra,
            };
        },
    };
}
