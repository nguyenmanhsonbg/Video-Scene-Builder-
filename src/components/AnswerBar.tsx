import type {CSSProperties} from 'react';

export type AnswerBarProps = {
  id?: string;
  visible?: boolean;
  opacity?: number;
};

export function AnswerBar({id = 'answer_box', visible = true, opacity = 1}: AnswerBarProps) {
  return (
    <div
      data-element-id={id}
      style={{
        position: 'absolute',
        left: 672,
        top: 900,
        width: 1120,
        height: 112,
        backgroundColor: '#0E2B47',
        visibility: visible ? 'visible' : 'hidden',
        opacity: visible ? opacity : 0,
      } satisfies CSSProperties}
    />
  );
}
