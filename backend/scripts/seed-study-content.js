import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/platform/database/db.js';
import { seedStudyContent } from '../src/modules/learning/application/studyContent.js';
try {
  if (!await connectDB()) throw new Error('MongoDB chưa sẵn sàng; không thay đổi dữ liệu.');
  await seedStudyContent();
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
