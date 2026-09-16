import {renderToStaticMarkup} from 'react-dom/server';
import {expect, it} from 'vitest';
import {ActiveSentence} from '../../../src/question-types/passive-voice/ActiveSentence.js';
import {FinalAnswer} from '../../../src/question-types/passive-voice/FinalAnswer.js';

it('renders four independently addressable active sentence tokens', () => {
  const html = renderToStaticMarkup(
    <ActiveSentence subject="Doctors" adverb="often" verb="check" object="patients' blood pressure" />,
  );
  expect(html).toContain('data-element-id="active_subject"');
  expect(html).toContain('data-element-id="active_adverb"');
  expect(html).toContain('data-element-id="active_verb"');
  expect(html).toContain('data-element-id="active_object"');
});

it('renders answer as separate box and text IDs', () => {
  const html = renderToStaticMarkup(
    <FinalAnswer answer="Patients' blood pressure is often checked by doctors." visible />,
  );
  expect(html).toContain('data-element-id="answer_box"');
  expect(html).toContain('data-element-id="answer_text"');
});
