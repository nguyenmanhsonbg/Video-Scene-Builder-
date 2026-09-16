import {describe, expect, it} from 'vitest';
import {animationPresetFor} from '../../src/core/animation/mapActionToPreset.js';
import {progressAt} from '../../src/core/animation/interpolate.js';

describe('animation grammar', () => {
  it('maps each supported action to its fixed preset', () => {
    expect(animationPresetFor('SHOW')).toBe('FADE_IN');
    expect(animationPresetFor('REVEAL_UNDERLINE')).toBe('UNDERLINE_REVEAL');
    expect(animationPresetFor('REVEAL_OUTLINE')).toBe('OUTLINE_REVEAL');
    expect(animationPresetFor('HIGHLIGHT')).toBe('HIGHLIGHT');
    expect(animationPresetFor('MOVE_OBJECT')).toBe('MOVE_TO');
    expect(animationPresetFor('CHANGE_VERB')).toBe('REPLACE');
    expect(animationPresetFor('BUILD')).toBe('BUILD_TOKEN');
  });

  it('returns a clamped deterministic progress value', () => {
    expect(progressAt(1, 0, 2)).toBe(0.5);
    expect(progressAt(-1, 0, 2)).toBe(0);
    expect(progressAt(3, 0, 2)).toBe(1);
  });
});
