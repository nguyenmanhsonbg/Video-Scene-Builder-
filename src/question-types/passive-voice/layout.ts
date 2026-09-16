export type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const PASSIVE_VOICE_LAYOUT = {
  canvas: {width: 1920, height: 1080, fps: 30},
  header: {left: 136, top: 76, width: 1320, height: 84} satisfies Rect,
  activeLabel: {left: 142, top: 194, width: 420, height: 36} satisfies Rect,
  activeSentence: {left: 170, top: 292, width: 1575, height: 72} satisfies Rect,
  transformation: {left: 194, top: 563, width: 1610, height: 230} satisfies Rect,
  answer: {left: 672, top: 900, width: 1120, height: 112} satisfies Rect,
  subtitle: {left: 180, top: 1020, width: 1560, height: 42} satisfies Rect,
  decorations: {
    topRight: {left: 1682, top: 84, width: 150, height: 5} satisfies Rect,
    bottomLeft: {left: 136, top: 1012, width: 150, height: 5} satisfies Rect,
  },
} as const;
