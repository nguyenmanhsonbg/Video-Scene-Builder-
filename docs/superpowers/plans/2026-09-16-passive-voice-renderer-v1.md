# Passive Voice Renderer v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local TypeScript/React/Remotion CLI that consumes one passive-voice question package with supplied MP3 files and exports a validated 1920x1080 H.264 MP4 with resolved timeline, manifest, subtitles, and stage previews.

**Architecture:** Keep content, voice metadata, timeline, animation presets, layout, and rendering as separate boundaries. The CLI validates the package, measures actual MP3 durations, resolves relative events to global times, passes immutable render props to a deterministic Remotion composition, and writes all output artifacts only after validation succeeds.

**Tech Stack:** Node.js 24+, TypeScript, React, Remotion, `@remotion/cli`, `@remotion/bundler`, `@remotion/renderer`, `@remotion/media`, Zod, `music-metadata`, Vitest, and `tsx`. Remotion's server-side `renderMedia()` API is used for MP4 rendering and `renderStill()` for stage previews; the exact Windows compositor package supplies FFmpeg binaries because the current machine has no system `ffmpeg` command. See the official [renderer API](https://www.remotion.dev/docs/renderer) and [audio API](https://www.remotion.dev/docs/audio).

**Spec:** `docs/superpowers/specs/2026-09-16-passive-voice-renderer-design.md`, based on `PASSIVE_VOICE_RENDERER_APP_SPEC_v1.md`.

## Global Constraints

- Version 1 supports only `Active sentence -> Present Simple Passive`.
- The fixed stages are `QUESTION`, `THINK`, `IDENTIFY_SVO`, `TRANSFORM`, and `FINAL_ANSWER`.
- Voice is the master clock; actual measured audio duration overrides declared metadata duration.
- `THINK` has no audio and uses its configured duration.
- Timeline events use relative seconds and must satisfy `0 <= event.at <= measured segment duration`.
- Canvas is `1920x1080`, `16:9`, `30fps`, with background `#FFFFFF`.
- Theme tokens are `#111111`, `#FFFFFF`, `#D8B07A`, `#0E2B47`, `#FF2A2A`, `#B8C9F0`, `#BDBDBD`, and `#7EC0FF`.
- Title typography is bold serif; body and English sentence typography use `Be Vietnam Pro`, falling back to `Inter` and `Arial`.
- Active sentence tokens must remain separate elements: subject, adverb, verb, and object.
- Animation is deterministic and action-to-preset mapping is fixed; runtime AI does not choose animation.
- Unknown event targets, invalid actions, missing required audio, invalid durations, and severe text overflow fail validation without producing a partial MP4.
- Rendering uses the platform FFmpeg/FFprobe binaries supplied by the exact Remotion compositor package; no system-wide `ffmpeg` command is required.
- Output must include `video.mp4`, `timeline_resolved.json`, `render_manifest.json`, and `preview/` stage stills.
- Q02-Q10 must change only question data, voice files, and timeline cues; the renderer core and component tree remain reusable.
- The app consumes pre-generated MP3 files and never calls TTS.

---

## File map

The implementation will create this focused structure:

```text
package.json
tsconfig.json
vitest.config.ts
remotion.config.ts
.gitignore

src/
├── Root.tsx
├── index.ts
├── cli/
│   ├── main.ts
│   └── args.ts
├── core/
│   ├── domain/types.ts
│   ├── schema/
│   │   ├── question.ts
│   │   ├── voice.ts
│   │   ├── timeline.ts
│   │   └── loadInputPackage.ts
│   ├── audio/
│   │   ├── inspectAudio.ts
│   │   └── stageAudio.ts
│   ├── timeline/
│   │   ├── resolveTimeline.ts
│   │   └── validateTimeline.ts
│   ├── animation/
│   │   ├── presets.ts
│   │   ├── mapActionToPreset.ts
│   │   └── interpolate.ts
│   ├── layout/
│   │   ├── measureText.ts
│   │   └── fitText.ts
│   ├── subtitles/
│   │   └── subtitleCues.ts
│   └── qa/
│       ├── validationError.ts
│       └── manifest.ts
├── components/
│   ├── Text.tsx
│   ├── Underline.tsx
│   ├── Highlight.tsx
│   ├── Arrow.tsx
│   ├── AnswerBar.tsx
│   └── GrammarRule.tsx
├── question-types/passive-voice/
│   ├── defaults.ts
│   ├── layout.ts
│   ├── sceneState.ts
│   ├── sceneState.test.ts
│   ├── ActiveSentence.tsx
│   ├── SVOAnalysis.tsx
│   ├── Transformation.tsx
│   ├── FinalAnswer.tsx
│   └── PassiveVoiceScene.tsx
└── render/
    ├── renderQuestion.ts
    ├── renderPreview.ts
    └── renderComposition.tsx

tests/
├── fixtures/Q01/
│   ├── question.json
│   ├── voice.json
│   └── timeline.json
├── helpers/q01Fixture.ts
├── core/
├── question-types/
└── render/

docs/input-format.md
README.md
```

Each file has one responsibility. Pure timeline, animation, layout, subtitle, and scene-state functions are kept independent from Remotion so they can be tested without launching Chromium.

---

### Task 1: Bootstrap the TypeScript and Remotion project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `remotion.config.ts`
- Create: `.gitignore`
- Create: `src/index.ts`
- Create: `src/Root.tsx`
- Test: `tests/bootstrap/root.test.ts`

**Interfaces:**
- Produces `ROOT_COMPOSITION_ID = "PassiveVoice"` and a minimal Remotion root that later tasks extend.
- Produces npm scripts `test`, `typecheck`, `validate`, `render`, and `preview`.

- [ ] **Step 1: Create the project package manifest and scripts**

Create the manifest with the scripts below, then install exact dependency versions. Do not commit floating dependency ranges.

```json
{
  "name": "passive-voice-renderer",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "studio": "remotion studio src/index.ts",
    "validate": "tsx src/cli/main.ts validate",
    "render": "tsx src/cli/main.ts render",
    "preview": "tsx src/cli/main.ts preview"
  }
}
```

