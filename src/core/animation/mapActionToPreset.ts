import type {VisualAction} from '../domain/types.js';
import type {AnimationPreset} from './presets.js';

export function animationPresetFor(action: VisualAction): AnimationPreset {
  switch (action) {
    case 'SHOW':
      return 'FADE_IN';
    case 'HIDE':
      return 'FADE_IN';
    case 'HIGHLIGHT':
      return 'HIGHLIGHT';
    case 'REVEAL_UNDERLINE':
      return 'UNDERLINE_REVEAL';
    case 'REVEAL_OUTLINE':
      return 'OUTLINE_REVEAL';
    case 'MOVE_OBJECT':
      return 'MOVE_TO';
    case 'CHANGE_VERB':
      return 'REPLACE';
    case 'BUILD':
      return 'BUILD_TOKEN';
    default: {
      const unreachable: never = action;
      throw new Error(`unsupported visual action: ${String(unreachable)}`);
    }
  }
}
