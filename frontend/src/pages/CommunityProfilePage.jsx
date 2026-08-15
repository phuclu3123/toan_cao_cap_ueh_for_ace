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
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCommunity } from '../contexts/CommunityContext';
import { getTierProgress, getTierByPoints, SPECIALTY_BADGES } from '../services/reputationService';
import { communityService } from '../services/communityService';
import { isAdminIdentity, getAdminBadgeIds } from '../services/adminService';
import UserRankBadge from '../components/community/UserRankBadge';
import PostCard from '../components/community/PostCard';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import '../assets/styles/community.css';

/** Badges a member has earned, derived from their activity. */
function resolveBadges(profile) {
  if (!profile) return [];
  if (profile.isAdmin) return getAdminBadgeIds();

  const earned = [];
  if (profile.solvedCount >= 1) earned.push('first-solver');
  if (profile.answersCount >= 5) earned.push('algebra-master');
  if (profile.solvedCount >= 3) earned.push('lagrange-pro');
  if (profile.points >= 500) earned.push('top-contributor');
  return earned;
}

export default function CommunityProfilePage({ defaultTab = 'posts' }) {
  const { id } = useParams();
  const { currentUser, reputationPoints } = useAuth();
  const { savedPostIds, toggleSavePost, handleUpvotePost } = useCommunity();

  const signedInId = currentUser?.uid || currentUser?.id || null;
  const isSelfRoute = !id || id === 'me';
  const targetId = isSelfRoute ? (signedInId || 'user-phuc') : id;
  const isMe = Boolean(signedInId && targetId === signedInId) || isSelfRoute;

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        if (isMe && currentUser) {
          merged.name = currentUser.displayName || currentUser.name || merged.name;
          merged.avatar = currentUser.photoURL || currentUser.avatar || merged.avatar;
          merged.cohort = currentUser.cohort || merged.cohort;
          merged.email = currentUser.email || merged.email;
          if (!isAdminIdentity(merged)) {
            merged.points = Math.max(merged.points, reputationPoints || 0);
          }
        }
        if (isAdminIdentity(merged)) {
          merged.isAdmin = true;
          merged.points = 9999;
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
    return () => { cancelled = true; };
  }, [targetId, isMe, savedPostIds, currentUser, reputationPoints]);

  const points = profile?.points || 0;
  const tier = getTierByPoints(points);
  const progress = getTierProgress(points);
  const earnedBadges = useMemo(() => resolveBadges(profile), [profile]);

  const tabs = [
    { id: 'posts', label: 'Bài toán đã đăng', icon: HelpCircle, count: userPosts.length },
    ...(isMe ? [{ id: 'saved', label: 'Bài đã lưu', icon: Bookmark, count: savedPosts.length }] : []),
    { id: 'badges', label: 'Huy hiệu', icon: Award, count: earnedBadges.length }
  ];

  return (
    <div className="community-page-wrapper">
      <div className="container qa-profile-container">
        <div className="detail-top-nav">
          <Link to="/community" className="detail-back-btn">
            <ArrowLeft size={16} />
            <span>Về diễn đàn Toán học</span>
          </Link>
        </div>

        {/* Profile masthead */}
        <header className={`qa-profile-head ${profile?.isAdmin ? 'is-owner' : ''}`}>
          <div className="qa-profile-identity">
            <div className="qa-profile-avatar">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} />
              ) : (
                <span>{(profile?.name || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="qa-profile-meta">
              <div className="qa-profile-namerow">
                <h1 className="qa-profile-name">{profile?.name || 'Đang tải...'}</h1>
                {profile?.cohort && <span className="q-chip q-chip-neutral">{profile.cohort}</span>}
              </div>

              {/* The tier badge already reads "Quản trị viên UEH TCC" at ceiling score */}
              <div className="qa-profile-badges">
                <UserRankBadge
                  points={points}
                  isInstructor={Boolean(profile?.isInstructor)}
                  size="normal"
                />
              </div>

              <p className="qa-profile-bio">
                {profile?.isAdmin
                  ? 'Người sáng lập và quản trị nền tảng UEH TCC — biên soạn tài liệu, kiểm duyệt lời giải và đồng hành cùng sinh viên trong từng bài toán.'
                  : 'Thành viên cộng đồng Toán Cao Cấp UEH — cùng đặt câu hỏi, trình bày lời giải và học hỏi lẫn nhau.'}
              </p>
            </div>
          </div>

          {/* Statistic strip */}
          <dl className="qa-profile-stats">
            <div className="qa-profile-stat is-accent">
              <dt>Điểm cống hiến</dt>
              <dd className="q-num">{points.toLocaleString('vi-VN')}</dd>
            </div>
            <div className="qa-profile-stat">
              <dt><HelpCircle size={11} /> Bài toán</dt>
              <dd className="q-num">{profile?.postsCount || 0}</dd>
            </div>
            <div className="qa-profile-stat">
              <dt><MessageSquare size={11} /> Lời giải</dt>
              <dd className="q-num">{profile?.answersCount || 0}</dd>
            </div>
            <div className="qa-profile-stat">
              <dt><CheckCircle2 size={11} /> Được chấp nhận</dt>
              <dd className="q-num">{profile?.solvedCount || 0}</dd>
            </div>
            <div className="qa-profile-stat">
              <dt><Heart size={11} /> Lượt hữu ích</dt>
              <dd className="q-num">{profile?.upvotesReceived || 0}</dd>
            </div>
          </dl>

          {/* Tier progress — the owner is already at the ceiling */}
          {progress.nextTier ? (
            <div className="qa-tierbar">
              <div className="qa-tierbar-labels">
                <span>Hạng hiện tại: <strong>{tier.name}</strong></span>
                <span className="q-num">
                  {progress.current}/{progress.target} — còn {progress.remaining} điểm tới {progress.nextTier.name}
                </span>
              </div>
              <div className="qa-tierbar-track">
                <i style={{ width: `${progress.percentage}%` }} />
              </div>
            </div>
          ) : (
            <div className="qa-tierbar is-max">
              <div className="qa-tierbar-labels">
                <span>Hạng cao nhất: <strong>{tier.name}</strong></span>
                <span>Đã đạt trần thăng hạng</span>
              </div>
              <div className="qa-tierbar-track"><i style={{ width: '100%' }} /></div>
            </div>
          )}
        </header>

        {/* Tabs */}
        <div className="profile-tabs-nav" role="tablist">
          {tabs.map(({ id: tabId, label, icon: Icon, count }) => (
            <button
              key={tabId}
              type="button"
              role="tab"
              aria-selected={activeTab === tabId}
              className={`profile-tab-btn ${activeTab === tabId ? 'active' : ''}`}
              onClick={() => setActiveTab(tabId)}
            >
              <Icon size={15} />
              <span>{label}</span>
              <span className="qa-tab-count q-num">{count}</span>
            </button>
          ))}
        </div>

        <div className="profile-tab-content-area">
          {loading ? (
            <LoadingSkeleton variant="feed-card" count={3} />
          ) : activeTab === 'posts' ? (
            userPosts.length === 0 ? (
              <EmptyState
                variant="no-posts"
                title="Chưa có bài toán nào"
                description={isMe
                  ? 'Bạn chưa đăng câu hỏi hoặc bài viết nào trên diễn đàn.'
                  : 'Thành viên này chưa đăng bài toán nào.'}
                actionLabel="Về diễn đàn"
                onAction={isMe ? () => { window.location.href = '/community'; } : undefined}
              />
            ) : (
              <div className="posts-feed-list">
                {userPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={signedInId}
                    isSaved={savedPostIds.includes(post.id)}
                    onUpvote={handleUpvotePost}
                    onToggleSave={toggleSavePost}
                  />
                ))}
              </div>
            )
          ) : activeTab === 'saved' ? (
            savedPosts.length === 0 ? (
              <EmptyState variant="no-saved" onAction={() => { window.location.href = '/community'; }} />
            ) : (
              <div className="posts-feed-list">
                {savedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={signedInId}
                    isSaved
                    onUpvote={handleUpvotePost}
                    onToggleSave={toggleSavePost}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="badges-collection-grid">
              {SPECIALTY_BADGES.map((badge) => {
                const unlocked = earnedBadges.includes(badge.id);
                return (
                  <div key={badge.id} className={`qa-badge-card ${unlocked ? 'is-unlocked' : ''}`}>
                    <span className="qa-badge-icon">
                      {unlocked ? <Award size={18} /> : <Lock size={16} />}
                    </span>
                    <div className="qa-badge-copy">
                      <h3>{badge.title}</h3>
                      <p>{badge.desc}</p>
                    </div>
                    <span className="qa-badge-state">
                      {unlocked ? (
                        <><CheckCircle2 size={12} /> Đã mở khóa</>
                      ) : (
                        'Chưa mở khóa'
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
