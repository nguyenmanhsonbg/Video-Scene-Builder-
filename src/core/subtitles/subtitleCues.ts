import type {VoiceManifest, VoiceSegmentId} from '../domain/types.js';
import type {ResolvedTimeline} from '../timeline/resolveTimeline.js';

export type SubtitleCue = {
  stage: VoiceSegmentId;
  start: number;
  end: number;
  text: string;
};

export function buildSubtitleCues(
  voice: VoiceManifest,
  timeline: ResolvedTimeline,
): SubtitleCue[] {
  return voice.segments.flatMap((segment) => {
    if (segment.subtitle === null || segment.subtitle.trim() === '') {
      return [];
    }
    const stage = timeline.stages[segment.id];
    return [{
      stage: segment.id,
      start: stage.start,
      end: stage.end,
      text: segment.subtitle,
    }];
  });
}
