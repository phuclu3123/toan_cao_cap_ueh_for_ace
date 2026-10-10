import CommunityPost from '../models/CommunityPost.js';
import { SEED_COMMUNITY_POSTS } from '../controllers/communityController.js';

export const runAutoMigration = async () => {
  if (process.env.RUN_LEGACY_DATA_MIGRATION !== 'true') {
    console.log('[AutoMigration] Bỏ qua đồng bộ dữ liệu mẫu (RUN_LEGACY_DATA_MIGRATION != true).');
    return;
  }
  try {
    console.log('--- Đang đồng bộ dữ liệu Community sang MongoDB Atlas ---');
    const operations = SEED_COMMUNITY_POSTS.map((post) => ({
      updateOne: {
        filter: { id: post.id },
        update: { $setOnInsert: post },
        upsert: true
      }
    }));

    const result = operations.length > 0
      ? await CommunityPost.bulkWrite(operations, { ordered: false })
      : null;
    console.log(`[AutoMigration] Đã tạo ${result?.upsertedCount || 0} bài viết còn thiếu.`);
    console.log('--- Hoàn tất đồng bộ dữ liệu Community trên MongoDB Atlas ---');
  } catch (err) {
    console.warn('[AutoMigration] Cảnh báo đồng bộ:', err.message);
  }
};
