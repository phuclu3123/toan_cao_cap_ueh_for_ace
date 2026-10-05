import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  HelpCircle,
  Bookmark,
  CheckCircle2,
  ArrowLeft,
  Lock,
  MessageSquare,
  Heart,
  Grid,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
  Trophy,
  Crown,
  Share2,
  Check,
  Building2,
  UserCheck,
  ExternalLink,
  Settings,
  Camera,
  Edit3
} from 'lucide-react';
import { getInitials } from '../utils/userInitials';
import { useAuth } from '../contexts/AuthContext';
import { useCommunity } from '../contexts/CommunityContext';
import { getTierProgress, getTierByPoints, SPECIALTY_BADGES, BADGE_CATEGORIES } from '../services/reputationService';
import { communityService } from '../services/communityService';
import { isAdminIdentity, getAdminBadgeIds } from '../services/adminService';
import { apiFetch, readApiJson } from '../utils/apiClient';
import UserRankBadge from '../components/community/UserRankBadge';
import PostCard from '../components/community/PostCard';
import CreatePostModal from '../components/community/CreatePostModal';
import AvatarCropModal from '../components/modals/AvatarCropModal';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import '../assets/styles/community.css';

/** Map string icon keys to Lucide icons */
const BADGE_ICON_MAP = {
  Grid,
  BarChart3: Grid,
  Maximize2: Sparkles,
  TrendingUp,
  Sparkles,
  Cpu: Zap,
  PieChart: TrendingUp,
  Award,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Trophy,
  Heart,
  BookOpen: HelpCircle,
  Zap,
  Crown
};

/** Badges a member has earned, derived from their activity. */
function resolveBadges(profile) {
  if (!profile) return [];
  if (profile.isAdmin) return getAdminBadgeIds();

  const earned = [];
  const pts = profile.points || 0;
  const solved = profile.solvedCount || 0;
  const answers = profile.answersCount || 0;
  const posts = profile.postsCount || 0;

  SPECIALTY_BADGES.forEach(b => {
    if (pts >= b.pointsReq) {
      earned.push(b.id);
    } else if (b.id === 'community-first-solver' && solved >= 1) {
      earned.push(b.id);
    } else if (b.id === 'algebra-hpt-matrix' && answers >= 1) {
      earned.push(b.id);
    } else if (b.id === 'calc-lagrange-multivar' && solved >= 2) {
      earned.push(b.id);
    } else if (b.id === 'community-problem-setter' && posts >= 2) {
      earned.push(b.id);
    }
  });

  return earned;
}

