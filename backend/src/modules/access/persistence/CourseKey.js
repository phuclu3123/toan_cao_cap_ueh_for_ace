import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  hash: { type: String, required: true, select: false },
  courseId: { type: String, required: true },
  label: { type: String, required: true },
  status: { type: String, enum: ['UNUSED', 'USED', 'DISABLED'], default: 'UNUSED' },
  createdBy: { type: String, required: true },
  activateBefore: { type: Date, default: null },
  usedBy: { type: String, default: null },
  usedEmail: { type: String, default: null },
  usedAt: { type: Date, default: null }
}, { timestamps: true, autoCreate: false, autoIndex: false });
schema.index({ hash: 1 }, { unique: true });
schema.index({ courseId: 1, createdAt: -1, _id: -1 });
export default mongoose.model('CourseKey', schema);