Install exact versions with PowerShell commands:

```powershell
$remotionVersion = (npm view remotion version).Trim()
npm install --save-exact "remotion@$remotionVersion" "@remotion/cli@$remotionVersion" "@remotion/bundler@$remotionVersion" "@remotion/renderer@$remotionVersion" "@remotion/media@$remotionVersion"
npm install --save-exact music-metadata react react-dom zod
npm install --save-dev --save-exact '@types/node' '@types/react' '@types/react-dom' tsx typescript vitest
```

All `remotion` and `@remotion/*` packages must use the same exact version emitted by `npm view`. The generated `package-lock.json` is the reproducible dependency record.

- [ ] **Step 2: Add TypeScript, Vitest, and Remotion configuration**

Use strict TypeScript and Node ESM resolution:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "types": ["node", "vitest/globals"]
  },
  "include": ["src", "tests", "vitest.config.ts"]
}
```

Configure Vitest with Node environment and Remotion with the fixed 30fps output defaults. Add `.render/`, `output/`, `dist/`, `node_modules/`, and generated fixture audio to `.gitignore`.

- [ ] **Step 3: Write the failing bootstrap test**

```ts
import {describe, expect, it} from 'vitest';
import {ROOT_COMPOSITION_ID, createRoot} from '../../src/Root.js';

describe('Remotion bootstrap', () => {
  it('exposes the passive voice composition id and root factory', () => {
    expect(ROOT_COMPOSITION_ID).toBe('PassiveVoice');
    expect(createRoot()).toBeDefined();
  });
});
```

- [ ] **Step 4: Run the test to verify it fails for the missing module**

Run: `npm test -- tests/bootstrap/root.test.ts`

Expected: FAIL because `src/Root.tsx` does not exist yet.

- [ ] **Step 5: Implement the minimal root and entry point**

```tsx
// src/Root.tsx
import React from 'react';
import {Composition, Folder} from 'remotion';

export const ROOT_COMPOSITION_ID = 'PassiveVoice';

export const createRoot = () => (
  <Folder name="Passive Voice">
    <Composition
      id={ROOT_COMPOSITION_ID}
      component={() => <div />}
      durationInFrames={1}
      fps={30}
      width={1920}
      height={1080}
    />
  </Folder>
);
```

```tsx
// src/index.ts
import {registerRoot} from 'remotion';
import {createRoot} from './Root.js';

registerRoot(createRoot);
```

- [ ] **Step 6: Run the test and typecheck**

Run: `npm test -- tests/bootstrap/root.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS with no TypeScript errors.

- [ ] **Step 7: Install dependencies and verify packaged FFmpeg binaries**

Run: `npm install`, then verify the exact platform compositor package and its binaries:

```powershell
npm ls @remotion/compositor-win32-x64-msvc --depth=0
Test-Path 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe'
Test-Path 'node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe'
```

Expected: npm install succeeds, the package is present, and both paths return `True`. `renderMedia()` and `renderStill()` must rely on Remotion's packaged binary resolution; do not import nonexistent `ensureFfmpeg` or `ensureFfprobe` exports.

- [ ] **Step 8: Record a checkpoint**

If a Git repository is later initialized, commit:

```text
chore: bootstrap passive voice renderer
```

If the workspace remains non-Git, keep the files and record the checkpoint in the implementation handoff.

---

### Task 2: Define and validate the input contracts

**Files:**
- Create: `src/core/domain/types.ts`
- Create: `src/core/schema/question.ts`
- Create: `src/core/schema/voice.ts`
- Create: `src/core/schema/timeline.ts`
- Create: `src/core/schema/loadInputPackage.ts`
- Create: `src/core/qa/validationError.ts`
- Create: `tests/fixtures/Q01/question.json`
- Create: `tests/fixtures/Q01/voice.json`
- Create: `tests/fixtures/Q01/timeline.json`
- Create: `tests/helpers/q01Fixture.ts`
- Test: `tests/core/schema.test.ts`

**Interfaces:**
- Produces `loadInputPackage(inputDir: string): Promise<InputPackage>`.
- Produces `parseQuestion`, `parseVoice`, and `parseTimeline` with Zod-backed runtime validation.
- Produces the types `PassiveVoiceQuestion`, `VoiceSegmentId`, `VoiceSegment`, `VoiceManifest`, `VisualAction`, `VisualEvent`, `TimelineInput`, and `InputPackage`.

- [ ] **Step 1: Add the valid Q01 fixture data**

Use the exact Q01 content from the approved spec. Use paths relative to the package root, `audio/Q01_*.mp3`, and segment-level subtitles. Keep `THINK` audio as `null` and duration `4.0`. The fixture may not reference files outside `tests/fixtures/Q01`.

Add the shared typed fixture loader so later tests do not rely on undeclared variables:

```ts
// tests/helpers/q01Fixture.ts
import {loadInputPackage} from '../../src/core/schema/loadInputPackage.js';

export const readQ01Package = () => loadInputPackage('tests/fixtures/Q01');
```

- [ ] **Step 2: Write the failing schema tests**

