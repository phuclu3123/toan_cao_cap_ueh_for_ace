import { SEED_COMMUNITY_POSTS } from '../domain/seedPosts.js';
export { SEED_COMMUNITY_POSTS } from '../domain/seedPosts.js';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import CommunityPost from '../persistence/CommunityPost.js';
import CommunityReport from '../persistence/CommunityReport.js';
import { prepareNotificationStore, recordCommentHeart } from '../../notifications/index.js';
import { findPublicAccountsByAliases, findPublicAccountByAliases } from '../../identity/index.js';
import { hasOwnerRole } from '../../identity/index.js';

// Authentic Accounts of Lữ Võ Hoàng Phúc






// Seed data based strictly on UEH curriculum documents (frontend/public/docs)


const memoryCommunityPosts = SEED_COMMUNITY_POSTS.map((post) => structuredClone(post));
const COMMUNITY_SUBJECTS = new Set([
  'all', 'algebra', 'calc1', 'calc2', 'econ_models', 'prob_stats', 'exam_prep', 'method_tips'
]);
const COMMUNITY_DIFFICULTIES = new Set(['standard', 'medium', 'hard', 'olympiad']);
const COMMUNITY_TYPES = new Set(['question', 'discussion', 'article']);
const COMMUNITY_SUBJECT_LABELS = {
  all: 'Tất cả chuyên mục',
  algebra: 'Đại số Tuyến tính & Ma trận',
  calc1: 'Vi tích phân 1 (Hàm 1 biến)',
  calc2: 'Vi tích phân 2 (Hàm nhiều biến & Tối ưu)',
  econ_models: 'Mô hình Toán Kinh tế & Leontief',
  prob_stats: 'Xác suất & Thống kê ứng dụng',
  exam_prep: 'Đề thi & Ôn luyện UEH',
  method_tips: 'Mẹo Casio & Công cụ hỗ trợ'
};
const COMMUNITY_DIFFICULTY_LABELS = {
  standard: 'Căn bản (5 - 6.5đ)',
  medium: 'Khá Giỏi (7 - 8.5đ)',
  hard: 'Nâng cao A+ (9 - 10đ)',
  olympiad: 'Thử thách Olympic UEH'
};
const MAX_COMMUNITY_IMAGE_LENGTH = 1_500_000;

const cleanText = (value, maxLength) => (
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
);

const hasUnsafeMarkup = (value) => (
  /<\s*(?:script|iframe|object|embed|style|link|meta)\b|\bon\w+\s*=|javascript\s*:/i.test(value)
);

const hasInlineDataImage = (value) => (
  /<img\b[^>]*\bsrc\s*=\s*["']?data:image\//i.test(String(value || ''))
);

const normalizeCommunityImage = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') return undefined;
  const candidate = value.trim();
  if (!candidate || candidate.length > MAX_COMMUNITY_IMAGE_LENGTH) return undefined;
  if (/^https:\/\/[^\s]+$/i.test(candidate)) return candidate;
  if (/^data:image\/(?:png|jpe?g|gif|webp);base64,[a-z0-9+/=\r\n]+$/i.test(candidate)) {
    return Buffer.byteLength(candidate.slice(candidate.indexOf(',') + 1), 'base64') <= 1024 * 1024 ? candidate : undefined;
  }
  return undefined;
};

const normalizeTags = (tags) => (
  Array.isArray(tags)
    ? [...new Set(tags.map((tag) => cleanText(tag, 40)).filter(Boolean))].slice(0, 8)
    : []
);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const positiveInteger = (value, fallback, maximum) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
};

const actorFromUser = (user) => ({
  id: user.id || user.uid || user.username,
  name: cleanText(user.name, 120) || 'Sinh viên UEH',
  email: cleanText(user.username || user.email, 254).toLowerCase(),
  cohort: cleanText(user.school, 120) || 'UEH',
  avatar: cleanText(user.avatar || user.photoURL, 2_500_000),
  points: 0,
  isAdmin: hasOwnerRole(user),
  isInstructor: Boolean(user.isInstructor)
});

const identityValues = (identity) => new Set(
  [
    identity?.id,
    identity?.uid,
    identity?.firebaseUid,
    identity?.githubId,
    identity?.username,
    identity?.email
  ]
    .map((value) => cleanText(value, 254).toLowerCase())
    .filter(Boolean)
);

const identityCandidates = (identity) => [...new Set(
  [identity?.id, identity?.uid, identity?.firebaseUid, identity?.githubId, identity?.username, identity?.email]
    .flatMap((value) => {
      const cleaned = cleanText(value, 254);
      return cleaned ? [cleaned, cleaned.toLowerCase()] : [];
    })
)];

const matchesIdentity = (value, identitySet) => (
  identitySet.has(cleanText(value, 254).toLowerCase())
);

const degradedReadOnlyEnabled = () => (
  process.env.NODE_ENV !== 'production'
  && process.env.ALLOW_COMMUNITY_MEMORY_WRITES === 'true'
);

const publicAuthor = (author) => ({
  id: cleanText(author?.id || author?.uid, 254),
  name: cleanText(author?.name, 120) || 'Sinh viên UEH',
  cohort: cleanText(author?.cohort, 160) || 'UEH',
  avatar: cleanText(author?.avatar, 2_500_000),
  points: Math.max(0, Number(author?.points) || 0),
  isAdmin: Boolean(author?.isAdmin),
  isInstructor: Boolean(author?.isInstructor)
});

const editorialAuthor = { id: '', name: 'UEH TCC', cohort: '', avatar: '', points: 0, isAdmin: false, isInstructor: false };

const votedByViewer = (values, viewer) => {
  const viewerIds = identityValues(viewer);
  if (viewerIds.size === 0) return false;
  return (values || []).some((value) => viewerIds.has(cleanText(value, 254).toLowerCase()));
};

const publicComment = (comment, viewer) => ({
  id: comment?.id,
  content: comment?.content || '',
  parentId: comment?.parentId || null,
  likesCount: new Set(comment?.likedBy || []).size,
  isLiked: votedByViewer(comment?.likedBy, viewer),
  canManage: canManage(viewer, comment?.author),
  author: publicAuthor(comment?.author),
  createdAt: comment?.createdAt,
  updatedAt: comment?.updatedAt
});

const publicAnswer = (answer, viewer) => {
  const hasUpvoted = votedByViewer(answer?.upvotedBy, viewer);
  const hasDownvoted = votedByViewer(answer?.downvotedBy, viewer);
  return {
    id: answer?.id,
    origin: answer?.origin || 'community',
    canManage: canManage(viewer, answer?.author),
    content: answer?.content || '',
    image: answer?.image || null,
    altText: answer?.altText || null,
    author: answer?.origin === 'curated' ? editorialAuthor : publicAuthor(answer?.author),
    upvotes: Number(answer?.upvotes) || 0,
    upvotedBy: hasUpvoted ? [actorFromUser(viewer).id] : [],
    downvotedBy: hasDownvoted ? [actorFromUser(viewer).id] : [],
    userVote: hasUpvoted ? 1 : (hasDownvoted ? -1 : 0),
    isAccepted: Boolean(answer?.isAccepted),
    instructorVerified: Boolean(answer?.instructorVerified),
    isFirstSolver: Boolean(answer?.isFirstSolver),
    comments: (answer?.comments || []).map(comment => publicComment(comment, viewer)),
    createdAt: answer?.createdAt,
    updatedAt: answer?.updatedAt
  };
};

