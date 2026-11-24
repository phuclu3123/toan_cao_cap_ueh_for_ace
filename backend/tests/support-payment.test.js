import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import SupportPayment from '../src/modules/commerce/payments/persistence/SupportPayment.js';
import Payment from '../src/modules/commerce/payments/persistence/Payment.js';
import { validateSupportAmount, supportTokenHash, supportReturnUrls, validateSupportProviderData, createSupportPayment, acceptSupportWebhook, reconcileSupportPayment, createSupportStoreInitializer } from '../src/modules/commerce/payments/application/supportPaymentService.js';
import { createPayOSSignature, normalizePaymentResponse } from '../src/modules/commerce/payments/application/paymentService.js';
import { handleWebhook } from '../src/modules/commerce/payments/http/paymentController.js';
const token='a'.repeat(64);
const req=(amount=50000)=>({body:{amount},get:name=>name==='x-support-token'?token:name==='origin'?'http://localhost:5174':''});
const response=()=>({statusCode:200,status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}});
test('donate initializes indexes after connect without reusing a poisoned Model.init promise',async()=>{
  const db={db:{}};let attempts=0;
  const model={db,schema:{indexes:()=>[[{tokenHash:1},{unique:true}]]},init:()=>{throw Error('Cached pre-connect failure');},collection:{createIndex:async()=>{attempts++;if(attempts===1)throw Error('Temporary index outage');}}};
  const original=Object.getOwnPropertyDescriptor(mongoose.connection,'readyState');
  Object.defineProperty(mongoose.connection,'readyState',{configurable:true,value:1});
  try {
    const initialize=createSupportStoreInitializer(model);
    await assert.rejects(initialize(),{code:'SUPPORT_STORE_UNAVAILABLE'});
    await Promise.all([initialize(),initialize()]);assert.equal(attempts,2);
    await initialize();assert.equal(attempts,2);
    db.db={};await initialize();assert.equal(attempts,3);
    assert.equal(SupportPayment.schema.options.autoCreate,false);assert.equal(SupportPayment.schema.options.autoIndex,false);
  } finally {if(original)Object.defineProperty(mongoose.connection,'readyState',original);else delete mongoose.connection.readyState;}
});
function config(t) {
  t.mock.method(SupportPayment.collection,'createIndex',async()=> 'fixture-index');
  const descriptor=Object.getOwnPropertyDescriptor(mongoose.connection,'readyState');
  Object.defineProperty(mongoose.connection,'readyState',{configurable:true,value:1});
  t.after(()=>{if(descriptor) Object.defineProperty(mongoose.connection,'readyState',descriptor);else delete mongoose.connection.readyState;});
  for(const [key,value] of Object.entries({PAYOS_CLIENT_ID:'fixture',PAYOS_API_KEY:'fixture',PAYOS_CHECKSUM_KEY:'fixture',FRONTEND_URL:'https://example.test',NODE_ENV:'test'})) {const previous=process.env[key];process.env[key]=value;t.after(()=>{if(previous===undefined) delete process.env[key];else process.env[key]=previous;});}
}
test('support amounts are bounded integers and receipt tokens are hashed',()=>{
  for(const value of [5000,20000,10000000]) assert.equal(validateSupportAmount(value),value);
  for(const value of [0,-1,4999,10000001,5000.5,'50000',null,NaN]) assert.throws(()=>validateSupportAmount(value),{code:'INVALID_SUPPORT_AMOUNT'});
  assert.match(supportTokenHash(token),/^[a-f0-9]{64}$/);assert.notEqual(supportTokenHash(token),token);
  for(const value of ['',token+'a','b'.repeat(63),null]) assert.throws(()=>supportTokenHash(value));
});
test('callback uses configured site in production and local origin in development',t=>{
  config(t);assert.equal(new URL(supportReturnUrls(req(),123).returnUrl).origin,'http://localhost:5174');
  process.env.NODE_ENV='production';assert.equal(new URL(supportReturnUrls(req(),123).returnUrl).origin,'https://example.test');
  assert.equal(new URL(supportReturnUrls(req(),123).cancelUrl).searchParams.get('supportCancelled'),'1');
});
test('provider reconciliation rejects amount, link, order and incomplete payment mismatches',()=>{
  const payment={orderCode:8123,amount:50000,paymentLinkId:'support-link'};
  const data={orderCode:8123,amount:50000,amountPaid:50000,id:'support-link',status:'PAID'};
  assert.doesNotThrow(()=>validateSupportProviderData(payment,data));
  for(const mutation of [{amount:1},{amountPaid:49999},{id:'another'},{orderCode:123}]) assert.throws(()=>validateSupportProviderData(payment,{...data,...mutation}));
});
test('retry returns the same support order without another provider create request',async t=>{
  config(t);const stored={orderCode:8123,amount:50000,status:'PENDING',tokenHash:supportTokenHash(token)};
  t.mock.method(SupportPayment,'init',async()=>{});t.mock.method(SupportPayment,'findOne',async()=>stored);
  t.mock.method(globalThis,'fetch',()=>{throw Error('Provider must not be called for a retry');});
  const result=await createSupportPayment(req());assert.equal(result.orderCode,8123);assert.equal(result.tokenHash,undefined);
  await assert.rejects(createSupportPayment(req(20000)),{code:'SUPPORT_AMOUNT_CHANGED'});
});
test('new support link signs the server amount and validates provider response',async t=>{
  config(t);let stored,requestCount=0;
  t.mock.method(SupportPayment,'init',async()=>{});t.mock.method(SupportPayment,'findOne',async()=>null);
  t.mock.method(SupportPayment,'create',async row=>(stored={...row,_id:'fixture',status:'CREATING'}));
  t.mock.method(SupportPayment,'findOneAndUpdate',async(_filter,update)=>(stored={...stored,...update.$set}));
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    requestCount++;assert.equal(url,'https://api-merchant.payos.vn/v2/payment-requests');
    const body=JSON.parse(options.body);assert.equal(body.amount,50000);assert.ok(Number.isSafeInteger(body.orderCode));assert.ok(String(body.orderCode).startsWith('8'));
    const signed={amount:body.amount,cancelUrl:body.cancelUrl,description:body.description,orderCode:body.orderCode,returnUrl:body.returnUrl};assert.equal(body.signature,createPayOSSignature(signed,'fixture'));
    const data={orderCode:body.orderCode,amount:body.amount,status:'PENDING',paymentLinkId:'support-link',checkoutUrl:'https://pay.payos.vn/web/fixture',qrCode:'fixture-qr'};
    return new Response(JSON.stringify({code:'00',data,signature:createPayOSSignature(data,'fixture')}),{status:200});
  });
  const result=await createSupportPayment(req());assert.equal(result.status,'PENDING');assert.equal(result.amount,50000);assert.equal(requestCount,1);assert.equal(result.tokenHash,undefined);
});
test('signed support webhook is idempotent and never touches course orders',async t=>{
  config(t);const stored={_id:'fixture',orderCode:8123,amount:50000,status:'PENDING',paymentLinkId:'support-link'};let updates=0;
  t.mock.method(SupportPayment,'findOne',async()=>stored);
  t.mock.method(SupportPayment,'updateOne',async(filter,update)=>{if(stored.status!==filter.status.$ne) {Object.assign(stored,update.$set);updates++;}});
  t.mock.method(Payment,'findOne',()=>{throw Error('Support must not grant course access');});
  const data={orderCode:8123,amount:50000,paymentLinkId:'support-link',code:'00',reference:'fixture'};
  const body={success:true,code:'00',data,signature:createPayOSSignature(data,'fixture')};
  const first=response();await handleWebhook({body},first);assert.equal(first.body.success,true);assert.equal(stored.status,'PAID');
  await handleWebhook({body},response());assert.equal(updates,1);
  const forged={...body,signature:'0'.repeat(64)};const invalid=response();await handleWebhook({body:forged},invalid);assert.equal(invalid.statusCode,400);
  const mismatch=await acceptSupportWebhook({...body,data:{...data,amount:1}});assert.equal(mismatch.reason,'AMOUNT_MISMATCH');assert.equal(stored.status,'PAID');
  const result=normalizePaymentResponse({...stored,tokenHash:'private'});assert.equal(result.tokenHash,undefined);
});
test('a verified provider PAID status settles support without course fulfillment',async t=>{
  config(t);let stored={_id:'fixture',orderCode:8123,amount:50000,status:'PENDING',paymentLinkId:'support-link'};
  t.mock.method(SupportPayment,'findOneAndUpdate',async(_filter,update)=>(stored={...stored,...update.$set}));
  t.mock.method(globalThis,'fetch',async()=>{const data={id:'support-link',orderCode:8123,amount:50000,amountPaid:50000,status:'PAID',transactions:[{reference:'fixture',transactionDateTime:'2026-11-24T12:00:00Z'}]};return new Response(JSON.stringify({code:'00',data,signature:createPayOSSignature(data,'fixture')}));});
  const paid=await reconcileSupportPayment(stored);assert.equal(paid.status,'PAID');assert.equal(paid.reference,'fixture');
});
