import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {inspectAudioDurations} from '../core/audio/inspectAudio.js';
import type {InputPackage} from '../core/domain/types.js';
import {ValidationError} from '../core/qa/validationError.js';
import {loadInputPackage} from '../core/schema/loadInputPackage.js';
import {resolveTimeline} from '../core/timeline/resolveTimeline.js';
import {validateTimeline} from '../core/timeline/validateTimeline.js';
import {PASSIVE_VOICE_ELEMENT_IDS} from '../question-types/passive-voice/defaults.js';
import {renderQuestion, type RenderQuestionOptions, type RenderResult} from '../render/renderQuestion.js';
import {parseArgs, type ParsedArgs} from './args.js';

export const CLI_USAGE = `Usage:
  npm run validate -- --input <package-dir>
  npm run render -- --input <package-dir> --output <output-dir>
  npm run preview -- --input <package-dir> --output <output-dir>`;

export type ValidationSummary = {
  questionId: string;
  duration: number;
  warnings: string[];
};

export type CliDependencies = {
  validate: (inputDir: string) => Promise<ValidationSummary>;
  renderQuestion: (options: RenderQuestionOptions) => Promise<RenderResult>;
};

export type CliIO = {
  stdout: (message: string) => void;
  stderr: (message: string) => void;
};

async function validateInput(inputDir: string): Promise<ValidationSummary> {
  const input: InputPackage = await loadInputPackage(inputDir);
  const audio = await inspectAudioDurations(input.voice, input.inputDir);
  const timeline = resolveTimeline(input.voice, input.timeline, audio.durations);
  validateTimeline(timeline, new Set(PASSIVE_VOICE_ELEMENT_IDS));
  return {questionId: input.question.questionId, duration: timeline.totalDuration, warnings: audio.warnings};
}

function formatError(error: unknown): string {
  if (error instanceof ValidationError) {
    return [
      'Validation failed:',
      ...error.issues.map((issue) => `- ${issue.source}:${issue.path} ${issue.message}`),
    ].join('\n');
  }
  return error instanceof Error ? error.message : String(error);
}

const defaultDependencies: CliDependencies = {
  validate: validateInput,
  renderQuestion,
};

const defaultIO: CliIO = {
  stdout: (message) => console.log(message),
  stderr: (message) => console.error(message),
};

async function dispatch(args: ParsedArgs, dependencies: CliDependencies, io: CliIO): Promise<void> {
  if (args.command === 'help') {
    io.stdout(CLI_USAGE);
    return;
  }

  if (args.inputDir === undefined) {
    throw new Error('--input is required');
  }

  if (args.command === 'validate') {
    const summary = await dependencies.validate(args.inputDir);
    io.stdout(`Validated ${summary.questionId}; duration ${summary.duration.toFixed(2)}s`);
    for (const warning of summary.warnings) {
      io.stdout(`Warning: ${warning}`);
    }
    return;
  }

  if (args.outputDir === undefined) {
    throw new Error(`--output is required for ${args.command}`);
  }

  const result = await dependencies.renderQuestion({
    inputDir: args.inputDir,
    outputDir: args.outputDir,
    renderVideo: args.command === 'render',
  });
  io.stdout(`${args.command === 'render' ? 'Rendered' : 'Previewed'} ${result.manifest.questionId} in ${args.outputDir}`);
}

export async function runCli(
  argv: string[] = process.argv.slice(2),
  dependencyOverrides: Partial<CliDependencies> = {},
  io: CliIO = defaultIO,
): Promise<number> {
  try {
    const args = parseArgs(argv);
    await dispatch(args, {...defaultDependencies, ...dependencyOverrides}, io);
    return 0;
  } catch (error) {
    io.stderr(formatError(error));
    return 1;
  }
}

const isMainModule = process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMainModule) {
  void runCli().then((exitCode) => {
    process.exitCode = exitCode;
  });
}
