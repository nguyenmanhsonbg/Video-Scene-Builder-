# Passive Voice Renderer v1 Design

**Status:** Design approved in chat

**Date:** 2026-09-16

## Goal

Build a local TypeScript/React/Remotion renderer that accepts one passive-voice question package, uses the actual duration of supplied MP3 voice segments as the master clock, and produces a validated 1920x1080 H.264 MP4 plus resolved timeline, manifest, and stage previews.

## Context

The existing app specification defines a deterministic educational video for the transformation:

```text
Active sentence -> Present Simple Passive
```

Version 1 supports the fixed stages `QUESTION`, `THINK`, `IDENTIFY_SVO`, `TRANSFORM`, and `FINAL_ANSWER`. Q02-Q10 must be data changes only: layout, animation engine, component tree, and render pipeline remain reusable.

The workspace currently contains the app specification, Q01 voice script, and an HTML master slide. It is not a Git repository and contains no application scaffold. The HTML file is a visual reference for the fixed layout; the runtime renderer will use React components so that visual state can be evaluated deterministically for every video frame.

## Non-goals

- Generating TTS or modifying supplied audio.
- Automatic ASR or word-level speech alignment.
- Multiple-choice, fill-in-the-blank, reading comprehension, or other question types.
- A visual editor, cloud rendering, responsive aspect ratios, 3D animation, or runtime AI layout decisions.
- Recreating the existing HTML as a browser screenshot pipeline.

## Architecture

The app is a local CLI backed by a Remotion composition:

```text
Input package
  -> schema validation
  -> actual audio duration inspection
  -> stage timeline resolution
  -> visual event validation
  -> deterministic frame state
  -> Remotion render
  -> H.264 MP4 + QA artifacts
```

The core engine is separated from the passive-voice module:

```text
core/
  schema       content, voice, timeline contracts
  audio        audio path and duration inspection
  timeline     stage boundaries, global event times, validation
  animation    action-to-preset mapping and interpolation
  layout       text measurement, fitting, overflow validation
  subtitles    segment subtitle cues
  render       composition setup and output artifacts

question-types/passive-voice/
  schema       passive question-specific types
  layout       fixed region geometry and fit rules
  scene        PassiveVoiceScene and stage state
  components   sentence, SVO, transform, answer, grammar rule
```

The passive-voice module consumes resolved timeline events and content data. It does not inspect audio files, calculate global timestamps, or choose animation presets.

## Input contract

Each render receives a directory with this structure:

```text
input/Q01/
├── question.json
├── voice.json
├── timeline.json
└── audio/
    ├── Q01_01_question.mp3
    ├── Q01_02_svo.mp3
    ├── Q01_03_transform.mp3
    └── Q01_04_answer.mp3
```

### `question.json`

The content schema follows the app specification and contains no pixel position, CSS, animation duration, or absolute timestamp:

```json
{
  "questionId": "Q01",
  "questionNumber": 1,
  "topic": "Present Simple Passive",
  "active": {
    "fullSentence": "Doctors often check patients' blood pressure.",
    "subject": "Doctors",
    "adverb": "often",
    "verb": "check",
    "object": "patients' blood pressure"
  },
  "passive": {
    "subject": "Patients' blood pressure",
    "be": "is",
    "adverb": "often",
    "verbV3": "checked",
    "agent": "by doctors"
  },
  "grammar": {
    "subjectNumber": "singular",
    "beReason": "singular -> is",
    "verbTransformation": "check -> checked",
    "ruleLabel": "PRESENT SIMPLE PASSIVE",
    "rule": "S + am/is/are + V3/-ed + (by O)"
  },
  "finalAnswer": "Patients' blood pressure is often checked by doctors."
}
```

### `voice.json`

Audio paths are relative to the input package. The declared duration is required for input diagnostics; for audio-backed stages, the measured duration is authoritative. Segment-level subtitle text is the v1 subtitle source because automatic word alignment is out of scope.

```json
{
  "questionId": "Q01",
  "segments": [
    {
      "id": "QUESTION",
      "audio": "audio/Q01_01_question.mp3",
      "duration": 6.21,
      "subtitle": "Câu một. Doctors often check patients' blood pressure."
    },
    {
      "id": "THINK",
      "audio": null,
      "duration": 4.0,
      "subtitle": null
    },
    {
      "id": "IDENTIFY_SVO",
      "audio": "audio/Q01_02_svo.mp3",
      "duration": 17.84,
      "subtitle": "Trước tiên, chúng ta xác định các thành phần của câu."
    },
    {
      "id": "TRANSFORM",
      "audio": "audio/Q01_03_transform.mp3",
      "duration": 25.13,
      "subtitle": "Bây giờ, chúng ta chuyển câu chủ động sang câu bị động."
    },
    {
      "id": "FINAL_ANSWER",
      "audio": "audio/Q01_04_answer.mp3",
      "duration": 10.42,
      "subtitle": "Câu bị động hoàn chỉnh là: Patients' blood pressure is often checked by doctors."
    }
  ]
}
```

