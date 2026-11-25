import mongoose from 'mongoose';
const options = { timestamps:true, autoCreate:false, autoIndex:false };
const delivery = new mongoose.Schema({
  key:{type:String,required:true,unique:true}, recipientId:String, email:String,
  kind:{type:String,required:true}, payload:{type:mongoose.Schema.Types.Mixed,required:true},
  category:{type:String,enum:['transactional','promotion'],default:'transactional'},
  state:{type:String,enum:['PENDING','SENDING','SENT','FAILED','SUPPRESSED','REVIEW'],default:'PENDING'},
  attempts:{type:Number,default:0}, nextAt:{type:Date,default:Date.now}, leaseUntil:Date, leaseToken:String,
  firstAttemptAt:Date, sentAt:Date, providerId:String, errorCode:String,
  envelope:mongoose.Schema.Types.Mixed
},options);
delivery.index({state:1,nextAt:1,leaseUntil:1});
const preference = new mongoose.Schema({
  userId:{type:String,unique:true,required:true}, promotions:{type:Boolean,default:false},
  community:{type:Boolean,default:true}, articles:{type:Boolean,default:true},
  reminders:{type:Boolean,default:false}, weekly:{type:Boolean,default:false}, promotionConsentedAt:Date
},options);
const state = new mongoose.Schema({key:{type:String,unique:true,required:true},startedAt:Date,cursors:mongoose.Schema.Types.Mixed},options);
const campaign = new mongoose.Schema({
  key:{type:String,required:true,unique:true}, leaseUntil:Date, leaseToken:String,
  title:{type:String,required:true,maxlength:160}, message:{type:String,required:true,maxlength:1800},
  link:{type:String,required:true}, courseId:String,
  channel:{type:String,enum:['web','promotion'],required:true},
  kind:{type:String,enum:['course_update','new_article'],required:true},
  actorId:{type:String,required:true}, state:{type:String,enum:['QUEUED','DONE'],default:'QUEUED'},
  cursor:String, recipients:{type:Number,default:0}
},options);
export const EmailDelivery=mongoose.model('EmailDelivery',delivery);
export const NotificationPreference=mongoose.model('NotificationPreference',preference);
export const NotificationRuntime=mongoose.model('NotificationRuntime',state);
export const NotificationCampaign=mongoose.model('NotificationCampaign',campaign);
const notice=new mongoose.Schema({key:{type:String,required:true,unique:true},recipientId:{type:String,required:true},kind:{type:String,enum:['refund_confirmed','access_changed'],required:true},payload:mongoose.Schema.Types.Mixed,actorId:String},options);
export const NotificationAccountNotice=mongoose.model('NotificationAccountNotice',notice);
