import { useEffect, useRef, useState } from 'react';
import { saveStudyTopic } from '../../services/studyContentService';
import { MathText } from './StudyPrimitives';
import '../../assets/styles/StudyContentEditor.css';

export default function StudyContentEditor({ topic, version, onSaved, onClose }) {
  const [draft, setDraft] = useState(() => structuredClone(topic));
  const [sectionId, setSectionId] = useState(topic.lesson.sections[0].id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const dialogRef = useRef(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(topic);
  const section = draft.lesson.sections.find(s => s.id === sectionId);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = dialogRef.current; dialog.showModal();
    return () => { dialog.close(); previous?.focus?.(); };
  }, []);
  useEffect(() => {
    const handleBeforeUnload = event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);
  // Keep stable section IDs so existing personal progress keeps its references.
  const handleSectionChange = next => setDraft(previous => ({ ...previous, lesson: { ...previous.lesson, sections: previous.lesson.sections.map(s => s.id === sectionId ? next : s) } }));
  const handleClose = () => { if (!busy && (!dirty || window.confirm('Bỏ các thay đổi chưa lưu?'))) onClose(); };
  const handleSave = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try { const result = await saveStudyTopic(draft, version); onSaved(result); onClose(); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  const handleQuizChange = (index, patch) => setDraft(previous => ({ ...previous, quiz: previous.quiz.map((q, i) => i === index ? { ...q, ...patch } : q) }));
  const field = (label, value, onChange, rows = 3) => <label>{label}<textarea aria-label={label} required maxLength={30000} rows={rows} value={value || ''} onChange={event => onChange(event.target.value)} /></label>;
  return <dialog ref={dialogRef} className="study-content-editor" aria-labelledby="content-editor-title" onCancel={event => { event.preventDefault(); handleClose(); }}>
    <form onSubmit={handleSave}>
      <header><div><h2 id="content-editor-title">Biên tập {topic.shortTitle}</h2><p>Bản {version} · Lưu để cập nhật học liệu chung.</p></div><button className="study-button" type="button" disabled={busy} onClick={handleClose}>Đóng</button></header>
      <fieldset disabled={busy}>
        {field('Tên chương', draft.shortTitle, value => setDraft({ ...draft, shortTitle: value, title: value }), 1)}
        <label>Mục học liệu<select value={sectionId} onChange={event => setSectionId(event.target.value)}>{draft.lesson.sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
        <button type="button" className="study-button" onClick={() => setPreview(value => !value)}>{preview ? 'Tiếp tục sửa' : 'Xem trước công thức'}</button>
        {preview ? <div className="study-prose"><h3>{section.title}</h3>{[section.conditions, section.definition, section.content, section.workedExample.question, ...section.workedExample.steps].map((value, i) => <MathText key={i}>{value}</MathText>)}</div> : <>
          {['title','conditions','definition','content'].map(key => <div key={key}>{field(({ title: 'Tên mục', conditions: 'Điều kiện áp dụng', definition: 'Định nghĩa', content: 'Nội dung (Markdown và LaTeX)' })[key], section[key], value => handleSectionChange({ ...section, [key]: value }), key === 'content' ? 9 : 3)}</div>)}
          {field('Nguồn đối chiếu (mỗi dòng một nguồn)', section.references.join('\n'), value => handleSectionChange({ ...section, references: value.split('\n') }))}
          <h3>Thẻ gợi nhớ</h3>{(section.recalls || [section.recall]).map((recall, i, recalls) => <div key={i}>{['front','back'].map(key => <div key={key}>{field(key === 'front' ? `Câu hỏi ${i + 1}` : 'Đáp án', recall[key], value => { const next = recalls.map((r, index) => index === i ? { ...r, [key]: value } : r); handleSectionChange({ ...section, recall: next[0], ...(section.recalls ? { recalls: next } : {}) }); })}</div>)}</div>)}
          <h3>Ví dụ có hướng dẫn</h3>
          {field('Đề bài', section.workedExample.question, value => handleSectionChange({ ...section, workedExample: { ...section.workedExample, question: value } }))}
          {section.workedExample.steps.map((step, i) => <div key={i}>{field(`Bước ${i + 1}`, step, value => handleSectionChange({ ...section, workedExample: { ...section.workedExample, steps: section.workedExample.steps.map((s, index) => index === i ? value : s) } }))}</div>)}
          {field('Kiểm tra kết quả', section.workedExample.casioTip, value => handleSectionChange({ ...section, workedExample: { ...section.workedExample, casioTip: value } }))}
          <h3>Nhận diện sai lầm</h3>{Object.entries({ title: 'Tên lỗi', wrong: 'Lập luận sai', right: 'Lập luận đúng', explanation: 'Giải thích' }).map(([key, label]) => <div key={key}>{field(label, section.trap[key], value => handleSectionChange({ ...section, trap: { ...section.trap, [key]: value } }))}</div>)}
        </>}
        <details><summary>Câu tự kiểm tra của mục này</summary>{draft.quiz.map((q, i) => q.sectionId === sectionId && <section key={q.id}>
          {field('Câu hỏi', q.question, value => handleQuizChange(i, { question: value }))}
          {q.options.map((option, index) => <div key={index}>{field(`Lựa chọn ${index + 1}`, option, value => handleQuizChange(i, { options: q.options.map((s, j) => j === index ? value : s) }), 1)}</div>)}
          <label>Đáp án đúng<select value={q.correctIndex} onChange={event => handleQuizChange(i, { correctIndex: Number(event.target.value) })}>{q.options.map((_, index) => <option key={index} value={index}>Lựa chọn {index + 1}</option>)}</select></label>
          {field('Giải thích', q.explanation, value => handleQuizChange(i, { explanation: value }))}
        </section>)}</details>
      </fieldset>
      {error && <p role="alert" className="study-notice">{error} Bản sửa vẫn được giữ trong cửa sổ này.</p>}
      <footer><span>{dirty ? 'Có thay đổi chưa lưu' : 'Chưa có thay đổi'}</span><button className="study-button study-primary" disabled={busy || !dirty} type="submit">{busy ? 'Đang lưu…' : 'Lưu học liệu'}</button></footer>
    </form>
  </dialog>;
}
