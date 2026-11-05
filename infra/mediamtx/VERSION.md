# MediaMTX version and offline package record

## Verified baseline

Pin the P1 package to **MediaMTX v1.20.1** for Windows x86_64 when the target
host is Windows x64. This was the latest release shown by the official
configuration reference on 2026-09-03. Do not silently use `latest` or upgrade
the binary without re-checking `mediamtx.yml` against that release's bundled
configuration file.

Obtain the archive only from the official MediaMTX GitHub releases while an
internet-connected staging machine is available, then transfer it to LAN-B by
an approved offline method. Do not download a binary on the deployment host.

The official Windows archive was downloaded and verified on 2026-09-03. Its
local `dist/` directory is ignored by source control and is intended for the
approved offline transfer package only.

## Package record

| Item | Required value |
| --- | --- |
| Archive filename | `mediamtx_v1.20.1_windows_amd64.zip` |
| Release tag | `v1.20.1` |
| Platform / architecture | `windows_amd64` |
| SHA-256 | `dc970f8e1f3ad58edafcf536bcd1ffe0adcb4390e7ace9377694a9ea2c1ebe53` |
| Verified date | `2026-09-03` |
| Local staging path | `infra/mediamtx/dist/v1.20.1/` (ignored by source control) |

The archive hash matched the release's official `checksums.sha256`. The
extracted binary also passed an inert-source startup check with this project's
`mediamtx.yml`: RTSP bound to loopback TCP 8554, WHEP signalling bound to TCP
8889, and WebRTC ICE bound to UDP 8189. No camera address was injected and no
real stream was accessed during this check.
