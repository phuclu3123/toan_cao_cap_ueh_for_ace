import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output=new URL('../../artifacts/color-refinement/support/',import.meta.url);await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
await context.addInitScript(()=>{
  localStorage.setItem('ueh_tcc_consent_v1',JSON.stringify({version:1,necessary:true,preferences:false}));
  const callbacks=new Map();let counter=0;
  window.turnstile={render(_node,options){const id=++counter;callbacks.set(id,options.callback);queueMicrotask(()=>options.callback('fixture-only-token'));return id;},remove(id){callbacks.delete(id);},reset(id){queueMicrotask(()=>callbacks.get(id)?.('fixture-only-token'));}};
});
let payment,creates=[],failOnce=false,reads=0;
await context.route('**/api/support/payments**',async route=>{
  const request=route.request(),path=new URL(request.url()).pathname;
  let body={success:true,data:payment};
  if(request.method()==='POST' && path.endsWith('/payments')) {
    const submitted=request.postDataJSON();creates.push({body:submitted,token:request.headers()['x-support-token']});
    if(failOnce) {failOnce=false;return route.fulfill({status:503,json:{success:false,message:'PayOS đang gián đoạn, vui lòng thử lại.'}});}
    payment={orderCode:8179480000000101,amount:submitted.amount,status:'PENDING',checkoutUrl:'https://pay.payos.vn/web/fixture-only',qrCode:'fixture-only-qr',expiresAt:new Date(Date.now()+1800000).toISOString()};body={success:true,data:payment};
  } else if(path.endsWith('/cancel')) {payment={...payment,status:payment.status==='PAID'?'PAID':'CANCELLED'};body={success:true,data:payment};}
  else reads++;
  return route.fulfill({json:body});
});
const page=await context.newPage(),report={checks:[],errors:[],provider:'mocked; no real payment links or money movement'};
page.on('pageerror',error=>report.errors.push(error.message));
const shot=async name=>page.locator('.support-dialog').screenshot({path:fileURLToPath(new URL(`${name}.png`,output))});
try {
  await page.goto('http://localhost:5174');await page.locator('.footer-support').click();
  const dialog=page.locator('.support-dialog');await dialog.waitFor();assert.equal(await dialog.evaluate(node=>node.open),true);
  await shot('choose-light');
  await page.getByRole('button',{name:'20.000',exact:false}).click();
  await page.getByRole('button',{name:/^Ủng hộ 20/}).click();
  await page.locator('.support-qr img').waitFor();assert.equal(creates.length,1);assert.match(creates[0].token,/^[a-f0-9]{64}$/);assert.equal(creates[0].body.amount,20000);
  assert.equal(await page.getByRole('link',{name:'Mở PayOS'}).getAttribute('href'),'https://pay.payos.vn/web/fixture-only');
  await shot('qr-pending-mocked');
  await page.getByRole('button',{name:'Đóng cửa sổ ủng hộ',exact:true}).click();await page.locator('.footer-support').click();
  await page.locator('.support-qr img').waitFor();assert.equal(creates.length,1);assert.ok(reads>0);
  await page.getByRole('button',{name:'Đổi số tiền',exact:true}).click();await page.locator('#support-amount').waitFor();
  assert.equal(creates.length,1);
  failOnce=true;await page.getByRole('button',{name:/^Ủng hộ 20/}).click();await page.getByRole('alert').filter({hasText:'PayOS đang gián đoạn'}).waitFor();
  const retryToken=creates.at(-1).token;await page.getByRole('button',{name:/^Ủng hộ 20/}).click();await page.locator('.support-qr img').waitFor();assert.equal(creates.at(-1).token,retryToken);
  payment={...payment,status:'PAID'};await page.getByRole('button',{name:'Kiểm tra giao dịch',exact:true}).click();await page.getByText('Đã nhận được ủng hộ.',{exact:true}).waitFor();await shot('confirmed-mocked');
  await page.getByRole('button',{name:'Hoàn tất',exact:true}).click();assert.equal(await dialog.count(),0);
  const stored=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('ueh_tcc_support_session_v1')));assert.ok(stored.orderCode);assert.equal(stored.status,undefined);
  payment={...payment,status:'PENDING'};
  const returned=await context.newPage();await returned.goto(`http://localhost:5174/?supportOrder=${payment.orderCode}`);await returned.locator('.support-qr img').waitFor();assert.equal(creates.length,3);await returned.close();
  await page.goto(`http://localhost:5174/?supportOrder=${payment.orderCode}&status=PAID`);await page.locator('.support-qr img').waitFor();assert.equal(await page.getByText('Đã nhận được ủng hộ.',{exact:true}).count(),0);
  await page.keyboard.press('Escape');assert.equal(await dialog.count(),0);
  await page.locator('.footer-support').click();await page.locator('.support-qr img').waitFor();
  await page.setViewportSize({width:390,height:844});await shot('mobile-mocked');
  assert.ok(await dialog.evaluate(node=>node.scrollWidth<=node.clientWidth+1));
  await page.keyboard.press('Escape');await page.setViewportSize({width:1440,height:1000});await page.locator('.nav-controls .theme-toggle-btn').click();await page.locator('.footer-support').click();await page.locator('.support-qr img').waitFor();await shot('dark-mocked');
  report.checks.push('Choose amount, generate QR and allowlisted PayOS link.','Close/reopen and return in another tab resume the same order without another create.','Change amount first confirms cancellation.','Network failure retry reuses the private idempotency token.','Only backend PAID yields success; URL status=PAID is ignored.','Escape, focus restoration, mobile overflow and light/dark layout checked.');
  assert.deepEqual(report.errors,[]);report.status='passed';
} catch(error) {report.status='failed';report.failure=error.stack;process.exitCode=1;await page.screenshot({path:fileURLToPath(new URL('failure.png',output))});}
finally {await writeFile(new URL('report.json',output),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report,null,2));}
