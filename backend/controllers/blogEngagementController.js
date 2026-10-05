import { randomUUID } from 'node:crypto';

import BlogEngagement from '../models/BlogEngagement.js';

const reactionTypes = new Set(['clear', 'useful', 'insightful', 'love']);
const MAX_COMMENTS = 500;
const MAX_REACTION_VOTES = 10_000;
const MAX_COMMENT_LIKES = 10_000;

const emptyReactions = () => ({
  clear: 0,
  useful: 0,
  insightful: 0,
  love: 0
});

const createEmptyEngagement = (slug) => ({
  slug,
  reactions: emptyReactions(),
  reactionVotes: [],
  comments: []
});

const cleanSingleLine = (value, maxLength) => (
  String(value || '')
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
);

const cleanComment = (value, maxLength) => (
  String(value || '')
    .replace(/[<>]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, maxLength)
);

const validClientId = (value) => /^[A-Za-z0-9._:-]{8,120}$/.test(value);
const validSlug = (value) => /^[A-Za-z0-9][A-Za-z0-9_-]{0,179}$/.test(value);

const serializeEngagement = (engagement, clientId = '') => {
  const source = engagement?.toObject ? engagement.toObject() : engagement;
  const votes = Array.isArray(source?.reactionVotes) ? source.reactionVotes : [];
  const comments = [...(source?.comments || [])]
    .map((comment) => ({
      commentId: comment.commentId,
      authorName: comment.authorName,
      content: comment.content,
      createdAt: comment.createdAt,
      likes: Math.max(0, Number(comment.likes) || 0),
      viewerLiked: Boolean(clientId && (comment.likedBy || []).includes(clientId))
    }))
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));

  return {
    slug: source?.slug,
    reactions: { ...emptyReactions(), ...(source?.reactions || {}) },
    viewerReaction: votes.find((vote) => vote.clientId === clientId)?.type || null,
    comments
  };
};

const getOrCreateEngagement = (slug) => BlogEngagement.findOneAndUpdate(
  { slug },
  { $setOnInsert: createEmptyEngagement(slug) },
  { new: true, upsert: true, setDefaultsOnInsert: true }
);

const mutateWithRetry = async (slug, mutation, { create = true } = {}) => {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const engagement = create
      ? await getOrCreateEngagement(slug)
      : await BlogEngagement.findOne({ slug });
    if (!engagement) return null;

    const mutationResult = mutation(engagement);
    if (mutationResult === false) return false;

    try {
      await engagement.save();
      return engagement;
    } catch (error) {
      lastError = error;
      if (error?.name !== 'VersionError') throw error;
    }
  }
  throw lastError;
};

const sendServerError = (res, context, error, message) => {
  console.error(`[Blog engagement] ${context}:`, error);
  return res.status(500).json({ success: false, message });
};

export const getBlogEngagement = async (req, res) => {
  const slug = cleanSingleLine(req.params?.slug, 180);
  const clientId = cleanSingleLine(req.query?.clientId, 120);

  if (!validSlug(slug) || (clientId && !validClientId(clientId))) {
    return res.status(400).json({ success: false, message: 'Mã bài viết hoặc thiết bị không hợp lệ.' });
  }

  try {
    const engagement = await getOrCreateEngagement(slug);
    return res.json({ success: true, engagement: serializeEngagement(engagement, clientId) });
  } catch (error) {
    return sendServerError(res, 'load failed', error, 'Không thể tải khu vực thảo luận.');
  }
};

