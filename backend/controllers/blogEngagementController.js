import BlogEngagement from '../models/BlogEngagement.js';
const reactionTypes = new Set(['clear', 'useful', 'insightful', 'love']);

const emptyReactions = () => ({
  clear: 0,
  useful: 0,
  insightful: 0,
  love: 0,
});

const createEmptyEngagement = (slug) => ({
  slug,
  reactions: emptyReactions(),
  reactionVotes: [],
  comments: [],
});

const cleanSingleLine = (value, maxLength) =>
  String(value || '')
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const cleanComment = (value, maxLength) =>
  String(value || '')
    .replace(/[<>]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, maxLength);

const serializeEngagement = (engagement, clientId = '') => {
  const source = engagement?.toObject ? engagement.toObject() : engagement;
  const votes = source?.reactionVotes || [];
  const comments = [...(source?.comments || [])]
    .map((comment) => ({
      commentId: comment.commentId,
      authorName: comment.authorName,
      content: comment.content,
      createdAt: comment.createdAt,
      likes: Math.max(0, Number(comment.likes) || 0),
      viewerLiked: Boolean(clientId && (comment.likedBy || []).includes(clientId)),
    }))
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));

  return {
    slug: source?.slug,
    reactions: { ...emptyReactions(), ...(source?.reactions || {}) },
    viewerReaction: votes.find((vote) => vote.clientId === clientId)?.type || null,
    comments,
  };
};



export const getBlogEngagement = async (req, res) => {
  const slug = cleanSingleLine(req.params.slug, 180);
  const clientId = cleanSingleLine(req.query.clientId, 120);

  if (!slug) {
    return res.status(400).json({ success: false, message: 'Thiếu mã bài viết.' });
  }

  try {
    const engagement =
      (await BlogEngagement.findOne({ slug })) ||
      (await BlogEngagement.create(createEmptyEngagement(slug)));
    return res.json({ success: true, engagement: serializeEngagement(engagement, clientId) });
  } catch (error) {
    console.error('Lỗi tải tương tác bài viết:', error);
    return res.status(500).json({ success: false, message: 'Không thể tải khu vực thảo luận.' });
  }
};

export const updateBlogReaction = async (req, res) => {
  const slug = cleanSingleLine(req.params.slug, 180);
  const clientId = cleanSingleLine(req.body.clientId, 120);
  const reaction = cleanSingleLine(req.body.reaction, 24);

  if (!slug || !clientId || !reactionTypes.has(reaction)) {
    return res.status(400).json({ success: false, message: 'Dữ liệu cảm xúc không hợp lệ.' });
  }

  const applyReaction = (engagement) => {
    engagement.reactions = {
      clear: Number(engagement.reactions?.clear || 0),
      useful: Number(engagement.reactions?.useful || 0),
      insightful: Number(engagement.reactions?.insightful || 0),
      love: Number(engagement.reactions?.love || 0),
    };
    engagement.reactionVotes ||= [];
    const voteIndex = engagement.reactionVotes.findIndex((vote) => vote.clientId === clientId);
    const previousReaction = voteIndex >= 0 ? engagement.reactionVotes[voteIndex].type : null;

    if (previousReaction) {
      engagement.reactions[previousReaction] = Math.max(
        0,
        Number(engagement.reactions[previousReaction] || 0) - 1,
      );
    }

    if (previousReaction === reaction) {
      engagement.reactionVotes.splice(voteIndex, 1);
    } else {
      engagement.reactions[reaction] = Number(engagement.reactions[reaction] || 0) + 1;
      const nextVote = { clientId, type: reaction };
      if (voteIndex >= 0) engagement.reactionVotes[voteIndex] = nextVote;
      else engagement.reactionVotes.push(nextVote);
    }
  };

  try {
    const engagement =
      (await BlogEngagement.findOne({ slug })) ||
      new BlogEngagement(createEmptyEngagement(slug));
    applyReaction(engagement);
    engagement.markModified('reactions');
    engagement.markModified('reactionVotes');
    await engagement.save();
    return res.json({ success: true, engagement: serializeEngagement(engagement, clientId) });
  } catch (error) {
    console.error('Lỗi cập nhật cảm xúc:', error);
    return res.status(500).json({ success: false, message: 'Chưa thể ghi nhận cảm xúc.' });
  }
};

export const createBlogComment = async (req, res) => {
  const slug = cleanSingleLine(req.params.slug, 180);
  const clientId = cleanSingleLine(req.body.clientId, 120);
  const authorName = cleanSingleLine(req.body.authorName, 60);
  const content = cleanComment(req.body.content, 1200);

  if (!slug || !clientId || authorName.length < 2 || content.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập tên và bình luận có nội dung rõ ràng.',
    });
  }

  const comment = {
    commentId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    authorName,
    content,
    clientId,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
  };

  try {
    const engagement =
      (await BlogEngagement.findOne({ slug })) ||
      new BlogEngagement(createEmptyEngagement(slug));
    engagement.comments.push(comment);
    await engagement.save();
    return res.status(201).json({
      success: true,
      engagement: serializeEngagement(engagement, clientId),
    });
  } catch (error) {
    console.error('Lỗi gửi bình luận:', error);
    return res.status(500).json({ success: false, message: 'Chưa thể đăng bình luận.' });
  }
};

export const toggleCommentLike = async (req, res) => {
  const slug = cleanSingleLine(req.params.slug, 180);
  const commentId = cleanSingleLine(req.params.commentId, 120);
  const clientId = cleanSingleLine(req.body.clientId, 120);

  if (!slug || !commentId || !clientId) {
    return res.status(400).json({ success: false, message: 'Dữ liệu lượt thích không hợp lệ.' });
  }

  const applyLike = (engagement) => {
    const comment = engagement.comments.find((item) => item.commentId === commentId);
    if (!comment) return false;
    comment.likedBy ||= [];
    const likeIndex = comment.likedBy.indexOf(clientId);
    if (likeIndex >= 0) comment.likedBy.splice(likeIndex, 1);
    else comment.likedBy.push(clientId);
    comment.likes = comment.likedBy.length;
    return true;
  };

  try {
    const engagement = await BlogEngagement.findOne({ slug });
    if (!engagement || !applyLike(engagement)) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận.' });
    }
    engagement.markModified('comments');
    await engagement.save();
    return res.json({ success: true, engagement: serializeEngagement(engagement, clientId) });
  } catch (error) {
    console.error('Lỗi thích bình luận:', error);
    return res.status(500).json({ success: false, message: 'Chưa thể cập nhật lượt thích.' });
  }
};
