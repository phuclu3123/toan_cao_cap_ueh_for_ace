import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { communityService } from '../services/communityService';
import { useAuth } from './AuthContext';

const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {
  const { currentUser } = useAuth();
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
  const refreshRequestIdRef = useRef(0);
  const metadataRequestIdRef = useRef(0);

  const [savedPostIds, setSavedPostIds] = useState([]);
  const [visitedPostIds, setVisitedPostIds] = useState(() => communityService.getVisitedPostIds());
  const [hiddenPostIds, setHiddenPostIds] = useState(() => communityService.getHiddenPostIds());

  const [stats, setStats] = useState({ totalPosts: 0, solvedCount: 0, openCount: 0, totalAnswers: 0, solvedPercentage: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [hotQuestions, setHotQuestions] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);

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
    const requestId = refreshRequestIdRef.current + 1;
    refreshRequestIdRef.current = requestId;
    setLoading(true);
    setError(null);
    try {
      if (activeStatus === 'saved' && !currentUser) {
        setPosts([]);
        setTotalPosts(0);
        setTotalPages(1);
        setSavedPostIds([]);
        return;
      }
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

      if (requestId === refreshRequestIdRef.current) {
        setPosts(res.posts);
        setTotalPosts(res.total);
        setTotalPages(res.totalPages);
        setLoading(false);
      }

    } catch (err) {
      console.error('Lỗi khi tải bài viết community:', err);
      if (requestId === refreshRequestIdRef.current) {
        setError(err.message || 'Không thể tải danh sách bài viết');
      }
    } finally {
      if (requestId === refreshRequestIdRef.current) setLoading(false);
    }
  }, [activeSubject, activeDifficulty, activeStatus, activeSort, searchQuery, activeTag, currentPage, currentUser]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const refreshMetadata = useCallback(async () => {
    const requestId = metadataRequestIdRef.current + 1;
    metadataRequestIdRef.current = requestId;
    const [statsResult, leaderboardResult, hotResult, savedResult] = await Promise.allSettled([
      communityService.fetchCommunityStats(),
      communityService.fetchLeaderboard(),
      communityService.getPosts({ sort: 'popular', page: 1, limit: 5 }),
      currentUser ? communityService.fetchSavedPostIds() : Promise.resolve([])
    ]);
    if (requestId !== metadataRequestIdRef.current) return;
    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value);
      setTrendingTags(Array.isArray(statsResult.value.trendingTags) ? statsResult.value.trendingTags : []);
    }
    if (leaderboardResult.status === 'fulfilled') setLeaderboard(leaderboardResult.value);
    if (hotResult.status === 'fulfilled') {
      setHotQuestions(hotResult.value.posts);
    }
    if (savedResult.status === 'fulfilled') setSavedPostIds(savedResult.value);
  }, [currentUser]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    refreshMetadata();
  }, [refreshMetadata]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Bookmark / Save
  const toggleSavePost = useCallback(async (postId) => {
    const { isSaved, savedPostIds: nextSaved } = await communityService.toggleSavePost(postId);
    setSavedPostIds([...nextSaved]);
    if (!isSaved && activeStatus === 'saved') {
      setPosts((previous) => previous.filter((post) => post.id !== postId));
      setTotalPosts((previous) => Math.max(0, previous - 1));
    }
    return isSaved;
  }, [activeStatus]);

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
  const reportPost = useCallback(async (data) => {
    return communityService.reportContent(data);
  }, []);

  // Vote Post (Up / Down)
  const handleVotePost = useCallback(async (postId, voteType = 'up') => {
    const userId = currentUser?.id || currentUser?.uid || 'guest';
    const result = await communityService.votePost(postId, userId, voteType);

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          upvotes: result.upvotes,
          upvotedBy: result.upvotedBy,
          downvotedBy: result.downvotedBy
        };
      }
      return p;
    }));

    return result;
  }, [currentUser]);

  const handleUpvotePost = useCallback(async (postId) => {
    return handleVotePost(postId, 'up');
  }, [handleVotePost]);

  const handleDownvotePost = useCallback(async (postId) => {
    return handleVotePost(postId, 'down');
  }, [handleVotePost]);

  // Vote Answer (Up / Down)
  const handleVoteAnswer = useCallback(async (postId, answerId, voteType = 'up') => {
    const userId = currentUser?.id || currentUser?.uid || 'guest';
    const result = await communityService.voteAnswer(postId, answerId, userId, voteType);

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          answers: (p.answers || []).map(a => {
            if (a.id === answerId) {
              return {
                ...a,
                upvotes: result.upvotes,
                upvotedBy: result.upvotedBy,
                downvotedBy: result.downvotedBy
              };
            }
            return a;
          })
        };
      }
      return p;
    }));

    return result;
  }, [currentUser]);

  const handleUpvoteAnswer = useCallback(async (postId, answerId) => {
    return handleVoteAnswer(postId, answerId, 'up');
  }, [handleVoteAnswer]);

  const handleDownvoteAnswer = useCallback(async (postId, answerId) => {
    return handleVoteAnswer(postId, answerId, 'down');
  }, [handleVoteAnswer]);

  // Create Post
  const handleCreatePost = useCallback(async (postData) => {
    const created = await communityService.createPost({
      ...postData,
      author: currentUser || { name: 'Sinh viên UEH', cohort: 'K50 UEH', points: 65 }
    });

    setVisitedPostIds(communityService.getVisitedPostIds());
    await Promise.all([refreshPosts(), refreshMetadata()]);
    return created;
  }, [currentUser, refreshMetadata, refreshPosts]);

  // Update Post
  const handleUpdatePost = useCallback(async (postId, updateData) => {
    const updated = await communityService.updatePost(postId, updateData);
    setPosts(prev => prev.map(p => p.id === postId ? updated : p));
    await refreshMetadata();
    return updated;
  }, [refreshMetadata]);

  // Delete Post
  const handleDeletePost = useCallback(async (postId) => {
    await communityService.deletePost(postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    setTotalPosts(prev => Math.max(0, prev - 1));
    await refreshMetadata();
  }, [refreshMetadata]);

  // Add Answer
  const handleAddAnswer = useCallback(async (postId, content) => {
    const result = await communityService.addAnswer(postId, {
      content,
      author: currentUser || { name: 'Sinh viên UEH', cohort: 'K50 UEH', points: 65 }
    });

    await Promise.all([refreshPosts(), refreshMetadata()]);
    return result;
  }, [currentUser, refreshMetadata, refreshPosts]);

  // Accept Answer
  const handleAcceptAnswer = useCallback(async (postId, answerId, isInstructor = false) => {
    const result = await communityService.toggleAcceptAnswer(postId, answerId, isInstructor);

    await Promise.all([refreshPosts(), refreshMetadata()]);
    return result;
  }, [refreshMetadata, refreshPosts]);

  const value = {
    // Data & state
    posts,
    totalPosts,
    totalPages,
    loading,
    error,
    stats,
    leaderboard,
    hotQuestions,
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
    handleVotePost,
    handleUpvotePost,
    handleDownvotePost,
    handleVoteAnswer,
    handleUpvoteAnswer,
    handleDownvoteAnswer,
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
