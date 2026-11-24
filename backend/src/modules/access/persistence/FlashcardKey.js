import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  hash: { type: String, required: true, unique: true, select: false },
  label: { type: String, required: true },
  status: { type: String, enum: ['UNUSED', 'USED', 'DISABLED'], default: 'UNUSED' },
  createdBy: { type: String, required: true },
  activateBefore: { type: Date, default: null },
  accessDays: { type: Number, default: null },
  usedBy: { type: String, default: null },
  usedEmail: { type: String, default: null },
  usedAt: { type: Date, default: null }
}, { timestamps: true, autoCreate: false, autoIndex: false });
schema.index({ createdAt: -1, _id: -1 });
export default mongoose.model('FlashcardKey', schema);
