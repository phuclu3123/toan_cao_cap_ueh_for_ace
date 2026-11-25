import StudyWelcome from '../components/learning/StudyWelcome';
import { StudyIcon } from '../components/learning/StudyDoodles';
import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Mail,
  Phone,
  Play,
  Users,
  Video
} from 'lucide-react';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import useCourseCatalog from '../hooks/useCourseCatalog';
import KnowledgeSketch from '../components/learning/KnowledgeSketch';
import CourseLessonPreview from '../components/learning/CourseLessonPreview';
import { coursePreviewLessons } from '../data/coursePreviewData';
import '../assets/styles/Home.css';
import '../assets/styles/Courses.css';
import '../assets/styles/EditorialType.css';
import '../assets/styles/LearningCatalog.css';

export default function CoursesPage() {
  const { courses: coursesData, error: catalogError } = useCourseCatalog();
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
    window.location.href = `mailto:luphuc321@gmail.com?subject=${encodeURIComponent('Đăng ký tư vấn α∫M4A')}&body=${encodeURIComponent(body)}`;
  };

  const benefits = t.coursesPage.benefits;
  const sampleLessons = [0,3,5,7].map(index=>coursePreviewLessons[index]).filter(lesson=>lesson && !lesson.isLocked);

  return (
    <div className="home-page courses-page designed-courses">
      {/* Hero Section */}
      <section className="courses-hero">
        <div className="container">
          <div>
          <span className="courses-hero-badge">
            <Video size={15} /> {t.coursesPage.kicker || 'KHÓA HỌC E-LEARNING'}
          </span>
          <h1>{language === 'vi' ? <>Học từ gốc.<br/><em>Vững từng bài.</em></> : t.coursesPage.title}</h1>
          <p>
            {language === 'vi' ? 'Bài giảng theo chương, bài tập và lời giải. Chọn phần kiến thức bạn cần học.' : t.coursesPage.desc}
          </p>
          <div className="course-hero-links"><a href="#catalog" className="btn btn-primary">Xem khóa học <ArrowRight size={16} /></a><a href="#enroll" className="btn btn-secondary">Hỏi về lộ trình</a></div>
          <div className="course-learning-signals"><span><Play size={14}/> Xem bài giảng thật</span><span><FileText size={14}/> Học theo chủ đề</span><span><CheckCircle size={14}/> Xem thử trước</span></div>
          </div>
          <CourseLessonPreview/>
        </div>
      </section>

      {/* Courses Catalog Grid (Image 1 Design) */}
      <section id="catalog" className="courses-grid-section">
        <div className="container">
          <div className="section-title section-title-split" style={{ marginBottom: '32px' }}>
            <div>
              <span className="section-subtitle">DANH MỤC KHÓA HỌC</span>
              <h2>Khóa học của <em>α∫M4A.</em></h2>
              <div className="course-title-doodles" aria-hidden="true"><StudyIcon kind="book"/><span>~</span><StudyIcon kind="pencil"/><span>~</span><StudyIcon kind="chat"/></div>
            </div>
            <p>Học từ nền tảng hoặc luyện theo bộ đề. Xem nội dung trước khi đăng ký.</p>
          </div>

          {catalogError && <p className="catalog-load-note" role="status">{catalogError}</p>}
          <div className="course-cards-container">
            {coursesData.map((course) => (
              <article className="elearning-card paper-surface" data-paper={['lavender','sky','sun','mint'][coursesData.indexOf(course)%4]} key={course.id}>
                <div className="elearning-card-cover">
                  <img src={course.image} alt={course.title} />
                  <span className="status-tag-pill" data-availability={course.isClosed ? 'closed' : 'open'}>{course.badge}</span>
                </div>
                <div className="elearning-card-body">
                  <div>
                    <h3 className="elearning-card-title">{course.title}</h3>
                    <p className="course-catalog-description">{course.desc}</p>
                    <div className="elearning-meta-row">
                      <span className="elearning-meta-item">
                        <FileText size={15} /> {Number.isInteger(course.lessonsCount) ? `${course.lessonsCount} bài học` : 'Đang chuẩn bị'}
                      </span>
                      {Number.isInteger(course.studentsCount) && <span className="elearning-meta-item">
                        <Users size={15} /> {course.studentsCount} học viên
                      </span>}
                    </div>
                  </div>

                  <div className="elearning-card-footer">
                    <div className="elearning-price-block">
                      {course.isClosed ? (
                        <span className="course-closed-label">Chưa nhận đăng ký</span>
                      ) : course.isFree ? (
                        <span className="price-free-tag">Miễn phí</span>
                      ) : (
                        <>
                          {course.originalPrice !== course.discountPrice && <span className="original-price-crossed">{course.originalPrice}</span>}
                          <span className="current-price-tag">{course.discountPrice}</span>
                        </>
                      )}
                    </div>
                    <Link to={`/course/${course.id}`} className="btn-course-detail">
                      Xem khóa học <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="course-sample-section"><div className="container">
        <header><div><span className="section-subtitle">MỘT GÓC TRONG LỘ TRÌNH</span><h2>Từ một ý hiểu,<br/><em>đến một bài tự giải.</em></h2></div><p>Nhìn trước những chủ đề đang có trong khóa Toán cao cấp. Mở danh sách bài giảng để chọn đúng phần bạn cần.</p></header>
        <div className="course-sample-grid">{sampleLessons.map((lesson,index)=><Link to="/course/tu-hoc-toan-cao-cap#curriculum" className="course-sample-note paper-surface" data-paper={['mint','peach','sky','sun'][index]} key={lesson.id}><div className="course-sample-note-top"><span>{lesson.title.split('|')[0].trim()}</span><span>{lesson.duration}</span></div><KnowledgeSketch kind={['matrix','curve','optimize','matrix'][index]} step={1}/><h3>{lesson.title.split('|').slice(1).join('|').trim()}</h3><span className="course-sample-link">Xem trong lộ trình <ArrowRight size={16}/></span></Link>)}</div>
      </div></section>

      {/* Enrollment Consultation Form */}
      <StudyWelcome current="courses" />

      <section id="enroll" className="course-consultation paper-surface" data-paper="peach">
        <div className="container">
          <div className="enroll-panel">
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
              <label><span>Họ và tên</span>
              <input
                className="form-input"
                placeholder={t.coursesPage.placeholderName}
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                required
              />
              </label>
              <label><span>Thông tin liên hệ</span>
              <input
                className="form-input"
                placeholder={t.coursesPage.placeholderContact}
                value={form.contact}
                onChange={(event) => updateField('contact', event.target.value)}
                required
              />
              </label>
              <label><span>Mục tiêu học</span>
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
              </label>
              <label><span>Thời gian dự kiến</span>
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
              </label>
              <label className="course-form-note"><span>Bạn muốn chia sẻ thêm?</span>
              <textarea
                className="form-input text-area"
                rows="4"
                placeholder={t.coursesPage.placeholderNote}
                value={form.note}
                onChange={(event) => updateField('note', event.target.value)}
              />
              </label>
              <button className="btn course-consult-submit" type="submit">
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
