export const ANIMATION_PRESETS = {
  APPEAR: {duration: 0},
  FADE_IN: {duration: 0.3},
  FADE_UP: {duration: 0.35},
  UNDERLINE_REVEAL: {duration: 0.35},
  HIGHLIGHT: {duration: 0.25},
  OUTLINE_REVEAL: {duration: 0.35},
  MOVE_TO: {duration: 0.55},
  REPLACE: {duration: 0.35},
  BUILD_TOKEN: {duration: 0.25},
} as const;

export type AnimationPreset = keyof typeof ANIMATION_PRESETS;
