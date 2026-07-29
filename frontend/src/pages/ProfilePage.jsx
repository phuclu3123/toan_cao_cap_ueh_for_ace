import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Save, User } from 'lucide-react';
import { coursesData } from '../data/coursesData';
import '../assets/styles/Home.css';
import '../assets/styles/Courses.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const readStoredUser = () => {
  try {
    const savedUser = localStorage.getItem('ueh_tcc_user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
};

export default function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(readStoredUser);
  const requestedTab = new URLSearchParams(location.search).get('tab');
  const activeTab = requestedTab === 'profile' ? 'profile' : 'courses';

  // Form fields
  const [name, setName] = useState(() => user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(() => user?.phoneNumber || '');
  const [school, setSchool] = useState(() => user?.school || 'Đại học Kinh tế TP.HCM (UEH)');
  const [bio, setBio] = useState(() => user?.bio || '');
  const [avatar] = useState(() => {
    if (!user) return '';
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=059669&color=fff&bold=true`;
    return user.photoURL || user.avatar || fallbackAvatar;
  });

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setStatusMsg({ type: '', text: '' });
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username || user.email,
          name,
          phoneNumber,
          school,
          bio,
          avatar
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const updatedUser = { ...user, name, phoneNumber, school, bio, avatar };
        setUser(updatedUser);
        localStorage.setItem('ueh_tcc_user', JSON.stringify(updatedUser));
        setStatusMsg({ type: 'success', text: 'Cập nhật thông tin cá nhân thành công!' });
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Cập nhật thất bại!' });
      }
    } catch {
      const updatedUser = { ...user, name, phoneNumber, school, bio, avatar };
      setUser(updatedUser);
      localStorage.setItem('ueh_tcc_user', JSON.stringify(updatedUser));
      setStatusMsg({ type: 'success', text: 'Đã lưu thông tin trên thiết bị cá nhân thành công!' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ueh_tcc_user');
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="courses-page" style={{ padding: '140px 0', textAlign: 'center', minHeight: '80vh' }}>
        <div className="container">
          <h2>Bạn chưa đăng nhập</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Vui lòng đăng nhập tài khoản để xem khóa học của tôi và chỉnh sửa thông tin.</p>
          <Link to="/courses" className="btn-course-detail">
            Quay lại trang chính
          </Link>
        </div>
      </div>
    );
  }

  const userAvatarSrc =
    avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=059669&color=fff&bold=true`;

  return (
    <div className="courses-page" style={{ padding: '120px 0 90px', background: 'var(--course-bg)', minHeight: '100vh' }}>
      <div className="container">
        {/* Top Header Row matching Image 1 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#059669', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              TÀI KHOẢN HỌC VIÊN
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', margin: '4px 0 0' }}>
              Khóa học của tôi
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/courses"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#047857',
                padding: '10px 20px',
                borderRadius: '999px',
                fontSize: '0.88rem',
                fontWeight: '800',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Xem thêm khóa học
            </Link>

            <button
              type="button"
              className={`pill-glass-badge ${activeTab === 'profile' ? 'active' : ''}`}
              style={{ background: activeTab === 'profile' ? '#10b981' : '#ffffff', color: activeTab === 'profile' ? '#fff' : '#0f172a', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '10px 18px', borderRadius: '999px', fontWeight: '800' }}
              onClick={() => navigate(`/account?tab=${activeTab === 'profile' ? 'courses' : 'profile'}`)}
            >
              <User size={16} /> {activeTab === 'profile' ? 'Xem khóa học' : 'Sửa Profile'}
            </button>
          </div>
        </div>

        {/* Tab 1: My Courses Grid (Exact Card Layout from Image 1) */}
        {activeTab === 'courses' && (
          <div className="my-courses-grid">
            {coursesData.map((c) => (
              <div className="my-course-card" key={c.id}>
                <div className="my-course-cover">
                  <img src={c.image} alt={c.title} />
                  <span className="paid-badge-pill">Đã thanh toán</span>
                </div>
                <div className="my-course-body">
                  <h3 className="my-course-title">{c.title}</h3>

                  <div className="my-course-meta-box">
                    <div>
                      <div className="meta-box-label">NGÀY ĐĂNG KÝ</div>
                      <div className="meta-box-val">07/07/2026</div>
                    </div>
                    <span style={{ fontSize: '0.78rem', background: '#ffffff', color: '#64748b', padding: '4px 10px', borderRadius: '999px', fontWeight: '700', border: '1px solid #e2e8f0' }}>
                      E-learning
                    </span>
                  </div>

                  <Link to={`/course/${c.id}`} className="btn-vua-hoc">
                    <span>Vào học</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Profile Settings */}
        {activeTab === 'profile' && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '36px',
              boxShadow: '0 16px 40px rgba(15, 23, 42, 0.06)',
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
              <img
                src={userAvatarSrc}
                alt={user.name}
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #10b981' }}
              />
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: '0 0 4px' }}>{user.name}</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>{user.username || user.email}</p>
              </div>
            </div>

            {statusMsg.text && (
              <div
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  background: statusMsg.type === 'success' ? '#d1fae5' : '#fee2e2',
                  color: statusMsg.type === 'success' ? '#065f46' : '#991b1b'
                }}
              >
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                    Họ và Tên:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                    Email / Tên đăng nhập (Cố định):
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#f8fafc' }}
                    value={user.username || user.email}
                    disabled
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                    Số điện thoại liên hệ:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                    value={phoneNumber}
                    placeholder="VD: 0833830322"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                    Trường học / Chuyên ngành:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                  Giới thiệu bản thân (Bio):
                </label>
                <textarea
                  className="form-input"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                  rows="3"
                  placeholder="Viết một vài dòng ngắn về mục tiêu học tập..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px 18px', borderRadius: '999px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <LogOut size={16} /> Đăng xuất
                </button>

                <button
                  type="submit"
                  className="btn-enroll-primary"
                  style={{ width: 'auto', padding: '12px 28px' }}
                  disabled={loading}
                >
                  <Save size={16} />
                  <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
