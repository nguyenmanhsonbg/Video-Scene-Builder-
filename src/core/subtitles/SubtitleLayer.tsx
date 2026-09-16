import type {CSSProperties} from 'react';
import type {SubtitleCue} from './subtitleCues.js';

export type SubtitleLayerProps = {
  cues: SubtitleCue[];
  time: number;
};

export function SubtitleLayer({cues, time}: SubtitleLayerProps) {
  const activeCue = cues.find((cue) => time >= cue.start && time < cue.end);
  return (
    <div
      data-subtitle-layer="true"
      style={{
        position: 'absolute',
        left: 180,
        top: 1020,
        width: 1560,
        minHeight: 42,
        color: '#111111',
        fontFamily: 'Be Vietnam Pro, Inter, Arial, sans-serif',
        fontSize: 24,
        lineHeight: 1.25,
        textAlign: 'center',
        whiteSpace: 'pre-wrap',
        visibility: activeCue === undefined ? 'hidden' : 'visible',
      } satisfies CSSProperties}
    >
      {activeCue?.text ?? ''}
    </div>
  );
}
