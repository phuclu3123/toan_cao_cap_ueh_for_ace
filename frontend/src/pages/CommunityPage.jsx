import { useState } from 'react';
import { Activity, ArrowDownRight } from 'lucide-react';
import { useCommunity } from '../contexts/CommunityContext';
import { useAuth } from '../contexts/AuthContext';
import CommunityHeader from '../components/community/CommunityHeader';
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
 * CommunityPage: Main Forum & Math Q&A Hub Page
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

  const currentUserId = currentUser?.uid || currentUser?.id || null;

  const handleRequireLogin = () => {
    setShowAuthModal(true);
  };

  const handlePostSubmit = async (postData) => {
    if (editingPost) {
      return handleUpdatePost(editingPost.id, postData);
    }
    return handleCreatePost(postData);
  };

  return (
    <div className="community-page-wrapper">
      <div className="container">
        {/* 1. Header & Stats Banner */}
        <CommunityHeader
          stats={stats}
          onOpenCreate={currentUser ? openCreateModal : handleRequireLogin}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
        />

        {/* 2. Main Body Grid (Feed + Sidebar) */}
        <div className="community-layout-grid">
          {/* Main Feed Column */}
          <main className="community-feed-col" id="community-main-feed">
            <div className="qa-feed-heading">
              <div>
                <span className="q-eyebrow">Problem index · {totalPosts} thảo luận</span>
                <h2>Bài toán đang được cộng đồng quan tâm</h2>
              </div>
              <span className="qa-feed-live">
                <Activity size={14} /> Cập nhật trực tiếp <ArrowDownRight size={14} />
              </span>
            </div>

            {/* Filter Bar */}
            <PostFilterBar
              activeSubject={activeSubject}
              activeDifficulty={activeDifficulty}
              activeStatus={activeStatus}
              activeSort={activeSort}
              searchQuery={searchQuery}
              activeTag={activeTag}
              totalResults={totalPosts}
              onSubjectChange={setSubject}
              onDifficultyChange={setDifficulty}
              onStatusChange={setStatus}
              onSortChange={setSort}
              onSearchChange={setSearchQuery}
              onTagChange={setTag}
              onClearFilters={clearAllFilters}
              onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
            />

            {/* Content States */}
            {loading ? (
              <LoadingSkeleton variant="feed-card" count={4} />
            ) : error ? (
              <ErrorState
                message={error}
                onRetry={refreshPosts}
              />
            ) : posts.length === 0 ? (
              <EmptyState
                variant={searchQuery ? 'no-results' : activeStatus === 'saved' ? 'no-saved' : 'no-posts'}
                onAction={
                  searchQuery || activeSubject !== 'all'
                    ? clearAllFilters
                    : (currentUser ? openCreateModal : handleRequireLogin)
                }
              />
            ) : (
              <>
                <div className="posts-feed-list">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={currentUserId}
                      isVisited={visitedPostIds.includes(post.id)}
                      isSaved={savedPostIds.includes(post.id)}
                      onUpvote={handleUpvotePost}
                      onToggleSave={toggleSavePost}
                      onEdit={openEditModal}
                      onDelete={(target) => handleDeletePost(target.id)}
                      onHide={hidePost}
                      onReport={setReportTarget}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </main>

          {/* Sidebar Column */}
          <div className="community-sidebar-col">
            <CommunitySidebar
              leaderboard={leaderboard}
              trendingTags={trendingTags}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
            />
          </div>
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
        onSubmit={(data) => {
          reportPost({ ...data, targetId: reportTarget?.id });
          setReportTarget(null);
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
