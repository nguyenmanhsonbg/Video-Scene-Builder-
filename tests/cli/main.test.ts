import {expect, it} from 'vitest';
import {runCli} from '../../src/cli/main.js';

it('prints help without reading the filesystem', async () => {
  const output: string[] = [];
  const exitCode = await runCli(['--help'], {}, {stdout: (message) => output.push(message), stderr: () => {}});
  expect(exitCode).toBe(0);
  expect(output.join('\n')).toMatch(/validate|render|preview/i);
});

it('reports validation errors with source and path context', async () => {
  const errors: string[] = [];
  const exitCode = await runCli(
    ['validate', '--input', 'ignored'],
    {
      validate: async () => {
        throw new Error('question.json:active.object object is required');
      },
    },
    {stdout: () => {}, stderr: (message) => errors.push(message)},
  );
  expect(exitCode).toBe(1);
  expect(errors.join('\n')).toMatch(/question\.json|active\.object|object is required/i);
});