const contentExcerpt = (content) => String(content || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, 900);

const publicPost = (value, { summary = false, viewer = null } = {}) => {
  const post = value?.toObject ? value.toObject() : value;
  const hasUpvoted = votedByViewer(post?.upvotedBy, viewer);
  const hasDownvoted = votedByViewer(post?.downvotedBy, viewer);
  const response = {
    id: post?.id,
    origin: post?.origin || 'community',
    canManage: canManage(viewer, post?.author),
    type: post?.type || 'question',
    title: post?.title || '',
    content: summary ? contentExcerpt(post?.content) : (post?.content || ''),
    subject: post?.subject || 'all',
    subjectLabel: post?.subjectLabel || COMMUNITY_SUBJECT_LABELS[post?.subject] || '',
    difficulty: post?.difficulty || 'standard',
    difficultyLabel: post?.difficultyLabel || COMMUNITY_DIFFICULTY_LABELS[post?.difficulty] || '',
    tags: Array.isArray(post?.tags) ? post.tags : [],
    author: post?.origin === 'curated' ? editorialAuthor : publicAuthor(post?.author),
    views: Math.max(0, Number(post?.views) || 0),
    upvotes: Number(post?.upvotes) || 0,
    upvotedBy: hasUpvoted && viewer ? [actorFromUser(viewer).id] : [],
    downvotedBy: hasDownvoted && viewer ? [actorFromUser(viewer).id] : [],
    userVote: hasUpvoted ? 1 : (hasDownvoted ? -1 : 0),
    isSaved: viewer ? votedByViewer(post?.savedBy, viewer) : false,
    status: post?.status || 'unanswered',
    isAccepted: Boolean(post?.isAccepted),
    acceptedAnswerId: post?.acceptedAnswerId || null,
    instructorVerified: Boolean(post?.instructorVerified),
    answersCount: Number.isFinite(Number(post?.answersCount))
      ? Math.max(0, Number(post.answersCount))
      : (Array.isArray(post?.answers) ? post.answers.length : 0),
    createdAt: post?.createdAt,
    updatedAt: post?.updatedAt
  };

  if (!summary) {
    response.image = post?.image || null;
    response.altText = post?.altText || null;
    response.answers = (post?.answers || []).map((answer) => publicAnswer(answer, viewer));
  }
  return response;
};

const buildLeaderboard = (posts) => {
  const contributors = new Map();
  const ensureContributor = (author) => {
    const sanitized = publicAuthor(author);
    if (!sanitized.id) return null;
    if (!contributors.has(sanitized.id)) {
      contributors.set(sanitized.id, {
        ...sanitized,
        points: 0,
        postsCount: 0,
        answersCount: 0,
        firstSolverCount: 0,
        solvedCount: 0,
        upvotesReceived: 0
      });
    }
    return contributors.get(sanitized.id);
  };

  for (const post of posts || []) {
    const postAuthor = post.origin === 'curated' ? null : ensureContributor(post?.author);
    if (postAuthor) {
      const upvotes = Math.max(0, Number(post?.upvotes) || 0);
      postAuthor.postsCount += 1;
      postAuthor.upvotesReceived += upvotes;
      postAuthor.points += 5 + upvotes * 5;
    }
    for (const answer of post?.answers || []) {
      if (answer.origin === 'curated') continue;
      const answerAuthor = ensureContributor(answer?.author);
      if (!answerAuthor) continue;
      const upvotes = Math.max(0, Number(answer?.upvotes) || 0);
      answerAuthor.answersCount += 1;
      answerAuthor.upvotesReceived += upvotes;
      answerAuthor.points += 10 + upvotes * 5;
      if (answer?.isFirstSolver && answer?.isAccepted) {
        answerAuthor.points += 15;
        answerAuthor.firstSolverCount += 1;
      }
      if (answer?.isAccepted) {
        answerAuthor.solvedCount += 1;
        answerAuthor.points += 25;
      }
    }
  }

  return [...contributors.values()].map(contributor => ({ ...contributor, earnedBadges: [
    ...(contributor.postsCount >= 2 ? ['community-problem-setter'] : []),
    ...(contributor.answersCount >= 5 ? ['community-enthusiast'] : []),
    ...(contributor.firstSolverCount >= 1 ? ['community-first-solver'] : [])
  ] }))
    .sort((left, right) => right.points - left.points || left.name.localeCompare(right.name, 'vi'));
};

const canonicalizeContributorPosts = (posts, accounts = []) => {
  const accountByAlias = new Map();
  for (const account of accounts) {
    const canonicalId = account?.id
      || account?.uid
      || account?.firebaseUid
      || account?.githubId;
    if (!canonicalId) continue;
    const canonicalAuthor = {
      id: canonicalId,
      name: account.name,
      cohort: account.school,
      avatar: account.avatar,
      isAdmin: account.role === 'Admin',
      isInstructor: Boolean(account.isInstructor)
    };
    for (const alias of identityValues({ ...account, email: account.username })) {
      accountByAlias.set(alias, canonicalAuthor);
    }
  }

  const normalizeAuthor = (author) => {
    const accountAuthor = [...identityValues(author)].map(alias => accountByAlias.get(alias)).find(Boolean);
    return accountAuthor ? { ...author, ...accountAuthor } : { ...author, avatar: '', points: 0, isAdmin: false, isInstructor: false };
  };

  return (posts || []).map((post) => ({
    ...post,
    author: normalizeAuthor(post?.author),
    answers: (post?.answers || []).map((answer) => ({
      ...answer,
      author: normalizeAuthor(answer?.author),
      comments: (answer?.comments || []).map(comment => ({ ...comment, author: normalizeAuthor(comment.author) }))
    }))
  }));
};

// Batch resolve current profiles; article snapshots are not profile authority.
const hydrateCommunityAuthors = async (posts) => {
  if (mongoose.connection.readyState !== 1) return posts;
  const aliases = [...new Set(posts.flatMap(post => [post.author,
    ...(post.answers || []).flatMap(answer => [answer.author, ...(answer.comments || []).map(comment => comment.author)])
  ]).flatMap(author => [...identityValues(author)]))];
  const accounts = aliases.length ? await findPublicAccountsByAliases(aliases) : [];
  return canonicalizeContributorPosts(posts, accounts);
};

const isOwnerOf = (user, author) => {
  if (!user || !author) return false;
  const userValues = identityValues(user);
  return [...identityValues(author)].some((value) => userValues.has(value));
};

const canManage = (user, author) => hasOwnerRole(user) || isOwnerOf(user, author);
const findMemoryPost = (id) => memoryCommunityPosts.find((post) => post.id === id);
const findAnswer = (post, answerId) => (post?.answers || []).find((answer) => answer.id === answerId);
const findComment = (answer, commentId) => (
  (answer?.comments || []).find(
    (comment) => comment.id === commentId || comment._id?.toString() === commentId
  )
);

const cloneForResponse = (value) => (
  value?.toObject ? value.toObject() : structuredClone(value)
);

const cloneForMemory = (value) => JSON.parse(JSON.stringify(
  value?.toObject ? value.toObject() : value
));

const communityStoreError = (cause) => {
  const error = new Error('Community data store is unavailable', { cause });
  error.statusCode = 503;
  error.code = 'COMMUNITY_STORE_UNAVAILABLE';
  return error;
};