```ts
import {describe, expect, it} from 'vitest';
import {parseQuestion, parseVoice, parseTimeline} from '../../src/core/schema/loadInputPackage.js';
import {readFile} from 'node:fs/promises';

const fixture = async (name: string) =>
  JSON.parse(await readFile(`tests/fixtures/Q01/${name}`, 'utf8')) as unknown;

describe('input schemas', () => {
  it('accepts the complete Q01 question package documents', async () => {
    await expect(parseQuestion(await fixture('question.json'))).resolves.toMatchObject({
      questionId: 'Q01',
      active: {subject: 'Doctors', verb: 'check', object: "patients' blood pressure"},
    });
    await expect(parseVoice(await fixture('voice.json'))).resolves.toMatchObject({questionId: 'Q01'});
    await expect(parseTimeline(await fixture('timeline.json'))).resolves.toMatchObject({questionId: 'Q01'});
  });

  it('rejects a question without an object', async () => {
    const question = await fixture('question.json') as Record<string, unknown>;
    const active = {...question.active as Record<string, unknown>};
    delete active.object;
    await expect(parseQuestion({...question, active})).rejects.toThrow(/object/i);
  });

  it('rejects a voice manifest missing one of the five stages', async () => {
    const voice = await fixture('voice.json') as {segments: unknown[]; questionId: string};
    await expect(parseVoice({...voice, segments: voice.segments.slice(1)})).rejects.toThrow(/stage/i);
  });

  it('requires THINK to be silent and every other stage to have audio', async () => {
    const voice = await fixture('voice.json') as {segments: Array<Record<string, unknown>>; questionId: string};
    const invalid = voice.segments.map((segment) =>
      segment.id === 'THINK' ? {...segment, audio: 'audio/think.mp3'} : segment,
    );
    await expect(parseVoice({...voice, segments: invalid})).rejects.toThrow(/THINK|audio/i);
  });
});
```

- [ ] **Step 3: Run the schema tests to verify the expected failures**

Run: `npm test -- tests/core/schema.test.ts`

Expected: FAIL because the parser modules do not exist.

- [ ] **Step 4: Implement the domain types and schemas**

Use literal unions for stage IDs and actions. Define `subtitle` as `string | null`; require it for audio-backed stages and require `null` for `THINK`. Define `duration` as a finite positive number. Keep all question content independent of coordinates and timing.

The parser must report the source document and Zod issue path through `ValidationError`, rather than returning `any` or silently dropping unknown data.

- [ ] **Step 5: Implement `loadInputPackage`**

Read exactly `question.json`, `voice.json`, and `timeline.json` from `inputDir`, parse them with the schemas, verify their `questionId` values match, and return:

```ts
export type InputPackage = {
  inputDir: string;
  question: PassiveVoiceQuestion;
  voice: VoiceManifest;
  timeline: TimelineInput;
};
```

Missing files must produce a named validation error that includes the expected path.

- [ ] **Step 6: Run the schema tests and typecheck**

Run: `npm test -- tests/core/schema.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Record a checkpoint**

Commit message if Git is available:

```text
feat: add passive voice input schemas
```

---

### Task 3: Inspect audio and resolve the voice-first timeline

**Files:**
- Create: `src/core/audio/inspectAudio.ts`
- Create: `src/core/timeline/resolveTimeline.ts`
- Create: `src/core/timeline/validateTimeline.ts`
- Create: `tests/helpers/resolvedQ01Fixture.ts`
- Create: `tests/core/timeline.test.ts`

**Interfaces:**
- Produces `AudioDurationReader` and `inspectAudioDurations(voice, inputDir, reader?)`.
- Produces `resolveTimeline(voice, timeline, measuredDurations): ResolvedTimeline`.
- Produces `validateTimeline(resolvedTimeline, allowedElementIds): void`.

- [ ] **Step 1: Write failing timeline tests**

```ts
import {describe, expect, it} from 'vitest';
import {resolveTimeline} from '../../src/core/timeline/resolveTimeline.js';
import {readQ01Package} from '../helpers/q01Fixture.js';
import type {MeasuredDurations} from '../../src/core/audio/inspectAudio.js';
import type {TimelineInput} from '../../src/core/domain/types.js';

const durations: MeasuredDurations = {
  QUESTION: 6.21,
  THINK: 4,
  IDENTIFY_SVO: 17.84,
  TRANSFORM: 25.13,
  FINAL_ANSWER: 10.42,
};

it('uses measured durations to calculate contiguous stage boundaries and global event times', async () => {
  const {voice, timeline} = await readQ01Package();
  const result = resolveTimeline(voice, timeline, durations);
  expect(result.totalDuration).toBeCloseTo(63.6);
  expect(result.stages.IDENTIFY_SVO.start).toBeCloseTo(10.21);
  const subjectEvent = result.events.find((event) => event.target === 'underline_subject');
  expect(subjectEvent?.globalAt).toBeCloseTo(13.41);
});

it('rejects an event beyond the measured segment duration', async () => {
  const {voice, timeline} = await readQ01Package();
  const invalidTimeline: TimelineInput = {
    ...timeline,
    segments: timeline.segments.map((segment) =>
      segment.segment === 'IDENTIFY_SVO'
        ? {
            ...segment,
            events: segment.events.map((event, index) =>
              index === 0 ? {...event, at: 17.85} : event,
            ),
          }
        : segment,
    ),
  };
  expect(() => resolveTimeline(voice, invalidTimeline, durations))
    .toThrow(/IDENTIFY_SVO|duration|range/i);
});
```

- [ ] **Step 2: Run the timeline tests to verify they fail**

Run: `npm test -- tests/core/timeline.test.ts`

Expected: FAIL because the resolver does not exist.

- [ ] **Step 3: Implement audio duration inspection**

Define:

```ts
export type AudioDurationReader = (absolutePath: string) => Promise<number>;

export type MeasuredDurations = Record<VoiceSegmentId, number>;

export async function inspectAudioDurations(
  voice: VoiceManifest,
  inputDir: string,
  reader: AudioDurationReader = readMp3Duration,
): Promise<{durations: MeasuredDurations; warnings: string[]}>;
```

`readMp3Duration` uses `music-metadata` to read the actual MP3 duration. Resolve paths against `inputDir`, reject paths that escape the package directory, require every audio-backed duration to be positive, and compare declared versus measured duration. Use the measured value and add a warning when they differ by more than `0.05` seconds.

`THINK` uses its declared duration and does not call the reader.

- [ ] **Step 4: Implement pure stage and event resolution**

Create `ResolvedStage` and `ResolvedEvent` types:

```ts
export type ResolvedStage = {
  id: VoiceSegmentId;
  start: number;
  end: number;
  duration: number;
};

export type ResolvedEvent = VisualEvent & {
  segment: VoiceSegmentId;
  globalAt: number;
};

