import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import KnowledgeSketch from './KnowledgeSketch';
import '../../assets/styles/KnowledgeArtwork.css';

export default function StudyDesk() {
  const [step, setStep] = useState(1);
  const coefficients = [0.45, 0.8, 1.2];
  return <aside className="study-desk" aria-label="Thử thay đổi một đồ thị">
    <div className="study-desk-heading"><span>TOÁN HỌC, THỬ MỘT CHÚT.</span><span aria-hidden="true">↗</span></div>
    <div className="study-desk-diagram"><KnowledgeSketch kind="curve" step={step} /></div>
    <div className="study-desk-control"><label htmlFor="study-coefficient">Kéo để đổi hệ số <strong>a = {coefficients[step]}</strong></label><input id="study-coefficient" type="range" min="0" max="2" value={step} onChange={event => setStep(Number(event.target.value))} aria-valuetext={`a bằng ${coefficients[step]}`} /></div>
    <p>Đường cong đổi. Cách hiểu cũng mở ra.</p>
    <Link to="/courses">Bắt đầu học <ArrowUpRight size={18} /></Link>
    <div className="study-desk-note"><span>α∫M4A</span><span>f(x) = ax²</span></div>
  </aside>;
}
