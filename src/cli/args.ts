import {parseArgs as parseNodeArgs} from 'node:util';

export type CliCommand = 'validate' | 'render' | 'preview' | 'help';

export type ParsedArgs = {
  command: CliCommand;
  inputDir?: string;
  outputDir?: string;
};

export function parseArgs(argv: string[]): ParsedArgs {
  const command = argv[0];
  if (command === '--help' || command === '-h') {
    return {command: 'help'};
  }
  if (command !== 'validate' && command !== 'render' && command !== 'preview') {
    throw new Error('command must be one of: validate, render, preview');
  }

  const parsed = parseNodeArgs({
    args: argv.slice(1),
    options: {
      input: {type: 'string'},
      output: {type: 'string'},
      help: {type: 'boolean', short: 'h'},
    },
    allowPositionals: true,
    strict: true,
  });

  if (parsed.values.help === true) {
    return {command: 'help'};
  }
  if (parsed.positionals.length > 0) {
    throw new Error(`unexpected positional argument: ${parsed.positionals[0]}`);
  }

  const inputDir = parsed.values.input;
  if (typeof inputDir !== 'string' || inputDir.length === 0) {
    throw new Error('--input is required');
  }

  const outputDir = parsed.values.output;
  if ((command === 'render' || command === 'preview') && (typeof outputDir !== 'string' || outputDir.length === 0)) {
    throw new Error(`--output is required for ${command}`);
  }

  return typeof outputDir === 'string'
    ? {command, inputDir, outputDir}
    : {command, inputDir};
}
