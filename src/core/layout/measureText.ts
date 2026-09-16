export type TextStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  letterSpacing?: number;
};

export type TextMeasurer = (text: string, style: TextStyle) => number;

export type CanvasTextContext = {
  font: string;
  measureText(text: string): {width: number};
};

export function measureTextFromContext(
  context: CanvasTextContext,
  text: string,
  style: TextStyle,
): number {
  context.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
  const baseWidth = context.measureText(text).width;
  const letterSpacing = style.letterSpacing ?? 0;
  return baseWidth + Math.max(0, text.length - 1) * letterSpacing;
}

export const measureTextInBrowser: TextMeasurer = (text, style) => {
  if (typeof document === 'undefined') {
    throw new Error('browser text measurement requires a document');
  }
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context === null) {
    throw new Error('unable to create a 2D canvas context');
  }
  return measureTextFromContext(context, text, style);
};