All five stage records are required. `THINK` must have `audio: null`; every other stage must reference an existing MP3. A future cue-based subtitle extension can replace a segment string with an array without changing the timeline or scene contracts.

### `timeline.json`

Timeline events use relative seconds within their segment:

```json
{
  "questionId": "Q01",
  "segments": [
    {
      "segment": "IDENTIFY_SVO",
      "events": [
        {
          "at": 3.2,
          "action": "REVEAL_UNDERLINE",
          "target": "underline_subject"
        },
        {
          "at": 3.35,
          "action": "SHOW",
          "target": "label_s"
        }
      ]
    }
  ]
}
```

The resolver calculates:

```text
globalEventTime = segmentGlobalStart + event.at
```

No event is silently clamped. An event with `at < 0` or `at > measured segment duration` is a validation error.

## Timeline and state model

Stage global boundaries are calculated in this order:

```text
QUESTION -> THINK -> IDENTIFY_SVO -> TRANSFORM -> FINAL_ANSWER
```

For example, if measured durations are `6.21`, `4.0`, `17.84`, `25.13`, and `10.42`, the boundaries are:

```text
QUESTION       0.00 -> 6.21
THINK          6.21 -> 10.21
IDENTIFY_SVO  10.21 -> 28.05
TRANSFORM     28.05 -> 53.18
FINAL_ANSWER  53.18 -> 63.60
```

The Remotion scene receives the current frame time and derives the visible state from all events whose resolved time has been reached. This makes seeking, previewing, and rendering deterministic.

Stage rules:

- `QUESTION`: show title, active label, and active sentence tokens; hide S/V/O markers, transformation, answer, and grammar rule.
- `THINK`: retain the active sentence and show `think_prompt`; do not reveal S/V/O markers or answer content.
- `IDENTIFY_SVO`: reveal subject, verb, object, and adverb markers according to timeline events.
- `TRANSFORM`: execute `MOVE_OBJECT`, `CHOOSE_BE`, `USE_V3`, `BUILD_SENTENCE`, `ADD_ADVERB`, and `ADD_AGENT` in event order.
- `FINAL_ANSWER`: reveal `answer_box` and `answer_text` only at or after the stage start; reveal the grammar rule according to its event.

## Stable element contract

All scenes expose the fixed IDs from the app specification. The v1 allowlist includes:

```text
title, active_label,
active_subject, active_adverb, active_verb, active_object,
underline_subject, underline_verb, underline_object,
label_s, label_v, label_o, adverb_highlight,
transform_object_source, transform_arrow, passive_subject,
note_singular, be_token, verb_base, verb_v3,
build_subject, build_be, build_adverb, build_v3, build_agent,
answer_box, answer_text, grammar_rule_label, grammar_rule_text,
think_prompt, countdown
```

An event target outside this contract fails validation. IDs do not change between Q01 and Q10.

## Visual components and layout

The canvas is fixed at `1920x1080`, `16:9`, `30fps`, with a white background. The fixed regions are header, active sentence, S-V-O analysis, transformation, final answer, grammar rule, and subtitle.

The renderer uses the v1 theme tokens from the app specification:

```text
black      #111111
white      #FFFFFF
beige      #D8B07A
navy       #0E2B47
red        #FF2A2A
lightBlue  #B8C9F0
gray       #BDBDBD
answerText #7EC0FF
```

The title uses a bold serif font. Body and English sentence text use `Be Vietnam Pro`, with `Inter` and `Arial` fallbacks. English sentence tokens use a large, high-readability sans-serif treatment. The header text is generated from the question number and topic and remains in the same position across all stages. Beige corner decorations remain fixed in the top-right and bottom-left regions.

The active sentence is four independently measurable tokens:

```text
subject | adverb | verb | object
```

The layout engine uses actual font metrics. Its fit order is:

1. Reduce token gaps within the configured minimum.
2. Reduce font size without going below the configured threshold.
3. Switch to the defined two-line fallback layout.
4. Fail validation if text still overflows.

The minimum thresholds include `34px` for the active sentence and `28px` for the final answer. The answer bar and subtitle are separate layers so subtitles cannot cover the transformation or final answer regions.

## Animation grammar

The renderer exposes only deterministic presets:

```text
APPEAR, FADE_IN, FADE_UP, UNDERLINE_REVEAL,
HIGHLIGHT, OUTLINE_REVEAL, MOVE_TO, REPLACE, BUILD_TOKEN
```

Default durations follow the app specification:

