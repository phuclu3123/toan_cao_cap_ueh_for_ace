// Isolated integration: create one unpaid 5,000 VND QA link, verify and cancel it.
// Never transfer money or alter a course/account; use a separate temporary database.
import crypto from 'node:crypto';
import dns from 'node:dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import SupportPayment from '../src/modules/commerce/payments/persistence/SupportPayment.js';
import '../src/platform/database/db.js';
import { createSupportPayment, reconcileSupportPayment, cancelSupportPayment, supportTokenHash } from '../src/modules/commerce/payments/application/supportPaymentService.js';
dotenv.config({path:fileURLToPath(new URL('../.env',import.meta.url)),quiet:true});
const servers=(process.env.MONGODB_DNS_SERVERS||process.env.MONGO_DNS_SERVERS||'').split(',').map(x=>x.trim()).filter(Boolean);if(servers.length)dns.setServers(servers);
const database=`qa_support_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
const token=crypto.randomBytes(32).toString('hex');
const report={readOnly:false,mainDatabaseModified:false,moneyTransferred:false,linkCreated:false,linkCancelled:false,temporaryDatabaseRemoved:false,checks:[]};
let created=false;
try {
 const uri=process.env.MONGODB_DIRECT_URI||process.env.MONGO_DIRECT_URI||process.env.MONGODB_URI||process.env.MONGO_URI;
 await mongoose.connect(uri,{dbName:database,serverSelectionTimeoutMS:12000});
 if(mongoose.connection.name!==database||!/^qa_support_\d+_[a-f0-9]{8}$/.test(database))throw Error('QA_DATABASE_GUARD');
 created=true;
 const amount=process.argv.includes('--50000')?50000:5000;
 const request={body:{amount},get:name=>name==='x-support-token'?token:name==='origin'?'http://localhost:5173':undefined};
 const order=await createSupportPayment(request);report.linkCreated=true;
 if(!order.qrCode||!order.checkoutUrl||order.status!=='PENDING')throw Error('MISSING_QR');
 report.checks.push(`Real PayOS create returned a verified QR and link for ${amount} VND with bufferCommands=false.`);
 const duplicate=await createSupportPayment(request);if(duplicate.orderCode!==order.orderCode)throw Error('DUPLICATE_ORDER');
 report.checks.push('Retry returns the same donation order.');
 const stored=await SupportPayment.findOne({tokenHash:supportTokenHash(token)});
 const checked=await reconcileSupportPayment(stored,true);if(checked.status!=='PENDING')throw Error('UNEXPECTED_PROVIDER_STATE');
 report.checks.push('Real PayOS status signature, amount and order match.');
 const cancelled=await cancelSupportPayment(checked);report.linkCancelled=cancelled.status==='CANCELLED';
 if(!report.linkCancelled)throw Error('CANCEL_NOT_CONFIRMED');
 report.checks.push('PayOS confirmed cancellation; no money moved.');report.passed=true;
} catch(error){report.passed=false;report.error={code:error.code||error.name,providerCode:error.providerCode||null,providerHttpStatus:error.providerHttpStatus||null};process.exitCode=1;}
finally {
 if(created&&mongoose.connection.readyState===1){
  const remaining=await SupportPayment.findOne({tokenHash:supportTokenHash(token)});
  if(remaining&&report.linkCreated&&!report.linkCancelled){try{report.linkCancelled=(await cancelSupportPayment(remaining)).status==='CANCELLED';}catch{report.cleanupPending=true;}}
  if(!report.cleanupPending&&mongoose.connection.name===database&&/^qa_support_\d+_[a-f0-9]{8}$/.test(database)){await mongoose.connection.dropDatabase();report.temporaryDatabaseRemoved=true;}
 }
 await mongoose.disconnect();
 const out=new URL('../../artifacts/backend-acceptance-2026-11-24/',import.meta.url);await mkdir(out,{recursive:true});await writeFile(new URL('support-provider.json',out),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}
