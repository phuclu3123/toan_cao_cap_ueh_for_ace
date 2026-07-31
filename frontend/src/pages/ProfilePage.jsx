import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  LifeBuoy,
  LogOut,
  Save,
  ShieldCheck,
  User
} from 'lucide-react';
import { coursesData } from '../data/coursesData';
import { apiFetch, readApiJson, toClientUser } from '../utils/apiClient';
import {
  auth,
  isFirebaseConfigured,
  signOut as firebaseSignOut
} from '../firebase';
import '../assets/styles/ProfilePage.css';

const DEFAULT_SCHOOL = 'Đại học Kinh tế TP.HCM (UEH)';

const getInitials = (value = '') => {
  const initials = value
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return initials || 'HV';
};

export default function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const requestedTab = new URLSearchParams(location.search).get('tab');
  const activeTab = requestedTab === 'profile' ? 'profile' : 'courses';

  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [school, setSchool] = useState(DEFAULT_SCHOOL);
  const [bio, setBio] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const [legacyOrderCode, setLegacyOrderCode] = useState('');
  const [legacyReference, setLegacyReference] = useState('');
  const [claimingLegacy, setClaimingLegacy] = useState(false);
  const [legacyStatus, setLegacyStatus] = useState({ type: '', text: '' });

  const applySession = useCallback((payload) => {
    const sessionUser = toClientUser(payload.user);
    setUser(sessionUser);
    setEnrollments(Array.isArray(payload.enrollments) ? payload.enrollments : []);
    setName(sessionUser?.name || '');
    setPhoneNumber(sessionUser?.phoneNumber || '');
    setSchool(sessionUser?.school || DEFAULT_SCHOOL);
    setBio(sessionUser?.bio || '');
  }, []);

  const refreshSession = useCallback(async () => {
    const payload = await readApiJson(await apiFetch('/api/auth/me'));
    applySession(payload);
    return payload;
  }, [applySession]);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const payload = await readApiJson(await apiFetch('/api/auth/me'));
        if (active) applySession(payload);
      } catch (error) {
        if (active) {
          setUser(null);
          setEnrollments([]);
          
          if (error.status === 401 && localStorage.getItem('ueh_tcc_user')) {
            localStorage.removeItem('ueh_tcc_user');
            localStorage.removeItem('ueh_tcc_token');
            window.dispatchEvent(new Event('ueh-tcc-session-changed'));
          }
        }
      } finally {
        if (active) setSessionLoading(false);
      }
    };

    loadSession();
    window.addEventListener('ueh-tcc-session-changed', loadSession);
    return () => {
      active = false;
      window.removeEventListener('ueh-tcc-session-changed', loadSession);
    };
  }, [applySession]);

  const enrolledCourses = useMemo(() => {
    if (user?.role === 'Admin') {
      return coursesData.map(course => ({
        enrollment: { status: 'ACTIVE', source: 'ADMIN', grantedAt: new Date().toISOString() },
        course
      }));
    }
    const byId = new Map(coursesData.map((course) => [course.id, course]));
    return enrollments
      .map((enrollment) => ({ enrollment, course: byId.get(enrollment.courseId) }))
      .filter((item) => item.course);
  }, [enrollments, user]);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setStatusMsg({ type: '', text: '' });
    setSaving(true);

    try {
      const payload = await readApiJson(await apiFetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phoneNumber,
          school,
          bio,
          avatar: user?.avatar || user?.photoURL || ''
        })
      }));

      const updatedUser = toClientUser({
        ...user,
        ...(payload.user || {}),
        name,
        phoneNumber,
        school,
        bio
      });
      setUser(updatedUser);
      setStatusMsg({ type: 'success', text: 'Thông tin cá nhân đã được cập nhật.' });
    } catch (error) {
      setStatusMsg({
        type: 'error',
        text: error.message || 'Chưa thể lưu thay đổi. Vui lòng thử lại.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLegacyClaim = async (event) => {
    event.preventDefault();
    setLegacyStatus({ type: '', text: '' });

    const normalizedOrderCode = legacyOrderCode.replace(/\D/g, '');
    const normalizedReference = legacyReference.trim();
    if (!normalizedOrderCode || normalizedReference.length < 6) {
      setLegacyStatus({
        type: 'error',
        text: 'Vui lòng nhập mã đơn và mã tham chiếu giao dịch trên biên nhận PayOS.'
      });
      return;
    }

    setClaimingLegacy(true);
    try {
      const payload = await readApiJson(await apiFetch('/api/orders/claim-legacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode: normalizedOrderCode,
          reference: normalizedReference
        })
      }));

      await refreshSession();
      setLegacyOrderCode('');
      setLegacyReference('');
      setLegacyStatus({
        type: 'success',
        text: payload.data?.courseId
          ? 'Đối soát thành công. Khóa học đã được mở cho tài khoản này.'
          : 'Đơn hàng đã được xác minh.'
      });
    } catch (error) {
      setLegacyStatus({
        type: 'error',
        text: error.message || 'Chưa thể đối soát đơn hàng cũ.'
      });
    } finally {
      setClaimingLegacy(false);
    }
  };

  const handleLogout = async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth).catch(() => {});
    }
    window.dispatchEvent(new Event('ueh-tcc-session-changed'));
    window.location.href = '/';
  };

  if (sessionLoading) {
    return (
      <main className="profile-page profile-page--state" aria-busy="true">
        <div className="profile-state-card">
          <span className="profile-loader" aria-hidden="true" />
          <p>Đang tải không gian học tập…</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page profile-page--state">
        <div className="profile-state-card">
          <div className="profile-state-icon"><User aria-hidden="true" /></div>
          <p className="profile-eyebrow">Tài khoản học viên</p>
          <h1>Đăng nhập để tiếp tục</h1>
          <p>Quyền học được lưu an toàn trên hệ thống và gắn với tài khoản của bạn.</p>
          <Link to="/courses" className="profile-primary-link">Xem các khóa học</Link>
        </div>
      </main>
    );
  }

  const avatarUrl = user.photoURL || user.avatar;
  const identity = user.username || user.email;

  return (
    <main className="profile-page">
      <div className="profile-orbit profile-orbit--one" aria-hidden="true" />
      <div className="profile-orbit profile-orbit--two" aria-hidden="true" />

      <div className="profile-shell">
        <header className="profile-heading">
          <div>
            <p className="profile-eyebrow">Không gian học viên</p>
            <h1>{activeTab === 'profile' ? 'Thông tin tài khoản' : 'Khóa học của tôi'}</h1>
            <p className="profile-heading-copy">
              {activeTab === 'profile'
                ? 'Quản lý thông tin dùng cho học tập và hỗ trợ.'
                : 'Tiếp tục đúng khóa học đã được hệ thống xác nhận quyền truy cập.'}
            </p>
          </div>

          <nav className="profile-tabs" aria-label="Khu vực tài khoản">
            <button
              type="button"
              className={activeTab === 'courses' ? 'is-active' : ''}
              aria-current={activeTab === 'courses' ? 'page' : undefined}
              onClick={() => navigate('/account?tab=courses')}
            >
              <BookOpen aria-hidden="true" />
              Khóa học
            </button>
            <button
              type="button"
              className={activeTab === 'profile' ? 'is-active' : ''}
              aria-current={activeTab === 'profile' ? 'page' : undefined}
              onClick={() => navigate('/account?tab=profile')}
            >
              <User aria-hidden="true" />
              Tài khoản
            </button>
          </nav>
        </header>

        <section className="profile-identity" aria-label="Tài khoản hiện tại">
          <div className="profile-avatar" aria-hidden="true">
            {avatarUrl
              ? <img src={avatarUrl} alt="" />
              : <span>{getInitials(user.name || identity)}</span>}
          </div>
          <div className="profile-identity-copy">
            <strong>{user.name || 'Học viên UEH TCC'}</strong>
            <span>{identity}</span>
          </div>
          <div className="profile-verified">
            <ShieldCheck aria-hidden="true" />
            Phiên đăng nhập đã xác thực
          </div>
        </section>

        {activeTab === 'courses' && (
          <>
            {enrolledCourses.length > 0 ? (
              <section className="profile-course-grid" aria-label="Danh sách khóa học">
                {enrolledCourses.map(({ course, enrollment }) => (
                  <article className="profile-course-card" key={course.id}>
                    <div className="profile-course-cover">
                      <img src={course.image} alt="" />
                      <span>
                        <CheckCircle2 aria-hidden="true" />
                        {enrollment.source === 'FREE' ? 'Đã kích hoạt' : 'Đã thanh toán'}
                      </span>
                    </div>
                    <div className="profile-course-body">
                      <p className="profile-course-type">E-learning · học theo tiến độ riêng</p>
                      <h2>{course.title}</h2>
                      <div className="profile-course-meta">
                        <div>
                          <span>Ngày mở quyền</span>
                          <strong>
                            {enrollment.grantedAt
                              ? new Date(enrollment.grantedAt).toLocaleDateString('vi-VN')
                              : 'Đã kích hoạt'}
                          </strong>
                        </div>
                        <div>
                          <span>Trạng thái</span>
                          <strong>Đang học</strong>
                        </div>
                      </div>
                      <Link to={`/course/${course.id}`} className="profile-course-enter">
                        Vào học
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </section>
            ) : (
              <section className="profile-empty">
                <div className="profile-state-icon"><GraduationCap aria-hidden="true" /></div>
                <p className="profile-eyebrow">Lộ trình của bạn</p>
                <h2>Chưa có khóa học được kích hoạt</h2>
                <p>Sau khi PayOS xác nhận thanh toán, khóa học sẽ tự xuất hiện tại đây.</p>
                <Link to="/courses" className="profile-primary-link">Khám phá khóa học</Link>
              </section>
            )}

            <details className="profile-recovery">
              <summary>
                <span className="profile-recovery-icon"><CreditCard aria-hidden="true" /></span>
                <span>
                  <strong>Đã thanh toán trước đợt nâng cấp?</strong>
                  <small>Đối soát đơn PayOS cũ để khôi phục quyền học</small>
                </span>
                <span className="profile-recovery-chevron" aria-hidden="true">⌄</span>
              </summary>

              <div className="profile-recovery-content">
                <div className="profile-recovery-intro">
                  <ShieldCheck aria-hidden="true" />
                  <p>
                    Hệ thống sẽ kiểm tra trực tiếp trạng thái, số tiền và mã tham chiếu với
                    PayOS. Dữ liệu lưu trong trình duyệt không được dùng để mở khóa học.
                  </p>
                </div>

                <form onSubmit={handleLegacyClaim} className="profile-recovery-form">
                  <label>
                    <span>Mã đơn hàng</span>
                    <input
                      inputMode="numeric"
                      autoComplete="off"
                      value={legacyOrderCode}
                      onChange={(event) => setLegacyOrderCode(event.target.value.replace(/\D/g, ''))}
                      placeholder="Ví dụ: 1723456789"
                      required
                    />
                  </label>
                  <label>
                    <span>Mã tham chiếu giao dịch</span>
                    <input
                      autoComplete="off"
                      value={legacyReference}
                      onChange={(event) => setLegacyReference(event.target.value)}
                      placeholder="Trên biên nhận PayOS"
                      minLength={6}
                      required
                    />
                  </label>
                  <button type="submit" disabled={claimingLegacy}>
                    {claimingLegacy ? 'Đang đối soát…' : 'Khôi phục quyền học'}
                  </button>
                </form>

                {legacyStatus.text && (
                  <p className={`profile-message profile-message--${legacyStatus.type}`} role="status">
                    {legacyStatus.text}
                  </p>
                )}

                <p className="profile-recovery-help">
                  Không còn biên nhận? <a href="mailto:luphuc321@gmail.com">Liên hệ hỗ trợ</a> để được kiểm tra thủ công.
                </p>
              </div>
            </details>
          </>
        )}

        {activeTab === 'profile' && (
          <section className="profile-settings">
            <div className="profile-section-heading">
              <div>
                <p className="profile-eyebrow">Thông tin học viên</p>
                <h2>Hồ sơ cá nhân</h2>
              </div>
              <span><LifeBuoy aria-hidden="true" /> Dùng cho hỗ trợ học tập</span>
            </div>

            {statusMsg.text && (
              <p className={`profile-message profile-message--${statusMsg.type}`} role="status">
                {statusMsg.text}
              </p>
            )}

            <form onSubmit={handleSaveProfile} className="profile-settings-form">
              <div className="profile-form-grid">
                <label>
                  <span>Họ và tên</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} required />
                </label>
                <label>
                  <span>Email / tài khoản</span>
                  <input value={identity} disabled aria-describedby="fixed-identity-note" />
                  <small id="fixed-identity-note">Thông tin đăng nhập không thể thay đổi tại đây.</small>
                </label>
                <label>
                  <span>Số điện thoại liên hệ</span>
                  <input
                    inputMode="tel"
                    autoComplete="tel"
                    value={phoneNumber}
                    placeholder="Ví dụ: 0833830322"
                    onChange={(event) => setPhoneNumber(event.target.value)}
                  />
                </label>
                <label>
                  <span>Trường học / chuyên ngành</span>
                  <input value={school} onChange={(event) => setSchool(event.target.value)} />
                </label>
              </div>
              <label className="profile-bio">
                <span>Giới thiệu ngắn</span>
                <textarea
                  rows={4}
                  value={bio}
                  placeholder="Mục tiêu học tập hoặc nội dung bạn đang cần hỗ trợ…"
                  onChange={(event) => setBio(event.target.value)}
                />
              </label>

              <div className="profile-form-actions">
                <button type="button" className="profile-logout" onClick={handleLogout}>
                  <LogOut aria-hidden="true" />
                  Đăng xuất
                </button>
                <button type="submit" className="profile-save" disabled={saving}>
                  <Save aria-hidden="true" />
                  {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
