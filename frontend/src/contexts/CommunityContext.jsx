import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { communityService } from '../services/communityService';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { REPUTATION_POINTS } from '../services/reputationService';

const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {
  const { currentUser, addReputationPoints } = useAuth();
  const { addNotification } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filter values from URL Search Params
  const activeSubject = searchParams.get('subject') || 'all';
  const activeDifficulty = searchParams.get('difficulty') || 'all';
  const activeStatus = searchParams.get('status') || 'all';
  const activeSort = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('q') || '';
  const activeTag = searchParams.get('tag') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // States
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [savedPostIds, setSavedPostIds] = useState(() => communityService.getSavedPostIds());
  const [visitedPostIds, setVisitedPostIds] = useState(() => communityService.getVisitedPostIds());
  const [hiddenPostIds, setHiddenPostIds] = useState(() => communityService.getHiddenPostIds());

  const [stats, setStats] = useState(() => communityService.getCommunityStats());
  const [leaderboard, setLeaderboard] = useState(() => communityService.getLeaderboard());
  const [trendingTags, setTrendingTags] = useState(() => communityService.getTrendingTags());

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Synchronize state changes to URL search params
  const updateUrlParams = useCallback((newParams) => {
    setSearchParams(prev => {
      const updated = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (!value || value === 'all' || (key === 'page' && value === 1)) {
          updated.delete(key);
        } else {
          updated.set(key, value.toString());
        }
      });
      return updated;
    }, { replace: true });
  }, [setSearchParams]);

  // Filter setters that sync to URL
  const setSubject = useCallback((sub) => {
    updateUrlParams({ subject: sub, page: 1 });
  }, [updateUrlParams]);

  const setDifficulty = useCallback((diff) => {
    updateUrlParams({ difficulty: diff, page: 1 });
  }, [updateUrlParams]);

  const setStatus = useCallback((stat) => {
    updateUrlParams({ status: stat, page: 1 });
  }, [updateUrlParams]);

  const setSort = useCallback((srt) => {
    updateUrlParams({ sort: srt, page: 1 });
  }, [updateUrlParams]);

  const setSearchQuery = useCallback((q) => {
    updateUrlParams({ q, page: 1 });
  }, [updateUrlParams]);

  const setTag = useCallback((t) => {
    updateUrlParams({ tag: t, page: 1 });
  }, [updateUrlParams]);

  const setPage = useCallback((pg) => {
    updateUrlParams({ page: pg });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrlParams]);

  const clearAllFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // Load posts whenever search params or hidden list change
  const refreshPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await communityService.getPosts({
        subject: activeSubject,
        difficulty: activeDifficulty,
        status: activeStatus,
        sort: activeSort,
        query: searchQuery,
        tag: activeTag,
        page: currentPage,
        limit: 8
      });

      setPosts(res.posts);
      setTotalPosts(res.total);
      setTotalPages(res.totalPages);
      setStats(communityService.getCommunityStats());
      setLeaderboard(communityService.getLeaderboard());
      setTrendingTags(communityService.getTrendingTags());
    } catch (err) {
      console.error('Lỗi khi tải bài viết community:', err);
      setError(err.message || 'Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  }, [activeSubject, activeDifficulty, activeStatus, activeSort, searchQuery, activeTag, currentPage]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Bookmark / Save
  const toggleSavePost = useCallback((postId) => {
    const { isSaved, savedPostIds: nextSaved } = communityService.toggleSavePost(postId);
    setSavedPostIds([...nextSaved]);
    return isSaved;
  }, []);

  // Mark visited
  const markVisited = useCallback((postId) => {
    const nextVisited = communityService.markPostVisited(postId);
    setVisitedPostIds([...nextVisited]);
  }, []);

  // Hide post
  const hidePost = useCallback((postId) => {
    const nextHidden = communityService.hidePost(postId);
    setHiddenPostIds([...nextHidden]);
    setPosts(prev => prev.filter(p => p.id !== postId));
  }, []);

  // Report post
  const reportPost = useCallback((data) => {
    return communityService.reportContent(data);
  }, []);

  // Upvote Post
  const handleUpvotePost = useCallback(async (postId) => {
    const userId = currentUser?.uid || currentUser?.id || 'guest';
    const result = await communityService.toggleUpvotePost(postId, userId);

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          upvotes: result.upvotes,
          upvotedBy: result.hasUpvoted
            ? [...(p.upvotedBy || []), userId]
            : (p.upvotedBy || []).filter(id => id !== userId)
        };
      }
      return p;
    }));

    if (result.hasUpvoted && currentUser) {
      addReputationPoints(REPUTATION_POINTS.UPVOTE_QUESTION_RECEIVED);
    }

    return result;
  }, [currentUser, addReputationPoints]);

  // Create Post
  const handleCreatePost = useCallback(async (postData) => {
    const created = await communityService.createPost({
      ...postData,
      author: currentUser || { name: 'Sinh viên UEH', cohort: 'K50 UEH', points: 65 }
    });

    if (currentUser) {
      addReputationPoints(REPUTATION_POINTS.POST_QUESTION);
    }

    setSavedPostIds(communityService.getSavedPostIds());
    setVisitedPostIds(communityService.getVisitedPostIds());
    await refreshPosts();
    return created;
  }, [currentUser, addReputationPoints, refreshPosts]);

  // Update Post
  const handleUpdatePost = useCallback(async (postId, updateData) => {
    const updated = await communityService.updatePost(postId, updateData);
    setPosts(prev => prev.map(p => p.id === postId ? updated : p));
    return updated;
  }, []);

  // Delete Post
  const handleDeletePost = useCallback(async (postId) => {
    await communityService.deletePost(postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    setTotalPosts(prev => Math.max(0, prev - 1));
  }, []);

  // Add Answer
  const handleAddAnswer = useCallback(async (postId, content) => {
    const result = await communityService.addAnswer(postId, {
      content,
      author: currentUser || { name: 'Sinh viên UEH', cohort: 'K50 UEH', points: 65 }
    });

    if (currentUser) {
      const earned = REPUTATION_POINTS.POST_ANSWER + (result.isFirstAnswer ? REPUTATION_POINTS.FIRST_SOLVER_BONUS : 0);
      addReputationPoints(earned);
    }

    // Trigger in-app notification to post author if not self
    if (result.post.author?.id !== (currentUser?.uid || currentUser?.id)) {
      addNotification({
        type: 'answer',
        title: 'Lời giải mới cho bài toán của bạn ✍️',
        message: `${currentUser?.displayName || currentUser?.name || 'Một sinh viên'} vừa gửi lời giải cho bài toán "${result.post.title.slice(0, 45)}..."`,
        link: `/community/${postId}#${result.answer.id}`,
        postId,
        targetId: result.answer.id,
        actor: {
          name: currentUser?.displayName || currentUser?.name || 'Sinh viên UEH',
          avatar: currentUser?.photoURL || currentUser?.avatar || ''
        }
      });
    }

    await refreshPosts();
    return result;
  }, [currentUser, addReputationPoints, addNotification, refreshPosts]);

  // Accept Answer
  const handleAcceptAnswer = useCallback(async (postId, answerId, isInstructor = false) => {
    const result = await communityService.toggleAcceptAnswer(postId, answerId, isInstructor);

    if (result.isAccepted && result.answerAuthorId !== (currentUser?.uid || currentUser?.id)) {
      addReputationPoints(isInstructor ? REPUTATION_POINTS.INSTRUCTOR_VERIFIED : REPUTATION_POINTS.ACCEPTED_SOLUTION);

      addNotification({
        type: 'accepted_solution',
        title: isInstructor ? 'Lời giải đã được xác minh' : 'Lời giải của bạn được ghim nổi bật',
        message: isInstructor
          ? 'Cố vấn học thuật đã xác minh chuyên môn cho lời giải của bạn.'
          : 'Tác giả đã đề xuất lời giải của bạn làm phương án tham khảo nổi bật.',
        link: `/community/${postId}#${answerId}`,
        postId,
        targetId: answerId,
        actor: {
          name: currentUser?.displayName || currentUser?.name || 'Tác giả bài viết',
          avatar: currentUser?.photoURL || currentUser?.avatar || ''
        }
      });
    }

    await refreshPosts();
    return result;
  }, [currentUser, addReputationPoints, addNotification, refreshPosts]);

  const value = {
    // Data & state
    posts,
    totalPosts,
    totalPages,
    loading,
    error,
    stats,
    leaderboard,
    trendingTags,

    // Filter controls
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

    // Tracking
    savedPostIds,
    visitedPostIds,
    hiddenPostIds,
    toggleSavePost,
    markVisited,
    hidePost,
    reportPost,

    // Actions
    handleUpvotePost,
    handleCreatePost,
    handleUpdatePost,
    handleDeletePost,
    handleAddAnswer,
    handleAcceptAnswer,

    // Modals
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingPost,
    setEditingPost,
    isCheatsheetOpen,
    setIsCheatsheetOpen,
    isLeaderboardOpen,
    setIsLeaderboardOpen,
    isMobileFilterOpen,
    setIsMobileFilterOpen,

    openCreateModal: () => { setEditingPost(null); setIsCreateModalOpen(true); },
    openEditModal: (post) => { setEditingPost(post); setIsCreateModalOpen(true); },
    closeCreateModal: () => { setIsCreateModalOpen(false); setEditingPost(null); }
  };

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
}

export default CommunityContext;
