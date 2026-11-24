import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { practiceCatalog } from '../../data/practiceCatalog';

export default function CatalogSummary() {
  const [documents, setDocuments] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    fetch(`${API_BASE_URL}/api/resources`, { signal: controller.signal }).then(async response => {
      const result = await response.json();
      if (!response.ok || !result.success || !result.resources) return;
      const files = Object.values(result.resources).flat().filter(item => /\.pdf$/i.test(item.pdf || ''));
      setDocuments(new Set(files.map(item => item.id)).size);
    }).catch(() => {}).finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);
  const rows = [
    { value: practiceCatalog.reduce((sum, exam) => sum + exam.questionsCount, 0), label: 'Câu luyện tập', href: '/exams' },
    { value: practiceCatalog.length, label: 'Bộ đề tương tác', href: '/exams' },
    { value: documents ?? '—', label: 'Tài liệu PDF', href: '/resources' }
  ];
  return <section className="home-catalog-summary" aria-label="Học liệu hiện có">
    <div className="container hp-catalog-inner">
      <div className="hp-catalog-intro"><span className="hp-kicker">HỌC LIỆU ĐANG CÓ</span><p>Chọn đúng phần<br/>bạn đang cần.</p></div>
      <dl className="hp-catalog-counts">{rows.map(row => <div key={row.label}>
        <dt>{row.label}</dt>
        <dd><Link to={row.href} aria-label={`${row.value} ${row.label.toLowerCase()}`}><span>{row.value}</span><ArrowUpRight size={19}/></Link></dd>
      </div>)}</dl>
    </div>
  </section>;
}
