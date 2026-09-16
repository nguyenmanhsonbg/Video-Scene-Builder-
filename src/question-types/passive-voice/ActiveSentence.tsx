import {Text} from '../../components/Text.js';

export type ActiveSentenceProps = {
  subject: string;
  adverb?: string;
  verb: string;
  object: string;
};

const sentenceStyle = {
  top: 292,
  height: 72,
  fontFamily: 'Be Vietnam Pro, Inter, Arial, sans-serif',
  fontSize: 56,
  lineHeight: 1.15,
  fontWeight: 400,
  color: '#0E2B47',
  whiteSpace: 'nowrap' as const,
};

export function ActiveSentence({subject, adverb, verb, object}: ActiveSentenceProps) {
  return (
    <>
      <Text id="active_subject" style={{...sentenceStyle, left: 170, width: 250}}>{subject}</Text>
      <Text id="active_adverb" style={{...sentenceStyle, left: 486, width: 220}}>{adverb ?? ''}</Text>
      <Text id="active_verb" style={{...sentenceStyle, left: 764, width: 210}}>{verb}</Text>
      <Text id="active_object" style={{...sentenceStyle, left: 1035, width: 710}}>{object}</Text>
    </>
  );
}
