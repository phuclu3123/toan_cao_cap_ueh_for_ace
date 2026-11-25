import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  courseId: { type: String, required: true },
  action: { type: String, required: true },
  actorId: { type: String, required: true },
  userId: { type: String, default: null },
  email: { type: String, default: null },
  keyId: { type: String, default: null },
  reason:{type:String,maxlength:500,default:''}
}, { timestamps: true, autoCreate: false, autoIndex: false });
schema.index({ courseId: 1, createdAt: -1, _id: -1 });
export default mongoose.model('CourseAccessAudit', schema);
