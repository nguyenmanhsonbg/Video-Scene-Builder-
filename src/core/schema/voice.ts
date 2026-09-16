import {z} from 'zod';
import {VOICE_SEGMENT_IDS} from '../domain/types.js';
import type {VoiceManifest} from '../domain/types.js';
import {ValidationError} from '../qa/validationError.js';

const voiceSegmentSchema = z.object({
  id: z.enum(VOICE_SEGMENT_IDS),
  audio: z.string().min(1).nullable(),
  duration: z.number().finite().positive(),
  subtitle: z.string().nullable(),
});

export const voiceSchema = z.object({
  questionId: z.string().min(1),
  segments: z.array(voiceSegmentSchema).length(VOICE_SEGMENT_IDS.length),
}).superRefine((voice, context) => {
  const ids = voice.segments.map((segment) => segment.id);
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

  for (const segment of voice.segments) {
    if (segment.id === 'THINK' && segment.audio !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['segments'],
        message: 'THINK audio must be null',
      });
    }
    if (segment.id !== 'THINK' && segment.audio === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['segments'],
        message: `${segment.id} requires an audio path`,
      });
    }
  }
});

const issuePath = (path: PropertyKey[]) => path.map(String).join('.') || '<root>';

export async function parseVoice(input: unknown): Promise<VoiceManifest> {
  const result = voiceSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(result.error.issues.map((issue) => ({
      source: 'voice.json',
      path: issuePath(issue.path),
      message: issue.message,
    })));
  }
  return result.data;
}
