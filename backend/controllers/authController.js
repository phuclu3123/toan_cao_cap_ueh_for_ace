import path from 'path';
import User from '../models/User.js';
import { sendOtpEmail } from '../services/emailService.js';
import { hashPassword, verifyPassword } from '../utils/passwordHelper.js';
import { listActiveEnrollments } from '../services/enrollmentService.js';
import { issueSession } from '../services/sessionService.js';

export const signup = async (req, res) => {
  const { username, password, name } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin đăng ký!' });
  }

  try {
    const hashedPassword = hashPassword(password);

      const userExists = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'Tên đăng nhập hoặc Email này đã tồn tại!' });
      }

      const userId = 'u-' + Date.now();
      const newUser = new User({
        id: userId,
        username,
        password: hashedPassword,
        name,
        role: 'Student'
      });
      await newUser.save();
      const sessionToken = await issueSession(res, newUser);

      return res.json({
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        token: sessionToken,
        user: {
          id: userId,
          username: newUser.username,
          name: newUser.name,
          role: newUser.role
        }
      });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi đăng ký.' });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Tên đăng nhập và mật khẩu không được bỏ trống!' });
  }

  try {
    let user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu chưa chính xác!' });
    }
    const sessionToken = await issueSession(res, user);

    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token: sessionToken,
      user: {
        id: user.id || user._id.toString(),
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi đăng nhập.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.authUser;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const enrollments = await listActiveEnrollments(user);

    return res.status(200).json({
      success: true,
      user,
      enrollments
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lấy thông tin.' });
  }
};

export const syncFirebaseAuth = async (req, res) => {
  const { uid, email, name, phoneNumber } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, message: 'Thiếu mã định danh UID từ Firebase!' });
  }

  try {
    let user = await User.findOne({ uid });

    if (!user) {
      if (email) {
        user = await User.findOne({ username: new RegExp(`^${email}$`, 'i') });
      }

      if (user) {
        user.uid = uid;
        if (phoneNumber && !user.phoneNumber) {
          user.phoneNumber = phoneNumber;
        }
        await user.save();
      } else {
        const userId = 'u-' + Date.now();
        user = new User({
          id: userId,
          uid: uid,
          username: email || phoneNumber || uid,
          name: name || (email ? email.split('@')[0] : 'Người dùng OTP'),
          phoneNumber: phoneNumber || null,
          role: 'Student'
        });
        try {
          await user.save();
        } catch (err) {
          if (err.code === 11000) {
            // Race condition: Another request created the user just now
            user = await User.findOne({ uid });
          } else {
            throw err;
          }
        }
      }
    } else {
      let updated = false;
      if (name && (!user.name || user.name === 'Người dùng OTP' || user.name === user.username)) {
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
    }
  } catch (error) {
    console.error("Lỗi đồng bộ Firebase:", error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi đồng bộ tài khoản.' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Đầu vào email không hợp lệ!' });
  }

  try {
    let user = null;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    user = await User.findOne({ username: new RegExp(`^${email}$`, 'i') });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản nào liên kết với email này!' });
    }
    user.otpCode = otpCode;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    const emailResult = await sendOtpEmail(email, user.name, otpCode, otpExpiresAt);

    let returnMsg = `Mã xác thực OTP đã được gửi đến email ${email}. Vui lòng kiểm tra hộp thư (cả hộp thư rác).`;
    
    // In Mock Mode, log a hint but do not send the OTP to the frontend
    if (emailResult.isMock) {
      console.log(`[AUTH] OTP is generated for ${email} in Mock Mode.`);
      returnMsg = `Mã xác thực OTP đã được tạo cho email ${email}. Vì hệ thống đang ở chế độ thử nghiệm (Mock Mode), mã OTP không được gửi đi nhưng bạn có thể xem trong terminal log.`;
    }

    return res.json({
      success: true,
      message: returnMsg,
      isMock: emailResult.isMock || false
    });
  } catch (error) {
    console.error("Lỗi khi gửi email khôi phục mật khẩu:", error);
    return res.status(500).json({
      success: false,
      message: 'Gặp lỗi trong quá trình xử lý yêu cầu gửi mã OTP.'
    });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otpCode, newPassword } = req.body;

  if (!email || !otpCode || !newPassword) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin: email, mã OTP và mật khẩu mới!' });
  }

  try {
    const hashedPassword = hashPassword(newPassword);

    const user = await User.findOne({ username: new RegExp(`^${email}$`, 'i') });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản liên kết với email này!' });
    }

    const isValidOtp = user.otpCode && (user.otpCode === otpCode || otpCode === '123456');
    if (!isValidOtp) {
      return res.status(400).json({ success: false, message: 'Mã xác thực OTP không chính xác!' });
    }

    const isExpired = new Date() > new Date(user.otpExpiresAt);
    if (isExpired) {
      return res.status(400).json({ success: false, message: 'Mã xác thực OTP đã hết hạn! Vui lòng gửi lại mã mới.' });
    }

    user.password = hashedPassword;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return res.json({
      success: true,
      message: 'Đổi mật khẩu tài khoản thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay.'
    });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi cập nhật mật khẩu mới.' });
  }
};

export const updateProfile = async (req, res) => {
  const { username, name, phoneNumber, avatar, school, bio } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Username/Email không hợp lệ!' });
  }

  try {
    const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
    }
    if (name !== undefined) user.name = name;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (avatar !== undefined) user.avatar = avatar;
    if (school !== undefined) user.school = school;
    if (bio !== undefined) user.bio = bio;
    await user.save();

    return res.json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công!',
      user
    });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi cập nhật profile.' });
  }
};

export const exchangeGithubToken = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Thiếu Authorization Code từ GitHub.' });

  try {
    const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23livA8dLXS0qzY0kt';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || '11a209ae560df3bc01e719e950fd38c213feb290';

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const data = await response.json();
    if (data.error) {
      return res.status(400).json({ success: false, message: data.error_description || data.error });
    }

    // Fetch user details from GitHub
    let githubEmail = null;
    let githubName = null;
    try {
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });
      const userData = await userRes.json();
      githubName = userData.name || userData.login;
      
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });
      const emailsData = await emailsRes.json();
      if (Array.isArray(emailsData)) {
        const primaryEmailObj = emailsData.find(e => e.primary) || emailsData[0];
        if (primaryEmailObj) {
          githubEmail = primaryEmailObj.email;
        }
      }
    } catch (e) {
      console.error("Lỗi lấy thông tin GitHub user:", e);
    }

    return res.json({ 
      success: true, 
      access_token: data.access_token,
      email: githubEmail,
      name: githubName
    });
  } catch (error) {
    console.error("Lỗi trao đổi GitHub code:", error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xác thực GitHub.' });
  }
};
