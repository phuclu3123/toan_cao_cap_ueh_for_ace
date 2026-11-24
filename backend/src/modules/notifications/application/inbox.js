import { createHash } from 'node:crypto';
import UserNotification from '../persistence/UserNotification.js';

const preparations = new WeakMap();

// Model.init() caches its first rejection when imported before Mongo connects
// with buffering disabled. Prepare after connection and allow failed attempts
// to retry; the collection must also exist before entering a transaction.
export function prepareNotificationStore() {
  const connection = UserNotification.db;
  if (connection.readyState !== 1) {
    return Promise.reject(Object.assign(new Error('Chưa kết nối được hộp thông báo.'), { statusCode: 503 }));
  }
  const database = connection.db;
  if (preparations.has(database)) return preparations.get(database);
  const preparation = (async () => {
    try { await UserNotification.createCollection(); }
    catch (error) { if (error.code !== 48 && error.codeName !== 'NamespaceExists') throw error; }
    await UserNotification.createIndexes();
  })().catch(error => { preparations.delete(database); throw error; });
  preparations.set(database, preparation);
  return preparation;
}

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
