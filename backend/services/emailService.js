import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email, name, otpCode, otpExpiresAt) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #0d9488; margin: 0;">UEH TCC STUDY HELPER</h2>
        <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Hệ thống Khôi phục Mật khẩu Tự động</p>
      </div>
      
      <div style="line-height: 1.6; color: #334155;">
        <p>Chào <strong>${name || 'Sinh viên UEH'}</strong>,</p>
        <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn tại UEH TCC Study Helper.</p>
        
        <div style="background-color: #f0fdfa; border: 1px dashed #0d9488; border-radius: 6px; padding: 20px; text-align: center; margin: 25px 0;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #0f766e; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Mã OTP xác thực của bạn là:</p>
          <span style="font-size: 32px; font-weight: 800; color: #0d9488; letter-spacing: 5px; display: inline-block;">${otpCode}</span>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">(Mã này có hiệu lực trong vòng <strong>10 phút</strong> và chỉ sử dụng được 1 lần)</p>
        </div>
        
        <p>Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn và không bị thay đổi.</p>
        <p style="margin-top: 30px;">Trân trọng,<br><strong>Đội ngũ Kỹ thuật UEH TCC</strong></p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
        <p>Đây là email tự động từ hệ thống UEH TCC. Vui lòng không phản hồi lại email này.</p>
      </div>
    </div>
  `;

  // Priority 1: Gmail SMTP (Preferred when EMAIL_USER and EMAIL_PASS are set)
  if (user && pass) {
    try {
      const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
      const port = parseInt(process.env.EMAIL_PORT) || 587;
      const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
      });

      const mailOptions = {
        from: `"Hệ thống Hỗ trợ Học tập UEH TCC" <${user}>`,
        to: email,
        subject: '[UEH TCC] Mã OTP khôi phục mật khẩu tài khoản của bạn',
        html: emailHtml
      };

      await transporter.sendMail(mailOptions);
      console.log(`[GMAIL SMTP SUCCESS] Gửi mã OTP thành công tới ${email}`);
      return { success: true, isMock: false };
    } catch (err) {
      console.error('[GMAIL SMTP ERROR] Lỗi gửi mail:', err.message);
      if (err.message.includes('Invalid login') || err.message.includes('535-5.7.8')) {
        console.error('=> GỢI Ý: Google không cho phép dùng mật khẩu Gmail thông thường. Bạn PHẢI tạo "Mật khẩu ứng dụng" (App Password) gồm 16 chữ cái trong Google Account và dùng nó làm EMAIL_PASS.');
      }
    }
  }

  // Priority 2: Resend API (When RESEND_API_KEY is available)
  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'UEH TCC Helper <onboarding@resend.dev>';
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: '[UEH TCC] Mã OTP khôi phục mật khẩu tài khoản của bạn',
          html: emailHtml
        })
      });

      const resData = await response.json();
      if (response.ok) {
        console.log(`[RESEND API SUCCESS] Gửi OTP thành công tới ${email}. Resend ID: ${resData.id}`);
        return { success: true, isMock: false, resendId: resData.id };
      } else {
        console.warn('[RESEND API SANDBOX RESTRICTION]', resData.message || resData);
        // Fallback gracefully so user can continue OTP step without scary errors
        return { success: true, isMock: true, fallbackReason: 'Resend Sandbox restriction' };
      }
    } catch (err) {
      console.error('[RESEND API FETCH ERROR]', err.message);
    }
  }

  // Fallback Mock Mode
  console.log(`\n======================================================`);
  console.log(`[SMTP MOCK MODE] GỬI MÃ OTP QUÊN MẬT KHẨU`);
  console.log(`Email nhận: ${email}`);
  console.log(`Mã OTP 6 chữ số: ${otpCode}`);
  console.log(`Thời hạn: Hết hạn sau 10 phút (${new Date(otpExpiresAt).toLocaleTimeString()})`);
  console.log(`======================================================\n`);

  return { 
    success: true, 
    isMock: true, 
    message: 'Mã OTP đã được tạo.' 
  };
};
