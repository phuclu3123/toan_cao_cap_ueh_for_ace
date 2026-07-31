import Message from '../models/Message.js';
import Subscriber from '../models/Subscriber.js';

export const subscribe = async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Email không hợp lệ!' });
  }

  try {
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email này đã đăng ký nhận tin từ trước!' });
    }
    const newSub = new Subscriber({ email });
    await newSub.save();
    return res.json({ success: true, message: 'Đăng ký nhận bài viết mới thành công! Cảm ơn bạn.' });
  } catch (error) {
    console.error("Lỗi đăng ký email:", error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu đăng ký.' });
  }
};

export const submitContact = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' });
  }

  try {
    const newMessage = new Message({
      id: Date.now().toString(),
      name,
      email,
      subject: subject || 'Liên hệ từ website',
      message
    });
    await newMessage.save();
    return res.json({ success: true, message: 'Tin nhắn của bạn đã được gửi đi thành công! Chúng tôi sẽ phản hồi sớm.' });
  } catch (error) {
    console.error("Lỗi gửi tin nhắn liên hệ:", error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu tin nhắn.' });
  }
};