const loadPostForMutation = async (id) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const databasePost = await CommunityPost.findOne({ id });
      if (databasePost) return { post: databasePost, persistent: true };
      if (!degradedReadOnlyEnabled()) return null;
      const memoryPost = findMemoryPost(id);
      if (memoryPost) {
        try {
          const createdPost = await CommunityPost.create(cloneForMemory(memoryPost));
          return { post: createdPost, persistent: true };
        } catch (error) {
          if (error?.code === 11000) {
            const concurrentlyCreatedPost = await CommunityPost.findOne({ id });
            if (concurrentlyCreatedPost) return { post: concurrentlyCreatedPost, persistent: true };
          }
          throw error;
        }
      }
      return null;
    } catch (error) {
      throw communityStoreError(error);
    }
  }
  if (!degradedReadOnlyEnabled()) {
    throw communityStoreError();
  }
  const memoryPost = findMemoryPost(id);
  return memoryPost ? { post: memoryPost, persistent: false } : null;
};

const saveLoadedPost = async ({ post, persistent }) => {
  if (persistent) await post.save();
  const snapshot = cloneForMemory(post);
  const memoryIndex = memoryCommunityPosts.findIndex((item) => item.id === snapshot.id);
  if (memoryIndex >= 0) memoryCommunityPosts[memoryIndex] = snapshot;
  else memoryCommunityPosts.unshift(snapshot);
  return post;
};

const requireControllerUser = (req, res) => {
  if (req.authUser) {
    if (mongoose.connection.readyState !== 1 && !(process.env.NODE_ENV !== 'production' && process.env.ALLOW_COMMUNITY_MEMORY_WRITES === 'true')) {
      res.status(503).json({ success: false, code: 'COMMUNITY_STORE_UNAVAILABLE', message: 'Chưa kết nối được dữ liệu hỏi đáp. Nội dung chưa được lưu, vui lòng thử lại.' });
      return null;
    }
    return req.authUser;
  }
  res.status(401).json({
    success: false,
    code: 'AUTH_REQUIRED',
    message: 'Vui lòng đăng nhập để tiếp tục.'
  });
  return null;
};

const forbidden = (res) => res.status(403).json({
  success: false,
  message: 'Bạn không có quyền thay đổi nội dung này.'
});

const sendCommunityError = (res, error) => {
  if (error?.name === 'VersionError') {
    return res.status(409).json({
      success: false,
      code: 'CONTENT_CONFLICT',
      message: 'Nội dung vừa được người khác cập nhật. Vui lòng tải lại và thử lại.'
    });
  }
  console.error('[Community] Request failed:', error);
  const statusCode = error?.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    code: error?.code || 'COMMUNITY_OPERATION_FAILED',
    message: statusCode >= 500 ? 'Không thể hoàn tất yêu cầu lúc này.' : error.message
  });
};

// Seed storage to MongoDB if collection is empty (only when connected)
export const seedDatabaseIfEmpty = async () => {
  if (process.env.NODE_ENV === 'production' || process.env.ALLOW_COMMUNITY_SEEDING !== 'true') return;
  if (mongoose.connection.readyState !== 1) return;
  try {
    const count = await CommunityPost.countDocuments();
    if (count === 0) {
      console.log(`Seeding ${SEED_COMMUNITY_POSTS.length} official UEH curriculum questions into MongoDB...`);
      await CommunityPost.insertMany(SEED_COMMUNITY_POSTS);
    }
  } catch (err) {
    console.warn('MongoDB seed warning:', err.message);
  }
};

/**
 * GET /api/community/posts - Get questions with filters, search, pagination
 */
