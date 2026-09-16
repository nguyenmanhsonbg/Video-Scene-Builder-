import type {PassiveVoiceSceneProps} from '../question-types/passive-voice/PassiveVoiceScene.js';
import {PassiveVoiceScene} from '../question-types/passive-voice/PassiveVoiceScene.js';
import {AbsoluteFill} from 'remotion';

export type RenderCompositionProps = Partial<PassiveVoiceSceneProps>;

export function RenderComposition(props: RenderCompositionProps) {
  if (
    props.question === undefined ||
    props.voice === undefined ||
    props.resolvedTimeline === undefined ||
    props.subtitleCues === undefined ||
    props.audioAssets === undefined
  ) {
    return (
      <AbsoluteFill style={{backgroundColor: '#F7F3EC', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: 'Arial, sans-serif', fontSize: 32, color: '#17253D'}}>
          Provide render input props to preview this composition.
        </div>
      </AbsoluteFill>
    );
  }

  return <PassiveVoiceScene {...props as PassiveVoiceSceneProps} />;
}
