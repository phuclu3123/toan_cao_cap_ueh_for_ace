import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import CommunityPost from './models/CommunityPost.js';
import { SEED_COMMUNITY_POSTS } from './controllers/communityController.js';

dotenv.config();

export const resolveMongoUri = (environment = process.env) => (
  environment.MONGODB_DIRECT_URI
  || environment.MONGO_DIRECT_URI
  || environment.MONGODB_URI
  || environment.MONGO_URI
  || ''
);

export async function seedCommunityDatabase({ logger = console } = {}) {
  const uri = resolveMongoUri();
  if (!uri) {
    throw new Error('Missing MONGODB_URI/MONGO_URI (or a direct URI variant).');
  }

  logger.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || 'UEH_TCC',
      serverSelectionTimeoutMS: 12_000
    });
    logger.log('MongoDB connected successfully.');

    const operations = SEED_COMMUNITY_POSTS.map((post) => ({
      updateOne: {
        filter: { id: post.id },
        update: { $setOnInsert: post },
        upsert: true
      }
    }));
    const result = await CommunityPost.bulkWrite(operations, { ordered: false });
    const total = await CommunityPost.countDocuments();

    logger.log(
      `Community seed complete: ${result.upsertedCount || 0} created, ${total} total posts.`
    );
    return { created: result.upsertedCount || 0, total };
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

const isDirectExecution = process.argv[1]
  && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectExecution) {
  seedCommunityDatabase().catch((error) => {
    console.error('Error seeding community database:', error.message);
    process.exitCode = 1;
  });
}
