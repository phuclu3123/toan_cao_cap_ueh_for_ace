import Payment from '../payments/persistence/Payment.js';
export async function findPaidNotificationOrder(orderCode,userId,courseId) {
  return Payment.findOne({orderCode,userId,courseId,status:'PAID'}).select('orderCode amount courseId').lean();
}