```json
{
  "APPEAR": 0,
  "FADE_IN": 0.30,
  "FADE_UP": 0.35,
  "UNDERLINE_REVEAL": 0.35,
  "HIGHLIGHT": 0.25,
  "OUTLINE_REVEAL": 0.35,
  "MOVE_TO": 0.55,
  "REPLACE": 0.35,
  "BUILD_TOKEN": 0.25
}
```

Action mapping is fixed:

```text
SHOW             -> FADE_IN
REVEAL_UNDERLINE -> UNDERLINE_REVEAL
REVEAL_OUTLINE   -> OUTLINE_REVEAL
HIGHLIGHT        -> HIGHLIGHT
MOVE_OBJECT      -> MOVE_TO
CHANGE_VERB     -> REPLACE
BUILD            -> BUILD_TOKEN
```

The timeline controls when an animation starts; the preset controls how it appears. Runtime AI does not select animations.

## Audio and subtitles

The renderer does not concatenate MP3 files before resolving the timeline. It places each audio file at the measured global start of its segment, leaving the `THINK` gap silent. The audio-backed stages are `QUESTION`, `IDENTIFY_SVO`, `TRANSFORM`, and `FINAL_ANSWER`.

Silence trimming is an input-preparation responsibility. The renderer preserves the supplied audio and reports its measured duration.

The subtitle layer is independent from slide text. For v1, each non-empty segment subtitle is shown during its segment, with line wrapping and a safe bottom region. English text remains English, including apostrophes and spelling such as `patients'`, `blood pressure`, and `checked`.

## Validation and error handling

Validation runs before any video render. It returns structured errors containing the source file, JSON path, and message. The CLI exits non-zero and does not produce a partial video when validation fails.

Render failures include:

- Missing required question content.
- Missing required MP3 or invalid audio duration.
- Missing stage or duplicate stage.
- `questionId` mismatch.
- Invalid event action or unknown event target.
- Event outside the measured segment range.
- S/V/O or answer visibility violating stage rules.
- Severe text overflow.
- A final answer that does not match the passive data without an explicit override.

Warnings include:

- Declared duration differs from measured audio duration.
- Missing optional agent or adverb.
- Font size reaches the minimum threshold.
- THINK duration is unusually short.

The manifest records warnings and the measured total duration. Metadata mismatches never replace measured audio duration as the clock.

## CLI and output contract

The initial commands are:

```text
npm run validate -- --input input/Q01
npm run render -- --input input/Q01 --output output/Q01
```

Successful output is:

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

`video.mp4` must be H.264, `1920x1080`, `30fps`, and include the four supplied audio segments. `timeline_resolved.json` contains stage boundaries, measured durations, and global event times. `render_manifest.json` contains at least:

```json
{
  "questionId": "Q01",
  "duration": 63.6,
  "fps": 30,
  "resolution": "1920x1080",
  "audioSegments": 4,
  "visualEvents": 22,
  "warnings": []
}
```

The exact Remotion packages are installed together, including the Windows compositor package that supplies the platform `ffmpeg.exe` and `ffprobe.exe`. Rendering therefore does not require a system-wide `ffmpeg` executable. The implementation will verify the packaged binary setup with a real MP4 smoke render and will use Remotion's default binary resolution unless an explicit `binariesDirectory` override is needed.

## Testing strategy

Implementation follows red-green-refactor cycles.

Unit tests cover:

- Parsing and validating valid and invalid question data.
- Requiring all five stages and the correct audio/null rules.
- Resolving stage boundaries from measured durations.
- Rejecting out-of-range events and unknown IDs.
- Mapping actions to the correct animation preset.
- Enforcing stage visibility rules.
- Fitting text and reporting overflow at the configured thresholds.
- Building subtitle cues and preserving English spelling.

Integration tests use a Q01 fixture to verify resolved timeline and manifest values. A render smoke test verifies that the local Remotion pipeline produces an MP4 with the required resolution, frame rate, duration, and audio stream. The test fixture will use supplied test audio files and will not call TTS.

## Reuse and extension

Q02-Q10 reuse the same composition and component tree. A new question package changes only `question.json`, `voice.json`, `timeline.json`, and MP3 files. The passive voice module owns grammar-specific scene semantics; the core engine remains grammar-agnostic.

Once v1 is stable, the core timeline, audio, subtitle, animation, typography, layout, and render utilities can support additional question-type modules without moving grammar logic into the core.

## Design review checklist

- Voice is the master clock: satisfied.
- Content, layout, timeline, and animation style are separate: satisfied.
- Five fixed stages and stable IDs are preserved: satisfied.
- Q02-Q10 require data changes only: satisfied.
- Output and automatic QA artifacts are defined: satisfied.
- No TTS, ASR, cloud rendering, or responsive layout is included: satisfied.
- Current workspace limitation (no Git repository) is documented: satisfied.
