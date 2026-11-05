// ============================================
// 键盘报警演示配置
// 仅用于前端展示。报警色属于业务语义，不跟随系统蓝/绿主题变化。
// ============================================

export type AlertWarningKey = 1 | 2 | 3 | 4 | 5;

export interface AlertWarningMetric {
  label: string;
  value: string;
  emphasis?: boolean;
}

export interface AlertWarningDefinition {
  key: AlertWarningKey;
  title: string;
  subtitle: string;
  severity: string;
  accent: string;
  surface: string;
  sourceLabel: string;
  primaryMetric: AlertWarningMetric;
  metrics: AlertWarningMetric[];
  description: string;
}

export const ALERT_WARNING_DEFINITIONS: Record<AlertWarningKey, AlertWarningDefinition> = {
  1: {
    key: 1,
    title: '安全帽未佩戴告警',
    subtitle: 'Q25号仓 · 生产作业区 Q25-WORK-03',
    severity: 'L1 提醒',
    accent: '#FFD319',
    surface: '#2E2708',
    sourceLabel: 'AI识别抓拍',
    primaryMetric: { label: '违规人员', value: '1 人', emphasis: true },
    metrics: [
      { label: '持续时间', value: '00:01:28', emphasis: true },
      { label: '作业区域', value: 'Q25号仓 生产作业区' },
      { label: '监测设备', value: 'Q25-WORK-03' },
      { label: '违规类型', value: '安全帽未佩戴', emphasis: true },
    ],
    description: '检测到人员未佩戴安全帽，请立即提醒并督促其规范佩戴，确保作业安全。',
  },
  2: {
    key: 2,
    title: '仓外高温报警',
    subtitle: 'Q25号仓 · 气象站 Q25-WEATHER-01',
    severity: 'L3 报警',
    accent: '#2E92FF',
    surface: '#0A243F',
    sourceLabel: '气象监测',
    primaryMetric: { label: '仓外温度', value: '41.8°C', emphasis: true },
    metrics: [
      { label: '粮温变化趋势', value: '+3.4°C/h', emphasis: true },
      { label: '仓内温度', value: '36.2°C', emphasis: true },
      { label: '内外温差', value: '+5.6°C', emphasis: true },
      { label: '仓外参考范围', value: '−5～40°C' },
    ],
    description: '仓外温度已超过 40°C 参考上限，仓内温度同时超过 35°C 报警线，且粮温快速上升、内外温差扩大，请立即核查并采取降温措施。',
  },
  3: {
    key: 3,
    title: '害虫密度报警',
    subtitle: 'Q25号仓 · 虫情监测灯 Q25-INS-02',
    severity: 'L3 报警',
    accent: '#D85AF3',
    surface: '#2A1236',
    sourceLabel: '虫情监测',
    primaryMetric: { label: '害虫总密度', value: '32 头/kg', emphasis: true },
    metrics: [
      { label: '主要储粮害虫密度', value: '12 头/kg', emphasis: true },
      { label: '虫粮等级', value: '严重虫粮', emphasis: true },
      { label: '风险等级', value: '高', emphasis: true },
      { label: '害虫类型', value: '害虫' },
    ],
    description: '害虫总密度超过 30 头/kg，主要储粮害虫密度超过 10 头/kg，判定为严重虫粮；请及时复核并采取综合防治措施。',
  },
  4: {
    key: 4,
    title: '人员入侵告警',
    subtitle: 'Q25号仓 · 北侧禁入区 CAM-Q25-N02',
    severity: 'L3 严重',
    accent: '#FF4D4D',
    surface: '#3A1114',
    sourceLabel: '实时抓拍',
    primaryMetric: { label: '入侵人员', value: '1 人', emphasis: true },
    metrics: [
      { label: '持续时间', value: '00:00:16', emphasis: true },
      { label: '入侵区域', value: 'Q25北侧禁入区' },
      { label: '触发设备', value: 'CAM-Q25-N02' },
      { label: '置信度', value: '92.3%', emphasis: true },
    ],
    description: '检测到有人员进入禁入区域，请立即核实情况并采取相应措施。',
  },
  5: {
    key: 5,
    title: '温湿度超限报警',
    subtitle: 'Q25号仓 · 监测点 Q25-T04',
    severity: 'L3 报警',
    accent: '#FF921C',
    surface: '#3A210C',
    sourceLabel: '环境监测',
    primaryMetric: { label: '仓内温度', value: '36.2°C', emphasis: true },
    metrics: [
      { label: '温度报警阈值', value: '> 35.0°C' },
      { label: '当前湿度', value: '78%', emphasis: true },
      { label: '湿度报警阈值', value: '> 75%' },
      { label: '粮食平均温度', value: '26.4°C', emphasis: true },
    ],
    description: '仓内温度超过 35°C、相对湿度超过 75%，粮食平均温度也超过 25°C 报警线；请立即检查通风设备与仓内环境状态。',
  },
};
