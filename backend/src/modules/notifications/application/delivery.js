import { createHash,createHmac,timingSafeEqual,randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import UserNotification from '../persistence/UserNotification.js';
import { EmailDelivery,NotificationPreference,NotificationRuntime,NotificationCampaign,NotificationAccountNotice } from '../persistence/Delivery.js';
import { prepareNotificationStore } from './inbox.js';
import { notificationContent,validEmail,notificationApiOrigin } from './templates.js';
import { findRegisteredAccountByEmail } from '../../identity/index.js';
import { sendNotificationEmail,deliveryReadiness,prepareEmailEnvelope } from '../integrations/mailTransport.js';

export const eventKey=value=>createHash('sha256').update(String(value)).digest('hex');
export const defaults={promotions:false,community:true,articles:true,reminders:false,weekly:false};
export async function getPreferences(userId) { return {...defaults,...await NotificationPreference.findOne({userId}).select('-_id -__v').lean()}; }
export async function savePreferences(userId,patch) {
  const allowed=Object.keys(defaults),update={};
  for(const key of Object.keys(patch)) { if(!allowed.includes(key) || typeof patch[key]!=='boolean') throw Object.assign(new Error('Tùy chọn thông báo không hợp lệ.'),{statusCode:400});update[key]=patch[key]; }
  if(patch.promotions===true) update.promotionConsentedAt=new Date();
  await NotificationPreference.updateOne({userId},{$set:update,$setOnInsert:{userId}},{upsert:true});
  return getPreferences(userId);
}
export async function queueNotification(event) {
  const {kind,payload={},recipientId,email,category='transactional',web=true}=event;
  const content=notificationContent(kind,payload),key=eventKey(event.key);
  const prefs=recipientId?await getPreferences(recipientId):defaults;
  const webAllowed=!(event.preference && prefs[event.preference]===false);
  if(web && recipientId && webAllowed) await UserNotification.updateOne({id:key},{$setOnInsert:{id:key,recipientId,type:kind,title:content.title,message:content.message,link:content.link,actor:event.actor,postId:payload.postId,targetId:payload.targetId,isRead:false,dismissedAt:null}},{upsert:true});
  if(!event.mail || !validEmail(email) || (category==='promotion' && !prefs.promotions)) return;
  await EmailDelivery.updateOne({key},{$setOnInsert:{key,recipientId,email:email.trim().toLowerCase(),kind,payload:{...payload,link:content.link},category,state:'PENDING',nextAt:new Date()}},{upsert:true});
}
export function unsubscribeToken(userId) {
  const secret=process.env.NOTIFICATION_UNSUBSCRIBE_SECRET?.trim();
  if(!secret || secret.length<32) throw new Error('UNSUBSCRIBE_NOT_CONFIGURED');
  const payload=Buffer.from(JSON.stringify({userId,scope:'course-promotion'})).toString('base64url');
  return `${payload}.${createHmac('sha256',secret).update(payload).digest('base64url')}`;
}
export function verifyUnsubscribeToken(token) {
  if(typeof token!=='string' || token.length>1200) return null;
  try {
    const [payload,signature,...extra]=token.split('.');if(extra.length) return null;
    const secret=process.env.NOTIFICATION_UNSUBSCRIBE_SECRET?.trim();if(!secret || secret.length<32) return null;
    const expected=createHmac('sha256',secret).update(payload).digest(),actual=Buffer.from(signature,'base64url');
    if(actual.length!==expected.length || !timingSafeEqual(actual,expected)) return null;
    const data=JSON.parse(Buffer.from(payload,'base64url').toString());
    return data.scope==='course-promotion' && typeof data.userId==='string' && data.userId.length<=150?data.userId:null;
  } catch { return null; }
}
let initializedDatabase;
export async function initializeNotificationDelivery() {
  if(mongoose.connection.readyState!==1) return;
  if(initializedDatabase===mongoose.connection.db) return;
  await prepareNotificationStore();
  for(const model of [EmailDelivery,NotificationPreference,NotificationRuntime,NotificationCampaign,NotificationAccountNotice]) {
    try { await model.createCollection(); } catch(error) { if(error.code!==48 && error.codeName!=='NamespaceExists') throw error; }
    await model.createIndexes();
  }
  await NotificationRuntime.updateOne({key:'delivery-v1'},{$setOnInsert:{key:'delivery-v1',startedAt:new Date(),cursors:{}}},{upsert:true});
  initializedDatabase=mongoose.connection.db;
}

export async function dispatchEmailBatch(limit=8,validateDelivery) {
  const readiness=deliveryReadiness();
  if(!readiness.enabled || !readiness.provider || !readiness.senderConfigured) return;
  // Resend deduplicates for 24h. After 23h an ambiguous delivery needs human review.
  await EmailDelivery.updateMany({state:'SENDING',leaseUntil:{$lt:new Date()}},{$set:{state:'REVIEW',errorCode:'WORKER_INTERRUPTED'}});
  for(let i=0;i<limit;i++) {
    const now=new Date(),token=randomUUID();
    const job=await EmailDelivery.findOneAndUpdate({state:'PENDING',nextAt:{$lte:now}},{$set:{state:'SENDING',leaseUntil:new Date(+now+120000),leaseToken:token},$inc:{attempts:1}},{sort:{nextAt:1},returnDocument:'after'}).lean();
    if(!job) break;
    try {
      if(validateDelivery && !await validateDelivery(job)) {
        await EmailDelivery.updateOne({_id:job._id,leaseToken:token},{$set:{state:'SUPPRESSED',errorCode:'STATUS_SUPERSEDED'},$unset:{leaseUntil:1,leaseToken:1}});continue;
      }
      if(job.firstAttemptAt && +now-new Date(job.firstAttemptAt).getTime()>23*3600000) throw Object.assign(new Error('DELIVERY_REVIEW_REQUIRED'),{review:true,deliveryCode:'IDEMPOTENCY_WINDOW_EXPIRED'});
      let unsubscribeUrl;
      if(job.category==='promotion') {
        const prefs=await getPreferences(job.recipientId);
        const account=await findRegisteredAccountByEmail(job.email);
        if(!prefs.promotions || !account || (account.id || account.uid || String(account._id))!==job.recipientId) { await EmailDelivery.updateOne({_id:job._id,leaseToken:token},{$set:{state:'SUPPRESSED',errorCode:'UNSUBSCRIBED_OR_EMAIL_CHANGED'},$unset:{leaseUntil:1,leaseToken:1}});continue; }
        unsubscribeUrl=new URL(`/api/notification-email/unsubscribe?token=${encodeURIComponent(unsubscribeToken(job.recipientId))}`,notificationApiOrigin()).href;
      }
      // Freeze content before the first request so retries keep the same payload
      // even when templates, sender settings or public URLs are updated.
      job.envelope ||= prepareEmailEnvelope(job,unsubscribeUrl);
      await EmailDelivery.updateOne({_id:job._id,leaseToken:token},{$set:{firstAttemptAt:job.firstAttemptAt || now,envelope:job.envelope}});
      const result=await sendNotificationEmail(job,unsubscribeUrl);
      await EmailDelivery.updateOne({_id:job._id,leaseToken:token},{$set:{state:'SENT',sentAt:new Date(),providerId:result.providerId,errorCode:null},$unset:{leaseUntil:1,leaseToken:1}});
    } catch(error) {
      const state=error.review?'REVIEW':error.permanent || job.attempts>=6?'FAILED':'PENDING';
      await EmailDelivery.updateOne({_id:job._id,leaseToken:token},{$set:{state,errorCode:error.deliveryCode || 'DELIVERY_TEMPORARILY_UNAVAILABLE',nextAt:new Date(Date.now()+Math.min(3600000,30000*2**job.attempts))},$unset:{leaseUntil:1,leaseToken:1}});
    }
  }
}

export function startNotificationDelivery({sources,expandCampaigns,reminders,prepareSources,validateDelivery}) {
  let stopped=false,running=false;
  const tick=async()=>{
    if(stopped || running || mongoose.connection.readyState!==1) return;
    running=true;
    try {
      await initializeNotificationDelivery();
      await prepareSources?.();
      const runtime=await NotificationRuntime.findOne({key:'delivery-v1'}).lean();
      for(const source of sources) {
        try {
        const cursor=runtime.cursors?.[source.name] || {at:runtime.startedAt,id:null};
        const result=await source.read(cursor,runtime.startedAt);
        for(const event of result.events) await queueNotification(event);
        await NotificationRuntime.updateOne({key:'delivery-v1'},{$set:{[`cursors.${source.name}`]:result.cursor}});
        } catch(error) { console.error('[Notifications] Deferred source:',source.name,error.code || error.name); }
      }
      try { await expandCampaigns?.(queueNotification); } catch(error) { console.error('[Notifications] Deferred campaign:',error.code || error.name); }
      try { await reminders?.(queueNotification,runtime.startedAt); } catch(error) { console.error('[Notifications] Deferred reminder:',error.code || error.name); }
      await dispatchEmailBatch(8,validateDelivery);
    } catch(error) { console.error('[Notifications] Deferred cycle:',error.code || error.name); }
    finally { running=false; }
  };
  const initial=setTimeout(tick,1000),timer=setInterval(tick,15000);initial.unref?.();timer.unref?.();
  return ()=>{stopped=true;clearTimeout(initial);clearInterval(timer);};
}
