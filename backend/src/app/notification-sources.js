// Composition adapters: source modules retain their business writes. The inbox
// projects committed records, with persistent cursors and deterministic keys.
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import User from '../modules/identity/persistence/User.js';
import Payment from '../modules/commerce/payments/persistence/Payment.js';
import SupportPayment from '../modules/commerce/payments/persistence/SupportPayment.js';
import Enrollment from '../modules/access/persistence/Enrollment.js';
import CourseAccessAudit from '../modules/access/persistence/CourseAccessAudit.js';
import Message from '../modules/contact/persistence/Message.js';
import CommunityPost from '../modules/community/persistence/CommunityPost.js';
import { NotificationCampaign,NotificationPreference,NotificationRuntime,NotificationAccountNotice } from '../modules/notifications/persistence/Delivery.js';
import { getCourseOffering } from '../modules/learning/index.js';

const identity=user=>user?.id || user?.uid || (user?String(user._id):'');
const aliases=user=>[user?.id,user?.uid,user?.firebaseUid,user?.githubId,user?.username,user?String(user._id):''].filter(Boolean);
async function account(value) {
  if(!value) return null;
  return User.findOne({$or:[{id:value},{uid:value},{firebaseUid:value},{githubId:value},{username:String(value).toLowerCase()},...(mongoose.isValidObjectId(value)?[{_id:value}]:[])]}).select('id uid username name firebaseUid githubId').lean();
}
const toEvent=(key,kind,user,payload,options={})=>({key,kind,recipientId:identity(user),email:user?.username,payload,mail:true,...options});
const coursePayload=courseId=>({courseId,courseTitle:getCourseOffering(courseId)?.title || 'Khóa học α∫M4A'});
const adminEmail=()=>process.env.NOTIFICATION_ADMIN_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim();
let indexedDatabase;
export async function initializeNotificationSources() {
  if(indexedDatabase===mongoose.connection.db) return;
  for(const [model,field] of [[User,'updatedAt'],[Payment,'updatedAt'],[SupportPayment,'updatedAt'],[Enrollment,'updatedAt'],[CommunityPost,'updatedAt'],[CourseAccessAudit,'createdAt'],[Message,'createdAt'],[NotificationAccountNotice,'createdAt'],[Payment,'verifiedPaidAt']]) {
    await model.collection.createIndex({[field]:1,_id:1});
  }
  await Message.collection.createIndex({submissionKey:1},{unique:true,partialFilterExpression:{submissionKey:{$type:'string'}}});
  indexedDatabase=mongoose.connection.db;
}
function source(name,model,project,{field='updatedAt',select='',delay=2000}={}) {
  return {name,async read(cursor,startedAt) {
    const upper=new Date(Date.now()-delay),at=new Date(cursor.at);
    if(upper<at) return {events:[],cursor};
    const lower=cursor.id?{$or:[{[field]:{$gt:at}},{[field]:at,_id:{$gt:cursor.id}}]}:{[field]:{$gte:at}};
    const rows=await model.find({$and:[lower,{[field]:{$lte:upper}}]}).select(select).sort({[field]:1,_id:1}).limit(100).lean();
    const events=[];
    for(const row of rows) events.push(...await project(row,startedAt));
    const last=rows.at(-1);
    return {events,cursor:rows.length===100?{at:last[field],id:String(last._id)}:{at:new Date(Math.max(+new Date(startedAt),+upper-300000)),id:null}};
  }};
}
export const notificationSources=[
  source('freeAccess',Enrollment,async(row,startedAt)=>{
    if(row.status!=='ACTIVE' || row.source!=='FREE' || new Date(row.grantedAt)<new Date(startedAt)) return [];
    const user=await account(row.userId);return user?[toEvent(`free-access:${row._id}`,'enrollment_granted',user,{...coursePayload(row.courseId),source:'FREE',occurredAt:row.grantedAt})]:[];
  }),
  source('paidAccess',Enrollment,async(row,startedAt)=>{
    if(row.status!=='ACTIVE' || row.source!=='PAYOS') return [];
    const payment=await Payment.findOne({orderCode:row.paymentOrderCode,status:'PAID'}).lean();
    const user=await account(row.userId);if(!payment || !user || !payment.verifiedPaidAt || new Date(payment.verifiedPaidAt)<new Date(startedAt)) return [];
    return [toEvent(`payment:${payment.orderCode}:paid`,'payment_paid',user,{...coursePayload(row.courseId),orderCode:payment.orderCode,amount:payment.amount,reference:payment.reference,occurredAt:payment.paidAt || row.updatedAt})];
  }),
  source('accountNotices',NotificationAccountNotice,async row=>{
    const user=await account(row.recipientId);return user?[toEvent(`account-notice:${row.key}`,row.kind,user,{...row.payload,occurredAt:row.createdAt})]:[];
  },{field:'createdAt'}),
  source('orders',Payment,async(payment,startedAt)=>{
    if(!['PAID','CANCELLED','FAILED'].includes(payment.status)) return [];
    const user=await account(payment.userId);if(!user) return [];
    const payload={...coursePayload(payment.courseId),orderCode:payment.orderCode,amount:payment.amount,status:payment.status,reference:payment.reference,occurredAt:payment.updatedAt};
    if(payment.status==='PAID') {
      if(!payment.verifiedPaidAt || new Date(payment.verifiedPaidAt)<new Date(startedAt)) return [];
      const access=await Enrollment.findOne({userId:payment.userId,courseId:payment.courseId}).lean();
      if(access?.status!=='ACTIVE') return [];
      return [toEvent(`payment:${payment.orderCode}:paid`,'payment_paid',user,payload)];
    }
    // A create cooldown/timeout is not proof of a failed bank payment.
    if(!payment.providerStatusCheckedAt || !payment.paymentLinkId || new Date(payment.createdAt)<new Date(startedAt)) return [];
    return [toEvent(`payment:${payment.orderCode}:closed`,'payment_closed',user,payload)];
  },{select:'-webhookData -qrCode -checkoutUrl'}),
  source('paidProofs',Payment,async payment=>{
    const access=await Enrollment.findOne({userId:payment.userId,courseId:payment.courseId}).lean();
    if(access?.status==='ACTIVE' || access?.status==='REVOKED') return [];
    const user=await account(payment.userId),payload={...coursePayload(payment.courseId),orderCode:payment.orderCode,amount:payment.verifiedPaidAmount,occurredAt:payment.verifiedPaidAt};
    const admin=await account(adminEmail());
    return [toEvent(`payment:${payment.orderCode}:pending-access`,'payment_pending_access',user,payload),
      {...toEvent(`payment:${payment.orderCode}:admin-alert`,'payment_access_alert',admin,{...payload,link:'/notifications/admin'}),email:adminEmail(),web:Boolean(admin)}];
  },{field:'verifiedPaidAt',delay:120000,select:'orderCode userId courseId verifiedPaidAmount verifiedPaidAt'}),
  source('access',CourseAccessAudit,async audit=>{
    const kind={REDEEM:'enrollment_granted',GRANT:'enrollment_granted',RESTORE:'enrollment_restored',REVOKE:'enrollment_revoked'}[audit.action];if(!kind) return [];
    const user=await account(audit.userId);if(!user) return [];
    return [toEvent(`access:${audit._id}`,kind,user,{...coursePayload(audit.courseId),source:audit.action==='REDEEM'?'KEY':'ADMIN',reason:audit.reason,occurredAt:audit.createdAt})];
  },{field:'createdAt'}),
  source('support',SupportPayment,async payment=>{
    if(payment.status!=='PAID' || (!payment.userId && !payment.receiptEmail)) return [];
    const user=payment.userId?await account(payment.userId):null;
    return [{...toEvent(`support:${payment.orderCode}:paid`,'support_paid',user,{amount:payment.amount,orderCode:payment.orderCode,occurredAt:payment.paidAt || payment.updatedAt}),email:payment.receiptEmail}];
  },{select:'-tokenHash -qrCode -checkoutUrl'}),
  source('contacts',Message,async row=>{
    const admin=await account(adminEmail());
    return [
    {key:`contact:${row.id}:received`,kind:'contact_received',email:row.email,mail:true,web:false,payload:{name:row.name,subject:row.subject,occurredAt:row.createdAt}},
    {...toEvent(`contact:${row.id}:admin`,'contact_admin',admin,{name:row.name,email:row.email,phone:row.phone,subject:row.subject,message:row.message,link:'/notifications/admin',occurredAt:row.createdAt}),email:adminEmail(),web:Boolean(admin)}
  ];},{field:'createdAt'}),
  source('security',User,async(user,startedAt)=>{
    const events=[];
    for(const event of user.notificationEvents || []) {
      if(new Date(event.at)<new Date(startedAt)) continue;
      events.push(toEvent(`security:${event.id}:current`,event.kind,user,{occurredAt:event.at,link:'/'}));
      if(event.previousEmail && event.previousEmail!==user.username) events.push({...toEvent(`security:${event.id}:previous`,event.kind,user,{occurredAt:event.at}),email:event.previousEmail,web:false});
    }
    return events;
  },{select:'id uid username +notificationEvents'}),
  source('community',CommunityPost,async(post,startedAt)=>{
    const events=[];
    for(const e of post.notificationEvents || []) {
      if(new Date(e.at)<new Date(startedAt)) continue;
      for(const recipient of e.recipients || []) {
        const user=await account(recipient);if(!user || aliases(user).includes(e.actor?.id)) continue;
        events.push(toEvent(`community:${e.id}:${identity(user)}`,e.kind,user,{postId:post.id,postTitle:post.title,actorName:e.actor?.name,targetId:e.targetId,link:`/community/${encodeURIComponent(post.id)}#${e.anchor}`,occurredAt:e.at},{mail:false,preference:'community',actor:e.actor}));
      }
    }
    return events;
  },{select:'id title +notificationEvents'})
];

