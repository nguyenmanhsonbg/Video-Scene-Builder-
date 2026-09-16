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
