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
