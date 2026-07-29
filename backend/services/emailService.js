import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email, name, otpCode, otpExpiresAt) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  const emailHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Khôi phục mật khẩu</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f9fc; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f9fc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #0d9488; letter-spacing: -0.5px;">UEH TCC</h1>
              <p style="margin: 8px 0 0 0; font-size: 15px; color: #64748b; font-weight: 500;">Hệ thống Hỗ trợ Học tập</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 10px 40px 30px 40px;">
              <p style="font-size: 16px; line-height: 24px; margin: 0 0 20px 0; color: #1e293b;">
                Xin chào <strong>${name || 'bạn'}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 24px; margin: 0 0 30px 0; color: #334155;">
                Chúng tôi vừa nhận được yêu cầu khôi phục mật khẩu cho tài khoản liên kết với email này. Vui lòng sử dụng mã bảo mật (OTP) dưới đây để tiếp tục:
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px 20px; text-align: center; margin-bottom: 30px;">
                <p style="margin: 0 0 15px 0; font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Mã xác minh của bạn</p>
                <div style="font-size: 42px; font-weight: 700; color: #0f172a; letter-spacing: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
                  ${otpCode}
                </div>
                <p style="margin: 15px 0 0 0; font-size: 14px; color: #64748b;">
                  Mã có hiệu lực trong <strong>10 phút</strong>.
                </p>
              </div>

              <!-- Security Warning -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 16px; font-size: 14px; line-height: 22px; color: #92400e;">
                    <strong>Cảnh báo bảo mật:</strong> Nếu bạn <strong>không</strong> yêu cầu thay đổi mật khẩu, ai đó có thể đang cố gắng truy cập vào tài khoản của bạn. Vui lòng phớt lờ email này, tài khoản của bạn vẫn an toàn.
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 16px; line-height: 24px; margin: 0; color: #334155;">
                Trân trọng,<br>
                <strong style="color: #0f172a;">Đội ngũ hỗ trợ UEH TCC</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b;">
                Đây là email tự động từ hệ thống. Xin vui lòng không trả lời.
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} UEH TCC Study Helper. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
