/** 浏览器视频检测链路使用的传输中立数据类型。 */
export interface NormalizedBoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface VideoDetection {
  classId: number;
  label: string;
  confidence: number;
  bboxNorm: NormalizedBoundingBox;
  /** 后端 tracker 分配的目标 ID；未启用跟踪或未关联上时缺省。 */
  trackId?: number;
}

/** 一帧 YOLO 推理结果；字段与后端检测元数据 Schema 保持一致。 */
export interface DetectionFrame {
  cameraId: string;
  frameId: number;
  capturedAtMs?: number;
  sourceTimestamp?: number;
  inferenceStartedAtMs: number;
  inferenceFinishedAtMs: number;
  sourceWidth: number;
  sourceHeight: number;
  modelName: string;
  detections: VideoDetection[];
}

export type VideoConnectionStatus = 'idle' | 'connecting' | 'playing' | 'offline';
export type DetectionConnectionStatus = 'idle' | 'connecting' | 'waiting' | 'ready';
