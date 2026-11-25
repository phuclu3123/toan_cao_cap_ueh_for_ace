import { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch,readApiJson } from '../utils/apiClient';
import '../assets/styles/NotificationSettings.css';
const options=[
  ['community','Trao đổi cộng đồng','Lời giải mới, trả lời bình luận, nhắc tên và lời giải được chấp nhận. Chỉ trong web.'],
  ['articles','Bài viết mới','Thông báo bài viết do quản trị viên giới thiệu. Chỉ trong web.'],
  ['reminders','Nhắc học','Một lời nhắc mỗi ngày khi bạn có khóa học đang mở. Chỉ trong web.'],
  ['weekly','Nhìn lại tuần học','Tóm tắt bài đăng, trao đổi và khóa học được mở mỗi tuần. Chỉ trong web.'],
  ['promotions','Giới thiệu khóa học qua email','Nhận các đợt giới thiệu bài giảng, tài liệu hoặc khóa học mới. Có thể tắt bất cứ lúc nào.']
];
export default function NotificationSettings() {
  const {currentUser,loading}=useAuth();
  if(loading) return <main className="notification-settings" role="status">Đang xác minh tài khoản…</main>;
  if(!currentUser) return <main className="notification-settings"><h1>Chọn cách bạn nhận tin.</h1><p>Đăng nhập bằng nút trên thanh menu để quản lý thông báo của riêng bạn.</p><Link to="/">Về trang chủ</Link></main>;
  return <Preferences key={currentUser.id || currentUser.uid} user={currentUser}/>;
}
function Preferences({user}) {
  const [preferences,setPreferences]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[reload,setReload]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    apiFetch(`/api/notification-settings?accountId=${encodeURIComponent(user.id || user.uid)}`,{signal:controller.signal}).then(readApiJson).then(result=>{if(!controller.signal.aborted){setPreferences(result.data);setError('');}}).catch(failure=>{if(!controller.signal.aborted) setError(failure.message);});
    return ()=>controller.abort();
  },[reload,user.id,user.uid]);
  const handleSave=async event=>{
    event.preventDefault();if(busy) return;setBusy(true);setMessage('');setError('');
    try {
      const patch={accountId:user.id || user.uid,...Object.fromEntries(options.map(([key])=>[key,Boolean(preferences[key])]))};
      const response=await readApiJson(await apiFetch('/api/notification-settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch)}));
      setPreferences(response.data);setMessage('Đã lưu cách nhận thông báo.');
    } catch(failure) {setError(failure.message);}finally {setBusy(false);}
  };
  return <main className="notification-settings"><Link to="/">← Trang chủ</Link><header><p>α∫M4A / THÔNG BÁO CỦA BẠN</p><h1>Nhận điều bạn cần.<br/><em>Học theo nhịp của bạn.</em></h1><p>Email giao dịch và bảo mật được gửi khi có thay đổi quan trọng. Những tin còn lại, bạn chọn bên dưới.</p></header>
    {error && <p role="alert">{error} <button type="button" onClick={()=>setReload(v=>v+1)}>Thử lại</button></p>}
    {message && <p role="status">{message}</p>}
    {preferences && <form onSubmit={handleSave}><fieldset disabled={busy}>{options.map(([key,title,description])=><label className="notification-choice" key={key}><span><strong>{title}</strong><small>{description}</small></span><input type="checkbox" checked={Boolean(preferences[key])} onChange={event=>setPreferences(old=>({...old,[key]:event.target.checked}))}/></label>)}</fieldset><button className="notification-save" disabled={busy}>{busy?'Đang lưu…':'Lưu tùy chọn'}</button></form>}
    {user.role==='Admin' && <p><Link to="/notifications/admin">Quản trị email và giới thiệu khóa học →</Link></p>}
  </main>;
}
