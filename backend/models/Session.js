import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true, trim: true },
  username: { type: String, required: true, lowercase: true, trim: true },
  sessionVersion: { type: Number, required: true, default: 0, min: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  lastSeenAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
