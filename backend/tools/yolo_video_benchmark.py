"""Benchmark YOLOv8n and YOLO11n on a small local H.264 test video.

This intentionally uses Ultralytics' public ``bus.jpg`` asset. It never opens
an RTSP URL and is not evidence of camera connectivity or production FPS.
"""

from __future__ import annotations

import argparse
import json
import platform
import subprocess
import time
from pathlib import Path
from typing import Any

import cv2
import torch
from ultralytics import YOLO


PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = PROJECT_ROOT / "backend"
MODEL_ROOT = BACKEND_ROOT / "models"
DEFAULT_OUT = PROJECT_ROOT / "artifacts" / "benchmarks"


def public_bus_image() -> Path:
    import ultralytics

    return Path(ultralytics.__file__).resolve().parent / "assets" / "bus.jpg"


def make_video(path: Path, seconds: float, fps: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-y", "-loop", "1", "-i", str(public_bus_image()),
        "-t", str(seconds), "-r", str(fps), "-vf", "scale=640:-2,format=yuv420p",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(path),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def benchmark(model_path: Path, video_path: Path, imgsz: int, device: str, warmup: int) -> dict[str, Any]:
    model = YOLO(str(model_path))
    capture = cv2.VideoCapture(str(video_path))
    if not capture.isOpened():
        raise RuntimeError(f"cannot open local test video: {video_path}")

    warm_frames = []
    while len(warm_frames) < warmup:
        ok, frame = capture.read()
        if not ok:
            break
        warm_frames.append(frame)
    if not warm_frames:
        raise RuntimeError("test video has no decodable frames")

    for frame in warm_frames:
        model.predict(frame, imgsz=imgsz, device=device, verbose=False)
    if device != "cpu" and torch.cuda.is_available():
        torch.cuda.synchronize()
        torch.cuda.reset_peak_memory_stats()

    frames = detections = boxes = 0
    start = time.perf_counter()
    while True:
        ok, frame = capture.read()
        if not ok:
            break
        result = model.predict(frame, imgsz=imgsz, device=device, verbose=False)[0]
        frames += 1
        count = int(result.boxes.shape[0]) if result.boxes is not None else 0
        boxes += count
        detections += int(count > 0)
    if device != "cpu" and torch.cuda.is_available():
        torch.cuda.synchronize()
    elapsed = time.perf_counter() - start
    capture.release()

    peak = None
    if device != "cpu" and torch.cuda.is_available():
        peak = round(torch.cuda.max_memory_allocated() / (1024 * 1024), 2)
    return {
        "model": model_path.name,
        "imgsz": imgsz,
        "device": device,
        "frames": frames,
        "frames_with_detections": detections,
        "total_boxes": boxes,
        "elapsed_seconds": round(elapsed, 4),
        "inference_fps": round(frames / elapsed, 2) if elapsed else None,
        "peak_cuda_memory_mb": peak,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", type=Path)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--seconds", type=float, default=3)
    parser.add_argument("--fps", type=int, default=10)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--device", default="cuda:0" if torch.cuda.is_available() else "cpu")
    args = parser.parse_args()

    args.out_dir.mkdir(parents=True, exist_ok=True)
    video = args.video or (args.out_dir / "bus_3s_h264.mp4")
    if args.video is None or not video.exists():
        make_video(video, args.seconds, args.fps)
    results = [
        benchmark(MODEL_ROOT / "yolov8n.pt", video, args.imgsz, args.device, warmup=2),
        benchmark(MODEL_ROOT / "yolo11n.pt", video, args.imgsz, args.device, warmup=2),
    ]
    payload = {
        "test_type": "local_public_image_video_only",
        "warning": "Not an RTSP or production real-time validation.",
        "python": platform.python_version(),
        "torch": torch.__version__,
        "cuda_available": torch.cuda.is_available(),
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
        "video": str(video.relative_to(ROOT)),
        "source_asset": str(public_bus_image()),
        "results": results,
    }
    (args.out_dir / "yolo_video_benchmark.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    lines = ["# YOLO 本地视频基准", "", "> 仅使用 Ultralytics 自带公开 `bus.jpg` 生成 H.264 测试视频；不接入 RTSP，不能代表摄像头现场效果。", "", f"- 视频：`{payload['video']}`", f"- Python/Torch：`{payload['python']}` / `{payload['torch']}`", f"- GPU：`{payload['gpu']}`", "", "| 模型 | 解码帧数 | 有检测帧 | 总框数 | 推理 FPS | 峰值显存 MB |", "|---|---:|---:|---:|---:|---:|"]
    lines += [f"| {r['model']} | {r['frames']} | {r['frames_with_detections']} | {r['total_boxes']} | {r['inference_fps']} | {r['peak_cuda_memory_mb']} |" for r in results]
    (args.out_dir / "yolo_video_benchmark.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
