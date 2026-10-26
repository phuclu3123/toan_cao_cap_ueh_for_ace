import mongoose from 'mongoose';

// Transport configuration only; booking ownership and money state remain in Java/Firestore.
const schema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  destination: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('PayosWebhookRelay', schema);
