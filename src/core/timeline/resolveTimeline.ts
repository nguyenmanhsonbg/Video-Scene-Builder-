import {VOICE_SEGMENT_IDS} from '../domain/types.js';
import type {
  TimelineInput,
  VoiceManifest,
  VoiceSegmentId,
  VisualEvent,
} from '../domain/types.js';
import type {MeasuredDurations} from '../audio/inspectAudio.js';

export type ResolvedStage = {
  id: VoiceSegmentId;
  start: number;
  end: number;
  duration: number;
};

export type ResolvedEvent = VisualEvent & {
  segment: VoiceSegmentId;
  globalAt: number;
};

export type ResolvedTimeline = {
  stages: Record<VoiceSegmentId, ResolvedStage>;
  events: ResolvedEvent[];
  totalDuration: number;
};

export function resolveTimeline(
  voice: VoiceManifest,
  timeline: TimelineInput,
  measuredDurations: MeasuredDurations,
): ResolvedTimeline {
  const voiceSegments = new Map(voice.segments.map((segment) => [segment.id, segment]));
  const timelineSegments = new Map(timeline.segments.map((segment) => [segment.segment, segment]));
  const stages = {} as Record<VoiceSegmentId, ResolvedStage>;
  const events: ResolvedEvent[] = [];
  let cursor = 0;

  for (const id of VOICE_SEGMENT_IDS) {
    const voiceSegment = voiceSegments.get(id);
    const timelineSegment = timelineSegments.get(id);
    const duration = measuredDurations[id];
    if (voiceSegment === undefined || timelineSegment === undefined || duration === undefined) {
      throw new Error(`missing timeline data for stage ${id}`);
    }
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error(`duration for stage ${id} must be positive`);
    }

    const stage: ResolvedStage = {
      id,
      start: cursor,
      end: cursor + duration,
      duration,
    };
    stages[id] = stage;

    for (const event of timelineSegment.events) {
      if (event.at < 0 || event.at > duration) {
        throw new Error(`event for ${id} is outside segment duration: ${event.at}s > ${duration}s`);
      }
      events.push({...event, segment: id, globalAt: stage.start + event.at});
    }

    cursor = stage.end;
  }

  return {stages, events, totalDuration: cursor};
}
