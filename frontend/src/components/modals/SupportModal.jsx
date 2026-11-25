import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Check, CheckCircle2, ExternalLink, Heart, Loader2, RefreshCw, ShieldCheck, X } from 'lucide-react';
import TurnstileWidget from '../TurnstileWidget';
import { useAuth } from '../../contexts/AuthContext';
import { createSupportToken, readSupportSession, safeSupportCheckout, storeSupportSession, supportRequest } from '../../services/supportPaymentService';
import '../../assets/styles/SupportModal.css';

const money=value=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(value);
const terminal=status=>['PAID','CANCELLED','FAILED'].includes(status);
const amounts=[20000,50000,100000,200000];

export default function SupportModal({onClose,returnedOrder}) {
  const { currentUser } = useAuth();
  const [emailReceipt,setEmailReceipt] = useState(()=>Boolean(readSupportSession()?.emailReceipt));
  const [returnMismatch]=useState(()=>Boolean(returnedOrder && Number(returnedOrder)!==readSupportSession()?.orderCode));
  const [session,setSession]=useState(()=>returnedOrder && Number(returnedOrder)!==readSupportSession()?.orderCode?null:readSupportSession());
  const [amount,setAmount]=useState(()=>readSupportSession()?.amount || 50000);
  const [payment,setPayment]=useState(null);
  const [error,setError]=useState(()=>returnMismatch?'Mã trả về không khớp phiên trên trình duyệt này. Hãy đóng cửa sổ và quay lại trang đã bắt đầu thanh toán.':'');
  const [busy,setBusy]=useState(false);
  const [checking,setChecking]=useState(()=>Boolean(readSupportSession()?.orderCode));
  const [refresh,setRefresh]=useState(0);
  const [qrImage,setQrImage]=useState('');
  const dialogRef=useRef(null),turnstileRef=useRef(null),live=useRef(true),busyRef=useRef(false),closeRef=useRef(onClose);
  const retryAtRef=useRef(0);
  useEffect(()=>{closeRef.current=onClose;},[onClose]);
  useEffect(()=>{
    live.current=true;
    const dialog=dialogRef.current,previous=document.activeElement,overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';dialog.showModal();
    return ()=>{live.current=false;dialog.close();document.body.style.overflow=overflow;if(previous?.isConnected) previous.focus?.({preventScroll:true});};
  },[]);

  // Poll only while this dialog is open and visible. Provider state is authoritative.
  useEffect(()=>{
    if(!session?.orderCode) return;
    let disposed=false,timer,controller,running=false,done=false;
    const poll=async()=>{
      if(disposed || done || running || document.visibilityState!=='visible') return;
      if(Date.now()<retryAtRef.current) {timer=setTimeout(poll,retryAtRef.current-Date.now());return;}
      running=true;controller=new AbortController();setChecking(true);
      try {
        const data=await supportRequest(`/${session.orderCode}`,session.token,{signal:controller.signal});
        if(disposed) return;
        done=terminal(data.status);setPayment(previous=>previous?.status==='PAID'?previous:data);setError('');
      } catch(failure) { if(!disposed && failure.name!=='AbortError') {
        if(failure.retryAfterSeconds>0) retryAtRef.current=Date.now()+Math.min(failure.retryAfterSeconds*1000,3600000);
        setError(failure.message || 'Chưa cập nhật được giao dịch.');
      } }
      finally {running=false;if(!disposed) {setChecking(false);if(!done && document.visibilityState==='visible') timer=setTimeout(poll,Math.max(5000,retryAtRef.current-Date.now()));}}
    };
    const handleVisibility=()=>{clearTimeout(timer);if(document.visibilityState==='visible') poll();else controller?.abort();};
    const start=setTimeout(poll,0);document.addEventListener('visibilitychange',handleVisibility);
    return ()=>{disposed=true;clearTimeout(start);clearTimeout(timer);controller?.abort();document.removeEventListener('visibilitychange',handleVisibility);};
  },[session?.orderCode,session?.token,refresh]);

  useEffect(()=>{
    if(!payment?.qrCode || terminal(payment.status)) return;
    let disposed=false;
    import('qrcode').then(module=>module.default.toDataURL(payment.qrCode,{width:300,margin:2,color:{dark:'#191918',light:'#ffffff'}})).then(url=>{if(!disposed) setQrImage(url);}).catch(()=>{if(!disposed) setQrImage('');});
    return ()=>{disposed=true;};
  },[payment?.qrCode,payment?.status]);

  const handleCreate=async event=>{
    event.preventDefault();if(busyRef.current || returnMismatch) return;
    if(!Number.isSafeInteger(amount) || amount<5000 || amount>10000000) {setError('Chọn số tiền từ 5.000đ đến 10.000.000đ.');return;}
    setError('');
    let token;
    try {token=turnstileRef.current?.getToken() || '';} catch(failure) {setError(failure.message);return;}
    const next=session || {token:createSupportToken(),amount,emailReceipt};
    storeSupportSession(next);setSession(next);busyRef.current=true;setBusy(true);
    try {
      const data=await supportRequest('',next.token,{method:'POST',body:JSON.stringify({amount:next.amount,emailReceipt:Boolean(next.emailReceipt),'cf-turnstile-response':token})});
      const saved={...next,orderCode:data.orderCode};storeSupportSession(saved);
      if(live.current) {setSession(saved);setPayment(data);}
    } catch(failure) {if(live.current) {
      if(['SUPPORT_STORE_UNAVAILABLE','PAYMENT_STORE_UNAVAILABLE','PAYOS_NOT_CONFIGURED','PAYOS_REJECTED','PAYOS_COOLDOWN','TURNSTILE_REQUIRED','TURNSTILE_REJECTED','TURNSTILE_CONFIG'].includes(failure.code)) {storeSupportSession(null);setSession(null);}
      setError(failure.message || 'Chưa tạo được phiên ủng hộ. Vui lòng thử lại.');
    }}
    finally {busyRef.current=false;if(live.current) {setBusy(false);turnstileRef.current?.reset();}}
  };
  const handleRestart=()=>{storeSupportSession(null);setSession(null);setPayment(null);setQrImage('');setError('');};
  const handleChangeAmount=async()=>{
    if(busyRef.current || !session?.orderCode) return;
    setError('');busyRef.current=true;setBusy(true);
    try {const data=await supportRequest(`/${session.orderCode}/cancel`,session.token,{method:'POST',body:'{}'});if(!live.current) return;if(['CANCELLED','FAILED'].includes(data.status)) handleRestart();else {setPayment(data);if(data.status!=='PAID') setError('Đang xác nhận đóng phiên cũ. Vui lòng thử lại sau.');}}
    catch(failure) {if(live.current) setError(failure.message);}
    finally {busyRef.current=false;if(live.current) setBusy(false);}
  };
  const checkout=safeSupportCheckout(payment?.checkoutUrl);
  const hasOrder=Boolean(session?.orderCode);
  const paid=payment?.status==='PAID';
  return createPortal(<dialog ref={dialogRef} className="support-dialog" aria-labelledby="support-title" aria-describedby="support-description" onCancel={event=>{event.preventDefault();closeRef.current();}} onClick={event=>{if(event.target===event.currentTarget) closeRef.current();}}>
    <div className="support-layout">
      <aside className="support-aside paper-surface" data-paper="mint"><span className="support-eyebrow">α∫M4A · HỌC LIỆU MỞ</span><div className="support-heart" aria-hidden="true"><Heart size={54} strokeWidth={1.2}/></div><h2>Góp một chút.<br/>Mở thêm kiến thức.</h2><p>Mỗi đóng góp giúp duy trì website và tiếp tục phát triển học liệu cho cộng đồng.</p><span className="support-secure"><ShieldCheck size={17}/> Thanh toán qua PayOS</span></aside>
      <div className="support-main"><button type="button" className="support-close" onClick={onClose} aria-label="Đóng cửa sổ ủng hộ"><X size={20}/></button>
        <span className="support-eyebrow">{paid?'CẢM ƠN BẠN':'CÙNG DUY TRÌ α∫M4A'}</span><h3 id="support-title">{paid?'Đã nhận được ủng hộ.':hasOrder?'Hoàn tất ủng hộ.':'Bạn muốn góp bao nhiêu?'}</h3><p id="support-description">{paid?'Cảm ơn bạn đã đồng hành cùng học liệu mở.':'Đóng góp tự nguyện, bạn chọn số tiền phù hợp.'}</p>
        {!hasOrder ? <form onSubmit={handleCreate}><fieldset disabled={busy || Boolean(session) || returnMismatch}><legend className="support-sr-only">Chọn số tiền ủng hộ</legend><div className="support-amounts">{amounts.map(value=><button key={value} type="button" aria-pressed={amount===value} onClick={()=>setAmount(value)}>{money(value)}{amount===value && <Check size={15}/>}</button>)}</div><label className="support-custom" htmlFor="support-amount">Số tiền khác<span><input id="support-amount" type="number" min="5000" max="10000000" step="1" inputMode="numeric" value={amount || ''} onChange={event=>setAmount(event.target.value===''?0:Number(event.target.value))} required/><span>VNĐ</span></span></label>{currentUser?.username && !currentUser.username.endsWith('.invalid') && <label className="support-receipt-choice"><input type="checkbox" checked={emailReceipt} onChange={event=>setEmailReceipt(event.target.checked)}/> Gửi thư cảm ơn đến email tài khoản của tôi</label>}</fieldset><TurnstileWidget ref={turnstileRef} action="support"/>{session && <p className="support-note">Phiên trước chưa hoàn tất. Tiếp tục với cùng số tiền để kiểm tra.</p>}<button type="submit" className="support-primary" disabled={busy || returnMismatch}>{busy?<Loader2 size={17} className="support-spinner"/>:<Heart size={17}/>} {busy?'Đang tạo phiên…':`Ủng hộ ${money(session?.amount || amount)}`}<ArrowRight size={17}/></button><p className="support-note">Bạn sẽ thấy QR và đường dẫn thanh toán ở bước tiếp theo.</p></form> : paid ? <div className="support-complete"><CheckCircle2 size={42}/><strong>{money(payment.amount)}</strong><p>PayOS đã xác nhận giao dịch #{payment.orderCode}.</p><button type="button" className="support-primary" onClick={onClose}>Hoàn tất <Check size={17}/></button><button type="button" className="support-text-button" onClick={handleRestart}>Ủng hộ lần khác</button></div> : <div className="support-payment">
          <div className="support-payment-state" role="status">{checking?<Loader2 size={15} className="support-spinner"/>:<span/>}{payment?.status==='CANCELLED'?'Phiên thanh toán đã đóng':payment?.status==='FAILED'?'Chưa tạo được phiên thanh toán':checking?'Đang kiểm tra với PayOS…':'Đang chờ thanh toán'}</div>
          <strong className="support-total">{money(payment?.amount || session.amount)}</strong>
          {!terminal(payment?.status) && <div className="support-qr">{qrImage?<img src={qrImage} alt={`QR ủng hộ ${money(payment?.amount || session.amount)} qua PayOS`}/>:<div><Loader2 size={28} className="support-spinner"/><span>{checkout?'Có thể mở PayOS để thanh toán.':'Đang lấy thông tin thanh toán…'}</span></div>}</div>}
          {payment?.expiresAt && !terminal(payment.status) && <p className="support-note">QR có hiệu lực đến {new Date(payment.expiresAt).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}.</p>}
          {checkout && !terminal(payment?.status) && <a className="support-primary" href={checkout} target="_blank" rel="noopener noreferrer">Mở PayOS <ExternalLink size={16}/></a>}
          <div className="support-payment-actions"><button type="button" onClick={()=>setRefresh(value=>value+1)} disabled={checking || busy}><RefreshCw size={14}/> Kiểm tra giao dịch</button><button type="button" disabled={busy || checking} onClick={terminal(payment?.status)?handleRestart:handleChangeAmount}>{busy?'Đang đóng phiên…':terminal(payment?.status)?'Chọn lại số tiền':'Đổi số tiền'}</button></div>
        </div>}
        {error && <p className="support-error" role="alert">{error}</p>}
      </div>
    </div>
  </dialog>,document.body);
}
