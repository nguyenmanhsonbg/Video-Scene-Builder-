import {z} from 'zod';
import {VOICE_SEGMENT_IDS, VISUAL_ACTIONS} from '../domain/types.js';
import type {TimelineInput} from '../domain/types.js';
import {ValidationError} from '../qa/validationError.js';

const visualEventSchema = z.object({
  at: z.number().finite().nonnegative(),
  action: z.enum(VISUAL_ACTIONS),
  target: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export const timelineSchema = z.object({
  questionId: z.string().min(1),
  segments: z.array(z.object({
    segment: z.enum(VOICE_SEGMENT_IDS),
    events: z.array(visualEventSchema),
  })).length(VOICE_SEGMENT_IDS.length),
}).superRefine((timeline, context) => {
  const ids = timeline.segments.map((segment) => segment.segment);
  const missing = VOICE_SEGMENT_IDS.filter((id) => !ids.includes(id));
  if (missing.length > 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['segments'],
      message: `missing stages: ${missing.join(', ')}`,
    });
  }
  if (new Set(ids).size !== ids.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['segments'],
      message: 'stage IDs must be unique',
    });
  }
});

const issuePath = (path: PropertyKey[]) => path.map(String).join('.') || '<root>';

export async function parseTimeline(input: unknown): Promise<TimelineInput> {
  const result = timelineSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(result.error.issues.map((issue) => ({
      source: 'timeline.json',
      path: issuePath(issue.path),
      message: issue.message,
    })));
  }
  return result.data;
}
