import mongoose from 'mongoose';
import Payment from '../persistence/Payment.js';
import { PromotionReservation } from '../../persistence/CourseCommerce.js';
import { releaseFailedPromotion } from '../../application/courseCommerceService.js';
import { cancelManagedOrder, getPayOSConfig, reconcileManagedOrder } from '../application/paymentService.js';

const PENDING = ['CREATING', 'PENDING'];
const MAX_BACKOFF_MS = 60 * 60 * 1000;
let maintenanceTimer = null;

export const maintenanceRetryDelay = failures => Math.min(MAX_BACKOFF_MS, 60_000 * 2 ** Math.min(6, Math.max(1, failures)));

// Injectable dependencies allow tests without a live bank or database.
export function createCommerceMaintenanceRunner({
  payments = Payment, reservations = PromotionReservation,
  reconcile = reconcileManagedOrder, cancel = cancelManagedOrder,
  release = releaseFailedPromotion, connected = () => mongoose.connection.readyState === 1,
  now = Date.now, logger = console
} = {}) {
  let busy = false;
  return async () => {
    if (busy || !connected()) return;
    busy = true;
    try {
      const pending = await payments.find({
        status: { $in: PENDING },
        $or: [{ maintenanceRetryAt: null }, { maintenanceRetryAt: { $lte: new Date(now()) } }]
      }).sort({ providerStatusCheckedAt: 1, createdAt: 1 }).limit(10).select('orderCode expiresAt maintenanceFailures').lean();
      for (const row of pending) {
        try {
          if (row.expiresAt && +new Date(row.expiresAt) <= now()) await cancel(row.orderCode);
          else await reconcile(row.orderCode);
          if (row.maintenanceFailures) await payments.updateOne({ _id: row._id }, { $unset: { maintenanceFailures: '', maintenanceRetryAt: '' } });
        } catch (error) {
          const failures = Math.min(100, (Number(row.maintenanceFailures) || 0) + 1);
          const retryAt = new Date(now() + Math.max(maintenanceRetryDelay(failures), Math.min(Number(error.retryAfterMs) || 0, MAX_BACKOFF_MS)));
          // A failed provider check is never proof of payment or cancellation.
          // Preserve a PAID webhook that wins this race.
          await payments.updateOne({ _id: row._id, status: { $in: PENDING } }, { $set: { maintenanceRetryAt: retryAt }, $inc: { maintenanceFailures: 1 } });
          logger.warn('[Course order maintenance]', {
            code: typeof error.code === 'string' ? error.code : 'MAINTENANCE_FAILED',
            providerCode: error.providerCode || null,
            providerHttpStatus: error.providerHttpStatus || null,
            retryAt: retryAt.toISOString()
          });
          // A merchant-wide rate limit applies to the remaining orders too.
          if (error.providerHttpStatus === 429) break;
        }
      }
      // Release quota only after an already recorded terminal state.
      const held = await reservations.find({ status: 'RESERVED', expiresAt: { $lte: new Date(now()) } }).limit(20).select('orderCode').lean();
      for (const row of held) {
        const payment = await payments.findOne({ orderCode: row.orderCode }).select('status').lean();
        if (payment && ['CANCELLED', 'FAILED'].includes(payment.status)) await release(row.orderCode);
      }
    } catch (error) {
      logger.warn('[Course order maintenance]', { code: typeof error.code === 'string' ? error.code : 'MAINTENANCE_FAILED' });
    } finally { busy = false; }
  };
}

const run = createCommerceMaintenanceRunner();
export const startCommerceMaintenance = () => {
  if (maintenanceTimer) return stopCommerceMaintenance;
  try { getPayOSConfig(); }
  catch { console.warn('[Course order maintenance] Disabled: PAYOS_NOT_CONFIGURED'); return stopCommerceMaintenance; }
  maintenanceTimer = setInterval(run, 60_000);
  maintenanceTimer.unref?.();
  return stopCommerceMaintenance;
};
export function stopCommerceMaintenance() {
  if (maintenanceTimer) clearInterval(maintenanceTimer);
  maintenanceTimer = null;
}
