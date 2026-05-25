import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle,
  Clock,
  FileText,
  LockKeyhole,
  Mail,
  Phone,
  Play,
  ShieldCheck,
  Video
} from 'lucide-react';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import '../assets/styles/Home.css';

const coursesData = [
  {
    id: 'foundation',
    image: '/images/tccvang.jpg',
    lessonsCount: 24
  },
  {
    id: 'calculus',
    image: '/images/bg.jpg',
    lessonsCount: 31
  },
  {
    id: 'economic-models',
    image: '/images/c4678.jpg',
    lessonsCount: 18
  }
];

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

  const syllabus = t.coursesPage.syllabus;
  const benefits = t.coursesPage.benefits;
  const coursesList = t.coursesPage.list.map((course, index) => ({
    ...course,
    ...coursesData[index],
    lessons: coursesData[index].lessonsCount
  }));

  return (
    <div className="home-page page-shell">
      <section className="page-hero course-page-hero">
        <div className="container page-hero-grid">
          <div>
            <span className="hero-badge"><Video size={14} /> {t.coursesPage.kicker}</span>
            <h1>{t.coursesPage.title}</h1>
            <p>{t.coursesPage.desc}</p>
            <div className="hero-buttons">
              <a href="#enroll" className="btn btn-primary consult-red">{t.coursesPage.btnConsult}</a>
              <a href="#catalog" className="btn btn-secondary">{t.coursesPage.btnRoadmap}</a>
            </div>
          </div>
          <div className="course-console glass-panel">
            <div className="console-screen">
              <Play size={28} fill="currentColor" />
              <span>{t.coursesPage.sampleTitle}</span>
            </div>
            <div className="console-list">
              {syllabus.map((item) => (
                <span key={item}><BookOpenCheck size={15} /> {item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="catalog" className="section">
        <div className="container">
          <div className="section-title section-title-split">
            <div>
              <span className="section-subtitle">{t.coursesPage.catalogSubtitle}</span>
              <h2>{t.coursesPage.catalogTitle}</h2>
            </div>
            <p>{t.coursesPage.catalogDesc}</p>
          </div>

          <div className="course-enroll-layout">
            <div className="course-catalog-grid">
              {coursesList.map((course) => (
                <article className="course-catalog-card" key={course.id}>
                  <div className="course-cover">
                    <img src={course.image} alt={course.title} />
                    <span>{course.level}</span>
                    <div className="locked-badge"><LockKeyhole size={13} /> {t.coursesPage.lockedBadge}</div>
                  </div>
                  <div className="course-catalog-body">
                    <h3>{course.title}</h3>
                    <p>{course.desc}</p>
                    <div className="course-meta-row">
                      <span><Clock size={14} /> {course.duration}</span>
                      <span><FileText size={14} /> {course.lessons} {language === 'vi' ? 'bài' : 'lessons'}</span>
                    </div>
                    <div className="course-card-footer">
                      <small>{t.coursesPage.hasTrial}</small>
                      <a href="#enroll">{t.coursesPage.btnUnlock} <ArrowRight size={15} /></a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <section id="enroll" className="enroll-panel glass-panel">
              <div className="enroll-copy">
                <span className="section-subtitle">{t.coursesPage.formSubtitle}</span>
                <h2>{t.coursesPage.formTitle}</h2>
                <p>{t.coursesPage.formDesc}</p>
                <div className="enroll-contact-box">
                  <a href="tel:0833830322"><Phone size={16} /> 0833830322</a>
                  <a href="https://zalo.me/0833830322" target="_blank" rel="noopener noreferrer">Zalo: 0833830322</a>
                  <a href="mailto:luphuc321@gmail.com"><Mail size={16} /> luphuc321@gmail.com</a>
                </div>
              </div>

              <form className="enroll-form" onSubmit={handleSubmit}>
                <input className="form-input" placeholder={t.coursesPage.placeholderName} value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
                <input className="form-input" placeholder={t.coursesPage.placeholderContact} value={form.contact} onChange={(event) => updateField('contact', event.target.value)} required />
                <select className="form-input" value={form.goal} onChange={(event) => updateField('goal', event.target.value)} required>
                  <option value="" disabled>{t.coursesPage.goalTitle}</option>
                  {t.coursesPage.goals.map((goalOpt) => (
                    <option key={goalOpt} value={goalOpt}>{goalOpt}</option>
                  ))}
                </select>
                <select className="form-input" value={form.time} onChange={(event) => updateField('time', event.target.value)} required>
                  <option value="" disabled>{t.coursesPage.timeTitle}</option>
                  {t.coursesPage.times.map((timeOpt) => (
                    <option key={timeOpt} value={timeOpt}>{timeOpt}</option>
                  ))}
                </select>
                <textarea className="form-input text-area" rows="4" placeholder={t.coursesPage.placeholderNote} value={form.note} onChange={(event) => updateField('note', event.target.value)} />
                <button className="btn btn-primary consult-red" type="submit">{t.coursesPage.btnSubmit}</button>
              </form>

              <div className="enroll-benefits">
                {benefits.map((benefit) => (
                  <span key={benefit}><CheckCircle size={15} /> {benefit}</span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="enterprise-cta section">
        <div className="container cta-panel">
          <div>
            <span className="section-subtitle">{t.coursesPage.ctaSubtitle}</span>
            <h2>{t.coursesPage.ctaTitle}</h2>
          </div>
          <Link to="/exams" className="btn btn-primary">
            {t.coursesPage.ctaBtn}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