export default function CommunityProfilePage({ defaultTab = 'posts' }) {
  const { id } = useParams();
  const { currentUser, reputationPoints } = useAuth();
  const {
    savedPostIds,
    toggleSavePost,
    handleUpvotePost,
    isCreateModalOpen,
    editingPost,
    openEditModal,
    closeCreateModal,
    handleUpdatePost,
    handleDeletePost
  } = useCommunity();

  const signedInId = currentUser?.uid || currentUser?.id || null;
  const isSelfRoute = !id || id === 'me';
  const targetId = isSelfRoute ? (signedInId || 'user-phuc') : id;
  const isMe = Boolean(signedInId && targetId === signedInId) || (isSelfRoute && Boolean(signedInId));

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [badgeCategory, setBadgeCategory] = useState('all');
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAvatarCropModal, setShowAvatarCropModal] = useState(false);

  const handlePostSubmit = async (data) => {
    if (editingPost) {
      await handleUpdatePost(editingPost.id, data);
      const posts = communityService.getPostsByUser(targetId);
      setUserPosts(posts);
    }
  };

  const onDeletePost = async (target) => {
    const pId = target?.id || target;
    await handleDeletePost(pId);
    setUserPosts(prev => prev.filter(p => p.id !== pId));
    setSavedPosts(prev => prev.filter(p => p.id !== pId));
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveCroppedAvatar = async (croppedBase64) => {
    try {
      let localUser = null;
      try {
        const raw = localStorage.getItem('ueh_tcc_user');
        if (raw) localUser = JSON.parse(raw);
      } catch {
        // Ignore malformed legacy profile cache.
      }
      const authUser = currentUser || localUser;
      const username = authUser?.username || authUser?.email;

      await readApiJson(await apiFetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          avatar: croppedBase64
        })
      }));

      const stored = localStorage.getItem('ueh_tcc_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          localStorage.setItem('ueh_tcc_user', JSON.stringify({ ...parsed, avatar: croppedBase64, photoURL: croppedBase64 }));
        } catch {
          // Ignore malformed legacy profile cache.
        }
      }

      setProfile(prev => ({ ...prev, avatar: croppedBase64 }));
      window.dispatchEvent(new Event('ueh-tcc-session-changed'));
    } catch (err) {
      console.error('Chưa thể lưu ảnh đại diện:', err);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const resolved = communityService.getUserProfile(targetId);
        const posts = communityService.getPostsByUser(targetId);
        const all = await communityService.getPosts({ limit: 100 });

        if (cancelled) return;

        // The signed-in owner keeps their auth identity on top of forum data
        const merged = { ...resolved };

        let localUser = null;
        try {
          const raw = localStorage.getItem('ueh_tcc_user');
          if (raw) localUser = JSON.parse(raw);
        } catch {
          // Ignore malformed legacy profile cache.
        }

        const authUser = currentUser || localUser;

        if (isMe || (authUser && (authUser.id === targetId || authUser.username === targetId || (isAdminIdentity(merged) && isAdminIdentity(authUser))))) {
          if (authUser) {
            merged.name = authUser.displayName || authUser.name || merged.name;
            if (authUser.photoURL || authUser.avatar) {
              merged.avatar = authUser.photoURL || authUser.avatar;
            }
            merged.cohort = authUser.cohort || merged.cohort;
            merged.email = authUser.email || merged.email;
            if (authUser.bio) merged.bio = authUser.bio;
            if (authUser.school) merged.school = authUser.school;
            if (authUser.phoneNumber) merged.phoneNumber = authUser.phoneNumber;
          }
        }

        if (isAdminIdentity(merged)) {
          merged.isAdmin = true;
          merged.points = 9999;
          if (merged.avatar === '/images/tccvang.jpg') {
            merged.avatar = authUser?.avatar || authUser?.photoURL || '';
          }
        }

        setProfile(merged);
        setUserPosts(posts);
        setSavedPosts(isMe ? all.posts.filter((p) => savedPostIds.includes(p.id)) : []);
      } catch (err) {
        console.error('Lỗi tải dữ liệu hồ sơ thành viên:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    window.addEventListener('ueh-tcc-session-changed', load);
    return () => {
      cancelled = true;
      window.removeEventListener('ueh-tcc-session-changed', load);
    };
  }, [targetId, isMe, savedPostIds, currentUser, reputationPoints]);

  const points = profile?.points || 0;
  const tier = getTierByPoints(points);
  const progress = getTierProgress(points);
  const earnedBadges = useMemo(() => resolveBadges(profile), [profile]);

  const filteredBadges = useMemo(() => {
    if (badgeCategory === 'all') return SPECIALTY_BADGES;
    return SPECIALTY_BADGES.filter(b => b.category === badgeCategory);
  }, [badgeCategory]);

  const tabs = [
    { id: 'posts', label: 'Bài toán đã đăng', icon: HelpCircle, count: userPosts.length },
    ...(isMe ? [{ id: 'saved', label: 'Bài đã lưu', icon: Bookmark, count: savedPosts.length }] : []),
    { id: 'badges', label: 'Danh hiệu & Cột mốc', icon: Award, count: `${earnedBadges.length}/${SPECIALTY_BADGES.length}` }
  ];

  return (
    <div className="community-page-wrapper qa-profile-page-wrapper">
      <div className="qa-profile-main-container">
        
        {/* Sleek Top Navigation Pill (Image 2 Redesign) */}
        <div className="qa-profile-top-bar">
          <Link to="/community" className="qa-profile-back-btn" title="Quay lại Diễn đàn Toán học UEH">
            <span className="qa-back-icon-wrap">
              <ArrowLeft size={15} />
            </span>
            <span className="qa-back-text">Về diễn đàn Toán học</span>
          </Link>

          <div className="qa-profile-top-actions">
            <button
              type="button"
              className="qa-top-action-btn"
              onClick={handleCopyProfileLink}
              title="Sao chép liên kết hồ sơ này"
            >
              {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Đã sao chép!' : 'Chia sẻ'}</span>
            </button>
            {isMe && (
              <Link to="/account?tab=profile" className="qa-top-action-btn">
                <Settings size={14} />
                <span>Cài đặt</span>
              </Link>
            )}
          </div>
        </div>

        {/* 2-Column Asymmetrical Portfolio-Inspired Layout */}
        <div className="qa-profile-2col-layout">
          
          {/* ================= LEFT COLUMN: STICKY PROFILE & STATS RAIL ================= */}
          <aside className="qa-profile-sidebar">
            
            {/* Identity Card */}
            <div className={`qa-profile-card qa-profile-identity-card ${profile?.isAdmin ? 'is-admin-card' : ''}`}>
              <div className="qa-profile-avatar-wrap">
                <div className={`qa-profile-avatar-box ${profile?.isAdmin ? 'has-admin-ring' : ''}`}>
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="qa-profile-avatar-img" />
                  ) : (
                    <span className="qa-profile-avatar-initial">
                      {getInitials(profile?.name || 'U')}
                    </span>
                  )}
                </div>
                {isMe && (
                  <button
                    type="button"
                    className="qa-profile-camera-btn"
                    onClick={() => setShowAvatarCropModal(true)}
                    title="Đổi ảnh đại diện"
                  >
                    <Camera size={13} />
                  </button>
                )}
                {profile?.isAdmin && (
                  <span className="qa-profile-crown-badge" title="Quản trị viên & Cố vấn Trưởng">
                    <Crown size={12} />
                  </span>
                )}
              </div>

              <div className="qa-profile-id-info">
                <div className="qa-profile-title-group">
                  <h1 className="qa-profile-user-name">{profile?.name || 'Sinh viên UEH'}</h1>
                  <span className="qa-cohort-badge">{profile?.cohort || 'K50 UEH'}</span>
                </div>

                <div className="qa-profile-rank-pills">
                  <UserRankBadge
                    points={points}
                    isInstructor={Boolean(profile?.isInstructor)}
                    size="normal"
                  />
                </div>

                <p className="qa-profile-bio-text">
                  {profile?.bio || (profile?.isAdmin
                    ? 'Người sáng lập và quản trị nền tảng UEH TCC — biên soạn tài liệu, kiểm duyệt lời giải và đồng hành cùng sinh viên trong từng bài toán.'
                    : 'Thành viên cộng đồng Toán Cao Cấp UEH — cùng thảo luận kiến thức, chia sẻ lời giải và học tập giải tích & đại số.')}
                </p>
              </div>

              {/* Affiliation info footer */}
              <div className="qa-profile-affil-footer">
                <div className="qa-affil-item">
                  <Building2 size={13} className="qa-affil-icon" />
                  <span>{profile?.school || 'Đại học Kinh tế TP.HCM (UEH)'}</span>
                </div>
                <div className="qa-affil-item">
                  <UserCheck size={13} className="qa-affil-icon" />
                  <span>{profile?.isAdmin ? 'Ban Cố vấn Học thuật TCC' : 'Thành viên Cộng đồng'}</span>
                </div>
              </div>

              {isMe && (
                <div className="qa-profile-edit-row">
                  <Link to="/account?tab=profile" className="qa-profile-edit-info-btn">
                    <Edit3 size={13} />
                    <span>Sửa thông tin hồ sơ</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Achievements & Statistics Card */}
            <div className="qa-profile-card qa-profile-stats-card">
              <div className="qa-card-head-title">
                <Sparkles size={15} className="text-amber-500" />
                <span>Thành tích & Chỉ số</span>
              </div>

              {/* Highlight Hero Stat: Điểm cống hiến */}
              <div className="qa-stat-hero-box">
                <div className="qa-stat-hero-top">
                  <span className="qa-stat-hero-icon">
                    <Zap size={16} />
                  </span>
                  <span className="qa-stat-hero-label">Điểm cống hiến</span>
                </div>
                <div className="qa-stat-hero-value q-num">{points.toLocaleString('vi-VN')}</div>
                <span className="qa-stat-hero-hint">Tích lũy từ lời giải đúng & đóng góp diễn đàn</span>
              </div>

              {/* 4-Item Grid Metrics */}
              <div className="qa-stats-quad-grid">
                <div className="qa-stat-mini-tile">
                  <div className="qa-stat-mini-icon text-blue-500">
                    <HelpCircle size={15} />
                  </div>
                  <div className="qa-stat-mini-content">
                    <span className="qa-stat-mini-num q-num">{profile?.postsCount || 0}</span>
                    <span className="qa-stat-mini-lbl">Bài toán</span>
                  </div>
                </div>

                <div className="qa-stat-mini-tile">
                  <div className="qa-stat-mini-icon text-emerald-500">
                    <MessageSquare size={15} />
                  </div>
                  <div className="qa-stat-mini-content">
                    <span className="qa-stat-mini-num q-num">{profile?.answersCount || 0}</span>
                    <span className="qa-stat-mini-lbl">Lời giải</span>
                  </div>
                </div>

                <div className="qa-stat-mini-tile">
                  <div className="qa-stat-mini-icon text-teal-600">
                    <CheckCircle2 size={15} />
                  </div>
                  <div className="qa-stat-mini-content">
                    <span className="qa-stat-mini-num q-num">{profile?.solvedCount || 0}</span>
                    <span className="qa-stat-mini-lbl">Chấp nhận</span>
                  </div>
                </div>

                <div className="qa-stat-mini-tile">
                  <div className="qa-stat-mini-icon text-rose-500">
                    <Heart size={15} />
                  </div>
                  <div className="qa-stat-mini-content">
                    <span className="qa-stat-mini-num q-num">{profile?.upvotesReceived || 0}</span>
                    <span className="qa-stat-mini-lbl">Lượt hữu ích</span>
                  </div>
                </div>
              </div>

              {/* Tier Progress Section */}
              <div className="qa-profile-tier-section">
                {progress.nextTier ? (
                  <div className="qa-tier-progress-box">
                    <div className="qa-tier-progress-header">
                      <span className="qa-tier-cur-name">Hạng: <strong>{tier.name}</strong></span>
                      <span className="qa-tier-pts q-num">
                        {progress.current}/{progress.target}
                      </span>
                    </div>
                    <div className="qa-tier-bar-track">
                      <div
                        className="qa-tier-bar-fill"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <div className="qa-tier-remaining-text">
                      Còn <strong>{progress.remaining}</strong> điểm tới <strong>{progress.nextTier.name}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="qa-tier-progress-box is-max-tier">
                    <div className="qa-tier-progress-header">
                      <span className="qa-tier-cur-name">Hạng cao nhất: <strong>{tier.name}</strong></span>
                      <span className="qa-tier-max-badge">Đạt đỉnh</span>
                    </div>
                    <div className="qa-tier-bar-track">
                      <div className="qa-tier-bar-fill is-max" style={{ width: '100%' }} />
                    </div>
                    <div className="qa-tier-remaining-text">Đã đạt mức thăng hạng tối đa của hệ thống</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="qa-profile-card qa-profile-actions-card">
              <button
                type="button"
                className="qa-profile-action-btn"
                onClick={handleCopyProfileLink}
              >
                {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Đã sao chép liên kết!' : 'Sao chép link hồ sơ'}</span>
              </button>

              {isMe && (
                <Link to="/account?tab=profile" className="qa-profile-action-btn secondary">
                  <ExternalLink size={14} />
                  <span>Chỉnh sửa hồ sơ cá nhân</span>
                </Link>
              )}
            </div>

          </aside>

          {/* ================= RIGHT COLUMN: CONTENT STREAM & TABS ================= */}
          <main className="qa-profile-main-col">
            
            {/* Modern Tab Bar */}
            <div className="qa-profile-tabs-rail" role="tablist">
              {tabs.map(({ id: tabId, label, icon: Icon, count }) => (
                <button
                  key={tabId}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tabId}
                  className={`qa-profile-tab-pill ${activeTab === tabId ? 'active' : ''}`}
                  onClick={() => setActiveTab(tabId)}
                >
                  <Icon size={16} />
                  <span className="qa-tab-label-text">{label}</span>
                  <span className="qa-tab-counter-chip q-num">{count}</span>
                </button>
              ))}
            </div>

            {/* Tab Body Stream */}
            <div className="qa-profile-tab-stream">
              {loading ? (
                <div className="qa-profile-loading-box">
                  <LoadingSkeleton variant="feed-card" count={3} />
                </div>
              ) : activeTab === 'posts' ? (
                userPosts.length === 0 ? (
                  <div className="qa-profile-empty-panel">
                    <EmptyState
                      variant="no-posts"
                      title="Chưa có bài toán nào"
                      description={isMe
                        ? 'Bạn chưa đăng câu hỏi hoặc bài viết nào trên diễn đàn Toán học.'
                        : 'Thành viên này chưa đăng bài toán nào trên diễn đàn.'}
                      actionLabel="Về diễn đàn Toán học"
                      onAction={() => { window.location.href = '/community'; }}
                    />
                  </div>
                ) : (
                  <div className="qa-profile-posts-list">
                    {userPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={signedInId}
                        isSaved={savedPostIds.includes(post.id)}
                        onUpvote={handleUpvotePost}
                        onToggleSave={toggleSavePost}
                        onEdit={openEditModal}
                        onDelete={onDeletePost}
                      />
                    ))}
                  </div>
                )
              ) : activeTab === 'saved' ? (
                savedPosts.length === 0 ? (
                  <div className="qa-profile-empty-panel">
                    <EmptyState
                      variant="no-saved"
                      title="Chưa có bài toán đã lưu"
                      description="Bạn chưa lưu bài toán nào. Hãy bấm biểu tượng Lưu trên các bài viết để đọc lại sau."
                      actionLabel="Khám phá diễn đàn"
                      onAction={() => { window.location.href = '/community'; }}
                    />
                  </div>
                ) : (
                  <div className="qa-profile-posts-list">
                    {savedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={signedInId}
                        isSaved
                        onUpvote={handleUpvotePost}
                        onToggleSave={toggleSavePost}
                        onEdit={openEditModal}
                        onDelete={onDeletePost}
                      />
                    ))}
                  </div>
                )
              ) : (
                /* Badges & Milestones Tab */
                <div className="qa-profile-badges-container">
                  {/* Category Filter Pills */}
                  <div className="qa-badge-category-filter">
                    {BADGE_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`qa-badge-pill-btn ${badgeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setBadgeCategory(cat.id)}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Badges Collection Grid */}
                  <div className="qa-badges-collection-grid">
                    {filteredBadges.map((badge) => {
                      const unlocked = earnedBadges.includes(badge.id);
                      const IconComponent = BADGE_ICON_MAP[badge.icon] || Award;
                      const progressPct = unlocked
                        ? 100
                        : Math.min(100, Math.round((points / (badge.pointsReq || 1)) * 100));

                      return (
                        <div
                          key={badge.id}
                          className={`qa-badge-tile-card ${unlocked ? 'is-unlocked' : 'is-locked'}`}
                        >
                          <div className="qa-badge-tile-header">
                            <div className={`qa-badge-tile-icon ${unlocked ? 'unlocked' : 'locked'}`}>
                              {unlocked ? <IconComponent size={20} /> : <Lock size={17} />}
                            </div>
                            <span className={`qa-badge-status-tag ${unlocked ? 'unlocked' : 'locked'}`}>
                              {unlocked ? (
                                <>
                                  <CheckCircle2 size={12} />
                                  <span>Đã đạt</span>
                                </>
                              ) : (
                                <span>Cần {badge.pointsReq} pts</span>
                              )}
                            </span>
                          </div>

                          <div className="qa-badge-tile-body">
                            <h3 className="qa-badge-tile-title">{badge.title}</h3>
                            <p className="qa-badge-tile-desc">{badge.desc}</p>
                          </div>

                          <div className="qa-badge-tile-progress">
                            <div className="qa-badge-tile-bar">
                              <div
                                className={`qa-badge-tile-fill ${unlocked ? 'is-full' : ''}`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </main>

        </div>
      </div>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={handlePostSubmit}
        editingPost={editingPost}
        currentUser={currentUser}
      />

      {isMe && (
        <AvatarCropModal
          isOpen={showAvatarCropModal}
          onClose={() => setShowAvatarCropModal(false)}
          onSave={handleSaveCroppedAvatar}
        />
      )}
    </div>
  );
}
