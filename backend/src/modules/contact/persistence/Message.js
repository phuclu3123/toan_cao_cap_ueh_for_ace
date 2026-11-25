import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  submissionKey: { type: String, default: undefined },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, default: '', trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 32 },
  subject: { type: String, trim: true, maxlength: 200 },
  message: { type: String, required: true, trim: true, maxlength: 5000 }
}, { timestamps: true });
messageSchema.index({submissionKey:1},{unique:true,partialFilterExpression:{submissionKey:{$type:'string'}}});

export default mongoose.model('Message', messageSchema);
