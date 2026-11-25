import nodemailer from 'nodemailer';
import { getEmailDeliveryConfiguration } from '../../identity/index.js';
import { renderEmail, validEmail } from '../application/templates.js';
export function deliveryReadiness() {
  const {resend,smtp}=getEmailDeliveryConfiguration();
  return {enabled:process.env.NOTIFICATION_EMAIL_ENABLED==='true',provider:resend.enabled?'resend':smtp.enabled?'smtp':null,
    senderConfigured:Boolean(process.env.RESEND_FROM_EMAIL?.trim() || (!resend.enabled && smtp.enabled && smtp.user)),replyToConfigured:validEmail(process.env.NOTIFICATION_REPLY_TO),
    promotionConfigured:Boolean(process.env.NOTIFICATION_UNSUBSCRIBE_SECRET?.trim().length>=32),adminRecipientConfigured:validEmail(process.env.NOTIFICATION_ADMIN_EMAIL || process.env.ADMIN_EMAIL),retryLimit:6};
}
export async function sendNotificationEmail(job,unsubscribeUrl) {
  const {resend,smtp}=getEmailDeliveryConfiguration();
  const message=renderEmail(job.kind,job.payload,{unsubscribeUrl});
  const headers=unsubscribeUrl?{'List-Unsubscribe':`<${unsubscribeUrl}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}:{};
  if(resend.enabled) {
    // Never fall back to another provider after an ambiguous network result.
    if(!process.env.RESEND_FROM_EMAIL?.trim()) throw Object.assign(new Error('SENDER_NOT_CONFIGURED'),{deliveryCode:'SENDER_NOT_CONFIGURED',permanent:true});
    const response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${resend.apiKey}`,'Content-Type':'application/json','Idempotency-Key':job.key},body:JSON.stringify(job.envelope || {from:resend.from,to:[job.email],...message,...(validEmail(process.env.NOTIFICATION_REPLY_TO)?{reply_to:process.env.NOTIFICATION_REPLY_TO}:{}),headers})});
    if(!response.ok) throw Object.assign(new Error('EMAIL_PROVIDER_REJECTED'),{deliveryCode:`RESEND_${response.status}`,review:response.status===409,permanent:response.status>=400 && response.status<500 && ![408,409,429].includes(response.status)});
    return {providerId:(await response.json()).id,provider:'resend'};
  }
  if(!smtp.enabled) throw Object.assign(new Error('EMAIL_NOT_CONFIGURED'),{deliveryCode:'EMAIL_NOT_CONFIGURED'});
  const transporter=nodemailer.createTransport({host:smtp.host,port:smtp.port,secure:smtp.secure,auth:{user:smtp.user,pass:smtp.password},connectionTimeout:10000,socketTimeout:15000});
  try {
    const envelope=job.envelope;
    const result=await transporter.sendMail(envelope?{...envelope,replyTo:envelope.reply_to,messageId:`<${job.key}@m4a-notifications.local>`}:{from:process.env.RESEND_FROM_EMAIL?.trim() || `α∫M4A <${smtp.user}>`,to:job.email,...message,headers,replyTo:process.env.NOTIFICATION_REPLY_TO,messageId:`<${job.key}@m4a-notifications.local>`});
    if(!result.accepted?.length) throw new Error('SMTP_NOT_ACCEPTED');
    return {providerId:result.messageId,provider:'smtp'};
  } catch(error) { throw Object.assign(new Error('SMTP_DELIVERY_UNCERTAIN'),{deliveryCode:'SMTP_DELIVERY_UNCERTAIN',review:true,cause:error}); }
  finally { transporter.close(); }
}
export function prepareEmailEnvelope(job,unsubscribeUrl) {
  const {resend,smtp}=getEmailDeliveryConfiguration();
  return {from:resend.enabled?resend.from:(process.env.RESEND_FROM_EMAIL?.trim() || `α∫M4A <${smtp.user}>`),to:[job.email],...renderEmail(job.kind,job.payload,{unsubscribeUrl}),...(validEmail(process.env.NOTIFICATION_REPLY_TO)?{reply_to:process.env.NOTIFICATION_REPLY_TO}:{}),headers:unsubscribeUrl?{'List-Unsubscribe':`<${unsubscribeUrl}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}:{}};
}
