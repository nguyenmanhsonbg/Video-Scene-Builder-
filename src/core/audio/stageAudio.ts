import type {VoiceManifest, VoiceSegmentId} from '../domain/types.js';
import type {ResolvedTimeline} from '../timeline/resolveTimeline.js';

export type AudioSegmentId = Exclude<VoiceSegmentId, 'THINK'>;

export type AudioAssetMap = Record<AudioSegmentId, string>;

export type StageAudioSequence = {
  stage: AudioSegmentId;
  src: string;
  start: number;
  from: number;
  duration: number;
  durationInFrames: number;
};

const AUDIO_SEGMENT_IDS: AudioSegmentId[] = [
  'QUESTION',
  'IDENTIFY_SVO',
  'TRANSFORM',
  'FINAL_ANSWER',
];

export function getAudioSequences(
  voice: VoiceManifest,
  timeline: ResolvedTimeline,
  assets: AudioAssetMap,
  fps = 30,
): StageAudioSequence[] {
  return AUDIO_SEGMENT_IDS.map((stage) => {
    const voiceSegment = voice.segments.find((segment) => segment.id === stage);
    const src = assets[stage];
    const resolvedStage = timeline.stages[stage];
    if (voiceSegment === undefined || voiceSegment.audio === null || src === undefined) {
      throw new Error(`missing audio asset for stage ${stage}`);
    }
    return {
      stage,
      src,
      start: resolvedStage.start,
      from: Math.round(resolvedStage.start * fps),
      duration: resolvedStage.duration,
      durationInFrames: Math.ceil(resolvedStage.duration * fps),
    };
  });
}
