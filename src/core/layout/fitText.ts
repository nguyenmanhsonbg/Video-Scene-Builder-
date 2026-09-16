import type {TextMeasurer, TextStyle} from './measureText.js';

export type TokenSpec = {
  id: string;
  text: string;
};

export type FitConstraints = Omit<TextStyle, 'fontFamily' | 'fontWeight'> & {
  width: number;
  gap: number;
  minGap: number;
  minFontSize: number;
  fontFamily?: string;
  fontWeight?: number | string;
};

export type FitResult = {
  text: string;
  overflow: boolean;
  layout: {
    mode: 'single-line' | 'two-line';
    gap: number;
    fontSize: number;
    lines: string[];
  };
};

function rowWidth(tokens: TokenSpec[], style: TextStyle, gap: number, measure: TextMeasurer): number {
  return tokens.reduce((total, token) => total + measure(token.text, style), 0) +
    Math.max(0, tokens.length - 1) * gap;
}

function wrapText(tokens: TokenSpec[], style: TextStyle, width: number, measure: TextMeasurer): string[] | null {
  const words = tokens.flatMap((token) => token.text.trim().split(/\s+/).filter(Boolean));
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (measure(word, style) > width) {
      return null;
    }
    const candidate = current === '' ? word : `${current} ${word}`;
    if (current !== '' && measure(candidate, style) > width) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current !== '') {
    lines.push(current);
  }
  return lines;
}

export function fitTokenRow(
  tokens: TokenSpec[],
  constraints: FitConstraints,
  measure: TextMeasurer,
): FitResult {
  const text = tokens.map((token) => token.text).join(' ');
  let gap = Math.max(constraints.minGap, constraints.gap);
  let fontSize = constraints.fontSize;
  let style: TextStyle = {
    fontFamily: constraints.fontFamily ?? 'Be Vietnam Pro, Inter, Arial, sans-serif',
    fontWeight: constraints.fontWeight ?? 400,
    letterSpacing: constraints.letterSpacing,
    fontSize,
  };

  if (rowWidth(tokens, style, gap, measure) > constraints.width) {
    gap = constraints.minGap;
  }
  if (rowWidth(tokens, style, gap, measure) <= constraints.width) {
    return {text, overflow: false, layout: {mode: 'single-line', gap, fontSize, lines: [text]}};
  }

  while (fontSize > constraints.minFontSize) {
    fontSize -= 1;
    style = {...style, fontSize};
    if (rowWidth(tokens, style, gap, measure) <= constraints.width) {
      return {text, overflow: false, layout: {mode: 'single-line', gap, fontSize, lines: [text]}};
    }
  }

  const lines = wrapText(tokens, style, constraints.width, measure);
  if (lines !== null) {
    return {text, overflow: false, layout: {mode: 'two-line', gap, fontSize, lines}};
  }

  return {text, overflow: true, layout: {mode: 'two-line', gap, fontSize, lines: [text]}};
}
