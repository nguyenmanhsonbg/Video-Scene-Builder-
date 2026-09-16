import type {VoiceSegmentId} from '../domain/types.js';
import type {ResolvedTimeline} from './resolveTimeline.js';
import {ValidationError} from '../qa/validationError.js';

const markerTargets = new Set([
  'underline_subject',
  'underline_verb',
  'underline_object',
  'label_s',
  'label_v',
  'label_o',
  'adverb_highlight',
]);

const answerTargets = new Set([
  'answer_box',
  'answer_text',
  'grammar_rule_label',
  'grammar_rule_text',
]);

export function validateTimeline(
  timeline: ResolvedTimeline,
  allowedElementIds: ReadonlySet<string>,
): void {
  const issues = [] as Array<{source: string; path: string; message: string}>;

  timeline.events.forEach((event, index) => {
    if (!allowedElementIds.has(event.target)) {
      issues.push({
        source: 'timeline.json',
        path: `events.${index}.target`,
        message: `unknown element ID: ${event.target}`,
      });
    }
    if (markerTargets.has(event.target) && (event.segment === 'QUESTION' || event.segment === 'THINK')) {
      issues.push({
        source: 'timeline.json',
        path: `events.${index}`,
        message: `${event.target} cannot be revealed during ${event.segment}`,
      });
    }
    if (answerTargets.has(event.target) && event.segment !== 'FINAL_ANSWER') {
      issues.push({
        source: 'timeline.json',
        path: `events.${index}`,
        message: `${event.target} can only be revealed during FINAL_ANSWER`,
      });
    }
    if (event.segment === 'THINK' && event.target !== 'think_prompt' && event.target !== 'countdown') {
      issues.push({
        source: 'timeline.json',
        path: `events.${index}`,
        message: `${event.target} is not allowed during THINK`,
      });
    }
  });

  if (issues.length > 0) {
    throw new ValidationError(issues);
  }
}
