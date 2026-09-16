import {parseFile} from 'music-metadata';
import {relative, resolve, sep, isAbsolute} from 'node:path';
import type {VoiceManifest, VoiceSegmentId} from '../domain/types.js';
import {ValidationError} from '../qa/validationError.js';

export type MeasuredDurations = Record<VoiceSegmentId, number>;

export type AudioDurationReader = (absolutePath: string) => Promise<number>;

export async function readMp3Duration(absolutePath: string): Promise<number> {
  const metadata = await parseFile(absolutePath);
  const duration = metadata.format.duration;
  if (duration === undefined || !Number.isFinite(duration) || duration <= 0) {
    throw new Error(`audio duration is invalid: ${String(duration)}`);
  }
  return duration;
}

export function resolveAudioPath(inputDir: string, audioPath: string): string {
  const inputRoot = resolve(inputDir);
  const absolutePath = resolve(inputRoot, audioPath);
  const relativePath = relative(inputRoot, absolutePath);
  if (relativePath === '' || relativePath.startsWith(`..${sep}`) || relativePath === '..' || isAbsolute(relativePath)) {
    throw new ValidationError([{
      source: 'voice.json',
      path: 'segments.audio',
      message: `audio path escapes input package: ${audioPath}`,
    }]);
  }
  return absolutePath;
}

export async function inspectAudioDurations(
  voice: VoiceManifest,
  inputDir: string,
  reader: AudioDurationReader = readMp3Duration,
): Promise<{durations: MeasuredDurations; warnings: string[]}> {
  const durations = {} as MeasuredDurations;
  const warnings: string[] = [];

  for (const segment of voice.segments) {
    if (segment.id === 'THINK') {
      durations[segment.id] = segment.duration;
      continue;
    }

    if (segment.audio === null) {
      throw new ValidationError([{
        source: 'voice.json',
        path: `segments.${segment.id}.audio`,
        message: 'audio path is required for an audio-backed stage',
      }]);
    }

    const absolutePath = resolveAudioPath(inputDir, segment.audio);
    let measuredDuration: number;
    try {
      measuredDuration = await reader(absolutePath);
    } catch (error) {
      throw new ValidationError([{
        source: absolutePath,
        path: '<audio>',
        message: error instanceof Error ? error.message : 'unable to inspect audio',
      }]);
    }

    if (!Number.isFinite(measuredDuration) || measuredDuration <= 0) {
      throw new ValidationError([{
        source: absolutePath,
        path: '<duration>',
        message: `measured duration must be positive, received ${String(measuredDuration)}`,
      }]);
    }

    durations[segment.id] = measuredDuration;
    if (Math.abs(measuredDuration - segment.duration) > 0.05) {
      warnings.push(
        `${segment.id} declared duration ${segment.duration.toFixed(2)}s differs from measured duration ${measuredDuration.toFixed(2)}s`,
      );
    }
  }

  return {durations, warnings};
}
