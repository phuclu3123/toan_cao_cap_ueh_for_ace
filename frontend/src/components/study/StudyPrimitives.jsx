import MathRenderer from '../MathRenderer';
import { normalizeStudyMathText } from '../../../../shared/studyMath.mjs';
// One renderer keeps formula typography and overflow consistent across study modes.
export function MathText({ children, className = '', inline = false }) {
  const rawText = typeof children === 'string' || typeof children === 'number' ? String(children) : '';
  const text = normalizeStudyMathText(rawText.replace(/\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})/g, (_, unicode, hex) => String.fromCharCode(parseInt(unicode || hex, 16))), { inline });
  if (inline) return <MathRenderer text={text} inline emoticons={false} className={`study-math ${className}`} />;
  return <div className={`study-math ${className}`}><MathRenderer text={text} emoticons={false} /></div>;
}
