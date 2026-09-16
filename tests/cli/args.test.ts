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
