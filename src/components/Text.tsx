import type {CSSProperties, ReactNode} from 'react';

export type TextProps = {
  id: string;
  children: ReactNode;
  style?: CSSProperties;
  visible?: boolean;
  opacity?: number;
};

export function Text({id, children, style, visible = true, opacity = 1}: TextProps) {
  return (
    <div
      data-element-id={id}
      style={{
        position: 'absolute',
        visibility: visible ? 'visible' : 'hidden',
        opacity: visible ? opacity : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
