import type {CSSProperties} from 'react';
import {Arrow} from '../../components/Arrow.js';
import {Text} from '../../components/Text.js';
import type {PassiveVoiceQuestion} from '../../core/domain/types.js';
import type {ElementState} from './sceneState.js';
import {PASSIVE_VOICE_THEME} from './defaults.js';

export type TransformationProps = {
  question: PassiveVoiceQuestion;
  elements: Record<string, ElementState>;
};

const titleStyle: CSSProperties = {fontSize: 34, lineHeight: 1.1, fontStyle: 'italic', color: PASSIVE_VOICE_THEME.navy};
const valueStyle: CSSProperties = {fontSize: 40, lineHeight: 1.15, color: PASSIVE_VOICE_THEME.navy, whiteSpace: 'nowrap'};

export function Transformation({question, elements}: TransformationProps) {
  const visible = (id: string) => elements[id]?.visible;
  const opacity = (id: string) => elements[id]?.progress ?? 0;
  return (
    <>
      <Text id="transform_object_source_label" visible={visible('transform_object_source')} opacity={opacity('transform_object_source')} style={{...titleStyle, left: 194, top: 563}}>Object</Text>
      <Text id="transform_object_source" visible={visible('transform_object_source')} opacity={opacity('transform_object_source')} style={{...valueStyle, left: 194, top: 627}}>{question.active.object}</Text>
      <Arrow id="transform_arrow" left={865} top={602} visible={visible('transform_arrow')} opacity={opacity('transform_arrow')} />
      <Text id="passive_subject" visible={visible('passive_subject')} opacity={opacity('passive_subject')} style={{...valueStyle, left: 1205, top: 627, width: 600}}>{question.passive.subject}</Text>
      <Text id="note_singular" visible={visible('note_singular')} opacity={opacity('note_singular')} style={{left: 150, top: 770, fontSize: 27, color: PASSIVE_VOICE_THEME.navy}}>{question.grammar.beReason}</Text>
      <Text id="be_token" visible={visible('be_token')} opacity={opacity('be_token')} style={{left: 850, top: 770, fontSize: 42, color: PASSIVE_VOICE_THEME.navy}}>{question.passive.be}</Text>
      <Text id="verb_base" visible={visible('verb_base')} opacity={opacity('verb_base')} style={{left: 850, top: 815, fontSize: 36, color: PASSIVE_VOICE_THEME.navy}}>{question.active.verb}</Text>
      <Text id="verb_v3" visible={visible('verb_v3')} opacity={opacity('verb_v3')} style={{left: 1050, top: 815, fontSize: 36, color: PASSIVE_VOICE_THEME.navy}}>{question.passive.verbV3}</Text>
      <Text id="build_subject" visible={visible('build_subject')} opacity={opacity('build_subject')} style={{...valueStyle, left: 194, top: 705}}>{question.passive.subject}</Text>
      <Text id="build_be" visible={visible('build_be')} opacity={opacity('build_be')} style={{...valueStyle, left: 760, top: 705}}>{question.passive.be}</Text>
      <Text id="build_adverb" visible={visible('build_adverb')} opacity={opacity('build_adverb')} style={{...valueStyle, left: 890, top: 705}}>{question.passive.adverb ?? ''}</Text>
      <Text id="build_v3" visible={visible('build_v3')} opacity={opacity('build_v3')} style={{...valueStyle, left: 1040, top: 705}}>{question.passive.verbV3}</Text>
      <Text id="build_agent" visible={visible('build_agent')} opacity={opacity('build_agent')} style={{...valueStyle, left: 1240, top: 705}}>{question.passive.agent ?? ''}</Text>
    </>
  );
}
