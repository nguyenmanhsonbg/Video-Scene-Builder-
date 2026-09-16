import {expect, it} from 'vitest';
import {readQ01Package} from '../helpers/q01Fixture.js';
import {inspectAudioDurations} from '../../src/core/audio/inspectAudio.js';
import type {MeasuredDurations} from '../../src/core/audio/inspectAudio.js';
import type {TimelineInput} from '../../src/core/domain/types.js';
import {resolveTimeline} from '../../src/core/timeline/resolveTimeline.js';

const durations: MeasuredDurations = {
  QUESTION: 6.21,
  THINK: 4,
  IDENTIFY_SVO: 17.84,
  TRANSFORM: 25.13,
  FINAL_ANSWER: 10.42,
};

it('uses measured audio durations for audio stages and the declared duration for THINK', async () => {
  const {voice} = await readQ01Package();
  const inspected: string[] = [];
  const result = await inspectAudioDurations(voice, 'tests/fixtures/Q01', async (absolutePath) => {
    inspected.push(absolutePath);
    return 2.5;
  });
  expect(result.durations).toEqual({
    QUESTION: 2.5,
    THINK: 4,
    IDENTIFY_SVO: 2.5,
    TRANSFORM: 2.5,
    FINAL_ANSWER: 2.5,
  });
  expect(inspected).toHaveLength(4);
  expect(result.warnings).toHaveLength(4);
});

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
