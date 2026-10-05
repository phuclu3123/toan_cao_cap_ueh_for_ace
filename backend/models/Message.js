import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  subject: { type: String, trim: true, maxlength: 200 },
  message: { type: String, required: true, trim: true, maxlength: 5000 }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
