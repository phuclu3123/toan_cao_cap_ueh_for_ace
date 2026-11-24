import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

import Resource from '../persistence/Resource.js';
import { hasOwnerRole } from '../../identity/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reply = (statusCode, body) => ({ statusCode, body });

const RESOURCE_TYPES = ['documentsData', 'midtermExams', 'finalExams'];
const RESOURCE_TYPE_SET = new Set(RESOURCE_TYPES);
const inMemoryViews = new Map();

const cleanText = (value, maxLength) => (
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
);

const isSafeLocation = (value) => !/^\s*(?:javascript|data):/i.test(value || '');

const loadBundledResources = async () => {
  try {
    const source = await fs.readFile(path.join(__dirname, '../../../../data/resources.json'), 'utf8');
    const parsed = JSON.parse(source);
    return Object.fromEntries(
      RESOURCE_TYPES.map((type) => [type, Array.isArray(parsed[type]) ? parsed[type] : []])
    );
  } catch (error) {
    console.warn('[Resources] Không thể đọc data/resources.json:', error.message);
    return Object.fromEntries(RESOURCE_TYPES.map((type) => [type, []]));
  }
};

const bundledResources = await loadBundledResources();
const bundledById = new Map(
  RESOURCE_TYPES.flatMap((type) => (
    bundledResources[type].map((item) => [item.id, { ...item, type }])
  ))
);

const toPublicResource = (resource) => {
  const source = resource?.toObject ? resource.toObject() : resource;
  if (!source) return source;
  const { _id, __v, ...publicResource } = source;
  return publicResource;
};

const mergeResources = (databaseItems = []) => {
  const publicDatabaseItems = databaseItems.map(toPublicResource);
  const databaseById = new Map(publicDatabaseItems.map((item) => [item.id, item]));

  return Object.fromEntries(RESOURCE_TYPES.map((type) => {
    const uploadedItems = publicDatabaseItems.filter(
      (item) => item.type === type && !bundledById.has(item.id)
    );
    const catalogItems = bundledResources[type].map((item) => ({
      ...item,
      ...(databaseById.get(item.id) || {}),
      views: databaseById.get(item.id)?.views ?? inMemoryViews.get(item.id) ?? item.views ?? 0
    }));
    return [type, [...uploadedItems, ...catalogItems]];
  }));
};

export const incrementResourceView = async (input) => {
  const id = cleanText(input.id, 120);
  if (!id) {
    return reply(400, { success: false, message: 'Thiếu mã tài liệu.' });
  }

  const bundledItem = bundledById.get(id);

  if (mongoose.connection.readyState !== 1) {
    if (!bundledItem) {
      return reply(404, { success: false, message: 'Không tìm thấy tài liệu.' });
    }
    const views = (inMemoryViews.get(id) || Number(bundledItem.views) || 0) + 1;
    inMemoryViews.set(id, views);
    return reply(202, { success: true, persisted: false, id, views });
  }

  try {
    let item;
    if (bundledItem) {
      item = await Resource.findOneAndUpdate(
        { id },
        { $setOnInsert: bundledItem, $inc: { views: 1 } },
        { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true, timestamps: false }
      );
    } else {
      item = await Resource.findOneAndUpdate(
        { id },
        { $inc: { views: 1 } },
        { returnDocument: 'after', timestamps: false }
      );
    }

    if (!item) {
      return reply(404, { success: false, message: 'Không tìm thấy tài liệu.' });
    }

    return reply(200, { success: true, persisted: true, id, views: item.views });
  } catch (error) {
    console.error('[Resources] Lỗi ghi nhận lượt xem:', error);
    return reply(503, {
      success: false,
      message: 'Chưa thể ghi nhận lượt xem. Vui lòng thử lại sau.'
    });
  }
};

export const getResources = async () => {
  try {
    const items = mongoose.connection.readyState === 1
      ? await Resource.find({}).sort({ createdAt: -1 }).lean()
      : [];

    return reply(200, { success: true, resources: mergeResources(items) });
  } catch (error) {
    console.error('[Resources] Lỗi lấy tài liệu:', error);
    return reply(200, {
      success: true,
      degraded: true,
      resources: mergeResources(),
      message: 'Đang hiển thị danh mục tài liệu tích hợp sẵn.'
    });
  }
};

export const createResource = async (input) => {
  if (!hasOwnerRole(input.user)) {
    return reply(403, {
      success: false,
      message: 'Chỉ chủ sở hữu hệ thống mới có quyền đăng tài liệu.'
    });
  }

  const type = cleanText(input.body?.type, 40);
  const item = input.body?.item;
  if (!RESOURCE_TYPE_SET.has(type) || !item || typeof item !== 'object' || Array.isArray(item)) {
    return reply(400, { success: false, message: 'Dữ liệu tài liệu không hợp lệ.' });
  }

  const title = cleanText(item.title, 300);
  const requestedId = cleanText(item.id, 120);
  const id = requestedId || `${type.slice(0, 2)}-${Date.now()}`;
  if (title.length < 2 || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,119}$/.test(id)) {
    return reply(400, { success: false, message: 'Tiêu đề hoặc mã tài liệu không hợp lệ.' });
  }

  const today = new Date();
  const defaultDate = [
    String(today.getDate()).padStart(2, '0'),
    String(today.getMonth() + 1).padStart(2, '0'),
    today.getFullYear()
  ].join('/');

  const resource = {
    id,
    type,
    title,
    date: cleanText(item.date, 40) || defaultDate,
    category: cleanText(item.category, 80),
    categoryLabel: cleanText(item.categoryLabel, 160),
    image: cleanText(item.image, 1000),
    pdf: cleanText(item.pdf, 1000),
    desc: cleanText(item.desc, 5000),
    externalUrl: cleanText(item.externalUrl, 2000),
    professor: cleanText(item.professor, 120),
    professorName: cleanText(item.professorName, 200),
    hasDetailRoute: item.hasDetailRoute === true,
    views: 0
  };

  if (![resource.image, resource.pdf, resource.externalUrl].every(isSafeLocation)) {
    return reply(400, { success: false, message: 'Đường dẫn tài liệu không hợp lệ.' });
  }

  if (mongoose.connection.readyState !== 1) {
    return reply(503, {
      success: false,
      message: 'Cơ sở dữ liệu đang tạm gián đoạn; tài liệu chưa được lưu.'
    });
  }

  try {
    const savedItem = await Resource.create(resource);
    return reply(201, {
      success: true,
      message: 'Đăng tải tài liệu thành công!',
      item: toPublicResource(savedItem)
    });
  } catch (error) {
    if (error?.code === 11000) {
      return reply(409, { success: false, message: 'Mã tài liệu đã tồn tại.' });
    }
    if (error?.name === 'ValidationError') {
      return reply(400, { success: false, message: 'Dữ liệu tài liệu không hợp lệ.' });
    }
    console.error('[Resources] Lỗi đăng tải tài liệu:', error);
    return reply(500, { success: false, message: 'Lỗi hệ thống khi lưu tài liệu.' });
  }
};
