import {describe, expect, it} from 'vitest';
import {parseQuestion, parseTimeline, parseVoice} from '../../src/core/schema/loadInputPackage.js';
import {readFile} from 'node:fs/promises';

const fixture = async (name: string) =>
  JSON.parse(await readFile(`tests/fixtures/Q01/${name}`, 'utf8')) as unknown;

describe('input schemas', () => {
  it('accepts the complete Q01 question package documents', async () => {
    await expect(parseQuestion(await fixture('question.json'))).resolves.toMatchObject({
      questionId: 'Q01',
      active: {subject: 'Doctors', verb: 'check', object: "patients' blood pressure"},
    });
    await expect(parseVoice(await fixture('voice.json'))).resolves.toMatchObject({questionId: 'Q01'});
    await expect(parseTimeline(await fixture('timeline.json'))).resolves.toMatchObject({questionId: 'Q01'});
  });

  it('rejects a question without an object', async () => {
    const question = await fixture('question.json') as Record<string, unknown>;
    const active = {...question.active as Record<string, unknown>};
    delete active.object;
    await expect(parseQuestion({...question, active})).rejects.toThrow(/object/i);
  });

  it('rejects a voice manifest missing one of the five stages', async () => {
    const voice = await fixture('voice.json') as {segments: unknown[]; questionId: string};
    await expect(parseVoice({...voice, segments: voice.segments.slice(1)})).rejects.toThrow(/stage/i);
  });

  it('requires THINK to be silent and every other stage to have audio', async () => {
    const voice = await fixture('voice.json') as {segments: Array<Record<string, unknown>>; questionId: string};
    const invalid = voice.segments.map((segment) =>
      segment.id === 'THINK' ? {...segment, audio: 'audio/think.mp3'} : segment,
    );
    await expect(parseVoice({...voice, segments: invalid})).rejects.toThrow(/THINK|audio/i);
  });
});