export const getPosts = async (req, res) => {
  try {
    const {
      subject = 'all',
      difficulty = 'all',
      status = 'all',
      sort = 'newest',
      tag = '',
      search = '',
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (subject && subject !== 'all') {
      query.subject = subject;
    }
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    if (status === 'solved') {
      query.isAccepted = true;
    } else if (status === 'unsolved') {
      query.isAccepted = false;
    } else if (status === 'saved') {
      const user = requireControllerUser(req, res);
      if (!user) return;
      query.savedBy = { $in: identityCandidates(user) };
    }
    if (sort === 'unanswered') {
      query.answers = { $size: 0 };
    }
    const normalizedTag = cleanText(tag, 80).replace(/^#/, '');
    const normalizedSearch = cleanText(search, 200);
    if (normalizedTag) {
      query.tags = { $regex: escapeRegExp(normalizedTag), $options: 'i' };
    }
    if (normalizedSearch) {
      const safeSearch = escapeRegExp(normalizedSearch);
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { content: { $regex: safeSearch, $options: 'i' } },
        { tags: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { upvotes: -1, createdAt: -1 };
    } else if (sort === 'mostViewed') {
      sortOption = { views: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const pageNum = positiveInteger(page, 1, 1_000_000);
    const limitNum = positiveInteger(limit, 10, 50);
    const skip = (pageNum - 1) * limitNum;

    let total = 0;
    let posts = [];
    let databaseSucceeded = false;
    if (mongoose.connection.readyState === 1) {
      try {
        const viewerAliases = [...identityValues(req.authUser)];
        const viewerOnly = (fieldName) => viewerAliases.length > 0
          ? {
              $filter: {
                input: { $ifNull: [`$${fieldName}`, []] },
                as: 'identity',
                cond: { $in: [{ $toLower: '$$identity' }, viewerAliases] }
              }
            }
          : { $literal: [] };
        total = await CommunityPost.countDocuments(query);
        posts = await CommunityPost.aggregate([
          { $match: query },
          { $sort: sortOption },
          { $skip: skip },
          { $limit: limitNum },
          {
            $project: {
              _id: 0,
              id: 1,
              origin: 1,
              type: 1,
              title: 1,
              content: 1,
              subject: 1,
              subjectLabel: 1,
              difficulty: 1,
              difficultyLabel: 1,
              tags: 1,
              author: {
                id: '$author.id',
                email: '$author.email',
                name: '$author.name',
                cohort: '$author.cohort',
                avatar: '$author.avatar',
                points: '$author.points',
                isAdmin: '$author.isAdmin',
                isInstructor: '$author.isInstructor'
              },
              views: 1,
              upvotes: 1,
              upvotedBy: viewerOnly('upvotedBy'),
              downvotedBy: viewerOnly('downvotedBy'),
              savedBy: viewerOnly('savedBy'),
              status: 1,
              isAccepted: 1,
              acceptedAnswerId: 1,
              instructorVerified: 1,
              answersCount: { $size: { $ifNull: ['$answers', []] } },
              createdAt: 1,
              updatedAt: 1
            }
          }
        ]);
        databaseSucceeded = true;
      } catch (error) {
        console.warn('[Community] Post query failed, using memory fallback:', error.message);
      }
    }

    if (!databaseSucceeded && !degradedReadOnlyEnabled()) {
      throw communityStoreError();
    }

    if (!databaseSucceeded) {
      let filtered = [...memoryCommunityPosts];
      if (subject && subject !== 'all') filtered = filtered.filter(p => p.subject === subject);
      if (difficulty && difficulty !== 'all') filtered = filtered.filter(p => p.difficulty === difficulty);
      if (status === 'solved') filtered = filtered.filter(p => p.isAccepted || p.status === 'solved');
      if (status === 'unsolved') filtered = filtered.filter(p => !p.isAccepted && p.status !== 'solved');
      if (status === 'saved') {
        const savedAliases = identityValues(req.authUser);
        filtered = filtered.filter((post) => (
          (post.savedBy || []).some((savedId) => matchesIdentity(savedId, savedAliases))
        ));
      }
      if (normalizedTag) {
        const tagQuery = normalizedTag.toLowerCase();
        filtered = filtered.filter((post) => (
          (post.tags || []).some((postTag) => postTag.replace(/^#/, '').toLowerCase().includes(tagQuery))
        ));
      }
      if (normalizedSearch) {
        const q = normalizedSearch.toLowerCase();
        filtered = filtered.filter((post) => (
          post.title.toLowerCase().includes(q)
          || post.content.toLowerCase().includes(q)
          || (post.tags || []).some((postTag) => postTag.toLowerCase().includes(q))
        ));
      }
      if (sort === 'popular') {
        filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0) || new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sort === 'mostViewed') {
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0) || new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sort === 'oldest') {
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if (sort === 'unanswered') {
        filtered = filtered.filter((post) => (post.answers || []).length === 0);
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      total = filtered.length;
      posts = filtered.slice(skip, skip + limitNum);
    }

    if (databaseSucceeded) posts = await hydrateCommunityAuthors(posts);
    const totalPages = Math.ceil(total / limitNum) || 1;

    res.json({
      success: true,
      degraded: !databaseSucceeded,
      posts: posts.map((post) => publicPost(post, { summary: true, viewer: req.authUser })),
      total,
      totalPages,
      currentPage: pageNum
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * GET /api/community/posts/:id - Get question detail & auto increment views
 */
export const getPostById = async (req, res) => {
  try {
    const id = cleanText(req.params?.id, 160);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Thiếu mã bài toán.' });
    }
    let post = null;
    if (mongoose.connection.readyState === 1) {
      try {
        post = req.query?.recordView === 'false'
          ? await CommunityPost.findOne({ id }).lean()
          : await CommunityPost.findOneAndUpdate({ id }, { $inc: { views: 1 } }, { returnDocument: 'after', timestamps: false }).lean();
      } catch (error) {
        if (!degradedReadOnlyEnabled()) throw communityStoreError(error);
        console.warn('[Community] Failed to increment database view, using development fallback:', error.message);
      }
    } else if (!degradedReadOnlyEnabled()) {
      throw communityStoreError();
    }

    if (!post && degradedReadOnlyEnabled()) {
      const memoryPost = findMemoryPost(id);
      if (memoryPost) {
        if (req.query?.recordView !== 'false') memoryPost.views = Math.max(0, Number(memoryPost.views) || 0) + 1;
        post = cloneForResponse(memoryPost);
      }
    }

    if (!post) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài toán.' });
    }

    res.json({
      success: true,
      degraded: mongoose.connection.readyState !== 1,
      post: publicPost((await hydrateCommunityAuthors([post]))[0], { viewer: req.authUser })
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * POST /api/community/posts - Create new question
 */
export const createPost = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;

    const title = cleanText(req.body?.title, 220);
    const content = cleanText(req.body?.content, 20_000);
    const type = cleanText(req.body?.type, 40) || 'question';
    const subject = cleanText(req.body?.subject, 40) || 'all';
    const difficulty = cleanText(req.body?.difficulty, 40) || 'standard';
    const image = normalizeCommunityImage(req.body?.image);
    const altText = cleanText(req.body?.altText, 300);

    if (title.length < 8 || content.length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề phải có ít nhất 8 ký tự và nội dung ít nhất 20 ký tự.'
      });
    }
    if (hasUnsafeMarkup(title) || hasUnsafeMarkup(content) || hasInlineDataImage(content)) {
      return res.status(400).json({ success: false, message: 'Nội dung chứa mã nhúng không an toàn.' });
    }
    if (image === undefined) {
      return res.status(400).json({ success: false, message: 'Ảnh phải là HTTPS hoặc ảnh PNG/JPEG/GIF/WEBP không quá 1MB.' });
    }
    if (!COMMUNITY_TYPES.has(type) || !COMMUNITY_SUBJECTS.has(subject) || !COMMUNITY_DIFFICULTIES.has(difficulty)) {
      return res.status(400).json({ success: false, message: 'Chuyên mục hoặc độ khó không hợp lệ.' });
    }

    const newPost = {
      id: `post-${randomUUID()}`,
      type,
      title,
      content,
      subject,
      subjectLabel: COMMUNITY_SUBJECT_LABELS[subject],
      difficulty,
      difficultyLabel: COMMUNITY_DIFFICULTY_LABELS[difficulty],
      tags: normalizeTags(req.body?.tags),
      image: image || null,
      altText: altText || null,
      author: actorFromUser(user),
      views: 0,
      upvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
      savedBy: [],
      status: 'unanswered',
      isAccepted: false,
      answers: [],
      createdAt: new Date().toISOString()
    };

    let persisted = false;
    if (mongoose.connection.readyState === 1) {
      try {
        await CommunityPost.create(newPost);
        persisted = true;
      } catch (error) {
        if (error?.name === 'ValidationError') {
          return res.status(400).json({ success: false, message: 'Dữ liệu bài toán không hợp lệ.' });
        }
        throw communityStoreError(error);
      }
    } else if (process.env.NODE_ENV === 'production') {
      throw communityStoreError();
    }
    memoryCommunityPosts.unshift(structuredClone(newPost));

    res.status(201).json({
      success: true,
      persisted,
      post: publicPost(newPost, { viewer: user })
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * PUT /api/community/posts/:id - Update question
 */
export const updatePost = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;
    const id = cleanText(req.params?.id, 160);
    const loaded = await loadPostForMutation(id);
    if (!loaded) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài toán.' });
    }
    if (!canManage(user, loaded.post.author)) return forbidden(res);

    const updates = {};
    if (Object.hasOwn(req.body || {}, 'type')) {
      updates.type = cleanText(req.body.type, 40);
      if (!COMMUNITY_TYPES.has(updates.type)) {
        return res.status(400).json({ success: false, message: 'Loại bài viết không hợp lệ.' });
      }
    }
    if (Object.hasOwn(req.body || {}, 'title')) {
      updates.title = cleanText(req.body.title, 220);
      if (updates.title.length < 8 || hasUnsafeMarkup(updates.title)) {
        return res.status(400).json({ success: false, message: 'Tiêu đề không hợp lệ.' });
      }
    }
    if (Object.hasOwn(req.body || {}, 'content')) {
      updates.content = cleanText(req.body.content, 20_000);
      if (updates.content.length < 20 || hasUnsafeMarkup(updates.content) || hasInlineDataImage(updates.content)) {
        return res.status(400).json({ success: false, message: 'Nội dung không hợp lệ.' });
      }
    }
    if (Object.hasOwn(req.body || {}, 'subject')) {
      updates.subject = cleanText(req.body.subject, 40);
      if (!COMMUNITY_SUBJECTS.has(updates.subject)) {
        return res.status(400).json({ success: false, message: 'Chuyên mục không hợp lệ.' });
      }
      updates.subjectLabel = COMMUNITY_SUBJECT_LABELS[updates.subject];
    }
    if (Object.hasOwn(req.body || {}, 'difficulty')) {
      updates.difficulty = cleanText(req.body.difficulty, 40);
      if (!COMMUNITY_DIFFICULTIES.has(updates.difficulty)) {
        return res.status(400).json({ success: false, message: 'Độ khó không hợp lệ.' });
      }
      updates.difficultyLabel = COMMUNITY_DIFFICULTY_LABELS[updates.difficulty];
    }
    if (Object.hasOwn(req.body || {}, 'tags')) updates.tags = normalizeTags(req.body.tags);
    if (Object.hasOwn(req.body || {}, 'image')) {
      const image = normalizeCommunityImage(req.body.image);
      if (image === undefined) {
        return res.status(400).json({ success: false, message: 'Ảnh phải là HTTPS hoặc ảnh PNG/JPEG/GIF/WEBP không quá 1MB.' });
      }
      updates.image = image;
    }
    if (Object.hasOwn(req.body || {}, 'altText')) updates.altText = cleanText(req.body.altText, 300) || null;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'Không có thay đổi hợp lệ.' });
    }

    Object.assign(loaded.post, updates);
    loaded.post.updatedAt = new Date();
    await saveLoadedPost(loaded);
    return res.json({
      success: true,
      persisted: loaded.persistent,
      post: publicPost(loaded.post, { viewer: user })
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * DELETE /api/community/posts/:id - Delete question
 */
export const deletePost = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;
    const id = cleanText(req.params?.id, 160);
    const loaded = await loadPostForMutation(id);
    if (!loaded) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài toán.' });
    }
    if (!canManage(user, loaded.post.author)) return forbidden(res);

    if (loaded.persistent) await CommunityPost.deleteOne({ id });
    const index = memoryCommunityPosts.findIndex((post) => post.id === id);
    if (index >= 0) memoryCommunityPosts.splice(index, 1);

    return res.json({ success: true, persisted: loaded.persistent, message: 'Đã xóa bài toán thành công.' });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * POST /api/community/posts/:id/upvote - Upvote/un-upvote question
 */
export const toggleUpvotePost = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;
    const id = cleanText(req.params?.id, 160);
    const userId = actorFromUser(user).id;
    const userAliases = identityValues(user);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Tài khoản chưa có mã định danh.' });
    }

    const loaded = await loadPostForMutation(id);
    if (!loaded) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài toán.' });
    }
    const post = loaded.post;
    post.upvotedBy ||= [];
    post.downvotedBy ||= [];
    const voteType = req.body?.voteType === 'down' ? 'down' : 'up';
    const previousUpvotes = post.upvotedBy.filter((value) => matchesIdentity(value, userAliases)).length;
    const previousDownvotes = post.downvotedBy.filter((value) => matchesIdentity(value, userAliases)).length;
    const hadUpvoted = previousUpvotes > 0;
    const hadDownvoted = previousDownvotes > 0;

    post.upvotedBy = post.upvotedBy.filter((value) => !matchesIdentity(value, userAliases));
    post.downvotedBy = post.downvotedBy.filter((value) => !matchesIdentity(value, userAliases));

    let userVote = 0;
    if (voteType === 'up' && !hadUpvoted) {
      post.upvotedBy.push(userId);
      userVote = 1;
    } else if (voteType === 'down' && !hadDownvoted) {
      post.downvotedBy.push(userId);
      userVote = -1;
    }
    post.upvotes = new Set(post.upvotedBy).size - new Set(post.downvotedBy).size;

    await saveLoadedPost(loaded);
    return res.json({
      success: true,
      persisted: loaded.persistent,
      upvotes: post.upvotes,
      upvotedBy: userVote === 1 ? [userId] : [],
      downvotedBy: userVote === -1 ? [userId] : [],
      userVote,
      hasUpvoted: userVote === 1,
      hasDownvoted: userVote === -1,
      post: publicPost(post, { viewer: user })
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * POST /api/community/posts/:id/save - Save or remove a post for the signed-in account
 */
export const toggleSavePost = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;
    const id = cleanText(req.params?.id, 160);
    const userId = actorFromUser(user).id;
    const userAliases = identityValues(user);
    const loaded = await loadPostForMutation(id);
    if (!loaded) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài toán.' });
    }

    loaded.post.savedBy ||= [];
    const wasSaved = loaded.post.savedBy.some((savedId) => matchesIdentity(savedId, userAliases));
    loaded.post.savedBy = wasSaved
      ? loaded.post.savedBy.filter((savedId) => !matchesIdentity(savedId, userAliases))
      : [
          ...loaded.post.savedBy.filter((savedId) => !matchesIdentity(savedId, userAliases)),
          userId
        ];
    await saveLoadedPost(loaded);

    let savedPostIds;
    if (loaded.persistent) {
      const savedRows = await CommunityPost.find({ savedBy: { $in: identityCandidates(user) } }).select('id -_id').lean();
      savedPostIds = savedRows.map((row) => row.id);
    } else {
      savedPostIds = memoryCommunityPosts
        .filter((post) => (post.savedBy || []).some((savedId) => matchesIdentity(savedId, userAliases)))
        .map((post) => post.id);
    }

    return res.json({
      success: true,
      persisted: loaded.persistent,
      isSaved: !wasSaved,
      postId: id,
      savedPostIds
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * GET /api/community/saved - Return only the current account's bookmark ids
 */
export const getSavedPostIds = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;
    const userAliases = identityValues(user);

    if (mongoose.connection.readyState === 1) {
      try {
        const rows = await CommunityPost.find({ savedBy: { $in: identityCandidates(user) } }).select('id -_id').lean();
        return res.json({ success: true, savedPostIds: rows.map((row) => row.id) });
      } catch (error) {
        throw communityStoreError(error);
      }
    }
    if (process.env.NODE_ENV === 'production') throw communityStoreError();

    return res.json({
      success: true,
      savedPostIds: memoryCommunityPosts
        .filter((post) => (post.savedBy || []).some((savedId) => matchesIdentity(savedId, userAliases)))
        .map((post) => post.id)
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * POST /api/community/reports - Persist a moderation report
 */
export const reportCommunityContent = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;
    const targetId = cleanText(req.body?.targetId, 160);
    const reason = cleanText(req.body?.reason, 40);
    const detail = cleanText(req.body?.detail, 500);
    const allowedReasons = new Set(['math_error', 'spam', 'inappropriate', 'wrong_category', 'other']);
    if (!targetId || !allowedReasons.has(reason) || hasUnsafeMarkup(detail)) {
      return res.status(400).json({ success: false, message: 'Báo cáo không hợp lệ.' });
    }
    if (mongoose.connection.readyState !== 1) throw communityStoreError();

    const targetExists = await CommunityPost.exists({
      $or: [
        { id: targetId },
        { 'answers.id': targetId },
        { 'answers.comments.id': targetId }
      ]
    });
    if (!targetExists) {
      return res.status(404).json({ success: false, message: 'Nội dung cần báo cáo không còn tồn tại.' });
    }

    const reporter = actorFromUser(user);
    const recentDuplicate = await CommunityReport.exists({
      targetId,
      'reporter.id': reporter.id,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    if (recentDuplicate) {
      return res.status(409).json({
        success: false,
        code: 'REPORT_ALREADY_SUBMITTED',
        message: 'Bạn đã báo cáo nội dung này trong 24 giờ qua.'
      });
    }

    const report = await CommunityReport.create({
      id: `report-${randomUUID()}`,
      targetId,
      reason,
      detail,
      reporter: { id: reporter.id, name: reporter.name }
    });
    return res.status(201).json({
      success: true,
      report: { id: report.id, status: report.status, createdAt: report.createdAt }
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * POST /api/community/posts/:id/answers - Submit an answer
 */
export const addAnswer = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;
    const id = cleanText(req.params?.id, 160);
    const image = normalizeCommunityImage(req.body?.image);
    if (image === undefined) return res.status(400).json({ success: false, message: 'Ảnh lời giải không hợp lệ hoặc quá lớn (tối đa 1MB).' });
    const content = cleanText(req.body?.content, 20_000) || (image ? 'Lời giải đính kèm.' : '');
    if (String(req.body?.content || '').length > 20_000) return res.status(400).json({ success: false, message: 'Lời giải tối đa 20.000 ký tự.' });
    if (content.length < 3 || hasUnsafeMarkup(content) || hasInlineDataImage(content)) {
      return res.status(400).json({ success: false, message: 'Nội dung câu trả lời không hợp lệ.' });
    }

    const newAnswer = {
      id: `ans-${randomUUID()}`,
      content,
      image,
      altText: cleanText(req.body?.altText, 300),
      author: actorFromUser(user),
      upvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
      isAccepted: false,
      instructorVerified: false,
      isFirstSolver: false,
      comments: [],
      createdAt: new Date()
    };

    const loaded = await loadPostForMutation(id);
    if (!loaded) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài toán.' });
    }
    const post = loaded.post;
    post.answers ||= [];
    if (post.answers.length === 0) newAnswer.isFirstSolver = true;
    post.answers.push(newAnswer);
    if (!post.isAccepted) post.status = 'answered';
    await saveLoadedPost(loaded);

    return res.status(201).json({
      success: true,
      persisted: loaded.persistent,
      answer: publicAnswer(newAnswer, user),
      post: publicPost(post, { viewer: user })
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * POST /api/community/posts/:id/answers/:answerId/vote - Toggle one user's vote
 */
export const voteAnswer = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;
    const id = cleanText(req.params?.id, 160);
    const answerId = cleanText(req.params?.answerId, 160);
    const userId = actorFromUser(user).id;
    const userAliases = identityValues(user);
    const voteType = req.body?.voteType === 'down' ? 'down' : 'up';
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Tài khoản chưa có mã định danh.' });
    }

    const loaded = await loadPostForMutation(id);
    if (!loaded) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài toán.' });
    }
    const answer = findAnswer(loaded.post, answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu trả lời.' });
    }

    answer.upvotedBy ||= [];
    answer.downvotedBy ||= [];
    const previousUpvotes = answer.upvotedBy.filter((value) => matchesIdentity(value, userAliases)).length;
    const previousDownvotes = answer.downvotedBy.filter((value) => matchesIdentity(value, userAliases)).length;
    const hadUpvoted = previousUpvotes > 0;
    const hadDownvoted = previousDownvotes > 0;

    answer.upvotedBy = answer.upvotedBy.filter((value) => !matchesIdentity(value, userAliases));
    answer.downvotedBy = answer.downvotedBy.filter((value) => !matchesIdentity(value, userAliases));

    let userVote = 0;
    if (voteType === 'up' && !hadUpvoted) {
      answer.upvotedBy.push(userId);
      userVote = 1;
    } else if (voteType === 'down' && !hadDownvoted) {
      answer.downvotedBy.push(userId);
      userVote = -1;
    }
    answer.upvotes = new Set(answer.upvotedBy).size - new Set(answer.downvotedBy).size;

    await saveLoadedPost(loaded);
    return res.json({
      success: true,
      persisted: loaded.persistent,
      upvotes: answer.upvotes,
      upvotedBy: userVote === 1 ? [userId] : [],
      downvotedBy: userVote === -1 ? [userId] : [],
      userVote,
      hasUpvoted: userVote === 1,
      hasDownvoted: userVote === -1,
      post: publicPost(loaded.post, { viewer: user })
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * POST /api/community/posts/:id/answers/:answerId/accept - Accept answer
 */
export const acceptAnswer = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;
    const id = cleanText(req.params?.id, 160);
    const answerId = cleanText(req.params?.answerId, 160);
    const loaded = await loadPostForMutation(id);
    if (!loaded) {
      return res.status(404).json({ success: false, message: 'Bài toán không tồn tại' });
    }
    const post = loaded.post;
    if (!canManage(user, post.author)) return forbidden(res);

    const selectedAnswer = findAnswer(post, answerId);
    if (!selectedAnswer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu trả lời.' });
    }
    const shouldAccept = !selectedAnswer.isAccepted;

    post.answers.forEach((answer) => {
      answer.isAccepted = shouldAccept && answer.id === answerId;
    });
    if (shouldAccept) {
      selectedAnswer.instructorVerified = hasOwnerRole(user) || selectedAnswer.instructorVerified;
    }
    post.isAccepted = shouldAccept;
    post.status = shouldAccept ? 'solved' : (post.answers.length > 0 ? 'answered' : 'unanswered');
    post.acceptedAnswerId = shouldAccept ? answerId : null;

    await saveLoadedPost(loaded);
    return res.json({
      success: true,
      persisted: loaded.persistent,
      post: publicPost(post, { viewer: user })
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * PUT /api/community/posts/:id/answers/:answerId - Update answer
 */
export const updateAnswer = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;
    const id = cleanText(req.params?.id, 160);
    const answerId = cleanText(req.params?.answerId, 160);
    const content = cleanText(req.body?.content, 20_000);
    if (content.length < 3 || hasUnsafeMarkup(content) || hasInlineDataImage(content)) {
      return res.status(400).json({ success: false, message: 'Nội dung lời giải không hợp lệ.' });
    }

    const loaded = await loadPostForMutation(id);
    if (!loaded) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài toán.' });
    }
    const answer = findAnswer(loaded.post, answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lời giải để cập nhật.' });
    }
    if (!canManage(user, answer.author)) return forbidden(res);

    answer.content = content;
    answer.updatedAt = new Date();
    await saveLoadedPost(loaded);

    return res.json({
      success: true,
      persisted: loaded.persistent,
      answer: publicAnswer(answer, user),
      post: publicPost(loaded.post, { viewer: user })
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * DELETE /api/community/posts/:id/answers/:answerId - Delete answer
 */
export const deleteAnswer = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;
    const id = cleanText(req.params?.id, 160);
    const answerId = cleanText(req.params?.answerId, 160);
    const loaded = await loadPostForMutation(id);
    if (!loaded) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài toán.' });
    }
    const answer = findAnswer(loaded.post, answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lời giải.' });
    }
    if (!canManage(user, answer.author)) return forbidden(res);

    loaded.post.answers = loaded.post.answers.filter((item) => item.id !== answerId);
    if (loaded.post.acceptedAnswerId === answerId) {
      loaded.post.acceptedAnswerId = null;
      loaded.post.isAccepted = false;
    }
    loaded.post.status = loaded.post.isAccepted
      ? 'solved'
      : (loaded.post.answers.length > 0 ? 'answered' : 'unanswered');
    await saveLoadedPost(loaded);

    return res.json({
      success: true,
      persisted: loaded.persistent,
      message: 'Đã xóa lời giải thành công.',
      post: publicPost(loaded.post, { viewer: user })
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * POST /api/community/posts/:id/answers/:answerId/comments - Add comment to answer
 */
export const addCommentToAnswer = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;
    const id = cleanText(req.params?.id, 160);
    const answerId = cleanText(req.params?.answerId, 160);
    const content = cleanText(req.body?.content, 3000);
    if (!content || hasUnsafeMarkup(content) || hasInlineDataImage(content)) {
      return res.status(400).json({ success: false, message: 'Nội dung bình luận không hợp lệ.' });
    }

    const newComment = {
      id: `cmt-${randomUUID()}`,
      content,
      author: actorFromUser(user),
      createdAt: new Date()
    };

    const loaded = await loadPostForMutation(id);
    if (!loaded) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài toán.' });
    }
    const answer = findAnswer(loaded.post, answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lời giải.' });
    }
    answer.comments ||= [];
    const parentId = req.body?.parentId;
    if (parentId != null && (typeof parentId !== 'string' || parentId.length > 160 || !answer.comments.some(comment => comment.id === parentId))) {
      return res.status(400).json({ success: false, message: 'Bình luận được trả lời không còn tồn tại trong lời giải này. Hãy tải lại trước khi gửi.' });
    }
    newComment.parentId = parentId || null;
    answer.comments.push(newComment);
    await saveLoadedPost(loaded);

    return res.status(201).json({
      success: true,
      persisted: loaded.persistent,
      comment: publicComment(newComment, user),
      post: publicPost(loaded.post, { viewer: user })
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * PUT /api/community/posts/:id/answers/:answerId/comments/:commentId - Update comment
 */
export const setCommentHeart = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;
    const actor = actorFromUser(user);
    if (req.body?.accountId !== actor.id) return res.status(409).json({ success: false, code: 'AUTH_SESSION_CHANGED', message: 'Tài khoản đã thay đổi. Vui lòng tải lại bài viết.' });
    if (typeof req.body?.liked !== 'boolean') return res.status(400).json({ success: false, message: 'Trạng thái tim không hợp lệ.' });
    if (mongoose.connection.readyState !== 1) throw communityStoreError();
    await prepareNotificationStore();
    let result;
    await mongoose.connection.transaction(async session => {
      const post = await CommunityPost.findOne({ id: cleanText(req.params?.id, 160) }).session(session);
      const answer = post && findAnswer(post, cleanText(req.params?.answerId, 160));
      const comment = answer?.comments?.find(item => item.id === req.params?.commentId);
      if (!comment) throw Object.assign(new Error('Bình luận không còn tồn tại.'), { statusCode: 404 });
      const likedBy = new Set(comment.likedBy || []);
      const wasLiked = likedBy.has(actor.id);
      if (req.body.liked) likedBy.add(actor.id); else likedBy.delete(actor.id);
      if (wasLiked !== req.body.liked) {
        comment.likedBy = [...likedBy];
        await post.save({ session, timestamps: false });
      }
      if (req.body.liked && !isOwnerOf(user, comment.author)) {
        const accounts = await findPublicAccountsByAliases(identityCandidates(comment.author));
        const recipient = accounts[0];
        if (recipient?.id) await recordCommentHeart({ recipientId: recipient.id, actor, postId: post.id, commentId: comment.id,
          excerpt: String(comment.content).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140) }, session);
      }
      result = publicComment(comment, user);
    });
    return res.json({ success: true, comment: result });
  } catch (error) { return sendCommunityError(res, error); }
};

export const updateComment = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;
    const id = cleanText(req.params?.id, 160);
    const answerId = cleanText(req.params?.answerId, 160);
    const commentId = cleanText(req.params?.commentId, 160);
    const content = cleanText(req.body?.content, 3000);
    if (!content || hasUnsafeMarkup(content) || hasInlineDataImage(content)) {
      return res.status(400).json({ success: false, message: 'Nội dung bình luận không hợp lệ.' });
    }

    const loaded = await loadPostForMutation(id);
    if (!loaded) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài toán.' });
    }
    const answer = findAnswer(loaded.post, answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lời giải.' });
    }
    const comment = findComment(answer, commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận.' });
    }
    if (!canManage(user, comment.author)) return forbidden(res);

    comment.content = content;
    comment.updatedAt = new Date();
    await saveLoadedPost(loaded);

    return res.json({
      success: true,
      persisted: loaded.persistent,
      comment: publicComment(comment, user),
      post: publicPost(loaded.post, { viewer: user })
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * DELETE /api/community/posts/:id/answers/:answerId/comments/:commentId - Delete comment
 */
export const deleteComment = async (req, res) => {
  try {
    const user = requireControllerUser(req, res);
    if (!user) return;
    const id = cleanText(req.params?.id, 160);
    const answerId = cleanText(req.params?.answerId, 160);
    const commentId = cleanText(req.params?.commentId, 160);

    const loaded = await loadPostForMutation(id);
    if (!loaded) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài toán.' });
    }
    const answer = findAnswer(loaded.post, answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lời giải.' });
    }
    const comment = findComment(answer, commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận.' });
    }
    if (!canManage(user, comment.author)) return forbidden(res);

    answer.comments = answer.comments.filter(
      (item) => item.id !== commentId && item._id?.toString() !== commentId
    );
    await saveLoadedPost(loaded);

    return res.json({
      success: true,
      persisted: loaded.persistent,
      message: 'Đã xóa bình luận thành công',
      post: publicPost(loaded.post, { viewer: user })
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * GET /api/community/leaderboard - Top contributors
 */
export const getLeaderboard = async (req, res) => {
  try {
    let posts;
    let databaseSucceeded = false;
    if (mongoose.connection.readyState === 1) {
      try {
        posts = await CommunityPost.find({})
          .select('origin author upvotes answers.origin answers.author answers.upvotes answers.isAccepted answers.isFirstSolver')
          .lean();
        const contributorIds = [...new Set(posts.flatMap((post) => [
          post?.author?.id,
          ...(post?.answers || []).map((answer) => answer?.author?.id)
        ]).map((value) => cleanText(value, 254)).filter(Boolean))];
        if (contributorIds.length > 0) {
          const lookupIds = [...new Set(contributorIds.flatMap((value) => [value, value.toLowerCase()]))];
          const accounts = await findPublicAccountsByAliases(lookupIds);
          posts = canonicalizeContributorPosts(posts, accounts);
        }
        databaseSucceeded = true;
      } catch (error) {
        if (!degradedReadOnlyEnabled()) throw communityStoreError(error);
      }
    } else if (!degradedReadOnlyEnabled()) {
      throw communityStoreError();
    }
    res.json({
      success: true,
      degraded: !databaseSucceeded,
      leaderboard: buildLeaderboard(posts || memoryCommunityPosts).slice(0, 25)
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * GET /api/community/users/:id - Public contribution profile backed by MongoDB
 */
export const getCommunityUserProfile = async (req, res) => {
  try {
    const userId = cleanText(req.params?.id, 254);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu mã thành viên.' });
    }

    let posts;
    let account = null;
    let profileIdentity = { id: userId };
    let databaseSucceeded = false;
    if (mongoose.connection.readyState === 1) {
      try {
        const lookupCandidates = identityCandidates({ id: userId });
        account = await findPublicAccountByAliases(lookupCandidates, userId);
        profileIdentity = account
          ? { ...account, email: account.username }
          : { id: userId };
        const profileAliases = identityCandidates(profileIdentity);
        posts = await CommunityPost.find({
          $or: [
            { 'author.id': { $in: profileAliases } },
            { 'answers.author.id': { $in: profileAliases } }
          ]
        }).lean();
        databaseSucceeded = true;
      } catch (error) {
        if (!degradedReadOnlyEnabled()) throw communityStoreError(error);
      }
    } else if (!degradedReadOnlyEnabled()) {
      throw communityStoreError();
    }

    if (!databaseSucceeded) {
      const viewerAliases = identityValues(req.authUser);
      if (matchesIdentity(userId, viewerAliases)) {
        profileIdentity = req.authUser;
      }
      const profileAliases = identityValues(profileIdentity);
      posts = memoryCommunityPosts.filter((post) => (
        matchesIdentity(post.author?.id, profileAliases)
        || (post.answers || []).some((answer) => matchesIdentity(answer.author?.id, profileAliases))
      ));
    }

    const canonicalId = account?.id
      || account?.uid
      || account?.firebaseUid
      || account?.githubId
      || actorFromUser(profileIdentity).id
      || userId;
    const profileAliases = identityValues(profileIdentity);
    const normalizedPosts = posts.map((post) => ({
      ...post,
      author: matchesIdentity(post.author?.id, profileAliases)
        ? { ...post.author, id: canonicalId }
        : post.author,
      answers: (post.answers || []).map((answer) => ({
        ...answer,
        author: matchesIdentity(answer.author?.id, profileAliases)
          ? { ...answer.author, id: canonicalId }
          : answer.author
      }))
    }));
    const contribution = buildLeaderboard(normalizedPosts).find((item) => item.id === canonicalId);
    let accountAuthor = account ? publicAuthor({
      id: canonicalId,
      name: account.name,
      cohort: account.school,
      avatar: account.avatar,
      isAdmin: account.role === 'Admin',
      isInstructor: Boolean(account.isInstructor)
    }) : null;
    const viewerOwnsProfile = matchesIdentity(userId, identityValues(req.authUser));
    if (!accountAuthor && viewerOwnsProfile) {
      accountAuthor = publicAuthor(actorFromUser(req.authUser));
    }
    if (!contribution && !accountAuthor) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thành viên cộng đồng.' });
    }

    const profile = {
      ...(contribution || {
        id: accountAuthor.id,
        points: 0,
        postsCount: 0,
        answersCount: 0,
        solvedCount: 0,
        upvotesReceived: 0
      }),
      ...(accountAuthor ? {
        id: canonicalId,
        name: accountAuthor.name,
        cohort: accountAuthor.cohort,
        avatar: accountAuthor.avatar,
        isAdmin: accountAuthor.isAdmin,
        isInstructor: accountAuthor.isInstructor
      } : {}),
      bio: cleanText(account?.bio || (viewerOwnsProfile ? req.authUser?.bio : ''), 2_000)
    };
    const userPosts = normalizedPosts
      .filter((post) => post.author?.id === canonicalId)
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .map((post) => publicPost(post, { summary: true, viewer: req.authUser }));

    return res.json({
      success: true,
      degraded: !databaseSucceeded,
      profile,
      posts: userPosts
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};

/**
 * GET /api/community/stats - Forum statistics
 */
export const getCommunityTags = async (req, res) => {
  try {
    const search = cleanText(req.query?.search, 80).replace(/^#/, '').toLowerCase();
    const page = positiveInteger(req.query?.page, 1, 10_000);
    const limit = positiveInteger(req.query?.limit, 48, 100);
    let tags;
    let total;
    let degraded = false;
    if (mongoose.connection.readyState === 1) {
      const [result] = await CommunityPost.aggregate([
        { $unwind: '$tags' },
        { $project: { tag: { $trim: { input: { $toLower: '$tags' }, chars: ' #' } } } },
        { $match: { tag: { $ne: '', ...(search ? { $regex: escapeRegExp(search) } : {}) } } },
        { $group: { _id: '$tag', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $facet: { rows: [{ $skip: (page - 1) * limit }, { $limit: limit }], totals: [{ $count: 'total' }] } }
      ]);
      tags = (result?.rows || []).map(item => ({ tag: item._id, count: item.count }));
      total = result?.totals[0]?.total || 0;
    } else {
      if (!degradedReadOnlyEnabled()) throw communityStoreError();
      degraded = true;
      const counts = new Map();
      for (const post of memoryCommunityPosts) for (const raw of new Set((post.tags || []).map(tag => tag.replace(/^#/, '').toLowerCase()))) {
        if (raw && raw.includes(search)) counts.set(raw, (counts.get(raw) || 0) + 1);
      }
      const all = [...counts].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
      total = all.length; tags = all.slice((page - 1) * limit, page * limit);
    }
    return res.json({ success: true, tags, total, page, totalPages: Math.max(1, Math.ceil(total / limit)), degraded });
  } catch (error) { return sendCommunityError(res, error); }
};

export const getStats = async (req, res) => {
  try {
    let totalPosts;
    let solvedCount;
    let totalAnswers;
    let trendingTags = [];
    let databaseSucceeded = false;

    if (mongoose.connection.readyState === 1) {
      try {
        const [postCount, acceptedCount, answerTotals, tagTotals] = await Promise.all([
          CommunityPost.countDocuments(),
          CommunityPost.countDocuments({ isAccepted: true }),
          CommunityPost.aggregate([
            { $project: { answerCount: { $size: { $ifNull: ['$answers', []] } } } },
            { $group: { _id: null, total: { $sum: '$answerCount' } } }
          ]),
          CommunityPost.aggregate([
            { $unwind: '$tags' },
            {
              $project: {
                tag: { $trim: { input: { $toLower: '$tags' }, chars: ' #' } }
              }
            },
            { $match: { tag: { $ne: '' } } },
            { $group: { _id: '$tag', count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 12 }
          ])
        ]);
        totalPosts = postCount;
        solvedCount = acceptedCount;
        totalAnswers = answerTotals[0]?.total || 0;
        trendingTags = tagTotals.map((item) => ({ tag: item._id, count: item.count }));
        databaseSucceeded = true;
      } catch (error) {
        if (!degradedReadOnlyEnabled()) throw communityStoreError(error);
        console.warn('[Community] Stats query failed, using development fallback:', error.message);
      }
    } else if (!degradedReadOnlyEnabled()) {
      throw communityStoreError();
    }

    if (totalPosts === undefined) {
      totalPosts = memoryCommunityPosts.length;
      solvedCount = memoryCommunityPosts.filter(
        (post) => post.isAccepted || post.status === 'solved'
      ).length;
      totalAnswers = memoryCommunityPosts.reduce(
        (sum, post) => sum + (post.answers || []).length,
        0
      );
      const tagCounts = new Map();
      for (const post of memoryCommunityPosts) {
        for (const rawTag of post.tags || []) {
          const tag = cleanText(rawTag, 80).replace(/^#+/, '').trim().toLowerCase();
          if (tag) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }
      trendingTags = [...tagCounts.entries()]
        .map(([tag, count]) => ({ tag, count }))
        .sort((left, right) => right.count - left.count || left.tag.localeCompare(right.tag, 'vi'))
        .slice(0, 12);
    }

    const openCount = totalPosts - solvedCount;

    const solvedPercentage = totalPosts > 0 ? Math.round((solvedCount / totalPosts) * 100) : 0;

    res.json({
      success: true,
      degraded: !databaseSucceeded,
      stats: {
        totalPosts,
        solvedCount,
        openCount,
        totalAnswers,
        solvedPercentage,
        trendingTags
      }
    });
  } catch (error) {
    return sendCommunityError(res, error);
  }
};
