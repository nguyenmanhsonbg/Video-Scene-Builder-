import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import type {InputPackage} from '../domain/types.js';
import {ValidationError} from '../qa/validationError.js';
import {parseQuestion} from './question.js';
import {parseTimeline} from './timeline.js';
import {parseVoice} from './voice.js';

async function readJsonFile(inputDir: string, filename: string): Promise<unknown> {
  const absolutePath = join(inputDir, filename);
  let source: string;
  try {
    source = await readFile(absolutePath, 'utf8');
  } catch (error) {
    throw new ValidationError([{
      source: absolutePath,
      path: '<file>',
      message: error instanceof Error ? error.message : 'unable to read file',
    }]);
  }

  try {
    return JSON.parse(source) as unknown;
  } catch (error) {
    throw new ValidationError([{
      source: absolutePath,
      path: '<json>',
      message: error instanceof Error ? error.message : 'invalid JSON',
    }]);
  }
}

export async function loadInputPackage(inputDir: string): Promise<InputPackage> {
  const [questionInput, voiceInput, timelineInput] = await Promise.all([
    readJsonFile(inputDir, 'question.json'),
    readJsonFile(inputDir, 'voice.json'),
    readJsonFile(inputDir, 'timeline.json'),
  ]);
  const [question, voice, timeline] = await Promise.all([
    parseQuestion(questionInput),
    parseVoice(voiceInput),
    parseTimeline(timelineInput),
  ]);

  const questionIds = new Set([question.questionId, voice.questionId, timeline.questionId]);
  if (questionIds.size !== 1) {
    throw new ValidationError([{
      source: inputDir,
      path: 'questionId',
      message: 'questionId must match in question.json, voice.json, and timeline.json',
    }]);
  }

  return {inputDir, question, voice, timeline};
}

export {parseQuestion} from './question.js';
export {parseTimeline} from './timeline.js';
export {parseVoice} from './voice.js';
