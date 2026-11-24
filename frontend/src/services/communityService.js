import { safeLocalStorage } from '../utils/safeStorage';
import { apiFetch, readApiJson } from '../utils/apiClient';
import { retryCommunityRead } from '../utils/retryCommunityRead';

const readCommunityQuery = request => retryCommunityRead(async () => readApiJson(await request()));

// Surface an expired write session even when the account refresh remounts a card.
async function readCommunityMutation(response) {
  try { return await readApiJson(await response); }
  catch (error) {
    if (error.status === 401 && typeof window !== 'undefined') window.dispatchEvent(new Event('ueh-tcc-community-session-expired'));
    throw error;
  }
}

/** A post counts as solved when it is flagged, or has an accepted answer. */
export function isPostSolved(post) {
  if (!post) return false;
  return Boolean(
    post.isSolved ||
    post.isAccepted ||
    post.status === 'solved' ||
    (post.answers || []).some(a => a.isAccepted || a.instructorVerified)
  );
}

/**
 * Lightweight publish preflight for questions.
 */
export function reviewCommunityPost({ type = 'question', title = '', content = '' } = {}) {
  if (type !== 'question') {
    return { passes: true, violations: [], checks: { clarity: true, safeMarkup: true, noSpam: true, respectful: true } };
  }

  const combined = `${title}\n${content}`.trim();
  const links = combined.match(/https?:\/\/\S+/gi) || [];
  const unsafeMarkup = /<\s*(script|iframe|object|embed)|javascript\s*:/i.test(combined);
  const spamPattern = /(.)\1{11,}|\b(?:casino|nhà cái|cá cược|kiếm tiền nhanh)\b/i.test(combined) || links.length > 3;
  const abusivePattern = /\b(?:địt|đụ|lồn|cặc|đéo|fuck|bitch)\b/i.test(combined);
  const clarity = title.trim().length >= 8 && content.trim().length >= 20;

  const violations = [];
  if (!clarity) violations.push('Câu hỏi chưa đủ tiêu đề hoặc mô tả để cộng đồng hiểu vấn đề.');
  if (unsafeMarkup) violations.push('Nội dung chứa mã nhúng hoặc liên kết thực thi không an toàn.');
  if (spamPattern) violations.push('Nội dung có dấu hiệu spam hoặc quảng cáo không liên quan.');
  if (abusivePattern) violations.push('Nội dung chứa ngôn từ công kích không phù hợp với thảo luận học thuật.');

  return {
    passes: violations.length === 0,
    violations,
    checks: {
      clarity,
      safeMarkup: !unsafeMarkup,
      noSpam: !spamPattern,
      respectful: !abusivePattern
    }
  };
}

/**
 * Shape a stored post for the UI: derive `isSolved` and credit the owner's byline.
 */
function normalizePost(post) {
  if (!post) return post;
  return {
    ...post,
    isSolved: isPostSolved(post),
    answersCount: post.answersCount ?? (post.answers || []).length,
    author: post.author,
    answers: (post.answers || []).map(answer => ({
      ...answer,
      author: answer.author
    }))
  };
}

const VISITED_POSTS_KEY = 'ueh_tcc_visited_posts';
const HIDDEN_POSTS_KEY = 'ueh_tcc_hidden_posts';

/**
 * 7 Core Subjects of UEH Higher & Applied Mathematics Curriculum
 */
export const SUBJECT_CATEGORIES = [
  { id: 'all', label: 'Tất cả chuyên mục', iconKey: 'Globe' },
  { id: 'algebra', label: 'Đại số Tuyến tính & Ma trận', iconKey: 'Grid' },
  { id: 'calc1', label: 'Vi tích phân 1 (Hàm 1 biến)', iconKey: 'TrendingUp' },
  { id: 'calc2', label: 'Vi tích phân 2 (Hàm nhiều biến & Tối ưu)', iconKey: 'Maximize2' },
  { id: 'econ_models', label: 'Mô hình Toán Kinh tế & Leontief', iconKey: 'BarChart3' },
  { id: 'prob_stats', label: 'Xác suất & Thống kê ứng dụng', iconKey: 'PieChart' },
  { id: 'exam_prep', label: 'Đề thi & Ôn luyện UEH', iconKey: 'GraduationCap' },
  { id: 'method_tips', label: 'Mẹo Casio & Công cụ hỗ trợ', iconKey: 'Cpu' }
];

