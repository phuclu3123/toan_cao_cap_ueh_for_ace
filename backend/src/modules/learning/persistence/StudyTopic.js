import mongoose from 'mongoose';

const studyTopicSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  version: { type: Number, required: true, default: 1 },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedBy: String,
  revisions: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { timestamps: true, collection: 'flashcard_topics', minimize: false, autoCreate: false, autoIndex: false });

export default mongoose.model('StudyTopic', studyTopicSchema);
