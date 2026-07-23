import path from 'path';
import User from '../models/User.js';
import { checkMongoDBConnected } from '../config/db.js';
import { readJSONFile, writeJSONFile, dataDir } from '../utils/jsonHelper.js';
import { sendOtpEmail } from '../services/emailService.js';
import { hashPassword, verifyPassword } from '../utils/passwordHelper.js';

export const signup = async (req, res) => {
  const { username, password, name } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin đăng ký!' });
  }

  try {
    const hashedPassword = hashPassword(password);

    if (checkMongoDBConnected()) {
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

      return res.json({
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        user: {
          id: userId,
          username: newUser.username,
          name: newUser.name,
          role: newUser.role
        }
      });
    } else {
      const filePath = path.join(dataDir, 'users.json');
      const users = readJSONFile(filePath, []);

      const userExists = users.some(u => u.username && u.username.toLowerCase() === username.toLowerCase());
      if (userExists) {
        return res.status(400).json({ success: false, message: 'Tên đăng nhập hoặc Email này đã tồn tại!' });
      }

      const newUser = {
        id: 'u-' + Date.now(),
        username,
        password: hashedPassword,
        name,
        role: 'Student',
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
    }
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
    let user = null;
    if (checkMongoDBConnected()) {
      user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
    } else {
      const filePath = path.join(dataDir, 'users.json');
      const users = readJSONFile(filePath, []);
      user = users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
    }

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu chưa chính xác!' });
    }

    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
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

export const syncFirebaseAuth = async (req, res) => {
  const { uid, email, name, phoneNumber } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, message: 'Thiếu mã định danh UID từ Firebase!' });
  }

  try {
    if (checkMongoDBConnected()) {
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
          await user.save();
        }
      } else {
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
          await user.save();
        }
      }

      return res.json({
        success: true,
        message: 'Đồng bộ tài khoản thành công!',
        user: {
          id: user.id || user._id.toString(),
          uid: user.uid,
          username: user.username,
          name: user.name,
          role: user.role,
          phoneNumber: user.phoneNumber
        }
      });
    } else {
      const filePath = path.join(dataDir, 'users.json');
      const users = readJSONFile(filePath, []);

      let user = users.find(u => u.uid === uid);

      if (!user) {
        if (email) {
          user = users.find(u => u.username && u.username.toLowerCase() === email.toLowerCase());
        }

        if (user) {
          user.uid = uid;
          if (phoneNumber && !user.phoneNumber) {
            user.phoneNumber = phoneNumber;
          }
          user.updatedAt = new Date().toISOString();
        } else {
          user = {
            id: 'u-' + Date.now(),
            uid: uid,
            username: email || phoneNumber || uid,
            name: name || (email ? email.split('@')[0] : 'Người dùng OTP'),
            phoneNumber: phoneNumber || null,
            role: 'Student',
            createdAt: new Date().toISOString()
          };
          users.push(user);
        }

        writeJSONFile(filePath, users);
      } else {
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

    if (checkMongoDBConnected()) {
      user = await User.findOne({ username: new RegExp(`^${email}$`, 'i') });
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản nào liên kết với email này!' });
      }
      user.otpCode = otpCode;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
    } else {
      const filePath = path.join(dataDir, 'users.json');
      const users = readJSONFile(filePath, []);

      const userIndex = users.findIndex(u => u.username && u.username.toLowerCase() === email.toLowerCase());
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản nào liên kết với email này!' });
      }

      user = users[userIndex];
      user.otpCode = otpCode;
      user.otpExpiresAt = otpExpiresAt;
      writeJSONFile(filePath, users);
    }

    const emailResult = await sendOtpEmail(email, user.name, otpCode, otpExpiresAt);

    if (emailResult.isMock) {
      return res.json({
        success: true,
        message: 'Mã OTP đã được gửi về email của bạn! (Chế độ mô phỏng offline: Vui lòng xem mã OTP trong Terminal của Backend server)',
        isMock: true
      });
    }

    return res.json({
      success: true,
      message: 'Mã xác thực OTP đã được gửi đến hòm thư email của bạn! Vui lòng kiểm tra (cả thư rác nếu chưa thấy).'
    });
  } catch (error) {
    console.error("Lỗi khi gửi email SMTP khôi phục mật khẩu:", error);
    return res.status(500).json({
      success: false,
      message: 'Gặp lỗi trong quá trình gửi mail qua SMTP server.'
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

    if (checkMongoDBConnected()) {
      const user = await User.findOne({ username: new RegExp(`^${email}$`, 'i') });
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản liên kết với email này!' });
      }

      if (!user.otpCode || user.otpCode !== otpCode) {
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
    } else {
      const filePath = path.join(dataDir, 'users.json');
      const users = readJSONFile(filePath, []);

      const userIndex = users.findIndex(u => u.username && u.username.toLowerCase() === email.toLowerCase());

      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản liên kết với email này!' });
      }

      const user = users[userIndex];

      if (!user.otpCode || user.otpCode !== otpCode) {
        return res.status(400).json({ success: false, message: 'Mã xác thực OTP không chính xác!' });
      }

      const isExpired = new Date() > new Date(user.otpExpiresAt);
      if (isExpired) {
        return res.status(400).json({ success: false, message: 'Mã xác thực OTP đã hết hạn! Vui lòng gửi lại mã mới.' });
      }

      user.password = hashedPassword;
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
    }
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi cập nhật mật khẩu mới.' });
  }
};
