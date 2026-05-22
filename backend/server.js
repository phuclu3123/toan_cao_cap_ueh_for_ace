import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Helper to read and write JSON data
const readJSONFile = (filePath, defaultValue = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content || JSON.stringify(defaultValue));
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return defaultValue;
  }
};

const writeJSONFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
};

// Endpoints
// 1. Newsletter Subscription
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Email không hợp lệ!' });
  }

  const filePath = path.join(dataDir, 'subscribers.json');
  const subscribers = readJSONFile(filePath);
  
  if (subscribers.includes(email)) {
    return res.status(400).json({ success: false, message: 'Email này đã đăng ký nhận tin từ trước!' });
  }

  subscribers.push(email);
  if (writeJSONFile(filePath, subscribers)) {
    return res.json({ success: true, message: 'Đăng ký nhận bài viết mới thành công! Cảm ơn bạn.' });
  } else {
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu đăng ký.' });
  }
});

// 2. Contact Message
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' });
  }

  const filePath = path.join(dataDir, 'messages.json');
  const messages = readJSONFile(filePath);

  const newMessage = {
    id: Date.now().toString(),
    name,
    email,
    subject: subject || 'Liên hệ từ website',
    message,
    createdAt: new Date().toISOString()
  };

  messages.push(newMessage);
  if (writeJSONFile(filePath, messages)) {
    return res.json({ success: true, message: 'Tin nhắn của bạn đã được gửi đi thành công! Chúng tôi sẽ phản hồi sớm.' });
  } else {
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu tin nhắn.' });
  }
});

// 3. Dynamic Resources GET and POST API
app.get('/api/resources', (req, res) => {
  const filePath = path.join(dataDir, 'resources.json');
  const resources = readJSONFile(filePath, { documentsData: [], midtermExams: [], finalExams: [] });
  res.json({ success: true, resources });
});

app.post('/api/resources', (req, res) => {
  const { type, item, adminRole, uid, email } = req.body;

  // Đọc danh sách users từ database server để đối chiếu bảo mật thực tế (tránh hack client-side)
  const usersFilePath = path.join(dataDir, 'users.json');
  const users = readJSONFile(usersFilePath, []);

  // Tìm người dùng trong db bằng UID hoặc Email
  const dbUser = users.find(u => 
    (uid && u.uid === uid) || 
    (email && u.username && u.username.toLowerCase() === email.toLowerCase())
  );

  // Nếu tìm thấy dbUser, lấy vai trò từ DB. Nếu không tìm thấy (luồng offline/demo), đối chiếu adminRole === 'Admin'.
  const isAuthorized = dbUser ? (dbUser.role === 'Admin') : (adminRole === 'Admin' && !uid);

  if (!isAuthorized) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này (Từ chối bởi Server)!' });
  }

  if (!type || !item || !item.title) {
    return res.status(400).json({ success: false, message: 'Dữ liệu tài liệu không hợp lệ!' });
  }

  const filePath = path.join(dataDir, 'resources.json');
  const resources = readJSONFile(filePath, { documentsData: [], midtermExams: [], finalExams: [] });

  if (!resources[type]) {
    resources[type] = [];
  }

  // Generate ID if missing
  if (!item.id) {
    item.id = type.substring(0, 2) + '-' + Date.now();
  }

  // Auto add metadata if missing
  if (!item.date) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    item.date = `${dd}/${mm}/${yyyy}`;
  }

  resources[type].unshift(item); // Add to the top of the list for "real-time" publishing

  if (writeJSONFile(filePath, resources)) {
    return res.json({ success: true, message: 'Đăng tải tài liệu thành công!', item });
  } else {
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu tài liệu.' });
  }
});

// 4. Real Signup API
app.post('/api/signup', (req, res) => {
  const { username, password, name } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin đăng ký!' });
  }

  const filePath = path.join(dataDir, 'users.json');
  const users = readJSONFile(filePath, []);

  const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
  if (userExists) {
    return res.status(400).json({ success: false, message: 'Tên đăng nhập hoặc Email này đã tồn tại!' });
  }

  const newUser = {
    id: 'u-' + Date.now(),
    username,
    password, // Plain text for simplicity, easily upgraded to bcrypt later
    name,
    role: 'Student', // Default role is Student
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  if (writeJSONFile(filePath, users)) {
    return res.json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role
      }
    });
  } else {
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu tài khoản.' });
  }
});

