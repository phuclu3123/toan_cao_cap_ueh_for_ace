import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderCode: { type: Number, required: true, unique: true },
  userId: { type: String, index: true },
  username: { type: String, index: true },
  courseId: { type: String, index: true },
  idempotencyKey: { type: String },
  amount: { type: Number, required: true, min: 0 },
  pricingSnapshot: { type: mongoose.Schema.Types.Mixed, default: undefined },
  purchaseConsent: { type: mongoose.Schema.Types.Mixed, default: undefined },
  expiresAt: { type: Date, default: undefined },
  requiresReview: { type: Boolean, default: undefined },
  description: { type: String, required: true, maxlength: 25 },
  status: {
    type: String,
    enum: ['CREATING', 'PENDING', 'PAID', 'CANCELLED', 'FAILED'],
    default: 'CREATING',
    index: true
  },
  buyerName: { type: String, maxlength: 100 },
  buyerEmail: { type: String, maxlength: 254 },
  buyerPhone: { type: String, maxlength: 30 },
  paymentLinkId: { type: String, default: null },
  checkoutUrl: { type: String, default: null },
  qrCode: { type: String, default: null },
  reference: { type: String, default: null },
  paidAt: { type: String, default: null },
  providerStatusCheckedAt: { type: Date, default: null },
  maintenanceRetryAt: { type: Date, default: undefined },
  maintenanceFailures: { type: Number, min: 0, default: undefined },
  lastWebhookAt: { type: Date, default: null },
  failureReason: { type: String, default: null },
  // Retained so old documents remain readable. New code deliberately avoids
  // persisting the full webhook because it contains bank-account metadata.
  webhookData: { type: mongoose.Schema.Types.Mixed, select: false }
}, { timestamps: true });

paymentSchema.index({ courseId: 1, status: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, courseId: 1, status: 1, createdAt: -1 });

paymentSchema.index(
  { userId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      userId: { $type: 'string' },
      idempotencyKey: { $type: 'string' }
    }
  }
);

export default mongoose.model('Payment', paymentSchema);
