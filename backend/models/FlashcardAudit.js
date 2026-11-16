import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  action: { type: String, required: true },
  actorId: { type: String, required: true },
  userId: { type: String, default: null },
  email: { type: String, default: null },
  keyId: { type: String, default: null },
  reason: { type: String, default: '' }
}, { timestamps: true, autoCreate: false, autoIndex: false });
schema.index({ createdAt: -1, _id: -1 });
export default mongoose.model('FlashcardAudit', schema);
