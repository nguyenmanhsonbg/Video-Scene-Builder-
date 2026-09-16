import {access, readFile} from 'node:fs/promises';
import {expect, it} from 'vitest';
import {renderQuestion} from '../../src/render/renderQuestion.js';

it('renders Q01 to MP4 with the required QA artifacts', async () => {
  const outputDir = 'tests/tmp/q01-e2e';
  await renderQuestion({inputDir: 'tests/fixtures/Q01', outputDir});

  await expect(access(`${outputDir}/video.mp4`)).resolves.toBeUndefined();
  await expect(access(`${outputDir}/timeline_resolved.json`)).resolves.toBeUndefined();
  await expect(access(`${outputDir}/render_manifest.json`)).resolves.toBeUndefined();

  const manifest = JSON.parse(await readFile(`${outputDir}/render_manifest.json`, 'utf8')) as Record<string, unknown>;
  expect(manifest).toMatchObject({fps: 30, resolution: '1920x1080', audioSegments: 4});

  for (const stage of ['QUESTION', 'THINK', 'IDENTIFY_SVO', 'TRANSFORM', 'FINAL_ANSWER']) {
    await expect(access(`${outputDir}/preview/${stage}.png`)).resolves.toBeUndefined();
  }
}, 300_000);