export type ResolvedTimeline = {
  stages: Record<VoiceSegmentId, ResolvedStage>;
  events: ResolvedEvent[];
  totalDuration: number;
};
```

Calculate starts cumulatively in the fixed stage order. Validate relative event range before adding the segment start. Preserve event order for equal timestamps by source order. Do not map animation presets here; the animation/state layer performs that mapping after timeline resolution.

Create the resolved Q01 test helper:

```ts
// tests/helpers/resolvedQ01Fixture.ts
import {readQ01Package} from './q01Fixture.js';
import {resolveTimeline} from '../../src/core/timeline/resolveTimeline.js';

export const Q01_MEASURED_DURATIONS = {
  QUESTION: 6.21,
  THINK: 4,
  IDENTIFY_SVO: 17.84,
  TRANSFORM: 25.13,
  FINAL_ANSWER: 10.42,
} as const;

export async function readResolvedQ01Fixture() {
  const input = await readQ01Package();
  return {
    ...input,
    resolvedTimeline: resolveTimeline(input.voice, input.timeline, Q01_MEASURED_DURATIONS),
  };
}
```

- [ ] **Step 5: Implement timeline validation**

Validate that every event target is in the Element ID Contract, every action is supported, every stage exists, and final-answer/marker visibility constraints are satisfied. Do not clamp or reorder invalid events.

- [ ] **Step 6: Run tests and typecheck**

Run: `npm test -- tests/core/timeline.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Record a checkpoint**

Commit message if Git is available:

```text
feat: resolve voice-first visual timeline
```

---

### Task 4: Add deterministic animation presets and interpolation

**Files:**
- Create: `src/core/animation/presets.ts`
- Create: `src/core/animation/mapActionToPreset.ts`
- Create: `src/core/animation/interpolate.ts`
- Test: `tests/core/animation.test.ts`

**Interfaces:**
- Produces `ANIMATION_PRESETS` with the exact v1 durations.
- Produces `animationPresetFor(action: VisualAction): AnimationPreset`.
- Produces `progressAt(time, start, duration): number`.

- [ ] **Step 1: Write failing mapping and progress tests**

```ts
import {describe, expect, it} from 'vitest';
import {animationPresetFor} from '../../src/core/animation/mapActionToPreset.js';
import {progressAt} from '../../src/core/animation/interpolate.js';

describe('animation grammar', () => {
  it('maps each supported action to its fixed preset', () => {
    expect(animationPresetFor('SHOW')).toBe('FADE_IN');
    expect(animationPresetFor('REVEAL_UNDERLINE')).toBe('UNDERLINE_REVEAL');
    expect(animationPresetFor('REVEAL_OUTLINE')).toBe('OUTLINE_REVEAL');
    expect(animationPresetFor('HIGHLIGHT')).toBe('HIGHLIGHT');
    expect(animationPresetFor('MOVE_OBJECT')).toBe('MOVE_TO');
    expect(animationPresetFor('CHANGE_VERB')).toBe('REPLACE');
    expect(animationPresetFor('BUILD')).toBe('BUILD_TOKEN');
  });

  it('returns a clamped deterministic progress value', () => {
    expect(progressAt(1, 0, 2)).toBe(0.5);
    expect(progressAt(-1, 0, 2)).toBe(0);
    expect(progressAt(3, 0, 2)).toBe(1);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- tests/core/animation.test.ts`

Expected: FAIL because the animation modules do not exist.

- [ ] **Step 3: Implement the preset table and mapping**

Use these exact defaults:

```ts
export const ANIMATION_PRESETS = {
  APPEAR: {duration: 0},
  FADE_IN: {duration: 0.3},
  FADE_UP: {duration: 0.35},
  UNDERLINE_REVEAL: {duration: 0.35},
  HIGHLIGHT: {duration: 0.25},
  OUTLINE_REVEAL: {duration: 0.35},
  MOVE_TO: {duration: 0.55},
  REPLACE: {duration: 0.35},
  BUILD_TOKEN: {duration: 0.25},
} as const;
```

Map actions with an exhaustive `switch`. Throw for an action outside the union rather than adding an implicit animation.

- [ ] **Step 4: Implement interpolation helpers**

Keep `progressAt` pure, finite, and clamped. Add `opacityAt`, `scaleAt`, and `translateXAt` only when a component needs them; all helpers must call `progressAt` and use no randomness.

- [ ] **Step 5: Run tests and typecheck**

Run: `npm test -- tests/core/animation.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Record a checkpoint**

Commit message if Git is available:

```text
feat: add deterministic animation grammar
```

---

### Task 5: Implement text measurement and overflow fitting

**Files:**
- Create: `src/core/layout/measureText.ts`
- Create: `src/core/layout/fitText.ts`
- Test: `tests/core/layout.test.ts`

**Interfaces:**
- Produces `TextMeasurer` and the real Remotion/browser measurement adapter.
- Produces `fitTokenRow(tokens, constraints, measure): FitResult`.

- [ ] **Step 1: Write failing layout tests**

```ts
import {describe, expect, it} from 'vitest';
import {fitTokenRow} from '../../src/core/layout/fitText.js';

const measure = (text: string, style: {fontSize: number}) =>
  text.length * style.fontSize * 0.5;

it('reduces gaps before reducing font size', () => {
  const result = fitTokenRow(
    [{id: 'subject', text: 'Doctors'}, {id: 'object', text: "patients' blood pressure"}],
    {width: 900, gap: 80, minGap: 20, fontSize: 56, minFontSize: 34},
    measure,
  );
  expect(result.layout.gap).toBe(20);
  expect(result.layout.fontSize).toBe(56);
  expect(result.overflow).toBe(false);
});

it('uses two lines when the minimum font cannot fit', () => {
  const result = fitTokenRow(
    [{id: 'object', text: "patients' blood pressure with a longer phrase"}],
    {width: 700, gap: 32, minGap: 16, fontSize: 56, minFontSize: 34},
    measure,
  );
  expect(result.layout.mode).toBe('two-line');
});