export const DIFFICULTY_LEVELS = [
  { id: 'all', label: 'Tất cả mức độ', color: '#64748b', badgeBg: 'rgba(100, 116, 139, 0.12)' },
  { id: 'standard', label: 'Căn bản (5 - 6.5đ)', color: '#059669', badgeBg: 'rgba(5, 150, 105, 0.12)' },
  { id: 'medium', label: 'Khá Giỏi (7 - 8.5đ)', color: '#2563eb', badgeBg: 'rgba(37, 99, 235, 0.12)' },
  { id: 'hard', label: 'Nâng cao A+ (9 - 10đ)', color: '#d97706', badgeBg: 'rgba(217, 119, 6, 0.12)' },
  { id: 'olympiad', label: 'Thử thách Olympic UEH', color: '#7c3aed', badgeBg: 'rgba(124, 58, 237, 0.12)' }
];

class CommunityService {
  upsertCachedPost(post) { return normalizePost(post); }

  async getPosts(options = {}) {
    const params = new URLSearchParams();
    const search = options.search || options.query || '';
    for (const [key, value] of Object.entries({
      subject: options.subject,
      difficulty: options.difficulty,
      status: options.status,
      sort: options.sort,
      tag: options.tag,
      search,
      page: options.page,
      limit: options.limit
    })) {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    }

    const data = await readCommunityQuery(() => apiFetch(`/api/community/posts?${params.toString()}`));
    return {
      posts: (data.posts || []).map(normalizePost),
      degraded: Boolean(data.degraded),
      total: Number(data.total) || 0,
      totalPages: Number(data.totalPages) || 1,
      currentPage: Number(data.currentPage) || 1
    };
  }

  async getPostById(id, { recordView = true } = {}) {
    const data = await readApiJson(await apiFetch(`/api/community/posts/${encodeURIComponent(id)}${recordView ? '' : '?recordView=false'}`));
    return normalizePost(data.post);
  }

