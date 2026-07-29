import { useState, useContext } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import '../assets/styles/ConsultationForm.css';

export default function ConsultationForm({ theme = 'dark', onClose }) {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const [form, setForm] = useState({
    name: '',
    course: 'foundation',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setErrorMsg(t.consultForm.validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const courseNames = {
      foundation: t.consultForm.courseOpt1,
      calculus: t.consultForm.courseOpt2,
      economic: t.consultForm.courseOpt3
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: language === 'vi' ? 'Đăng ký tư vấn khóa học UEH TCC' : 'UEH TCC Course Consultation Registration',
          message: language === 'vi'
            ? `Thông tin đăng ký tư vấn:\n- Khóa học quan tâm: ${courseNames[form.course] || form.course}\n- Số điện thoại: ${form.phone.trim()}\n- Email: ${form.email.trim()}`
            : `Consultation Registration Info:\n- Course of interest: ${courseNames[form.course] || form.course}\n- Phone: ${form.phone.trim()}\n- Email: ${form.email.trim()}`
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(data.message || t.consultForm.failError);
      }
    } catch (err) {
      console.error('Error submitting consultation form:', err);
      setErrorMsg(t.consultForm.serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`consult-form-container theme-${theme}`}>
      {/* Speech bubble background watermark icon */}
      <svg className="bubble-watermark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>

      {onClose && (
        <button type="button" className="close-modal-btn" onClick={onClose} aria-label="Đóng">
          &times;
        </button>
      )}

      <h2 className="consult-title">{t.consultForm.title}</h2>
      <p className="consult-subtitle">{t.consultForm.subtitle}</p>

      {isSuccess ? (
        <div className="consult-success-panel">
          <CheckCircle2 size={48} className="success-icon" />
          <h3>{t.consultForm.successTitle}</h3>
          <p>{t.consultForm.successDesc}</p>
          <button type="button" className="btn btn-secondary" onClick={() => { setIsSuccess(false); setForm({ name: '', course: 'foundation', phone: '', email: '' }); }}>
            {t.consultForm.btnRegisterAgain}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="consult-madlibs-form">
          <div className="madlibs-sentence">
            <span>{t.consultForm.greeting}</span>
            <span className="input-wrapper">
              <input
                type="text"
                className="madlibs-input"
                placeholder={t.consultForm.namePlaceholder}
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </span>
            <span>,</span>
            <br className="desktop-break" />
            <span>{t.consultForm.interest}</span>
            <span className="input-wrapper">
              <select
                className="madlibs-select"
                value={form.course}
                onChange={(e) => updateField('course', e.target.value)}
                required
              >
                <option value="foundation">{t.consultForm.courseOpt1}</option>
                <option value="calculus">{t.consultForm.courseOpt2}</option>
                <option value="economic">{t.consultForm.courseOpt3}</option>
              </select>
            </span>
            <span>!</span>
            <br className="desktop-break" />
            <span>{t.consultForm.contactVia}</span>
            <span className="input-wrapper">
              <input
                type="tel"
                className="madlibs-input phone-width"
                placeholder={t.consultForm.phonePlaceholder}
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                required
              />
            </span>
            <span>, {t.consultForm.or}</span>
            <span className="input-wrapper">
              <input
                type="email"
                className="madlibs-input email-width"
                placeholder={t.consultForm.emailPlaceholder}
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </span>
            <span>&lt;3.</span>
          </div>

          {errorMsg && <div className="consult-error-msg">{errorMsg}</div>}

          <div className="consult-form-actions">
            <button type="submit" className="btn-consult-submit" disabled={isSubmitting}>
              <span>{isSubmitting ? t.consultForm.submitting : t.consultForm.btnSubmit}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {theme === 'dark' && (
        <div className="consult-tail-triangle"></div>
      )}
    </div>
  );
}
