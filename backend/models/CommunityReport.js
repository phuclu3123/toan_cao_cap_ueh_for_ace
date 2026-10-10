import mongoose from 'mongoose';

const CommunityReportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  targetId: { type: String, required: true, index: true },
  reason: {
    type: String,
    required: true,
    enum: ['math_error', 'spam', 'inappropriate', 'wrong_category', 'other']
  },
  detail: { type: String, default: '', maxlength: 500 },
  reporter: {
    id: { type: String, required: true },
    name: { type: String, default: 'Sinh viên UEH' }
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
    default: 'pending',
    index: true
  }
}, { timestamps: true });

CommunityReportSchema.index({ 'reporter.id': 1, targetId: 1, createdAt: -1 });

export default mongoose.model('CommunityReport', CommunityReportSchema);
