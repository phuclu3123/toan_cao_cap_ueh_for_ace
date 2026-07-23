import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
