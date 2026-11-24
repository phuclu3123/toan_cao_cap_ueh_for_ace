import crypto from 'node:crypto';
import { shouldMarkCreateFailure } from './paymentService.js';
import SupportPayment from '../persistence/SupportPayment.js';
import { httpError, requireDatabase, getPayOSConfig, createPayOSSignature, verifyPayOSDataSignature, fetchPayOS, fetchPayOSPayment, validatePayOSCreateResponse, persistPayOSCreateResult, normalizePaymentResponse, parseOrderCode, providerStatus, paidAmountIsValid, classifyPayOSWebhook, cleanSingleLine, paymentResultUrls } from './paymentService.js';

export const MIN_SUPPORT_AMOUNT=5000;
export const MAX_SUPPORT_AMOUNT=10000000;
export const validateSupportAmount=value=>{
  if(typeof value!=='number' || !Number.isSafeInteger(value) || value<MIN_SUPPORT_AMOUNT || value>MAX_SUPPORT_AMOUNT) throw httpError(400,'INVALID_SUPPORT_AMOUNT','Chọn số tiền từ 5.000đ đến 10.000.000đ.');
  return value;
};
export const supportTokenHash=value=>{
  if(typeof value!=='string' || !/^[a-f0-9]{64}$/.test(value)) throw httpError(400,'INVALID_SUPPORT_TOKEN','Phiên ủng hộ chưa hợp lệ. Vui lòng mở lại cửa sổ.');
  return crypto.createHash('sha256').update(value).digest('hex');
};
export const supportReturnUrls=(req,orderCode)=>{
  const {returnUrl:configured}=paymentResultUrls();
  let origin=new URL(configured).origin;
  if(process.env.NODE_ENV!=='production') {
    try { const incoming=new URL(req.get('origin'));if(incoming.protocol==='http:' && ['localhost','127.0.0.1'].includes(incoming.hostname)) origin=incoming.origin; } catch { /* Use configured website. */ }
  }
  const target=new URL('/',origin);target.searchParams.set('supportOrder',String(orderCode));
const cancelled=new URL(target);cancelled.searchParams.set('supportCancelled','1');
  return {returnUrl:target.toString(),cancelUrl:cancelled.toString()};
};

export function createSupportStoreInitializer(model=SupportPayment) {
  let database, initialization;
  return async () => {
    requireDatabase();
    if(database!==model.db.db){database=model.db.db;initialization=null;}
    if(!initialization) initialization=(async()=>{
      // bufferCommands=false: never reuse Model.init() rejected before connect.
      // Add missing indexes only; never sync/drop indexes or replace donor data.
      for(const [fields,options] of model.schema.indexes()) await model.collection.createIndex(fields,{...options,maxTimeMS:10000});
    })().catch(()=>{initialization=null;throw httpError(503,'SUPPORT_STORE_UNAVAILABLE','Dữ liệu phiên ủng hộ chưa sẵn sàng. Vui lòng thử lại.');});
    return initialization;
  };
}
export const initializeSupportPayments=createSupportStoreInitializer();

async function reserveSupportPayment(tokenHash,amount) {
  await initializeSupportPayments();
  const existing=await SupportPayment.findOne({tokenHash});
  if(existing) return {payment:existing,reused:true};
  for(let attempt=0;attempt<5;attempt++) {
    // Reserved prefix 8 avoids the existing timestamp-prefixed course orders.
    const orderCode=8000000000000000+Date.now()*100+crypto.randomInt(100);
    try {
      const payment=await SupportPayment.create({orderCode,tokenHash,amount,description:`UH${String(orderCode).slice(-7)}`,expiresAt:new Date(Date.now()+30*60*1000)});
      return {payment,reused:false};
    } catch(error) {
      if(error.code!==11000) throw error;
      const previous=await SupportPayment.findOne({tokenHash});if(previous) return {payment:previous,reused:true};
    }
  }
  throw httpError(503,'SUPPORT_ORDER_UNAVAILABLE','Chưa thể tạo phiên ủng hộ. Vui lòng thử lại.');
}

export async function createSupportPayment(req) {
  const amount=validateSupportAmount(req.body?.amount),tokenHash=supportTokenHash(req.get('x-support-token'));
  requireDatabase();getPayOSConfig();
  const reserved=await reserveSupportPayment(tokenHash,amount);
  let payment=reserved.payment;
  if(payment.amount!==amount) throw httpError(409,'SUPPORT_AMOUNT_CHANGED','Phiên này đã có số tiền khác. Hãy đóng phiên thanh toán trước khi đổi số tiền.');
  if(reserved.reused) return normalizePaymentResponse(payment);
  try {
    const signed={amount:payment.amount,orderCode:payment.orderCode,description:payment.description,...supportReturnUrls(req,payment.orderCode)};
    const {checksumKey}=getPayOSConfig();
    const result=await fetchPayOS('/v2/payment-requests',{method:'POST',body:JSON.stringify({...signed,expiredAt:Math.floor(+payment.expiresAt/1000),signature:createPayOSSignature(signed,checksumKey)})});
    if(!result.data || !verifyPayOSDataSignature(result.data,result.signature,checksumKey)) throw httpError(502,'PAYOS_INVALID_RESPONSE','Chưa xác thực được phản hồi PayOS.');
    payment=await persistPayOSCreateResult(payment,validatePayOSCreateResponse(result.data,payment),SupportPayment);
    return normalizePaymentResponse(payment);
  } catch(error) {
    if(shouldMarkCreateFailure(error)) await SupportPayment.updateOne({_id:payment._id,status:'CREATING'},{$set:{status:'FAILED'}});
    throw error;
  }
}

