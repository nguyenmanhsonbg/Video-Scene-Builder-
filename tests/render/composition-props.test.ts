import {expect, it} from 'vitest';
import {readResolvedQ01Fixture} from '../../tests/helpers/resolvedQ01Fixture.js';
import {getAudioSequences} from '../../src/core/audio/stageAudio.js';

it('places four audio segments at resolved global starts and leaves THINK silent', async () => {
  const {voice, resolvedTimeline} = await readResolvedQ01Fixture();
  const sequences = getAudioSequences(voice, resolvedTimeline, {
    QUESTION: 'audio/Q01_01_question.mp3',
    IDENTIFY_SVO: 'audio/Q01_02_svo.mp3',
    TRANSFORM: 'audio/Q01_03_transform.mp3',
    FINAL_ANSWER: 'audio/Q01_04_answer.mp3',
  });
  expect(sequences).toHaveLength(4);
  expect(sequences.find((item) => item.stage === 'IDENTIFY_SVO')).toMatchObject({start: 10.21});
});
