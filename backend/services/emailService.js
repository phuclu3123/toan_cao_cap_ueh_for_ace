import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email, name, otpCode, otpExpiresAt) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; padding: 40px 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: #0d9488; padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">UEH TCC</h1>
          <p style="color: #ccfbf1; margin: 8px 0 0 0; font-size: 15px;">Hệ thống Hỗ trợ Học tập Toán Cao Cấp</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px 30px; color: #334155; line-height: 1.6;">
          <p style="font-size: 16px; margin-top: 0;">Chào <strong>${name || 'bạn'}</strong>,</p>
          <p style="font-size: 16px; margin-bottom: 25px;">Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã xác thực (OTP) dưới đây để tiếp tục:</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
            <span style="display: block; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 15px;">Mã xác thực của bạn</span>
            <span style="font-size: 38px; font-weight: 800; color: #0d9488; letter-spacing: 8px; display: inline-block;">${otpCode}</span>
          </div>
          
          <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 30px;">
            Mã này có hiệu lực trong vòng <strong>10 phút</strong> và chỉ sử dụng được 1 lần.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          
          <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">
            Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn được bảo mật an toàn.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">
            © ${new Date().getFullYear()} UEH TCC Study Helper.<br>
            Đây là email tự động, vui lòng không phản hồi.
          </p>
        </div>
        
      </div>
    </div>
  `;

  // Priority 1: Resend API (Preferred when RESEND_API_KEY is available)
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

  // Priority 2: Gmail SMTP (Fallback when EMAIL_USER and EMAIL_PASS are set)
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
