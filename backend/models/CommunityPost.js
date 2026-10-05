import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    id: { type: String },
    name: { type: String, default: 'Sinh viên UEH' },
    cohort: { type: String, default: 'K50 UEH' },
    avatar: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

const AnswerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    id: { type: String },
    name: { type: String, default: 'Sinh viên UEH' },
    cohort: { type: String, default: 'K50 UEH' },
    avatar: { type: String },
    points: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
    isInstructor: { type: Boolean, default: false }
  },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: String }],
  downvotedBy: [{ type: String }],
  isAccepted: { type: Boolean, default: false },
  instructorVerified: { type: Boolean, default: false },
  isFirstSolver: { type: Boolean, default: false },
  comments: [CommentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

const CommunityPostSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, default: 'question', enum: ['question', 'discussion', 'article'] },
  title: { type: String, required: true },
  content: { type: String, required: true },
  subject: { type: String, default: 'all' },
  subjectLabel: { type: String },
  difficulty: { type: String, default: 'standard' },
  difficultyLabel: { type: String },
  tags: [{ type: String }],
  image: { type: String },
  altText: { type: String },
  author: {
    id: { type: String },
    name: { type: String, default: 'Sinh viên UEH' },
    email: { type: String },
    cohort: { type: String, default: 'K50 UEH' },
    avatar: { type: String },
    points: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
    isInstructor: { type: Boolean, default: false }
  },
  views: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: String }],
  downvotedBy: [{ type: String }],
  savedBy: [{ type: String }],
  status: { type: String, default: 'unanswered', enum: ['unanswered', 'answered', 'solved', 'closed'] },
  isAccepted: { type: Boolean, default: false },
  acceptedAnswerId: { type: String },
  instructorVerified: { type: Boolean, default: false },
  answers: [AnswerSchema]
}, { timestamps: true, optimisticConcurrency: true });

export default mongoose.model('CommunityPost', CommunityPostSchema);
