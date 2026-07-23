import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';

dotenv.config();

// Optional DNS override for environments where Node cannot resolve mongodb+srv.
const mongoDnsServers = (process.env.MONGODB_DNS_SERVERS || process.env.MONGO_DNS_SERVERS || '')
  .split(',')
  .map(server => server.trim())
  .filter(Boolean);

if (mongoDnsServers.length > 0) {
  try {
    dns.setServers(mongoDnsServers);
    console.log(`Configured MongoDB DNS servers: ${mongoDnsServers.join(', ')}`);
  } catch (dnsErr) {
    console.warn('Could not override DNS servers:', dnsErr.message);
  }
}

let isMongoDBConnected = false;

export const checkMongoDBConnected = () => isMongoDBConnected;

export const connectDB = async (onConnectedCallback) => {
  const mongoURI = process.env.MONGODB_DIRECT_URI || process.env.MONGO_DIRECT_URI || process.env.MONGODB_URI || process.env.MONGO_URI;

  if (mongoURI) {
    console.log('Đang kết nối trực tiếp đến MongoDB Atlas qua internet...');
    try {
      await mongoose.connect(mongoURI, { dbName: 'UEH_TCC' });
      isMongoDBConnected = true;
      console.log('======================================================');
      console.log('>>> KẾT NỐI THÀNH CÔNG ĐẾN MONGODB ATLAS (ONLINE) <<<');
      console.log('======================================================');
      if (onConnectedCallback) {
        await onConnectedCallback();
      }
    } catch (err) {
      console.error('!!! Lỗi kết nối MongoDB Atlas:', err.message);
      if (mongoURI.startsWith('mongodb+srv://') && /querySrv|ENOTFOUND|ETIMEOUT|ECONNREFUSED/i.test(err.message)) {
        console.error('Goi y: URI mongodb+srv can DNS SRV. Neu Node khong resolve duoc, hay dung MONGODB_DIRECT_URI/MONGO_DIRECT_URI dang mongodb:// seedlist hoac cau hinh MONGODB_DNS_SERVERS.');
      }
      console.log('>>> Server hoạt động ở chế độ OFFLINE FALLBACK (đọc/ghi file JSON cục bộ) <<<');
    }
  } else {
    console.log('Không tìm thấy cấu hình MONGODB_DIRECT_URI, MONGO_DIRECT_URI, MONGODB_URI hoặc MONGO_URI.');
    console.log('>>> Server hoạt động ở chế độ OFFLINE FALLBACK (đọc/ghi file JSON cục bộ) <<<');
  }
};
