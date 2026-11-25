import express from 'express';
import mongoose from 'mongoose';
import { requireAuth,hasOwnerRole,findRegisteredAccountByEmail } from '../../identity/index.js';
import { getCourseOffering } from '../../learning/index.js';
import { findPaidNotificationOrder } from '../../commerce/index.js';
import { createRateLimit } from '../../../platform/http/rateLimit.js';
import { EmailDelivery,NotificationCampaign,NotificationAccountNotice,NotificationRuntime } from '../persistence/Delivery.js';
import { getPreferences,savePreferences,verifyUnsubscribeToken,initializeNotificationDelivery } from '../application/delivery.js';
import { deliveryReadiness } from '../integrations/mailTransport.js';
import { escapeHtml,safePath } from '../application/templates.js';
const router=express.Router();
router.use('/notification-email/unsubscribe',createRateLimit({namespace:'notification-unsubscribe',windowMs:60000,max:30}));
const handle=fn=>async(req,res,next)=>{try { await fn(req,res); } catch(error) { next(error); }};
const signedUnsubscribe=async(req,res,confirm)=>{
  const userId=verifyUnsubscribeToken(req.query.token);
  res.set('Cache-Control','no-store');res.set('Referrer-Policy','no-referrer');
  if(!userId) return res.status(400).send('Liên kết ngừng nhận email không hợp lệ.');
  if(mongoose.connection.readyState!==1) return res.status(503).send('Chưa lưu được tùy chọn. Vui lòng thử lại sau.');
  await initializeNotificationDelivery();
  if(confirm) { await savePreferences(userId,{promotions:false});return res.type('html').send('<meta charset="utf-8"><p>Đã ngừng nhận email giới thiệu khóa học. Email giao dịch và bảo mật vẫn được gửi khi cần.</p>'); }
  return res.type('html').send(`<meta charset="utf-8"><title>Ngừng nhận giới thiệu khóa học</title><form method="post" action="?token=${escapeHtml(req.query.token)}"><p>Bạn muốn ngừng nhận email giới thiệu khóa học từ α∫M4A?</p><button type="submit">Ngừng nhận</button></form>`);
};
router.get('/notification-email/unsubscribe',handle((req,res)=>signedUnsubscribe(req,res,false)));
router.post('/notification-email/unsubscribe',handle((req,res)=>signedUnsubscribe(req,res,true)));
router.use(['/notification-settings','/notification-admin'],requireAuth,createRateLimit({namespace:'notification-settings',windowMs:60000,max:50,keyGenerator:req=>req.authUser.id}),(_req,res,next)=>{res.set('Cache-Control','private, no-store');if(mongoose.connection.readyState!==1) return res.status(503).json({success:false,message:'Hệ thống thông báo chưa sẵn sàng.'});next();});
router.use(['/notification-settings','/notification-admin'],async(_req,res,next)=>{
  try {await initializeNotificationDelivery();next();}
  catch {res.status(503).json({success:false,message:'Hệ thống thông báo chưa chuẩn bị xong dữ liệu. Vui lòng thử lại sau.'});}
});
router.get('/notification-settings',handle(async(req,res)=>{
  if(req.query.accountId!==req.authUser.id) return res.status(409).json({success:false,code:'AUTH_SESSION_CHANGED',message:'Tài khoản đã thay đổi. Tải lại cài đặt thông báo.'});
  res.json({success:true,data:await getPreferences(req.authUser.id)});
}));
router.put('/notification-settings',handle(async(req,res)=>{
  if(req.body.accountId!==req.authUser.id) return res.status(409).json({success:false,code:'AUTH_SESSION_CHANGED',message:'Tài khoản đã thay đổi. Tải lại cài đặt thông báo.'});
  const {accountId,...patch}=req.body;
  res.json({success:true,data:await savePreferences(accountId,patch)});
}));
router.use('/notification-admin',(req,res,next)=>hasOwnerRole(req.authUser)?next():res.status(403).json({success:false,message:'Chỉ quản trị viên chính được vận hành thông báo.'}));
router.get('/notification-admin',handle(async(req,res)=>{
  const page=Math.max(1,Number.parseInt(req.query.page,10)||1),filter={};
  if(['PENDING','SENDING','SENT','FAILED','REVIEW','SUPPRESSED'].includes(req.query.state)) filter.state=req.query.state;
  const [items,total,counts,campaigns,runtime]=await Promise.all([EmailDelivery.find(filter).select('key recipientId email kind category state attempts sentAt errorCode createdAt payload.orderCode payload.courseTitle providerId').sort({createdAt:-1}).skip(Math.min(page-1,10000)*25).limit(25).lean(),EmailDelivery.countDocuments(filter),EmailDelivery.aggregate([{$group:{_id:'$state',count:{$sum:1}}}]),NotificationCampaign.find().sort({createdAt:-1}).limit(20).lean(),NotificationRuntime.findOne({key:'delivery-v1'}).select('startedAt').lean()]);
  res.json({success:true,data:{readiness:deliveryReadiness(),items,total,page,counts,campaigns,startedAt:runtime?.startedAt}});
}));
router.post('/notification-admin/:id/retry',handle(async(req,res)=>{
  if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({success:false,message:'Email không hợp lệ.'});
  // Do not automatically retry ambiguous sends after a crash/SMTP disconnect.
  const job=await EmailDelivery.findOne({_id:req.params.id,state:'FAILED'}).lean();
  if(!job) return res.status(409).json({success:false,message:'Chỉ gửi lại email thất bại xác định. Thư cần đối soát phải được kiểm tra trên nhà cung cấp trước.'});
  if(job.firstAttemptAt && Date.now()-new Date(job.firstAttemptAt)>23*3600000) return res.status(409).json({success:false,message:'Đã quá cửa sổ chống trùng. Kiểm tra Resend trước khi xử lý thủ công.'});
  await EmailDelivery.updateOne({_id:job._id,state:'FAILED'},{$set:{state:'PENDING',attempts:0,nextAt:new Date(),errorCode:null}});
  res.json({success:true});
}));
router.post('/notification-admin/campaigns',handle(async(req,res)=>{
  const {title,message,link,courseId,channel,kind,key}=req.body;
  if(typeof key!=='string' || !/^[a-f0-9-]{36}$/.test(key)) return res.status(400).json({success:false,message:'Thiếu mã chống tạo trùng. Tải lại biểu mẫu.'});
  if(typeof title!=='string' || !title.trim() || title.length>160 || /[\r\n]/.test(title) || typeof message!=='string' || !message.trim() || message.length>1800 || typeof link!=='string' || link.length>300 || safePath(link)!==link || !['web','promotion'].includes(channel) || !['course_update','new_article'].includes(kind) || (channel==='promotion' && kind!=='course_update') || (courseId && !getCourseOffering(courseId))) return res.status(400).json({success:false,message:'Nội dung giới thiệu không hợp lệ. Chỉ cập nhật khóa học có thể gửi qua email tự chọn.'});
  if(channel==='promotion' && !deliveryReadiness().promotionConfigured) return res.status(409).json({success:false,message:'Cấu hình khóa hủy nhận email trước khi tạo đợt giới thiệu.'});
  const row=await NotificationCampaign.findOneAndUpdate({key},{$setOnInsert:{key,title:title.trim(),message:message.trim(),link,courseId:courseId || undefined,channel,kind,actorId:req.authUser.id}},{upsert:true,returnDocument:'after'}).lean();
  res.status(201).json({success:true,data:row});
}));
router.post('/notification-admin/account-notices',handle(async(req,res)=>{
  const {email,kind,message,courseId,orderCode,reference,amount}=req.body;
  if(!['refund_confirmed','access_changed'].includes(kind) || typeof message!=='string' || message.trim().length<10 || message.length>1800 || !getCourseOffering(courseId) || !Number.isSafeInteger(orderCode) || typeof reference!=='string' || !/^[A-Za-z0-9._-]{4,100}$/.test(reference) || (kind==='refund_confirmed' && (!Number.isSafeInteger(amount) || amount<=0)) || req.body.confirmed!==true) return res.status(400).json({success:false,message:'Cần mã đơn, mã đối soát, lý do và xác nhận thao tác thực tế đã hoàn tất.'});
  const user=await findRegisteredAccountByEmail(String(email || '').trim().toLowerCase());
  if(!user) return res.status(404).json({success:false,message:'Email chưa đăng ký.'});
  const userId=user.id || user.uid || String(user._id);
  const order=await findPaidNotificationOrder(orderCode,userId,courseId);
  if(!order || (kind==='refund_confirmed' && amount>order.amount)) return res.status(409).json({success:false,message:'Đơn đã thanh toán không khớp tài khoản/khóa học hoặc số tiền vượt số tiền đơn.'});
  const key=`${kind}:${orderCode}:${reference}`;
  // This records a manual confirmation only; it never moves money or changes access.
  const row=await NotificationAccountNotice.findOneAndUpdate({key},{$setOnInsert:{key,recipientId:userId,kind,payload:{message:message.trim(),courseId,courseTitle:getCourseOffering(courseId).title,orderCode,reference,amount},actorId:req.authUser.id}},{upsert:true,returnDocument:'after'}).lean();
  res.status(201).json({success:true,data:{id:row._id}});
}));
export default router;
