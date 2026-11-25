import express from 'express';
import { optionalAuth } from '../../../identity/index.js';
import { createRateLimit } from '../../../../platform/http/rateLimit.js';
import { requireTurnstile } from '../../../../platform/http/turnstile.js';
import { normalizePaymentResponse } from '../application/paymentService.js';
import { createSupportPayment, findSupportPayment, reconcileSupportPayment, cancelSupportPayment, MIN_SUPPORT_AMOUNT, MAX_SUPPORT_AMOUNT } from '../application/supportPaymentService.js';
const router=express.Router();
const writeLimit=createRateLimit({namespace:'support-write',windowMs:10*60*1000,max:12});
const readLimit=createRateLimit({namespace:'support-read',windowMs:60*1000,max:60});
const handle=work=>async(req,res)=>{
  res.set('Cache-Control','no-store');
  try { return res.json({success:true,data:await work(req)}); }
  catch(error) {
    const status=error.statusCode || 500;
    if(error.retryAfterMs>0) res.set('Retry-After',String(Math.ceil(error.retryAfterMs/1000)));
    if(error.code==='PAYOS_COOLDOWN') return res.status(status).json({success:false,code:error.code,message:'PayOS đang tạm giới hạn yêu cầu. Bạn hãy chờ rồi thử lại.'});
    if(status>=500) console.error('[Support payment]',{code:error.code || error.name,providerCode:error.providerCode || null,providerHttpStatus:error.providerHttpStatus || null});
    const messages={SUPPORT_STORE_UNAVAILABLE:'Phiên ủng hộ chưa sẵn sàng. Vui lòng tạo lại sau ít giây.',PAYMENT_STORE_UNAVAILABLE:'Chưa kết nối được dữ liệu ủng hộ. Vui lòng thử lại sau.',PAYOS_AUTH_FAILED:'Cổng ủng hộ cần được kiểm tra cấu hình. Vui lòng liên hệ hỗ trợ.',PAYOS_UNAVAILABLE:'Kết nối PayOS đang gián đoạn. Vui lòng thử lại sau.',PAYOS_REJECTED:'PayOS chưa chấp nhận phiên này. Bạn có thể chọn lại số tiền và thử lại.'};
    return res.status(status).json({success:false,code:error.code || 'SUPPORT_UNAVAILABLE',message:status>=500?(messages[error.code] || 'Chưa kết nối được cổng ủng hộ. Vui lòng thử lại.'):error.message});
  }
};
router.get('/api/support/payments/config',(_req,res)=>res.json({success:true,data:{minimum:MIN_SUPPORT_AMOUNT,maximum:MAX_SUPPORT_AMOUNT,configured:Boolean(process.env.PAYOS_CLIENT_ID && process.env.PAYOS_API_KEY && process.env.PAYOS_CHECKSUM_KEY)}}));
router.post('/api/support/payments',writeLimit,optionalAuth,requireTurnstile('support'),handle(createSupportPayment));
router.get('/api/support/payments/:orderCode',readLimit,handle(async req=>normalizePaymentResponse(await reconcileSupportPayment(await findSupportPayment(req)))));
router.post('/api/support/payments/:orderCode/cancel',writeLimit,handle(async req=>normalizePaymentResponse(await cancelSupportPayment(await findSupportPayment(req)))));
export default router;
