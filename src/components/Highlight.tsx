import type {CSSProperties} from 'react';

export type HighlightProps = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  visible?: boolean;
  opacity?: number;
};

export function Highlight({id, left, top, width, height, color, visible = true, opacity = 1}: HighlightProps) {
  return (
    <div
      data-element-id={id}
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        borderRadius: 12,
        backgroundColor: color,
        visibility: visible ? 'visible' : 'hidden',
        opacity: visible ? opacity : 0,
      } satisfies CSSProperties}
    />
  );
}
