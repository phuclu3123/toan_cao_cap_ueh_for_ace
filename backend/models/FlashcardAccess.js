import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'REVOKED'], required: true },
  source: { type: String, enum: ['ADMIN', 'KEY'], required: true },
  expiresAt: { type: Date, default: null },
  grantedAt: { type: Date, required: true },
  grantedBy: { type: String, required: true },
  revokedAt: { type: Date, default: null },
  revision: { type: Number, default: 1 }
}, { timestamps: true, autoCreate: false, autoIndex: false });
schema.index({ status: 1, updatedAt: -1 });
schema.index({ email: 1 });
schema.index({ createdAt: -1, _id: -1 });
export default mongoose.model('FlashcardAccess', schema);