export const updateBlogReaction = async (req, res) => {
  const slug = cleanSingleLine(req.params?.slug, 180);
  const clientId = cleanSingleLine(req.body?.clientId, 120);
  const reaction = cleanSingleLine(req.body?.reaction, 24);

  if (!validSlug(slug) || !validClientId(clientId) || !reactionTypes.has(reaction)) {
    return res.status(400).json({ success: false, message: 'Dữ liệu cảm xúc không hợp lệ.' });
  }

  try {
    const engagement = await mutateWithRetry(slug, (current) => {
      current.reactions = { ...emptyReactions(), ...(current.reactions?.toObject?.() || current.reactions || {}) };
      current.reactionVotes ||= [];
      const voteIndex = current.reactionVotes.findIndex((vote) => vote.clientId === clientId);
      const previousReaction = voteIndex >= 0 ? current.reactionVotes[voteIndex].type : null;

      if (voteIndex < 0 && current.reactionVotes.length >= MAX_REACTION_VOTES) {
        const error = new Error('Reaction capacity reached');
        error.statusCode = 409;
        throw error;
      }

      if (reactionTypes.has(previousReaction)) {
        current.reactions[previousReaction] = Math.max(
          0,
          Number(current.reactions[previousReaction] || 0) - 1
        );
      }

      if (previousReaction === reaction) {
        current.reactionVotes.splice(voteIndex, 1);
      } else {
        current.reactions[reaction] = Number(current.reactions[reaction] || 0) + 1;
        const nextVote = { clientId, type: reaction };
        if (voteIndex >= 0) current.reactionVotes[voteIndex] = nextVote;
        else current.reactionVotes.push(nextVote);
      }

      current.markModified('reactions');
      current.markModified('reactionVotes');
    });

    return res.json({ success: true, engagement: serializeEngagement(engagement, clientId) });
  } catch (error) {
    if (error?.statusCode === 409) {
      return res.status(409).json({ success: false, message: 'Bài viết đã đạt giới hạn lượt tương tác.' });
    }
    return sendServerError(res, 'reaction update failed', error, 'Chưa thể ghi nhận cảm xúc.');
  }
};

export const createBlogComment = async (req, res) => {
  const slug = cleanSingleLine(req.params?.slug, 180);
  const clientId = cleanSingleLine(req.body?.clientId, 120);
  const authorName = cleanSingleLine(req.body?.authorName, 60);
  const content = cleanComment(req.body?.content, 1200);

  if (!validSlug(slug) || !validClientId(clientId) || authorName.length < 2 || content.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập tên và bình luận có nội dung rõ ràng.'
    });
  }

  const comment = {
    commentId: randomUUID(),
    authorName,
    content,
    clientId,
    createdAt: new Date(),
    likes: 0,
    likedBy: []
  };

  try {
    const engagement = await mutateWithRetry(slug, (current) => {
      if (current.comments.length >= MAX_COMMENTS) {
        const error = new Error('Comment capacity reached');
        error.statusCode = 409;
        throw error;
      }
      current.comments.push(comment);
    });

    return res.status(201).json({
      success: true,
      engagement: serializeEngagement(engagement, clientId)
    });
  } catch (error) {
    if (error?.statusCode === 409) {
      return res.status(409).json({ success: false, message: 'Bài viết đã đạt giới hạn bình luận.' });
    }
    return sendServerError(res, 'comment create failed', error, 'Chưa thể đăng bình luận.');
  }
};

export const toggleCommentLike = async (req, res) => {
  const slug = cleanSingleLine(req.params?.slug, 180);
  const commentId = cleanSingleLine(req.params?.commentId, 120);
  const clientId = cleanSingleLine(req.body?.clientId, 120);

  if (!validSlug(slug) || !commentId || !validClientId(clientId)) {
    return res.status(400).json({ success: false, message: 'Dữ liệu lượt thích không hợp lệ.' });
  }

  try {
    const engagement = await mutateWithRetry(slug, (current) => {
      const comment = current.comments.find((item) => item.commentId === commentId);
      if (!comment) return false;
      comment.likedBy ||= [];
      const likeIndex = comment.likedBy.indexOf(clientId);
      if (likeIndex >= 0) {
        comment.likedBy.splice(likeIndex, 1);
      } else {
        if (comment.likedBy.length >= MAX_COMMENT_LIKES) {
          const error = new Error('Like capacity reached');
          error.statusCode = 409;
          throw error;
        }
        comment.likedBy.push(clientId);
      }
      comment.likes = comment.likedBy.length;
      current.markModified('comments');
      return true;
    }, { create: false });

    if (!engagement) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận.' });
    }
    return res.json({ success: true, engagement: serializeEngagement(engagement, clientId) });
  } catch (error) {
    if (error?.statusCode === 409) {
      return res.status(409).json({ success: false, message: 'Bình luận đã đạt giới hạn lượt thích.' });
    }
    return sendServerError(res, 'comment like failed', error, 'Chưa thể cập nhật lượt thích.');
  }
};
