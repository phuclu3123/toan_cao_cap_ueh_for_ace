import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true, index: true },
  uid: { type: String, unique: true, sparse: true, index: true },
  // `uid` remains for backward compatibility while provider-specific IDs let
  // one account authenticate through both Firebase and GitHub.
  firebaseUid: { type: String, unique: true, sparse: true, index: true },
  githubId: { type: String, unique: true, sparse: true, index: true },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254
  },
  password: { type: String, select: false },
  name: { type: String, trim: true, maxlength: 120 },
  role: { type: String, enum: ['Student', 'Admin'], default: 'Student' },
  phoneNumber: { type: String, trim: true, maxlength: 32 },
  avatar: { type: String, maxlength: 2_500_000 },
  school: { type: String, trim: true, maxlength: 160 },
  bio: { type: String, trim: true, maxlength: 2_000 },
  sessionVersion: { type: Number, default: 0, min: 0 },
  otpHash: { type: String, select: false },
  otpExpiresAt: { type: Date, select: false },
  otpAttempts: { type: Number, default: 0, select: false }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
