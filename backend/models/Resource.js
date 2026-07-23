import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  type: { type: String, required: true }, // 'documentsData', 'midtermExams', 'finalExams'
  title: { type: String, required: true },
  date: { type: String },
  category: { type: String },
  categoryLabel: { type: String },
  image: { type: String },
  pdf: { type: String },
  desc: { type: String },
  externalUrl: { type: String },
  professor: { type: String },
  professorName: { type: String },
  hasDetailRoute: { type: Boolean }
}, { timestamps: true });

export default mongoose.model('Resource', resourceSchema);
