import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderCode: { type: Number, required: true, unique: true },
  amount: { type: Number, default: 0 },
  description: { type: String },
  status: { type: String, default: 'PENDING' },
  paymentLinkId: { type: String },
  checkoutUrl: { type: String },
  qrCode: { type: String },
  reference: { type: String },
  paidAt: { type: String },
  webhookData: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
