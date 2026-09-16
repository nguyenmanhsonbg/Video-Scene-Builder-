import {z} from 'zod';
import type {PassiveVoiceQuestion} from '../domain/types.js';
import {ValidationError} from '../qa/validationError.js';

export const questionSchema = z.object({
  questionId: z.string().min(1),
  questionNumber: z.number().int().positive(),
  topic: z.string().min(1),
  active: z.object({
    fullSentence: z.string().min(1),
    subject: z.string().min(1),
    adverb: z.string().min(1).optional(),
    verb: z.string().min(1),
    object: z.string().min(1),
  }),
  passive: z.object({
    subject: z.string().min(1),
    be: z.string().min(1),
    adverb: z.string().min(1).optional(),
    verbV3: z.string().min(1),
    agent: z.string().min(1).optional(),
  }),
  grammar: z.object({
    subjectNumber: z.string().min(1),
    beReason: z.string().min(1),
    verbTransformation: z.string().min(1),
    ruleLabel: z.string().min(1),
    rule: z.string().min(1),
  }),
  finalAnswer: z.string().min(1),
});

const issuePath = (path: PropertyKey[]) => path.map(String).join('.') || '<root>';

export async function parseQuestion(input: unknown): Promise<PassiveVoiceQuestion> {
  const result = questionSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(result.error.issues.map((issue) => ({
      source: 'question.json',
      path: issuePath(issue.path),
      message: issue.message,
    })));
  }
  return result.data;
}
