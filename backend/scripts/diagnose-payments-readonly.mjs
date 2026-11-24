// Read-only checks: never create/cancel links, grant access, or modify MongoDB.
import dotenv from 'dotenv';
import dns from 'node:dns';
import mongoose from 'mongoose';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createPayOSSignature, safeCompareSignature } from '../src/modules/commerce/payments/application/paymentService.js';

dotenv.config({path:fileURLToPath(new URL('../.env',import.meta.url)),quiet:true});
const servers=(process.env.MONGODB_DNS_SERVERS||process.env.MONGO_DNS_SERVERS||'').split(',').map(x=>x.trim()).filter(Boolean);
if(servers.length)dns.setServers(servers);
const report={at:new Date().toISOString(),readOnly:true,configured:{database:Boolean(process.env.MONGODB_URI||process.env.MONGO_URI||process.env.MONGODB_DIRECT_URI||process.env.MONGO_DIRECT_URI),payos:['PAYOS_CLIENT_ID','PAYOS_API_KEY','PAYOS_CHECKSUM_KEY'].every(key=>Boolean(process.env[key]))},databaseConnected:false,samples:[]};
const support = process.argv.includes('--support');
report.kind = support ? 'support' : 'course';
try {
 for(const uri of [process.env.MONGODB_URI||process.env.MONGO_URI,process.env.MONGODB_DIRECT_URI||process.env.MONGO_DIRECT_URI].filter(Boolean)){
  try {await mongoose.connect(uri,{dbName:process.env.MONGODB_DB_NAME||'UEH_TCC',serverSelectionTimeoutMS:5000,autoIndex:false,autoCreate:false});break;}
  catch {await mongoose.disconnect();}
 }
 if(mongoose.connection.readyState!==1)throw Error('DATABASE_UNAVAILABLE');
 report.databaseConnected=true;
 const payments=mongoose.connection.collection(support ? 'supportpayments' : 'payments');
 report.statusCounts=await payments.aggregate([{$group:{_id:'$status',count:{$sum:1}}}]).toArray();
 const filter={status:{$in: support ? ['CREATING','PENDING','FAILED'] : ['CREATING','PENDING']}};
 const options={projection:{orderCode:1,amount:1,status:1,expiresAt:1,paymentLinkId:1,createdAt:1}};
 const pending=await payments.find(filter,options).sort({createdAt:1}).limit(50).toArray();
 const seen=new Set();
 for(const payment of pending){
  if(seen.has(payment.orderCode))continue;seen.add(payment.orderCode);
  const sample={localStatus:payment.status,expired:Boolean(payment.expiresAt&&+new Date(payment.expiresAt)<Date.now()),hasProviderLink:Boolean(payment.paymentLinkId),safeInteger:Number.isSafeInteger(payment.orderCode)};
  if(report.configured.payos){
   try {
    const response=await fetch(`https://api-merchant.payos.vn/v2/payment-requests/${payment.orderCode}`,{headers:{Accept:'application/json','x-client-id':process.env.PAYOS_CLIENT_ID,'x-api-key':process.env.PAYOS_API_KEY},signal:AbortSignal.timeout(12000)});
    const payload=await response.json();
    Object.assign(sample,{httpStatus:response.status,providerCode:/^[a-zA-Z0-9_-]{1,40}$/.test(payload.code)?payload.code:'INVALID',signed:Boolean(payload.signature),providerStatus:['PAID','PENDING','PROCESSING','CANCELLED','EXPIRED'].includes(payload.data?.status)?payload.data.status:null});
    if(payload.code!=='00')sample.providerDescription=String(payload.desc||'').replace(/[\r\n\t]/g,' ').replace(/\b[^\s@]+@[^\s@]+\b/g,'[email]').replace(/\d{6,}/g,'[number]').slice(0,180);
    if(payload.code==='00'&&payload.data){sample.signatureValid=safeCompareSignature(createPayOSSignature(payload.data,process.env.PAYOS_CHECKSUM_KEY),payload.signature);sample.orderMatches=Number(payload.data.orderCode)===payment.orderCode;sample.amountMatches=Number(payload.data.amount)===payment.amount;}
   } catch {sample.error='PROVIDER_CHECK_UNAVAILABLE';}
  }
  report.samples.push(sample);
 }
} catch(error){report.error=error.message==='DATABASE_UNAVAILABLE'?error.message:'DIAGNOSTIC_FAILED';process.exitCode=1;}
finally{
 await mongoose.disconnect();
 const output=new URL('../../artifacts/backend-acceptance-2026-11-24/',import.meta.url);await mkdir(output,{recursive:true});
 await writeFile(new URL(support ? 'support-readonly.json' : 'payment-readonly.json',output),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
}
