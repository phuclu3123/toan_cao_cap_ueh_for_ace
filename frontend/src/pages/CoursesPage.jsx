import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Mail,
  Phone,
  Users,
  Video
} from 'lucide-react';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import { coursesData } from '../data/coursesData';
import '../assets/styles/Home.css';
import '../assets/styles/Courses.css';

export default function CoursesPage() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const [form, setForm] = useState({
    name: '',
    contact: '',
    goal: '',
    time: '',
    note: ''
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const body = [
      `Họ tên: ${form.name}`,
      `Liên hệ: ${form.contact}`,
      `Mục tiêu: ${form.goal}`,
      `Thời gian muốn học: ${form.time}`,
      `Ghi chú: ${form.note}`
    ].join('\n');
    window.location.href = `mailto:luphuc321@gmail.com?subject=${encodeURIComponent('Đăng ký tư vấn UEH TCC')}&body=${encodeURIComponent(body)}`;
  };

  const benefits = t.coursesPage.benefits;

  return (
    <div className="home-page courses-page">
      {/* Hero Section */}
      <section className="courses-hero">
        <div className="container">
          <span className="courses-hero-badge">
            <Video size={15} /> {t.coursesPage.kicker || 'KHÓA HỌC E-LEARNING'}
          </span>
          <h1>{t.coursesPage.title || 'Hệ Thống Khóa Học E-Learning UEH TCC'}</h1>
          <p>
            {t.coursesPage.desc ||
              'Học trực tuyến chủ động 24/7 với lộ trình bài giảng video chuẩn HD sắc nét, bài tập thực hành doanh nghiệp và kho tài liệu phong phú.'}
          </p>
        </div>
      </section>

      {/* Courses Catalog Grid (Image 1 Design) */}
      <section id="catalog" className="courses-grid-section">
        <div className="container">
          <div className="section-title section-title-split" style={{ marginBottom: '32px' }}>
            <div>
              <span className="section-subtitle">DANH MỤC KHÓA HỌC</span>
              <h2>Các Khóa Học Đang Mở Đăng Ký</h2>
            </div>
            <p>Chọn khóa học phù hợp với định hướng học tập của bạn để bắt đầu trải nghiệm e-learning ngay hôm nay.</p>
          </div>

          <div className="course-cards-container">
            {coursesData.map((course) => (
              <article className="elearning-card" key={course.id}>
                <div className="elearning-card-cover">
                  <img src={course.image} alt={course.title} />
                  <span className="status-tag-pill">{course.badge}</span>
                </div>
                <div className="elearning-card-body">
                  <div>
                    <h3 className="elearning-card-title">{course.title}</h3>
                    <div className="elearning-meta-row">
                      <span className="elearning-meta-item">
                        <FileText size={15} /> {course.lessonsCount} BÀI
                      </span>
                      <span className="elearning-meta-item">
                        <Users size={15} /> {course.studentsCount} HỌC VIÊN
                      </span>
                    </div>
                  </div>

                  <div className="elearning-card-footer">
                    <div className="elearning-price-block">
                      {course.isFree ? (
                        <span className="price-free-tag">Miễn phí</span>
                      ) : (
                        <>
                          <span className="original-price-crossed">{course.originalPrice}</span>
                          <span className="current-price-tag">{course.discountPrice}</span>
                        </>
                      )}
                    </div>
                    <Link to={`/course/${course.id}`} className="btn-course-detail">
                      CHI TIẾT <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Enrollment Consultation Form */}
      <section id="enroll" className="section" style={{ background: 'var(--course-paper)' }}>
        <div className="container">
          <div className="enroll-panel glass-panel">
            <div className="enroll-copy">
              <span className="section-subtitle">{t.coursesPage.formSubtitle}</span>
              <h2>{t.coursesPage.formTitle}</h2>
              <p>{t.coursesPage.formDesc}</p>
              <div className="enroll-contact-box">
                <a href="tel:0833830322">
                  <Phone size={16} /> 0833830322
                </a>
                <a href="https://zalo.me/0833830322" target="_blank" rel="noopener noreferrer">
                  Zalo: 0833830322
                </a>
                <a href="mailto:luphuc321@gmail.com">
                  <Mail size={16} /> luphuc321@gmail.com
                </a>
              </div>
            </div>

            <form className="enroll-form" onSubmit={handleSubmit}>
              <input
                className="form-input"
                placeholder={t.coursesPage.placeholderName}
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                required
              />
              <input
                className="form-input"
                placeholder={t.coursesPage.placeholderContact}
                value={form.contact}
                onChange={(event) => updateField('contact', event.target.value)}
                required
              />
              <select
                className="form-input"
                value={form.goal}
                onChange={(event) => updateField('goal', event.target.value)}
                required
              >
                <option value="" disabled>
                  {t.coursesPage.goalTitle}
                </option>
                {t.coursesPage.goals.map((goalOpt) => (
                  <option key={goalOpt} value={goalOpt}>
                    {goalOpt}
                  </option>
                ))}
              </select>
              <select
                className="form-input"
                value={form.time}
                onChange={(event) => updateField('time', event.target.value)}
                required
              >
                <option value="" disabled>
                  {t.coursesPage.timeTitle}
                </option>
                {t.coursesPage.times.map((timeOpt) => (
                  <option key={timeOpt} value={timeOpt}>
                    {timeOpt}
                  </option>
                ))}
              </select>
              <textarea
                className="form-input text-area"
                rows="4"
                placeholder={t.coursesPage.placeholderNote}
                value={form.note}
                onChange={(event) => updateField('note', event.target.value)}
              />
              <button className="btn btn-primary consult-red" type="submit">
                {t.coursesPage.btnSubmit}
              </button>
            </form>

            <div className="enroll-benefits">
              {benefits.map((benefit) => (
                <span key={benefit}>
                  <CheckCircle size={15} /> {benefit}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
