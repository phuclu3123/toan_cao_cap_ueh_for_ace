import path from 'path';
import Resource from '../models/Resource.js';
import { checkMongoDBConnected } from '../config/db.js';
import { readJSONFile, writeJSONFile, dataDir } from '../utils/jsonHelper.js';
import { hasOwnerRole } from '../utils/roles.js';
import { assertPersistentStorage } from '../utils/storagePolicy.js';

const allowedResourceTypes = new Set([
  'documentsData',
  'midtermExams',
  'finalExams'
]);

const cleanText = (value, maxLength = 500) => (
  typeof value === 'string' ? value.trim().slice(0, maxLength) : undefined
);

const cleanResourceUrl = (value) => {
  const cleaned = cleanText(value, 2000);
  if (!cleaned) return undefined;
  if (cleaned.startsWith('/') && !cleaned.startsWith('//')) return cleaned;

  try {
    const parsed = new URL(cleaned);
    const protocolAllowed = parsed.protocol === 'https:'
      || (process.env.NODE_ENV !== 'production' && parsed.protocol === 'http:');
    return protocolAllowed ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
};

export const incrementResourceView = async (req, res) => {
  const { id } = req.params;
  try {
    if (checkMongoDBConnected()) {
      await Resource.findOneAndUpdate({ id }, { $inc: { views: 1 } });
    }
    return res.json({ success: true, message: 'View recorded', id });
  } catch {
    return res.json({ success: true, message: 'View recorded locally', id });
  }
};

export const getResources = async (req, res) => {
  try {
    if (checkMongoDBConnected()) {
      const items = await Resource.find({}).sort({ createdAt: -1 });
      const resources = {
        documentsData: items.filter(i => i.type === 'documentsData'),
        midtermExams: items.filter(i => i.type === 'midtermExams'),
        finalExams: items.filter(i => i.type === 'finalExams')
      };
      return res.json({ success: true, resources });
    } else {
      const filePath = path.join(dataDir, 'resources.json');
      const resources = readJSONFile(filePath, { documentsData: [], midtermExams: [], finalExams: [] });
      return res.json({ success: true, resources });
    }
  } catch (error) {
    console.error("Lỗi lấy tài liệu:", error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lấy tài liệu học tập.' });
  }
};

export const createResource = async (req, res) => {
  const { type, item } = req.body;

  try {
    assertPersistentStorage();
    if (!hasOwnerRole(req.authUser)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này (Từ chối bởi Server)!' });
    }

    if (
      !allowedResourceTypes.has(type)
      || !item
      || typeof item !== 'object'
      || !cleanText(item.title, 180)
    ) {
      return res.status(400).json({ success: false, message: 'Dữ liệu tài liệu không hợp lệ!' });
    }

    const requestedId = cleanText(item.id, 80);
    const finalId = requestedId && /^[a-zA-Z0-9_-]+$/.test(requestedId)
      ? requestedId
      : `${type.substring(0, 2)}-${Date.now()}`;

    let finalDate = item.date;
    if (!finalDate) {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      finalDate = `${dd}/${mm}/${yyyy}`;
    }

    const savedItem = {
      id: finalId,
      type,
      title: cleanText(item.title, 180),
      date: cleanText(finalDate, 20),
      category: cleanText(item.category, 80),
      categoryLabel: cleanText(item.categoryLabel, 100),
      image: cleanResourceUrl(item.image),
      pdf: cleanResourceUrl(item.pdf),
      desc: cleanText(item.desc, 2000),
      externalUrl: cleanResourceUrl(item.externalUrl),
      professor: cleanText(item.professor, 100),
      professorName: cleanText(item.professorName, 150),
      hasDetailRoute: Boolean(item.hasDetailRoute)
    };

    if (checkMongoDBConnected()) {
      const newResource = new Resource(savedItem);
      await newResource.save();
      return res.json({ success: true, message: 'Đăng tải tài liệu thành công!', item: savedItem });
    } else {
      const filePath = path.join(dataDir, 'resources.json');
      const resources = readJSONFile(filePath, { documentsData: [], midtermExams: [], finalExams: [] });

      if (!resources[type]) {
        resources[type] = [];
      }

      resources[type].unshift(savedItem);

      if (writeJSONFile(filePath, resources)) {
        return res.json({ success: true, message: 'Đăng tải tài liệu thành công!', item: savedItem });
      } else {
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu tài liệu.' });
      }
    }
  } catch (error) {
    console.error("Lỗi đăng tải tài liệu:", error);
    return res
      .status(error.statusCode || 500)
      .json({
        success: false,
        code: error.code || 'RESOURCE_CREATE_FAILED',
        message: error.statusCode === 503
          ? 'Hệ thống lưu trữ đang tạm bảo trì.'
          : 'Lỗi hệ thống khi lưu tài liệu.'
      });
  }
};
