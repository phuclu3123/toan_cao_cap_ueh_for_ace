import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String }, // Custom generated ID for backward compatibility
  uid: { type: String, unique: true, sparse: true }, // Firebase UID
  username: { type: String, required: true, unique: true }, // Email
  password: { type: String }, // Optional for social login users
  name: { type: String },
  role: { type: String, default: 'Student' },
  phoneNumber: { type: String },
  avatar: { type: String },
  school: { type: String },
  bio: { type: String },
  otpCode: { type: String },
  otpExpiresAt: { type: String }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
