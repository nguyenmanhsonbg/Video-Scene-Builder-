import {Highlight} from '../../components/Highlight.js';
import {Text} from '../../components/Text.js';
import {Underline} from '../../components/Underline.js';
import {PASSIVE_VOICE_THEME} from './defaults.js';
import type {ElementState} from './sceneState.js';

export type SVOAnalysisProps = {
  elements: Record<string, ElementState>;
};

export function SVOAnalysis({elements}: SVOAnalysisProps) {
  return (
    <>
      <Underline id="underline_subject" left={170} top={363} width={245} color={PASSIVE_VOICE_THEME.red} visible={elements.underline_subject?.visible} opacity={elements.underline_subject?.progress} />
      <Underline id="underline_verb" left={764} top={363} width={196} color={PASSIVE_VOICE_THEME.lightBlue} visible={elements.underline_verb?.visible} opacity={elements.underline_verb?.progress} />
      <Highlight id="underline_object" left={1035} top={278} width={678} height={92} color={`${PASSIVE_VOICE_THEME.beige}55`} visible={elements.underline_object?.visible} opacity={elements.underline_object?.progress} />
      <Highlight id="adverb_highlight" left={478} top={282} width={236} height={84} color={`${PASSIVE_VOICE_THEME.lightBlue}55`} visible={elements.adverb_highlight?.visible} opacity={elements.adverb_highlight?.progress} />
      <Text id="label_s" visible={elements.label_s?.visible} opacity={elements.label_s?.progress} style={{left: 284, top: 401, width: 60, fontSize: 48, textAlign: 'center', color: PASSIVE_VOICE_THEME.navy}}>S</Text>
      <Text id="label_v" visible={elements.label_v?.visible} opacity={elements.label_v?.progress} style={{left: 834, top: 401, width: 60, fontSize: 48, textAlign: 'center', color: PASSIVE_VOICE_THEME.navy}}>V</Text>
      <Text id="label_o" visible={elements.label_o?.visible} opacity={elements.label_o?.progress} style={{left: 1310, top: 401, width: 60, fontSize: 48, textAlign: 'center', color: PASSIVE_VOICE_THEME.navy}}>O</Text>
    </>
  );
}
