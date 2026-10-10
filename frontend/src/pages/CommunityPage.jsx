import { useState } from 'react';
import { useCommunity } from '../contexts/CommunityContext';
import { useAuth } from '../contexts/AuthContext';
import CommunityNavSidebar from '../components/community/CommunityNavSidebar';
import PostFilterBar from '../components/community/PostFilterBar';
import PostCard from '../components/community/PostCard';
import CommunitySidebar from '../components/community/CommunitySidebar';
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

/**
 * CommunityPage: Clean Mathematics 3-Column Workspace (No clunky top banner)
 */
export default function CommunityPage() {
  const { currentUser } = useAuth();
  const {
    posts,
    totalPosts,
    totalPages,
    loading,
    error,
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
    setSearchQuery,
    setTag,
    setPage,
    clearAllFilters,
    refreshPosts,
    savedPostIds,
    visitedPostIds,
    toggleSavePost,
    hidePost,
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
  const [activeNav, setActiveNav] = useState('questions');

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
    setActiveNav(navKey);
    if (navKey === 'questions') {
      setStatus('all');
      setSort('newest');
    } else if (navKey === 'unanswered') {
      setStatus('unsolved');
      setSort('newest');
    } else if (navKey === 'saved') {
      setStatus('saved');
    } else if (navKey === 'tags') {
      setTag('');
    }
  };

  return (
    <div className="qa-math-site-wrapper">
      {/* 3-Column Mathematics StackExchange Layout */}
      <div className="qa-main-container" style={{ paddingTop: '28px' }}>
        <div className="qa-3col-layout">
          {/* Left Column: Navigation Sidebar */}
          <aside className="qa-left-col">
            <CommunityNavSidebar
              activeNav={activeNav}
              activeStatus={activeStatus}
              onSelectNav={handleNavSelect}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
              onOpenCreate={currentUser ? openCreateModal : handleRequireLogin}
              totalUnanswered={stats?.openCount || 0}
              savedCount={savedPostIds.length}
            />
          </aside>

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
            />

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
                    ? () => { setStatus('all'); setActiveNav('questions'); }
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
          </main>

          {/* Right Column: Widgets Sidebar */}
          <aside className="qa-right-col">
            <CommunitySidebar
              leaderboard={leaderboard}
              hotQuestions={hotQuestions}
              trendingTags={trendingTags}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
            />
          </aside>
        </div>
      </div>

      {/* Modals & Drawers */}
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
