import type {CSSProperties} from 'react';

export type UnderlineProps = {
  id: string;
  left: number;
  top: number;
  width: number;
  color: string;
  visible?: boolean;
  opacity?: number;
};

export function Underline({id, left, top, width, color, visible = true, opacity = 1}: UnderlineProps) {
  return (
    <div
      data-element-id={id}
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height: 7,
        borderRadius: 4,
        backgroundColor: color,
        visibility: visible ? 'visible' : 'hidden',
        opacity: visible ? opacity : 0,
      } satisfies CSSProperties}
    />
  );
}
