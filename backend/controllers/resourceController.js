import User from '../models/User.js';

export const incrementResourceView = async (req, res) => {
  const { id } = req.params;
  try {
    await Resource.findOneAndUpdate({ id }, { $inc: { views: 1 } });
    return res.json({ success: true, message: 'View recorded', id });
  } catch {
    return res.json({ success: false, message: 'Lỗi ghi nhận view', id });
  }
};

export const getResources = async (req, res) => {
  try {
    const items = await Resource.find({}).sort({ createdAt: -1 });
    const resources = {
      documentsData: items.filter(i => i.type === 'documentsData'),
      midtermExams: items.filter(i => i.type === 'midtermExams'),
      finalExams: items.filter(i => i.type === 'finalExams')
    };
    return res.json({ success: true, resources });
  } catch (error) {
    console.error("Lỗi lấy tài liệu:", error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lấy tài liệu học tập.' });
  }
};

export const createResource = async (req, res) => {
  const { type, item, adminRole, uid, email } = req.body;

  try {
    let dbUser = null;
    
    if (uid) {
      dbUser = await User.findOne({ uid });
    } else if (email) {
      dbUser = await User.findOne({ username: new RegExp(`^${email}$`, 'i') });
    }

    // Role verification (Strictly require verified Admin user record)
    const isAuthorized = Boolean(dbUser && dbUser.role === 'Admin');

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này (Từ chối bởi Server)!' });
    }

    if (!type || !item || !item.title) {
      return res.status(400).json({ success: false, message: 'Dữ liệu tài liệu không hợp lệ!' });
    }

    const finalId = item.id || (type.substring(0, 2) + '-' + Date.now());

    let finalDate = item.date;
    if (!finalDate) {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      finalDate = `${dd}/${mm}/${yyyy}`;
    }

    const savedItem = {
      ...item,
      id: finalId,
      date: finalDate
    };

    const newResource = new Resource({
      id: finalId,
      type: type,
      title: item.title,
      date: finalDate,
      category: item.category,
      categoryLabel: item.categoryLabel,
      image: item.image,
      pdf: item.pdf,
      desc: item.desc,
      externalUrl: item.externalUrl,
      professor: item.professor,
      professorName: item.professorName,
      hasDetailRoute: item.hasDetailRoute
    });
    await newResource.save();
    return res.json({ success: true, message: 'Đăng tải tài liệu thành công!', item: savedItem });
  } catch (error) {
    console.error("Lỗi đăng tải tài liệu:", error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu tài liệu.' });
  }
};
