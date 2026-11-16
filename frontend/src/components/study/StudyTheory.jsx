import { useState } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, FileText, Plus } from 'lucide-react';
import { MathText } from './StudyPrimitives';
import { cleanStudyTitle } from '../../utils/studyLabels';
import MathExplorers from './MathExplorers';
export default function StudyTheory({ topic, selectedSection, onSection, onReview, onCreate }) {
  const section = topic.lesson.sections.find(item => item.id === selectedSection) || topic.lesson.sections[0];
  const index = topic.lesson.sections.indexOf(section);
  return <div className="study-theory-layout"><article className="study-article">
    <div className="study-section-heading"><span className="study-muted">Mục {index + 1} / {topic.lesson.sections.length}</span><button className="study-text-button" onClick={() => onCreate(section)}><Plus size={14} /> Tạo thẻ từ mục này</button></div>
    <h2><MathText inline>{cleanStudyTitle(section.title)}</MathText></h2>
    {section.conditions && <div className="study-condition"><strong>Điều kiện áp dụng</strong><MathText>{section.conditions}</MathText></div>}
    <div className="study-definition"><MathText>{section.definition || section.content}</MathText></div>
    {section.scene && <MathExplorers key={`${topic.id}:${section.id}`} scene={section.scene} />}
    {section.definition && <div className="study-prose"><MathText>{section.content}</MathText></div>}
    <WorkedExample key={section.id} example={section.workedExample || topic.lesson.workedExample} />

    <div className="study-article-actions"><button className="study-button" disabled={index === 0} onClick={() => onSection(topic.lesson.sections[index - 1].id)}><ChevronLeft size={16} /> Mục trước</button><button className="study-button study-primary" onClick={() => onReview(section.id)}>Ôn thẻ liên quan <ArrowRight size={16} /></button>{index < topic.lesson.sections.length - 1 && <button className="study-button" onClick={() => onSection(topic.lesson.sections[index + 1].id)}>Mục tiếp <ChevronRight size={16} /></button>}</div>
    <section className="study-errors"><h3>Nhận diện sai lầm</h3>{[section.trap].filter(Boolean).map((trap, position) => <details key={position}><summary><MathText inline>{trap.title.replace(/^Bẫy \d+:\s*/, '')}</MathText><Plus size={16} /></summary><div className="study-error-detail"><span className="study-muted">Lập luận cần kiểm tra</span><MathText>{trap.wrong}</MathText><strong>Giải thích đúng</strong><MathText>{trap.right}</MathText><MathText>{trap.explanation}</MathText></div></details>)}</section>
    {(section.references || topic.references).length > 0 && <section className="study-references"><h3>Tài liệu đối chiếu</h3>{(section.references || topic.references).map(reference => <p key={reference}><FileText size={14} />{reference}</p>)}</section>}
    </article><aside className="study-outline" aria-label="Mục lục bài học"><h3>Trong chuyên đề này</h3>{topic.lesson.sections.map((item, position) => <button key={item.id} onClick={() => onSection(item.id)} aria-current={section.id === item.id ? 'step' : undefined}><span>{String(position + 1).padStart(2, '0')}</span><MathText inline>{cleanStudyTitle(item.title)}</MathText></button>)}<div className="study-goals"><h3>Sau khi học</h3>{topic.lesson.objectives.map((objective, position) => <p key={position}><Check size={14} /><span><MathText inline>{objective}</MathText></span></p>)}</div></aside></div>;
}

function WorkedExample({ example }) {
  const [stepCount, setStepCount] = useState(0);
  return <section className="study-worked"><div className="study-section-heading"><h3>Ví dụ có hướng dẫn</h3><span className="study-muted">{stepCount} / {example.steps.length} bước</span></div><MathText>{example.question}</MathText><p className="study-muted">Tự xác định hướng giải trước khi xem từng bước.</p><ol className="study-solution">{example.steps.slice(0, stepCount).map((step, position) => <li key={position}><span>{position + 1}</span><MathText>{step.replace(/^Bước \d+:\s*/, '')}</MathText></li>)}</ol><div className="study-row-actions"><button className="study-button" onClick={() => setStepCount(value => Math.min(value + 1, example.steps.length))} disabled={stepCount === example.steps.length}>Xem bước tiếp theo <ChevronDown size={16} /></button>{stepCount > 0 && <button className="study-text-button" onClick={() => setStepCount(0)}>Ẩn lời giải</button>}</div>{stepCount === example.steps.length && <div className="study-condition"><strong>Kiểm tra lại kết quả</strong><MathText>{example.casioTip}</MathText></div>}</section>;
}
