import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';

import Message from '../persistence/Message.js';
import Subscriber from '../persistence/Subscriber.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

const cleanSingleLine = (value, maxLength) => (
  typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength)
    : ''
);

const cleanMessage = (value, maxLength) => (
  typeof value === 'string'
    ? value
      .replace(/\r\n/g, '\n')
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
      .trim()
      .slice(0, maxLength)
    : ''
);

const normalizeEmail = (value) => cleanSingleLine(value, 254).toLowerCase();

const databaseUnavailable = (res) => res.status(503).json({
  success: false,
  message: 'Hệ thống lưu trữ đang tạm gián đoạn. Vui lòng thử lại sau.'
});

export const subscribe = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ success: false, message: 'Email không hợp lệ!' });
  }

  if (mongoose.connection.readyState !== 1) return databaseUnavailable(res);

  try {
    await Subscriber.create({ email });
    return res.status(201).json({
      success: true,
      message: 'Đăng ký nhận bài viết mới thành công! Cảm ơn bạn.'
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email này đã đăng ký nhận tin từ trước!'
      });
    }
    if (error?.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Email không hợp lệ!' });
    }
    console.error('[Contact] Lỗi đăng ký email:', error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu đăng ký.' });
  }
};

export const submitContact = async (req, res) => {
  const name = cleanSingleLine(req.body?.name, 120);
  const email = normalizeEmail(req.body?.email);
  const phone = cleanSingleLine(req.body?.phone, 32);
  const submissionKey = req.body?.submissionKey;
  if(submissionKey!==undefined && (typeof submissionKey!=='string' || !/^[a-f0-9-]{36}$/.test(submissionKey))) return res.status(400).json({success:false,message:'Mã yêu cầu không hợp lệ.'});
  const subject = cleanSingleLine(req.body?.subject, 200) || 'Liên hệ từ website';
  const message = cleanMessage(req.body?.message, 5000);

  const validPhone = /^\+?[\d ()-]{8,32}$/.test(phone) && phone.replace(/\D/g, '').length >= 8;
  if (name.length < 2 || (email && !EMAIL_PATTERN.test(email)) || (!email && !validPhone) || message.length < 5) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng điền đầy đủ và đúng định dạng các thông tin bắt buộc!'
    });
  }

  if (mongoose.connection.readyState !== 1) return databaseUnavailable(res);

  try {
    const data={
      id: randomUUID(),
      name,
      email,
      phone,
      subject,
      message
    };
    if(submissionKey) await Message.findOneAndUpdate({submissionKey},{$setOnInsert:{...data,submissionKey}},{upsert:true,runValidators:true});
    else await Message.create(data);
    return res.status(201).json({
      success: true,
      message: 'Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm.'
    });
  } catch (error) {
    if (error?.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Thông tin liên hệ không hợp lệ.' });
    }
    console.error('[Contact] Lỗi gửi tin nhắn liên hệ:', error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu tin nhắn.' });
  }
};