it('reports severe overflow instead of cutting text', () => {
  const result = fitTokenRow(
    [{id: 'object', text: 'A very long object that cannot fit'}],
    {width: 100, gap: 16, minGap: 8, fontSize: 56, minFontSize: 34},
    measure,
  );
  expect(result.overflow).toBe(true);
  expect(result.text).toContain('A very long object');
});
```

- [ ] **Step 2: Run the layout tests to verify they fail**

Run: `npm test -- tests/core/layout.test.ts`

Expected: FAIL because the fitting module does not exist.

- [ ] **Step 3: Implement the measurable layout contract**

```ts
export type TextStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  letterSpacing?: number;
};

export type TextMeasurer = (text: string, style: TextStyle) => number;

export type FitResult = {
  text: string;
  overflow: boolean;
  layout: {
    mode: 'single-line' | 'two-line';
    gap: number;
    fontSize: number;
  };
};
```

The real adapter must use actual font metrics available to the Remotion browser context, not character-count estimates. The pure fitter must follow the exact order: reduce gap, reduce font size to the threshold, switch to two-line, then report overflow. Never truncate text.

- [ ] **Step 4: Run tests and typecheck**

Run: `npm test -- tests/core/layout.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Record a checkpoint**

Commit message if Git is available:

```text
feat: add deterministic text fitting
```

---

### Task 6: Build passive-voice scene state and subtitle helpers

**Files:**
- Create: `src/question-types/passive-voice/defaults.ts`
- Create: `src/question-types/passive-voice/layout.ts`
- Create: `src/question-types/passive-voice/sceneState.ts`
- Create: `src/core/subtitles/subtitleCues.ts`
- Test: `src/question-types/passive-voice/sceneState.test.ts`
- Test: `tests/core/subtitles.test.ts`

**Interfaces:**
- Produces `PASSIVE_VOICE_ELEMENT_IDS` and fixed layout geometry.
- Produces `getPassiveVoiceSceneState(question, timeline, time): PassiveVoiceSceneState`.
- Produces `buildSubtitleCues(voice, timeline): SubtitleCue[]`.

- [ ] **Step 1: Write failing scene-state tests**

```ts
import {describe, expect, it} from 'vitest';
import {getPassiveVoiceSceneState} from './sceneState.js';
import {readResolvedQ01Fixture} from '../../../tests/helpers/resolvedQ01Fixture.js';

it('keeps S/V/O hidden during QUESTION and THINK', async () => {
  const {question, resolvedTimeline} = await readResolvedQ01Fixture();
  expect(getPassiveVoiceSceneState(question, resolvedTimeline, 2).labelS.visible).toBe(false);
  expect(getPassiveVoiceSceneState(question, resolvedTimeline, 8).labelS.visible).toBe(false);
});

it('reveals the subject marker after its resolved event', async () => {
  const {question, resolvedTimeline} = await readResolvedQ01Fixture();
  expect(getPassiveVoiceSceneState(question, resolvedTimeline, 13.3).labelS.visible).toBe(false);
  expect(getPassiveVoiceSceneState(question, resolvedTimeline, 13.6).labelS.visible).toBe(true);
});

it('never reveals the answer before FINAL_ANSWER starts', async () => {
  const {question, resolvedTimeline} = await readResolvedQ01Fixture();
  expect(getPassiveVoiceSceneState(question, resolvedTimeline, 53.17).answer.visible).toBe(false);
  expect(getPassiveVoiceSceneState(question, resolvedTimeline, 53.18).answer.visible).toBe(true);
});
```

- [ ] **Step 2: Write failing subtitle tests**

```ts
import {expect, it} from 'vitest';
import {buildSubtitleCues} from '../../src/core/subtitles/subtitleCues.js';
import {readResolvedQ01Fixture} from '../../tests/helpers/resolvedQ01Fixture.js';

it('converts non-empty segment subtitles into global cues', async () => {
  const {voice, resolvedTimeline} = await readResolvedQ01Fixture();
  const cues = buildSubtitleCues(voice, resolvedTimeline);
  expect(cues[0]).toMatchObject({start: 0, end: 6.21});
  expect(cues.find((cue) => cue.text.includes("patients'"))).toBeDefined();
});

it('does not create a subtitle cue for THINK', async () => {
  const {voice, resolvedTimeline} = await readResolvedQ01Fixture();
  const cues = buildSubtitleCues(voice, resolvedTimeline);
  expect(cues.some((cue) => cue.stage === 'THINK')).toBe(false);
});
```

- [ ] **Step 3: Run both tests to verify they fail**

Run: `npm test -- src/question-types/passive-voice/sceneState.test.ts tests/core/subtitles.test.ts`

Expected: FAIL because the state and subtitle modules do not exist.

- [ ] **Step 4: Implement fixed theme/layout defaults and scene state**

Define geometry for header, active sentence, S/V/O region, transformation, answer bar, grammar rule, and subtitle safe region. Keep the geometry in `layout.ts`; do not place coordinates in `question.json`.

`PassiveVoiceSceneState` must expose visibility and animation values for the stable element IDs. It must derive stage from resolved global time, apply all events up to the current time, and keep final-answer elements hidden before `FINAL_ANSWER.start` even if malformed input attempts to show them.

- [ ] **Step 5: Implement subtitle cue construction**

```ts
export type SubtitleCue = {
  stage: VoiceSegmentId;
  start: number;
  end: number;
  text: string;
};
```

Build one global cue per non-empty segment subtitle. Use the resolved stage boundary. Preserve every character in the supplied subtitle text; do not translate or autocorrect it.

- [ ] **Step 6: Run tests and typecheck**

