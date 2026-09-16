import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {getAudioSequences, type AudioAssetMap} from '../../core/audio/stageAudio.js';
import type {PassiveVoiceQuestion, VoiceManifest} from '../../core/domain/types.js';
import type {SubtitleCue} from '../../core/subtitles/subtitleCues.js';
import type {ResolvedTimeline} from '../../core/timeline/resolveTimeline.js';
import {Text} from '../../components/Text.js';
import {SubtitleLayer} from '../../core/subtitles/SubtitleLayer.js';
import {ActiveSentence} from './ActiveSentence.js';
import {FinalAnswer} from './FinalAnswer.js';
import {SVOAnalysis} from './SVOAnalysis.js';
import {Transformation} from './Transformation.js';
import {getPassiveVoiceSceneState} from './sceneState.js';
import {PASSIVE_VOICE_THEME} from './defaults.js';

export type PassiveVoiceSceneProps = {
  question: PassiveVoiceQuestion;
  voice: VoiceManifest;
  resolvedTimeline: ResolvedTimeline;
  subtitleCues: SubtitleCue[];
  audioAssets: AudioAssetMap;
};

export function PassiveVoiceScene({question, voice, resolvedTimeline, subtitleCues, audioAssets}: PassiveVoiceSceneProps) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const state = getPassiveVoiceSceneState(question, resolvedTimeline, time);
  const audioSequences = getAudioSequences(voice, resolvedTimeline, audioAssets, fps);
  const title = `Câu ${question.questionNumber}: Thì hiện tại đơn (bị động)`;
  const answerVisible = state.answer.visible;
  const ruleVisible = state.elements.grammar_rule_label.visible || state.elements.grammar_rule_text.visible;

  return (
    <AbsoluteFill style={{backgroundColor: PASSIVE_VOICE_THEME.white, color: PASSIVE_VOICE_THEME.navy}}>
      <div style={{position: 'absolute', left: 1682, top: 84, width: 150, height: 5, backgroundColor: PASSIVE_VOICE_THEME.beige}} />
      <div style={{position: 'absolute', left: 136, top: 1012, width: 150, height: 5, backgroundColor: PASSIVE_VOICE_THEME.beige}} />
      <Text id="title" style={{left: 136, top: 76, width: 1320, fontFamily: 'Georgia, Times New Roman, serif', fontSize: 72, lineHeight: 1.08, fontWeight: 700, letterSpacing: -1.2, color: PASSIVE_VOICE_THEME.navy}}>{title}</Text>
      <Text id="active_label" style={{left: 142, top: 194, width: 420, fontFamily: 'Be Vietnam Pro, Inter, Arial, sans-serif', fontSize: 28, lineHeight: 1.2, color: PASSIVE_VOICE_THEME.navy}}>Câu chủ động:</Text>
      <ActiveSentence
        subject={question.active.subject}
        adverb={question.active.adverb}
        verb={question.active.verb}
        object={question.active.object}
      />
      <SVOAnalysis elements={state.elements} />
      <Transformation question={question} elements={state.elements} />
      <Text id="think_prompt" visible={state.elements.think_prompt.visible} opacity={state.elements.think_prompt.progress} style={{left: 650, top: 490, width: 620, fontSize: 38, lineHeight: 1.25, textAlign: 'center', color: PASSIVE_VOICE_THEME.navy}}>Try it yourself.{"\n"}Identify S – V – O.</Text>
      <Text id="countdown" visible={state.elements.countdown.visible} opacity={state.elements.countdown.progress} style={{left: 820, top: 530, width: 280, fontSize: 42, textAlign: 'center', color: PASSIVE_VOICE_THEME.gray}}>3 – 2 – 1</Text>
      <FinalAnswer
        answer={question.finalAnswer}
        ruleLabel={question.grammar.ruleLabel}
        rule={question.grammar.rule}
        visible={answerVisible}
        ruleVisible={ruleVisible}
        opacity={state.answer.progress}
      />
      <SubtitleLayer cues={subtitleCues} time={time} />
      {audioSequences.map((sequence) => (
        <Sequence key={sequence.stage} from={sequence.from} durationInFrames={sequence.durationInFrames}>
          <Audio src={staticFile(sequence.src)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
