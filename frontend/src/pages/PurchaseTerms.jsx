import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { commerceRequest, downloadJson } from '../services/courseCommerceService';
import '../assets/styles/CourseCommerceAdmin.css';

export default function PurchaseTerms() {
  const [terms, setTerms] = useState(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    commerceRequest('/terms', undefined, controller.signal).then(result => setTerms(result.data)).catch(failure => { if (failure.name !== 'AbortError') setError(failure.message); });
    return () => controller.abort();
  }, [refresh]);
  return <article className="commerce-admin purchase-terms"><Link className="admin-back" to="/courses">← Về khóa học</Link><p className="admin-eyebrow">α∫M4A / CHÍNH SÁCH MUA HÀNG</p><h1>{terms?.title || 'Điều khoản mua khóa học'}</h1>{error && <p className="admin-alert is-error" role="alert">{error} <button onClick={() => { setError(''); setRefresh(value => value + 1); }}>Thử lại</button></p>}{!terms ? !error && <p role="status">Đang tải điều khoản…</p> : <><p>Phiên bản {terms.version} · Áp dụng từ {terms.effectiveDate}</p><div className="admin-sheet">{terms.sections.map(section => <section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}<p><strong>{terms.seller.name}</strong> · {terms.seller.role}<br /><a href={`mailto:${terms.seller.email}`}>{terms.seller.email}</a></p><button className="admin-button" onClick={() => downloadJson(terms, `dieu-khoan-${terms.version}.json`)}>Tải điều khoản</button></div></>}</article>;
}