Run: `npm test -- src/question-types/passive-voice/sceneState.test.ts tests/core/subtitles.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Record a checkpoint**

Commit message if Git is available:

```text
feat: add passive voice scene state and subtitles
```

---

### Task 7: Implement the reusable visual primitives and passive-voice components

**Files:**
- Create: `src/components/Text.tsx`
- Create: `src/components/Underline.tsx`
- Create: `src/components/Highlight.tsx`
- Create: `src/components/Arrow.tsx`
- Create: `src/components/AnswerBar.tsx`
- Create: `src/components/GrammarRule.tsx`
- Create: `src/question-types/passive-voice/ActiveSentence.tsx`
- Create: `src/question-types/passive-voice/SVOAnalysis.tsx`
- Create: `src/question-types/passive-voice/Transformation.tsx`
- Create: `src/question-types/passive-voice/FinalAnswer.tsx`
- Test: `tests/question-types/passive-voice/components.test.tsx`

**Interfaces:**
- Components accept explicit props and render `data-element-id` equal to the stable Element ID Contract.
- `ActiveSentence` accepts separate token strings and never joins them into one animated node.
- `Transformation` accepts passive data and scene state; grammar logic stays in the passive-voice module.

- [ ] **Step 1: Write failing component contract tests**

```tsx
import {renderToStaticMarkup} from 'react-dom/server';
import {expect, it} from 'vitest';
import {ActiveSentence} from '../../../src/question-types/passive-voice/ActiveSentence.js';

it('renders four independently addressable active sentence tokens', () => {
  const html = renderToStaticMarkup(
    <ActiveSentence subject="Doctors" adverb="often" verb="check" object="patients' blood pressure" />,
  );
  expect(html).toContain('data-element-id="active_subject"');
  expect(html).toContain('data-element-id="active_adverb"');
  expect(html).toContain('data-element-id="active_verb"');
  expect(html).toContain('data-element-id="active_object"');
});

it('renders answer as separate box and text IDs', () => {
  const html = renderToStaticMarkup(
    <FinalAnswer answer="Patients' blood pressure is often checked by doctors." visible />,
  );
  expect(html).toContain('data-element-id="answer_box"');
  expect(html).toContain('data-element-id="answer_text"');
});
```

- [ ] **Step 2: Run the component tests to verify they fail**

Run: `npm test -- tests/question-types/passive-voice/components.test.tsx`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement primitives with fixed theme tokens**

Use `AbsoluteFill`/positioned `<div>` elements and inline style objects derived from the fixed layout. Every animated or addressable element carries `data-element-id`. Use `Be Vietnam Pro`, `Inter`, and `Arial` fallbacks for body and English text, and a bold serif stack for the title.

Implement `Underline`, `Highlight`, `Arrow`, `AnswerBar`, and `GrammarRule` as presentational components. They must not read question JSON or timeline files.

- [ ] **Step 4: Implement passive-voice components**

`ActiveSentence` renders subject, adverb, verb, and object separately. `SVOAnalysis` renders independent underline/outline and label elements. `Transformation` renders Object -> Passive Subject, singular -> is, check -> checked, build tokens, adverb, and agent. `FinalAnswer` renders the answer bar/text and grammar rule.

Use `question.passive` and `question.grammar` values directly. Do not reconstruct or silently alter the final answer string.

- [ ] **Step 5: Run tests and typecheck**

Run: `npm test -- tests/question-types/passive-voice/components.test.tsx`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Record a checkpoint**

Commit message if Git is available:

```text
feat: add passive voice visual components
```

---

### Task 8: Assemble the deterministic Remotion composition with audio and subtitles

**Files:**
- Modify: `src/Root.tsx`
- Create: `src/render/renderComposition.tsx`
- Create: `src/question-types/passive-voice/PassiveVoiceScene.tsx`
- Create: `src/core/audio/stageAudio.ts`
- Create: `src/core/subtitles/SubtitleLayer.tsx`
- Test: `tests/render/composition-props.test.ts`

**Interfaces:**
- Produces `RenderCompositionProps` containing question, resolved timeline, voice, subtitles, and staged asset paths.
- Produces a composition with dynamic duration from `ResolvedTimeline.totalDuration`.
- Produces `getAudioSequences(voice, resolvedTimeline, assets)` for the four audio-backed stages.

- [ ] **Step 1: Write failing composition prop and audio sequence tests**

```ts
import {expect, it} from 'vitest';
import {getAudioSequences} from '../../src/core/audio/stageAudio.js';
import {readResolvedQ01Fixture} from '../../tests/helpers/resolvedQ01Fixture.js';

