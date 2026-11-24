import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'node:dns';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import CommunityPost from '../src/modules/community/persistence/CommunityPost.js';
import { SEED_COMMUNITY_POSTS } from '../src/modules/community/domain/seedPosts.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
const dnsServers = (process.env.MONGODB_DNS_SERVERS || process.env.MONGO_DNS_SERVERS || '').split(',').map(value => value.trim()).filter(Boolean);
if (dnsServers.length) dns.setServers(dnsServers);
const uri = process.env.MONGODB_DIRECT_URI || process.env.MONGO_DIRECT_URI || process.env.MONGODB_URI || process.env.MONGO_URI;
const apply = process.argv.includes('--apply');
const demoActors = new Set(['user-phuc', 'user-phuc-519', 'user-phuc-0809']);
const removeDemoVoters = values => [...new Set((values || []).filter(id => !demoActors.has(id)))];

try {
  if (!uri) throw new Error('MongoDB URI is missing.');
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || 'UEH_TCC', serverSelectionTimeoutMS: 12000 });
  const seeds = new Map(SEED_COMMUNITY_POSTS.map(post => [post.id, post]));
  const posts = await CommunityPost.find({ id: { $in: [...seeds.keys()] }, sampleMetricsRemoved: { $ne: true } }).lean();
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', matched: posts.length, preserves: 'all question, answer and comment content; all user accounts' }));
  if (apply && posts.length) {
    const folder = new URL('../../artifacts/community/private-backups/', import.meta.url);
    await mkdir(folder, { recursive: true });
    const backup = new URL('sample-metrics-' + Date.now() + '.json', folder);
    await writeFile(backup, JSON.stringify({ database: mongoose.connection.name, createdAt: new Date(), posts }, null, 2), { flag: 'wx' });
    let updated = 0;
    for (const post of posts) {
      const seed = seeds.get(post.id);
      const sampleAnswers = new Set((seed.answers || []).map(answer => answer.id));
      const upvotedBy = removeDemoVoters(post.upvotedBy);
      const downvotedBy = removeDemoVoters(post.downvotedBy);
      const answers = (post.answers || []).map(answer => {
        const up = removeDemoVoters(answer.upvotedBy);
        const down = removeDemoVoters(answer.downvotedBy);
        return { ...answer, upvotedBy: up, downvotedBy: down, upvotes: up.length - down.length,
          ...(sampleAnswers.has(answer.id) ? { origin: 'curated', isAccepted: false, isFirstSolver: false, instructorVerified: false,
            author: { ...answer.author, avatar: '', points: 0, isAdmin: false, isInstructor: false } } : {}) };
      });
      const accepted = answers.find(answer => answer.isAccepted);
      const result = await CommunityPost.updateOne({ _id: post._id, __v: post.__v, updatedAt: post.updatedAt, sampleMetricsRemoved: { $ne: true } },
        { $set: { origin: 'curated', sampleMetricsRemoved: true, metricsResetAt: new Date(), views: 0,
          upvotes: upvotedBy.length - downvotedBy.length, upvotedBy, downvotedBy, answers,
          isAccepted: Boolean(accepted), acceptedAnswerId: accepted?.id || null, instructorVerified: false,
          status: accepted ? 'solved' : answers.length ? 'answered' : 'unanswered',
          author: { ...post.author, avatar: '', points: 0, isAdmin: false, isInstructor: false } }, $inc: { __v: 1 } });
      if (!result.modifiedCount) throw new Error('Concurrent update detected. Stopped; re-run safely after reviewing the backup.');
      updated += result.modifiedCount;
    }
    console.log(JSON.stringify({ updated, backup: fileURLToPath(backup), contentDeleted: 0, accountsModified: 0 }));
  }
} catch (error) { console.error(error.message.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/g, '[redacted]')); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
