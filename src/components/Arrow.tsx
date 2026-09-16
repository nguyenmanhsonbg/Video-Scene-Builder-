import type {CSSProperties} from 'react';

export type ArrowProps = {
  id: string;
  left: number;
  top: number;
  children?: string;
  visible?: boolean;
  opacity?: number;
};

export function Arrow({id, left, top, children = '→', visible = true, opacity = 1}: ArrowProps) {
  return (
    <div
      data-element-id={id}
      aria-label="Object to Passive Subject"
      style={{
        position: 'absolute',
        left,
        top,
        width: 190,
        height: 70,
        color: '#BDBDBD',
        fontSize: 66,
        lineHeight: 1,
        fontWeight: 300,
        textAlign: 'center',
        visibility: visible ? 'visible' : 'hidden',
        opacity: visible ? opacity : 0,
      } satisfies CSSProperties}
    >
      {children}
    </div>
  );
}
