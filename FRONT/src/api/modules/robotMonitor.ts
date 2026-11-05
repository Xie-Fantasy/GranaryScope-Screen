import { getVideoBackendApiUrl } from '@/api/modules/videoDetection';
import type { AlertWarningKey } from '@/types/alert-warning';

interface RobotMonitorSourcePayload {
  streamUrl?: unknown;
}

interface RobotCapturePayload {
  imageUrl?: unknown;
  capturedAt?: unknown;
}

export interface RobotCaptureResult {
  imageUrl: string;
  capturedAt: string;
}

function asAbsoluteHttpUrl(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label}缺失`);
  }

  let parsed: URL;
  try {
    parsed = new URL(value, window.location.href);
  } catch {
    throw new Error(`${label}无效`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`${label}协议不受支持`);
  }
  return parsed.toString();
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error('服务返回的数据格式无效');
  }
}

/** 从后端读取机器人监控的浏览器直连源，地址不会写入前端环境变量。 */
export async function getRobotMonitorSourceUrl(signal?: AbortSignal): Promise<string> {
  const response = await fetch(getVideoBackendApiUrl('/video-sources/robot-monitor'), { signal });
  if (!response.ok) {
    throw new Error(`机器人监控源获取失败（HTTP ${response.status}）`);
  }
  const payload = await readJson(response) as RobotMonitorSourcePayload;
  return asAbsoluteHttpUrl(payload.streamUrl, '机器人监控地址');
}

/**
 * MediaMTX 浏览器播放页的标准 WHEP 协商地址。
 * 保留 iframe 回退路径：若现场服务并非 WHEP，展示仍不会中断。
 */
export function getRobotMonitorWhepUrl(playerUrl: string): string {
  return new URL('whep', playerUrl).toString();
}

/** 上传浏览器当前抓取的机器人监控 JPEG，由后端按告警日期安全存储。 */
export async function saveRobotMonitorCapture(
  alertKey: AlertWarningKey,
  image: Blob,
  signal?: AbortSignal,
): Promise<RobotCaptureResult> {
  const response = await fetch(getVideoBackendApiUrl(`/robot-captures/${alertKey}`), {
    method: 'POST',
    headers: { 'Content-Type': 'image/jpeg' },
    body: image,
    signal,
  });
  if (!response.ok) {
    throw new Error(`机器人抓拍保存失败（HTTP ${response.status}）`);
  }

  const payload = await readJson(response) as RobotCapturePayload;
  return {
    imageUrl: asAbsoluteHttpUrl(payload.imageUrl, '抓拍图片地址'),
    capturedAt: typeof payload.capturedAt === 'string' ? payload.capturedAt : '',
  };
}
