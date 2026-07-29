import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderCode: { type: Number, required: true, unique: true },
  idempotencyKey: { type: String, unique: true, sparse: true, index: true },
  userId: { type: String, index: true },
  username: { type: String, index: true },
  courseId: { type: String, index: true },
  amount: { type: Number, default: 0 },
  expectedAmount: { type: Number, default: 0 },
  description: { type: String },
  status: {
    type: String,
    enum: ['CREATING', 'PENDING', 'PAID', 'CANCELLED', 'FAILED'],
    default: 'CREATING',
    index: true
  },
  paymentLinkId: { type: String },
  checkoutUrl: { type: String },
  qrCode: { type: String },
  reference: { type: String },
  paidAt: { type: String },
  webhookVerified: { type: Boolean, default: false },
  providerVerified: { type: Boolean, default: false },
  fulfillmentStatus: {
    type: String,
    enum: ['NOT_READY', 'GRANTED', 'FAILED'],
    default: 'NOT_READY'
  },
  failureReason: { type: String, default: null },
  buyerName: { type: String },
  buyerPhone: { type: String },
  webhookData: { type: mongoose.Schema.Types.Mixed },
  lastWebhookAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