it('places four audio segments at resolved global starts and leaves THINK silent', async () => {
  const {voice, resolvedTimeline} = await readResolvedQ01Fixture();
  const sequences = getAudioSequences(voice, resolvedTimeline, {
    QUESTION: 'audio/Q01_01_question.mp3',
    IDENTIFY_SVO: 'audio/Q01_02_svo.mp3',
    TRANSFORM: 'audio/Q01_03_transform.mp3',
    FINAL_ANSWER: 'audio/Q01_04_answer.mp3',
  });
  expect(sequences).toHaveLength(4);
  expect(sequences.find((item) => item.stage === 'IDENTIFY_SVO')).toMatchObject({start: 10.21});
  expect(sequences.some((item) => item.stage === 'THINK')).toBe(false);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/render/composition-props.test.ts`

Expected: FAIL because the audio sequence module does not exist.

- [ ] **Step 3: Implement audio sequence calculation**

Convert seconds to frames using the composition FPS and preserve each stage's measured duration. Return only the four audio-backed stages. The composition will render each sequence with Remotion's audio component and a staged asset path; no pre-concatenated audio file is created.

- [ ] **Step 4: Implement `PassiveVoiceScene`**

Use `useCurrentFrame()` and `useVideoConfig()` to derive `time = frame / fps`. Pass `time` to `getPassiveVoiceSceneState`. Render the fixed header, decorations, active sentence, SVO analysis, transformation, final answer, grammar rule, subtitle layer, and audio sequences.

The scene must use the same `questionId`, resolved timeline, measured durations, and asset paths for preview and MP4 rendering. No component may read wall-clock time, random values, or browser playback position.

- [ ] **Step 5: Register a dynamic composition**

Replace the bootstrap composition with a composition whose `calculateMetadata` derives `durationInFrames` from `resolvedTimeline.totalDuration * 30`, rounded up once at the composition boundary. Keep width `1920`, height `1080`, and fps `30` fixed.

- [ ] **Step 6: Run tests and typecheck**

Run: `npm test -- tests/render/composition-props.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Record a checkpoint**

Commit message if Git is available:

```text
feat: assemble deterministic Remotion composition
```

---

### Task 9: Implement render orchestration and QA artifacts

**Files:**
- Create: `src/render/renderQuestion.ts`
- Create: `src/render/renderPreview.ts`
- Create: `src/core/qa/manifest.ts`
- Modify: `src/Root.tsx`
- Test: `tests/render/renderQuestion.test.ts`

**Interfaces:**
- Produces `renderQuestion({inputDir, outputDir}): Promise<RenderResult>`.
- Produces `renderPreview({outputDir, renderProps}): Promise<string[]>`.
- Produces `createRenderManifest(input, resolvedTimeline, warnings): RenderManifest`.

- [ ] **Step 1: Write failing orchestration tests with injected adapters**

```ts
import {expect, it} from 'vitest';
import {renderQuestion} from '../../src/render/renderQuestion.js';

it('validates, resolves, and writes timeline and manifest before invoking the renderer', async () => {
  const calls: string[] = [];
  const result = await renderQuestion({
    inputDir: 'tests/fixtures/Q01',
    outputDir: 'tests/tmp/Q01',
    adapters: {
      inspectAudio: async () => ({
        durations: {QUESTION: 6.21, THINK: 4, IDENTIFY_SVO: 17.84, TRANSFORM: 25.13, FINAL_ANSWER: 10.42},
        warnings: [],
      }),
      renderMedia: async () => { calls.push('media'); },
      renderStill: async () => { calls.push('still'); },
    },
  });
  expect(result.manifest.duration).toBeCloseTo(63.6);
  expect(calls).toEqual(['media', 'still']);
});

it('does not invoke rendering when validation fails', async () => {
  let rendered = false;
  await expect(renderQuestion({
    inputDir: 'tests/fixtures/invalid',
    outputDir: 'tests/tmp/invalid',
    adapters: {renderMedia: async () => { rendered = true; }},
  })).rejects.toThrow();
  expect(rendered).toBe(false);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- tests/render/renderQuestion.test.ts`

Expected: FAIL because render orchestration does not exist.

- [ ] **Step 3: Implement the render adapters and asset staging**

Create an adapter boundary around `bundle`, `selectComposition`, `renderMedia`, and `renderStill`. Stage only the package's referenced MP3 files into a temporary public directory so `staticFile()` can resolve them without modifying the user's input folder. Clean up the temporary directory in a `finally` block. Let Remotion resolve the platform FFmpeg/FFprobe binaries from its installed compositor package; expose a `binariesDirectory` option only if an explicit override is later required.

- [ ] **Step 4: Implement `renderQuestion` in the required order**

Use this order exactly:

```text
loadInputPackage
-> inspectAudioDurations
-> resolveTimeline
-> validateTimeline
-> buildSubtitleCues
-> create output directory
-> write timeline_resolved.json
-> renderMedia to video.mp4
-> renderStill for five previews
-> write render_manifest.json
```

Do not write `video.mp4` when any validation step fails. Write the manifest after successful render and include measured duration, resolution, fps, audio segment count, event count, and warnings.

- [ ] **Step 5: Implement preview rendering**

Render one still for each stage at a frame inside that stage. Use the same props as the MP4 composition. Write the exact filenames:

```text
QUESTION.png
THINK.png
IDENTIFY_SVO.png
TRANSFORM.png
FINAL_ANSWER.png
```

- [ ] **Step 6: Run tests and typecheck**

Run: `npm test -- tests/render/renderQuestion.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Record a checkpoint**

Commit message if Git is available:

```text
feat: add render pipeline and QA artifacts
```

---

### Task 10: Add the CLI and documented user input format

**Files:**
- Create: `src/cli/args.ts`
- Create: `src/cli/main.ts`
- Create: `docs/input-format.md`
- Create: `README.md`
- Test: `tests/cli/args.test.ts`
- Test: `tests/cli/main.test.ts`

**Interfaces:**
- Supports `validate`, `render`, and `preview` commands.
- Supports `--input <directory>` and `--output <directory>`.
- Returns exit code `0` on success and non-zero on validation/render errors.

- [ ] **Step 1: Write failing argument parser tests**

```ts
import {expect, it} from 'vitest';
import {parseArgs} from '../../src/cli/args.js';

it('parses render input and output directories', () => {
  expect(parseArgs(['render', '--input', 'input/Q01', '--output', 'output/Q01']))
    .toEqual({command: 'render', inputDir: 'input/Q01', outputDir: 'output/Q01'});
});

it('requires output for render but not validate', () => {
  expect(() => parseArgs(['render', '--input', 'input/Q01'])).toThrow(/output/i);
  expect(parseArgs(['validate', '--input', 'input/Q01'])).toMatchObject({command: 'validate'});
});
```

- [ ] **Step 2: Run the CLI tests to verify they fail**

Run: `npm test -- tests/cli/args.test.ts tests/cli/main.test.ts`

Expected: FAIL because the CLI modules do not exist.

- [ ] **Step 3: Implement argument parsing with Node's `parseArgs`**

Reject unknown commands, missing `--input`, missing `--output` for `render`, and extra positional arguments. Keep the parser independent from filesystem access.

- [ ] **Step 4: Implement command dispatch and error reporting**

`validate` loads and validates input plus audio metadata without rendering. `render` calls `renderQuestion`. `preview` runs the same validation/resolve path and writes only preview images and JSON diagnostics. Print structured errors with file/path context and set `process.exitCode = 1`; do not terminate with `process.exit()` inside library functions.

- [ ] **Step 5: Document the exact input package**

Document `question.json`, `voice.json`, `timeline.json`, audio paths, subtitle field, supported actions, stage order, and these commands:

```text
npm run validate -- --input input/Q01
npm run render -- --input input/Q01 --output output/Q01
npm run preview -- --input input/Q01 --output output/Q01
```

Document that MP3s are supplied by the user, TTS is not generated by the app, and actual measured audio duration controls timing.

- [ ] **Step 6: Run CLI tests, typecheck, and help smoke check**

Run: `npm test -- tests/cli/args.test.ts tests/cli/main.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

Run: `npm run validate -- --help`

Expected: prints command usage and exits `0`.

- [ ] **Step 7: Record a checkpoint**

Commit message if Git is available:

```text
feat: add renderer CLI and input documentation
```

---

### Task 11: Add real audio fixture generation and Q01 end-to-end smoke coverage

**Files:**
- Create: `tests/fixtures/Q01/audio/` generated MP3 files
- Create: `tests/render/q01.e2e.test.ts`
- Create: `scripts/create-test-audio.ts`
- Modify: `tests/fixtures/Q01/voice.json`

**Interfaces:**
- Produces a repeatable local fixture with four short MP3 files and the declared durations used by the integration test.
- Proves the complete input package can produce an MP4 and all required artifacts without TTS.

- [ ] **Step 1: Write the failing end-to-end test**

```ts
import {expect, it} from 'vitest';
import {access, readFile} from 'node:fs/promises';
import {renderQuestion} from '../../src/render/renderQuestion.js';

it('renders Q01 to MP4 with the required QA artifacts', async () => {
  const outputDir = 'tests/tmp/q01-e2e';
  await renderQuestion({inputDir: 'tests/fixtures/Q01', outputDir});
  await expect(access(`${outputDir}/video.mp4`)).resolves.toBeUndefined();
  await expect(access(`${outputDir}/timeline_resolved.json`)).resolves.toBeUndefined();
  await expect(access(`${outputDir}/render_manifest.json`)).resolves.toBeUndefined();
  const manifest = JSON.parse(await readFile(`${outputDir}/render_manifest.json`, 'utf8')) as Record<string, unknown>;
  expect(manifest).toMatchObject({fps: 30, resolution: '1920x1080', audioSegments: 4});
});
```

- [ ] **Step 2: Run the test to verify it fails for missing fixture audio**

Run: `npm test -- tests/render/q01.e2e.test.ts`

Expected: FAIL because the MP3 fixture files and complete render pipeline are not available.

- [ ] **Step 3: Generate deterministic test MP3 files**

Use `node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe` to create four short silent MP3 files with distinct durations, for example `1.20`, `0.80`, `1.60`, and `1.10` seconds. Update the fixture's declared durations to those values. The generator must write only under `tests/fixtures/Q01/audio` and use a fixed sample rate and codec settings so repeated runs are stable.

- [ ] **Step 4: Run the end-to-end test and inspect the MP4 metadata**

Run: `npm test -- tests/render/q01.e2e.test.ts`

Expected: PASS and the output contains MP4, resolved timeline, manifest, and five preview PNGs.

Use the renderer's metadata helper to verify the MP4 is `1920x1080`, `30fps`, H.264, and contains an audio stream. Verify the MP4 duration equals the sum of measured stage durations within one frame.

- [ ] **Step 5: Render the human Q01 package when its four MP3s are supplied**

Place the supplied files in a separate package such as `input/Q01/audio/`, run:

```text
npm run validate -- --input input/Q01
npm run render -- --input input/Q01 --output output/Q01
```

Inspect all five preview images and the MP4 for text overflow, early answer reveal, S/V/O visibility, subtitle overlap, audio continuity, and spelling of `patients' blood pressure` and `checked`.

- [ ] **Step 6: Record a checkpoint**

Commit message if Git is available:

```text
test: add Q01 end-to-end render coverage
```

---

### Task 12: Final verification and handoff documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/input-format.md`
- Test: all existing tests

**Interfaces:**
- Documents the user workflow from input package to MP4.
- Confirms the v1 Definition of Done with executable commands and produced artifacts.

- [ ] **Step 1: Run the complete automated test suite**

Run: `npm test`

Expected: PASS with zero failures and no unhandled warnings.

- [ ] **Step 2: Run strict typechecking**

Run: `npm run typecheck`

Expected: PASS with zero errors.

- [ ] **Step 3: Run validation against the Q01 fixture**

Run: `npm run validate -- --input tests/fixtures/Q01`

Expected: exit code `0` and no validation errors.

- [ ] **Step 4: Run the real render smoke test**

Run: `npm run render -- --input tests/fixtures/Q01 --output output/Q01`

Expected: successful MP4 and all required JSON/PNG artifacts.

- [ ] **Step 5: Verify the output contract**

Check that:

```text
output/Q01/video.mp4                 exists
output/Q01/timeline_resolved.json    exists
output/Q01/render_manifest.json      exists
output/Q01/preview/*.png             contains five files
```

Inspect manifest values, audio segment count, event count, measured duration, resolution, and fps. Use the MP4 metadata helper to confirm H.264, 1920x1080, 30fps, and an audio stream.

- [ ] **Step 6: Update the handoff docs**

Include a complete example input package, the two required commands, the output tree, validation error behavior, and the fact that users provide pre-generated MP3 files.

- [ ] **Step 7: Record final checkpoint**

Commit message if Git is available:

```text
docs: document passive voice renderer v1 workflow
```

## Plan self-review

- Spec coverage: input schemas, five stages, stable IDs, voice-first timing, actual audio durations, animation mapping, layout fitting, subtitles, audio, output artifacts, validation, manifest, previews, and Q02-Q10 reuse are covered by Tasks 2-12.
- Placeholder scan: the plan contains no unfinished placeholder instruction or unspecified v1 implementation action.
- Type consistency: `ResolvedTimeline`, `MeasuredDurations`, `SubtitleCue`, `RenderCompositionProps`, `renderQuestion`, and `getAudioSequences` are defined before downstream use.
- Scope: one integrated renderer subsystem; TTS, cloud rendering, responsive layouts, ASR, and other question types are explicitly excluded.
- Workspace constraint: the plan does not assume a Git repository; checkpoint commits are conditional and no worktree is created in the current non-Git folder.
