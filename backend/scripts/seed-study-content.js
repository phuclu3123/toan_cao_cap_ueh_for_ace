import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { seedStudyContent } from '../services/studyContent.js';
try {
  if (!await connectDB()) throw new Error('MongoDB chưa sẵn sàng; không thay đổi dữ liệu.');
  await seedStudyContent();
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