  async createPost(postData) {
    const review = reviewCommunityPost(postData);
    if (!review.passes) {
      throw new Error(review.violations.join(' '));
    }

    const payload = await readCommunityMutation(apiFetch('/api/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: postData.type || 'question',
        title: postData.title,
        content: postData.content,
        subject: postData.subject || 'calc2',
        difficulty: postData.difficulty || 'standard',
        tags: postData.tags || [],
        image: postData.image || null,
        altText: postData.altText || null
      })
    }));
    const newPost = normalizePost(payload.post);
    return newPost;
  }

  async updatePost(postId, updateData) {
    const data = await readCommunityMutation(apiFetch(`/api/community/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    }));
    return this.upsertCachedPost(data.post);
  }

  async deletePost(postId) {
    await readCommunityMutation(apiFetch(`/api/community/posts/${postId}`, {
      method: 'DELETE'
    }));
    return true;
  }

  toggleUpvote(postId, userId = 'current-user') {
    return this.votePost(postId, userId, 'up');
  }

  async addAnswer(postId, answerData) {
    const content = typeof answerData === 'string' ? answerData : answerData?.content;
    if (!content || !content.trim()) throw new Error('Nội dung không được để trống');

    const payload = await readCommunityMutation(apiFetch(`/api/community/posts/${postId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: content.trim(),
        image: typeof answerData === 'object' ? answerData.image || null : null,
        altText: typeof answerData === 'object' ? answerData.altText || null : null
      })
    }));
    const post = this.upsertCachedPost(payload.post);
    return {
      answer: payload.answer,
      post,
      isFirstAnswer: Boolean(payload.answer?.isFirstSolver)
    };
  }

  async editAnswer(postId, answerId, updatedContent) {
    const payload = await readCommunityMutation(apiFetch(`/api/community/posts/${postId}/answers/${answerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: updatedContent })
    }));
    return { answer: payload.answer, post: this.upsertCachedPost(payload.post) };
  }

  async deleteAnswer(postId, answerId) {
    const payload = await readCommunityMutation(apiFetch(`/api/community/posts/${postId}/answers/${answerId}`, {
      method: 'DELETE'
    }));
    return { post: this.upsertCachedPost(payload.post) };
  }

  async voteAnswer(postId, answerId, userId = 'guest', voteType = 'up') {
    void userId;
    const payload = await readCommunityMutation(apiFetch(
      `/api/community/posts/${postId}/answers/${answerId}/vote`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      }
    ));
    if (payload.post) this.upsertCachedPost(payload.post);
    return payload;
  }

  toggleUpvoteAnswer(postId, answerId, userId = 'guest') {
    return this.voteAnswer(postId, answerId, userId, 'up');
  }

  toggleDownvoteAnswer(postId, answerId, userId = 'guest') {
    return this.voteAnswer(postId, answerId, userId, 'down');
  }

  async acceptAnswer(postId, answerId, isInstructor = false) {
    void isInstructor;
    const payload = await readCommunityMutation(apiFetch(
      `/api/community/posts/${postId}/answers/${answerId}/accept`,
      { method: 'POST' }
    ));
    const post = this.upsertCachedPost(payload.post);
    const answer = (post.answers || []).find((item) => item.id === answerId);
    return {
      post,
      isAccepted: Boolean(answer?.isAccepted),
      answerAuthorId: answer?.author?.id || null
    };
  }

  toggleAcceptAnswer(postId, answerId, isInstructor = false) {
    return this.acceptAnswer(postId, answerId, isInstructor);
  }

  async addCommentToAnswer(postId, answerId, commentData) {
    const data = await readCommunityMutation(apiFetch(
      `/api/community/posts/${postId}/answers/${answerId}/comments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentData.content, parentId: commentData.parentId || null })
      }
    ));
    if (data.post) this.upsertCachedPost(data.post);
    return { comment: data.comment, post: data.post ? normalizePost(data.post) : undefined };
  }

  async setCommentHeart(postId, answerId, commentId, liked, accountId) {
    const data = await readCommunityMutation(apiFetch(`/api/community/posts/${encodeURIComponent(postId)}/answers/${encodeURIComponent(answerId)}/comments/${encodeURIComponent(commentId)}/like`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ liked, accountId })
    }));
    return data.comment;
  }

  async editComment(postId, answerId, commentId, updatedContent) {
    const data = await readCommunityMutation(apiFetch(
      `/api/community/posts/${postId}/answers/${answerId}/comments/${commentId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedContent })
      }
    ));
    if (data.post) this.upsertCachedPost(data.post);
    return { comment: data.comment, post: data.post ? normalizePost(data.post) : undefined };
  }

  async deleteComment(postId, answerId, commentId) {
    const data = await readCommunityMutation(apiFetch(
      `/api/community/posts/${postId}/answers/${answerId}/comments/${commentId}`,
      { method: 'DELETE' }
    ));
    if (data.post) this.upsertCachedPost(data.post);
    return true;
  }

  async fetchCommunityStats() {
    const data = await readCommunityQuery(() => apiFetch('/api/community/stats'));
    return data.stats;
  }

  async fetchTags({ search = '', page = 1 } = {}) {
    return readCommunityQuery(() => apiFetch(`/api/community/tags?${new URLSearchParams({ search, page, limit: 48 })}`));
  }

  async votePost(postId, userId = 'guest', voteType = 'up') {
    void userId;
    const payload = await readCommunityMutation(apiFetch(`/api/community/posts/${postId}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voteType })
    }));
    if (payload.post) this.upsertCachedPost(payload.post);
    return payload;
  }

  toggleUpvotePost(postId, userId = 'guest') {
    return this.votePost(postId, userId, 'up');
  }

  toggleDownvotePost(postId, userId = 'guest') {
    return this.votePost(postId, userId, 'down');
  }

  async fetchLeaderboard() {
    const data = await readCommunityQuery(() => apiFetch('/api/community/leaderboard'));
    return data.leaderboard || [];
  }

  async fetchUserProfile(userId) {
    const data = await readCommunityQuery(() => apiFetch(`/api/community/users/${encodeURIComponent(userId)}`));
    return {
      profile: data.profile,
      posts: (data.posts || []).map(normalizePost)
    };
  }

  async fetchSavedPostIds() {
    const data = await readCommunityQuery(() => apiFetch('/api/community/saved'));
    return Array.isArray(data.savedPostIds) ? data.savedPostIds : [];
  }

  async toggleSavePost(postId) {
    const data = await readCommunityMutation(apiFetch(`/api/community/posts/${postId}/save`, {
      method: 'POST'
    }));
    const nextSaved = Array.isArray(data.savedPostIds) ? data.savedPostIds : [];
    return { savedPostIds: nextSaved, isSaved: Boolean(data.isSaved) };
  }

  getVisitedPostIds() {
    try {
      const data = safeLocalStorage.getItem(VISITED_POSTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  markPostVisited(postId) {
    const visited = this.getVisitedPostIds();
    if (!visited.includes(postId)) {
      visited.push(postId);
      safeLocalStorage.setItem(VISITED_POSTS_KEY, JSON.stringify(visited));
    }
    return visited;
  }

  getHiddenPostIds() {
    try {
      const data = safeLocalStorage.getItem(HIDDEN_POSTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  hidePost(postId) {
    const hidden = this.getHiddenPostIds();
    if (!hidden.includes(postId)) {
      hidden.push(postId);
      safeLocalStorage.setItem(HIDDEN_POSTS_KEY, JSON.stringify(hidden));
    }
    return hidden;
  }

  clearHiddenPosts() {
    safeLocalStorage.removeItem(HIDDEN_POSTS_KEY);
    return [];
  }

  async reportPost(reportData) {
    return readCommunityMutation(apiFetch('/api/community/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetId: reportData.targetId,
        reason: reportData.reason,
        detail: reportData.detail || ''
      })
    }));
  }

  async reportContent(reportData) {
    return this.reportPost(reportData);
  }

}

export function formatRelativeTime(dateString) {
  if (!dateString) return 'Gần đây';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export const communityService = new CommunityService();