export async function validateNotificationDelivery(job) {
  if(!['payment_pending_access','payment_access_alert','payment_closed'].includes(job.kind)) return true;
  const payment=await Payment.findOne({orderCode:job.payload.orderCode}).select('status verifiedPaidAt userId courseId').lean();
  if(!payment) return false;
  if(job.kind==='payment_closed') return payment.status!=='PAID' && !payment.verifiedPaidAt;
  const access=await Enrollment.findOne({userId:payment.userId,courseId:payment.courseId}).select('status').lean();
  return !['ACTIVE','REVOKED'].includes(access?.status);
}

export async function expandNotificationCampaigns(queue) {
  for(let batch=0;batch<3;batch++) {
    const token=randomUUID();
    const campaign=await NotificationCampaign.findOneAndUpdate({state:'QUEUED',$or:[{leaseUntil:{$exists:false}},{leaseUntil:{$lt:new Date()}}]},{$set:{leaseUntil:new Date(Date.now()+300000),leaseToken:token}},{sort:{createdAt:1},returnDocument:'after'}).lean();
    if(!campaign) break;
    const filter={createdAt:{$lte:campaign.createdAt},...(campaign.cursor?{_id:{$gt:campaign.cursor}}:{})};
    const users=await User.find(filter).sort({_id:1}).limit(100).select('id uid username').lean();
    for(const user of users) {
      if(campaign.courseId && !await Enrollment.exists({userId:identity(user),courseId:campaign.courseId,status:'ACTIVE'})) continue;
      await queue(toEvent(`campaign:${campaign._id}:${identity(user)}`,campaign.kind,user,{title:campaign.title,message:campaign.message,link:campaign.link,courseId:campaign.courseId,occurredAt:campaign.createdAt},{mail:campaign.channel==='promotion',category:campaign.channel==='promotion'?'promotion':'transactional',preference:campaign.kind==='new_article'?'articles':null}));
    }
    await NotificationCampaign.updateOne({_id:campaign._id,leaseToken:token},{$set:{cursor:users.length?String(users.at(-1)._id):campaign.cursor,state:users.length<100?'DONE':'QUEUED'},$inc:{recipients:users.length},$unset:{leaseUntil:1,leaseToken:1}});
  }
}
export async function generateStudyReminders(queue,startedAt) {
  const state=await NotificationRuntime.findOne({key:'reminders'}).lean();
  const rows=await NotificationPreference.find({$or:[{reminders:true},{weekly:true}],...(state?.cursors?.id?{_id:{$gt:state.cursors.id}}:{})}).sort({_id:1}).limit(100).lean();
  const day=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Ho_Chi_Minh'}),week=Math.floor(Date.now()/(7*86400000));
  for(const pref of rows) {
    const user=await account(pref.userId);if(!user) continue;
    const activeCourses=await Enrollment.countDocuments({userId:pref.userId,status:'ACTIVE'});if(!activeCourses) continue;
    if(pref.reminders && Date.now()-new Date(startedAt).getTime()>86400000) await queue(toEvent(`study:${day}:${pref.userId}`,'study_reminder',user,{link:'/courses'},{mail:false,preference:'reminders'}));
    if(pref.weekly && Date.now()-new Date(startedAt).getTime()>7*86400000) {
      const since=new Date(Date.now()-7*86400000),ids=aliases(user);
      const [posts,discussions]=await Promise.all([
        CommunityPost.countDocuments({origin:'community','author.id':{$in:ids},createdAt:{$gte:since}}),
        CommunityPost.countDocuments({origin:'community',answers:{$elemMatch:{'author.id':{$in:ids},createdAt:{$gte:since}}}})
      ]);
      await queue(toEvent(`weekly:${week}:${pref.userId}`,'weekly_summary',user,{activeCourses,posts,discussions,link:'/community'},{mail:false,preference:'weekly'}));
    }
  }
  await NotificationRuntime.updateOne({key:'reminders'},{$set:{cursors:{id:rows.length===100?String(rows.at(-1)._id):null}}},{upsert:true});
}
