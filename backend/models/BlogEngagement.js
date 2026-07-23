import mongoose from 'mongoose';

const reactionVoteSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true },
    type: { type: String, required: true },
  },
  { _id: false },
);

const commentSchema = new mongoose.Schema(
  {
    commentId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    clientId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },
  },
  { _id: false },
);

const blogEngagementSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    reactions: {
      clear: { type: Number, default: 0 },
      useful: { type: Number, default: 0 },
      insightful: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
    },
    reactionVotes: { type: [reactionVoteSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model('BlogEngagement', blogEngagementSchema);
