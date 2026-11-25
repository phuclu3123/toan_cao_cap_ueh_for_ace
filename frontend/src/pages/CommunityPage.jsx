import StudyWelcome from '../components/learning/StudyWelcome';
import { useState } from 'react';
import { Compass, Users, BookOpen } from 'lucide-react';
import CommunityPanel from '../components/community/CommunityPanel';
import MathMarginArtwork from '../components/community/MathMarginArtwork';
import { useSearchParams } from 'react-router-dom';
import { useCommunity } from '../contexts/CommunityContext';
import { useAuth } from '../contexts/AuthContext';
import CommunityNavSidebar from '../components/community/CommunityNavSidebar';
import PostFilterBar from '../components/community/PostFilterBar';
import PostCard from '../components/community/PostCard';
import CommunitySidebar from '../components/community/CommunitySidebar';
import CommunityTagsDialog from '../components/community/CommunityTagsDialog';
import MobileFilterDrawer from '../components/community/MobileFilterDrawer';
import Pagination from '../components/community/Pagination';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import LeaderboardModal from '../components/community/LeaderboardModal';
import FormulaCheatsheetModal from '../components/community/FormulaCheatsheetModal';
import CreatePostModal from '../components/community/CreatePostModal';
import ReportContentModal from '../components/community/ReportContentModal';
import AuthModal from '../components/modals/AuthModal';
import '../assets/styles/community.css';
import '../assets/styles/community-workspace.css';
import '../assets/styles/community-discussion.css';

/**
 * CommunityPage: Clean Mathematics 3-Column Workspace (No clunky top banner)
 */