export async function findSupportPayment(req) {
  const orderCode=parseOrderCode(req.params.orderCode),tokenHash=supportTokenHash(req.get('x-support-token'));
  if(!orderCode) throw httpError(400,'INVALID_ORDER_CODE','Mã giao dịch không hợp lệ.');
  requireDatabase();
  const payment=await SupportPayment.findOne({orderCode,tokenHash});
  if(!payment) throw httpError(404,'SUPPORT_NOT_FOUND','Không tìm thấy phiên ủng hộ trên trình duyệt này.');
  return payment;
}

export const validateSupportProviderData=(payment,data)=>{
  const link=data?.paymentLinkId || data?.id;
  if(Number(data?.amount)!==payment.amount || (data.orderCode!==undefined && Number(data.orderCode)!==payment.orderCode) || !link || (payment.paymentLinkId && link!==payment.paymentLinkId)) throw httpError(409,'SUPPORT_PROVIDER_MISMATCH','Thông tin thanh toán chưa khớp. Vui lòng liên hệ hỗ trợ.');
  if(String(data.status).toUpperCase()==='PAID' && !paidAmountIsValid(payment,data)) throw httpError(409,'SUPPORT_AMOUNT_MISMATCH','Số tiền thanh toán chưa khớp.');
};

export async function reconcileSupportPayment(payment,force=false) {
  if(!['CREATING','PENDING'].includes(payment.status)) return payment;
  const stale=new Date(Date.now()-5000);
  const leased=await SupportPayment.findOneAndUpdate({_id:payment._id,status:{$in:['CREATING','PENDING']},...(force?{}:{$or:[{providerStatusCheckedAt:null},{providerStatusCheckedAt:{$lte:stale}}]})},{$set:{providerStatusCheckedAt:new Date()}},{returnDocument:"after"});
  if(!leased) return await SupportPayment.findById(payment._id) || payment;
  const data=await fetchPayOSPayment(payment.orderCode);validateSupportProviderData(leased,data);
  const status=providerStatus(data.status,leased.status);
  const update={status,paymentLinkId:data.paymentLinkId || data.id};
  if(!leased.checkoutUrl && /^[a-f0-9]{32}$/i.test(update.paymentLinkId)) update.checkoutUrl=`https://pay.payos.vn/web/${update.paymentLinkId}`;
  if(status==='PAID') {
    update.reference=cleanSingleLine(data.reference || data.transactions?.[0]?.reference,160);
    update.paidAt=cleanSingleLine(data.transactions?.[0]?.transactionDateTime,80) || new Date().toISOString();
  }
  return await SupportPayment.findOneAndUpdate({_id:payment._id,status:{$ne:'PAID'}},{$set:update},{returnDocument:"after"}) || await SupportPayment.findById(payment._id);
}

export async function cancelSupportPayment(payment) {
  const current=await reconcileSupportPayment(payment,true);
  if(['PAID','CANCELLED','FAILED'].includes(current.status)) return current;
  try { await fetchPayOS(`/v2/payment-requests/${current.orderCode}/cancel`,{method:'POST',body:JSON.stringify({cancellationReason:'Người ủng hộ đổi số tiền hoặc đóng phiên'})}); }
  catch(error) { const latest=await reconcileSupportPayment(current,true);if(['PAID','CANCELLED'].includes(latest.status)) return latest;throw error; }
  return reconcileSupportPayment(current,true);
}

// Called only after the shared webhook has verified the provider signature.
export async function acceptSupportWebhook(body) {
  const payment=await SupportPayment.findOne({orderCode:parseOrderCode(body?.data?.orderCode)});
  if(!payment) return null;
  const result=classifyPayOSWebhook(body,payment);
  if(result.accepted) await SupportPayment.updateOne({_id:payment._id,status:{$ne:'PAID'}},{$set:{status:'PAID',paymentLinkId:body.data.paymentLinkId,reference:cleanSingleLine(body.data.reference,160),paidAt:cleanSingleLine(body.data.transactionDateTime,80) || new Date().toISOString(),providerStatusCheckedAt:new Date()}});
  return {success:true,ignored:!result.accepted,reason:result.reason};
}
