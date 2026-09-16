import type {PassiveVoiceQuestion, VoiceSegmentId} from '../../core/domain/types.js';
import {animationPresetFor} from '../../core/animation/mapActionToPreset.js';
import {ANIMATION_PRESETS} from '../../core/animation/presets.js';
import {progressAt} from '../../core/animation/interpolate.js';
import type {ResolvedEvent, ResolvedTimeline} from '../../core/timeline/resolveTimeline.js';
import {PASSIVE_VOICE_ELEMENT_IDS, type PassiveVoiceElementId, PASSIVE_VOICE_STAGE_ORDER} from './defaults.js';

export type ElementState = {
  visible: boolean;
  progress: number;
};

export type PassiveVoiceSceneState = {
  stage: VoiceSegmentId;
  elements: Record<PassiveVoiceElementId, ElementState>;
  labelS: ElementState;
  labelV: ElementState;
  labelO: ElementState;
  answer: ElementState;
};

const createHiddenState = (): ElementState => ({visible: false, progress: 0});

function stageAt(timeline: ResolvedTimeline, time: number): VoiceSegmentId {
  for (const id of PASSIVE_VOICE_STAGE_ORDER) {
    const stage = timeline.stages[id];
    if (time >= stage.start && time < stage.end) {
      return id;
    }
  }
  return time >= timeline.totalDuration ? 'FINAL_ANSWER' : 'QUESTION';
}

function stateForEvents(events: ResolvedEvent[], time: number): ElementState {
  const state = createHiddenState();
  const relevant = events.filter((event) => event.globalAt <= time);
  const lastEvent = relevant.at(-1);
  if (lastEvent === undefined) {
    return state;
  }

  state.visible = lastEvent.action !== 'HIDE';
  const preset = animationPresetFor(lastEvent.action);
  state.progress = progressAt(
    time,
    lastEvent.globalAt,
    ANIMATION_PRESETS[preset].duration,
  );
  return state;
}

export function getPassiveVoiceSceneState(
  question: PassiveVoiceQuestion,
  timeline: ResolvedTimeline,
  time: number,
): PassiveVoiceSceneState {
  const eventsByTarget = new Map<string, ResolvedEvent[]>();
  for (const event of timeline.events) {
    const events = eventsByTarget.get(event.target) ?? [];
    events.push(event);
    eventsByTarget.set(event.target, events);
  }

  const elements = {} as Record<PassiveVoiceElementId, ElementState>;
  for (const id of PASSIVE_VOICE_ELEMENT_IDS) {
    elements[id] = stateForEvents(eventsByTarget.get(id) ?? [], time);
  }

  for (const id of ['title', 'active_label', 'active_subject', 'active_adverb', 'active_verb', 'active_object'] as const) {
    elements[id] = {visible: true, progress: 1};
  }

  const finalStart = timeline.stages.FINAL_ANSWER.start;
  if (time < finalStart) {
    elements.answer_box = createHiddenState();
    elements.answer_text = createHiddenState();
    elements.grammar_rule_label = createHiddenState();
    elements.grammar_rule_text = createHiddenState();
  }

  const stage = stageAt(timeline, time);
  if (stage !== 'THINK') {
    elements.think_prompt = createHiddenState();
    elements.countdown = createHiddenState();
  }

  void question;
  return {
    stage,
    elements,
    labelS: elements.label_s,
    labelV: elements.label_v,
    labelO: elements.label_o,
    answer: elements.answer_text,
  };
}
