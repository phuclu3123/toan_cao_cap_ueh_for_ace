import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Crown, LogOut, Save, ShieldCheck, User } from 'lucide-react';
import { coursesData } from '../data/coursesData';
import '../assets/styles/Home.css';
import '../assets/styles/Courses.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'courses'

  // Form fields
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [school, setSchool] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUserStr = localStorage.getItem('ueh_tcc_user');
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        setUser(u);
        setName(u.name || '');
        setPhoneNumber(u.phoneNumber || '');
        setSchool(u.school || 'Đại học Kinh tế TP.HCM (UEH)');
        setBio(u.bio || '');
        setAvatar(u.avatar || '');
      } catch (e) {}
    }
  }, []);

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
    } catch (err) {
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
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Vui lòng đăng nhập tài khoản để xem và chỉnh sửa thông tin cá nhân.</p>
          <Link to="/courses" className="btn-course-detail">
            Quay lại trang chính
          </Link>
        </div>
      </div>
    );
  }

  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="courses-page" style={{ padding: '120px 0 90px', background: 'var(--course-bg)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Profile Banner Card */}
        <div
          style={{
            background: 'var(--course-paper)',
            border: '1px solid var(--course-border)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: 'var(--course-shadow)',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: user.role === 'Admin' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #a87258, #82533c)',
                color: '#ffffff',
                fontSize: '1.8rem',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
              }}
            >
              {avatar ? <img src={avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initialLetter}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--course-ink)' }}>{user.name}</h2>
                {user.role === 'Admin' ? (
                  <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Crown size={12} /> Admin System
                  </span>
                ) : (
                  <span style={{ background: '#ecfdf5', color: '#047857', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800' }}>
                    Học viên UEH
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--course-muted)' }}>{user.username || user.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className={`btn-course-detail ${activeTab === 'profile' ? '' : 'pill-glass-badge'}`}
              style={{ background: activeTab === 'profile' ? '#10b981' : 'transparent', color: activeTab === 'profile' ? '#fff' : 'var(--course-ink)' }}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} /> Thông tin cá nhân
            </button>
            <button
              type="button"
              className={`btn-course-detail ${activeTab === 'courses' ? '' : 'pill-glass-badge'}`}
              style={{ background: activeTab === 'courses' ? '#10b981' : 'transparent', color: activeTab === 'courses' ? '#fff' : 'var(--course-ink)' }}
              onClick={() => setActiveTab('courses')}
            >
              <BookOpen size={16} /> Khóa học của tôi
            </button>
          </div>
        </div>

        {/* Tab Content 1: Edit Profile */}
        {activeTab === 'profile' && (
          <div
            style={{
              background: 'var(--course-paper)',
              border: '1px solid var(--course-border)',
              borderRadius: '24px',
              padding: '36px',
              boxShadow: 'var(--course-shadow)'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--course-ink)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={20} color="#10b981" /> Chỉnh sửa thông tin cá nhân
            </h3>

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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--course-ink)', marginBottom: '8px' }}>
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
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--course-ink)', marginBottom: '8px' }}>
                    Email / Tên đăng nhập (Cố định):
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.04)' }}
                    value={user.username || user.email}
                    disabled
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--course-ink)', marginBottom: '8px' }}>
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
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--course-ink)', marginBottom: '8px' }}>
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--course-ink)', marginBottom: '8px' }}>
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

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--course-border)' }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px 18px', borderRadius: '999px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <LogOut size={16} /> Đăng xuất tài khoản
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

        {/* Tab Content 2: My Courses */}
        {activeTab === 'courses' && (
          <div
            style={{
              background: 'var(--course-paper)',
              border: '1px solid var(--course-border)',
              borderRadius: '24px',
              padding: '36px',
              boxShadow: 'var(--course-shadow)'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--course-ink)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={20} color="#10b981" /> Khóa học của tôi ({coursesData.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {coursesData.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid var(--course-border)',
                    background: 'var(--course-bg)',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={c.image} alt={c.title} style={{ width: '80px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--course-ink)', marginBottom: '4px' }}>{c.title}</h4>
                      <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: '700' }}>📖 {c.lessonsCount} bài học • {c.duration}</span>
                    </div>
                  </div>

                  <Link to={`/course/${c.id}`} className="btn-course-detail">
                    Vào học ngay ➔
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
