import {describe, expect, it} from 'vitest';
import {ROOT_COMPOSITION_ID, createRoot} from '../../src/Root.js';

describe('Remotion bootstrap', () => {
  it('exposes the passive voice composition id and root factory', () => {
    expect(ROOT_COMPOSITION_ID).toBe('PassiveVoice');
    expect(createRoot()).toBeDefined();
  });
});
