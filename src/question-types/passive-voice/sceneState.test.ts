import {expect, it} from 'vitest';
import {readResolvedQ01Fixture} from '../../../tests/helpers/resolvedQ01Fixture.js';
import {getPassiveVoiceSceneState} from './sceneState.js';

it('keeps S/V/O hidden during QUESTION and THINK', async () => {
  const {question, resolvedTimeline} = await readResolvedQ01Fixture();
  expect(getPassiveVoiceSceneState(question, resolvedTimeline, 2).labelS.visible).toBe(false);
  expect(getPassiveVoiceSceneState(question, resolvedTimeline, 8).labelS.visible).toBe(false);
});

it('reveals the subject marker after its resolved event', async () => {
  const {question, resolvedTimeline} = await readResolvedQ01Fixture();
  expect(getPassiveVoiceSceneState(question, resolvedTimeline, 13.3).labelS.visible).toBe(false);
  expect(getPassiveVoiceSceneState(question, resolvedTimeline, 13.6).labelS.visible).toBe(true);
});

it('never reveals the answer before FINAL_ANSWER starts', async () => {
  const {question, resolvedTimeline} = await readResolvedQ01Fixture();
  expect(getPassiveVoiceSceneState(question, resolvedTimeline, 53.17).answer.visible).toBe(false);
  expect(getPassiveVoiceSceneState(question, resolvedTimeline, 53.18).answer.visible).toBe(true);
});

it('scopes the THINK prompt to the THINK stage', async () => {
  const {question, resolvedTimeline} = await readResolvedQ01Fixture();
  expect(getPassiveVoiceSceneState(question, resolvedTimeline, 8).elements.think_prompt.visible).toBe(true);
  expect(getPassiveVoiceSceneState(question, resolvedTimeline, 12).elements.think_prompt.visible).toBe(false);
});
