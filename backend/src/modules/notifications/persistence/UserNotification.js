import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  recipientId: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  link: { type: String, required: true },
  actor: { id: String, name: String, avatar: String },
  postId: String,
  targetId: String,
  isRead: { type: Boolean, default: false },
  dismissedAt: { type: Date, default: null }
}, { timestamps: true, autoCreate: false, autoIndex: false });
schema.index({ recipientId: 1, dismissedAt: 1, createdAt: -1 });
schema.index({ recipientId: 1, isRead: 1, dismissedAt: 1 });
export default mongoose.model('UserNotification', schema);
