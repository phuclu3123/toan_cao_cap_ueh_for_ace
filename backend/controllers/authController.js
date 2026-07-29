import path from 'path';
import User from '../models/User.js';
import { checkMongoDBConnected } from '../config/db.js';
import { readJSONFile, writeJSONFile, dataDir } from '../utils/jsonHelper.js';
import { sendOtpEmail } from '../services/emailService.js';
import { hashPassword, verifyPassword } from '../utils/passwordHelper.js';
import { roleForIdentifier } from '../utils/roles.js';
import { issueSession } from '../services/sessionService.js';
import { verifyFirebaseIdToken } from '../services/firebaseTokenService.js';
import { assertPersistentStorage } from '../utils/storagePolicy.js';

const exactIdentifier = (value) => new RegExp(
  `^${String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
  'i'
);

const unavailableMessage = 'Hệ thống tài khoản đang tạm bảo trì. Vui lòng thử lại sau.';

export const signup = async (req, res) => {
  const { username, password, name } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin đăng ký!' });
  }

  try {
    assertPersistentStorage();
    const hashedPassword = hashPassword(password);

    if (checkMongoDBConnected()) {
      const userExists = await User.findOne({ username: exactIdentifier(username) });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'Tên đăng nhập hoặc Email này đã tồn tại!' });
      }

      const userId = 'u-' + Date.now();
      const newUser = new User({
        id: userId,
        username,
        password: hashedPassword,
        name,
        role: roleForIdentifier(username)
      });
      await newUser.save();
      await issueSession(res, newUser);

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
        role: roleForIdentifier(username),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      if (writeJSONFile(filePath, users)) {
        await issueSession(res, newUser);
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
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode === 503 ? unavailableMessage : 'Lỗi hệ thống khi đăng ký.'
    });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Tên đăng nhập và mật khẩu không được bỏ trống!' });
  }

  try {
    assertPersistentStorage();
    let user = null;
    if (checkMongoDBConnected()) {
      user = await User.findOne({ username: exactIdentifier(username) });
    } else {
      const filePath = path.join(dataDir, 'users.json');
      const users = readJSONFile(filePath, []);
      user = users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
    }

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu chưa chính xác!' });
    }

    const usedLegacyPlaintextPassword = !String(user.password || '').includes(':');
    if (usedLegacyPlaintextPassword) {
      user.password = hashPassword(password);
      if (checkMongoDBConnected()) {
        await user.save();
      } else {
        const filePath = path.join(dataDir, 'users.json');
        const users = readJSONFile(filePath, []);
        const storedUser = users.find((item) => item.id === user.id);
        if (storedUser) {
          storedUser.password = user.password;
          writeJSONFile(filePath, users);
        }
      }
    }

    const resolvedRole = roleForIdentifier(user.username);
    if (user.role !== resolvedRole) {
      user.role = resolvedRole;
      if (checkMongoDBConnected()) {
        await user.save();
      } else {
        const filePath = path.join(dataDir, 'users.json');
        const users = readJSONFile(filePath, []);
        const storedUser = users.find((item) => item.id === user.id);
        if (storedUser) {
          storedUser.role = resolvedRole;
          writeJSONFile(filePath, users);
        }
      }
    }

    await issueSession(res, user);
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
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode === 503 ? unavailableMessage : 'Lỗi hệ thống khi đăng nhập.'
    });
  }
};

export const syncFirebaseAuth = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu Firebase ID token để xác thực đăng nhập.'
    });
  }

  try {
    assertPersistentStorage();
    const { uid, email, name, phoneNumber } = await verifyFirebaseIdToken(idToken);

    if (checkMongoDBConnected()) {
      let user = await User.findOne({ uid });

      if (!user) {
        if (email) {
          user = await User.findOne({ username: exactIdentifier(email) });
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
            role: roleForIdentifier(email || phoneNumber || uid)
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
          await user.save();
        }
      }

      const resolvedRole = roleForIdentifier(user.username);
      if (user.role !== resolvedRole) {
        user.role = resolvedRole;
        await user.save();
      }

      await issueSession(res, user);
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
            role: roleForIdentifier(email || phoneNumber || uid),
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

      const resolvedRole = roleForIdentifier(user.username);
      if (user.role !== resolvedRole) {
        user.role = resolvedRole;
        writeJSONFile(filePath, users);
      }

      await issueSession(res, user);
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
    const status = error.statusCode || (error.code === 'INVALID_FIREBASE_TOKEN' ? 401 : 500);
    return res.status(status).json({
      success: false,
      message: status === 503
        ? unavailableMessage
        : (status === 401 ? 'Phiên đăng nhập Firebase không hợp lệ.' : 'Lỗi hệ thống khi đồng bộ tài khoản.')
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Đầu vào email không hợp lệ!' });
  }

  try {
    assertPersistentStorage();
    let user = null;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    if (checkMongoDBConnected()) {
      user = await User.findOne({ username: exactIdentifier(email) });
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
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode === 503
        ? unavailableMessage
        : 'Gặp lỗi trong quá trình xử lý yêu cầu gửi mã OTP.'
    });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otpCode, newPassword } = req.body;

  if (!email || !otpCode || !newPassword) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin: email, mã OTP và mật khẩu mới!' });
  }

  try {
    assertPersistentStorage();
    const hashedPassword = hashPassword(newPassword);

    if (checkMongoDBConnected()) {
      const user = await User.findOne({ username: exactIdentifier(email) });
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản liên kết với email này!' });
      }

      const isValidOtp = user.otpCode && user.otpCode === otpCode;
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
    } else {
      const filePath = path.join(dataDir, 'users.json');
      const users = readJSONFile(filePath, []);

      const userIndex = users.findIndex(u => u.username && u.username.toLowerCase() === email.toLowerCase());

      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản liên kết với email này!' });
      }

      const user = users[userIndex];

      const isValidOtp = user.otpCode && user.otpCode === otpCode;
      if (!isValidOtp) {
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
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode === 503
        ? unavailableMessage
        : 'Lỗi hệ thống khi cập nhật mật khẩu mới.'
    });
  }
};

export const updateProfile = async (req, res) => {
  const { name, phoneNumber, avatar, school, bio } = req.body;
  const username = req.authUser.username;

  try {
    assertPersistentStorage();
    if (checkMongoDBConnected()) {
      const user = await User.findOne({ username: exactIdentifier(username) });
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
    } else {
      const filePath = path.join(dataDir, 'users.json');
      const users = readJSONFile(filePath, []);

      const userIndex = users.findIndex(u => u.username && u.username.toLowerCase() === username.toLowerCase());
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
      }

      if (name !== undefined) users[userIndex].name = name;
      if (phoneNumber !== undefined) users[userIndex].phoneNumber = phoneNumber;
      if (avatar !== undefined) users[userIndex].avatar = avatar;
      if (school !== undefined) users[userIndex].school = school;
      if (bio !== undefined) users[userIndex].bio = bio;
      users[userIndex].updatedAt = new Date().toISOString();

      if (writeJSONFile(filePath, users)) {
        return res.json({
          success: true,
          message: 'Cập nhật thông tin cá nhân thành công!',
          user: users[userIndex]
        });
      } else {
        return res.status(500).json({ success: false, message: 'Lỗi lưu thông tin cá nhân.' });
      }
    }
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode === 503
        ? unavailableMessage
        : 'Lỗi hệ thống khi cập nhật profile.'
    });
  }
};

export const exchangeGithubToken = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Thiếu Authorization Code từ GitHub.' });

  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(503).json({
        success: false,
        message: 'GitHub OAuth chưa được cấu hình trên máy chủ.'
      });
    }

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
