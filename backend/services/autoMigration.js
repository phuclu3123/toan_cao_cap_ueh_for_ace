import path from 'path';
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import Subscriber from '../models/Subscriber.js';
import Message from '../models/Message.js';
import { readJSONFile, dataDir } from '../utils/jsonHelper.js';

const normalizeResourceItem = (type, item) => ({
  id: item.id || (type.substring(0, 2) + '-' + Date.now()),
  type,
  title: item.title,
  date: item.date,
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

export const getLocalResourceSeedItems = () => {
  const localResources = readJSONFile(path.join(dataDir, 'resources.json'), { documentsData: [], midtermExams: [], finalExams: [] });
  const seedItems = [];
  const types = ['documentsData', 'midtermExams', 'finalExams'];

  types.forEach(type => {
    if (localResources[type] && Array.isArray(localResources[type])) {
      localResources[type].forEach(item => {
        seedItems.push(normalizeResourceItem(type, item));
      });
    }
  });

  return seedItems;
};

export const runAutoMigration = async () => {
  try {
    console.log('--- Đang thực hiện tự động di trú dữ liệu (Auto-Migration) ---');

    // 1. Di trú Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('MongoDB collection User trống. Bắt đầu import từ users.json...');
      const localUsers = readJSONFile(path.join(dataDir, 'users.json'), []);
      if (localUsers.length > 0) {
        const usersToInsert = localUsers.map(u => ({
          id: u.id,
          uid: u.uid || undefined,
          username: u.username,
          password: u.password,
          name: u.name,
          role: u.role || 'Student',
          phoneNumber: u.phoneNumber || undefined,
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date()
        }));
        await User.insertMany(usersToInsert);
        console.log(`>>> Đã di trú thành công ${usersToInsert.length} người dùng lên MongoDB! <<<`);
      }
    } else {
      console.log('Collection User trên MongoDB đã có dữ liệu. Bỏ qua di trú User.');
    }

    // 2. Di trú Resources
    const resourceCount = await Resource.countDocuments();
    const resourcesToInsert = getLocalResourceSeedItems();

    if (resourceCount === 0) {
      console.log('MongoDB collection Resource trống. Bắt đầu import từ resources.json...');

      if (resourcesToInsert.length > 0) {
        await Resource.insertMany(resourcesToInsert);
        console.log(`>>> Đã di trú thành công ${resourcesToInsert.length} tài liệu/đề thi lên MongoDB! <<<`);
      }
    } else {
      let insertedCount = 0;
      let metadataUpdatedCount = 0;

      for (const seedItem of resourcesToInsert) {
        const existing = await Resource.findOne({ id: seedItem.id });
        if (!existing) {
          await Resource.create(seedItem);
          insertedCount += 1;
          continue;
        }

        const metadataUpdates = {};
        ['professor', 'professorName', 'hasDetailRoute'].forEach(field => {
          if (seedItem[field] !== undefined && existing[field] === undefined) {
            metadataUpdates[field] = seedItem[field];
          }
        });

        if (seedItem.type === 'documentsData' || seedItem.type === 'finalExams') {
          ['title', 'date', 'desc', 'hasDetailRoute'].forEach(field => {
            if (seedItem[field] !== undefined && existing[field] !== seedItem[field]) {
              metadataUpdates[field] = seedItem[field];
            }
          });
        }

        if (seedItem.type === 'documentsData') {
          ['category', 'categoryLabel', 'image', 'pdf', 'externalUrl'].forEach(field => {
            if (seedItem[field] !== undefined && existing[field] !== seedItem[field]) {
              metadataUpdates[field] = seedItem[field];
            }
          });
        }

        if (Object.keys(metadataUpdates).length > 0) {
          await Resource.updateOne({ id: seedItem.id }, { $set: metadataUpdates });
          metadataUpdatedCount += 1;
        }
      }

      console.log(`Collection Resource đã có dữ liệu. Đã bổ sung ${insertedCount} tài nguyên seed còn thiếu, cập nhật metadata ${metadataUpdatedCount} tài nguyên.`);
    }

    // 3. Di trú Subscribers
    const subscriberCount = await Subscriber.countDocuments();
    if (subscriberCount === 0) {
      console.log('MongoDB collection Subscriber trống. Bắt đầu import từ subscribers.json...');
      const localSubscribers = readJSONFile(path.join(dataDir, 'subscribers.json'), []);
      if (localSubscribers.length > 0) {
        const subsToInsert = localSubscribers.map(email => ({
          email,
          createdAt: new Date()
        }));
        await Subscriber.insertMany(subsToInsert);
        console.log(`>>> Đã di trú thành công ${subsToInsert.length} email đăng ký lên MongoDB! <<<`);
      }
    } else {
      console.log('Collection Subscriber trên MongoDB đã có dữ liệu. Bỏ qua di trú Subscriber.');
    }

    // 4. Di trú Messages
    const messageCount = await Message.countDocuments();
    if (messageCount === 0) {
      console.log('MongoDB collection Message trống. Bắt đầu import từ messages.json...');
      const localMessages = readJSONFile(path.join(dataDir, 'messages.json'), []);
      if (localMessages.length > 0) {
        const msgsToInsert = localMessages.map(m => ({
          id: m.id,
          name: m.name,
          email: m.email,
          subject: m.subject || 'Liên hệ từ website',
          message: m.message,
          createdAt: m.createdAt ? new Date(m.createdAt) : new Date()
        }));
        await Message.insertMany(msgsToInsert);
        console.log(`>>> Đã di trú thành công ${msgsToInsert.length} tin nhắn liên hệ lên MongoDB! <<<`);
      }
    } else {
      console.log('Collection Message trên MongoDB đã có dữ liệu. Bỏ qua di trú Message.');
    }

    console.log('--- Hoàn thành tự động di trú dữ liệu! ---');
  } catch (error) {
    console.error('!!! Gặp lỗi trong quá trình tự động di trú dữ liệu:', error);
  }
};
