# Passive Voice Renderer

Local TypeScript/React/Remotion renderer for passive-voice teaching videos.
The app consumes a question package and user-supplied MP3 files, then produces a
1920x1080 H.264 MP4. It does not generate TTS.

## Setup

```text
npm install
```

The Windows Remotion compositor package supplies the FFmpeg and FFprobe
binaries used by the renderer; a system-wide `ffmpeg` command is not required.

## Commands

```text
npm run validate -- --input input/Q01
npm run render -- --input input/Q01 --output output/Q01
npm run preview -- --input input/Q01 --output output/Q01
```

`validate` reads the JSON files and measures the four MP3 files without
rendering. `render` creates the MP4 and QA artifacts. `preview` runs the same
validation and timeline resolution but creates only previews and JSON
diagnostics, not `video.mp4`.

See [docs/input-format.md](docs/input-format.md) for the exact package format.

## Development checks

```text
npm test
npm run typecheck
```

## Output

```text
output/Q01/
├── video.mp4
├── timeline_resolved.json
├── render_manifest.json
└── preview/
    ├── QUESTION.png
    ├── THINK.png
    ├── IDENTIFY_SVO.png
    ├── TRANSFORM.png
    └── FINAL_ANSWER.png
```
