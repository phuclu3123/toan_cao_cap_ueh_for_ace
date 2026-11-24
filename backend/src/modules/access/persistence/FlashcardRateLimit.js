import mongoose from 'mongoose';

// Shared across backend instances. TTL is cleanup only; queries enforce expiry.
const schema = new mongoose.Schema({
  _id: String,
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true }
}, { versionKey: false, autoCreate: false, autoIndex: false });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model('FlashcardRateLimit', schema);
