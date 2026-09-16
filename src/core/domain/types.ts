export const VOICE_SEGMENT_IDS = [
  'QUESTION',
  'THINK',
  'IDENTIFY_SVO',
  'TRANSFORM',
  'FINAL_ANSWER',
] as const;

export type VoiceSegmentId = typeof VOICE_SEGMENT_IDS[number];

export const VISUAL_ACTIONS = [
  'SHOW',
  'HIDE',
  'HIGHLIGHT',
  'REVEAL_UNDERLINE',
  'REVEAL_OUTLINE',
  'MOVE_OBJECT',
  'CHANGE_VERB',
  'BUILD',
] as const;

export type VisualAction = typeof VISUAL_ACTIONS[number];

export type PassiveVoiceQuestion = {
  questionId: string;
  questionNumber: number;
  topic: string;
  active: {
    fullSentence: string;
    subject: string;
    adverb?: string;
    verb: string;
    object: string;
  };
  passive: {
    subject: string;
    be: string;
    adverb?: string;
    verbV3: string;
    agent?: string;
  };
  grammar: {
    subjectNumber: string;
    beReason: string;
    verbTransformation: string;
    ruleLabel: string;
    rule: string;
  };
  finalAnswer: string;
};

export type VoiceSegment = {
  id: VoiceSegmentId;
  audio: string | null;
  duration: number;
  subtitle: string | null;
};

export type VoiceManifest = {
  questionId: string;
  segments: VoiceSegment[];
};

export type VisualEvent = {
  at: number;
  action: VisualAction;
  target: string;
  payload?: Record<string, unknown>;
};

export type TimelineSegment = {
  segment: VoiceSegmentId;
  events: VisualEvent[];
};

export type TimelineInput = {
  questionId: string;
  segments: TimelineSegment[];
};

export type InputPackage = {
  inputDir: string;
  question: PassiveVoiceQuestion;
  voice: VoiceManifest;
  timeline: TimelineInput;
};
