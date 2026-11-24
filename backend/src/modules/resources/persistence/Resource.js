import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
  type: {
    type: String,
    required: true,
    enum: ['documentsData', 'midtermExams', 'finalExams']
  },
  title: { type: String, required: true, trim: true, maxlength: 300 },
  date: { type: String, trim: true, maxlength: 40 },
  category: { type: String, trim: true, maxlength: 80 },
  categoryLabel: { type: String, trim: true, maxlength: 160 },
  image: { type: String, trim: true, maxlength: 1000 },
  pdf: { type: String, trim: true, maxlength: 1000 },
  desc: { type: String, trim: true, maxlength: 5000 },
  externalUrl: { type: String, trim: true, maxlength: 2000 },
  professor: { type: String, trim: true, maxlength: 120 },
  professorName: { type: String, trim: true, maxlength: 200 },
  hasDetailRoute: { type: Boolean, default: false },
  views: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

export default mongoose.model('Resource', resourceSchema);
