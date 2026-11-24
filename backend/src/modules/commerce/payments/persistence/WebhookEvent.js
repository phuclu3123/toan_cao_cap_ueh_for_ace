import mongoose from 'mongoose';

const webhookEventSchema = new mongoose.Schema({
  fingerprint: { type: String, required: true, unique: true, index: true },
  provider: { type: String, enum: ['PAYOS'], default: 'PAYOS' },
  orderCode: { type: Number, required: true, index: true },
  checksumVerified: { type: Boolean, required: true },
  status: {
    type: String,
    enum: ['PROCESSED', 'REJECTED'],
    required: true
  },
  reason: { type: String, default: null },
  eventSummary: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.model('WebhookEvent', webhookEventSchema);
