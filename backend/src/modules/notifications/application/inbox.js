import { createHash } from 'node:crypto';
import UserNotification from '../persistence/UserNotification.js';

export const prepareNotificationStore = () => UserNotification.init();

/** Called with the reaction's MongoDB transaction: both persist, or neither does. */
export async function recordCommentHeart({ recipientId, actor, postId, commentId, excerpt }, session) {
  if (!recipientId || recipientId === actor.id) return;
  const id = createHash('sha256').update(`comment-heart:${postId}:${commentId}:${actor.id}`).digest('hex');
  await UserNotification.updateOne({ id }, { $setOnInsert: {
    id, recipientId, type: 'comment_reaction', title: 'Bình luận của bạn được thả tim',
    message: `${actor.name} đã thả tim bình luận của bạn${excerpt ? ': ' + excerpt : '.'}`,
    link: `/community/${encodeURIComponent(postId)}#comment-${encodeURIComponent(commentId)}`,
    postId, targetId: commentId,
    actor: { id: actor.id, name: actor.name, avatar: actor.avatar || '' },
    isRead: false, dismissedAt: null, createdAt: new Date(), updatedAt: new Date()
  } }, { upsert: true, session, timestamps: false });
}
