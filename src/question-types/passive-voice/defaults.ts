import type {VoiceSegmentId} from '../../core/domain/types.js';

export const PASSIVE_VOICE_ELEMENT_IDS = [
  'title',
  'active_label',
  'active_subject',
  'active_adverb',
  'active_verb',
  'active_object',
  'underline_subject',
  'underline_verb',
  'underline_object',
  'label_s',
  'label_v',
  'label_o',
  'adverb_highlight',
  'transform_object_source',
  'transform_arrow',
  'passive_subject',
  'note_singular',
  'be_token',
  'verb_base',
  'verb_v3',
  'build_subject',
  'build_be',
  'build_adverb',
  'build_v3',
  'build_agent',
  'answer_box',
  'answer_text',
  'grammar_rule_label',
  'grammar_rule_text',
  'think_prompt',
  'countdown',
] as const;

export type PassiveVoiceElementId = typeof PASSIVE_VOICE_ELEMENT_IDS[number];

export const PASSIVE_VOICE_THEME = {
  black: '#111111',
  white: '#FFFFFF',
  beige: '#D8B07A',
  navy: '#0E2B47',
  red: '#FF2A2A',
  lightBlue: '#B8C9F0',
  gray: '#BDBDBD',
  answerText: '#7EC0FF',
} as const;

export const PASSIVE_VOICE_STAGE_ORDER: VoiceSegmentId[] = [
  'QUESTION',
  'THINK',
  'IDENTIFY_SVO',
  'TRANSFORM',
  'FINAL_ANSWER',
];
