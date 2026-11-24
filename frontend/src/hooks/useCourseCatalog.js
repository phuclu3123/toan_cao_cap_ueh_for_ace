import { useEffect, useMemo, useState } from 'react';
import { coursesData } from '../data/coursesData';
import { commerceRequest, COMMERCE_EVENT, money } from '../services/courseCommerceService';

export default function useCourseCatalog() {
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let controller;
    const load = () => {
      controller?.abort(); controller = new AbortController();
      commerceRequest('/catalog', undefined, controller.signal).then(result => {
        if (active) { setOffers(result.data); setError(''); }
      }).catch(failure => { if (active && failure.name !== 'AbortError') setError('Chưa cập nhật được học phí. Giá sẽ được xác nhận lại khi đăng ký.'); });
    };
    const handleVisible = () => { if (document.visibilityState === 'visible') load(); };
    load(); window.addEventListener(COMMERCE_EVENT, load); window.addEventListener('focus', load); document.addEventListener('visibilitychange', handleVisible);
    return () => { active = false; controller?.abort(); window.removeEventListener(COMMERCE_EVENT, load); window.removeEventListener('focus', load); document.removeEventListener('visibilitychange', handleVisible); };
  }, []);
  const courses = useMemo(() => coursesData.map(course => {
    const offer = offers.find(row => row.id === course.id);
    if (!offer) return course;
    return { ...course, discountPrice: money(offer.amount), originalPrice: money(offer.compareAtAmount || offer.amount), badge: offer.isClosed ? 'TẠM ĐÓNG' : 'ĐANG MỞ ĐĂNG KÝ', priceNote: 'HỌC PHÍ', isClosed: offer.isClosed, checkoutEnabled: !offer.isClosed, isFree: false, commerceVersion: offer.version,
      studentsCount: Number.isInteger(offer.studentsCount) ? offer.studentsCount : null,
      lessonsCount: Number.isInteger(offer.lessonsCount) ? offer.lessonsCount : null,
      sectionsCount: Number.isInteger(offer.sectionsCount) ? offer.sectionsCount : null
    };
  }), [offers]);
  return { courses, error };
}
