import {Text} from './Text.js';

export type GrammarRuleProps = {
  label: string;
  rule: string;
  visible?: boolean;
  opacity?: number;
};

export function GrammarRule({label, rule, visible = true, opacity = 1}: GrammarRuleProps) {
  return (
    <>
      <Text
        id="grammar_rule_label"
        visible={visible}
        opacity={opacity}
        style={{left: 150, top: 840, fontSize: 27, lineHeight: 1.2, color: '#0E2B47'}}
      >
        {label}
      </Text>
      <Text
        id="grammar_rule_text"
        visible={visible}
        opacity={opacity}
        style={{left: 150, top: 885, fontSize: 27, lineHeight: 1.2, color: '#0E2B47'}}
      >
        {rule}
      </Text>
    </>
  );
}
