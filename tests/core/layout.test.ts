import {describe, expect, it} from 'vitest';
import {fitTokenRow} from '../../src/core/layout/fitText.js';

const measure = (text: string, style: {fontSize: number}) =>
  text.length * style.fontSize * 0.5;

describe('text fitting', () => {
  it('reduces gaps before reducing font size', () => {
    const result = fitTokenRow(
      [{id: 'subject', text: 'Doctors'}, {id: 'object', text: "patients' blood pressure"}],
      {width: 900, gap: 80, minGap: 20, fontSize: 56, minFontSize: 34},
      measure,
    );
    expect(result.layout.gap).toBe(20);
    expect(result.layout.fontSize).toBe(56);
    expect(result.overflow).toBe(false);
  });

  it('uses two lines when the minimum font cannot fit', () => {
    const result = fitTokenRow(
      [{id: 'object', text: 'A very long object that cannot fit inside the fixed canvas region'}],
      {width: 700, gap: 32, minGap: 16, fontSize: 56, minFontSize: 34},
      measure,
    );
    expect(result.layout.mode).toBe('two-line');
    expect(result.overflow).toBe(false);
  });

  it('reports severe overflow instead of cutting text', () => {
    const result = fitTokenRow(
      [{id: 'object', text: 'A very long object that cannot fit'}],
      {width: 100, gap: 16, minGap: 8, fontSize: 56, minFontSize: 34},
      measure,
    );
    expect(result.overflow).toBe(true);
    expect(result.text).toContain('A very long object');
  });
});
