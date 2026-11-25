export const escapeHtml=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export const validEmail=value=>typeof value==='string' && value.length<=254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) && !value.toLowerCase().endsWith('.invalid');
export const safePath=value=>typeof value==='string' && /^\/(?!\/)/.test(value) && !/[\\\u0000-\u001f]/.test(value) ? value : '/';
export function publicOrigin() {
  const url=new URL(process.env.NOTIFICATION_SITE_URL || process.env.CLIENT_URL || 'https://toancaocapueh.id.vn');
  if(url.protocol!=='https:' && !(process.env.NODE_ENV!=='production' && url.protocol==='http:' && ['localhost','127.0.0.1'].includes(url.hostname))) throw new Error('INVALID_NOTIFICATION_SITE_URL');
  return url.origin;
}
export function notificationApiOrigin() {
  const url=new URL(process.env.NOTIFICATION_API_URL || publicOrigin());
  if(url.protocol!=='https:' && !(process.env.NODE_ENV!=='production' && url.protocol==='http:' && ['localhost','127.0.0.1'].includes(url.hostname))) throw new Error('INVALID_NOTIFICATION_API_URL');
  return url.origin;
}
const money=value=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(Number(value)||0);
export function notificationContent(kind,p={}) {
  const course=p.courseTitle || 'khóa học của bạn';
  const definitions={
    payment_paid:['Thanh toán thành công · Quyền học đã sẵn sàng',`Bạn đã thanh toán ${money(p.amount)} cho ${course}. Quyền học đã được mở cho tài khoản của bạn.`,'Vào học'],
    payment_closed:['Đơn thanh toán chưa hoàn tất',`Đơn ${p.orderCode} ${p.status==='FAILED'?'không thành công':'đã hủy hoặc hết hạn'}. Hệ thống chưa ghi nhận thanh toán thành công cho đơn này. Nếu tài khoản ngân hàng đã bị trừ tiền, vui lòng liên hệ hỗ trợ trước khi thanh toán lại.`,'Xem khóa học'],
    payment_pending_access:['Đã nhận thanh toán · Đang xử lý quyền học',`Hệ thống đã nhận ${money(p.amount)} cho ${course}, nhưng chưa hoàn tất mở quyền học. Bạn không cần thanh toán lại. Chúng mình đang xử lý và sẽ thông báo khi quyền học sẵn sàng.`,'Xem khóa học'],
    payment_access_alert:['Cần xử lý quyền học sau thanh toán',`Đơn ${p.orderCode} đã nhận ${money(p.amount)} nhưng chưa có quyền học hoạt động. Vui lòng đối soát đơn và kiểm tra trạng thái thu hồi trước khi cấp lại quyền.`,'Quản lý thông báo'],
    enrollment_granted:['Khóa học của bạn đã sẵn sàng',`Bạn đã được cấp quyền học ${course}${p.source==='KEY'?' bằng mã kích hoạt':''}. Chọn một bài để bắt đầu nhé.`,'Vào học'],
    enrollment_restored:['Quyền học đã được khôi phục',`Bạn có thể tiếp tục học ${course}.`,'Vào học'],
    enrollment_revoked:['Thông báo thay đổi quyền học',`Quyền học ${course} đã được thu hồi bởi quản trị viên.${p.reason?' Lý do: '+p.reason:''} Nếu cần làm rõ, bạn có thể phản hồi email này.`,'Xem khóa học'],
    access_changed:['Thông báo thay đổi quyền học',p.message || `Quyền học ${course} có thay đổi. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.`,'Xem khóa học'],
    refund_confirmed:['Xác nhận hoàn tiền',`Quản trị viên xác nhận đã hoàn ${money(p.amount)} cho đơn ${p.orderCode}. Mã đối soát: ${p.reference}. ${p.message || ''}`,'Xem khóa học'],
    support_paid:['Cảm ơn bạn đã đồng hành cùng α∫M4A',`Chúng mình đã nhận khoản ủng hộ ${money(p.amount)} của bạn. Đây là khoản đóng góp tự nguyện cho học liệu mở, không phải khoản mua khóa học. Cảm ơn bạn đã góp thêm một chút kiến thức cho cộng đồng.`,'Ghé α∫M4A'],
    password_changed:['Mật khẩu của bạn đã được thay đổi','Mật khẩu tài khoản vừa được cập nhật. Nếu không phải bạn thực hiện, hãy vào website, chọn Đăng nhập → Quên mật khẩu và liên hệ hỗ trợ ngay.','Mở website'],
    email_changed:['Địa chỉ email tài khoản đã được cập nhật','Địa chỉ email đăng nhập của tài khoản vừa thay đổi. Nếu không phải bạn thực hiện, hãy liên hệ hỗ trợ ngay.','Mở website'],
    contact_received:['Chúng mình đã nhận yêu cầu của bạn',`Cảm ơn ${p.name || 'bạn'}. Yêu cầu “${p.subject || 'Tư vấn khóa học'}” đã được lưu. Chúng mình sẽ liên hệ qua thông tin bạn cung cấp; bạn có thể phản hồi email này để bổ sung.`,'Ghé α∫M4A'],
    contact_admin:['Có yêu cầu tư vấn mới',`${p.name}: ${p.subject}. Liên hệ: ${p.email || p.phone || 'Xem yêu cầu'}. ${p.message || ''}`,'Mở trang quản trị'],
    course_update:[p.title,p.message,'Khám phá khóa học'], new_article:[p.title,p.message,'Mở bài viết'],
    answer:['Câu hỏi của bạn có lời giải mới',`${p.actorName || 'Một thành viên'} vừa trả lời “${p.postTitle}”.`,'Xem lời giải'],
    comment:['Có phản hồi mới trong cuộc trao đổi',`${p.actorName || 'Một thành viên'} vừa phản hồi trong “${p.postTitle}”.`,'Xem bình luận'],
    mention:['Bạn được nhắc tên',`${p.actorName || 'Một thành viên'} đã nhắc đến bạn trong “${p.postTitle}”.`,'Xem trao đổi'],
    accepted_solution:['Lời giải của bạn được chấp nhận',`Lời giải của bạn cho “${p.postTitle}” đã được chấp nhận.`,'Xem lời giải'],
    study_reminder:['Một chút thời gian cho việc học','Bạn muốn tiếp tục một bài đang học hoặc thử một đề ngắn hôm nay không?','Chọn khóa học'],
    weekly_summary:['Góc học tập tuần này',`Trong 7 ngày qua, bạn đã đăng ${p.posts || 0} bài và góp lời giải ở ${p.discussions || 0} cuộc trao đổi. Bạn đang có ${p.activeCourses || 0} khóa học được mở. Cùng nhìn lại và chọn điều muốn học tiếp nhé.`,'Góc học tập']
  };
  const data=definitions[kind]; if(!data || !data[0] || !data[1]) throw new Error('UNKNOWN_NOTIFICATION_KIND');
  return {title:data[0],message:data[1],action:data[2],link:safePath(p.link || (p.courseId?`/course/${encodeURIComponent(p.courseId)}`:'/'))};
}
export function renderEmail(kind,payload,{unsubscribeUrl}={}) {
  const c=notificationContent(kind,payload),url=new URL(c.link,publicOrigin()).href;
  const time=payload.occurredAt?new Date(payload.occurredAt):null;
  const details=[payload.orderCode && ['Mã đơn / giao dịch',String(payload.orderCode)], payload.reference && ['Mã đối soát',payload.reference], time && Number.isFinite(+time) && ['Thời gian',time.toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})]].filter(Boolean);
  const support=validEmail(process.env.NOTIFICATION_REPLY_TO)?process.env.NOTIFICATION_REPLY_TO:'';
  const text=[c.title,c.message,...details.map(([k,v])=>`${k}: ${v}`),`${c.action}: ${url}`,support?`Hỗ trợ: ${support}`:'',unsubscribeUrl?`Ngừng nhận giới thiệu khóa học: ${unsubscribeUrl}`:''].filter(Boolean).join('\n\n');
  const html=`<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#faf8f5;color:#202720;font-family:Arial,sans-serif"><table role="presentation" width="100%"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" style="max-width:600px;background:#fff;border-radius:20px"><tr><td style="padding:32px"><p style="color:#536b50;font-size:14px">α∫M4A · Math for all • Aim for A</p><h1 style="font-size:25px;line-height:1.4">${escapeHtml(c.title)}</h1><p style="line-height:1.8">${escapeHtml(c.message)}</p>${details.map(([k,v])=>`<p style="font-size:14px"><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}</p>`).join('')}<p style="padding:18px 0"><a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 22px;background:#264b3b;color:#fff;border-radius:10px;text-decoration:none">${escapeHtml(c.action)}</a></p><p style="font-size:13px;line-height:1.8;color:#606c61">${support?`Cần hỗ trợ? Phản hồi email này hoặc liên hệ ${escapeHtml(support)}.`:'Học hiểu. Làm được.'}</p>${unsubscribeUrl?`<p style="font-size:12px"><a href="${escapeHtml(unsubscribeUrl)}">Ngừng nhận email giới thiệu khóa học</a></p>`:''}</td></tr></table></td></tr></table></body></html>`;
  return {subject:`[α∫M4A] ${c.title}`,text,html};
}
