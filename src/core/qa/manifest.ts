import type {InputPackage} from '../domain/types.js';
import type {ResolvedTimeline} from '../timeline/resolveTimeline.js';

export type RenderManifest = {
  schemaVersion: 1;
  questionId: string;
  duration: number;
  fps: 30;
  resolution: '1920x1080';
  audioSegments: number;
  eventCount: number;
  stageDurations: Record<string, number>;
  warnings: string[];
};

export function createRenderManifest(
  input: InputPackage,
  timeline: ResolvedTimeline,
  warnings: string[],
): RenderManifest {
  return {
    schemaVersion: 1,
    questionId: input.question.questionId,
    duration: timeline.totalDuration,
    fps: 30,
    resolution: '1920x1080',
    audioSegments: input.voice.segments.filter((segment) => segment.audio !== null).length,
    eventCount: timeline.events.length,
    stageDurations: Object.fromEntries(
      Object.entries(timeline.stages).map(([id, stage]) => [id, stage.duration]),
    ),
    warnings: [...warnings],
  };
}
