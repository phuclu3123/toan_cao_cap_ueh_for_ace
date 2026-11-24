import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  orderCode: { type: Number, required: true, unique: true },
  tokenHash: { type: String, required: true, unique: true, select: false },
  amount: { type: Number, required: true, min: 5000, max: 10000000 },
  description: { type: String, required: true },
  status: { type: String, enum: ['CREATING','PENDING','PAID','CANCELLED','FAILED'], default: 'CREATING' },
  expiresAt: { type: Date, required: true },
  paymentLinkId: String,
  checkoutUrl: String,
  qrCode: String,
  reference: String,
  paidAt: String,
  providerStatusCheckedAt: { type: Date, default: null }
}, { timestamps: true, autoCreate: false, autoIndex: false });
schema.index({ status: 1, providerStatusCheckedAt: 1 });
export default mongoose.model('SupportPayment',schema);
