import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import StudyTopic from '../models/StudyTopic.js';
import { saveStudyContent } from '../services/studyContent.js';
import { normalizeStudyMath } from '../../shared/studyMath.mjs';
try {
  if (!await connectDB()) throw new Error('MongoDB chưa kết nối; không thay đổi dữ liệu.');
  const documents = await StudyTopic.find().lean();
  let changed = 0;
  for (const document of documents) {
    const next = normalizeStudyMath(document.content);
    if (JSON.stringify(next) === JSON.stringify(document.content)) continue;
    await saveStudyContent(document.id, document.version, next, 'system:math-typesetting');
    console.log(`Repaired ${document.id}; previous content retained in revisions.`);
    changed++;
  }
  console.log(`Repaired ${changed} chapters.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
