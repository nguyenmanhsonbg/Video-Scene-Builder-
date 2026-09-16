import {expect, it} from 'vitest';
import {readResolvedQ01Fixture} from '../helpers/resolvedQ01Fixture.js';
import {buildSubtitleCues} from '../../src/core/subtitles/subtitleCues.js';

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