// 5. Dynamic Database Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Tên đăng nhập và mật khẩu không được bỏ trống!' });
  }

  const filePath = path.join(dataDir, 'users.json');
  const users = readJSONFile(filePath, []);

  // Validate username and password
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu chưa chính xác!' });
  }

  return res.json({
    success: true,
    message: 'Đăng nhập thành công!',
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

// 6. Firebase Auth Sync API
app.post('/api/auth/sync', (req, res) => {
  const { uid, email, name, phoneNumber } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, message: 'Thiếu mã định danh UID từ Firebase!' });
  }

  const filePath = path.join(dataDir, 'users.json');
  const users = readJSONFile(filePath, []);

  // 1. Tìm theo UID
  let user = users.find(u => u.uid === uid);

  if (!user) {
    // 2. Tìm theo Email (để liên kết tài khoản đã tạo trước đó hoặc tài khoản admin)
    if (email) {
      user = users.find(u => u.username && u.username.toLowerCase() === email.toLowerCase());
    }

    if (user) {
      // Cập nhật UID Firebase và SĐT cho tài khoản hiện có
      user.uid = uid;
      if (phoneNumber && !user.phoneNumber) {
        user.phoneNumber = phoneNumber;
      }
      user.updatedAt = new Date().toISOString();
    } else {
      // 3. Nếu hoàn toàn chưa có, tạo tài khoản Student mới (hoặc Admin nếu trùng email admin đặc biệt)
      const isAdminEmail = email && email.toLowerCase() === 'admin@ueh.edu.vn';
      user = {
        id: 'u-' + Date.now(),
        uid: uid,
        username: email || phoneNumber || uid,
        name: name || (email ? email.split('@')[0] : 'Người dùng OTP'),
        phoneNumber: phoneNumber || null,
        role: isAdminEmail ? 'Admin' : 'Student',
        createdAt: new Date().toISOString()
      };
      users.push(user);
    }

    writeJSONFile(filePath, users);
  } else {
    // Nếu tìm thấy theo UID, cập nhật thông tin tên/SĐT/Email nếu thay đổi
    let updated = false;
    if (name && user.name !== name) {
      user.name = name;
      updated = true;
    }
    if (phoneNumber && user.phoneNumber !== phoneNumber) {
      user.phoneNumber = phoneNumber;
      updated = true;
    }
    if (email && user.username !== email) {
      user.username = email;
      updated = true;
    }
    if (updated) {
      user.updatedAt = new Date().toISOString();
      writeJSONFile(filePath, users);
    }
  }

  return res.json({
    success: true,
    message: 'Đồng bộ tài khoản thành công!',
    user: {
      id: user.id,
      uid: user.uid,
      username: user.username,
      name: user.name,
      role: user.role,
      phoneNumber: user.phoneNumber
    }
  });
});

// Configure Nodemailer Transporter for Email OTP
// Prioritizes SMTP credentials from environment variables, falls back to mock console output if not available
const createMailTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT) || 587;
  const secure = process.env.EMAIL_SECURE === 'true';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    // Return null to signify mock mode
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
};

// 7. Forgot Password - Generate & Send OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Đầu vào email không hợp lệ!' });
  }

  const filePath = path.join(dataDir, 'users.json');
  const users = readJSONFile(filePath, []);

  // Find user by email (username)
  const userIndex = users.findIndex(u => u.username && u.username.toLowerCase() === email.toLowerCase());

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản nào liên kết với email này!' });
  }

  const user = users[userIndex];

  // Generate 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

  // Store OTP inside user record
  user.otpCode = otpCode;
  user.otpExpiresAt = otpExpiresAt;
  writeJSONFile(filePath, users);

  const transporter = createMailTransporter();

  if (!transporter) {
    // Mock Mode: Print OTP to backend console
    console.log(`\n======================================================`);
    console.log(`[SMTP MOCK MODE] GỬI MÃ OTP QUÊN MẬT KHẨU`);
    console.log(`Email nhận: ${email}`);
    console.log(`Mã OTP 6 chữ số: ${otpCode}`);
    console.log(`Thời hạn: Hết hạn sau 10 phút (${new Date(otpExpiresAt).toLocaleTimeString()})`);
    console.log(`======================================================\n`);

    return res.json({
      success: true,
      message: 'Mã OTP đã được gửi về email của bạn! (Chế độ mô phỏng offline: Vui lòng xem mã OTP trong Terminal của Backend server)',
      isMock: true
    });
  }

  // Real SMTP Gửi Mail Mode
  try {
    const mailOptions = {
      from: `"Hệ thống Hỗ trợ Học tập UEH TCC" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '[UEH TCC] Mã OTP khôi phục mật khẩu tài khoản của bạn',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <div style="text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 15px; margin-bottom: 20px;">
            <h2 style="color: #0d9488; margin: 0;">UEH TCC STUDY HELPER</h2>
            <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Hệ thống Khôi phục Mật khẩu Tự động</p>
          </div>
          
          <div style="line-height: 1.6; color: #334155;">
            <p>Chào <strong>${user.name || 'Sinh viên UEH'}</strong>,</p>
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
      `
    };

    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      message: 'Mã xác thực OTP đã được gửi đến hòm thư email của bạn! Vui lòng kiểm tra (cả thư rác nếu chưa thấy).'
    });
  } catch (error) {
    console.error("Lỗi khi gửi email SMTP thực tế:", error);
    return res.status(500).json({
      success: false,
      message: 'Gặp lỗi trong quá trình gửi mail qua SMTP server. Vui lòng liên hệ quản trị viên hoặc sử dụng chế độ mô phỏng backend.'
    });
  }
});

// 8. Reset Password - Verify OTP & Update Password
app.post('/api/auth/reset-password', (req, res) => {
  const { email, otpCode, newPassword } = req.body;

  if (!email || !otpCode || !newPassword) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin: email, mã OTP và mật khẩu mới!' });
  }

  const filePath = path.join(dataDir, 'users.json');
  const users = readJSONFile(filePath, []);

  const userIndex = users.findIndex(u => u.username && u.username.toLowerCase() === email.toLowerCase());

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản liên kết với email này!' });
  }

  const user = users[userIndex];

  // Validate OTP code and expiration
  if (!user.otpCode || user.otpCode !== otpCode) {
    return res.status(400).json({ success: false, message: 'Mã xác thực OTP không chính xác!' });
  }

  const isExpired = new Date() > new Date(user.otpExpiresAt);
  if (isExpired) {
    return res.status(400).json({ success: false, message: 'Mã xác thực OTP đã hết hạn! Vui lòng gửi lại mã mới.' });
  }

  // OTP is valid! Reset password, clear OTP states
  user.password = newPassword;
  delete user.otpCode;
  delete user.otpExpiresAt;
  user.updatedAt = new Date().toISOString();

  if (writeJSONFile(filePath, users)) {
    return res.json({
      success: true,
      message: 'Đổi mật khẩu tài khoản thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay.'
    });
  } else {
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi cập nhật mật khẩu mới.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

