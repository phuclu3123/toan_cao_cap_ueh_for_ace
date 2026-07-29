import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  username: { type: String, required: true, index: true },
  courseId: { type: String, required: true, index: true },
  status: {
    type: String,
    enum: ['ACTIVE', 'REVOKED'],
    default: 'ACTIVE',
    index: true
  },
  source: {
    type: String,
    enum: ['PAYOS', 'FREE', 'ADMIN'],
    required: true
  },
  paymentOrderCode: { type: Number, default: null },
  grantedAt: { type: Date, default: Date.now },
  revokedAt: { type: Date, default: null }
}, { timestamps: true });

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);

