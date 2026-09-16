import {AnswerBar} from '../../components/AnswerBar.js';
import {GrammarRule} from '../../components/GrammarRule.js';
import {Text} from '../../components/Text.js';

export type FinalAnswerProps = {
  answer: string;
  ruleLabel?: string;
  rule?: string;
  visible?: boolean;
  ruleVisible?: boolean;
  opacity?: number;
};

export function FinalAnswer({answer, ruleLabel = '', rule = '', visible = true, ruleVisible = visible, opacity = 1}: FinalAnswerProps) {
  return (
    <>
      <AnswerBar visible={visible} opacity={opacity} />
      <Text
        id="answer_text"
        visible={visible}
        opacity={opacity}
        style={{left: 730, top: 929, width: 1000, height: 58, fontSize: 42, lineHeight: 1.2, textAlign: 'center', color: '#7EC0FF', whiteSpace: 'nowrap'}}
      >
        ✓ {answer}
      </Text>
      <GrammarRule label={ruleLabel} rule={rule} visible={ruleVisible} opacity={opacity} />
    </>
  );
}