export default function CommunityPage() {
  const [urlParams, setUrlParams] = useSearchParams();
  const { currentUser } = useAuth();
  const {
    posts,
    totalPosts,
    totalPages,
    loading,
    error,
    sessionActionError,
    clearSessionActionError,
    degraded,
    metadataError,
    refreshMetadata,
    stats,
    leaderboard,
    hotQuestions,
    trendingTags,
    activeSubject,
    activeDifficulty,
    activeStatus,
    activeSort,
    searchQuery,
    activeTag,
    currentPage,
    setSubject,
    setDifficulty,
    setStatus,
    setSort,
    setView,
    setSearchQuery,
    setTag,
    setPage,
    clearAllFilters,
    refreshPosts,
    savedPostIds,
    visitedPostIds,
    toggleSavePost,
    hidePost,
    hiddenPostIds,
    restoreHiddenPosts,
    handleUpvotePost,
    handleCreatePost,
    handleUpdatePost,
    handleDeletePost,
    isCreateModalOpen,
    editingPost,
    openCreateModal,
    openEditModal,
    closeCreateModal,
    isCheatsheetOpen,
    setIsCheatsheetOpen,
    isLeaderboardOpen,
    setIsLeaderboardOpen,
    isMobileFilterOpen,
    setIsMobileFilterOpen,
    reportPost
  } = useCommunity();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [showTags, setShowTags] = useState(false);
  const closeTags = () => { setShowTags(false); if (urlParams.has('browse')) setUrlParams(prev => { const next = new URLSearchParams(prev); next.delete('browse'); return next; }, { replace: true }); };

  const currentUserId = currentUser?.id || currentUser?.uid || null;

  const handleRequireLogin = () => {
    setShowAuthModal(true);
  };

  const handlePostSubmit = async (postData) => {
    if (editingPost) {
      return handleUpdatePost(editingPost.id, postData);
    }
    return handleCreatePost(postData);
  };

  const handleNavSelect = (navKey) => {
    if (navKey === 'questions') {
      clearAllFilters();
    } else if (navKey === 'unanswered') {
      setView({ status: 'unsolved', sort: 'newest' });
    } else if (navKey === 'saved') {
      if (!currentUser) return handleRequireLogin();
      setView({ status: 'saved' });
    } else if (navKey === 'tags') {
      setShowTags(true);
    }
  };

  return (
    <div className="qa-math-site-wrapper qa-community-workspace qa-focused-feed">
      <MathMarginArtwork />
      {/* 3-Column Mathematics StackExchange Layout */}
      <div className="qa-main-container">
        <div className="qa-workspace-tools">
          <CommunityPanel title="Khám phá cộng đồng" label="Khám phá" icon={Compass}>{({ close }) => <CommunityNavSidebar activeStatus={activeStatus} totalUnanswered={stats?.openCount || 0} savedCount={savedPostIds.length}
            onSelectNav={key => { close(); handleNavSelect(key); }} onOpenLeaderboard={() => { close(); setIsLeaderboardOpen(true); }} onOpenCheatsheet={() => { close(); setIsCheatsheetOpen(true); }} />}</CommunityPanel>
          <div className="qa-workspace-tools-end">
            <button type="button" className="qa-tools-trigger" onClick={() => setIsCheatsheetOpen(true)}><BookOpen size={17} />Sổ tay của Phúc</button>
            <CommunityPanel title="Cộng đồng" icon={Users}>{({ close }) => <CommunitySidebar leaderboard={leaderboard} hotQuestions={hotQuestions} metadataError={metadataError} onRetry={refreshMetadata}
              onOpenLeaderboard={() => { close(); setIsLeaderboardOpen(true); }} onOpenCheatsheet={() => { close(); setIsCheatsheetOpen(true); }} />}</CommunityPanel>
          </div>
        </div>
        <div className="qa-3col-layout">
          {/* Left Column: Navigation Sidebar */}


          {/* Center Column: Questions Feed */}
          <main className="qa-center-col" id="qa-feed-main">
            {/* Filter Bar with Search, Tag Pills, and Sort Tabs */}
            <PostFilterBar
              activeSubject={activeSubject}
              activeDifficulty={activeDifficulty}
              activeStatus={activeStatus}
              activeSort={activeSort}
              activeTag={activeTag}
              searchQuery={searchQuery}
              totalResults={totalPosts}
              onSubjectChange={setSubject}
              onDifficultyChange={setDifficulty}
              onStatusChange={setStatus}
              onSortChange={setSort}
              onSearchChange={setSearchQuery}
              onTagChange={setTag}
              onClearFilters={clearAllFilters}
              onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
              onOpenCreate={currentUser ? openCreateModal : handleRequireLogin}
              stats={stats}
              trendingTags={trendingTags}
              onOpenTags={() => setShowTags(true)}
              onViewChange={view => {
                if (view.status === 'saved' && !currentUser) return handleRequireLogin();
                setView(view);
              }}
            />

            {sessionActionError && <div className="qa-inline-notice qa-action-feedback is-error" role="alert">{sessionActionError} <button type="button" onClick={() => { clearSessionActionError(); handleRequireLogin(); }}>Đăng nhập lại</button></div>}
            {degraded && <div className="qa-inline-notice" role="status">Đang xem dữ liệu dự phòng. Kết nối máy chủ trước khi đăng hoặc cập nhật nội dung.</div>}
            {hiddenPostIds.length > 0 && <div className="qa-hidden-notice"><span>{hiddenPostIds.length} bài đã ẩn trên thiết bị này</span><button type="button" onClick={restoreHiddenPosts}>Hiện lại</button></div>}

            {/* Content States */}
            {loading ? (
              <div className="qa-feed-loading">
                <LoadingSkeleton variant="feed-card" count={4} />
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={refreshPosts} />
            ) : posts.length === 0 ? (
              <EmptyState
                variant={
                  searchQuery
                    ? 'no-results'
                    : activeStatus === 'saved'
                    ? 'no-saved'
                    : 'no-posts'
                }
                onAction={
                  searchQuery || activeSubject !== 'all' || activeTag
                    ? clearAllFilters
                    : activeStatus === 'saved'
                    ? () => setStatus('all')
                    : currentUser
                    ? openCreateModal
                    : handleRequireLogin
                }
              />
            ) : (
              <>
                <div className="qa-questions-stream">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={currentUserId}
                      isVisited={visitedPostIds.includes(post.id)}
                      isSaved={savedPostIds.includes(post.id)}
                      onUpvote={currentUser ? handleUpvotePost : handleRequireLogin}
                      onToggleSave={currentUser ? toggleSavePost : handleRequireLogin}
                      onEdit={openEditModal}
                      onDelete={(target) => handleDeletePost(target.id)}
                      onHide={hidePost}
                      onReport={currentUser ? setReportTarget : handleRequireLogin}
                    />
                  ))}
                </div>

                {/* StackExchange Style Pagination */}
                <div className="qa-pagination-wrap">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              </>
            )}
          <StudyWelcome current="community" />
          </main>

          {/* Right Column: Widgets Sidebar */}

        </div>
      </div>

      {/* Modals & Drawers */}
      <CommunityTagsDialog isOpen={showTags || urlParams.get('browse') === 'tags'} onClose={closeTags} tags={trendingTags} onSelect={tag => { setView({ tag, browse: '' }); setShowTags(false); }} />
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={handlePostSubmit}
        editingPost={editingPost}
        currentUser={currentUser}
        onRequireLogin={handleRequireLogin}
        onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        leaderboard={leaderboard}
      />

      <FormulaCheatsheetModal
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />

      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        activeSubject={activeSubject}
        activeDifficulty={activeDifficulty}
        activeStatus={activeStatus}
        activeSort={activeSort}
        onSubjectChange={setSubject}
        onDifficultyChange={setDifficulty}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onClearFilters={clearAllFilters}
      />

      <ReportContentModal
        isOpen={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        onSubmit={async (data) => {
          await reportPost({ ...data, targetId: reportTarget?.id });
        }}
        contentTitle={reportTarget?.title || 'Bài viết'}
      />

      {showAuthModal && (
        <AuthModal
          showLoginModal={showAuthModal}
          setShowLoginModal={setShowAuthModal}
        />
      )}
    </div>
  );
}
